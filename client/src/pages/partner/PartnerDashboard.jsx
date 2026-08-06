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
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Plus,
    XCircle,
    Trash2,
    School,
    GraduationCap,
    ChevronDown,
    X
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ModernButton from '../../components/ui/ModernButton';
import { useToast } from '../../context/ToastContext';

const PartnerDashboard = () => {
    const [stats, setStats] = useState({ totalCodes: 0, totalRedemptions: 0, totalEarnings: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [rejectingDoc, setRejectingDoc] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [discountCodes, setDiscountCodes] = useState([]);
    const [payoutRequests, setPayoutRequests] = useState([]);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [filterUniversity, setFilterUniversity] = useState('all');
    const [filterCourse, setFilterCourse] = useState('all');
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        partnerCode: '',
        selectedCourses: []
    });
    const [studentDocs, setStudentDocs] = useState([]);
    const [studentCerts, setStudentCerts] = useState([]);
    const [assetsLoading, setAssetsLoading] = useState(false);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const { showToast } = useToast();

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchStats = async () => {
        if (!userInfo) return;
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const [statsRes, studentsRes, discountsRes, payoutsRes, coursesRes] = await Promise.all([
                axios.get('/api/partner/stats', config),
                axios.get('/api/partner/students', config),
                axios.get('/api/partner/discounts', config),
                axios.get('/api/partner/payouts', config),
                axios.get('/api/courses')
            ]);

            setStats(statsRes.data || { totalCodes: 0, totalRedemptions: 0, totalEarnings: 0 });
            setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []); 
            setDiscountCodes(Array.isArray(discountsRes.data) ? discountsRes.data : []); 
            setPayoutRequests(Array.isArray(payoutsRes.data) && payoutsRes.data.length > 0 ? payoutsRes.data : []);
            setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching partner data:', error);
            setLoading(false);
        }
    };

    const myCourses = courses.filter(c => c.instructorId === userInfo?._id || c.instructor_id === userInfo?._id || c.instructorId === userInfo?.id || c.instructor_id === userInfo?.id);
    // Separate: true university courses vs other partner courses
    const universityCoursesList = courses.filter(c =>
        c.instructorId !== userInfo?._id && c.instructor_id !== userInfo?._id &&
        c.instructorId !== userInfo?.id && c.instructor_id !== userInfo?.id &&
        (c.universityName || c.instructorRole === 'university')
    );
    const otherPartnerCourses = courses.filter(c =>
        c.instructorId !== userInfo?._id && c.instructor_id !== userInfo?._id &&
        c.instructorId !== userInfo?.id && c.instructor_id !== userInfo?.id &&
        !c.universityName && c.instructorRole !== 'university'
    );
    // Combined for backward compat
    const universityCourses = [...universityCoursesList, ...otherPartnerCourses];

    // Unique providers for filter dropdown
    const uniqueProviders = [
        ...new Map(universityCourses.map(c => [
            c.instructorId || c.instructor_id,
            { id: c.instructorId || c.instructor_id, name: c.universityName || c.instructorName || 'Partner' }
        ])).values()
    ];

    const toggleCourseSelection = (courseId) => {
        if (!courseId) return;
        setRegisterData(prev => {
            const isSelected = prev.selectedCourses.includes(courseId);
            return {
                ...prev,
                selectedCourses: isSelected 
                    ? prev.selectedCourses.filter(id => id !== courseId)
                    : [...prev.selectedCourses, courseId]
            };
        });
    };

    const removeCourse = (courseId) => {
        setRegisterData(prev => ({
            ...prev,
            selectedCourses: prev.selectedCourses.filter(id => id !== courseId)
        }));
    };

    const getCourseTitle = (id) => {
        const course = courses.find(c => (c.id || c._id) === id);
        return course ? course.title : 'Unknown Course';
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast?.('Copied to clipboard!', 'success');
    };

    const filteredStudents = students.filter(student => {
        const name = student.name || '';
        const email = student.email || '';
        const sStatus = student.status || 'active';

        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || sStatus === filterStatus;

        // University/Partner filter
        const matchesUniversity = filterUniversity === 'all' ||
            student.university_id === filterUniversity ||
            (student.enrollments || []).some(e =>
                courses.find(c => (c.id || c._id) === e.course_id && (c.instructorId || c.instructor_id) === filterUniversity)
            );

        // Course filter
        const matchesCourse = filterCourse === 'all' ||
            (student.enrollments || []).some(e => e.course_id === filterCourse || e.course_title === filterCourse);

        return matchesSearch && matchesFilter && matchesUniversity && matchesCourse;
    });

    const totalDiscountSavings = students.reduce((sum, student) => sum + (student.discountSaved || 0), 0);
    const totalRevenue = students.reduce((sum, student) => sum + (student.totalSpent || 0), 0);

    const handleRequestPayout = () => {
        setPayoutAmount(stats.totalEarnings || '');
        setShowPayoutModal(true);
    };

    const submitPayoutRequest = async (e) => {
        e.preventDefault();
        const amt = Number(payoutAmount);
        if (!amt || isNaN(amt) || amt <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('/api/partner/payout', { amount: amt }, config);
            showToast('Payout request submitted successfully!', 'success');
            setShowPayoutModal(false);
            fetchStats();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to submit payout request.', 'error');
        }
    };

    const handleRegisterStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };
            const payload = {
                ...registerData,
                courses: registerData.selectedCourses
            };
            await axios.post('/api/partner/register-student', payload, config);
            alert(`Student ${registerData.name} registered and enrolled successfully!`);
            setShowRegisterModal(false);
            setRegisterData({ name: '', email: '', phone: '', password: '', partnerCode: '', selectedCourses: [] });
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm('Delete this student record? This cannot be undone.')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`/api/partner/students/${studentId}`, config);
            showToast('Student deleted successfully', 'success');
            fetchStats();
        } catch (error) {
            showToast(error.response?.data?.message || 'Delete failed', 'error');
        }
    };

    const fetchStudentAssets = async (student) => {
        setSelectedStudent(student);
        try {
            setAssetsLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const studentId = student._id || student.id;
            
            const [docsRes, certsRes] = await Promise.all([
                axios.get('/api/documents', { ...config, params: { student: studentId } }),
                axios.get('/api/certificates/admin/all', { ...config, params: { studentId } })
            ]);
            
            setStudentDocs(docsRes.data);
            setStudentCerts(certsRes.data);
        } catch (error) {
            console.error('Error fetching student assets:', error);
            showToast('Failed to fetch student documents/certificates', 'error');
        } finally {
            setAssetsLoading(false);
        }
    };

    const handleDocumentReview = async (id, status, reason = '') => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/documents/${id}/review`, { status, rejectionReason: reason }, config);
            showToast(`Document ${status} successfully!`, 'success');
            // Refresh
            if (selectedStudent) fetchStudentAssets(selectedStudent);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to review document', 'error');
        }
    };

    const handlePartnerCertUpload = async (certId, file) => {
        if (!file) return;
        try {
            const config = { 
                headers: { 
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                } 
            };
            const formData = new FormData();
            formData.append('certificate', file);
            await axios.post(`/api/certificates/${certId}/upload`, formData, config);
            showToast('Certificate PDF uploaded and issued successfully!', 'success');
            if (selectedStudent) fetchStudentAssets(selectedStudent);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to upload certificate', 'error');
        }
    };

    const handlePartnerCertStatus = async (certId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/certificates/${certId}/status`, { status }, config);
            showToast(`Certificate status updated to ${status}!`, 'success');
            if (selectedStudent) fetchStudentAssets(selectedStudent);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update status', 'error');
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
        <div className="partner-dashboard-wrapper space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
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

                {/* Tabs */}
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

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview" className="space-y-8">
                        <div className="flex flex-wrap gap-3 w-full">
                            {[
                                { label: 'Affiliated Students', val: students.length, icon: Users, color: 'primary', status: 'Active' },
                                { label: 'Total Revenue', val: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
                                { label: 'Discount Rate', val: '15%', icon: Percent, color: 'amber' },
                                { label: 'Discount Savings', val: `₹${totalDiscountSavings.toLocaleString()}`, icon: Coins, color: 'purple' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex-1 min-w-[200px] sm:min-w-[220px]"
                                >
                                    <GlassCard className="py-1.5 px-3 bg-slate-900/10 flex items-center justify-between gap-2 border border-white/5 rounded-md hover:border-white/10 transition-all w-full h-full">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1 bg-${stat.color === 'primary' ? 'primary/10 text-primary' : stat.color === 'emerald' ? 'emerald-500/10 text-emerald-400' : stat.color === 'amber' ? 'amber-500/10 text-amber-400' : 'purple-500/10 text-purple-400'} rounded shrink-0`}>
                                                <stat.icon size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 uppercase font-bold tracking-wider text-[9px] leading-tight">{stat.label}</span>
                                                <span className="font-extrabold text-white text-[13px] mt-0.5">{stat.val}</span>
                                            </div>
                                        </div>
                                        {stat.status && (
                                            <span className="text-[8px] font-bold text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded shrink-0 bg-emerald-500/10">{stat.status}</span>
                                        )}
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>

                        <GlassCard className="text-left">
                            <h2 className="text-base font-bold text-white font-poppins mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4">
                                <button
                                    onClick={() => copyToClipboard(`${window.location.origin}/register?partner=${discountCodes[0]?.code || 'PARTNER'}`)}
                                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all text-left group"
                                >
                                    <Link size={20} className="text-primary mb-3" />
                                    <h3 className="font-bold text-white mb-1">Generate Enrollment Link</h3>
                                    <p className="text-xs text-white/50">Create auto-discount links</p>
                                </button>
                                <button
                                    onClick={() => setActiveTab('students')}
                                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all text-left group"
                                >
                                    <Users size={20} className="text-emerald-500 mb-3" />
                                    <h3 className="font-bold text-white mb-1">View Students</h3>
                                    <p className="text-xs text-white/50">Manage student profiles</p>
                                </button>
                                <button
                                    onClick={handleRequestPayout}
                                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all text-left group"
                                >
                                    <Wallet size={20} className="text-amber-500 mb-3" />
                                    <h3 className="font-bold text-white mb-1">Request Payout</h3>
                                    <p className="text-xs text-white/50">Withdraw earnings</p>
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'students' && (
                    <motion.div key="students" className="space-y-6">
                        <GlassCard>
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex-1 relative">
                                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <ModernButton onClick={() => setShowRegisterModal(true)}>
                                        <Plus size={18} className="mr-2" /> Register Student
                                    </ModernButton>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-4 py-3 bg-[#0B0F1A] border border-white/10 rounded-xl text-white outline-none"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    {/* University / Partner Filter */}
                                    <select
                                        value={filterUniversity}
                                        onChange={(e) => { setFilterUniversity(e.target.value); setFilterCourse('all'); }}
                                        className="px-4 py-3 bg-[#0B0F1A] border border-white/10 rounded-xl text-white text-xs outline-none"
                                    >
                                        <option value="all">All Providers</option>
                                        {uniqueProviders.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    {/* Course Filter */}
                                    <select
                                        value={filterCourse}
                                        onChange={(e) => setFilterCourse(e.target.value)}
                                        className="px-4 py-3 bg-[#0B0F1A] border border-white/10 rounded-xl text-white text-xs outline-none"
                                    >
                                        <option value="all">All Courses</option>
                                        {courses
                                            .filter(c => filterUniversity === 'all' || (c.instructorId || c.instructor_id) === filterUniversity)
                                            .map(c => (
                                                <option key={c.id || c._id} value={c.id || c._id}>{c.title}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Register Student Modal */}
                        {showRegisterModal && (
                            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
                                <GlassCard className="w-full max-w-2xl shadow-2xl border-primary/20 bg-[#0B0F1A] my-8 p-6 text-left">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-white font-poppins">Register & Enroll Student</h3>
                                        <button onClick={() => setShowRegisterModal(false)} className="text-white/30 hover:text-white transition-colors">
                                            <XCircle size={20} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleRegisterStudent} className="space-y-4">
                                        {/* Student Details Section */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-1">Student Details</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-primary outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                                                        value={registerData.name}
                                                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        required
                                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-primary outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                                                        value={registerData.email}
                                                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Phone</label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-primary outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                                                        value={registerData.phone}
                                                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Password</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-primary outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                                                        value={registerData.password}
                                                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Partner Code</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-primary outline-none focus:ring-1 focus:ring-primary/30 transition-all uppercase"
                                                        value={registerData.partnerCode}
                                                        onChange={(e) => setRegisterData({ ...registerData, partnerCode: e.target.value.toUpperCase() })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Course Assignment Section */}
                                        <div className="space-y-3 pt-4 border-t border-white/5">
                                            <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-1">Course Assignment</h4>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {/* My Courses Dropdown */}
                                                <div>
                                                    <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 flex items-center">
                                                        <GraduationCap size={12} className="mr-1.5 text-primary" /> Select My Courses
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full pl-3 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-[11px] appearance-none focus:border-primary outline-none cursor-pointer focus:ring-1 focus:ring-primary/30 transition-all"
                                                            onChange={(e) => toggleCourseSelection(e.target.value)}
                                                            value=""
                                                        >
                                                            <option value="" className="bg-[#0B0F1A]">-- Choose from My Courses --</option>
                                                            {myCourses.map(c => (
                                                                <option key={c.id || c._id} value={c.id || c._id} className="bg-[#0B0F1A]">
                                                                    {c.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                                                    </div>
                                                </div>

                                                {/* University Courses Dropdown */}
                                                <div>
                                                    <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 flex items-center">
                                                        <School size={12} className="mr-1.5 text-emerald-400" /> Select University / Partner Courses
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full pl-3 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-[11px] appearance-none focus:border-primary outline-none cursor-pointer focus:ring-1 focus:ring-primary/30 transition-all"
                                                            onChange={(e) => toggleCourseSelection(e.target.value)}
                                                            value=""
                                                        >
                                                            <option value="" className="bg-[#0B0F1A]">-- Choose from Other Providers --</option>
                                                            {universityCoursesList.length > 0 && (
                                                                <optgroup label="🏫 Universities">
                                                                    {universityCoursesList.map(c => (
                                                                        <option key={c.id || c._id} value={c.id || c._id} className="bg-[#0B0F1A]">
                                                                            {c.title} ({c.universityName || 'University'})
                                                                        </option>
                                                                    ))}
                                                                </optgroup>
                                                            )}
                                                            {otherPartnerCourses.length > 0 && (
                                                                <optgroup label="🤝 Other Partners">
                                                                    {otherPartnerCourses.map(c => (
                                                                        <option key={c.id || c._id} value={c.id || c._id} className="bg-[#0B0F1A]">
                                                                            {c.title} ({c.instructorName || 'Partner'})
                                                                        </option>
                                                                    ))}
                                                                </optgroup>
                                                            )}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                                                    </div>
                                                </div>

                                                {/* Selected Courses Display */}
                                                <div className="sm:col-span-2">
                                                    <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Selected Assignments ({registerData.selectedCourses.length})</label>
                                                    <div className="flex flex-wrap gap-1.5 p-2 bg-white/[0.02] border border-white/5 rounded-xl min-h-[50px]">
                                                        {registerData.selectedCourses.length > 0 ? registerData.selectedCourses.map(id => (
                                                            <div 
                                                                key={id}
                                                                className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/20 border border-primary/30 rounded-lg text-[9px] text-white animate-in zoom-in duration-200"
                                                            >
                                                                <span className="font-bold truncate max-w-[180px]">{getCourseTitle(id)}</span>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => removeCourse(id)}
                                                                    className="hover:text-red-400 transition-colors"
                                                                >
                                                                    <X size={10} />
                                                                </button>
                                                            </div>
                                                        )) : (
                                                            <p className="text-[9px] text-white/20 italic p-0.5">No courses selected yet.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                                            <button 
                                                onClick={() => setShowRegisterModal(false)} 
                                                type="button" 
                                                className="px-5 py-2 text-xs font-bold text-white/40 hover:text-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <ModernButton type="submit" className="px-6 py-2 text-xs font-bold" disabled={loading}>
                                                Register & Enroll
                                            </ModernButton>
                                        </div>
                                    </form>
                                </GlassCard>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {filteredStudents.map((s) => (
                                <GlassCard key={s.id || s._id} className="text-left py-4 px-6 hover:border-primary/30 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">
                                                {s.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{s.name}</p>
                                                <p className="text-xs text-white/40">{s.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-white">
                                                    {Array.isArray(s.enrollments) ? s.enrollments.length : 0} Courses
                                                </p>
                                                {Array.isArray(s.enrollments) && s.enrollments.length > 0 && (
                                                    <p className="text-[9px] text-white/30 max-w-[200px] truncate text-right">
                                                        {s.enrollments.map(e => e.course_title).filter(Boolean).join(', ')}
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-emerald-400">₹{s.discountSaved || 0} saved</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => fetchStudentAssets(s)} className="p-2 bg-white/5 rounded-lg text-white/50 hover:text-primary transition-all"><Eye size={18} /></button>
                                                <button onClick={() => handleDeleteStudent(s.id || s._id)} className="p-2 bg-white/5 rounded-lg text-white/50 hover:text-red-500"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'codes' && (
                    <motion.div key="codes" className="space-y-6">
                        <GlassCard className="text-left">
                            <h2 className="text-base font-bold text-white mb-6">Affiliation Codes</h2>
                            <div className="grid gap-4">
                                {discountCodes.map((c, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                                        <div>
                                            <p className="text-lg font-bold text-white">{c.code}</p>
                                            <p className="text-xs text-white/40">{c.value}% discount</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-white">{c.usedCount || 0} uses</p>
                                            <p className="text-[10px] text-emerald-400">Active</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'payouts' && (
                    <motion.div key="payouts" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <GlassCard className="bg-emerald-500/10 border-emerald-500/20 text-left">
                                <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mb-1">Available for Withdrawal</p>
                                <p className="text-3xl font-bold text-white mb-6">₹{stats.totalEarnings?.toLocaleString()}</p>
                                <ModernButton onClick={handleRequestPayout} className="w-full shadow-lg shadow-emerald-500/20">
                                    Withdraw Now
                                </ModernButton>
                            </GlassCard>

                            <GlassCard className="text-left flex flex-col justify-center">
                                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Lifetime Earnings</p>
                                <p className="text-2xl font-bold text-white">₹{stats.lifetimeEarnings?.toLocaleString() || 0}</p>
                                <div className="h-1 w-12 bg-primary/40 rounded-full mt-3"></div>
                            </GlassCard>

                            <GlassCard className="text-left flex flex-col justify-center">
                                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Total Paid Out</p>
                                <p className="text-2xl font-bold text-white">₹{stats.totalPayouts?.toLocaleString() || 0}</p>
                                <div className="h-1 w-12 bg-amber-500/40 rounded-full mt-3"></div>
                            </GlassCard>
                        </div>

                        {/* Payout History Table (Optional but good) */}
                        <GlassCard className="text-left">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-white">Payout History</h3>
                                <div className="p-2 bg-white/5 rounded-lg text-white/40">
                                    <History size={18} />
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5">
                                            <th className="pb-4 text-left">Request ID</th>
                                            <th className="pb-4 text-left">Date</th>
                                            <th className="pb-4 text-left">Amount</th>
                                            <th className="pb-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {payoutRequests.length > 0 ? payoutRequests.map((req) => (
                                            <tr key={req.id || req._id} className="group hover:bg-white/[0.02] transition-all">
                                                <td className="py-4 font-mono text-[10px] text-white/40">{req.id || req._id}</td>
                                                <td className="py-4 text-xs text-white/60">{new Date(req.created_at).toLocaleDateString()}</td>
                                                <td className="py-4 text-sm font-bold text-white">₹{req.amount?.toLocaleString()}</td>
                                                <td className="py-4">
                                                    <div className="flex justify-center">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                                            req.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                            req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                                        }`}>
                                                            {req.status}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="py-12 text-center">
                                                    <p className="text-xs text-white/20 font-bold uppercase tracking-widest">No payout history found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Student Asset Modal */}
            <AnimatePresence>
                {selectedStudent && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedStudent(null)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0B0F1A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-2xl font-bold text-white">{selectedStudent.name}</h3>
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded border border-primary/20">Student Portal</span>
                                    </div>
                                    <p className="text-sm text-white/40 flex items-center gap-4">
                                        <span className="flex items-center gap-1.5"><Mail size={14} /> {selectedStudent.email}</span>
                                        <span className="text-white/10">|</span>
                                        <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> ID: {selectedStudent._id || selectedStudent.id}</span>
                                    </p>
                                </div>
                                <button onClick={() => setSelectedStudent(null)} className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                                {assetsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                                        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Synchronizing Assets...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        {/* Documents Section */}
                                        <section>
                                            <h4 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                <div className="h-px flex-1 bg-white/5"></div>
                                                Student Documents
                                                <div className="h-px flex-1 bg-white/5"></div>
                                            </h4>
                                            {studentDocs.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {studentDocs.map((doc) => (
                                                        <GlassCard key={doc.id || doc._id} className="p-5 border-white/5 hover:border-primary/20 transition-all group">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                                                                    <FileText size={20} />
                                                                </div>
                                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                                    doc.status === 'submitted' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                                                                    doc.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-red-500/10 text-red-400 border border-red-500/10'
                                                                }`}>
                                                                    {doc.status}
                                                                </span>
                                                            </div>
                                                            <h5 className="font-bold text-white text-sm mb-1 truncate">{doc.title}</h5>
                                                            <p className="text-[10px] text-white/30 uppercase font-black mb-6">{doc.type} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => window.open(`/${doc.fileUrl}`, '_blank')}
                                                                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <Eye size={14} /> View
                                                                </button>
                                                                {doc.status === 'submitted' && (
                                                                    <div className="flex flex-[2] gap-1.5">
                                                                        <button 
                                                                            onClick={() => handleDocumentReview(doc.id || doc._id, 'approved')}
                                                                            className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl text-[10px] font-bold transition-all"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => {
                                                                                setRejectingDoc(doc);
                                                                                setRejectionReason('');
                                                                            }}
                                                                            className="flex-1 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl text-[10px] font-bold transition-all"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </GlassCard>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-12 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                                                    <FileText size={40} className="mx-auto mb-3 text-white/5" />
                                                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No Documents Found</p>
                                                </div>
                                            )}
                                        </section>

                                        {/* Certificates Section */}
                                        <section>
                                            <h4 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                <div className="h-px flex-1 bg-white/5"></div>
                                                Earned Certificates
                                                <div className="h-px flex-1 bg-white/5"></div>
                                            </h4>
                                            {studentCerts.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {studentCerts.map((req) => (
                                                        <GlassCard key={req.id} className="p-5 border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                                                            <div className="flex items-center gap-4 mb-6">
                                                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                                    <GraduationCap size={24} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h5 className="font-bold text-white text-sm truncate">{req.course_title}</h5>
                                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                                        req.status === 'ISSUED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                                                    }`}>
                                                                        {req.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2 mb-6">
                                                                <div className="flex justify-between text-[10px] font-black">
                                                                    <span className="text-white/20 uppercase tracking-widest">Issue Date</span>
                                                                    <span className="text-white/60">{new Date(req.apply_date).toLocaleDateString()}</span>
                                                                </div>
                                                                <div className="flex justify-between text-[10px] font-black">
                                                                    <span className="text-white/20 uppercase tracking-widest">Institution</span>
                                                                    <span className="text-white/60 truncate ml-6">{req.university_name}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                {req.status === 'ISSUED' && req.file_url && (
                                                                    <button 
                                                                        onClick={() => window.open(req.file_url, '_blank')}
                                                                        className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        <Eye size={15} /> View Issued Certificate
                                                                    </button>
                                                                )}
                                                                
                                                                <div className="flex gap-2">
                                                                    <label className="flex-1 py-2.5 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all border border-primary/30 flex items-center justify-center gap-1.5 cursor-pointer">
                                                                        <Upload size={14} /> {req.status === 'ISSUED' ? 'Re-upload PDF' : 'Upload PDF'}
                                                                        <input 
                                                                            type="file" 
                                                                            accept=".pdf,.png,.jpg,.jpeg" 
                                                                            className="hidden" 
                                                                            onChange={(e) => handlePartnerCertUpload(req.id, e.target.files[0])} 
                                                                        />
                                                                    </label>
                                                                    {req.status === 'PENDING' && (
                                                                        <button 
                                                                            onClick={() => handlePartnerCertStatus(req.id, 'APPROVED')}
                                                                            className="px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-emerald-500/20"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </GlassCard>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-12 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                                                    <Award size={40} className="mx-auto mb-3 text-white/5" />
                                                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No Certificates Issued</p>
                                                </div>
                                            )}
                                        </section>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Document Rejection Reason Modal */}
            <AnimatePresence>
                {rejectingDoc && (
                    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setRejectingDoc(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="relative w-full max-w-md bg-[#0B0F1A] border border-rose-500/20 rounded-2xl p-6 shadow-2xl space-y-5"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Reject Document</h3>
                                    <p className="text-xs text-white/50 mt-1">
                                        Specify rejection reason for <span className="text-white font-medium">{rejectingDoc.title || rejectingDoc.type || 'this document'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Rejection Reason</label>
                                <textarea 
                                    rows={3}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="e.g. Document image is blurry or expired. Please upload a clear copy."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-rose-500/50 transition-all resize-none"
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setRejectingDoc(null)}
                                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!rejectionReason.trim()) {
                                            showToast('Please enter a reason for rejection', 'error');
                                            return;
                                        }
                                        await handleDocumentReview(rejectingDoc.id || rejectingDoc._id, 'rejected', rejectionReason);
                                        setRejectingDoc(null);
                                    }}
                                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-500/20"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Payout Request Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
                    <GlassCard className="w-full max-w-md shadow-2xl border-primary/20 bg-[#0B0F1A] p-6 text-left">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                                    <Wallet size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white font-poppins">Request Payout</h3>
                            </div>
                            <button onClick={() => setShowPayoutModal(false)} className="text-white/30 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={submitPayoutRequest} className="space-y-5">
                            <div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                                    <span className="text-white/40">Amount to Withdraw</span>
                                    <span className="text-amber-400 cursor-pointer hover:underline animate-pulse" onClick={() => setPayoutAmount(stats.totalEarnings || '')}>
                                        Available: ₹{stats.totalEarnings?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm font-bold">₹</span>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max={stats.totalEarnings}
                                        step="any"
                                        className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        value={payoutAmount}
                                        onChange={(e) => setPayoutAmount(e.target.value)}
                                        placeholder="Enter amount"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                                <button 
                                    onClick={() => setShowPayoutModal(false)} 
                                    type="button" 
                                    className="px-4 py-2 text-xs font-bold text-white/40 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <ModernButton 
                                    type="submit" 
                                    className="px-6 py-2 text-xs font-bold"
                                >
                                    Submit Request
                                </ModernButton>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default PartnerDashboard;
