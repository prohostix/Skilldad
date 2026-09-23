import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit3,
    Trash2,
    ExternalLink,
    BookOpen,
    X,
    Upload,
    Image,
    Clock,
    CheckCircle2,
    AlertCircle,
    Filter,
    Star,
    Sparkles
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { getMediaUrl } from '../../utils/media';
import ModernButton from '../../components/ui/ModernButton';
import DashboardHeading from '../../components/ui/DashboardHeading';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

const CourseManager = ({ wblOnly = false }) => {
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [providerFilter, setProviderFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: 0,
        instructorId: '',
        instructorName: '',
        universityName: '',
        isPublished: false,
        isFeatured: false,
        brochure_url: '',
        thumbnail: '',
        university_tools: [],
        features: [],
        learning_outcomes: [],
        programType: 'course',
        skillDadUniversityId: '',
        displayOrder: 999
    });
    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const [brochureUploading, setBrochureUploading] = useState(false);
    const thumbnailInputRef = React.useRef(null);
    const brochureInputRef = React.useRef(null);
    const [universities, setUniversities] = useState([]);
    const [skillDadUniversities, setSkillDadUniversities] = useState([]);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const fetchUniversities = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/admin/universities', config);
            setUniversities(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSkillDadUniversities = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/admin/skilldad-universities', config);
            setSkillDadUniversities(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCourses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/courses/admin', config);
            setCourses(data);
        } catch (error) {
            console.error(error);
            showToast('Failed to fetch courses', 'error');
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchUniversities();
        fetchSkillDadUniversities();
    }, []);

    const handleCreate = (defaultProgramType) => {
        setFormData({
            title: '',
            description: '',
            category: '',
            price: 0,
            instructorId: '',
            instructorName: '',
            universityName: '',
            isPublished: false,
            isFeatured: false,
            brochure_url: '',
            thumbnail: '',
            university_tools: [],
            features: [],
            learning_outcomes: [],
            programType: defaultProgramType || (wblOnly ? 'wbl_domestic' : 'course'),
            skillDadUniversityId: '',
            displayOrder: 999,
            minSalary: '',
            jobsAvailable: ''
        });
        setEditingCourse(null);
        setShowCreateModal(true);
    };

    const handleEdit = (course) => {
        setFormData({
            title: course.title,
            description: course.description,
            category: course.category,
            price: course.price,
            instructorId: course.instructor_id || course.instructorId || '',
            instructorName: course.instructorName || course.instructor?.name || '',
            universityName: course.universityName || course.instructor?.profile?.universityName || '',
            isPublished: course.isPublished || false,
            isFeatured: course.isFeatured || false,
            brochure_url: course.brochure_url || '',
            thumbnail: course.thumbnail || '',
            university_tools: course.university_tools || [],
            features: course.features || [],
            learning_outcomes: course.learning_outcomes || [],
            programType: course.programType || course.program_type || (wblOnly ? 'wbl_domestic' : 'course'),
            skillDadUniversityId: course.skillDadUniversityId || course.skill_dad_university_id || '',
            displayOrder: course.displayOrder !== undefined ? course.displayOrder : (course.display_order !== undefined ? course.display_order : 999),
            minSalary: course.minSalary || course.min_salary || '',
            jobsAvailable: course.jobsAvailable || course.jobs_available || ''
        });
        setEditingCourse(course);
        setShowCreateModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (editingCourse) {
                await axios.put(`/api/courses/${editingCourse._id}`, formData, config);
                showToast('Course updated successfully!', 'success');
            } else {
                await axios.post('/api/courses', formData, config);
                showToast('Course created successfully!', 'success');
            }

            setShowCreateModal(false);
            fetchCourses();
        } catch (error) {
            console.error('Error saving course:', error);
            showToast(error.response?.data?.message || error.message, 'error');
        }
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('thumbnail', file);

        setThumbnailUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            
            if (!editingCourse) {
                showToast('Please save the course first before uploading a thumbnail, or provide a direct URL.', 'info');
                setThumbnailUploading(false);
                return;
            }

            const { data } = await axios.post(`/api/courses/${editingCourse._id}/upload-thumbnail`, formDataUpload, config);
            setFormData(prev => ({ ...prev, thumbnail: data.thumbnail }));
            showToast('Thumbnail uploaded successfully!', 'success');
        } catch (error) {
            console.error('Thumbnail upload error:', error);
            showToast('Failed to upload thumbnail', 'error');
        } finally {
            setThumbnailUploading(false);
        }
    };

    const handleBrochureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('brochure', file);

        setBrochureUploading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            const { data } = await axios.post('/api/courses/upload-brochure-file', formDataUpload, config);
            setFormData(prev => ({ ...prev, brochure_url: data.brochure_url }));
            showToast('Brochure uploaded successfully!', 'success');
        } catch (error) {
            console.error('Brochure upload error:', error);
            showToast('Failed to upload brochure', 'error');
        } finally {
            setBrochureUploading(false);
        }
    };

    const handleDelete = async (id) => {
        const course = courses.find(c => c._id === id);
        setCourseToDelete(course || { _id: id });
    };

    const confirmDeleteCourse = async () => {
        if (!courseToDelete) return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.delete(`/api/courses/${courseToDelete._id}`, config);
            showToast('Course deleted', 'success');
            fetchCourses();
        } catch (error) {
            showToast('Error deleting course', 'error');
        } finally {
            setCourseToDelete(null);
        }
    };

    const handleStatusUpdate = async (id, status, isPublished) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`/api/courses/${id}/approve`, { status, isPublished }, config);
            showToast(`Course ${status} successfully!`, 'success');
            fetchCourses();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error updating status', 'error');
        }
    };

    const handleToggleFeatured = async (course) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' } };
            const nextFeaturedState = !(course.isFeatured || course.is_featured);
            await axios.put(`/api/courses/${course._id}`, { ...course, isFeatured: nextFeaturedState }, config);
            showToast(nextFeaturedState ? `"${course.title}" marked as Featured!` : `Featured badge removed from "${course.title}".`, 'success');
            fetchCourses();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error updating featured status', 'error');
        }
    };

    const baseCoursesForCounts = courses.filter(course => {
        const isWblCourse = (course.programType || course.program_type) === 'wbl_domestic' || (course.programType || course.program_type) === 'wbl_abroad';
        return wblOnly ? isWblCourse : !isWblCourse;
    });

    const pendingCount = baseCoursesForCounts.filter(c => c.status === 'pending').length;
    const approvedCount = baseCoursesForCounts.filter(c => c.status === 'approved' || (!c.status && c.isPublished)).length;
    const rejectedCount = baseCoursesForCounts.filter(c => c.status === 'rejected').length;

    // Same fallback chain the table uses to display the provider name, so the
    // filter dropdown and what's shown in each row always agree.
    const getProviderName = (course) =>
        course.universityName || course.instructor?.profile?.universityName || course.instructorName || course.instructor?.name || '';

    const providerOptions = Array.from(
        new Set(courses.map(getProviderName).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    const filteredCourses = courses.filter(course => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.instructorName || course.instructor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.universityName || course.instructor?.profile?.universityName || '').toLowerCase().includes(searchQuery.toLowerCase());

        const cStatus = (course.status || 'approved').toLowerCase();
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'pending' && cStatus === 'pending') ||
            (statusFilter === 'approved' && cStatus === 'approved') ||
            (statusFilter === 'rejected' && cStatus === 'rejected');

        const matchesProvider =
            providerFilter === 'all' || getProviderName(course) === providerFilter;

        const isWblCourse = (course.programType || course.program_type) === 'wbl_domestic' || (course.programType || course.program_type) === 'wbl_abroad';
        const matchesWblOnly = wblOnly ? isWblCourse : !isWblCourse;

        return matchesSearch && matchesStatus && matchesProvider && matchesWblOnly;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-left">
                    <DashboardHeading title={wblOnly ? "WBL Management" : "Course Library"} />
                </div>
                {wblOnly ? (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <ModernButton onClick={() => handleCreate('degree_programme')} className="w-full sm:w-auto !px-3.5 !py-2 text-xs font-semibold">
                            <Plus size={15} className="mr-1.5" /> Add Domestic Course
                        </ModernButton>
                        <ModernButton onClick={() => handleCreate('wbl_abroad')} className="w-full sm:w-auto !px-3.5 !py-2 text-xs font-semibold">
                            <Plus size={15} className="mr-1.5" /> Add Study Abroad
                        </ModernButton>
                    </div>
                ) : (
                    <ModernButton onClick={() => handleCreate('course')} className="w-full sm:w-auto !px-3.5 !py-2 text-xs font-semibold">
                        <Plus size={15} className="mr-1.5" /> Create New Course
                    </ModernButton>
                )}
            </div>

            <GlassCard className="!p-0 overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-sm">
                <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-white/10 space-y-2.5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Tab Pills without ugly scrollbars */}
                        <div className="flex bg-slate-100/90 dark:bg-white/5 p-1 rounded-xl border border-slate-200/80 dark:border-white/10 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full md:w-auto shrink-0">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                                    statusFilter === 'all'
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                All ({baseCoursesForCounts.length})
                            </button>

                            <button
                                onClick={() => setStatusFilter('pending')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                    statusFilter === 'pending'
                                        ? 'bg-amber-500 text-black shadow-sm font-bold'
                                        : 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
                                }`}
                            >
                                <Clock size={13} className={pendingCount > 0 ? "animate-pulse" : ""} />
                                Pending
                                {pendingCount > 0 ? (
                                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-bold animate-pulse">
                                        {pendingCount}
                                    </span>
                                ) : (
                                    <span className="text-[10px] opacity-70">(0)</span>
                                )}
                            </button>

                            <button
                                onClick={() => setStatusFilter('approved')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                                    statusFilter === 'approved'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Approved ({approvedCount})
                            </button>

                            <button
                                onClick={() => setStatusFilter('rejected')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                                    statusFilter === 'rejected'
                                        ? 'bg-rose-600 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Rejected ({rejectedCount})
                            </button>
                        </div>

                        {/* Search and Provider Filter */}
                        <div className="flex items-center gap-2.5 w-full md:flex-1 md:max-w-md ml-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" size={14} />
                                <input
                                    type="text"
                                    placeholder="Filter courses..."
                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 text-xs font-inter"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div
                                className={`relative w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 ${providerFilter !== 'all' ? 'ring-2 ring-primary/50' : ''}`}
                                title={providerFilter !== 'all' ? `Filtered by: ${providerFilter}` : 'Filter by university or partner'}
                            >
                                <Filter className="text-slate-400 dark:text-white/40 pointer-events-none" size={13} />
                                <select
                                    aria-label="Filter by university or partner"
                                    value={providerFilter}
                                    onChange={(e) => setProviderFilter(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                >
                                    <option value="all" className="bg-white dark:bg-[#0B071A] text-slate-900 dark:text-white">All Providers</option>
                                    {providerOptions.map((name) => (
                                        <option key={name} value={name} className="bg-white dark:bg-[#0B071A] text-slate-900 dark:text-white">{name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="text-[11px] font-medium text-slate-500 dark:text-white/40">
                        Displaying <span className="font-semibold text-slate-700 dark:text-white/70">{filteredCourses.length}</span> courses
                    </div>
                </div>

                <div className="overflow-x-auto [scrollbar-width:thin]">
                    <table className="w-full text-left font-inter text-xs">
                        <thead className="bg-slate-50/90 dark:bg-white/[0.04] text-slate-500 dark:text-white/60 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-white/10">
                            <tr>
                                <th className="px-3.5 py-2.5 w-[38%]">Course Info</th>
                                <th className="px-3.5 py-2.5 w-[22%]">Instructor / Institution</th>
                                <th className="px-3.5 py-2.5 w-[10%]">Price</th>
                                <th className="px-3.5 py-2.5 w-[10%]">Status</th>
                                <th className="px-3.5 py-2.5 w-[10%]">Approval</th>
                                <th className="px-3.5 py-2.5 text-right w-[10%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
                            {filteredCourses.map((course) => (
                                <tr key={course._id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-3.5 py-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                                                {course.thumbnail ? (
                                                    <img src={getMediaUrl(course.thumbnail)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <BookOpen size={16} />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-primary transition-colors" title={course.title}>
                                                    {course.title}
                                                </p>
                                                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                                    <span className="text-[11px] text-slate-500 dark:text-white/40">
                                                        ID: {course._id.slice(-6).toUpperCase()} • Order: {course.displayOrder ?? course.display_order ?? 999}
                                                    </span>
                                                    {(course.programType || course.program_type) === 'degree_programme' && (
                                                        <span className="inline-flex items-center px-1.5 py-0.2 bg-primary/15 text-primary dark:text-primary-light rounded text-[9px] font-bold uppercase tracking-tight">
                                                            Degree Programme
                                                        </span>
                                                    )}
                                                    {((course.programType || course.program_type) === 'wbl_abroad' || (course.programType || course.program_type) === 'wbl_domestic') && (
                                                        <span className="inline-flex items-center px-1.5 py-0.2 bg-sky-500/15 text-sky-600 dark:text-sky-400 rounded text-[9px] font-bold uppercase tracking-tight">
                                                            Study Abroad
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3.5 py-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 overflow-hidden shrink-0">
                                                <img src={`https://ui-avatars.com/api/?name=${course.instructorName || course.instructor?.name || 'U'}&size=48&background=6D28D9&color=fff&bold=true`} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col min-w-0 leading-tight">
                                                <span className="text-xs text-slate-800 dark:text-white/80 font-semibold truncate">
                                                    {course.instructorName || course.instructor?.name || 'Unknown'}
                                                </span>
                                                {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) ? (
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wide truncate mt-0.5" title={course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}>
                                                        {course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 dark:text-white/30 italic mt-0.5">
                                                        No Institution Linked
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3.5 py-2 whitespace-nowrap">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">₹{course.price}</span>
                                    </td>
                                    <td className="px-3.5 py-2 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                            <span className={`text-[11px] font-semibold ${course.isPublished ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3.5 py-2 whitespace-nowrap">
                                        {course.status === 'pending' ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleStatusUpdate(course._id, 'approved', true)}
                                                    className="px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(course._id, 'rejected', false)}
                                                    className="px-2 py-0.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded text-[10px] font-bold uppercase hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${course.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${course.status === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {course.status || 'Approved'}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3.5 py-2 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <button
                                                onClick={() => handleToggleFeatured(course)}
                                                className={`p-1.5 rounded-md transition-all ${
                                                    (course.isFeatured || course.is_featured)
                                                        ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30'
                                                        : 'text-slate-400 dark:text-white/30 hover:text-amber-500 hover:bg-amber-400/10'
                                                }`}
                                                title={(course.isFeatured || course.is_featured) ? 'Featured Course' : 'Mark as Featured'}
                                            >
                                                <Star size={14} className={(course.isFeatured || course.is_featured) ? 'fill-amber-400' : ''} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                                                className="p-1.5 text-slate-400 dark:text-white/40 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-all"
                                                title="Manage Content & Modules"
                                            >
                                                <BookOpen size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(course)}
                                                className="p-1.5 text-slate-400 dark:text-white/40 hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                                                title="Edit Course Details"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course._id)}
                                                className="p-1.5 text-slate-400 dark:text-white/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all"
                                                title="Delete Course"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Create/Edit Course Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowCreateModal(false);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-3xl relative z-[100000] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-6 max-h-[92vh] flex flex-col overflow-hidden text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-white font-inter">
                                    {editingCourse ? 'Edit Course Details' : 'Create New Course'}
                                </h3>
                                <p className="text-[11px] text-white/50">
                                    {editingCourse ? `ID: ${editingCourse._id?.slice(-6).toUpperCase()}` : 'Add a new learning track to the catalog'}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable with compact two-column grid */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1.5 space-y-3.5 [scrollbar-width:thin]">
                            {/* Thumbnail & Cover Image - Compact Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
                                <div className="w-24 h-16 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                    {formData.thumbnail ? (
                                        <img src={getMediaUrl(formData.thumbnail)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Image size={20} className="text-white/20" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1.5">Course Thumbnail Image</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Direct URL or click upload ->"
                                            className="flex-1 px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-primary"
                                            value={formData.thumbnail}
                                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                        />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            ref={thumbnailInputRef}
                                            onChange={handleThumbnailUpload}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => thumbnailInputRef.current.click()}
                                            disabled={thumbnailUploading || !editingCourse}
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${!editingCourse ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed' : 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30'}`}
                                            title={!editingCourse ? "Save course first to enable upload" : "Upload Image"}
                                        >
                                            <Upload size={13} className={thumbnailUploading ? "animate-bounce" : ""} />
                                            <span>{thumbnailUploading ? '...' : 'Upload'}</span>
                                        </button>
                                    </div>
                                    {!editingCourse && (
                                        <p className="text-[10px] text-amber-400/70 mt-1 italic">Save course first to enable direct file upload, or enter image URL.</p>
                                    )}
                                </div>
                            </div>

                            {/* 2-Column Core Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Title (spans 2) */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-white/80 mb-1">
                                        Course Title <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-inter"
                                        placeholder="e.g. Master of Commerce in Hospital Administration"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                {/* Program Type */}
                                <div>
                                    <label className="block text-xs font-semibold text-white/80 mb-1">
                                        Program Type <span className="text-rose-400">*</span>
                                    </label>
                                    <select
                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-inter appearance-none"
                                        value={formData.programType}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            programType: e.target.value,
                                            instructorId: '',
                                            skillDadUniversityId: '',
                                            universityName: ''
                                        })}
                                    >
                                        {!wblOnly && <option value="course" className="bg-[#0B071A]">Skill Course</option>}
                                        {!wblOnly && <option value="degree_programme" className="bg-[#0B071A]">Skill Integrated Degree Programme</option>}
                                        <option value="wbl_domestic" className="bg-[#0B071A]">WBL Domestic Programme</option>
                                        <option value="wbl_abroad" className="bg-[#0B071A]">Study Abroad Programme</option>
                                        {!wblOnly && <option value="featured" className="bg-[#0B071A]">Featured Course</option>}
                                    </select>
                                </div>

                                {/* Provider University */}
                                <div>
                                    <label className="block text-xs font-semibold text-white/80 mb-1">
                                        Provider University <span className="text-rose-400">*</span>
                                    </label>
                                    {(formData.programType === 'degree_programme' || formData.programType === 'wbl_abroad' || formData.programType === 'wbl_domestic') ? (
                                        <select
                                            required
                                            className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-inter appearance-none truncate"
                                            value={formData.skillDadUniversityId}
                                            onChange={(e) => {
                                                const uniId = e.target.value;
                                                const uni = skillDadUniversities.find(u => String(u._id) === uniId);
                                                setFormData({
                                                    ...formData,
                                                    skillDadUniversityId: uniId,
                                                    universityName: uni ? uni.name : ''
                                                });
                                            }}
                                        >
                                            <option value="" disabled className="bg-black text-white">Select University</option>
                                            {skillDadUniversities.map(u => (
                                                <option key={u._id} value={u._id} className="bg-black text-white">{u.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <select
                                            required
                                            className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-inter appearance-none truncate"
                                            value={formData.instructorId}
                                            onChange={(e) => {
                                                const univId = e.target.value;
                                                const univ = universities.find(u => u._id === univId);
                                                setFormData({
                                                    ...formData,
                                                    instructorId: univId,
                                                    universityName: univ ? univ.name : ''
                                                });
                                            }}
                                        >
                                            <option value="" disabled className="bg-black text-white">Select University</option>
                                            {universities.map(u => (
                                                <option key={u._id} value={u._id} className="bg-black text-white">{u.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-xs font-semibold text-white/80 mb-1">
                                        Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-inter"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const parsed = parseFloat(val);
                                            setFormData({ ...formData, price: isNaN(parsed) ? 0 : parsed });
                                        }}
                                    />
                                </div>

                                {/* Display Order */}
                                <div>
                                    <label className="block text-xs font-semibold text-white/80 mb-1">
                                        Display Order (1 is first)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-inter"
                                        placeholder="e.g. 1"
                                        value={formData.displayOrder}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, displayOrder: val === '' ? '' : parseInt(val, 10) });
                                        }}
                                    />
                                </div>

                                {/* Instructor Name (Custom) */}
                                <div>
                                    <label className="block text-xs font-semibold text-white/80 mb-1">
                                        Instructor Name (Override)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-inter"
                                        placeholder="Optional instructor name"
                                        value={formData.instructorName}
                                        onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                                    />
                                </div>

                                {/* University Name (Custom) */}
                                <div>
                                    <label className="block text-xs font-semibold text-white/80 mb-1">
                                        University Name (Override)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-inter"
                                        placeholder="Optional university name"
                                        value={formData.universityName}
                                        onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                                    />
                                </div>

                                {/* Salary & Jobs */}
                                <div>
                                    <label className="block text-xs font-semibold text-white/80 mb-1">
                                        Median / Minimum Salary (₹)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-inter"
                                        placeholder="e.g. 378883"
                                        value={formData.minSalary || ''}
                                        onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-white/80 mb-1">
                                        Jobs Available
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-inter"
                                        placeholder="e.g. 103522"
                                        value={formData.jobsAvailable || ''}
                                        onChange={(e) => setFormData({ ...formData, jobsAvailable: e.target.value })}
                                    />
                                </div>

                                {/* Brochure URL (spans 2) */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-white/80 mb-1">
                                        Brochure URL / PDF Document
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-inter"
                                            placeholder="https://... or /uploads/..."
                                            value={formData.brochure_url || ''}
                                            onChange={(e) => setFormData({ ...formData, brochure_url: e.target.value })}
                                        />
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={brochureInputRef}
                                            onChange={handleBrochureUpload}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => brochureInputRef.current.click()}
                                            disabled={brochureUploading || !editingCourse}
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${!editingCourse ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed' : 'bg-primary/20 text-primary border-primary/30 hover:bg-primary hover:text-white'}`}
                                        >
                                            <Upload size={13} className={brochureUploading ? "animate-bounce" : ""} />
                                            <span>{brochureUploading ? '...' : (formData.brochure_url ? 'Update' : 'Upload')}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Description (spans 2) */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-white/80 mb-1">
                                        Description <span className="text-rose-400">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={2}
                                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-inter resize-none"
                                        placeholder="Enter concise course overview"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Checkboxes - Compact Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <label className="flex items-center space-x-2.5 p-2.5 bg-primary/5 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/10 transition-all">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.isPublished ? 'bg-primary border-primary' : 'border-white/30'}`}>
                                        {formData.isPublished && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-white leading-none">Publish Course</p>
                                        <p className="text-[10px] text-white/40 mt-0.5">Visible to students in library</p>
                                    </div>
                                </label>

                                <label className="flex items-center space-x-2.5 p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl cursor-pointer hover:bg-amber-500/10 transition-all">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.isFeatured ? 'bg-amber-500 border-amber-500' : 'border-white/30'}`}>
                                        {formData.isFeatured && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-white leading-none">Feature on Landing</p>
                                        <p className="text-[10px] text-white/40 mt-0.5">Showcase on main landing page</p>
                                    </div>
                                </label>
                            </div>

                            {/* Additional Details (Highlights & Learning Outcomes) */}
                            <div className="space-y-3 pt-2 border-t border-white/10">
                                {/* Course Highlights */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-white/70">Course Highlights</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, features: [...(formData.features || []), ''] })}
                                            className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary-light"
                                        >
                                            + Add Highlight
                                        </button>
                                    </div>
                                    {(formData.features || []).map((feature, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                placeholder="e.g. Live Doubt-Clearing Sessions"
                                                className="flex-1 px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                                                value={feature}
                                                onChange={(e) => {
                                                    const updated = [...formData.features];
                                                    updated[idx] = e.target.value;
                                                    setFormData({ ...formData, features: updated });
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) })}
                                                className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Learning Outcomes */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-white/70">What Students Will Learn</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, learning_outcomes: [...(formData.learning_outcomes || []), ''] })}
                                            className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary-light"
                                        >
                                            + Add Outcome
                                        </button>
                                    </div>
                                    {(formData.learning_outcomes || []).map((outcome, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                placeholder="e.g. Manage day-to-day operations"
                                                className="flex-1 px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg text-xs text-white"
                                                value={outcome}
                                                onChange={(e) => {
                                                    const updated = [...formData.learning_outcomes];
                                                    updated[idx] = e.target.value;
                                                    setFormData({ ...formData, learning_outcomes: updated });
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, learning_outcomes: formData.learning_outcomes.filter((_, i) => i !== idx) })}
                                                className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Sticky Footer */}
                            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-1.5 text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-all shadow-md shadow-primary/20"
                                >
                                    {editingCourse ? 'Save Changes' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!courseToDelete}
                title="Delete this course?"
                message="This permanently removes the course along with all linked enrollments, documents, exams, and other related data. This cannot be undone."
                confirmLabel="Delete Course"
                onConfirm={confirmDeleteCourse}
                onCancel={() => setCourseToDelete(null)}
            />
        </div>
    );
};

export default CourseManager;
