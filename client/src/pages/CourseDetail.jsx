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
    ChevronRight
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import EnrollEnquiryModal from '../components/ui/EnrollEnquiryModal';
import { getMediaUrl } from '../utils/media';

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

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await axios.get(`/api/courses/${courseId}`);
                setCourse(data);
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
                        onClick={() => navigate('/courses')}
                        className="flex items-center space-x-1.5 text-text-secondary hover:text-white transition-colors mb-4 group"
                    >
                        <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Back to catalog</span>
                    </motion.button>

                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                    {/* Left column: title, meta, curriculum & details */}
                    <div className="lg:col-span-8 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center gap-4 mb-3 flex-wrap">
                                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/20 rounded-md font-bold text-xs text-primary border border-primary/30">
                                    <BookOpen size={14} /> <span>{course.category}</span>
                                </div>
                                {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) && (
                                    <div className="flex items-center gap-3 border-l border-white/20 pl-4">
                                        {(course.instructor?.profile?.profileImage || course.instructor?.profileImage) && (
                                            <div className="w-6 h-6 rounded bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                                <img
                                                    src={getMediaUrl(course.instructor?.profile?.profileImage || course.instructor?.profileImage)}
                                                    alt="University Logo"
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                        )}
                                        <div className="text-xs font-semibold text-white/50">
                                            Offered by <span className="text-white ml-1">{course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-4xl font-bold mb-3 leading-tight tracking-tight">
                                {course.title}
                            </h1>
                            <p className="text-base text-text-secondary mb-4 leading-relaxed font-inter opacity-90">
                                {course.description}
                            </p>

                            <div className="flex items-center gap-6 text-sm text-text-secondary flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Layout size={16} className="text-primary" />
                                    <span>{course.modules?.length || 0} modules</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <PlayCircle size={16} className="text-primary" />
                                    <span>{totalLessons} lessons</span>
                                </div>
                                <div className="text-text-muted">
                                    Instructed by <span className="text-primary font-medium">{course.instructorName || course.instructor?.name || 'Academic Facilitator'}</span>
                                </div>
                            </div>
                        </motion.div>

                        {course.university_tools && course.university_tools.length > 0 && (
                            <section className="relative overflow-hidden p-10 rounded-[48px] border border-primary/20 bg-primary/5 shadow-glow-purple/10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[90px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-black mb-8 flex items-center space-x-4 tracking-tighter uppercase">
                                        <Sparkles className="text-primary-accent" size={32} />
                                        <span>Exclusive University Ecosystem</span>
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {course.university_tools.map((tool, i) => (
                                            <div key={i} className="p-6 bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/5 flex items-start gap-4 group hover:bg-white/[0.08] hover:border-primary/40 transition-all duration-500">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                                                    <Layout size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-white mb-2 tracking-tight">{tool?.name || 'Unnamed Tool'}</h4>
                                                    <p className="text-xs text-text-secondary leading-relaxed font-inter font-medium opacity-80">{tool?.description || 'Exclusive toolkit and specialized environment provided by the university for immersive learning.'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {(course.programType === 'degree_programme' || course.program_type === 'degree_programme') ? (
                            <div className="mt-8 space-y-12">
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
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 z-10 bg-transparent">
                                        <h3 className="font-extrabold tracking-widest uppercase text-[14px] md:text-[16px] whitespace-nowrap !text-[#5D24D6]">YOUR JOURNEY</h3>
                                    </div>
                                    
                                    <div className="rounded-[2rem] p-6 md:p-8 pt-10 md:pt-12 relative overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                                        <div className="flex flex-col md:flex-row items-start md:items-start justify-between w-full relative z-10">
                                            {[
                                                { icon: BookOpen, title: 'Learn', desc: 'Gain knowledge & industry skills' },
                                                { icon: GraduationCap, title: 'Graduate', desc: 'Complete your Degree' },
                                                { icon: Briefcase, title: 'Work & Learn', desc: 'Work on real projects & gain practical experience' },
                                                { icon: UserCheck, title: 'Gain Experience', desc: 'Strengthen your skills & grow professionally' },
                                                { icon: FileText, title: 'Stronger Resume', desc: 'Experience + Skills = Better career opportunities' },
                                                { icon: CheckCircle2, title: 'Get Placed', desc: 'We connect you to top organizations until you get placed.' },
                                            ].map((step, idx, arr) => (
                                                <div key={idx} className="flex flex-row md:flex-col items-center md:text-center flex-1 relative px-1 py-3 md:py-0 w-full md:w-auto gap-4 md:gap-0">
                                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center md:mb-3 shrink-0 relative z-10" style={{ backgroundColor: '#F3E8FF' }}>
                                                        <step.icon size={28} strokeWidth={2} style={{ color: '#210A52' }} />
                                                    </div>
                                                    <div className="flex flex-col md:items-center text-left md:text-center">
                                                        <h4 className="font-bold text-[14px] md:text-[15px] mb-1.5" style={{ color: '#111111' }}>{step.title}</h4>
                                                        <p className="text-[11px] md:text-[11px] leading-tight" style={{ color: '#444444' }}>{step.desc}</p>
                                                    </div>
                                                    
                                                    {/* Chevron positioned exactly between items */}
                                                    {idx < arr.length - 1 && (
                                                        <div className="hidden md:block absolute top-[32px] -right-3 -translate-y-1/2 z-0" style={{ color: '#210A52' }}>
                                                            <ChevronRight size={22} strokeWidth={2.5} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
                                    <Layout className="text-primary" size={24} />
                                    <span>Course Curriculum</span>
                                </h2>
                                <div className="space-y-3">
                                    {course.modules?.map((module, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-xl border border-white/10 bg-white/[0.03] hover:border-primary/30 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-4 px-5 py-4">
                                                <h3 className="font-bold text-sm sm:text-base flex items-center gap-3">
                                                    <span className="flex-shrink-0 text-primary text-xs font-bold w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                        {idx + 1}
                                                    </span>
                                                    <span>{module.title}</span>
                                                </h3>
                                                <span className="flex-shrink-0 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-text-muted">
                                                    {module.videos?.length || 0} Lessons
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
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

                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                        <PlayCircle size={32} className="text-white ml-1" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                <div className="space-y-3">
                                    <ModernButton
                                        className="w-full justify-center !py-3 text-[15px] font-semibold"
                                        onClick={() => setShowEnrollModal(true)}
                                    >
                                        Enroll Now
                                    </ModernButton>

                                    {course.brochure_url && (
                                        <div className="flex gap-2 w-full">
                                            <button
                                                onClick={() => handleSecureAction(() => window.open(getMediaUrl(course.brochure_url), '_blank'))}
                                                className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold border border-white/20 rounded-xl hover:bg-white/5 transition-colors text-white"
                                            >
                                                <BookOpen size={16} />
                                                Download
                                            </button>
                                            <button
                                                onClick={() => handleSecureAction(handleShareBrochure)}
                                                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold border border-white/20 rounded-xl hover:bg-white/5 transition-colors text-white"
                                                title="Share Brochure"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        <GlassCard className="!p-8 border-primary/20 shadow-glow-purple">
                            <h3 className="text-xl font-black mb-6 flex items-center space-x-3">
                                <MessageSquare className="text-primary" size={20} />
                                <span>Direct Inquiry</span>
                            </h3>
                            <form className="space-y-4" onSubmit={handleInquirySubmit}>
                                {enquiryStatus.success ? (
                                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                                        <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                                        <p className="text-sm font-bold text-emerald-500">Inquiry Sent Successfully!</p>
                                        <p className="text-xs text-emerald-500/70">Our team will contact you within 24 hours.</p>
                                        <ModernButton variant="secondary" className="w-full mt-4" onClick={() => setEnquiryStatus({ ...enquiryStatus, success: false })}>
                                            Send Another
                                        </ModernButton>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Message</label>
                                            <textarea
                                                rows="3"
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                                                placeholder="What would you like to know?"
                                            ></textarea>
                                        </div>
                                        <ModernButton
                                            className="w-full justify-center !py-4"
                                            disabled={enquiryStatus.loading}
                                        >
                                            {enquiryStatus.loading ? 'Sending...' : (
                                                <>
                                                    <Send size={16} className="mr-2" />
                                                    Submit Request
                                                </>
                                            )}
                                        </ModernButton>
                                        {enquiryStatus.error && <p className="text-xs text-red-400 mt-2 text-center">{enquiryStatus.error}</p>}
                                    </>
                                )}
                            </form>
                        </GlassCard>
                    </div>
                    </div>

                    {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold flex items-center space-x-3">
                                    <span className="w-11 h-11 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400">
                                        <BookOpen size={20} />
                                    </span>
                                    <span>What You'll Learn</span>
                                </h2>
                                <span className="hidden sm:block text-xs font-semibold text-text-muted uppercase tracking-widest">{course.learning_outcomes.length} Outcomes</span>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
                                {course.learning_outcomes.map((outcome, i) => (
                                    <div key={i} className="h-full flex flex-col p-6 bg-white/[0.03] rounded-2xl border border-white/[0.06] hover:bg-white/[0.06] hover:border-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 group">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                                <CheckCircle2 size={18} />
                                            </div>
                                            <span className="text-[11px] font-bold text-white/15 tracking-widest">{String(i + 1).padStart(2, '0')}</span>
                                        </div>
                                        <span className="text-[15px] font-semibold text-text-secondary group-hover:text-white transition-colors leading-relaxed">{outcome}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {course.features && course.features.length > 0 && (
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold flex items-center space-x-3">
                                    <span className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Sparkles size={20} />
                                    </span>
                                    <span>Course Highlights</span>
                                </h2>
                                <span className="hidden sm:block text-xs font-semibold text-text-muted uppercase tracking-widest">{course.features.length} Highlights</span>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
                                {course.features.map((feature, i) => (
                                    <div key={i} className="h-full flex flex-col p-6 bg-white/[0.03] rounded-2xl border border-white/[0.06] hover:bg-white/[0.06] hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <span className="text-[11px] font-bold text-white/15 tracking-widest">{String(i + 1).padStart(2, '0')}</span>
                                        </div>
                                        <span className="text-[15px] font-semibold text-text-secondary group-hover:text-white transition-colors leading-relaxed">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>



            <Footer />

            {showEnrollModal && (
                <EnrollEnquiryModal course={course} onClose={() => setShowEnrollModal(false)} />
            )}
        </div>
    );
};

export default CourseDetail;
