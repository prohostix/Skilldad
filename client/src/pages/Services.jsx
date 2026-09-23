import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    Award,
    Briefcase,
    Plane,
    Globe,
    Brain,
    Smartphone,
    Cloud,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    Zap,
    Layers,
    ChevronDown,
    Sparkles,
    Building2,
    Video,
    Users,
    ClipboardCheck,
    Headphones,
    Database,
    Code,
    Shield,
    Check
} from 'lucide-react';

import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

// Dynamic Icon resolver with fallback
const iconMap = {
    GraduationCap,
    Award,
    Briefcase,
    Plane,
    Globe,
    Brain,
    Smartphone,
    Cloud,
    ClipboardCheck,
    Video,
    Users,
    Headphones,
    Database,
    Code,
    Shield,
    BookOpen: GraduationCap
};

const DynamicIcon = ({ name, size = 20, className = '' }) => {
    const Component = iconMap[name] || Briefcase;
    return <Component size={size} className={className} />;
};

// ── INNOVATIVE & ATTRACTIVE CUSTOM ICONS FOR HERO FLOATING CARDS ──

// 1. Unique Skill Courses Icon: Academic Mortarboard with Gradient Crown, Golden Accent & Knowledge Star
const UniqueSkillCoursesIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="scGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#4C1D95" />
            </linearGradient>
            <linearGradient id="scGold" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="1" stopColor="#EAB308" />
            </linearGradient>
        </defs>
        {/* Cap Diamond Top */}
        <path d="M12 3.5L2.5 8L12 12.5L21.5 8L12 3.5Z" fill="url(#scGrad)" stroke="#4C1D95" strokeWidth="1.2" strokeLinejoin="round" />
        {/* Inner Facet Highlighting */}
        <path d="M12 4.2L4 8L12 11.8L20 8L12 4.2Z" fill="white" fillOpacity="0.25" />
        {/* Cap Skull Base */}
        <path d="M6.5 10V14.5C6.5 14.5 8.8 17 12 17C15.2 17 17.5 14.5 17.5 14.5V10" stroke="url(#scGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Hanging Tassel */}
        <path d="M19.5 9V14.5C19.5 15.2 19 15.8 18.2 15.8C17.5 15.8 17 15.2 17 14.5V10.5" stroke="#A855F7" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="18.2" cy="16.2" r="1.4" fill="url(#scGold)" />
        {/* Radiant Knowledge Star */}
        <path d="M12 1L12.6 2.2L13.8 2.8L12.6 3.4L12 4.6L11.4 3.4L10.2 2.8L11.4 2.2L12 1Z" fill="url(#scGold)" />
    </svg>
);

// 2. Unique Certifications Icon: Multi-Layered Verified Rosette & Holographic Badge
const UniqueCertificationsIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="certGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9333EA" />
                <stop offset="1" stopColor="#581C87" />
            </linearGradient>
            <linearGradient id="certGold" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBBF24" />
                <stop offset="1" stopColor="#D97706" />
            </linearGradient>
        </defs>
        {/* Verified Rosette Ribbon Tail with Dual Tone */}
        <path d="M8 15.5L6.5 22L12 19.2L17.5 22L16 15.5" fill="#E9D5FF" stroke="#4C1D95" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M12 19.2L17.5 22L16 15.5" fill="#DDD6FE" />
        {/* Holographic Circular Shield Seal */}
        <circle cx="12" cy="10" r="7.8" fill="url(#certGrad)" stroke="#4C1D95" strokeWidth="1.2" />
        <circle cx="12" cy="10" r="6.2" stroke="white" strokeWidth="0.8" strokeOpacity="0.45" strokeDasharray="2 1.5" />
        {/* Verified Checkmark in Center */}
        <path d="M8.8 10.2L10.9 12.3L15.2 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Golden Diamond Seal at Top */}
        <polygon points="17.5,2 18.2,3.4 19.6,4.1 18.2,4.8 17.5,6.2 16.8,4.8 15.4,4.1 16.8,3.4" fill="url(#certGold)" />
    </svg>
);

// 3. Unique Job Opportunities Icon: Modern Executive Career Case with Ascending Growth Spark
const UniqueJobOpportunitiesIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="jobGrad" x1="2" y1="4" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" />
                <stop offset="0.5" stopColor="#4C1D95" />
                <stop offset="1" stopColor="#2E1065" />
            </linearGradient>
            <linearGradient id="arrowGlow" x1="12" y1="12" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10B981" />
                <stop offset="1" stopColor="#34D399" />
            </linearGradient>
        </defs>
        {/* Handle */}
        <path d="M8.5 5.5V4C8.5 3.2 9.2 2.5 10 2.5H14C14.8 2.5 15.5 3.2 15.5 4V5.5" stroke="url(#jobGrad)" strokeWidth="1.6" strokeLinecap="round" />
        {/* Main Briefcase Body */}
        <rect x="2.5" y="5.5" width="19" height="14" rx="3.2" fill="url(#jobGrad)" stroke="#4C1D95" strokeWidth="1.2" />
        {/* Top Flap Overlay Accent */}
        <path d="M2.5 10.5C2.5 10.5 7 12 12 12C17 12 21.5 10.5 21.5 10.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
        {/* Magnetic Clasp */}
        <rect x="10.2" y="10.2" width="3.6" height="3" rx="1" fill="#F8FAFC" stroke="#C084FC" strokeWidth="0.8" />
        {/* Floating Career Rocket Arrow Indicator */}
        <circle cx="18.5" cy="5.5" r="4.2" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.2" />
        <path d="M17 7L20 4M20 4H17.8M20 4V6.2" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const Services = () => {
    const [expandedId, setExpandedId] = useState(null);
    const [mainServices, setMainServices] = useState([]);
    const [additionalFeatures, setAdditionalFeatures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await axios.get('/api/services');
                setMainServices(data.filter(s => s.category === 'main'));
                setAdditionalFeatures(data.filter(s => s.category === 'additional'));
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch services:', error);
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    // ── WHAT WE OFFER (PRIMARY 4 CARDS MATCHING REFERENCE) ──
    const coreOfferings = [
        {
            id: 'skill-courses',
            title: 'Skill Courses',
            description: 'Industry-relevant, job-focused courses to help you build in-demand skills.',
            icon: GraduationCap,
            iconBg: 'bg-cyan-500 text-white shadow-cyan-500/30',
            link: '/courses',
            badge: 'Job Ready'
        },
        {
            id: 'diploma-programmes',
            title: 'Skill Integrated Diploma Programmes',
            description: 'Structured programmes that combine skill learning with certification and career support.',
            icon: Award,
            iconBg: 'bg-emerald-500 text-white shadow-emerald-500/30',
            link: '/courses',
            badge: 'Certified'
        },
        {
            id: 'wbl-learning',
            title: 'WBL (Work Based Learning)',
            description: 'Gain real-world experience through industry collaborations and live projects.',
            icon: Briefcase,
            iconBg: 'bg-[#7C3AED] text-white shadow-purple-600/30',
            link: '/wbl',
            badge: 'Industry Live'
        },
        {
            id: 'study-abroad',
            title: 'Study Abroad',
            description: 'Explore global education opportunities with end-to-end guidance and support.',
            icon: Plane,
            iconBg: 'bg-emerald-500 text-white shadow-emerald-500/30',
            link: '/study-abroad',
            badge: 'Global Pathways'
        }
    ];

    // ── ADVANCED PLATFORM CAPABILITIES (3 CARDS MATCHING REFERENCE) ──
    const platformCapabilities = [
        {
            title: 'AI-Powered Guidance',
            description: 'Get personalized course and career recommendations with our AI engine.',
            icon: Brain,
            iconBg: 'bg-purple-100/90 dark:bg-purple-900/40 text-[#4C1D95] dark:text-purple-300',
            tag: 'Intelligent Advisory'
        },
        {
            title: 'Mobile Learning',
            description: 'Learn anytime, anywhere with a seamless mobile experience.',
            icon: Smartphone,
            iconBg: 'bg-purple-100/90 dark:bg-purple-900/40 text-[#4C1D95] dark:text-purple-300',
            tag: 'Anytime Access'
        },
        {
            title: 'Cloud Infrastructure',
            description: 'Scalable and reliable cloud technology for uninterrupted learning.',
            icon: Cloud,
            iconBg: 'bg-purple-100/80 dark:bg-purple-900/30 text-[#4C1D95] dark:text-purple-300',
            tag: '99.9% Uptime'
        }
    ];

    return (
        <div className="min-h-screen bg-[#FAF8FF] dark:bg-[#080512] text-slate-900 dark:text-white font-sans transition-colors duration-300 relative overflow-hidden">
            <Navbar />

            {/* ── HERO SECTION (MATCHING REFERENCE DESIGN) ── */}
            <section className="relative pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 lg:px-12 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-[#FAF8FF] dark:from-[#080512] dark:via-[#0E091D] dark:to-[#150D2B] border-b border-slate-100 dark:border-purple-900/30">
                {/* Decorative background subtle wave curves matching reference */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#4C1D95]/15 dark:stroke-purple-600/10 fill-none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-100 220 C 150 120, 320 300, 520 220 C 720 140, 880 300, 1250 170" strokeWidth="1.5" />
                    <path d="M-50 460 C 200 390, 480 550, 780 470 C 1080 390, 1280 510, 1550 440" strokeWidth="1.5" />
                    <path d="M700 -50 C 850 160, 1050 80, 1200 260" strokeWidth="1.5" />
                </svg>

                {/* Soft ambient blur glows */}
                <div className="absolute -top-24 -left-24 w-88 h-88 bg-[#4C1D95]/5 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/4 right-0 w-[480px] h-[480px] bg-[#4C1D95]/5 dark:bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                        
                        {/* LEFT COLUMN: Headings & Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            className="lg:col-span-7 space-y-6 text-left"
                        >
                            {/* Pill Badge */}
                            <div>
                                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#4C1D95]/10 border border-[#4C1D95]/20 text-[#4C1D95] dark:bg-purple-950/70 dark:border-purple-800/50 dark:text-purple-300 text-[11px] md:text-xs font-semibold tracking-wide shadow-xs">
                                    Our Services
                                </div>
                            </div>

                            {/* Main Title */}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[50px] font-extrabold tracking-tight leading-[1.16] text-[#1E1B4B] dark:text-white font-sans">
                                Comprehensive Learning <br />
                                <span className="text-[#4C1D95] dark:text-purple-300">
                                    &amp; Career Support
                                </span>
                            </h1>

                            {/* Subtitle Description */}
                            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-normal">
                                We offer a range of services designed to help you build skills, earn recognized certifications, and achieve your career goals — all in one place.
                            </p>

                            {/* Quick Highlights Row */}
                            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                                <span className="inline-flex items-center gap-1.5 bg-white dark:bg-purple-950/40 px-3 py-1.5 rounded-full border border-purple-100 dark:border-purple-900/40 shadow-xs">
                                    <ShieldCheck size={14} className="text-[#4C1D95] dark:text-purple-300" />
                                    100% Placement Assurance
                                </span>
                                <span className="inline-flex items-center gap-1.5 bg-white dark:bg-purple-950/40 px-3 py-1.5 rounded-full border border-purple-100 dark:border-purple-900/40 shadow-xs">
                                    <Award size={14} className="text-[#4C1D95] dark:text-purple-300" />
                                    Global University Matrix
                                </span>
                                <span className="inline-flex items-center gap-1.5 bg-white dark:bg-purple-950/40 px-3 py-1.5 rounded-full border border-purple-100 dark:border-purple-900/40 shadow-xs">
                                    <Zap size={14} className="text-amber-500" />
                                    Outcome-Driven
                                </span>
                            </div>
                        </motion.div>

                        {/* RIGHT COLUMN: Hero Visual with Student & 3 Floating Badges matching Reference */}
                        <div className="lg:col-span-5 flex items-center justify-center relative select-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                                className="relative w-full max-w-[420px] sm:max-w-[460px]"
                            >
                                {/* Organic curved soft lavender petal background */}
                                <div className="absolute inset-0 bg-[#EDE7F6]/80 dark:bg-purple-950/40 rounded-[48px] sm:rounded-[60px] transform -rotate-2 scale-98 pointer-events-none" />

                                {/* Subtle purple ray accents pointing out from top-right */}
                                <svg
                                    className="absolute -top-4 -right-2 sm:-top-6 sm:-right-4 w-14 h-14 sm:w-16 sm:h-16 text-[#4C1D95] dark:text-purple-400 pointer-events-none stroke-current"
                                    viewBox="0 0 40 40"
                                    fill="none"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                >
                                    <line x1="22" y1="12" x2="32" y2="4" />
                                    <line x1="28" y1="20" x2="38" y2="20" />
                                    <line x1="24" y1="28" x2="34" y2="34" />
                                </svg>

                                {/* Student Photo Card */}
                                <div className="relative rounded-[40px] sm:rounded-[52px] overflow-hidden shadow-[0_20px_45px_-12px_rgba(76,29,149,0.18)] dark:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.6)] border-4 border-white dark:border-purple-900/40 bg-white dark:bg-[#0E091D]">
                                    <img
                                        src="/assets/services_hero_student.jpg"
                                        alt="SkillDad Comprehensive Learning & Career Support"
                                        className="w-full h-auto max-h-[460px] object-cover object-top transition-transform duration-700 hover:scale-104"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/assets/diagram_student.jpg";
                                        }}
                                    />
                                </div>

                                {/* Floating Pill Badge 1: Top-Left "Skill Courses" */}
                                <motion.div
                                    animate={{ y: [-4, 4, -4] }}
                                    transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-3 sm:-top-4 -left-3 sm:-left-6 z-20 bg-white dark:bg-[#0E091D] border border-purple-100/90 dark:border-purple-900/50 shadow-[0_12px_28px_-6px_rgba(76,29,149,0.18)] rounded-full px-3.5 sm:px-4 py-2 flex items-center gap-2.5 backdrop-blur-md hover:scale-104 transition-transform select-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-purple-50 dark:from-purple-950/80 dark:to-purple-900/40 border border-purple-200/80 dark:border-purple-700/50 flex items-center justify-center shrink-0 shadow-xs">
                                        <UniqueSkillCoursesIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-white tracking-tight">
                                        Skill Courses
                                    </span>
                                </motion.div>

                                {/* Floating Pill Badge 2: Bottom-Left "Certifications" */}
                                <motion.div
                                    animate={{ y: [4, -4, 4] }}
                                    transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    className="absolute bottom-8 sm:bottom-12 -left-4 sm:-left-8 z-20 bg-white dark:bg-[#0E091D] border border-purple-100/90 dark:border-purple-900/50 shadow-[0_12px_28px_-6px_rgba(76,29,149,0.18)] rounded-full px-3.5 sm:px-4 py-2 flex items-center gap-2.5 backdrop-blur-md hover:scale-104 transition-transform select-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-purple-50 dark:from-purple-950/80 dark:to-purple-900/40 border border-purple-200/80 dark:border-purple-700/50 flex items-center justify-center shrink-0 shadow-xs">
                                        <UniqueCertificationsIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-white tracking-tight">
                                        Certifications
                                    </span>
                                </motion.div>

                                {/* Floating Pill Badge 3: Right "Job Opportunities" */}
                                <motion.div
                                    animate={{ y: [-5, 5, -5] }}
                                    transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                                    className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-8 z-20 bg-white dark:bg-[#0E091D] border border-purple-100/90 dark:border-purple-900/50 shadow-[0_12px_28px_-6px_rgba(76,29,149,0.18)] rounded-full px-3.5 sm:px-4 py-2 flex items-center gap-2.5 backdrop-blur-md hover:scale-104 transition-transform select-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-purple-50 dark:from-purple-950/80 dark:to-purple-900/40 border border-purple-200/80 dark:border-purple-700/50 flex items-center justify-center shrink-0 shadow-xs">
                                        <UniqueJobOpportunitiesIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-white tracking-tight">
                                        Job Opportunities
                                    </span>
                                </motion.div>

                            </motion.div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ── SECTION 2: WHAT WE OFFER (MATCHING REFERENCE DESIGN) ── */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-12 relative z-10">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* Section Header with Left-Line Accent */}
                    <div className="text-left space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2.5">
                            <span className="w-6 h-0.5 bg-[#4C1D95] dark:bg-purple-400 rounded-full" />
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#4C1D95] dark:text-purple-400">
                                Our Services
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#1E1B4B] dark:text-white tracking-tight leading-snug font-sans">
                            What We Offer
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                            End-to-end support for your learning journey — from skill building to global opportunities.
                        </p>
                    </div>

                    {/* 4 Cards Responsive Grid matching reference */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                        {coreOfferings.map((offering, idx) => {
                            const IconComponent = offering.icon;
                            const isPrimary = idx === 0;

                            return (
                                <motion.div
                                    key={offering.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    whileHover={{ y: -4 }}
                                    className="h-full"
                                >
                                    <div
                                        className={`h-full rounded-[22px] transition-all duration-300 p-6 flex flex-col justify-between group ${
                                            isPrimary
                                                ? 'bg-gradient-to-br from-[#4C1D95] via-[#3B1578] to-[#2E0F61] text-white shadow-[0_12px_30px_-6px_rgba(76,29,149,0.35)] border border-purple-800/40'
                                                : 'bg-white dark:bg-[#120D24] text-slate-900 dark:text-white border border-slate-100 dark:border-purple-900/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(76,29,149,0.12)] hover:border-purple-200 dark:hover:border-purple-700/60'
                                        }`}
                                    >
                                        <div className="text-left">
                                            {/* Circular Icon Badge */}
                                            <div className="mb-4">
                                                <div className={`w-11 h-11 rounded-full ${offering.iconBg} flex items-center justify-center shrink-0 shadow-md group-hover:scale-108 transition-transform`}>
                                                    <IconComponent size={20} strokeWidth={2.2} />
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className={`text-base sm:text-[17px] font-bold tracking-tight leading-snug mb-2 font-sans ${
                                                isPrimary ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-[#4C1D95] dark:group-hover:text-purple-300 transition-colors'
                                            }`}>
                                                {offering.title}
                                            </h3>

                                            {/* Description */}
                                            <p className={`text-xs sm:text-[13px] leading-relaxed font-normal ${
                                                isPrimary ? 'text-purple-100/90' : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                                {offering.description}
                                            </p>
                                        </div>

                                        {/* Bottom Row: Badge Tag + Action Button */}
                                        <div className={`pt-6 mt-6 border-t flex items-center justify-between ${
                                            isPrimary ? 'border-white/10' : 'border-slate-100 dark:border-purple-900/30'
                                        }`}>
                                            <span className={`text-[11px] font-bold tracking-wider uppercase ${
                                                isPrimary ? 'text-purple-200' : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                                {offering.badge}
                                            </span>

                                            <Link
                                                to={offering.link}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xs ${
                                                    isPrimary
                                                        ? 'bg-white/15 hover:bg-white/25 text-white'
                                                        : 'bg-[#FAF8FF] dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/40 text-[#4C1D95] dark:text-purple-300 group-hover:bg-[#4C1D95] group-hover:text-white'
                                                }`}
                                                aria-label={`Explore ${offering.title}`}
                                            >
                                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* ── SECTION 3: ADVANCED PLATFORM CAPABILITIES (MATCHING REFERENCE DESIGN) ── */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-12 relative z-10 bg-slate-50/60 dark:bg-[#0A0716]/60 border-y border-purple-50 dark:border-purple-900/20">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* Section Header with Left-Line Accent */}
                    <div className="text-left space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2.5">
                            <span className="w-6 h-0.5 bg-[#4C1D95] dark:bg-purple-400 rounded-full" />
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#4C1D95] dark:text-purple-400">
                                Platform Features
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#1E1B4B] dark:text-white tracking-tight leading-snug font-sans">
                            Advanced Platform{' '}
                            <span className="text-[#4C1D95] dark:text-purple-300">
                                Capabilities
                            </span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                            Our intelligent platform is built to give you a seamless, personalized and efficient learning experience.
                        </p>
                    </div>

                    {/* 3 Cards Responsive Grid matching reference */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
                        {platformCapabilities.map((capability, idx) => {
                            const IconComponent = capability.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.12 }}
                                    whileHover={{ y: -4 }}
                                    className="bg-white dark:bg-[#0E091D] rounded-2xl border border-purple-100/80 dark:border-purple-900/40 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(76,29,149,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(76,29,149,0.12)] transition-all duration-300 flex flex-col justify-between group"
                                >
                                    <div className="space-y-4">
                                        {/* Icon Header */}
                                        <div className="flex items-center justify-between">
                                            <div className={`w-11 h-11 rounded-xl ${capability.iconBg} flex items-center justify-center shrink-0 group-hover:scale-108 transition-transform`}>
                                                <IconComponent size={20} strokeWidth={2.2} />
                                            </div>
                                            <span className="text-[10px] font-semibold text-[#4C1D95] dark:text-purple-300 bg-[#4C1D95]/10 dark:bg-purple-950/70 px-2 py-0.5 rounded-full">
                                                {capability.tag}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-[#4C1D95] dark:group-hover:text-purple-300 transition-colors">
                                            {capability.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                                            {capability.description}
                                        </p>
                                    </div>

                                    {/* Action Arrow Button */}
                                    <div className="pt-6 mt-2">
                                        <div className="w-8 h-8 rounded-full bg-[#FAF8FF] dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/40 text-[#4C1D95] dark:text-purple-300 flex items-center justify-center group-hover:bg-[#4C1D95] group-hover:text-white dark:group-hover:bg-purple-600 transition-all duration-300 shadow-2xs">
                                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* ── SECTION 4: DETAILED SERVICES & SPECIALIZED MODULES (PRESERVING CMS DATA) ── */}
            {mainServices.length > 0 && (
                <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-12 relative z-10">
                    <div className="max-w-7xl mx-auto space-y-10">
                        
                        {/* Section Header */}
                        <div className="text-center max-w-2xl mx-auto space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#4C1D95] dark:text-purple-400">
                                Specialized Offerings
                            </span>
                            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#1E1B4B] dark:text-white tracking-tight leading-snug font-sans">
                                Complete Ecosystem Breakdown
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Detailed curriculum engineering, placement guarantees, and industry-grade infrastructure power each student's career outcome.
                            </p>
                        </div>

                        {/* Interactive Cards Grid with Expandable Sub-Services Styled after Reference */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                            {mainServices.map((service, index) => {
                                const isExpanded = expandedId === service.id;
                                const isPrimary = index === 0;

                                return (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.08 }}
                                        whileHover={{ y: -4 }}
                                        className="h-full"
                                    >
                                        <div
                                            className={`h-full rounded-[22px] transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between ${
                                                isPrimary
                                                    ? 'bg-gradient-to-br from-[#4C1D95] via-[#431785] to-[#38126E] text-white shadow-[0_12px_30px_-6px_rgba(76,29,149,0.35)] border border-purple-800/40'
                                                    : 'bg-[#F8F9FA] dark:bg-[#120D24] text-slate-900 dark:text-white border border-slate-200/80 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700/60 shadow-xs hover:shadow-[0_10px_25px_-5px_rgba(76,29,149,0.08)]'
                                            }`}
                                        >
                                            <div className="text-left">
                                                {/* Header: Circular Icon Badge (White on primary, Purple on secondary) + Toggle */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                                                            isPrimary
                                                                ? 'bg-white text-[#4C1D95]'
                                                                : 'bg-[#4C1D95] dark:bg-purple-600 text-white shadow-purple-900/20'
                                                        }`}
                                                    >
                                                        <DynamicIcon
                                                            name={service.icon_name}
                                                            size={22}
                                                            className={isPrimary ? 'text-[#4C1D95]' : 'text-white'}
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={() => setExpandedId(isExpanded ? null : service.id)}
                                                        className={`p-1.5 rounded-full border transition-colors ${
                                                            isPrimary
                                                                ? 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                                                                : isExpanded
                                                                    ? 'bg-[#4C1D95]/10 text-[#4C1D95] border-[#4C1D95]/30 dark:bg-purple-900/40 dark:text-purple-300'
                                                                    : 'bg-white dark:bg-purple-950/40 border-slate-200/90 dark:border-purple-800/40 text-slate-500 hover:text-[#4C1D95] dark:hover:text-white'
                                                        }`}
                                                        aria-label="Toggle service details"
                                                    >
                                                        <ChevronDown
                                                            size={15}
                                                            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                        />
                                                    </button>
                                                </div>

                                                {/* Title & Description */}
                                                <div>
                                                    <h3
                                                        className={`text-base sm:text-[17px] font-bold tracking-tight leading-snug mb-1.5 font-sans ${
                                                            isPrimary ? 'text-white' : 'text-slate-900 dark:text-white'
                                                        }`}
                                                    >
                                                        {service.title}
                                                    </h3>
                                                    <p
                                                        className={`text-xs sm:text-[13px] leading-relaxed line-clamp-3 font-normal ${
                                                            isPrimary
                                                                ? 'text-purple-100/90'
                                                                : 'text-slate-500 dark:text-slate-400'
                                                        }`}
                                                    >
                                                        {service.description}
                                                    </p>
                                                </div>

                                                {/* Key Highlights Bullet Points */}
                                                {service.features && service.features.length > 0 && (
                                                    <div
                                                        className={`space-y-1.5 pt-3 mt-3 border-t ${
                                                            isPrimary
                                                                ? 'border-white/15'
                                                                : 'border-slate-200/70 dark:border-purple-900/30'
                                                        }`}
                                                    >
                                                        {service.features.slice(0, 3).map((feat, fIdx) => (
                                                            <div
                                                                key={fIdx}
                                                                className={`flex items-center gap-2 text-[11px] ${
                                                                    isPrimary
                                                                        ? 'text-purple-100/90'
                                                                        : 'text-slate-600 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                <CheckCircle2
                                                                    size={13}
                                                                    className={`shrink-0 ${
                                                                        isPrimary
                                                                            ? 'text-purple-200'
                                                                            : 'text-[#4C1D95] dark:text-purple-400'
                                                                    }`}
                                                                />
                                                                <span className="truncate">{feat}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Link & Expandable Sub-Services */}
                                            <div
                                                className={`pt-3.5 mt-3.5 border-t text-left ${
                                                    isPrimary
                                                        ? 'border-white/15'
                                                        : 'border-slate-200/70 dark:border-purple-900/30'
                                                }`}
                                            >
                                                <button
                                                    onClick={() => setExpandedId(isExpanded ? null : service.id)}
                                                    className={`text-xs font-semibold hover:underline inline-flex items-center gap-1.5 ${
                                                        isPrimary
                                                            ? 'text-white hover:text-purple-200'
                                                            : 'text-[#4C1D95] dark:text-purple-300'
                                                    }`}
                                                >
                                                    <span>{isExpanded ? 'Close Breakdown' : 'View Full Modules'}</span>
                                                    <ArrowRight size={13} />
                                                </button>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className={`mt-3 pt-3 border-t space-y-2 overflow-hidden ${
                                                                isPrimary
                                                                    ? 'border-white/15'
                                                                    : 'border-slate-200/70 dark:border-purple-900/30'
                                                            }`}
                                                        >
                                                            {service.details && (
                                                                <p
                                                                    className={`text-[11px] italic p-2.5 rounded-lg border-l-2 ${
                                                                        isPrimary
                                                                            ? 'text-purple-100 bg-white/10 border-white/60'
                                                                            : 'text-slate-600 dark:text-slate-400 bg-purple-50/70 dark:bg-purple-950/30 border-[#4C1D95] dark:border-purple-400'
                                                                    }`}
                                                                >
                                                                    "{service.details}"
                                                                </p>
                                                            )}
                                                            {(service.sub_services || []).map((sub, sIdx) => (
                                                                <div
                                                                    key={sIdx}
                                                                    className={`p-2 rounded-lg text-xs border ${
                                                                        isPrimary
                                                                            ? 'bg-white/10 border-white/15 text-white'
                                                                            : 'bg-white dark:bg-white/[0.02] border-slate-200/80 dark:border-purple-900/20 text-slate-800 dark:text-slate-200'
                                                                    }`}
                                                                >
                                                                    <div className="font-semibold text-[11px] flex items-center gap-1.5">
                                                                        <span
                                                                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                                                isPrimary
                                                                                    ? 'bg-purple-200'
                                                                                    : 'bg-[#4C1D95] dark:bg-purple-400'
                                                                            }`}
                                                                        />
                                                                        {sub.title}
                                                                    </div>
                                                                    <p
                                                                        className={`text-[10px] pl-3 pt-0.5 leading-normal ${
                                                                            isPrimary
                                                                                ? 'text-purple-200/80'
                                                                                : 'text-slate-500 dark:text-slate-400'
                                                                        }`}
                                                                    >
                                                                        {sub.desc}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                    </div>
                </section>
            )}


            <Footer />
        </div>
    );
};

export default Services;
