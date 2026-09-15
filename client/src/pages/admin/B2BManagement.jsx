import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { getMediaUrl } from '../../utils/media';
import {
    Building2,
    Users,
    TrendingUp,
    DollarSign,
    ShieldCheck,
    MoreHorizontal,
    Plus,
    Briefcase,
    Layers,
    BarChart3,
    Edit3,
    Eye,
    Wallet,
    Ticket,
    Activity,
    Sparkles,
    BookOpen,
    Globe
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import { useToast } from '../../context/ToastContext';

const B2BManagement = () => {
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [openDiscount, setOpenDiscount] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openOnboard, setOpenOnboard] = useState(false);
    const [openStats, setOpenStats] = useState(false);
    const [partnerStats, setPartnerStats] = useState(null);
    const [newRate, setNewRate] = useState(0);
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        role: '',
        password: ''
    });
    const [newEntity, setNewEntity] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'partner',
        discountRate: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [openAudits, setOpenAudits] = useState(false);
    const [openAssign, setOpenAssign] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [timeframe, setTimeframe] = useState('monthly');
    const [loading, setLoading] = useState(false);
    const [openGenerateCode, setOpenGenerateCode] = useState(false);
    const [codeData, setCodeData] = useState({
        code: '',
        type: 'percentage',
        value: 0
    });
    const { showToast } = useToast();

    // Recharts' ResponsiveContainer measures its parent on mount via ResizeObserver,
    // which can fire once with a stale/unlaid-out size (width/height -1) if the chart
    // mounts in the same paint as its container - deferring one tick avoids that.
    const [chartReady, setChartReady] = useState(false);
    useEffect(() => {
        const raf = requestAnimationFrame(() => setChartReady(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    const roiData = [
        { name: 'Jan', engagement: 45, roi: 30 },
        { name: 'Feb', engagement: 52, roi: 38 },
        { name: 'Mar', engagement: 48, roi: 35 },
        { name: 'Apr', engagement: 61, roi: 42 },
        { name: 'May', engagement: 55, roi: 40 },
        { name: 'Jun', engagement: 67, roi: 50 },
    ];

    const yearlyRoiData = [
        { name: '2021', engagement: 420, roi: 280 },
        { name: '2022', engagement: 550, roi: 390 },
        { name: '2023', engagement: 780, roi: 510 },
        { name: '2024', engagement: 920, roi: 650 },
        { name: '2025', engagement: 1100, roi: 820 },
    ];

    const chartData = timeframe === 'monthly' ? roiData : yearlyRoiData;

    const fetchPartners = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
            if (!userInfo?.token) return;
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/admin/users/all', config);
            const institutional = (data.users || []).filter(u => {
                const role = u.role?.toLowerCase();
                // Strictly allow only partner and b2b roles, exclude university
                return (role === 'partner' || role === 'b2b');
            });
            setPartners(institutional);
        } catch (error) {
            console.error('Error fetching partners:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchPartners();
        // Auto-refresh every 30 seconds to get latest updates
        const interval = setInterval(() => {
            fetchPartners();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Listen for real-time partner updates via WebSocket
    useEffect(() => {
        if (!socket) return;

        const handleUserListUpdate = (data) => {
            console.log('[B2B] Received userListUpdate:', data);

            // Handle real-time updates for partners and b2b entities only
            const role = data.user?.role?.toLowerCase();
            if (role === 'partner' || role === 'b2b') {
                if (data.action === 'created') {
                    // Add new partner to the list
                    setPartners(prev => {
                        // Check if partner already exists
                        const exists = prev.some(p => p._id === data.user._id);
                        if (exists) {
                            console.log('[B2B] Partner already exists, skipping duplicate');
                            return prev;
                        }
                        console.log('[B2B] Adding new partner to list:', data.user.name);
                        return [data.user, ...prev];
                    });
                    showToast(`New partner added: ${data.user.name}`, 'success');
                } else if (data.action === 'updated') {
                    // Update existing partner
                    console.log('[B2B] Updating partner:', data.user.name);
                    setPartners(prev => {
                        const exists = prev.some(p => p._id === data.user._id);
                        if (exists) {
                            return prev.map(p => p._id === data.user._id ? { ...p, ...data.user } : p);
                        } else {
                            return [data.user, ...prev];
                        }
                    });
                } else if (data.action === 'deleted') {
                    // Remove partner from list
                    console.log('[B2B] Removing partner:', data.user.name);
                    setPartners(prev => prev.filter(p => p._id !== data.user._id));
                    showToast(`Partner removed: ${data.user.name}`, 'info');
                }
            }
        };

        socket.on('userListUpdate', handleUserListUpdate);

        return () => {
            socket.off('userListUpdate', handleUserListUpdate);
        };
    }, [socket, showToast]);

    const handleUpdatePartner = async () => {
        if (!selectedPartner?._id) {
            showToast('No partner selected', 'error');
            return;
        }

        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
            if (!userInfo?.token) throw new Error('Not logged in');

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };

            const payload = {
                name: (editData.name || selectedPartner.name || '').trim(),
                email: (editData.email || selectedPartner.email || '').trim(),
                role: (editData.role || selectedPartner.role || 'partner'),
                discountRate: Number(newRate) || 0,
                password: editData.password?.trim() || undefined
            };

            console.log('[B2B] Updating entity', selectedPartner._id, payload);

            const { data } = await axios.put(
                `/api/admin/entities/${selectedPartner._id}`,
                payload,
                config
            );

            console.log('[B2B] Update success:', data);

            // Immediate optimistic UI update
            setPartners(prev => prev.map(p =>
                p._id === selectedPartner._id
                    ? { ...p, ...payload }
                    : p
            ));

            showToast(`✓ ${payload.name} updated - discount: ${payload.discountRate}%`, 'success');
            setOpenEdit(false);
            setOpenDiscount(false);
            // Sync from server in bg
            setTimeout(fetchPartners, 1000);
        } catch (error) {
            console.error('[B2B] Update error:', error.response?.data || error.message);
            const msg = error.response?.data?.message || error.message || 'Update failed';
            showToast(`Error: ${msg}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditPartner = (partner) => {
        setSelectedPartner(partner);
        setNewRate(partner.discountRate || 0);
        setEditData({
            name: partner.name,
            email: partner.email,
            role: partner.role,
            password: ''
        });
        setOpenEdit(true);
    };

    const handleOnboardEntity = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };
            const { data } = await axios.post('/api/admin/users/invite', newEntity, config);
            showToast(`Successfully onboarded ${newEntity.name}`, 'success');
            setOpenOnboard(false);
            setNewEntity({ name: '', email: '', password: '', phone: '', role: 'partner', discountRate: 0 });
            await fetchPartners();
        } catch (error) {
            showToast(`Failed to onboard entity: ${error.response?.data?.message || error.message}`, 'error');
        }
    };

    const filteredPartners = partners.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRapidAssign = (course) => {
        setSelectedCourse(course);
        setOpenAssign(true);
    };

    const handleViewStats = async (partner) => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`/api/admin/partners/${partner._id}`, config);
            setPartnerStats(data.stats || {});
            setSelectedPartner(partner);
            setOpenStats(true);
        } catch (error) {
            showToast('Failed to load partner analytics', 'error');
        } finally {
            setLoading(false);
        }
    };

    const confirmAssignment = (partnerName) => {
        showToast(`Assigned ${selectedCourse} curriculum to ${partnerName}`, 'success');
        setOpenAssign(false);
    };

    const handleGenerateCode = async (e) => {
        e.preventDefault();
        if (!codeData.code || !codeData.value) {
            showToast('Please provide code and discount value', 'warning');
            return;
        }

        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };

            await axios.post('/api/discount', {
                code: codeData.code.toUpperCase(),
                type: codeData.type,
                value: Number(codeData.value),
                partner: selectedPartner._id
            }, config);

            showToast(`Discount code ${codeData.code.toUpperCase()} created for ${selectedPartner.name}`, 'success');
            setOpenGenerateCode(false);
            setCodeData({ code: '', type: 'percentage', value: 0 });
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create discount code', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <DashboardHeading title="B2B Partners" />
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                        onClick={fetchPartners}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold font-inter inline-flex items-center gap-1.5 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-primary/40 hover:text-primary transition-all shadow-sm"
                    >
                        <Activity size={14} /> <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => setOpenOnboard(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold font-inter inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white transition-all shadow-sm"
                    >
                        <Plus size={14} /> <span>Add Partner</span>
                    </button>
                </div>
            </div>

            {/* B2B Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="group relative bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 sm:p-3.5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
                        <Building2 size={16} />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium font-inter">Total Entities</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-inter tracking-tight">{partners.length}</p>
                    </div>
                </div>

                <div className="group relative bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 sm:p-3.5 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
                        <Users size={16} />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium font-inter">B2B Learners</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-inter tracking-tight">1,240</p>
                    </div>
                </div>

                <div className="group relative bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 sm:p-3.5 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all duration-200 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
                        <DollarSign size={16} />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium font-inter">B2B Revenue</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-inter tracking-tight">₹84.2k</p>
                    </div>
                </div>

                <div className="group relative bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 sm:p-3.5 shadow-sm hover:shadow-md hover:border-purple-500/40 transition-all duration-200 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
                        <TrendingUp size={16} />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium font-inter">Avg. ROI</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-inter tracking-tight">24%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* ROI Analytics Chart */}
                <div className="lg:col-span-2 bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-inter flex items-center gap-2">
                                <BarChart3 size={15} className="text-primary" /> <span>Engagement vs ROI</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-inter mt-0.5">Cross-entity performance analysis</p>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg border border-slate-200/80 dark:border-white/10">
                            <button
                                onClick={() => setTimeframe('monthly')}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${timeframe === 'monthly' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setTimeframe('yearly')}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${timeframe === 'yearly' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>
                    <div className="h-[280px] w-full relative" style={{ minWidth: 0 }}>
                        {chartReady && (
                        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={250} debounce={50}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5B5CF0" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#5B5CF0" stopOpacity={0.01} />
                                    </linearGradient>
                                    <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                                        color: '#0f172a',
                                        fontSize: '12px',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                />
                                <Area type="monotone" dataKey="engagement" stroke="#5B5CF0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEngage)" />
                                <Area type="monotone" dataKey="roi" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRoi)" />
                            </AreaChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Assignment Fast-Actions */}
                <div className="space-y-4">
                    <div className="bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-inter mb-3 flex items-center justify-between">
                            <span>Fast Course Assignment</span>
                            <Sparkles size={14} className="text-primary" />
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200/60 dark:border-white/5">
                                <div className="flex items-center space-x-2.5">
                                    <div className="p-1.5 bg-primary/10 text-primary rounded-md"><BookOpen size={13} /></div>
                                    <span className="text-xs font-semibold text-slate-800 dark:text-white font-inter">Full Stack MERN</span>
                                </div>
                                <button onClick={() => handleRapidAssign('Full Stack MERN')} className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors"><Plus size={14} /></button>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200/60 dark:border-white/5">
                                <div className="flex items-center space-x-2.5">
                                    <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md"><Globe size={13} /></div>
                                    <span className="text-xs font-semibold text-slate-800 dark:text-white font-inter">Enterprise AI</span>
                                </div>
                                <button onClick={() => handleRapidAssign('Enterprise AI')} className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors"><Plus size={14} /></button>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200/60 dark:border-white/5">
                                <div className="flex items-center space-x-2.5">
                                    <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-md"><Briefcase size={13} /></div>
                                    <span className="text-xs font-semibold text-slate-800 dark:text-white font-inter">Project Management</span>
                                </div>
                                <button onClick={() => handleRapidAssign('Project Management')} className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors"><Plus size={14} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Entity Table */}
            <div className="bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-inter">Partner Network</h3>
                    <div className="flex space-x-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search entity..."
                                className="pl-8 pr-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary w-full sm:w-56 font-inter"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Users className="absolute left-2.5 top-2 text-slate-400 dark:text-slate-500" size={14} />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-inter border-collapse responsive-table">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-widest">Entity Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-widest">Classification</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-widest">Audit</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-widest">Applied Discount</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredPartners.map((partner) => (
                                <tr key={partner._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white font-poppins overflow-hidden">
                                                {partner.profileImage || partner.profile_image ? (
                                                    <img src={getMediaUrl(partner.profileImage || partner.profile_image)} alt={partner.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    partner.name?.charAt(0)
                                                )}
                                            </div>
                                            <button
                                                onClick={() => navigate(`/admin/b2b/${partner._id}`)}
                                                className="font-bold dark:text-white text-slate-900 hover:text-primary transition-colors text-left"
                                            >
                                                {partner.name}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${partner.role === 'university' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'
                                            }`}>
                                            {partner.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-1.5 font-bold text-xs uppercase tracking-wide">
                                            <span className={`w-2 h-2 rounded-full ${partner.isVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                            <span className={partner.isVerified ? 'text-emerald-400' : 'text-amber-400'}>
                                                {partner.isVerified ? 'Active' : 'Pending'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">PASSED</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPartner(partner);
                                                setNewRate(partner.discountRate || 0);
                                                setEditData({
                                                    name: partner.name,
                                                    email: partner.email,
                                                    role: partner.role
                                                });
                                                setOpenDiscount(true);
                                            }}
                                            className="font-bold text-white hover:text-primary transition-colors hover:scale-105 transform origin-left"
                                        >
                                            {partner.discountRate || 0}%
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPartner(partner);
                                                setCodeData({ code: '', type: 'percentage', value: partner.discountRate || 15 });
                                                setOpenGenerateCode(true);
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-pink-400"
                                            title="Generate Discount Code"
                                        >
                                            <Ticket size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewStats(partner);
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-emerald-400"
                                            title="View Partner Statistics"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditPartner(partner);
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-primary"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPartner(partner);
                                                setNewRate(partner.discountRate || 0);
                                                setEditData({
                                                    name: partner.name,
                                                    email: partner.email,
                                                    role: partner.role
                                                });
                                                setOpenDiscount(true);
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-primary"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Partner Details Modal */}
            {openStats && selectedPartner && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={(e) => { if (e.target === e.currentTarget) setOpenStats(false); }}
                >
                    <div className="w-full max-w-xl bg-black/95 backdrop-blur-xl rounded-[24px] p-6 border-2 border-primary/20 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{selectedPartner.name} - Performance</h3>
                                <p className="text-sm text-white/60">Live B2B statistics, students, and wallet balance.</p>
                            </div>
                            <button onClick={() => setOpenStats(false)} className="text-white/40 hover:text-white transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden group">
                                <Users size={24} className="text-primary mb-2" />
                                <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Enrolled Students</p>
                                <p className="text-2xl font-black text-white">{partnerStats?.studentsCount || 0}</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden group">
                                <Ticket size={24} className="text-pink-400 mb-2" />
                                <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Total Discount Codes</p>
                                <p className="text-2xl font-black text-white">{partnerStats?.totalCodes || 0}</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-amber-500/20 rounded-xl relative overflow-hidden group">
                                <Wallet size={24} className="text-amber-400 mb-2" />
                                <p className="text-xs font-bold text-amber-500/50 uppercase tracking-widest mb-1">Pending Payouts</p>
                                <p className="text-2xl font-black text-amber-400">₹{partnerStats?.pendingPayouts?.toLocaleString() || 0}</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-emerald-500/20 rounded-xl relative overflow-hidden group">
                                <DollarSign size={24} className="text-emerald-400 mb-2" />
                                <p className="text-xs font-bold text-emerald-500/50 uppercase tracking-widest mb-1">Total Earned (Approved)</p>
                                <p className="text-2xl font-black text-emerald-400">₹{partnerStats?.totalEarnings?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Discount Dialog */}
            {openDiscount && (
                <div
                    className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
                    onClick={(e) => { if (e.target === e.currentTarget) setOpenDiscount(false); }}
                >
                    <div
                        className="w-full max-w-md bg-black/95 backdrop-blur-xl rounded-[24px] p-6 border-2 border-primary/20 shadow-2xl my-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-base font-semibold text-white font-inter mb-2">Partner Incentives</h3>
                        <p className="text-sm text-white/70 font-inter mb-6">Update the global discount rate for <span className="text-primary font-bold">{selectedPartner?.name}</span>.</p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 font-inter">Discount Percentage (%)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary font-poppins font-bold"
                                    value={newRate}
                                    onChange={(e) => setNewRate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setOpenDiscount(false)}
                                className="flex-1 py-3 font-bold text-white/70 hover:bg-white/5 rounded-xl transition-colors font-inter"
                            >
                                Cancel
                            </button>
                            <ModernButton
                                onClick={handleUpdatePartner}
                                className="flex-1 !py-3 font-bold tracking-wide"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </ModernButton>
                        </div>
                    </div>
                </div>
            )}


            {/* Edit Partner Modal */}
            {openEdit && (
                <div
                    className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
                    onClick={(e) => { if (e.target === e.currentTarget) setOpenEdit(false); }}
                >
                    <div
                        className="w-full max-w-sm bg-black/95 rounded-[24px] p-6 border-2 border-primary/20 my-8 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-base font-semibold text-white font-inter mb-4">Edit Entity Details</h3>

                        <div className="space-y-3 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Entity Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                    value={editData.name}
                                    onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                    value={editData.email}
                                    onChange={e => setEditData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
                                    placeholder="Enter new password"
                                    value={editData.password}
                                    onChange={e => setEditData(prev => ({ ...prev, password: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Classification</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary cursor-pointer"
                                    value={editData.role}
                                    onChange={e => setEditData(prev => ({ ...prev, role: e.target.value }))}
                                >
                                    <option value="partner">Partner</option>
                                    <option value="university">University</option>
                                    <option value="admin">Admin</option>
                                    <option value="finance">Finance</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Applied Discount (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary text-sm font-bold"
                                    value={newRate}
                                    onChange={e => setNewRate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setOpenEdit(false)}
                                className="flex-1 py-2.5 text-xs font-bold text-white/70 hover:bg-white/5 rounded-xl transition-colors border border-white/10"
                            >
                                Cancel
                            </button>
                            <ModernButton
                                onClick={handleUpdatePartner}
                                className="flex-1 !py-2 text-xs font-bold uppercase tracking-wider"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Update Details'}
                            </ModernButton>
                        </div>
                    </div>
                </div>
            )}
            {/* Onboard New Entity Dialog */}
            {openOnboard && (
                <div
                    className="fixed inset-0 z-[99999] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setOpenOnboard(false);
                            setNewEntity({ name: '', email: '', password: '', phone: '', role: 'partner' });
                        }
                    }}
                >
                    <GlassCard className="w-full max-w-sm bg-black/95 backdrop-blur-xl shadow-2xl relative z-[100000] border-white/20 my-8" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-base font-semibold text-white font-inter mb-4">Onboard New Entity</h3>

                        <div className="space-y-3 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5 font-inter">Entity Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary font-inter"
                                    placeholder="Enter entity name"
                                    value={newEntity.name}
                                    onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5 font-inter">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary font-inter"
                                    placeholder="entity@example.com"
                                    value={newEntity.email}
                                    onChange={(e) => setNewEntity({ ...newEntity, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5 font-inter">Password</label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary font-inter"
                                    placeholder="Enter password"
                                    value={newEntity.password}
                                    onChange={(e) => setNewEntity({ ...newEntity, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5 font-inter">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary font-inter"
                                    placeholder="Enter phone number"
                                    value={newEntity.phone}
                                    onChange={(e) => setNewEntity({ ...newEntity, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5 font-inter">Entity Type</label>
                                <select
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-primary font-inter"
                                    value={newEntity.role}
                                    onChange={(e) => setNewEntity({ ...newEntity, role: e.target.value })}
                                >
                                    <option value="partner" className="bg-[#0B0F1A]">Partner</option>
                                    <option value="university" className="bg-[#0B0F1A]">University</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5 font-inter">Discount Rate (%)</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary font-inter"
                                    placeholder="Enter discount (e.g. 15)"
                                    value={newEntity.discountRate}
                                    onChange={(e) => setNewEntity({ ...newEntity, discountRate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    setOpenOnboard(false);
                                    setNewEntity({ name: '', email: '', password: '', phone: '', role: 'partner', discountRate: 0 });
                                }}
                                className="flex-1 py-2 text-sm font-bold text-white/70 hover:bg-white/5 rounded-lg transition-colors font-inter"
                            >
                                Cancel
                            </button>
                            <ModernButton onClick={handleOnboardEntity} className="flex-1 !py-2 text-sm font-bold tracking-wide">
                                Onboard Entity
                            </ModernButton>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Compliance Modal */}
            {openAudits && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto" onClick={() => setOpenAudits(false)}>
                    <GlassCard className="w-full max-w-2xl bg-black/95 border-white/20 my-8" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white font-inter">Compliance Audit Report</h3>
                            <button onClick={() => setOpenAudits(false)} className="text-white/50 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <p className="text-emerald-400 text-sm font-bold flex items-center">
                                    <ShieldCheck size={16} className="mr-2" /> All Systems Nominal
                                </p>
                                <p className="text-white/70 text-xs mt-1">92% of active entities have submitted their quarterly security certifications.</p>
                            </div>
                            <div className="divide-y divide-white/10">
                                {partners.slice(0, 5).map(p => (
                                    <div key={p._id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-white font-medium">{p.name}</p>
                                            <p className="text-[10px] text-white/40">Audit Token: {p._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">CERTIFIED</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )
            }

            {/* Assignment Selection Modal */}
            {
                openAssign && (
                    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto" onClick={() => setOpenAssign(false)}>
                        <GlassCard className="w-full max-w-md bg-black/95 border-white/20 my-8" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold text-white font-inter mb-2">Rapid Assignment</h3>
                            <p className="text-sm text-white/60 mb-6 font-inter underline decoration-primary decoration-2 underline-offset-4">Assigning: {selectedCourse}</p>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {partners.length > 0 ? partners.map(partner => (
                                    <button
                                        key={partner._id}
                                        onClick={() => confirmAssignment(partner.name)}
                                        className="w-full p-3 bg-white/5 hover:bg-primary/20 border border-white/10 rounded-xl text-left text-sm text-white transition-all flex items-center justify-between group"
                                    >
                                        <span>{partner.name}</span>
                                        <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                )) : (
                                    <p className="text-white/40 text-center py-4">No partners available</p>
                                )}
                            </div>

                            <button onClick={() => setOpenAssign(false)} className="w-full mt-6 py-3 text-white/50 hover:text-white text-sm font-bold transition-colors">
                                Close
                            </button>
                        </GlassCard>
                    </div >
                )
            }

            {/* Generate Discount Code Modal */}
            {
                openGenerateCode && (
                    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto" onClick={() => setOpenGenerateCode(false)}>
                        <GlassCard className="w-full max-w-md bg-black/95 border-white/20 my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold text-white font-inter mb-2">Generate Discount Code</h3>
                            <p className="text-sm text-white/60 mb-6 font-inter">Create a discount code for: <span className="text-pink-400 font-bold">{selectedPartner?.name}</span></p>

                            <form onSubmit={handleGenerateCode} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Discount Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-500 font-inter uppercase"
                                        placeholder="e.g. PARTNER2024"
                                        value={codeData.code}
                                        onChange={e => setCodeData({ ...codeData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Discount Type</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-900 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500 font-inter"
                                        value={codeData.type}
                                        onChange={e => setCodeData({ ...codeData, type: e.target.value })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                        Discount Value {codeData.type === 'percentage' ? '(%)' : '(₹)'}
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max={codeData.type === 'percentage' ? '100' : undefined}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-500 font-inter"
                                        placeholder={codeData.type === 'percentage' ? 'e.g. 15' : 'e.g. 500'}
                                        value={codeData.value}
                                        onChange={e => setCodeData({ ...codeData, value: e.target.value })}
                                    />
                                </div>

                                <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                                    <p className="text-pink-400 text-xs font-bold flex items-center">
                                        <Ticket size={14} className="mr-2" /> Preview
                                    </p>
                                    <p className="text-white text-sm mt-2">
                                        Code: <span className="font-bold text-pink-400">{codeData.code || 'PARTNER2024'}</span>
                                    </p>
                                    <p className="text-white/70 text-xs mt-1">
                                        Discount: {codeData.type === 'percentage' ? `${codeData.value}%` : `₹${codeData.value}`} off
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setOpenGenerateCode(false)}
                                        className="flex-1 py-3 text-sm font-bold text-white/40 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <ModernButton
                                        type="submit"
                                        className="flex-1 !py-3 tracking-widest font-black uppercase text-xs"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating...' : 'Generate Code'}
                                    </ModernButton>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                )
            }
        </div >
    );
};

export default B2BManagement;
