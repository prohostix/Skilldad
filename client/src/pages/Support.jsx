import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
    Mail, MessageSquare, Phone, ChevronDown, ChevronUp, Send, Search,
    PlayCircle, BookOpen, Rocket, User, CreditCard, Award,
    Smartphone, RefreshCcw, Video, HelpCircle, ArrowRight, LifeBuoy
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import axios from 'axios';

const FAQItem = ({ faq }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState(false);

    const handleHelpful = async (isHelpful) => {
        if (feedbackGiven) return;
        try {
            await axios.post(`/api/faqs/${faq._id}/feedback`, { isHelpful });
            setFeedbackGiven(true);
        } catch (error) {
            console.error("Feedback error", error);
        }
    };

    const handleToggle = async () => {
        if (!isOpen) {
            try {
                await axios.post(`/api/faqs/${faq._id}/view`);
            } catch (error) { }
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className={`group border border-white/5 rounded-2xl mb-3 overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white/[0.05] border-primary/20 shadow-lg shadow-primary/5' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}>
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between text-left p-5 focus:outline-none"
            >
                <div className="flex items-center gap-4">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-primary text-white shadow-glow-purple' : 'bg-white/5 text-white/40'}`}>
                        <HelpCircle size={18} />
                    </span>
                    <span className={`text-base font-bold transition-colors duration-300 ${isOpen ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>{faq.question}</span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-white/30'}`}>
                    <ChevronDown size={20} />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="px-5 pb-6 md:px-[72px] md:pb-8">
                            <div className="pt-2 text-text-secondary text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                                {faq.answer}
                            </div>

                            {(faq.demo_video_link || faq.help_link) && (
                                <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-white/5">
                                    {faq.demo_video_link && (
                                        <a href={faq.demo_video_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:text-primary-light text-sm font-bold transition-all group/link">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-colors group-hover/link:bg-primary/20">
                                                <PlayCircle size={16} />
                                            </div>
                                            Watch Guide Video
                                        </a>
                                    )}
                                    {faq.help_link && (
                                        <a href={faq.help_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-accent hover:text-white text-sm font-bold transition-all group/link">
                                            <div className="w-8 h-8 rounded-full bg-primary-accent/10 flex items-center justify-center transition-colors group-hover/link:bg-primary-accent/20">
                                                <BookOpen size={16} />
                                            </div>
                                            Read Documentation
                                        </a>
                                    )}
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <span className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">Was this helpful?</span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleHelpful(true)}
                                        disabled={feedbackGiven}
                                        className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${feedbackGiven ? 'opacity-50 cursor-not-allowed border-white/10 bg-white/5 text-white/40' : 'border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'}`}
                                    >
                                        Yes, it was
                                    </button>
                                    <button
                                        onClick={() => handleHelpful(false)}
                                        disabled={feedbackGiven}
                                        className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${feedbackGiven ? 'opacity-50 cursor-not-allowed border-white/10 bg-white/5 text-white/40' : 'border-white/10 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-white/50'}`}
                                    >
                                        No, I need more
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Support = () => {
    const location = useLocation();
    const [faqs, setFaqs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'Technical Issue', message: '' });
    const [loading, setLoading] = useState(false);

    const categories = [
        { id: 'All', label: 'All Topics', icon: HelpCircle, color: 'from-[#7C3AED] to-[#E879F9]' },
        { id: 'Getting Started', label: 'Basics', icon: Rocket, color: 'from-blue-600 to-cyan-500' },
        { id: 'Account & Login', label: 'Account', icon: User, color: 'from-purple-600 to-indigo-500' },
        { id: 'Course Enrollment', label: 'Learning', icon: BookOpen, color: 'from-emerald-600 to-teal-500' },
        { id: 'Live Classes', label: 'Live Sessions', icon: Video, color: 'from-rose-600 to-orange-500' },
        { id: 'Payments', label: 'Billing', icon: CreditCard, color: 'from-amber-600 to-yellow-500' },
        { id: 'Certificates & Graduation', label: 'Credentials', icon: Award, color: 'from-indigo-600 to-blue-500' },
        { id: 'Refunds & Cancellations', label: 'Refunds', icon: RefreshCcw, color: 'from-rose-600 to-pink-500' },
        { id: 'Mobile & Compatibility', label: 'Mobile', icon: Smartphone, color: 'from-violet-600 to-purple-500' }
    ];

    const isInDashboard = location.pathname.includes('/dashboard') ||
        location.pathname.includes('/admin') ||
        location.pathname.includes('/finance') ||
        location.pathname.includes('/partner') ||
        location.pathname.includes('/university');

    const fetchFaqs = async () => {
        try {
            const res = await axios.get('/api/faqs');
            setFaqs(res.data);
        } catch (error) {
            console.error("Failed to load FAQs", error);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const filteredFaqs = useMemo(() => {
        let results = faqs;
        if (selectedCategory !== 'All') {
            results = results.filter(faq => faq.category === selectedCategory);
        }
        if (searchQuery) {
            results = results.filter(faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return results;
    }, [faqs, selectedCategory, searchQuery]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = userInfo ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};
            await axios.post('/api/support', formData, config);
            alert(`Support ticket submitted! We will email you shortly.`);
            setFormData({ name: '', email: '', subject: 'Technical Issue', message: '' });
        } catch (error) {
            alert('Failed to submit ticket. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const containerClasses = isInDashboard
        ? "min-h-screen text-white font-inter"
        : "min-h-screen bg-black text-white font-inter relative overflow-hidden";

    return (
        <div className={containerClasses}>
            {!isInDashboard && <Navbar />}

            {/* Dynamic Background Effects */}
            {!isInDashboard && (
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-pulse-slow"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-accent/15 blur-[150px] rounded-full animate-pulse-slow delay-2000"></div>
                    <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow delay-1000"></div>
                </div>
            )}

            {/* Hero Section */}
            <div className={`relative ${isInDashboard ? 'pt-8' : 'pt-32 pb-24 md:pt-48 md:pb-32'}`}>
                {isInDashboard && (
                    <div className="max-w-7xl mx-auto px-6 mb-8 text-left">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors font-bold text-sm"
                        >
                            <ArrowRight size={16} className="rotate-180" /> Back to Dashboard
                        </button>
                    </div>
                )}
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        <div className="flex justify-center">
                            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary-accent text-xs font-black uppercase tracking-[0.3em] backdrop-blur-md">
                                <LifeBuoy size={14} className="animate-spin-slow" />
                                Support Excellence
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black text-white font-jakarta tracking-tight leading-none">
                            How can we <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary-accent to-white animate-gradient-x">help you?</span>
                        </h1>

                        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                            Empowering your educational journey with 24/7 technical assistance and comprehensive learning resources.
                        </p>

                        <div className="max-w-3xl mx-auto relative mt-16 group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary-accent/20 to-primary/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
                            <div className="relative">
                                <Search size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search for answers (e.g., 'refund policy', 'course access')..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl py-6 md:py-8 pl-18 md:pl-20 pr-8 text-lg font-medium focus:border-primary/50 backdrop-blur-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)] placeholder:text-white/20"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-32">
                {/* Category Grid */}
                {!searchQuery && (
                    <div className="flex gap-4 mb-24 overflow-x-auto pb-6 no-scrollbar snap-x">
                        {categories.map((cat, i) => (
                            <motion.button
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 + 0.5 }}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex-shrink-0 min-w-[160px] p-6 rounded-[32px] border transition-all duration-500 text-center flex flex-col items-center group relative overflow-hidden snap-start ${selectedCategory === cat.id
                                    ? 'bg-white/10 border-primary/40 shadow-2xl shadow-primary/20 -translate-y-2'
                                    : 'bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-1'
                                    }`}
                            >
                                {selectedCategory === cat.id && (
                                    <motion.div
                                        layoutId="cat-glow"
                                        className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-[0.15]`}
                                    />
                                )}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 shadow-lg ${selectedCategory === cat.id ? `bg-gradient-to-br ${cat.color} text-white shadow-glow-purple` : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white'
                                    }`}>
                                    <cat.icon size={26} strokeWidth={2} />
                                </div>
                                <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${selectedCategory === cat.id ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>{cat.label}</h3>
                            </motion.button>
                        ))}
                    </div>
                )}

                <div className="grid lg:grid-cols-12 gap-16">
                    {/* FAQ Content */}
                    <div className="lg:col-span-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-white font-jakarta flex items-center gap-4">
                                    <div className="w-2 h-10 bg-gradient-to-b from-primary to-primary-accent rounded-full"></div>
                                    {searchQuery ? `Search results` : selectedCategory}
                                </h2>
                                {searchQuery && <p className="text-white/40 mt-1 ml-6">Showing results for "{searchQuery}"</p>}
                            </div>

                            {(searchQuery || selectedCategory !== 'All') && (
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                    className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 group"
                                >
                                    Clear all filters
                                    <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-4 min-h-[400px]">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq, i) => (
                                    <motion.div
                                        key={faq._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <FAQItem faq={faq} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-32 bg-white/[0.02] rounded-[32px] border-2 border-white/5 border-dashed">
                                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                                        <MessageSquare size={40} className="text-white/20" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No answers found</h3>
                                    <p className="text-white/40 max-w-xs mx-auto">Try using different keywords or choosing a different category.</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                        className="mt-8 text-primary font-bold hover:underline"
                                    >
                                        Back to all topics
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Support Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
                        {/* Direct Contact */}
                        <div className="space-y-4">
                            <GlassCard className="!p-0 border-emerald-500/20 group hover:border-emerald-500/40 relative overflow-hidden bg-emerald-500/[0.02]">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <div className="p-8 relative z-10">
                                    <div className="flex items-start gap-5 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                                            <MessageSquare size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Live Assistance</h3>
                                            <p className="text-sm text-white/50">Average wait context: 2 mins</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm hover:scale-105 hover:shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2">
                                        Start Live Chat <ArrowRight size={16} />
                                    </button>
                                </div>
                            </GlassCard>

                            <GlassCard className="!p-0 border-primary/20 group hover:border-primary/40 relative overflow-hidden bg-primary/[0.02]">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <div className="p-8 relative z-10">
                                    <div className="flex items-start gap-5 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                                            <Phone size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Priority Voice</h3>
                                            <p className="text-sm text-white/50">Mon-Fri 9AM - 6PM EST</p>
                                        </div>
                                    </div>
                                    <a href="tel:1800SKILLDAD" className="block text-2xl font-black text-white text-center py-4 border-2 border-white/5 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all">
                                        +1 (800) SKILL-DAD
                                    </a>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Email Form */}
                        <GlassCard className="!p-8 relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-accent/5 blur-3xl rounded-full"></div>
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                                <Mail size={22} className="text-primary-accent" />
                                Send a Ticket
                            </h3>
                            <p className="text-sm text-white/40 mb-8 leading-relaxed">Response guaranteed within 12 working hours.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Case Category</label>
                                    <div className="relative">
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Technical Issue" className="bg-[#0f0f0f]">Technical Support</option>
                                            <option value="Billing Question" className="bg-[#0f0f0f]">Billing & Payments</option>
                                            <option value="Course Content" className="bg-[#0f0f0f]">Learning Assistance</option>
                                            <option value="Certification" className="bg-[#0f0f0f]">Certification Inquiry</option>
                                            <option value="Other" className="bg-[#0f0f0f]">General Inquiry</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Your Email</label>
                                    <input
                                        type="email"
                                        placeholder="alex@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/10 focus:border-primary focus:outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Description</label>
                                    <textarea
                                        rows="5"
                                        placeholder="How can we help? Please provide details..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/10 focus:border-primary focus:outline-none transition-all resize-none"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-primary-accent text-white font-bold text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                                >
                                    {loading ? (
                                        <RefreshCcw size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            Initialize Ticket
                                        </>
                                    )}
                                </button>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            </div>

            {/* Newsletter/Community Section */}
            {!isInDashboard && (
                <div className="max-w-7xl mx-auto px-6 pb-32">
                    <GlassCard className="!p-12 md:p-20 text-center relative overflow-hidden border-primary/10">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-accent/5"></div>
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-3xl md:text-5xl font-black text-white font-jakarta tracking-tight">
                                Join the SkillDad community of learners
                            </h2>
                            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
                                Get instant support from peers and industry experts in our vibrant learning discord.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                                <ModernButton variant="primary" className="!px-10 !py-4">
                                    Join Community Discord
                                </ModernButton>
                                <ModernButton variant="secondary" className="!px-10 !py-4">
                                    Browse Student Guide
                                </ModernButton>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {!isInDashboard && <Footer />}
        </div>
    );
};

export default Support;
