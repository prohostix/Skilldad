import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Users,
    Layout,
    PlayCircle,
    CheckCircle2,
    Send,
    MessageSquare,
    Sparkles,
    ShieldCheck,
    ArrowLeft,
    Camera,
    Loader2,
    Share2,
    Laptop,
    Star,
    GraduationCap,
    Briefcase,
    UserCheck,
    FileText,
    ChevronRight,
    Megaphone,
    Globe,
    Mail,
    LineChart,
    Bot,
    Target,
    ChevronDown,
    Clock
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import EnrollEnquiryModal from '../components/ui/EnrollEnquiryModal';
import CourseCard from '../components/CourseCard';
import { getMediaUrl } from '../utils/media';

// Custom filled icons to match exact reference design (Using FontAwesome paths)
const CustomIconLearn = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 512 512" fill="currentColor" width={size} height={size} {...props}>
    <path d="M256 141.3l0 309.3 .5-.2C311.1 427.7 369.7 416 428.8 416l19.2 0 0-320-19.2 0c-42.2 0-84.1 8.4-123.1 24.6-16.8 7-33.4 13.9-49.7 20.7zM230.9 61.5L256 72 281.1 61.5C327.9 42 378.1 32 428.8 32L464 32c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-35.2 0c-50.7 0-100.9 10-147.7 29.5l-12.8 5.3c-7.9 3.3-16.7 3.3-24.6 0l-12.8-5.3C184.1 490 133.9 480 83.2 480L48 480c-26.5 0-48-21.5-48-48L0 80C0 53.5 21.5 32 48 32l35.2 0c50.7 0 100.9 10 147.7 29.5z" />
  </svg>
);

const CustomIconGraduate = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 640 512" fill="currentColor" width={size * 1.25} height={size} {...props}>
    <path d="M48 195.8l209.2 86.1c9.8 4 20.2 6.1 30.8 6.1s21-2.1 30.8-6.1l242.4-99.8c9-3.7 14.8-12.4 14.8-22.1s-5.8-18.4-14.8-22.1L318.8 38.1C309 34.1 298.6 32 288 32s-21 2.1-30.8 6.1L14.8 137.9C5.8 141.6 0 150.3 0 160L0 456c0 13.3 10.7 24 24 24s24-10.7 24-24l0-260.2zm48 71.7L96 384c0 53 86 96 192 96s192-43 192-96l0-116.6-142.9 58.9c-15.6 6.4-32.2 9.7-49.1 9.7s-33.5-3.3-49.1-9.7L96 267.4z" />
  </svg>
);

const CustomIconBriefcase = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 512 512" fill="currentColor" width={size} height={size} {...props}>
    <path d="M200 48l112 0c4.4 0 8 3.6 8 8l0 40-128 0 0-40c0-4.4 3.6-8 8-8zm-56 8l0 40-80 0C28.7 96 0 124.7 0 160l0 96 512 0 0-96c0-35.3-28.7-64-64-64l-80 0 0-40c0-30.9-25.1-56-56-56L200 0c-30.9 0-56 25.1-56 56zM512 304l-192 0 0 16c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-16-192 0 0 112c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-112z" />
  </svg>
);

const CustomIconExperience = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 512 512" fill="currentColor" width={size} height={size} {...props}>
    <g transform="translate(64, -20) scale(0.85)">
        <path d="M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z"/>
    </g>
    <g transform="translate(60, 380) scale(0.18)">
        <path d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"/>
    </g>
    <g transform="translate(193, 400) scale(0.22)">
        <path d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"/>
    </g>
    <g transform="translate(349, 380) scale(0.18)">
        <path d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"/>
    </g>
  </svg>
);

const CustomIconResume = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 384 512" fill="currentColor" width={size * 0.75} height={size} {...props}>
    <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM120 256c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0z" />
  </svg>
);

const CustomIconPlaced = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 512 512" fill="currentColor" width={size} height={size} {...props}>
    <path d="M200 48l112 0c4.4 0 8 3.6 8 8l0 40-128 0 0-40c0-4.4 3.6-8 8-8zm-56 8l0 40-80 0C28.7 96 0 124.7 0 160l0 96 512 0 0-96c0-35.3-28.7-64-64-64l-80 0 0-40c0-30.9-25.1-56-56-56L200 0c-30.9 0-56 25.1-56 56zM512 304l-192 0 0 16c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32l0-16-192 0 0 112c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-112z" />
    <circle cx="410" cy="410" r="130" fill="#F3E8FF" />
    <g transform="translate(320, 320) scale(0.35)">
        <path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zM374 145.7c-10.7-7.8-25.7-5.4-33.5 5.3L221.1 315.2 169 263.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.8 7.5 18.8 7s13.4-4.1 17.5-9.8L379.3 179.2c7.8-10.7 5.4-25.7-5.3-33.5z" />
    </g>
  </svg>
);

const getModuleIcon = (type, title = '') => {
    const lowerTitle = title.toLowerCase();
    let effectiveType = type || 'video';
    if (lowerTitle.includes('note')) effectiveType = 'note';
    else if (lowerTitle.includes('exercise') || lowerTitle.includes('excercise')) effectiveType = 'exercise';
    
    switch(effectiveType) {
        case 'video': return <PlayCircle size={16} className="text-blue-400" />;
        case 'reading': return <BookOpen size={16} className="text-emerald-400" />;
        case 'pdf': return <FileText size={16} className="text-red-400" />;
        case 'assignment': return <Layout size={16} className="text-purple-400" />;
        case 'image': return <Camera size={16} className="text-yellow-400" />;
        case 'note': return <BookOpen size={16} className="text-emerald-400" />;
        case 'exercise': return <Layout size={16} className="text-indigo-400" />;
        default: return <PlayCircle size={16} className="text-blue-400" />;
    }
};

const getModuleStats = (moduleObj) => {
    if (!moduleObj) return null;
    const videos = moduleObj.videos || [];
    const counts = {};
    let totalMins = 0;
    
    videos.forEach(v => {
        let type = v.type || 'video';
        if (v.title && v.title.toLowerCase().includes('note')) {
            type = 'note';
        } else if (v.title && (v.title.toLowerCase().includes('exercise') || v.title.toLowerCase().includes('excercise'))) {
            type = 'exercise';
        }
        counts[type] = (counts[type] || 0) + 1;
        
        if (v.duration) {
            const mins = parseInt(v.duration.replace(/\D/g, ''));
            if (!isNaN(mins)) totalMins += mins;
        }
    });
    
    if (moduleObj.quiz && moduleObj.quiz.questions && moduleObj.quiz.questions.length > 0) {
        counts['exercise'] = (counts['exercise'] || 0) + 1;
    }
    
    if (Object.keys(counts).length === 0 && totalMins === 0) return null;
    
    return (
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
            {counts.video && <span className="flex items-center gap-1.5"><PlayCircle size={14} className="text-blue-500" /> {counts.video} videos</span>}
            {counts.reading && <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-emerald-500" /> {counts.reading} readings</span>}
            {counts.pdf && <span className="flex items-center gap-1.5"><FileText size={14} className="text-red-500" /> {counts.pdf} docs</span>}
            {counts.note && <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-emerald-500" /> {counts.note} notes</span>}
            {counts.exercise && <span className="flex items-center gap-1.5"><Layout size={14} className="text-indigo-500" /> {counts.exercise} exercises</span>}
            {counts.assignment && <span className="flex items-center gap-1.5"><Layout size={14} className="text-purple-500" /> {counts.assignment} assignments</span>}
            {totalMins > 0 && <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-500"><Clock size={14} /> {totalMins} minutes</span>}
        </div>
    );
};

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enquiryStatus, setEnquiryStatus] = useState({ loading: false, success: false, error: null });
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [userInfo, setUserInfo] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showAllModules, setShowAllModules] = useState(false);
    const [expandedModule, setExpandedModule] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [recommendations, setRecommendations] = useState({
        universityCourses: [],
        relatedCourses: []
    });

    const isPreviewMode = location.pathname.includes('/preview');

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await axios.get(`/api/courses/${courseId}`);
                setCourse(data);
                
                // Fetch recommendations in parallel
                try {
                    const uniRes = await axios.get(`/api/courses?university=${data.instructorId}`);
                    const relatedRes = await axios.get('/api/courses');
                    const uniCourses = uniRes.data || [];
                    const allCourses = relatedRes.data || [];
                    const currentProgramType = data.programType || data.program_type || 'course';
                    
                    const relatedCourses = allCourses.filter(c => {
                        if (c._id === data._id) return false;
                        const pt = c.programType || c.program_type || 'course';
                        
                        if (currentProgramType.startsWith('wbl')) {
                            return pt.startsWith('wbl');
                        }
                        if (currentProgramType === 'degree_programme') {
                            return pt === 'degree_programme';
                        }
                        return pt === 'course';
                    }).slice(0, 4);
                    
                    setRecommendations({
                        universityCourses: uniCourses.filter(c => c._id !== data._id).slice(0, 4),
                        relatedCourses: relatedCourses
                    });
                } catch (recError) {
                    console.error('Error fetching recommendations:', recError);
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching course:', error);
                setLoading(false);
            }
        };
        fetchCourse();
        
        const stored = localStorage.getItem('userInfo');
        if (stored) {
            setUserInfo(JSON.parse(stored));
        }
    }, [courseId]);

    useEffect(() => {
        const checkEnrollment = async () => {
            if (userInfo && userInfo.role === 'student' && courseId) {
                try {
                    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                    const { data } = await axios.get('/api/enrollment/my-courses', config);
                    const enrolled = data.some(e => (e.course?._id || e.course_id || e.course) === courseId);
                    setIsEnrolled(enrolled);
                } catch (err) {
                    console.error('Failed to check enrollment', err);
                }
            }
        };
        checkEnrollment();
    }, [userInfo, courseId]);


    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        setEnquiryStatus({ loading: true, success: false, error: null });
        try {
            await axios.post('/api/enquiries', {
                ...formData,
                courseId: course._id,
                courseName: course.title,
                universityName: course.universityName || course.instructor?.profile?.universityName || course.instructor?.name || ''
            });
            setEnquiryStatus({ loading: false, success: true, error: null });
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            setEnquiryStatus({ loading: false, success: false, error: 'Failed to send inquiry. Please try again.' });
        }
    };

    const isOwnerOrAdmin = userInfo?.role === 'admin' || userInfo?.id === course?.instructorId;

    const handleSecureAction = (action) => {
        if (userInfo) {
            action();
        } else {
            navigate('/login', { state: { from: `/course/${courseId}` } });
        }
    };

    const handleShareBrochure = async () => {
        if (!course?.brochure_url) return;
        const url = getMediaUrl(course.brochure_url);
        const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${course.title} Brochure`,
                    text: `Check out the brochure for ${course.title}!`,
                    url: fullUrl
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(fullUrl);
            alert('Brochure link copied to clipboard!');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('thumbnail', file);

        setUploadingImage(true);
        try {
            const res = await axios.post(`/api/courses/${courseId}/upload-thumbnail`, uploadData, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setCourse({ ...course, thumbnail: res.data.thumbnail });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload thumbnail');
        } finally {
            setUploadingImage(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-alyra-gradient flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-alyra-gradient flex flex-col items-center justify-center text-white space-y-6">
                <h1 className="text-4xl font-black">Course Not Found</h1>
                <ModernButton onClick={() => navigate('/courses')}>Back to Catalog</ModernButton>
            </div>
        );
    }

    const totalLessons = course.modules?.reduce((acc, m) => acc + (m.videos?.length || 0), 0) || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A] text-white selection:bg-primary/30 relative">
            <Navbar />

            {/* Course Details */}
            <section className="pt-20 pb-16 px-6 relative overflow-hidden bg-black/40">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary blur-[120px] rounded-full opacity-10"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-1.5 text-text-secondary hover:text-white transition-colors mb-4 group"
                    >
                        <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Go Back</span>
                    </motion.button>

                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                    {/* Left column: title, meta, curriculum & details */}
                    <div className="lg:col-span-8 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center gap-4 mb-4 flex-wrap">
                                {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) && (
                                    <div className="flex items-center gap-3">
                                        {(course.instructor?.profile?.profileImage || course.instructor?.profileImage) && (
                                            <div className="w-8 h-8 rounded shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden flex-shrink-0 bg-white">
                                                <img
                                                    src={getMediaUrl(course.instructor?.profile?.profileImage || course.instructor?.profileImage)}
                                                    alt="University Logo"
                                                    className="w-full h-full object-contain p-0.5"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                        )}
                                        <div className="text-[13px] font-semibold text-gray-700 dark:text-white/70">
                                            Offered by <span className="text-gray-900 dark:text-white ml-1 font-bold">{course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-3 leading-[1.2] tracking-tight">
                                {course.title}
                            </h1>
                            <p className="text-[15px] sm:text-[16px] text-white mb-6 leading-relaxed max-w-4xl">
                                {course.description}
                            </p>



                            <div className="flex items-center gap-6 text-[14px] font-medium text-gray-600 dark:text-gray-400 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <span>Instructed by <span className="text-[#4C1D95] dark:text-primary font-semibold">{course.instructorName || course.instructor?.name || 'Academic Facilitator'}</span></span>
                                </div>
                            </div>
                        </motion.div>



                        {/* Moved wbl_domestic block down below the grid */}

                        {/* Modules / Syllabus Section */}
                        {course.modules && course.modules.length > 0 && (
                            <section className="mb-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-[20px] sm:text-[22px] font-bold text-gray-900 dark:text-white flex items-center space-x-3 tracking-tight">
                                        <BookOpen className="text-[#4C1D95] dark:text-primary-accent" size={22} />
                                        <span>Syllabus & Modules</span>
                                    </h2>
                                </div>
                                
                                <div className="space-y-4">
                                    {course.modules.slice(0, showAllModules ? course.modules.length : 2).map((module, idx) => (
                                        <div key={module._id} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#4C1D95]/30 dark:hover:border-white/20 hover:shadow-md">
                                            <button 
                                                onClick={() => setExpandedModule(expandedModule === module._id ? null : module._id)}
                                                className="w-full text-left p-5 sm:p-6 flex items-start justify-between group"
                                            >
                                                <div className="flex-1 pr-4">
                                                    <div className="flex items-center gap-3 mb-1.5">
                                                        <span className="text-[11px] font-bold text-[#4C1D95] dark:text-primary uppercase tracking-widest">Module {idx + 1}</span>
                                                    </div>
                                                    <h3 className="text-base sm:text-[18px] font-bold text-gray-900 dark:text-white group-hover:text-[#4C1D95] dark:group-hover:text-primary transition-colors tracking-tight leading-snug">{module.title}</h3>
                                                    <div className="mt-2 text-gray-500 dark:text-white/60 font-medium">
                                                        {getModuleStats(module)}
                                                    </div>
                                                </div>
                                                <div className="mt-1 flex-shrink-0 bg-gray-50 dark:bg-white/5 rounded-full p-2 group-hover:bg-[#4C1D95]/10 dark:group-hover:bg-primary/20 transition-colors">
                                                    <ChevronDown 
                                                        size={18} 
                                                        className={`text-gray-500 dark:text-white/60 group-hover:text-[#4C1D95] dark:group-hover:text-primary transition-transform duration-300 ${expandedModule === module._id ? 'rotate-180' : ''}`}
                                                    />
                                                </div>
                                            </button>
                                            
                                            {/* Expandable Content Area */}
                                            {expandedModule === module._id && (module.videos?.length > 0 || module.quiz?.questions?.length > 0) && (
                                                <div className="px-5 sm:px-6 pb-6 pt-2">
                                                    <div className="border-t border-gray-100 dark:border-white/10 pt-5">
                                                        <h4 className="text-[13px] font-bold text-gray-900 dark:text-white/90 mb-4 tracking-wide uppercase">What's included</h4>
                                                        <div className="space-y-4 pl-1">
                                                            {module.videos?.map((item, i) => (
                                                                <div key={item._id} className="flex items-start gap-4 p-2 -mx-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                                    {item.thumbnail ? (
                                                                        <div className="mt-0.5 w-[72px] h-[48px] bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 flex-shrink-0 overflow-hidden shadow-sm">
                                                                            <img src={getMediaUrl(item.thumbnail)} alt="Thumbnail" className="w-full h-full object-cover" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="mt-0.5 p-2 bg-[#F3E8FF] dark:bg-white/10 rounded-lg border border-[#E9D5FF] dark:border-white/10 flex-shrink-0 text-[#4C1D95] dark:text-white shadow-sm">
                                                                            {getModuleIcon(item.type, item.title)}
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                                                            <h5 className="text-[14px] font-semibold text-gray-900 dark:text-white/90 truncate">{item.title}</h5>
                                                                            {item.duration && <span className="text-[12px] font-medium text-gray-500 dark:text-white/50 whitespace-nowrap">{item.duration}</span>}
                                                                        </div>
                                                                        {item.description && (
                                                                            <p className="text-[13px] text-gray-500 dark:text-white/50 mt-1 leading-relaxed line-clamp-2 font-medium">{item.description}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            
                                                            {/* Render Quiz Exercise if available */}
                                                            {module.quiz && module.quiz.questions && module.quiz.questions.length > 0 && (
                                                                <div className="flex items-start gap-4 p-2 -mx-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                                    <div className="mt-0.5 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30 flex-shrink-0 text-indigo-500 dark:text-indigo-400 shadow-sm">
                                                                        <Layout size={16} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                                                            <h5 className="text-[14px] font-semibold text-gray-900 dark:text-white/90 truncate">Quiz Assessment</h5>
                                                                            <span className="text-[12px] font-medium text-indigo-500 dark:text-indigo-400 whitespace-nowrap">{module.quiz.questions.length} Questions</span>
                                                                        </div>
                                                                        <p className="text-[13px] text-gray-500 dark:text-white/50 mt-1 leading-relaxed line-clamp-2 font-medium">Test your knowledge on the topics covered in this module.</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {course.modules.length > 2 && !showAllModules && (
                                    <div className="flex justify-end mt-3">
                                        <button 
                                            onClick={() => setShowAllModules(true)}
                                            className="text-[13px] font-semibold text-[#4C1D95] dark:text-primary hover:underline"
                                        >
                                            View all modules
                                        </button>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Faculty / Scientific Committee Section */}
                        {course.instructor?.profile?.faculty && course.instructor?.profile?.faculty.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
                                    <Users className="text-emerald-400" size={24} />
                                    <span>Instructors</span>
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-8">
                                    {course.instructor.profile.faculty.map((member, i) => (
                                        <GlassCard key={i} className="!p-6 border-white/5 hover:border-emerald-500/20 transition-all group overflow-hidden">
                                            <div className="flex gap-5">
                                                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                                                    <img 
                                                        src={getMediaUrl(member.image)} 
                                                        alt={member.name} 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${member.name}&background=random`; }}
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <h4 className="font-bold text-lg text-white">{member.name}</h4>
                                                    <p className="text-xs font-semibold text-primary">{member.role || 'Instructor'}</p>
                                                    <p className="text-sm text-text-secondary leading-relaxed pt-1">
                                                        {member.description || 'Specialized faculty member dedicated to providing excellence in this academic path.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>

                    {/* Sticky Sidebar: Enroll Card, Course Includes, Inquiry, Safe Payment */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#120D26] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                        >
                            <div className="relative aspect-video overflow-hidden group">
                                <img
                                    src={getMediaUrl(course.thumbnail) || `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200`}
                                    alt={course.title}
                                    className={`w-full h-full object-cover transition-all duration-300 ${uploadingImage ? 'opacity-50 blur-sm' : ''}`}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200";
                                    }}
                                />

                                {/* Edit Course Cover Image Overlay */}
                                {isOwnerOrAdmin && (
                                    <label className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full cursor-pointer backdrop-blur-sm border border-white/20 transition-all shadow-lg z-10 flex items-center justify-center" title="Update Course Cover">
                                        {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                )}

                                <div className="absolute inset-0 overlay-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="w-16 h-16 bg-[#ffffff]/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                        <PlayCircle size={32} className="text-white force-white ml-1" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                <div className="space-y-3">
                                    {isEnrolled ? (
                                        <ModernButton
                                            className="w-full justify-center !py-3 text-[15px] font-semibold"
                                            onClick={() => navigate(`/dashboard/course/${course._id}`)}
                                        >
                                            Go to Course
                                        </ModernButton>
                                    ) : (
                                        <ModernButton
                                            className="w-full justify-center !py-3 text-[15px] font-semibold"
                                            onClick={() => setShowEnrollModal(true)}
                                        >
                                            Enroll Now
                                        </ModernButton>
                                    )}

                                    {course.brochure_url && (
                                        <div className="flex gap-2 w-full">
                                            <button
                                                onClick={() => handleSecureAction(() => window.open(getMediaUrl(course.brochure_url), '_blank'))}
                                                className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold border border-gray-200 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-white"
                                            >
                                                <BookOpen size={16} />
                                                Brochure
                                            </button>
                                            <button
                                                onClick={() => handleSecureAction(handleShareBrochure)}
                                                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold border border-gray-200 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-white"
                                                title="Share Brochure"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Salary / Jobs Pill under the card */}
                        {(course.minSalary || course.jobsAvailable) && (
                            <div className="relative mt-6 bg-white dark:bg-[#120D26] rounded-[2rem] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 dark:border-white/10 overflow-hidden min-h-[220px] flex items-end">
                                
                                {/* Decorative Purple Arc */}
                                <div className="absolute inset-y-0 right-0 w-3/4 sm:w-2/3 bg-[#F3E8FF] dark:bg-[#4C1D95]/20 rounded-l-full translate-x-12 sm:translate-x-16 pointer-events-none"></div>
                                
                                {/* Image positioned in background right */}
                                <div className="absolute bottom-0 right-0 sm:right-4 w-40 sm:w-48 h-56 pointer-events-none z-10" style={{ mixBlendMode: 'multiply' }}>
                                    <img 
                                        src="/professional_person.jpg" 
                                        alt="Professional Career" 
                                        className="absolute bottom-0 right-0 w-full h-full object-contain object-bottom drop-shadow-xl"
                                        style={{ mixBlendMode: 'multiply' }}
                                    />
                                </div>
                                
                                {/* Inner Pill */}
                                <div className="relative z-20 w-full sm:w-[54%] pr-1 mb-1">
                                    <div className="flex flex-col items-start justify-center w-full px-3.5 py-2.5 bg-white/95 backdrop-blur-xl dark:bg-[#1A1438]/95 border border-gray-100 dark:border-white/20 rounded-xl shadow-lg">
                                        <div className="flex flex-col items-start justify-center gap-y-2 w-full">
                                            {course.minSalary && (
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="font-semibold text-gray-900 dark:text-white text-base sm:text-[17px] tracking-tight">
                                                        ₹{Number(course.minSalary).toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="font-medium text-gray-500 dark:text-gray-400 text-[8.5px] sm:text-[9.5px] uppercase tracking-wider">
                                                        median salary
                                                    </span>
                                                </div>
                                            )}
                                            {course.jobsAvailable && (
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="font-black text-gray-900 dark:text-white text-base sm:text-[17px] tracking-tight">
                                                        {Number(course.jobsAvailable).toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="font-bold text-gray-500 dark:text-gray-400 text-[8.5px] sm:text-[9.5px] uppercase tracking-wider">
                                                        jobs available
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>
                    </div>

                    {(course.programType === 'wbl_domestic' || course.program_type === 'wbl_domestic' || course.programType === 'wbl_abroad' || course.program_type === 'wbl_abroad') ? (
                        <div className="mt-8 space-y-8">
                            {/* Top Banner */}
                            <div className="rounded-[1.5rem] p-5 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8 shadow-xl relative overflow-hidden" style={{ background: 'linear-gradient(90deg, #2A1468 0%, #3B1F87 100%)', border: '1px solid #4F3699' }}>
                                <div className="flex-1 flex gap-4 items-start relative z-10">
                                    <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                        <Laptop size={22} className="!text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[16px] mb-1 tracking-wide !text-white">WORK WHILE YOU STUDY</h3>
                                        <p className="text-[13px] leading-relaxed !text-[#E2D5F8]">
                                            Get opportunities for internships, part-time roles and live projects in hospitals, clinics and healthcare organizations.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="hidden md:block w-px self-stretch relative z-10" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                                
                                <div className="flex-1 flex gap-4 items-start relative z-10">
                                    <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                        <Star size={22} className="!text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[16px] mb-1 tracking-wide !text-white">WHY IT MATTERS</h3>
                                        <p className="text-[13px] leading-relaxed !text-[#E2D5F8]">
                                            You earn, gain experience and build confidence — so you're job-ready even before you graduate.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* YOUR JOURNEY Section */}
                            <div className="relative mt-8">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 z-10 bg-[#FAF9F6] dark:!bg-[#05030B]">
                                    <h3 className="font-extrabold tracking-widest uppercase text-[14px] md:text-[16px] whitespace-nowrap text-[#4C1D95] dark:text-primary-accent">YOUR JOURNEY</h3>
                                </div>
                                
                                <div className="rounded-[2rem] p-4 md:p-6 pt-8 md:pt-10 pb-4 md:pb-6 relative overflow-hidden bg-white dark:!bg-[#0A0714] border border-[#E2D8F0] dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
                                    <div className="flex flex-col md:flex-row items-start md:items-start justify-between w-full relative z-10">
                                        {[
                                            { icon: CustomIconLearn, title: 'Learn', desc: 'Gain knowledge & industry skills' },
                                            { icon: CustomIconGraduate, title: 'Graduate', desc: `Complete your ${course.title?.includes('+') ? course.title.split('+')[0].trim() : 'BCom'} Degree` },
                                            { icon: CustomIconBriefcase, title: 'Work & Learn', desc: 'Work on real projects & gain practical experience' },
                                            { icon: CustomIconExperience, title: 'Gain Experience', desc: 'Strengthen your skills & grow professionally' },
                                            { icon: CustomIconResume, title: 'Stronger Resume', desc: 'Experience + Skills = Better career opportunities' },
                                            { icon: CustomIconPlaced, title: 'Get Placed', desc: 'We connect you to top healthcare organizations until you get placed.' },
                                        ].map((step, idx, arr) => (
                                            <div key={idx} className="flex flex-row md:flex-col items-center md:text-center flex-1 relative px-1 py-3 md:py-0 w-full md:w-auto gap-4 md:gap-0">
                                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center md:mb-3 shrink-0 relative z-10 bg-[#F3E8FF] dark:bg-primary/20">
                                                    <step.icon size={28} strokeWidth={2} className="text-[#4C1D95] dark:text-primary" />
                                                </div>
                                                <div className="flex flex-col md:items-center text-left md:text-center">
                                                    <h4 className="font-bold text-[13px] md:text-[14px] mb-1.5 text-[#111111] dark:text-white">{step.title}</h4>
                                                    <p className="text-[11px] md:text-[11px] leading-tight text-[#444444] dark:text-gray-400">{step.desc}</p>
                                                </div>
                                                
                                                {/* Chevron positioned exactly between items */}
                                                {idx < arr.length - 1 && (
                                                    <div className="hidden md:block absolute top-[32px] -right-3 -translate-y-1/2 z-0 text-[#4C1D95] dark:text-primary-accent">
                                                        <ChevronRight size={22} strokeWidth={2.5} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {course.university_tools && course.university_tools.length > 0 && (
                        <div className="mt-8 relative overflow-hidden p-6 sm:p-8 rounded-[24px] border border-gray-100 dark:border-white/10 bg-[#F8F9FA] dark:!bg-[#05030B]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E9D5FF]/50 dark:bg-primary/10 blur-[90px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:!bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm shrink-0">
                                        <Sparkles size={20} className="text-[#4C1D95] dark:text-primary-accent" />
                                    </div>
                                    <div>
                                        <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">Exclusive University Ecosystem</h2>
                                        <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">Specialized environment provided by the university.</p>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {course.university_tools.map((tool, i) => (
                                        <div key={i} className="p-5 sm:p-6 bg-white dark:!bg-[#0A0714] backdrop-blur-md rounded-2xl border border-gray-100 dark:border-white/10 flex items-start gap-4 group hover:bg-gray-50 dark:hover:!bg-black hover:border-[#4C1D95]/30 dark:hover:border-primary/40 transition-all duration-300 shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] dark:bg-primary/20 flex items-center justify-center text-[#4C1D95] dark:text-primary group-hover:scale-110 transition-all shadow-sm shrink-0">
                                                <Layout size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[14px] text-gray-900 dark:text-white mb-1.5 tracking-tight">{tool?.name || 'Unnamed Tool'}</h4>
                                                <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{tool?.description || 'Exclusive toolkit and specialized environment provided by the university for immersive learning.'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                        <div className="mt-8 bg-[#F8F9FA] dark:!bg-[#05030B] rounded-[24px] p-6 sm:p-8 border border-gray-100 dark:border-white/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-white dark:!bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm shrink-0">
                                    <GraduationCap size={24} className="text-[#4C1D95] dark:text-primary-accent" />
                                </div>
                                <div>
                                    <h2 className="text-[20px] sm:text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">What You'll Learn</h2>
                                    <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">Master in-demand skills for your career.</p>
                                </div>
                            </div>
                            
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {course.learning_outcomes.map((outcome, i) => {
                                    const isString = typeof outcome === 'string';
                                    const title = isString ? outcome : outcome.title;
                                    const description = isString ? '' : outcome.description;
                                    const iconName = isString ? 'check' : outcome.icon;
                                    
                                    const IconMap = {
                                        'megaphone': Megaphone,
                                        'globe': Globe,
                                        'mail': Mail,
                                        'chart': LineChart,
                                        'bot': Bot,
                                        'target': Target,
                                        'briefcase': Briefcase,
                                        'file': FileText,
                                        'check': CheckCircle2
                                    };
                                    
                                    const IconComponent = IconMap[iconName?.toLowerCase()] || CheckCircle2;

                                    return (
                                        <div key={i} className="flex flex-col p-5 bg-white dark:!bg-[#0A0714] rounded-2xl border border-gray-100 dark:border-white/10 hover:border-[#4C1D95]/30 dark:hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                                            <div className="flex items-start gap-4">
                                                <div className="w-[42px] h-[42px] rounded-full bg-[#F3E8FF] dark:bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                    <IconComponent size={20} strokeWidth={2.5} className="text-[#4C1D95] dark:text-primary" />
                                                </div>
                                                <div className="space-y-1.5 pt-1">
                                                    <h4 className="font-bold text-gray-900 dark:text-white leading-tight text-[14px] tracking-tight">{title}</h4>
                                                    {description && (
                                                        <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    {/* Full Width Direct Inquiry Section */}
                    <div className="mt-6 bg-white dark:!bg-[#05030B] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-white/10 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute right-0 bottom-0 pointer-events-none opacity-20 hidden md:block">
                            <div className="w-64 h-64 bg-primary/20 blur-[60px] rounded-full translate-x-1/2 translate-y-1/2"></div>
                        </div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-[#F3E8FF] dark:bg-primary/20 flex items-center justify-center">
                                        <Mail size={20} className="text-[#4C1D95] dark:text-primary-accent" />
                                    </div>
                                    <h2 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">Direct Inquiry</h2>
                                </div>
                                
                                <form className="w-full" onSubmit={handleInquirySubmit}>
                                    {enquiryStatus.success ? (
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center shrink-0">
                                                <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Inquiry Sent Successfully!</p>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400/80">Our team will contact you within 24 hours.</p>
                                            </div>
                                            <button 
                                                type="button"
                                                className="ml-auto px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800/50 hover:bg-emerald-200 dark:hover:bg-emerald-700/50 rounded-lg transition-colors"
                                                onClick={() => setEnquiryStatus({ ...enquiryStatus, success: false })}
                                            >
                                                Send Another
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col lg:flex-row items-end gap-5 w-full">
                                            <div className="flex-1 w-full space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white/70 block">Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-[8px] px-4 h-[48px] text-sm focus:border-[#4C1D95] dark:focus:border-primary focus:ring-1 focus:ring-[#4C1D95] dark:focus:ring-primary focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="flex-1 w-full space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white/70 block">Email</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-[8px] px-4 h-[48px] text-sm focus:border-[#4C1D95] dark:focus:border-primary focus:ring-1 focus:ring-[#4C1D95] dark:focus:ring-primary focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                                    placeholder="johndoe@email.com"
                                                />
                                            </div>
                                            <div className="flex-1 w-full space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white/70 block">Phone</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-[8px] px-4 h-[48px] text-sm focus:border-[#4C1D95] dark:focus:border-primary focus:ring-1 focus:ring-[#4C1D95] dark:focus:ring-primary focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                                    placeholder="+91 98765 43210"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={enquiryStatus.loading}
                                                className="w-full lg:w-auto h-[48px] px-10 bg-[#311075] hover:bg-[#200A4C] text-white rounded-[8px] text-[14px] font-medium transition-colors flex items-center justify-center shrink-0 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                                            >
                                                {enquiryStatus.loading ? 'Sending...' : 'Send Inquiry'}
                                            </button>
                                        </div>
                                    )}
                                    {enquiryStatus.error && <p className="text-xs text-red-500 mt-3">{enquiryStatus.error}</p>}
                                </form>
                            </div>
                            
                            {/* Decorative Graphic Element (matching the paper airplane illustration in the mockup) */}
                            <div className="hidden lg:flex w-64 shrink-0 items-center justify-end relative pl-8">
                                <div className="absolute w-32 h-32 bg-purple-100 rounded-full right-8 blur-[40px] opacity-80"></div>
                                <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 translate-x-4">
                                    {/* Main Envelope Body */}
                                    <path d="M40 140 L190 140 L170 80 L60 80 Z" fill="#F3E8FF"/>
                                    
                                    {/* Document inside */}
                                    <rect x="65" y="45" width="100" height="80" rx="8" fill="#FFFFFF" stroke="#E9D5FF" strokeWidth="2"/>
                                    <path d="M80 65 L150 65" stroke="#E9D5FF" strokeWidth="6" strokeLinecap="round"/>
                                    <path d="M80 85 L130 85" stroke="#E9D5FF" strokeWidth="6" strokeLinecap="round"/>
                                    <path d="M80 105 L140 105" stroke="#E9D5FF" strokeWidth="6" strokeLinecap="round"/>
                                    
                                    {/* Small floating chat bubble / badge */}
                                    <rect x="135" y="30" width="45" height="30" rx="8" fill="#A855F7"/>
                                    <path d="M145 45 L170 45" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
                                    
                                    {/* Envelope Front Flap */}
                                    <path d="M30 140 L200 140 L115 95 Z" fill="#E9D5FF" opacity="0.9"/>
                                    
                                    {/* Paper Airplane */}
                                    <g transform="translate(140, 10) rotate(15)">
                                        <path d="M0 60 L70 0 L40 70 Z" fill="#C084FC"/>
                                        <path d="M0 60 L35 45 L40 70 Z" fill="#A855F7"/>
                                        <path d="M35 45 L70 0 L45 35 Z" fill="#D8B4FE"/>
                                    </g>
                                    
                                    {/* Airplane Trail */}
                                    <path d="M130 110 C140 90 160 70 175 60" stroke="#D8B4FE" strokeWidth="2" strokeDasharray="4 4" fill="none"/>
                                    
                                    {/* Decorative sparkles/dots */}
                                    <circle cx="25" cy="50" r="3" fill="#D8B4FE"/>
                                    <path d="M30 30 L35 20 L40 30 L50 35 L40 40 L35 50 L30 40 L20 35 Z" fill="#E9D5FF" transform="scale(0.5) translate(30, 20)"/>
                                    <circle cx="210" cy="130" r="4" fill="#E9D5FF"/>
                                    <circle cx="220" cy="60" r="2.5" fill="#C084FC"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Recommendations Section */}
                {(recommendations.universityCourses.length > 0 || recommendations.relatedCourses.length > 0) && (
                    <div className="max-w-[1200px] mx-auto w-full mt-16 space-y-16">
                        {recommendations.universityCourses.length > 0 && (
                            <section>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                                    More from {course.universityName || course.instructor?.profile?.universityName || 'this University'}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {recommendations.universityCourses.map(recCourse => (
                                        <CourseCard key={recCourse._id} course={recCourse} />
                                    ))}
                                </div>
                            </section>
                        )}
                        
                        {recommendations.relatedCourses.length > 0 && (
                            <section>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                    Related Courses
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {recommendations.relatedCourses.map(recCourse => (
                                        <CourseCard key={recCourse._id} course={recCourse} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </section>

            {showEnrollModal && (
                <EnrollEnquiryModal 
                    onClose={() => setShowEnrollModal(false)} 
                    course={course}
                />
            )}

            <Footer />
        </div>
    );
};

export default CourseDetail;
