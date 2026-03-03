import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Clock,
    Users,
    Star,
    Layout,
    PlayCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Send,
    MessageSquare,
    Sparkles,
    ShieldCheck,
    ArrowLeft
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/10 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
            >
                <span className="text-white font-medium group-hover:text-primary transition-colors pr-8">{question}</span>
                {isOpen ? <ChevronUp size={20} className="text-primary flex-shrink-0" /> : <ChevronDown size={20} className="text-white/30 flex-shrink-0" />}
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <p className="pb-5 text-text-secondary text-sm leading-relaxed">
                    {answer}
                </p>
            </motion.div>
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
    }, [courseId]);

    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        setEnquiryStatus({ loading: true, success: false, error: null });
        try {
            await axios.post('/api/enquiries', {
                ...formData,
                message: `Course Inquiry: ${course.title}\n\n${formData.message}`
            });
            setEnquiryStatus({ loading: false, success: true, error: null });
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            setEnquiryStatus({ loading: false, success: false, error: 'Failed to send inquiry. Please try again.' });
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

            {/* Hero Header */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary blur-[120px] rounded-full opacity-15"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600 blur-[120px] rounded-full opacity-10"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/courses')}
                        className="flex items-center space-x-2 text-text-secondary hover:text-white transition-colors mb-10 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Back to catalog</span>
                    </motion.button>

                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex flex-col mb-6">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/20 rounded-full font-black text-[10px] text-primary uppercase tracking-[0.3em] border border-primary/30">
                                        <Sparkles size={14} /> <span>{course.category}</span>
                                    </div>
                                    {(course.universityName || course.instructor?.profile?.universityName || (course.instructor?.role === 'university' && course.instructor?.name)) && (
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-l border-white/20 pl-4">
                                            Partnered with <span className="text-white">{course.universityName || course.instructor?.profile?.universityName || course.instructor?.name}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-1">
                                    Directed by {course.instructorName || course.instructor?.name || 'Academic Facilitator'}
                                </p>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black mb-8 leading-[1.1] tracking-tight font-jakarta">
                                {course.title}
                            </h1>
                            <p className="text-xl text-text-secondary mb-10 leading-relaxed font-inter opacity-90">
                                {course.description}
                            </p>

                            <div className="flex flex-wrap gap-8 mb-12">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                        <Users size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Students</p>
                                        <p className="font-bold text-lg">1,240+</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                        <Star size={20} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Rating</p>
                                        <p className="font-bold text-lg">4.9/5.0</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                        <Clock size={20} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Duration</p>
                                        <p className="font-bold text-lg">12h Content</p>
                                    </div>
                                </div>
                            </div>

                            <ModernButton
                                className="px-12 py-5 shadow-glow-gradient"
                                onClick={() => {
                                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                    if (userInfo) {
                                        navigate(`/dashboard/payment/${courseId}`);
                                    } else {
                                        navigate('/login', { state: { from: `/course/${courseId}` } });
                                    }
                                }}
                            >
                                Enroll for ${course.price?.toFixed(2) || '0.00'}
                            </ModernButton>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl group"
                        >
                            <img
                                src={course.thumbnail || `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200`}
                                alt={course.title}
                                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200";
                                }}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center text-white"
                                >
                                    <PlayCircle size={40} />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Curriculum & Details */}
            <section className="py-24 px-6 bg-white/[0.02] border-y border-white/10">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-16">
                    {/* Syllabus */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-2xl font-black mb-8 flex items-center space-x-4 tracking-tight">
                                <Layout className="text-primary" size={28} />
                                <span>Course Architecture</span>
                            </h2>
                            <div className="space-y-4">
                                {course.modules?.map((module, idx) => (
                                    <GlassCard key={idx} className="!p-6 border-white/5 hover:border-primary/20 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-lg flex items-center space-x-3">
                                                <span className="text-primary text-xs font-black w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">{idx + 1}</span>
                                                <span>{module.title}</span>
                                            </h3>
                                            <span className="text-xs text-text-muted font-bold uppercase tracking-widest">{module.videos?.length || 0} Sessions</span>
                                        </div>
                                        <div className="space-y-3">
                                            {module.videos?.map((video, vIdx) => (
                                                <div key={vIdx} className="flex items-center space-x-3 text-sm text-text-secondary">
                                                    <PlayCircle size={14} className="text-white/30" />
                                                    <span>{video.title}</span>
                                                    <span className="ml-auto text-xs text-text-muted">{video.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black mb-8 flex items-center space-x-4 tracking-tight">
                                <BookOpen className="text-purple-400" size={28} />
                                <span>Learning Outcomes</span>
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    "Master industry-standard frameworks",
                                    "Build production-grade applications",
                                    "Optimize system architecture",
                                    "Implement advanced security protocols",
                                    "Visualize deep-learning analytics",
                                    "Join the global talent matrix"
                                ].map((outcome, i) => (
                                    <div key={i} className="flex items-center space-x-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <CheckCircle2 size={18} className="text-emerald-400" />
                                        <span className="text-sm font-medium text-text-secondary">{outcome}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
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

            {/* FAQs */}
            <section className="py-24 px-6 bg-[#030014]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-black mb-12 text-center tracking-tight">Course Intelligence (FAQ)</h2>
                    <div className="space-y-2">
                        <FAQItem
                            question="Is this course suitable for complete beginners?"
                            answer="While we cover fundamental concepts, this course is designed for those with a basic understanding of logic. We provide a 'Bootstrap' module for absolute beginners."
                        />
                        <FAQItem
                            question="Will I receive a certification upon completion?"
                            answer="Yes, you will receive a verifiable digital certificate backed by our SkillDad Global Accreditation."
                        />
                        <FAQItem
                            question="Are the projects reviewed by instructors?"
                            answer="Absolutely. Every project submission receives granular feedback from our technical mentors."
                        />
                        <FAQItem
                            question="How long do I have access to the materials?"
                            answer="Life-time access. All updates and new sessions added to this version are included."
                        />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CourseDetail;
