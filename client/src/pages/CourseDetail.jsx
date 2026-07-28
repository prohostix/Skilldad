import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Users,
    Star,
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
    Share2
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05030B] via-[#080512] to-[#0B071A] text-white selection:bg-primary/30 relative">
            <Navbar />

            {/* Hero Header standard e-learning format */}
            <section className="pt-24 pb-16 px-6 relative overflow-hidden bg-black/40 border-b border-white/5">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary blur-[120px] rounded-full opacity-10"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/courses')}
                        className="flex items-center space-x-2 text-text-secondary hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Back to catalog</span>
                    </motion.button>

                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        {/* Left Side: Title and Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-8"
                        >
                            <div className="flex flex-col mb-4">
                                <div className="flex items-center gap-4 mb-4">
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
                            </div>
                            
                            <h1 className="text-2xl sm:text-4xl font-bold mb-4 leading-tight tracking-tight">
                                {course.title}
                            </h1>
                            <p className="text-base text-text-secondary mb-6 leading-relaxed font-inter opacity-90">
                                {course.description}
                            </p>

                            <div className="flex items-center gap-6 text-sm text-text-secondary mb-8 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Star size={16} className="text-amber-400 fill-amber-400" />
                                    <span className="font-semibold text-white">4.9/5.0</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={16} />
                                    <span>1,240+ students</span>
                                </div>
                            </div>
                            
                            <div className="text-sm text-text-muted">
                                Instructed by <span className="text-primary font-medium">{course.instructorName || course.instructor?.name || 'Academic Facilitator'}</span>
                            </div>
                        </motion.div>

                        {/* Right Side: Image and Pricing Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="lg:col-span-4 relative z-20"
                        >
                            <div className="bg-[#120D26] rounded-2xl border border-white/10 shadow-2xl p-1 overflow-hidden sticky top-24">
                                <div className="relative aspect-video rounded-xl overflow-hidden group">
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
                                
                                <div className="p-5">
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
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Curriculum & Details */}
            <section className="py-16 px-6 bg-white/[0.02] border-y border-white/10">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
                    {/* Syllabus */}
                    <div className="lg:col-span-2 space-y-12">
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

                        <div>
                            <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
                                <Layout className="text-primary" size={24} />
                                <span>Course Curriculum</span>
                            </h2>
                            <div className="space-y-6">
                                {course.modules?.map((module, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ x: 10 }}
                                        className="transition-all"
                                    >
                                        <GlassCard className="!p-8 border-white/5 hover:border-primary/30 transition-all shadow-xl hover:bg-white/[0.04]">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                <h3 className="font-bold text-lg flex items-center space-x-3">
                                                    <span className="text-primary text-sm font-bold w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                        {idx + 1}
                                                    </span>
                                                    <span>{module.title}</span>
                                                </h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-text-muted">
                                                        {module.videos?.length || 0} Lessons
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                {module.videos?.map((video, vIdx) => (
                                                    <div key={vIdx} className="flex items-center space-x-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-sm text-text-secondary hover:text-white transition-colors group">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 group-hover:text-primary transition-colors">
                                                            <PlayCircle size={16} />
                                                        </div>
                                                        <span className="font-bold flex-1">{video.title}</span>
                                                        <span className="text-[10px] font-black opacity-30">{video.duration}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

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

                        {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
                                    <BookOpen className="text-purple-400" size={24} />
                                    <span>What You'll Learn</span>
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {course.learning_outcomes.map((outcome, i) => (
                                        <div key={i} className="flex items-center space-x-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <span className="text-base font-bold text-text-secondary group-hover:text-white transition-colors">{outcome}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {course.features && course.features.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
                                    <Sparkles className="text-primary" size={24} />
                                    <span>Course Highlights</span>
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {course.features.map((feature, i) => (
                                        <div key={i} className="flex items-center space-x-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-primary/30 transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <span className="text-base font-bold text-text-secondary group-hover:text-white transition-colors">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Inquiry Form */}
                    <div className="space-y-8 sticky top-32 h-fit">
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

                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                            <div className="flex items-center space-x-3 mb-4">
                                <ShieldCheck className="text-emerald-400" size={20} />
                                <span className="text-sm font-bold">Safe & Secure Payment</span>
                            </div>
                            <p className="text-xs text-text-muted leading-relaxed">
                                Experience bank-grade encrypted transactions and a 30-day money-back guarantee.
                            </p>
                        </div>
                    </div>
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
