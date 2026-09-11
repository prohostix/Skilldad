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
    BookOpen,
    Trash2
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
import { getMediaUrl } from '../../utils/media';

const DEFAULT_ACHIEVEMENTS = [
    { title: "Academic Excellence 2024", desc: "Ranked #1 for regional innovation and research quality.", image: "" },
    { title: "Industry Integration Leader", desc: "Strategic partnerships with 100+ Fortune 500 companies.", image: "" }
];

const UniversityManagement = () => {
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [openDiscount, setOpenDiscount] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editModalTab, setEditModalTab] = useState('basic');
    const [openOnboard, setOpenOnboard] = useState(false);
    const [newRate, setNewRate] = useState(0);
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        role: '',
        bio: '',
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
    const [roleFilter, setRoleFilter] = useState('all');
    const [openAudits, setOpenAudits] = useState(false);
    const [openAssign, setOpenAssign] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [timeframe, setTimeframe] = useState('monthly');
    const [loading, setLoading] = useState(false);
    const [openSendDoc, setOpenSendDoc] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedGalleryImages, setSelectedGalleryImages] = useState([]);
    const [logoUploading, setLogoUploading] = useState(false);
    const logoInputRef = useRef(null);
    const [docData, setDocData] = useState({
        title: '',
        type: 'exam_paper',
        file: null
    });
    const [openDelete, setOpenDelete] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

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
                bio: (editData.bio !== undefined ? editData.bio : (selectedPartner.bio || '')).trim(),
                password: editData.password?.trim() || undefined,
                profileImage: editData.profileImage?.trim() || undefined,
                achievements: editData.achievements || undefined,
                videos: editData.videos || undefined
            };

            console.log('[B2B] Updating entity', selectedPartner._id, payload);

            // 1. Update basic entity fields (role, discount, email, name, password)
            const { data } = await axios.put(
                `/api/admin/entities/${selectedPartner._id}`,
                payload,
                config
            );
            
            // 2. Update rich profile fields
            const profilePayload = {
                bio: payload.bio,
                location: editData.location,
                website: editData.website,
                phone: editData.phone,
                youtubeUrl: editData.youtubeUrl,
                achievements: editData.achievements,
                videos: editData.videos,
                certificates: editData.certificates,
                gallery: editData.gallery,
                profileImage: editData.profileImage,
                coverImage: editData.coverImage,
                foundedYear: editData.foundedYear
            };
            
            await axios.put(
                `/api/admin/universities/${selectedPartner._id}/profile`,
                profilePayload,
                config
            );

            if (selectedGalleryImages.length > 0) {
                const galleryData = new FormData();
                selectedGalleryImages.forEach(file => {
                    galleryData.append('galleryImages', file);
                });
                await axios.post(`/api/admin/universities/${selectedPartner._id}/upload-gallery`, galleryData, {
                    headers: {
                        ...config.headers,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                showToast('Gallery images uploaded successfully!', 'success');
            }

            console.log('[B2B] Update success:', data);

            // Immediate optimistic UI update
            setPartners(prev => prev.map(p =>
                p._id === selectedPartner._id
                    ? { ...p, ...payload }
                    : p
            ));

            showToast(`✓ ${payload.name || selectedPartner.name} updated successfully`, 'success');
            setOpenEdit(false);
            setOpenDiscount(false);
            setSelectedGalleryImages([]);
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

    const handleMediaUpload = async (file) => {
        if (!file) return null;
        const uploadData = new FormData();
        uploadData.append('file', file);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };
            const { data } = await axios.post('/api/upload/media', uploadData, config);
            return data.url;
        } catch (error) {
            console.error('Media upload error:', error);
            showToast('Failed to upload file', 'error');
            return null;
        }
    };

        const handleEditPartner = (partner) => {
        setSelectedPartner(partner);
        setNewRate(partner.discountRate || 0);
        setEditModalTab('basic');
        setEditData({
            name: partner.name || '',
            email: partner.email || '',
            role: partner.role || 'partner',
            bio: partner.bio || partner.profile?.description || '',
            password: '',
            profileImage: partner.profileImage || partner.profile_image || partner.profile?.profileImage || '',
            coverImage: partner.profile?.coverImage || partner.profile?.cover_image || '',
            location: partner.profile?.location || '',
            website: partner.profile?.website || '',
            phone: partner.profile?.phone || '',
            youtubeUrl: partner.profile?.youtubeUrl || partner.profile?.youtube_url || '',
            achievements: (partner.profile?.achievements && partner.profile.achievements.length > 0) ? partner.profile.achievements : [...DEFAULT_ACHIEVEMENTS],
            videos: partner.profile?.videos || [],
            gallery: partner.profile?.gallery || [],
            certificates: partner.profile?.certificates || [],
            foundedYear: partner.profile?.foundedYear || partner.profile?.foundation_year || ''
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

            const { data } = await axios.post(`/api/admin/universities/${selectedPartner._id}/upload-image`, formData, config);

            setSelectedPartner(prev => ({
                ...prev,
                profileImage: data.profileImage || `/uploads/${file.name}`
            }));

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

    const filteredPartners = (partners || []).filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || p.role === roleFilter;
        return matchesSearch && matchesRole;
    });

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

    const handleDeleteUniversity = async () => {
        if (!selectedPartner?._id) return;

        setLoadingDelete(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            await axios.delete(`/api/admin/universities/${selectedPartner._id}`, config);
            showToast(`${selectedPartner.name} deleted successfully`, 'success');
            setOpenDelete(false);
            fetchPartners();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete university', 'error');
        } finally {
            setLoadingDelete(false);
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
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

            {/* Entity Table */}
            <GlassCard className="!p-0 border-white/10 overflow-hidden shadow-xl">
                <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-base font-semibold text-white font-inter">Partner Network</h3>
                    <div className="flex space-x-2">
                        <div className="flex bg-white/5 p-1 rounded-xl">
                            <button
                                onClick={() => setRoleFilter('all')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${roleFilter === 'all' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setRoleFilter('university')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${roleFilter === 'university' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                            >
                                Universities
                            </button>
                            <button
                                onClick={() => setRoleFilter('partner')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${roleFilter === 'partner' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                            >
                                Partners
                            </button>
                        </div>
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
                    {/* Desktop Table View */}
                    <table className="w-full text-left font-inter border-collapse min-w-[800px] hidden md:table">
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
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white font-poppins cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden" onClick={() => navigate(`/admin/university/${partner._id}`)}>
                                                {partner.profileImage ? (
                                                    <img src={getMediaUrl(partner.profileImage)} alt={partner.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    partner.name?.charAt(0)
                                                )}
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
                                                setOpenDelete(true);
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-red-500"
                                            title="Delete University"
                                        >
                                            <Trash2 size={18} />
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

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-white/5">
                        {filteredPartners.map((partner) => (
                            <div key={partner._id} className="p-4 space-y-4 hover:bg-white/5 transition-colors" onClick={() => navigate(`/admin/university/${partner._id}`)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white font-poppins shrink-0 overflow-hidden">
                                            {partner.profileImage ? (
                                                <img src={getMediaUrl(partner.profileImage)} alt={partner.name} className="w-full h-full object-cover" />
                                            ) : (
                                                partner.name?.charAt(0)
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-white truncate">{partner.name}</p>
                                            <p className="text-[10px] text-white/40 truncate">{partner.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${partner.role === 'university' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'
                                        }`}>
                                        {partner.role}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
                                    <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wide">
                                        <span className={`w-2 h-2 rounded-full ${partner.isVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                        <span className={partner.isVerified ? 'text-emerald-400' : 'text-amber-400'}>
                                            {partner.isVerified ? 'Active' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                        Discount: <span className="text-white">{partner.discountRate || 0}%</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-1 pt-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleManageCourses(partner);
                                        }}
                                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/60"
                                    >
                                        <BookOpen size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditPartner(partner);
                                        }}
                                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/60"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPartner(partner);
                                            setOpenDelete(true);
                                        }}
                                        className="p-2.5 bg-white/5 hover:bg-rose-500/10 rounded-xl transition-colors text-rose-500/60"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
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
                    <div className="h-[300px] w-full relative" style={{ minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={250} debounce={50}>
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

            {/* Manage Discount Dialog */}
            {openDiscount && (
                <div
                    className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
                    onClick={(e) => { if (e.target === e.currentTarget) setOpenDiscount(false); }}
                >
                    <div
                        className="w-full max-w-md bg-black/95 backdrop-blur-xl rounded-[24px] p-5 sm:p-6 border-2 border-primary/20 shadow-2xl my-8 max-h-[85vh] overflow-y-auto"
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

                            {editData.role === 'university' && (
                                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10 mt-4">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-white/90 text-sm font-semibold">National & Global Milestones</label>
                                        <button
                                            type="button"
                                            onClick={() => setEditData(prev => ({ 
                                                ...prev, 
                                                achievements: [...(prev.achievements || []), { title: '', desc: '' }] 
                                            }))}
                                            className="text-primary text-xs hover:text-white transition-colors flex items-center"
                                        >
                                            <Plus size={14} className="mr-1" /> Add Milestone
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {editData.achievements?.map((ach, index) => (
                                            <div key={index} className="flex gap-2 items-start relative">
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        type="text"
                                                        value={ach.title}
                                                        onChange={(e) => {
                                                            const newAch = [...(editData.achievements || [])];
                                                            newAch[index].title = e.target.value;
                                                            setEditData(prev => ({ ...prev, achievements: newAch }));
                                                        }}
                                                        placeholder="Milestone Title (e.g. Academic Excellence 2024)"
                                                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white"
                                                    />
                                                    <textarea
                                                        rows="2"
                                                        value={ach.desc}
                                                        onChange={(e) => {
                                                            const newAch = [...(editData.achievements || [])];
                                                            newAch[index].desc = e.target.value;
                                                            setEditData(prev => ({ ...prev, achievements: newAch }));
                                                        }}
                                                        placeholder="Milestone Description"
                                                        className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white resize-none"
                                                    />
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <input
                                                            type="text"
                                                            value={ach.image || ''}
                                                            onChange={(e) => {
                                                                const newAch = [...(editData.achievements || [])];
                                                                newAch[index].image = e.target.value;
                                                                setEditData(prev => ({ ...prev, achievements: newAch }));
                                                            }}
                                                            placeholder="Image URL (optional)"
                                                            className="flex-1 px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white"
                                                        />
                                                        <label className="cursor-pointer px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors">
                                                            Upload
                                                            <input 
                                                                type="file" 
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={async (e) => {
                                                                    if(e.target.files && e.target.files[0]) {
                                                                        const url = await handleMediaUpload(e.target.files[0]);
                                                                        if(url) {
                                                                            const newAch = [...(editData.achievements || [])];
                                                                            newAch[index].image = url;
                                                                            setEditData(prev => ({ ...prev, achievements: newAch }));
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newAch = [...(editData.achievements || [])];
                                                        newAch.splice(index, 1);
                                                        setEditData(prev => ({ ...prev, achievements: newAch }));
                                                    }}
                                                    className="p-1.5 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {(!editData.achievements || editData.achievements.length === 0) && (
                                            <p className="text-white/30 text-xs italic">No custom milestones added. Default milestones will be displayed.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {editData.role === 'university' && (
                                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10 mt-4">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-white/90 text-sm font-semibold">Success Stories (YouTube URLs)</label>
                                        <button
                                            type="button"
                                            onClick={() => setEditData(prev => ({ 
                                                ...prev, 
                                                videos: [...(prev.videos || []), ''] 
                                            }))}
                                            className="text-primary text-xs hover:text-white transition-colors flex items-center"
                                        >
                                            <Plus size={14} className="mr-1" /> Add Video
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {editData.videos?.map((vid, index) => (
                                            <div key={index} className="flex gap-2 items-center relative">
                                                <input
                                                    type="text"
                                                    value={vid}
                                                    onChange={(e) => {
                                                        const newVids = [...(editData.videos || [])];
                                                        newVids[index] = e.target.value;
                                                        setEditData(prev => ({ ...prev, videos: newVids }));
                                                    }}
                                                    placeholder="YouTube URL or Local Upload"
                                                    className="w-full px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white"
                                                />
                                                <label className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center" title="Upload from Device">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                    <input 
                                                        type="file" 
                                                        accept="video/*,image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            if(e.target.files && e.target.files[0]) {
                                                                const url = await handleMediaUpload(e.target.files[0]);
                                                                if(url) {
                                                                    const newVids = [...(editData.videos || [])];
                                                                    newVids[index] = url;
                                                                    setEditData(prev => ({ ...prev, videos: newVids }));
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newVids = editData.videos.filter((_, i) => i !== index);
                                                        setEditData(prev => ({ ...prev, videos: newVids }));
                                                    }}
                                                    className="p-2 text-white/50 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {(!editData.videos || editData.videos.length === 0) && (
                                            <p className="text-white/40 text-xs italic">No success stories added.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {editData.role === 'university' && (
                                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10 mt-4">
                                    <label className="block text-white/90 text-sm font-semibold">Gallery Images</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => setSelectedGalleryImages(Array.from(e.target.files))}
                                        className="block w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                    />
                                    {selectedGalleryImages.length > 0 && (
                                        <p className="text-xs text-white/50 mt-2">{selectedGalleryImages.length} file(s) selected for upload</p>
                                    )}
                                    {selectedPartner?.profile?.gallery?.length > 0 && (
                                        <p className="text-xs text-white/50 mt-1">{selectedPartner.profile.gallery.length} existing image(s) in gallery</p>
                                    )}
                                </div>
                            )}
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
                        className="w-full max-w-2xl bg-black/95 rounded-[24px] p-5 sm:p-6 border-2 border-primary/20 my-8 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-white font-inter mb-4">Edit Entity Profile</h3>
                        
                        <div className="flex space-x-2 mb-6 overflow-x-auto custom-scrollbar pb-2">
                            {['basic', 'details', 'media', 'achievements'].map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setEditModalTab(tab)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${editModalTab === tab ? 'bg-primary text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {editModalTab === 'basic' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="flex flex-col items-center mb-6 p-4 bg-white/5 rounded-2xl border border-white/10 relative group">
                                    <div
                                        className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-lg overflow-hidden relative cursor-pointer"
                                        onClick={() => logoInputRef.current?.click()}
                                    >
                                        {editData.profileImage ? (
                                            <img
                                                src={getMediaUrl(editData.profileImage)}
                                                alt={editData.name}
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
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Update Profile Logo</p>
                                    <div className="w-full mt-2 px-2">
                                        <input
                                            type="text"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30"
                                            placeholder="Or paste image URL"
                                            value={editData.profileImage}
                                            onChange={e => setEditData(prev => ({ ...prev, profileImage: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Entity Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.name}
                                            onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.email}
                                            onChange={e => setEditData(prev => ({ ...prev, email: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Role</label>
                                        <select
                                            className="w-full px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.role}
                                            onChange={e => setEditData(prev => ({ ...prev, role: e.target.value }))}
                                        >
                                            <option value="partner">Partner</option>
                                            <option value="university">University</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Discount Rate (%)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-primary"
                                            value={newRate}
                                            onChange={e => setNewRate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">New Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                        placeholder="Leave blank to keep current"
                                        value={editData.password}
                                        onChange={e => setEditData(prev => ({ ...prev, password: e.target.value }))}
                                    />
                                </div>
                            </div>
                        )}

                        {editModalTab === 'details' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Description / Bio</label>
                                    <textarea
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary h-24 resize-none"
                                        value={editData.bio}
                                        placeholder="Brief description..."
                                        onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Location</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.location}
                                            onChange={e => setEditData(prev => ({ ...prev, location: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Foundation Year</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.foundedYear}
                                            onChange={e => setEditData(prev => ({ ...prev, foundedYear: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Website</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.website}
                                            onChange={e => setEditData(prev => ({ ...prev, website: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Phone</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                            value={editData.phone}
                                            onChange={e => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {editModalTab === 'media' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Cover Image URL</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                        value={editData.coverImage}
                                        placeholder="https://..."
                                        onChange={e => setEditData(prev => ({ ...prev, coverImage: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">YouTube Video URL</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                                        value={editData.youtubeUrl}
                                        placeholder="https://youtube.com/..."
                                        onChange={e => setEditData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                                    />
                                </div>
                                
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <label className="block text-xs font-bold text-white/90 uppercase tracking-widest mb-2">Gallery Upload</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => setSelectedGalleryImages(Array.from(e.target.files))}
                                        className="block w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90"
                                    />
                                    {selectedGalleryImages.length > 0 && (
                                        <p className="text-xs text-white/50 mt-2">{selectedGalleryImages.length} file(s) selected</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {editModalTab === 'achievements' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Milestones & Achievements</label>
                                    <button 
                                        type="button"
                                        onClick={() => setEditData(prev => ({ ...prev, achievements: [...prev.achievements, { title: '', desc: '', image: '' }] }))}
                                        className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded hover:bg-primary/30 transition-colors flex items-center"
                                    >
                                        <Plus size={14} className="mr-1"/> Add New
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    {editData.achievements.map((ach, idx) => (
                                        <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newAch = [...editData.achievements];
                                                    newAch.splice(idx, 1);
                                                    setEditData(prev => ({ ...prev, achievements: newAch }));
                                                }}
                                                className="absolute top-3 right-3 text-white/30 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                            <div className="space-y-2 pr-6">
                                                <input 
                                                    type="text" 
                                                    placeholder="Title (e.g. 50+ Global Awards)"
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                                                    value={ach.title}
                                                    onChange={(e) => {
                                                        const newAch = [...editData.achievements];
                                                        newAch[idx].title = e.target.value;
                                                        setEditData(prev => ({ ...prev, achievements: newAch }));
                                                    }}
                                                />
                                                <textarea 
                                                    placeholder="Short Description"
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white h-16 resize-none"
                                                    value={ach.desc}
                                                    onChange={(e) => {
                                                        const newAch = [...editData.achievements];
                                                        newAch[idx].desc = e.target.value;
                                                        setEditData(prev => ({ ...prev, achievements: newAch }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {editData.achievements.length === 0 && (
                                        <div className="text-center py-6 text-white/30 text-sm italic">No achievements added.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-3 mt-8">
                            <button
                                onClick={() => setOpenEdit(false)}
                                className="flex-1 py-2.5 text-sm font-bold text-white/70 hover:bg-white/5 rounded-xl transition-colors border border-white/10"
                            >
                                Cancel
                            </button>
                            <ModernButton
                                onClick={handleUpdatePartner}
                                className="flex-1 !py-2.5 text-sm font-bold tracking-wide"
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
                    <GlassCard className="w-full max-w-sm bg-black/95 backdrop-blur-xl shadow-2xl relative z-[100000] border-white/20 my-8 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                    <GlassCard className="w-full max-w-2xl bg-black/95 border-white/20 my-8 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                        <GlassCard className="w-full max-w-md bg-black/95 border-white/20 my-8 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                        <GlassCard className="w-full max-w-md bg-black/95 border-white/20 my-8 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                        <GlassCard className="w-full max-w-md bg-black/95 border-white/20 my-8 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
            {/* Delete Confirmation Modal */}
            {openDelete && (
                <div className="fixed inset-0 z-[99999] flex items-start justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto" onClick={() => setOpenDelete(false)}>
                    <GlassCard className="w-full max-w-sm bg-black/95 border-red-500/20 my-auto shadow-2xl relative z-[100001]" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-white font-inter mb-2">Delete Institution?</h3>
                            <p className="text-sm text-white/60 mb-8 font-inter">
                                Are you sure you want to remove <span className="text-white font-bold">{selectedPartner?.name}</span>? This action cannot be undone if there are no dependencies.
                            </p>

                            <div className="flex w-full gap-3">
                                <button
                                    onClick={() => setOpenDelete(false)}
                                    className="flex-1 py-3 text-sm font-bold text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteUniversity}
                                    disabled={loadingDelete}
                                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                                >
                                    {loadingDelete ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div >
    );
};

export default UniversityManagement;
