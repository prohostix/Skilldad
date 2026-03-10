import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    ShieldCheck,
    Mail,
    UserPlus,
    Filter,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Trash2
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useSocket } from '../../context/SocketContext';

const UserList = () => {
    const socket = useSocket();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [inviteSending, setInviteSending] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message: '' }
    const [filters, setFilters] = useState({
        role: 'all',
        status: 'all',
        sortBy: 'newest'
    });
    const [inviteData, setInviteData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        universityId: ''
    });
    const [universities, setUniversities] = useState([]);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchUsers = async () => {
        try {
            console.log('[fetchUsers] Fetching users from server');
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) {
                console.warn('[fetchUsers] No user info found - redirecting to login');
                window.location.href = '/login?session=expired';
                return;
            }
            const userInfo = JSON.parse(rawInfo);
            if (!userInfo.token) {
                console.warn('[fetchUsers] No token found - redirecting to login');
                window.location.href = '/login?session=expired';
                return;
            }
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/admin/users', config);
            console.log('[fetchUsers] Received users:', data.users?.length, 'users');
            setUsers(data.users);
            console.log('[fetchUsers] State updated with users');
        } catch (error) {
            console.error('[fetchUsers] Error:', error);
            if (error.response?.status === 401) {
                console.warn('[fetchUsers] Unauthorized - redirecting to login');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('token');
                window.location.href = '/login?session=expired';
            }
        }
    };

    const fetchUniversities = async () => {
        try {
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) {
                console.warn('[fetchUniversities] No user info found');
                return;
            }
            const userInfo = JSON.parse(rawInfo);
            if (!userInfo.token) {
                console.warn('[fetchUniversities] No token found');
                return;
            }
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/admin/universities', config);
            setUniversities(data);
        } catch (error) {
            console.error('Error fetching universities:', error);
            if (error.response?.status === 401) {
                console.warn('[fetchUniversities] Unauthorized');
            }
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchUniversities();

        // Listen for real-time user list updates via WebSocket
        if (socket) {
            console.log('[UserList] Setting up WebSocket listener for userListUpdate');

            const handleUserListUpdate = (data) => {
                console.log('[UserList] Received user list update:', data);

                if (data.action === 'created') {
                    console.log('[UserList] Adding new user:', data.user);
                    // Add new user to the list
                    setUsers(prevUsers => {
                        // Check if user already exists (avoid duplicates)
                        const exists = prevUsers.some(u => u._id === data.user._id);
                        if (exists) {
                            console.log('[UserList] User already exists, skipping');
                            return prevUsers;
                        }

                        console.log('[UserList] Adding user to list');
                        // Add new user at the beginning of the list
                        return [data.user, ...prevUsers];
                    });

                    // Show a subtle notification
                    showToast('success', `New user added: ${data.user.name}`);
                } else if (data.action === 'updated') {
                    console.log('[UserList] Updating user:', data.user);
                    // Update existing user
                    setUsers(prevUsers =>
                        prevUsers.map(u => u._id === data.user._id ? { ...u, ...data.user } : u)
                    );
                } else if (data.action === 'deleted') {
                    console.log('[UserList] Removing user:', data.user);
                    // Remove user from list
                    setUsers(prevUsers => prevUsers.filter(u => u._id !== data.user._id));
                }
            };

            socket.on('userListUpdate', handleUserListUpdate);
            console.log('[UserList] WebSocket listener registered');

            // Cleanup listener on unmount
            return () => {
                console.log('[UserList] Cleaning up WebSocket listener');
                socket.off('userListUpdate', handleUserListUpdate);
            };
        } else {
            console.warn('[UserList] Socket not available');
        }

        // Auto-refresh every 30 seconds as fallback
        const interval = setInterval(() => {
            fetchUsers();
        }, 30000);

        return () => clearInterval(interval);
    }, [socket]);

    const openPermissionModal = (user) => {
        setSelectedUser(user);
        setSelectedRole(user.role);
        setShowPermissionModal(true);
    };

    const handleGrantPermission = async () => {
        if (!selectedUser || !selectedRole) return;

        try {
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) {
                alert('Please login as admin first');
                return;
            }
            const userInfo = JSON.parse(rawInfo);

            if (userInfo.role !== 'admin') {
                alert('Only admins can grant permissions');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };

            // Grant permission (verify + change role)
            await axios.put(
                `/api/admin/users/${selectedUser._id}/grant-permission`,
                { role: selectedRole },
                config
            );

            showToast('success', `Successfully granted ${selectedRole} permission to ${selectedUser.name}`);
            setShowPermissionModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Grant permission error:', error);
            showToast('error', `Failed to grant permission: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleRevokePermission = async (userId) => {
        if (!window.confirm('Are you sure you want to revoke this user\'s permissions?')) return;

        try {
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) return;
            const userInfo = JSON.parse(rawInfo);

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };

            await axios.put(
                `/api/admin/users/${userId}/revoke-permission`,
                {},
                config
            );

            showToast('success', 'Permission revoked successfully');
            fetchUsers();
        } catch (error) {
            console.error('Revoke permission error:', error);
            showToast('error', `Failed to revoke permission: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Are you sure you want to delete ${user.name} (${user.email})? This action cannot be undone.`)) return;

        try {
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) return;
            const userInfo = JSON.parse(rawInfo);

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                }
            };

            await axios.delete(`/api/admin/users/${user._id}`, config);

            showToast('success', `User ${user.name} deleted successfully`);
            // The WebSocket will handle updating the list, but we can also fetch manually
            fetchUsers();
        } catch (error) {
            console.error('Delete user error:', error);
            showToast('error', `Failed to delete user: ${error.response?.data?.message || error.message}`);
        }
    };
    const isSubmitting = useRef(false);

    const handleInviteUser = async (e) => {
        e.preventDefault();
        if (isSubmitting.current) return;
        isSubmitting.current = true;
        setInviteSending(true);
        try {
            const rawInfo = localStorage.getItem('userInfo');
            if (!rawInfo) {
                showToast('error', 'You are not logged in. Please refresh and try again.');
                return;
            }
            const userInfo = JSON.parse(rawInfo);
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            };

            console.log('[handleInviteUser] Sending invite data:', inviteData);
            const { data } = await axios.post('/api/admin/users/invite', inviteData, config);
            console.log('[handleInviteUser] Success response:', data);

            // Close modal and reset form
            setShowInviteModal(false);
            setInviteData({ name: '', email: '', password: '', role: 'student', universityId: '' });

            // CRITICAL: Refresh the user list immediately
            console.log('[handleInviteUser] Refreshing user list');
            await fetchUsers();

            showToast('success', data.message || `Account created for ${inviteData.email}`);
        } catch (error) {
            console.error('[handleInviteUser] Error:', error);

            // Check if the user was actually created (Socket might have added them already)
            const wasCreated = users.some(u => u.email.toLowerCase() === inviteData.email.toLowerCase());

            if (wasCreated) {
                console.log('[handleInviteUser] User was created via socket, ignoring request error');
                setShowInviteModal(false);
                setInviteData({ name: '', email: '', password: '', role: 'student', universityId: '' });
                return;
            }

            console.error('[handleInviteUser] Error response:', error.response?.data);

            let msg = 'Failed to create account';
            if (error.code === 'ECONNABORTED') {
                msg = 'Request is taking longer than expected. Please check the user list in a moment.';
            } else if (error.response?.data?.message) {
                msg = error.response.data.message;
            } else if (error.message) {
                msg = error.message;
            }

            showToast('error', msg);
        } finally {
            setInviteSending(false);
            isSubmitting.current = false;
        }
    };

    // Helper functions for alerts and toast...
    const filteredUsers = users
        .filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = filters.role === 'all' || user.role === filters.role;
            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'verified' ? user.isVerified : !user.isVerified);

            return matchesSearch && matchesRole && matchesStatus;
        })
        .sort((a, b) => {
            if (filters.sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (filters.sortBy === 'name-asc') return a.name.localeCompare(b.name);
            if (filters.sortBy === 'name-desc') return b.name.localeCompare(a.name);
            return 0;
        });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[99999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${toast.type === 'success'
                            ? 'bg-emerald-900/80 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-900/80 border-red-500/40 text-red-300'
                            }`}
                    >
                        {toast.type === 'success'
                            ? <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
                            : <AlertCircle size={20} className="text-red-400 flex-shrink-0" />}
                        <span className="text-sm font-semibold">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <DashboardHeading title="User Directory" />
                </div>
                <ModernButton onClick={() => setShowInviteModal(true)}>
                    <UserPlus size={20} className="mr-2" /> Invite User
                </ModernButton>
            </div>

            <GlassCard className="!p-0 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter text-white placeholder-white/40"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center space-x-2 px-4 py-2 border rounded-xl transition-colors font-inter text-sm font-medium ${showFilters ? 'bg-primary/20 border-primary text-primary' : 'border-white/10 text-white/70 hover:bg-white/5'
                                }`}
                        >
                            <Filter size={16} />
                            <span>More Filters</span>
                        </button>
                        <div className="h-4 w-px bg-white/10" />
                        <span className="text-sm font-medium text-white/70 font-inter">{filteredUsers.length} Users total</span>
                    </div>
                </div>

                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="p-6 bg-white/[0.02] border-b border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Role</label>
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                            >
                                <option value="all" className="bg-[#0B0F1A]">All Roles</option>
                                <option value="student" className="bg-[#0B0F1A]">Student</option>
                                <option value="university" className="bg-[#0B0F1A]">University</option>
                                <option value="partner" className="bg-[#0B0F1A]">Partner</option>
                                <option value="admin" className="bg-[#0B0F1A]">Admin</option>
                                <option value="finance" className="bg-[#0B0F1A]">Finance</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Verification Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                            >
                                <option value="all" className="bg-[#0B0F1A]">All Statuses</option>
                                <option value="verified" className="bg-[#0B0F1A]">Verified Only</option>
                                <option value="pending" className="bg-[#0B0F1A]">Pending Only</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Sort By</label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                            >
                                <option value="newest" className="bg-[#0B0F1A]">Newest First</option>
                                <option value="name-asc" className="bg-[#0B0F1A]">Name (A-Z)</option>
                                <option value="name-desc" className="bg-[#0B0F1A]">Name (Z-A)</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => setFilters({ role: 'all', status: 'all', sortBy: 'newest' })}
                                className="text-xs font-semibold text-white/30 hover:text-white uppercase tracking-widest transition-colors mb-2"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </motion.div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-inter">
                        <thead className="bg-white/5 text-white/70 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Current Role</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 text-sm">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-primary/[0.05] transition-colors group">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 overflow-hidden shadow-sm">
                                                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-white">{user.name}</p>
                                                {user.profile?.universityName && (
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mt-1">
                                                        {user.profile.universityName}
                                                    </p>
                                                )}
                                                <p className="text-xs text-white/50 flex items-center font-medium mt-1">
                                                    <Mail size={12} className="mr-1" /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all w-fit ${user.isVerified
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            }`}>
                                            {user.isVerified ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            <span>{user.isVerified ? 'Verified' : 'Pending'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold uppercase">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openPermissionModal(user)}
                                                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                                            >
                                                <ShieldCheck size={14} />
                                                Grant Permission
                                            </button>
                                            {user.isVerified && user.role !== 'student' && (
                                                <button
                                                    onClick={() => handleRevokePermission(user._id)}
                                                    className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-all"
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-all flex items-center gap-1"
                                                title="Delete User"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Permission Modal */}
            {showPermissionModal && selectedUser && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-start justify-center z-[99999] p-4 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowPermissionModal(false);
                            setSelectedUser(null);
                        }
                    }}
                >
                    <div className="bg-black/95 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-[100000] my-8" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 font-inter">
                            <ShieldCheck className="text-primary" size={24} />
                            Grant Permission
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <p className="text-white/70 text-sm mb-1">User</p>
                                <p className="text-white font-bold">{selectedUser.name}</p>
                                <p className="text-white/50 text-xs">{selectedUser.email}</p>
                            </div>

                            <div>
                                <label className="text-white/70 text-sm mb-2 block">Select Role</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                    <option value="student" className="bg-[#0B0F1A]">Student</option>
                                    <option value="university" className="bg-[#0B0F1A]">University</option>
                                    <option value="partner" className="bg-[#0B0F1A]">Partner</option>
                                    <option value="admin" className="bg-[#0B0F1A]">Admin</option>
                                    <option value="finance" className="bg-[#0B0F1A]">Finance</option>
                                </select>
                            </div>

                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                                <p className="text-xs text-white/70">
                                    This will verify the user and grant them <span className="text-primary font-bold">{selectedRole}</span> access to the platform.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPermissionModal(false);
                                    setSelectedUser(null);
                                }}
                                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGrantPermission}
                                className="flex-1 px-4 py-2.5 bg-primary border border-primary/30 text-white rounded-xl hover:bg-primary/80 transition-all font-bold flex items-center justify-center gap-2"
                            >
                                <ShieldCheck size={16} />
                                Grant Access
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Invite User Modal */}
            {showInviteModal && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-start justify-center z-[99999] p-4 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowInviteModal(false);
                            setInviteData({ name: '', email: '', password: '', role: 'student' });
                        }
                    }}
                >
                    <div className="bg-black/95 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-[100000] my-8" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 font-inter">
                            <UserPlus className="text-primary" size={24} />
                            Invite New User
                        </h2>

                        <form onSubmit={handleInviteUser} className="space-y-4">
                            <div>
                                <label className="text-white/70 text-sm mb-1.5 block">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                    placeholder="Enter full name"
                                    value={inviteData.name}
                                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-white/70 text-sm mb-1.5 block">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                    placeholder="user@example.com"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-white/70 text-sm mb-1.5 block">Temporary Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                    placeholder="••••••••"
                                    value={inviteData.password}
                                    onChange={(e) => setInviteData({ ...inviteData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-white/70 text-sm mb-1.5 block">Platform Role</label>
                                <select
                                    value={inviteData.role}
                                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                >
                                    <option value="student" className="bg-[#0B0F1A]">Student</option>
                                    <option value="university" className="bg-[#0B0F1A]">University</option>
                                    <option value="partner" className="bg-[#0B0F1A]">Industry Partner</option>
                                    <option value="finance" className="bg-[#0B0F1A]">Finance Manager</option>
                                    <option value="admin" className="bg-[#0B0F1A]">Platform Admin</option>
                                </select>
                            </div>

                            {inviteData.role === 'student' && (
                                <div>
                                    <label className="text-white/70 text-sm mb-1.5 block">Associated University</label>
                                    <select
                                        value={inviteData.universityId}
                                        onChange={(e) => setInviteData({ ...inviteData, universityId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                    >
                                        <option value="" className="bg-[#0B0F1A]">None / Independent</option>
                                        {universities.map(u => (
                                            <option key={u._id} value={u._id} className="bg-[#0B0F1A]">
                                                {u.profile?.universityName || u.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowInviteModal(false);
                                        setInviteData({ name: '', email: '', password: '', role: 'student', universityId: '' });
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviteSending}
                                    className="flex-1 px-4 py-2.5 bg-primary border border-primary/30 text-white rounded-xl hover:bg-primary/80 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {inviteSending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                    {inviteSending ? 'Creating Account...' : 'Send Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
