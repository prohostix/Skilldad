import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ticket,
    Users,
    TrendingUp,
    Wallet,
    ArrowUpRight,
    History,
    Info,
    Activity,
    ChevronRight,
    ShieldCheck,
    Coins,
    Zap,
    Search,
    Filter,
    Eye,
    BookOpen,
    FileText,
    BarChart3,
    Link,
    Copy,
    Download,
    Calendar,
    Award,
    Target,
    DollarSign,
    Percent,
    ExternalLink,
    Mail,
    Phone,
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    XCircle
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';

const PartnerDashboard = () => {
    const [stats, setStats] = useState({ totalCodes: 0, totalRedemptions: 0, totalEarnings: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [discountCodes, setDiscountCodes] = useState([]);
    const [payoutRequests, setPayoutRequests] = useState([]);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        partnerCode: ''
    });

    // Mock data for demonstration
    const mockStudents = [
        {
            id: 1,
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '+1 (555) 123-4567',
            enrolledDate: '2024-01-15',
            status: 'active',
            progress: 75,
            courses: [
                { name: 'React Masterclass', progress: 85, status: 'in-progress' },
                { name: 'Node.js Backend', progress: 65, status: 'in-progress' }
            ],
            documents: [
                { name: 'Certificate - JavaScript Basics', type: 'certificate', date: '2024-01-20' },
                { name: 'Project Submission - Portfolio', type: 'project', date: '2024-02-01' }
            ],
            totalSpent: 1250,
            discountSaved: 187.50
        },
        {
            id: 2,
            name: 'Michael Chen',
            email: 'michael.c@email.com',
            phone: '+1 (555) 234-5678',
            enrolledDate: '2024-02-01',
            status: 'active',
            progress: 45,
            courses: [
                { name: 'Python Data Science', progress: 45, status: 'in-progress' }
            ],
            documents: [
                { name: 'ID Verification', type: 'document', date: '2024-02-01' }
            ],
            totalSpent: 899,
            discountSaved: 134.85
        },
        {
            id: 3,
            name: 'Emily Rodriguez',
            email: 'emily.r@email.com',
            phone: '+1 (555) 345-6789',
            enrolledDate: '2024-01-10',
            status: 'completed',
            progress: 100,
            courses: [
                { name: 'UI/UX Design Fundamentals', progress: 100, status: 'completed' },
                { name: 'Advanced Figma', progress: 100, status: 'completed' }
            ],
            documents: [
                { name: 'Certificate - UI/UX Design', type: 'certificate', date: '2024-02-15' },
                { name: 'Certificate - Advanced Figma', type: 'certificate', date: '2024-02-20' }
            ],
            totalSpent: 1599,
            discountSaved: 239.85
        }
    ];

    const mockDiscountCodes = [
        { code: 'SKILL50', discount: 50, type: 'percentage', uses: 45, maxUses: 100, active: true, created: '2024-01-01' },
        { code: 'NEWBIE25', discount: 25, type: 'percentage', uses: 23, maxUses: 50, active: true, created: '2024-02-01' },
        { code: 'PREMIUM100', discount: 100, type: 'fixed', uses: 12, maxUses: 25, active: false, created: '2024-01-15' }
    ];

    const mockPayoutRequests = [
        { id: 1, amount: 500, status: 'pending', date: '2024-02-15', method: 'Bank Transfer' },
        { id: 2, amount: 750, status: 'approved', date: '2024-02-01', method: 'PayPal' },
        { id: 3, amount: 300, status: 'completed', date: '2024-01-15', method: 'Bank Transfer' }
    ];

    const fetchStats = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) return;
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Parallel fetch for better performance
            const [statsRes, studentsRes, discountsRes, payoutsRes] = await Promise.all([
                axios.get('/api/partner/stats', config),
                axios.get('/api/partner/students', config),
                axios.get('/api/partner/discounts', config),
                axios.get('/api/partner/payouts', config)
            ]);

            setStats(statsRes.data);
            setStudents(studentsRes.data.length > 0 ? studentsRes.data : []); // Removed student mock fallback
            setDiscountCodes(discountsRes.data || []); // strictly use real DB records, not mock records
            setPayoutRequests(payoutsRes.data.length > 0 ? payoutsRes.data : mockPayoutRequests);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching partner data:', error);
            setStudents([]);
            setDiscountCodes([]);
            setPayoutRequests(mockPayoutRequests);
            setLoading(false);
        }
    };



    const generateEnrollmentLink = (courseId = 'general') => {
        const baseUrl = window.location.origin;
        const partnerCode = 'SKILL50'; // This would come from user's partner profile
        return `${baseUrl}/register?partner=${partnerCode}&course=${courseId}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const filteredStudents = students.filter(student => {
        const name = student.name || '';
        const email = student.email || '';
        const sStatus = student.status || 'active';

        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || sStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const totalDiscountSavings = students.reduce((sum, student) => sum + (student.discountSaved || 0), 0);
    const totalRevenue = students.reduce((sum, student) => sum + (student.totalSpent || 0), 0);

    const handleRequestPayout = async () => {
        const amount = prompt('Enter amount to withdraw:', stats.totalEarnings);
        if (!amount || isNaN(amount) || amount <= 0) return;

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('/api/partner/payout', { amount: Number(amount) }, config);
            alert('Aura sync started. Payout request submitted!');
            fetchStats();
        } catch (error) {
            alert('Failed to submit payout request. Neural link error.');
        }
    };

    const handleRegisterStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };
            await axios.post('/api/partner/register-student', registerData, config);
            alert(`Student ${registerData.name} registered successfully!`);
            setShowRegisterModal(false);
            setRegisterData({ name: '', email: '', phone: '', password: '', partnerCode: '' });
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header with Navigation Tabs */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm font-semibold text-white font-inter text-left"
                        >
                            B2B Partner Portal
                        </motion.h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <ModernButton variant="secondary" className="group">
                            <Download size={18} className="mr-2 group-hover:translate-y-0.5 transition-transform" /> Export Report
                        </ModernButton>
                        <ModernButton className="shadow-lg shadow-primary/20" onClick={() => setActiveTab('codes')}>
                            <Link size={18} className="mr-2" /> Generate Links
                        </ModernButton>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'students', label: 'Students', icon: Users },
                        { id: 'codes', label: 'Discount Codes', icon: Ticket },
                        { id: 'payouts', label: 'Payouts', icon: Wallet },
                        { id: 'analytics', label: 'Analytics', icon: TrendingUp }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-glow-purple'
                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <GlassCard className="group hover:border-primary/40 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                                        <Users size={26} />
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest">Active</span>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-white text-xs font-bold uppercase tracking-widest font-inter mb-1">Affiliated Students</h3>
                                    <p className="text-xl font-semibold text-white font-poppins">{students.length}</p>
                                </div>
                            </GlassCard>

                            <GlassCard className="group hover:border-emerald-500/40 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                                        <DollarSign size={26} />
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 flex items-center">
                                        <TrendingUp size={12} className="mr-1" /> +15%
                                    </span>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-white text-xs font-bold uppercase tracking-widest font-inter mb-1">Total Revenue</h3>
                                    <p className="text-xl font-semibold text-white font-space">${totalRevenue.toLocaleString()}</p>
                                </div>
                            </GlassCard>

                            <GlassCard className="group hover:border-amber-500/40 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Percent size={26} />
                                    </div>
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1.5 rounded-xl border border-primary/30 uppercase tracking-widest">15%</span>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-white text-xs font-bold uppercase tracking-widest font-inter mb-1">Discount Rate</h3>
                                    <p className="text-xl font-semibold text-white font-space">15%</p>
                                </div>
                            </GlassCard>

                            <GlassCard className="bg-white/5 text-white border-white/10 shadow-2xl group relative overflow-hidden">
                                <div className="relative z-10 text-left flex flex-col h-full">
                                    <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                                        <Coins size={26} className="text-amber-400" />
                                    </div>
                                    <h3 className="text-white text-xs font-bold uppercase tracking-widest font-inter mb-1">Discount Savings</h3>
                                    <div className="flex items-baseline space-x-2">
                                        <p className="text-xl font-semibold font-poppins">${totalDiscountSavings.toLocaleString()}</p>
                                        <span className="text-emerald-400 text-[10px] font-bold flex items-center uppercase tracking-widest">Saved <ArrowUpRight size={14} className="ml-1" /></span>
                                    </div>
                                </div>
                                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
                            </GlassCard>
                        </div>

                        {/* Quick Actions */}
                        <GlassCard>
                            <h2 className="text-base font-bold text-white font-poppins mb-6 flex items-center">
                                <Zap size={18} className="mr-2 text-primary" /> Quick Actions
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <button
                                    onClick={() => copyToClipboard(generateEnrollmentLink())}
                                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all text-left group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <Link size={20} className="text-primary" />
                                        <Copy size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                                    </div>
                                    <h3 className="font-bold text-white mb-1">Generate Enrollment Link</h3>
                                    <p className="text-xs text-white">Create auto-discount enrollment links</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab('students')}
                                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all text-left group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <Users size={20} className="text-emerald-500" />
                                        <ExternalLink size={16} className="text-text-muted group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                    <h3 className="font-bold text-white mb-1">View Students</h3>
                                    <p className="text-xs text-white">Manage affiliated student profiles</p>
                                </button>

                                <button
                                    onClick={handleRequestPayout}
                                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all text-left group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <Wallet size={20} className="text-amber-500" />
                                        <ArrowUpRight size={16} className="text-text-muted group-hover:text-amber-500 transition-colors" />
                                    </div>
                                    <h3 className="font-bold text-white mb-1">Request Payout</h3>
                                    <p className="text-xs text-white">Submit payout to finance department</p>
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'students' && (
                    <motion.div
                        key="students"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Search and Filter */}
                        <GlassCard>
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex-1 relative">
                                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
                                    <input
                                        type="text"
                                        placeholder="Search students by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-bold"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <ModernButton onClick={() => setShowRegisterModal(true)}>
                                        <Plus size={18} className="mr-2" /> Register Student
                                    </ModernButton>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-4 py-3 bg-[#0B0F1A] border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
                                    >
                                        <option value="all" className="bg-[#0B0F1A]">All Status</option>
                                        <option value="active" className="bg-[#0B0F1A]">Active</option>
                                        <option value="completed" className="bg-[#0B0F1A]">Completed</option>
                                        <option value="inactive" className="bg-[#0B0F1A]">Inactive</option>
                                    </select>
                                    <Filter size={20} className="text-white" />
                                </div>
                            </div>
                        </GlassCard>

                        {/* Register Student Modal */}
                        {showRegisterModal && (
                            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                                <GlassCard className="w-full max-w-md shadow-2xl border-primary/20 bg-black/99">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white flex items-center">
                                            <Plus size={22} className="mr-2 text-primary" /> Register New Student
                                        </h3>
                                        <button onClick={() => setShowRegisterModal(false)} className="text-white/30 hover:text-white transition-colors">
                                            <XCircle size={24} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleRegisterStudent} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5 font-inter">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                                value={registerData.name}
                                                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5 font-inter">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                                value={registerData.email}
                                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5 font-inter">Phone</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                                    value={registerData.phone}
                                                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5 font-inter">Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                                    value={registerData.password}
                                                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5 font-inter">Discount Code (Partner Code)</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary uppercase"
                                                placeholder="Enter your discount code"
                                                value={registerData.partnerCode}
                                                onChange={(e) => setRegisterData({ ...registerData, partnerCode: e.target.value.toUpperCase() })}
                                            />
                                            <p className="text-[10px] text-white/30 mt-1.5">Enter the discount code provided by admin</p>
                                        </div>

                                        <div className="pt-4 flex space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowRegisterModal(false)}
                                                className="flex-1 py-3 text-sm font-bold text-white/50 hover:bg-white/5 rounded-xl transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <ModernButton type="submit" className="flex-1 py-3" disabled={loading}>
                                                {loading ? 'Processing...' : 'Complete Registration'}
                                            </ModernButton>
                                        </div>
                                    </form>
                                </GlassCard>
                            </div>
                        )}

                        {/* Students List */}
                        <div className="grid gap-4">
                            {filteredStudents.map((student) => {
                                const initial = student.name ? student.name.charAt(0).toUpperCase() : '?';
                                return (
                                    <GlassCard key={student.id || student._id} className="hover:border-primary/40 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                    {initial}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{student.name || 'Unknown Student'}</h3>
                                                    <p className="text-sm text-white">{student.email}</p>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-xs text-white">Enrolled: {student.enrolledDate || new Date(student.createdAt).toLocaleDateString()}</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${student.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            student.status === 'completed' ? 'bg-purple-500/20 text-purple-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                            }`}>
                                                            {student.status || 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-white">{student.progress || 0}% Complete</p>
                                                    <p className="text-xs text-white">${student.totalSpent || 0} spent</p>
                                                    <p className="text-xs text-emerald-400">${student.discountSaved || 0} saved</p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedStudent(student)}
                                                    className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'codes' && (
                    <motion.div
                        key="codes"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Existing Codes */}
                        <GlassCard>
                            <h2 className="text-base font-bold text-white font-poppins mb-6 flex items-center">
                                <Ticket size={18} className="mr-2 text-primary" /> Admin-Assigned Affiliation Codes
                            </h2>
                            <p className="text-sm text-white/60 mb-6">These affiliation codes have been permanently securely assigned to your account by the SkillDad Administrator.</p>
                            <div className="space-y-4">
                                {discountCodes.map((code, index) => (
                                    <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{code.code}</h3>
                                                <p className="text-sm text-text-muted">
                                                    {code.type === 'percentage' ? `${code.value || code.discount}% off` : `$${code.value || code.discount} off`}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">{code.usedCount || 0} uses</p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${code.isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {code.isActive !== false ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min(((code.usedCount || 0) / 100) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'payouts' && (
                    <motion.div
                        key="payouts"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Request New Payout */}
                        <GlassCard>
                            <h2 className="text-base font-bold text-white font-poppins mb-6 flex items-center">
                                <Wallet size={18} className="mr-2 text-primary" /> Request Payout
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Available Balance</label>
                                    <div className="p-4 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                                        <p className="text-lg font-semibold text-emerald-400">${stats.totalEarnings?.toLocaleString() || '1,250'}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Payout Amount</label>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">Payment Method</label>
                                    <select className="w-full px-4 py-3 bg-white border border-white/10 rounded-xl text-black focus:outline-none focus:border-primary/50">
                                        <option value="bank">Bank Transfer</option>
                                        <option value="paypal">PayPal</option>
                                        <option value="crypto">Cryptocurrency</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6">
                                <ModernButton onClick={handleRequestPayout} className="w-full">
                                    Submit Payout Request
                                </ModernButton>
                            </div>
                        </GlassCard>

                        {/* Payout History */}
                        <GlassCard>
                            <h2 className="text-base font-bold text-white font-poppins mb-6 flex items-center">
                                <History size={18} className="mr-2 text-primary" /> Payout History
                            </h2>
                            <div className="space-y-4">
                                {payoutRequests.map((payout) => (
                                    <div key={payout.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-white">${payout.amount}</h3>
                                                <p className="text-sm text-white">{payout.method} • {payout.date}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${payout.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                payout.status === 'approved' ? 'bg-purple-500/20 text-purple-400' :
                                                    payout.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                {payout.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'analytics' && (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <GlassCard>
                            <h2 className="text-base font-bold text-white font-poppins mb-6 flex items-center">
                                <BarChart3 size={18} className="mr-2 text-primary" /> Performance Analytics
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Conversion Rate</h3>
                                    <p className="text-lg font-semibold text-white">24.5%</p>
                                    <p className="text-xs text-emerald-400 flex items-center mt-1">
                                        <TrendingUp size={12} className="mr-1" /> +3.2% from last month
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Avg. Order Value</h3>
                                    <p className="text-lg font-semibold text-white">$1,156</p>
                                    <p className="text-xs text-emerald-400 flex items-center mt-1">
                                        <TrendingUp size={12} className="mr-1" /> +8.1% from last month
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Student Retention</h3>
                                    <p className="text-lg font-semibold text-white">87%</p>
                                    <p className="text-xs text-emerald-400 flex items-center mt-1">
                                        <TrendingUp size={12} className="mr-1" /> +2.3% from last month
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Commission Rate</h3>
                                    <p className="text-lg font-semibold text-white">15%</p>
                                    <p className="text-xs text-white">Standard rate</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Student Detail Modal */}
            {
                selectedStudent && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-start justify-center p-4 pt-20 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto z-[100000]"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-base font-semibold text-white">Student Details</h2>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <XCircle size={20} className="text-white" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Profile Info */}
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <h3 className="font-bold text-white mb-4 flex items-center">
                                        <Users size={18} className="mr-2 text-primary" /> Profile Information
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-white">Name</p>
                                            <p className="font-bold text-white">{selectedStudent.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-white">Email</p>
                                            <p className="font-bold text-white">{selectedStudent.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-white">Phone</p>
                                            <p className="font-bold text-white">{selectedStudent.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-white">Enrolled Date</p>
                                            <p className="font-bold text-white">{selectedStudent.enrolledDate}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Courses */}
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <h3 className="font-bold text-white mb-4 flex items-center">
                                        <BookOpen size={18} className="mr-2 text-primary" /> Enrolled Courses
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedStudent.courses.map((course, index) => (
                                            <div key={index} className="p-3 bg-white/5 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-white">{course.name}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${course.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        'bg-purple-500/20 text-purple-400'
                                                        }`}>
                                                        {course.status}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-white/10 rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full"
                                                        style={{ width: `${course.progress}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-white mt-1">{course.progress}% complete</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <h3 className="font-bold text-white mb-4 flex items-center">
                                        <FileText size={18} className="mr-2 text-primary" /> Documents
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedStudent.documents.map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${doc.type === 'certificate' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        doc.type === 'project' ? 'bg-purple-500/20 text-purple-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {doc.type === 'certificate' ? <Award size={16} /> :
                                                            doc.type === 'project' ? <Target size={16} /> :
                                                                <FileText size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{doc.name}</p>
                                                        <p className="text-xs text-white">{doc.date}</p>
                                                    </div>
                                                </div>
                                                <button className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
};

export default PartnerDashboard;

