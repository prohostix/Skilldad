import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Mail, MessageSquare, Phone, ChevronDown, ChevronUp, Send, Search,
    PlayCircle, BookOpen, Rocket, User, CreditCard, Award,
    Smartphone, RefreshCcw, Video, HelpCircle, ArrowRight, LifeBuoy,
    Briefcase, Gift, Shield, Zap, Globe, CheckCircle2, Clock, AlertCircle, Ticket, X
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import DashboardHeading from '../components/ui/DashboardHeading';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const highlightMatch = (text, query) => {
    if (!text || !query || !query.trim()) return text;
    const cleanQuery = query.trim();
    const parts = text.split(new RegExp(`(${cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
        part.toLowerCase() === cleanQuery.toLowerCase() ? (
            <mark key={i} className="bg-primary/30 text-white rounded px-1 py-0.5 font-bold">
                {part}
            </mark>
        ) : (
            part
        )
    );
};

const STATIC_FAQS = [
    {
        _id: 'static-faq-1',
        question: 'How to create a new SkillDad account',
        answer: "Welcome to SkillDad! Creating an account is quick and simple:\n\n1. Click on the 'Register' button located at the top-right corner of the website.\n2. Enter your Full Name, Email Address, and create a strong Password.\n3. Verify your phone number with the OTP code sent via SMS.\n4. Select your role as 'Student' to access course materials.\n5. Click 'Create Account'.\n\nYou will instantly receive a welcome email with your credentials and a quick-start guide to navigate the platform.",
        category: 'Getting Started',
        help_link: '/support'
    },
    {
        _id: 'static-faq-2',
        question: 'How to enroll in courses and learning tracks',
        answer: "To start learning, you need to enroll in a course or learning track:\n\n1. From your Dashboard or the main menu, navigate to the 'Course Catalog'.\n2. Browse through our available programs or use the search bar to find a specific topic.\n3. Click on the course card to view detailed information, curriculum, and instructor details.\n4. Click the 'Enroll Now' button on the course page.\n5. You will be redirected to the secure payment gateway. Complete your transaction using a Card, Net Banking, or UPI.\n6. Once payment is successful, the course will instantly appear under 'My Courses' in your Student Dashboard.",
        category: 'Courses'
    },
    {
        _id: 'static-faq-3',
        question: 'How to join live classes and Zoom sessions',
        answer: "Live sessions are deeply integrated into the SkillDad platform. You do not need external software:\n\n1. Log into your Student Dashboard.\n2. On the left sidebar, click on 'Live Classes'.\n3. Here you will see all 'Upcoming Sessions' for courses you are enrolled in.\n4. When a session is within 15 minutes of its scheduled start time, the 'Join Session' button will light up.\n5. Click 'Join Session' to enter our integrated Web Viewer.",
        category: 'Live Classes',
        help_link: '/dashboard/live-classes'
    },
    {
        _id: 'static-faq-4',
        question: 'How to apply for job and internship',
        answer: 'Navigate to the Career & Placements portal in your student dashboard. Browse the available vacancies in the "Jobs" or "Internships" tabs. Click on any listing to view details, requirements, and job description, then click "Apply" to submit your profile and resume.',
        category: 'Career & Placements',
        help_link: '/dashboard/placements'
    },
    {
        _id: 'static-faq-5',
        question: 'Payment is failing, declined or stuck',
        answer: "If your payment is failing during checkout, please try these steps:\n\n1. Double-check your card details (Expiry Date, CVV) or UPI ID.\n2. Ensure your card is authorized for online transactions.\n3. If using UPI, ensure your UPI app is actively running and approve the request within 5 minutes.\n\nIf money was deducted but the course is not showing in your dashboard, please DO NOT pay again. Contact our Support team or raise a ticket with your Transaction ID, and we will manually verify within 2 hours.",
        category: 'Payments'
    },
    {
        _id: 'static-faq-6',
        question: 'Where can I find invoice and billing history?',
        answer: 'You can download all your transaction receipts directly from your dashboard:\n\n1. Go to your Student Dashboard.\n2. Click on the Payment History tab in the left sidebar.\n3. Here you will see a list of all your past transactions and payments.\n4. Click on any transaction to download or view your invoice receipt.',
        category: 'Payments',
        help_link: '/dashboard/payment-history'
    },
    {
        _id: 'static-faq-7',
        question: 'How does the Refer & Earn program work?',
        answer: 'Share your unique referral code with friends. When they join SkillDad using your link and enroll, you earn reward points instantly. These points are tracked in your Reward Wallet and can be redeemed for course discounts or exclusive benefits.',
        category: 'Rewards & Referrals',
        help_link: '/dashboard/reward-wallet'
    },
    {
        _id: 'static-faq-8',
        question: 'I forgot my password / How to reset my password?',
        answer: "If you cannot log into your account, you can easily restore access:\n\n1. Go to the SkillDad Login page.\n2. Click the 'Forgot Password?' link below the password field.\n3. Enter the email address associated with your account and click 'Send Reset Link'.\n4. Check your inbox (and spam folder) for an email from SkillDad.\n5. Click the secure link to set your new password.",
        category: 'Account & Login',
        help_link: '/forgot-password'
    },
    {
        _id: 'static-faq-9',
        question: 'How do I download my certificate after course completion?',
        answer: 'Upon completing all course modules, lessons, and required quizzes or project submissions with a passing score, your Certificate of Completion will automatically be generated in your dashboard under Documents > Certificates. You can download it as a high-resolution PDF with verifiable credentials.',
        category: 'Documents & Certificates',
        help_link: '/dashboard/documents'
    },
    {
        _id: 'static-faq-10',
        question: 'Video playback is stuttering or buffering',
        answer: "If you face video buffering:\n\n1. The player automatically adjusts to your internet speed, but you can manually click the gear icon on the video player to select 720p or 480p.\n2. Clear your browser cache and cookies, then refresh the page.\n3. Ensure no heavy downloads or torrents are running on your connection.\n4. If using a VPN, temporarily disable it.",
        category: 'Technical Issues'
    },
    {
        _id: 'static-faq-11',
        question: 'Do I get a university certificate?',
        answer: 'Yes! Upon successful completion of a university-affiliated course, you receive a digital certificate co-branded by SkillDad and the respective partner university. This certificate is globally verifiable.',
        category: 'Universities'
    },
    {
        _id: 'static-faq-12',
        question: 'Can I access course materials offline?',
        answer: 'While video streaming requires an internet connection, you can download all reading materials, source code, and project briefs for offline study via the SkillDad portal.',
        category: 'Courses'
    }
];

const FAQItem = ({ faq, isForceOpen, searchQuery }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState(false);

    useEffect(() => {
        if (isForceOpen !== undefined) {
            setIsOpen(isForceOpen);
        }
    }, [isForceOpen]);

    const handleHelpful = async (isHelpful) => {
        if (feedbackGiven) return;
        try {
            await axios.post(`/api/faqs/${faq._id || faq.id}/feedback`, { isHelpful });
            setFeedbackGiven(true);
        } catch (error) { console.error("Feedback error", error); }
    };

    const handleToggle = async () => {
        if (!isOpen) {
            try { await axios.post(`/api/faqs/${faq._id || faq.id}/view`); } catch (error) { }
        }
        setIsOpen(!isOpen);
    };

    return (
        <div id={`faq-${faq._id || faq.id}`} className={`border-b border-white/5 transition-all duration-300 rounded-xl ${isOpen ? 'bg-white/[0.03] shadow-sm my-1 border border-primary/20' : 'hover:bg-white/[0.01]'}`}>
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between text-left py-6 px-4 focus:outline-none group"
            >
                <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono leading-none">
                        {faq.category || 'General Help'}
                    </span>
                    <span className={`text-sm md:text-md font-bold transition-colors ${isOpen ? 'text-primary' : 'text-white/80 group-hover:text-white'}`}>
                        {highlightMatch(faq.question, searchQuery)}
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
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedFaqId, setSelectedFaqId] = useState(null);
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);
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
                if (!merged.find(sf => (sf._id && sf._id === df._id) || (sf.question && sf.question.toLowerCase() === (df.question || '').toLowerCase()))) {
                    merged.push(df);
                }
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
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    // Matches for the live floating autocomplete dropdown
    const dropdownMatches = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];
        return faqs.filter(faq => {
            const question = (faq.question || '').toLowerCase();
            const answer = (faq.answer || '').toLowerCase();
            const category = (faq.category || '').toLowerCase();
            const tags = Array.isArray(faq.tags) ? faq.tags.join(' ').toLowerCase() : '';
            return question.includes(q) || answer.includes(q) || category.includes(q) || tags.includes(q);
        });
    }, [faqs, searchQuery]);

    // Filtered FAQs for the main Knowledge Base section
    const filteredFaqs = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        let results = faqs;

        if (q) {
            results = results.filter(faq => {
                const question = (faq.question || '').toLowerCase();
                const answer = (faq.answer || '').toLowerCase();
                const category = (faq.category || '').toLowerCase();
                const tags = Array.isArray(faq.tags) ? faq.tags.join(' ').toLowerCase() : '';
                return question.includes(q) || answer.includes(q) || category.includes(q) || tags.includes(q);
            });

            if (selectedCategory !== 'All') {
                const categoryFiltered = results.filter(faq => faq.category === selectedCategory);
                if (categoryFiltered.length > 0) {
                    results = categoryFiltered;
                }
            }
        } else {
            if (selectedCategory !== 'All') {
                results = results.filter(faq => faq.category === selectedCategory);
            }
        }
        return results;
    }, [faqs, selectedCategory, searchQuery]);

    const handleSearchSubmit = () => {
        setShowDropdown(false);
        const faqSec = document.getElementById('faq-section');
        if (faqSec) {
            faqSec.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSelectFaq = (faq) => {
        const id = faq._id || faq.id;
        setSelectedFaqId(id);
        setShowDropdown(false);
        setTimeout(() => {
            const element = document.getElementById(`faq-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                handleSearchSubmit();
            }
        }, 100);
    };

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
            <div className={`relative overflow-hidden ${isInDashboard ? 'pt-8 pb-10' : 'pt-32 pb-14 md:pt-40 md:pb-20'}`}>
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
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-inter tracking-tighter leading-[0.9] mb-8">
                                <span className="premium-gradient-text">Knowledge Hub &</span> <br className="hidden md:block" />
                                <span className="premium-gradient-text">Support</span>
                            </h1>
                            <p className="text-white/40 text-sm md:text-md max-w-xl mx-auto font-medium leading-relaxed">
                                Get instant answers or reach out to our subject matter experts for advanced assistance.
                            </p>
                        </motion.div>

                        {/* Search Bar with live autocomplete and direct action */}
                        <div ref={dropdownRef} className="relative mt-12 max-w-2xl mx-auto group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-blue-500/40 rounded-3xl blur-xl opacity-0 transition duration-500 group-focus-within:opacity-100"></div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSearchSubmit();
                                }}
                                className="relative flex items-center"
                            >
                                <Search size={20} className="absolute left-6 text-white/40 pointer-events-none" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search documentation, career guides, or help topics..."
                                    value={searchQuery}
                                    onFocus={() => { if (searchQuery.trim()) setShowDropdown(true); }}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') setShowDropdown(false);
                                    }}
                                    className="w-full bg-white/[0.05] border border-white/15 rounded-2xl md:rounded-3xl py-5 md:py-6 pl-16 pr-28 text-sm md:text-base text-white focus:border-primary/70 backdrop-blur-2xl focus:outline-none transition-all shadow-2xl placeholder:text-white/30"
                                />

                                <div className="absolute right-3 flex items-center gap-1.5">
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setShowDropdown(false);
                                                setSelectedFaqId(null);
                                            }}
                                            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                            title="Clear search"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md shadow-primary/25"
                                    >
                                        <span>Search</span>
                                        <ArrowRight size={13} />
                                    </button>
                                </div>
                            </form>

                            {/* Live Search Results Dropdown Popover */}
                            <AnimatePresence>
                                {showDropdown && searchQuery.trim().length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute left-0 right-0 top-full mt-3 bg-[#0a0618]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 text-left divide-y divide-white/5"
                                    >
                                        <div className="p-3 px-4 bg-white/[0.02] flex items-center justify-between text-xs text-white/50">
                                            <span>
                                                Found <strong className="text-primary-accent font-bold">{dropdownMatches.length}</strong> {dropdownMatches.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                                            </span>
                                            <span className="text-[10px] text-white/30 font-mono">Press Enter to view all</span>
                                        </div>

                                        <div className="max-h-[340px] overflow-y-auto py-1">
                                            {dropdownMatches.length > 0 ? (
                                                dropdownMatches.slice(0, 5).map((faq) => (
                                                    <div
                                                        key={faq._id || faq.id}
                                                        onClick={() => handleSelectFaq(faq)}
                                                        className="p-3.5 px-4 hover:bg-white/[0.06] cursor-pointer transition-colors group/item flex items-start gap-3"
                                                    >
                                                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                                                            <HelpCircle size={15} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5">
                                                                    {faq.category || 'General'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs md:text-sm font-semibold text-white group-hover/item:text-primary transition-colors line-clamp-1">
                                                                {highlightMatch(faq.question, searchQuery)}
                                                            </p>
                                                            <p className="text-[11px] text-white/40 line-clamp-1 mt-0.5">
                                                                {faq.answer?.replace(/[#*•\d.)]/g, '').trim()}
                                                            </p>
                                                        </div>
                                                        <ArrowRight size={14} className="text-white/20 group-hover/item:text-primary group-hover/item:translate-x-1 transition-all shrink-0 self-center" />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-8 text-center px-4 space-y-2">
                                                    <p className="text-xs text-white/50 font-medium">No matching articles found for "{searchQuery}"</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('ticket-form')?.scrollIntoView({ behavior: 'smooth' })}
                                                        className="text-xs text-primary font-bold hover:underline"
                                                    >
                                                        Need help? Raise a Support Ticket &rarr;
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {dropdownMatches.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleSearchSubmit}
                                                className="w-full py-3 px-4 text-center text-xs font-bold text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <span>View all {dropdownMatches.length} results in Knowledge Base</span>
                                                <ChevronDown size={14} />
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
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

                        {/* Dynamic Category Tabs & Knowledge Base */}
                        <div id="faq-section" className="scroll-mt-24">
                            {searchQuery.trim() && (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-4 rounded-xl bg-primary/10 border border-primary/25 mb-6 backdrop-blur-md">
                                    <div className="flex items-center gap-2.5 text-xs">
                                        <Search size={15} className="text-primary shrink-0" />
                                        <span className="text-white/80">
                                            Search results for <strong className="text-white font-bold">"{searchQuery}"</strong> ({filteredFaqs.length} {filteredFaqs.length === 1 ? 'match' : 'matches'})
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedFaqId(null);
                                        }}
                                        className="text-xs font-bold text-primary hover:text-white flex items-center gap-1 transition-colors self-start sm:self-auto"
                                    >
                                        <X size={13} /> Clear Search
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar border-b border-white/5">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${selectedCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/30 hover:text-white/60 bg-white/5'}`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono mb-6 flex items-center justify-between">
                                    <span>TOTAL_RESULTS: {filteredFaqs.length}</span>
                                    {selectedFaqId && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFaqId(null)}
                                            className="text-primary hover:underline text-[10px] font-bold normal-case"
                                        >
                                            Reset Expanded View
                                        </button>
                                    )}
                                </div>
                                
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq) => (
                                        <FAQItem 
                                            key={faq._id || faq.id} 
                                            faq={faq} 
                                            isForceOpen={selectedFaqId === (faq._id || faq.id) || (Boolean(searchQuery.trim()) && filteredFaqs.length <= 3)}
                                            searchQuery={searchQuery}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl space-y-3">
                                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">No matching documentation found</p>
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setSelectedCategory('All');
                                                    setSelectedFaqId(null);
                                                }}
                                                className="text-xs text-primary font-bold hover:underline block mx-auto"
                                            >
                                                Clear search and view all articles
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
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
