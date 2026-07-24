import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Mail, MessageSquare, Phone, ChevronDown, ChevronUp, Send, Search,
    PlayCircle, BookOpen, Rocket, User, CreditCard, Award,
    Smartphone, RefreshCcw, Video, HelpCircle, ArrowRight, LifeBuoy,
    Briefcase, Gift, Shield, Zap, Globe, CheckCircle2, Clock, AlertCircle, Ticket
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import DashboardHeading from '../components/ui/DashboardHeading';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const STATIC_FAQS = [];

const FAQItem = ({ faq }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState(false);

    const handleHelpful = async (isHelpful) => {
        if (feedbackGiven) return;
        try {
            await axios.post(`/api/faqs/${faq._id}/feedback`, { isHelpful });
            setFeedbackGiven(true);
        } catch (error) { console.error("Feedback error", error); }
    };

    const handleToggle = async () => {
        if (!isOpen) {
            try { await axios.post(`/api/faqs/${faq._id}/view`); } catch (error) { }
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className={`border-b border-white/5 transition-all duration-300 ${isOpen ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'}`}>
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between text-left py-6 px-4 focus:outline-none group"
            >
                <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono leading-none">
                        {faq.category || 'General Help'}
                    </span>
                    <span className={`text-sm md:text-md font-bold transition-colors ${isOpen ? 'text-primary' : 'text-white/80 group-hover:text-white'}`}>
                        {faq.question}
                    </span>
                </div>
                <div className={`p-2 rounded-full border border-white/5 transition-all ${isOpen ? 'rotate-180 bg-primary/10 border-primary/30 text-primary' : 'text-white/20'}`}>
                    <ChevronDown size={16} />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="faq-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-4 pb-8 pt-2">
                            <div className="text-white/60 text-sm leading-relaxed max-w-3xl space-y-2">
                                {faq.answer.split('\n').map((line, idx) => {
                                    const trimmed = line.trim();
                                    if (!trimmed) return null;
                                    // Numbered list: "1. text" or "1) text"
                                    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
                                    if (numberedMatch) {
                                        return (
                                            <div key={idx} className="flex gap-2.5 items-start">
                                                <span className="shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center mt-0.5">{numberedMatch[1]}</span>
                                                <span>{numberedMatch[2]}</span>
                                            </div>
                                        );
                                    }
                                    // Bullet: lines starting with * or - or •
                                    if (/^[*\-•]\s+/.test(trimmed)) {
                                        return (
                                            <div key={idx} className="flex gap-2.5 items-start">
                                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                                                <span>{trimmed.replace(/^[*\-•]\s+/, '')}</span>
                                            </div>
                                        );
                                    }
                                    // Inline bullets separated by " * " within a line
                                    if (trimmed.includes(' * ')) {
                                        const parts = trimmed.split(' * ').filter(Boolean);
                                        return (
                                            <div key={idx} className="space-y-1.5">
                                                {parts.map((part, pi) => (
                                                    <div key={pi} className="flex gap-2.5 items-start">
                                                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                                                        <span>{part}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return <p key={idx}>{trimmed}</p>;
                                })}
                            </div>
                            
                            {(faq.demo_video_link || faq.help_link) && (
                                <div className="flex gap-4 mt-6">
                                    {faq.demo_video_link && (
                                        <button className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-all">
                                            <PlayCircle size={12} /> Watch Demo
                                        </button>
                                    )}
                                    {faq.help_link && (
                                        <button className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                                            <BookOpen size={12} /> Doc Guide
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="mt-8 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                <span>Was this helpful?</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleHelpful(true)} className={`px-3 py-1 rounded border ${feedbackGiven ? 'opacity-50' : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'}`}>Yes</button>
                                    <button onClick={() => handleHelpful(false)} className={`px-3 py-1 rounded border ${feedbackGiven ? 'opacity-50' : 'border-rose-500/20 text-rose-500 hover:bg-rose-500/10'}`}>No</button>
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
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [faqs, setFaqs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'Technical Issue', message: '' });
    const [loading, setLoading] = useState(false);
    const [myTickets, setMyTickets] = useState([]);
    const [loadingMyTickets, setLoadingMyTickets] = useState(false);

    const isInDashboard = location.pathname.includes('/dashboard') ||
        location.pathname.includes('/admin') ||
        location.pathname.includes('/finance') ||
        location.pathname.includes('/partner') ||
        location.pathname.includes('/university');

    const fetchFaqs = async () => {
        try {
            const res = await axios.get('/api/faqs');
            const dynamicFaqs = res.data || [];
            const merged = [...STATIC_FAQS];
            dynamicFaqs.forEach(df => {
                if (!merged.find(sf => sf._id === df._id)) merged.push(df);
            });
            setFaqs(merged);
        } catch (error) {
            console.error("Failed to load FAQs", error);
            setFaqs(STATIC_FAQS);
        }
    };

    const fetchMyTickets = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;
        try {
            setLoadingMyTickets(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/support/my', config);
            setMyTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch my support tickets:', error);
        } finally {
            setLoadingMyTickets(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setFormData(prev => ({ ...prev, name: userInfo.name || '', email: userInfo.email || '' }));
            fetchMyTickets();
        }
    }, []);

    useEffect(() => {
        if (location.hash === '#ticket-form') {
            setTimeout(() => {
                document.getElementById('ticket-form')?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    }, [location]);

    // Derive Categories Dynamically
    const categories = useMemo(() => {
        const base = ['All', ...new Set(faqs.map(f => f.category).filter(Boolean))];
        return base.map(cat => ({
            id: cat,
            label: cat === 'All' ? 'Knowledge Base' : cat,
            icon: cat === 'Career & Placements' ? Briefcase : (cat === 'Rewards & Referrals' ? Gift : HelpCircle)
        }));
    }, [faqs]);

    const filteredFaqs = useMemo(() => {
        let results = faqs;
        if (selectedCategory !== 'All') results = results.filter(faq => faq.category === selectedCategory);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            results = results.filter(faq => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q));
        }
        return results;
    }, [faqs, selectedCategory, searchQuery]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login', { state: { from: '/support#ticket-form' } });
            return;
        }

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('/api/support', formData, config);
            showToast('Ticket raised successfully! We will get back to you shortly.', 'success');
            setFormData(prev => ({ ...prev, message: '' }));
            fetchMyTickets();
        } catch (error) {
            showToast('Failed to submit ticket. Please try again.', 'error');
        } finally { setLoading(false); }
    };

    return (
        <div className={`min-h-screen bg-[#050505] text-white font-inter pb-20 ${!isInDashboard && 'relative'}`}>
            {!isInDashboard && <Navbar />}

            {/* Premium Hero Section */}
            <div className={`relative overflow-hidden ${isInDashboard ? 'pt-8' : 'pt-40 pb-24 md:pt-48 md:pb-40'}`}>
                {/* Background Atmosphere */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-primary/10 blur-[180px] rounded-full animate-pulse-slow"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[180px] rounded-full animate-pulse-slow delay-2000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono mb-4 block leading-none">
                                HELP_CENTER_V2.0
                            </span>
                            <h1 className="text-4xl md:text-7xl font-black font-inter tracking-tighter leading-[0.9] mb-8">
                                <span className="opacity-40">Knowledge Hub &</span> <br className="hidden md:block" />
                                <span className="premium-gradient-text">Support</span>
                            </h1>
                            <p className="text-white/40 text-sm md:text-md max-w-xl mx-auto font-medium leading-relaxed">
                                Get instant answers or reach out to our subject matter experts for advanced assistance.
                            </p>
                        </motion.div>

                        <div className="relative mt-12">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-3xl blur-xl opacity-0 transition duration-500 group-focus-within:opacity-100"></div>
                            <div className="relative flex items-center">
                                <Search size={20} className="absolute left-6 text-white/20" />
                                <input
                                    type="text"
                                    placeholder="Search documentation, career guides, or help topics..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl py-6 pl-16 pr-8 text-sm focus:border-primary/50 backdrop-blur-2xl focus:outline-none transition-all shadow-2xl placeholder:text-white/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Assisted Path */}
            <div className="max-w-7xl mx-auto px-6 mb-24 grid md:grid-cols-3 gap-4">
                {[
                    { title: 'Career Guide', desc: 'Step-by-step application process', icon: Zap, action: () => window.dispatchEvent(new CustomEvent('open-career-guide')), color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { title: 'Live Sessions', desc: 'Track your upcoming classes', icon: Video, action: () => navigate('/dashboard/live-classes'), color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                    { title: 'Tech Status', desc: 'System online & optimized', icon: Shield, action: null, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                ].map((item, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: i * 0.1 }}
                        onClick={item.action}
                        className={`p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group flex items-start gap-5`}
                    >
                        <div className={`p-4 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                            <item.icon size={22} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                            <p className="text-[11px] text-white/40 font-medium">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-12 gap-16">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Student Raised Tickets Section */}
                        {myTickets.length > 0 && (
                            <div className="space-y-4 mb-12">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                            <Ticket size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white">My Support Tickets</h3>
                                            <p className="text-xs text-white/40">Track your submitted queries and admin responses</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                                        {myTickets.length} Raised
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {myTickets.map((ticket) => {
                                        const isResolved = ticket.status?.toLowerCase() === 'resolved';
                                        const isInProgress = ticket.status?.toLowerCase() === 'in progress' || ticket.status?.toLowerCase() === 'in_progress';
                                        
                                        return (
                                            <GlassCard key={ticket._id || ticket.id} className="p-5 border-white/10 hover:border-primary/30 transition-all">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-white/60 font-bold uppercase">
                                                            {ticket.subject || 'General'}
                                                        </span>
                                                        <span className="text-xs text-white/40 font-medium">
                                                            • {new Date(ticket.created_at || ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    
                                                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border shrink-0 flex items-center gap-1.5 w-fit ${
                                                        isResolved
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-950/20'
                                                            : isInProgress
                                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                            : 'bg-primary/10 text-primary border-primary/20'
                                                    }`}>
                                                        {isResolved ? <CheckCircle2 size={12} /> : isInProgress ? <Clock size={12} /> : <AlertCircle size={12} />}
                                                        {ticket.status || 'Open'}
                                                    </span>
                                                </div>

                                                <p className="text-sm font-semibold text-white/90 mb-3 leading-relaxed">
                                                    {ticket.message}
                                                </p>

                                                {/* Admin Response Box */}
                                                {ticket.admin_response ? (
                                                    <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 space-y-1.5 backdrop-blur-md">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                                                <CheckCircle2 size={15} /> Admin Response & Resolution
                                                            </div>
                                                            <span className="text-[10px] text-emerald-400/60 font-mono">Official Support</span>
                                                        </div>
                                                        <p className="text-xs font-medium text-emerald-100/90 leading-relaxed whitespace-pre-wrap pl-0.5">
                                                            {ticket.admin_response}
                                                        </p>
                                                        {ticket.updated_at && (
                                                            <p className="text-[10px] text-emerald-400/40 pt-1">
                                                                Resolved at: {new Date(ticket.updated_at).toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-white/30 text-[11px] flex items-center gap-2 italic">
                                                        <Clock size={13} /> Waiting for admin review and response...
                                                    </div>
                                                )}
                                            </GlassCard>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Dynamic Category Tabs */}
                        <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar border-b border-white/5">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white/60 bg-white/5'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                             <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono mb-6">
                                TOTAL_RESULTS: {filteredFaqs.length}
                            </div>
                            
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq) => (
                                    <FAQItem key={faq._id} faq={faq} />
                                ))
                            ) : (
                                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No matching documentation</p>
                                </div>
                            )}
                        </div>

                        {/* Direct Support Section */}
                        <div className="mt-24 p-12 rounded-[32px] border border-white/5 bg-gradient-to-tr from-white/[0.02] to-transparent relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                <Globe size={200} />
                            </div>
                            <div className="relative z-10 max-w-xl">
                                <h2 className="text-3xl font-bold text-white mb-4">Still need assistance?</h2>
                                <p className="text-white/40 text-sm font-medium leading-relaxed mb-10">
                                    Our dedicated support engineers are on standby. Reach out via the official channel or start a live session for immediate technical help.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <ModernButton 
                                        variant="primary" 
                                        className="!px-8"
                                        onClick={() => document.getElementById('ticket-form')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        Raise a Support Ticket
                                    </ModernButton>
                                    <div className="flex items-center gap-4 px-6 border-l border-white/10">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Wait Time</p>
                                            <p className="text-sm font-bold text-emerald-400">&lt; 15 Mins</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono mb-4 text-left">
                            COMMUNICATION_CHANNELS
                        </div>

                        <GlassCard id="ticket-form" className="!p-8 !rounded-3xl border-primary/20 space-y-8 scroll-mt-24">
                            <div>
                                <h3 className="text-md font-bold text-white mb-2">Raise a Ticket</h3>
                                <p className="text-xs text-white/40">Response guaranteed in 12-24 hours</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Case Category</label>
                                    <select 
                                        value={formData.subject}
                                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:border-primary outline-none"
                                    >
                                        <option value="Technical Issue" className="bg-black">Technical Support</option>
                                        <option value="Career & Placements" className="bg-black">Jobs & Careers</option>
                                        <option value="Billing" className="bg-black">Payments & Billing</option>
                                        <option value="Course Content" className="bg-black">Academic Content</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Email</label>
                                    <input 
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:border-primary outline-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                                    <textarea 
                                        rows="4"
                                        placeholder="Describe your issue in detail..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white focus:border-primary outline-none resize-none"
                                        required
                                    />
                                </div>

                                <button 
                                    disabled={loading}
                                    className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <RefreshCcw size={14} className="animate-spin" /> : <><Send size={14} /> Raise Ticket</>}
                                </button>
                            </form>
                        </GlassCard>

                        {/* Contact List */}
                        <div className="space-y-3">
                            {[
                                { label: 'Priority Support', val: '+1 (800) SKILL-DAD', icon: Phone },
                                { label: 'Official Correspondence', val: 'support@skilldad.ai', icon: Mail },
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center gap-4 group cursor-pointer hover:bg-white/[0.04] transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-primary transition-colors">
                                        <item.icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                                        <p className="text-xs font-bold text-white/80">{item.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {!isInDashboard && <Footer />}
        </div>
    );
};

export default Support;
