import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    Camera,
    FileText,
    Upload,
    BookOpen
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

const UniversityManagement = () => {
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [openDiscount, setOpenDiscount] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openOnboard, setOpenOnboard] = useState(false);
    const [newRate, setNewRate] = useState(0);
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        role: '',
        bio: ''
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
    const [openSendDoc, setOpenSendDoc] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const logoInputRef = useRef(null);
    const [docData, setDocData] = useState({
        title: '',
        type: 'exam_paper',
        file: null
    });

    // Courses Selection Logic
    const [allCourses, setAllCourses] = useState([]);
    const [openCoursesModal, setOpenCoursesModal] = useState(false);
    const [selectedCourses, setSelectedCourses] = useState([]);

    const navigate = useNavigate();
    const { showToast } = useToast();

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
            // Now fetches from Universities directly, populating assignedCourses
            const { data } = await axios.get('/api/admin/universities', config);
            setPartners(data);
        } catch (error) {
            console.error('Error fetching partners:', error.response?.data || error.message);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await axios.get('/api/courses');
            setAllCourses(data);
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    };

    useEffect(() => {
        fetchPartners();
        fetchCourses();
        // Auto-refresh every 30 seconds to get latest updates
        const interval = setInterval(() => {
            fetchPartners();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

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
                bio: (editData.bio || selectedPartner.bio || '').trim()
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

            showToast(`✓ ${payload.name} updated — discount: ${payload.discountRate}%`, 'success');
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
            bio: partner.bio || ''
        });
        setOpenEdit(true);
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedPartner) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        setLogoUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            await axios.post(`/api/admin/universities/${selectedPartner._id}/upload-image`, formData, config);

            showToast('Logo updated successfully', 'success');
            fetchPartners(); // Refresh list to show new logo
        } catch (error) {
            console.error('Error uploading logo:', error);
            showToast(error.response?.data?.message || 'Failed to upload logo', 'error');
        } finally {
            setLogoUploading(false);
        }
    };

    const handleOnboardEntity = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post('/api/users', newEntity, config);
            showToast(`Successfully onboarded ${newEntity.name}`, 'success');
            setOpenOnboard(false);
            setNewEntity({ name: '', email: '', password: '', phone: '', role: 'partner', discountRate: 0 });
            fetchPartners();
        } catch (error) {
            showToast(`Failed to onboard entity: ${error.response?.data?.message || error.message}`, 'error');
        }
    };

    const filteredPartners = partners.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleManageCourses = (partner) => {
        setSelectedPartner(partner);
        // Pre-fill selected courses from partner's assignedCourses
        if (partner.assignedCourses && Array.isArray(partner.assignedCourses)) {
            setSelectedCourses(partner.assignedCourses.map(c => typeof c === 'object' ? c._id : c));
        } else {
            setSelectedCourses([]);
        }
        setOpenCoursesModal(true);
    };

    const confirmCourseAssignment = async () => {
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            await axios.put(`/api/admin/universities/${selectedPartner._id}/courses`, { courses: selectedCourses }, config);
            showToast(`Courses updated for ${selectedPartner.name}`, 'success');
            setOpenCoursesModal(false);
            fetchPartners(); // Refresh list to get updated populated array
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to assign courses', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleCourseSelection = (courseId) => {
        setSelectedCourses(prev => {
            if (prev.includes(courseId)) {
                return prev.filter(id => id !== courseId);
            } else {
                return [...prev, courseId];
            }
        });
    };

    const handleSendDocument = async (e) => {
        e.preventDefault();
        if (!docData.file || !docData.title) {
            showToast('Please provide a title and select a file', 'warning');
            return;
        }

        setUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            const formData = new FormData();
            formData.append('document', docData.file);
            formData.append('title', docData.title);
            formData.append('type', docData.type);
            formData.append('recipientUniversity', selectedPartner._id);

            await axios.post('/api/documents/upload', formData, config);
            showToast(`Document sent successfully to ${selectedPartner.name}`, 'success');
            setOpenSendDoc(false);
            setDocData({ title: '', type: 'exam_paper', file: null });
        } catch (error) {
            showToast(error.response?.data?.message || 'Upload failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <DashboardHeading title="University Management" />
                </div>
                <div className="flex items-center space-x-3">
                    <ModernButton onClick={() => setOpenOnboard(true)}>
                        <Plus size={18} className="mr-2" /> Add University
                    </ModernButton>
                </div>
            </div>

            {/* B2B Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassCard className="group hover:border-primary/40">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                            <Building2 size={24} />
                        </div>
                        <div className="text-left">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-wider font-inter">Total Universities</p>
                            <p className="text-base font-semibold text-white font-inter">{partners.length}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="group hover:border-emerald-500/40">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <div className="text-left">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-wider font-inter">B2B Learners</p>
                            <p className="text-base font-semibold text-white font-inter">1,240</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="group hover:border-amber-500/40">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <DollarSign size={24} />
                        </div>
                        <div className="text-left">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-wider font-inter">B2B Revenue</p>
                            <p className="text-base font-semibold text-white font-inter">₹84.2k</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="group hover:border-secondary-purple/40">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-secondary-purple/10 text-secondary-purple rounded-2xl group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                        <div className="text-left">
                            <p className="text-white/50 text-xs font-bold uppercase tracking-wider font-inter">Avg. ROI</p>
                            <p className="text-base font-semibold text-white font-inter">24%</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* ROI Analytics Chart */}
                <GlassCard className="lg:col-span-2 shadow-xl border-white/10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-base font-semibold text-white font-inter flex items-center">
                                <BarChart3 size={18} className="mr-2 text-primary" /> Engagement  vs  ROI
                            </h3>
                            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mt-1">Cross-entity performance analysis</p>
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-lg">
                            <button
                                onClick={() => setTimeframe('monthly')}
                                className={`px-3 py-1 text-xs font-bold rounded-md shadow-sm transition-all ${timeframe === 'monthly' ? 'bg-white/10 text-primary' : 'text-white/50'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setTimeframe('yearly')}
                                className={`px-3 py-1 text-xs font-bold rounded-md shadow-sm transition-all ${timeframe === 'yearly' ? 'bg-white/10 text-primary' : 'text-white/50'}`}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5B5CF0" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#5B5CF0" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                                        color: '#000'
                                    }}
                                />
                                <Area type="monotone" dataKey="engagement" stroke="#5B5CF0" strokeWidth={3} fillOpacity={1} fill="url(#colorEngage)" />
                                <Area type="monotone" dataKey="roi" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRoi)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Assignment Fast-Actions */}
                <div className="space-y-6">
                    <GlassCard className="bg-white/5 text-white border-white/10 shadow-2xl shadow-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-base font-semibold font-inter mb-2 flex items-center">
                                <ShieldCheck size={18} className="mr-2 text-emerald-400" /> Compliance Status
                            </h4>
                            <p className="text-white/70 text-sm font-inter mb-6">92% of corporate partners have completed the annual security audit.</p>
                            <ModernButton onClick={() => setOpenAudits(true)} className="w-full !bg-white !text-slate-900 font-bold shadow-none">Review Audits</ModernButton>
                        </div>
                        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-primary/20 rounded-full blur-[40px]"></div>
                    </GlassCard>

                    <GlassCard className="border-white/10 overflow-hidden !p-0">
                        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Rapid Assignments</p>
                            <Layers size={14} className="text-white/40" />
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/20 text-primary rounded-lg"><Briefcase size={14} /></div>
                                    <span className="text-sm font-bold text-white">Enterprise AI</span>
                                </div>
                                <button onClick={() => handleRapidAssign('Enterprise AI')} className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"><Plus size={16} /></button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Briefcase size={14} /></div>
                                    <span className="text-sm font-bold text-white">Project Management</span>
                                </div>
                                <button onClick={() => handleRapidAssign('Project Management')} className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"><Plus size={16} /></button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Entity Table */}
            <GlassCard className="!p-0 border-white/10 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-base font-semibold text-white font-inter">Partner Network</h3>
                    <div className="flex space-x-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search entity..."
                                className="pl-10 pr-4 py-2 bg-transparent border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary w-full sm:w-64 font-inter"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Users className="absolute left-3 top-2.5 text-white/40" size={16} />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto pb-2">
                    <table className="w-full text-left font-inter border-collapse min-w-[800px]">
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
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white font-poppins cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => navigate(`/admin/university/${partner._id}`)}>
                                                {partner.name?.charAt(0)}
                                            </div>
                                            <span
                                                className="font-bold text-white cursor-pointer hover:text-primary transition-colors"
                                                onClick={() => navigate(`/admin/university/${partner._id}`)}
                                            >
                                                {partner.name}
                                            </span>
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
                                                handleManageCourses(partner);
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-emerald-400"
                                            title="Manage Assigned Courses"
                                        >
                                            <BookOpen size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPartner(partner);
                                                setOpenSendDoc(true);
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-indigo-400"
                                            title="Send Exam Documents"
                                        >
                                            <Upload size={18} />
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
            </GlassCard>

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

                        <div className="flex flex-col items-center mb-6 p-4 bg-white/5 rounded-2xl border border-white/10 relative group">
                            <div
                                className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-lg overflow-hidden relative cursor-pointer"
                                onClick={() => logoInputRef.current?.click()}
                            >
                                {selectedPartner.profileImage ? (
                                    <img
                                        src={selectedPartner.profileImage}
                                        alt={selectedPartner.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Building2 size={32} />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={16} className="text-white" />
                                </div>
                                {logoUploading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={logoInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleLogoUpload}
                            />
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Update Institution Logo</p>
                        </div>

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
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary resize-none h-24 text-sm"
                                    value={editData.bio}
                                    placeholder="University description..."
                                    onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                />
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
                                    <option value="partner" className="bg-black text-white">Partner</option>
                                    <option value="university" className="bg-black text-white">University</option>
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

            {/* Assign Courses Modal */}
            {
                openCoursesModal && (
                    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto" onClick={() => setOpenCoursesModal(false)}>
                        <GlassCard className="w-full max-w-md bg-black/95 border-white/20 my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold text-white font-inter mb-2">Manage Assigned Courses</h3>
                            <p className="text-sm text-white/60 mb-6 font-inter underline decoration-primary decoration-2 underline-offset-4">
                                Target: {selectedPartner?.name}
                            </p>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {allCourses.length > 0 ? allCourses.map(course => {
                                    const isSelected = selectedCourses.includes(course._id);
                                    return (
                                        <button
                                            key={course._id}
                                            onClick={() => toggleCourseSelection(course._id)}
                                            className={`w-full p-3 rounded-xl text-left text-sm transition-all flex items-center justify-between group ${isSelected ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}`}
                                        >
                                            <span className="font-medium line-clamp-1">{course.title}</span>
                                            {isSelected ? (
                                                <ShieldCheck size={16} className="text-emerald-400 shrink-0 ml-2" />
                                            ) : (
                                                <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2 text-white/50" />
                                            )}
                                        </button>
                                    );
                                }) : (
                                    <p className="text-white/40 text-center py-4">No courses available on platform.</p>
                                )}
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setOpenCoursesModal(false)}
                                    className="w-1/2 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl text-sm font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <ModernButton
                                    onClick={confirmCourseAssignment}
                                    className="w-1/2 !py-3 tracking-widest font-black uppercase text-xs shadow-xl shadow-primary/20"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </ModernButton>
                            </div>
                        </GlassCard>
                    </div>
                )
            }

            {/* Send Exam Documents Modal */}
            {
                openSendDoc && (
                    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto" onClick={() => setOpenSendDoc(false)}>
                        <GlassCard className="w-full max-w-md bg-black/95 border-white/20 my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold text-white font-inter mb-2">Send Official Documents</h3>
                            <p className="text-sm text-white/60 mb-6 font-inter">Target: <span className="text-indigo-400 font-bold">{selectedPartner?.name}</span></p>

                            <form onSubmit={handleSendDocument} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Document Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 font-inter"
                                        placeholder="e.g. Final Exam Paper - Spring 2024"
                                        value={docData.title}
                                        onChange={e => setDocData({ ...docData, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Document Category</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-900 border border-white/20 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-inter"
                                        value={docData.type}
                                        onChange={e => setDocData({ ...docData, type: e.target.value })}
                                    >
                                        <option value="exam_paper">Exam Question Paper</option>
                                        <option value="answer_sheet">Official Answer Sheet</option>
                                        <option value="academic">Academic Material</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Select File (PDF/DOCX/ZIP)</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.zip,.rar"
                                            required
                                            className="hidden"
                                            id="doc-file-upload"
                                            onChange={e => setDocData({ ...docData, file: e.target.files[0] })}
                                        />
                                        <label
                                            htmlFor="doc-file-upload"
                                            className="w-full flex flex-col items-center justify-center px-4 py-8 border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl bg-white/5 cursor-pointer transition-all"
                                        >
                                            <FileText className={`${docData.file ? 'text-indigo-400' : 'text-white/20'} mb-2`} size={32} />
                                            <span className="text-sm text-white/60 font-medium">
                                                {docData.file ? docData.file.name : 'Click to select or drag file'}
                                            </span>
                                            {docData.file && (
                                                <span className="text-[10px] text-white/30 mt-1">
                                                    {(docData.file.size / (1024 * 1024)).toFixed(2)} MB
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setOpenSendDoc(false)}
                                        className="flex-1 py-3 text-sm font-bold text-white/40 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <ModernButton
                                        type="submit"
                                        className="flex-1 !py-3 tracking-widest font-black uppercase text-xs"
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Transmitting...' : 'Send Securely'}
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

export default UniversityManagement;
