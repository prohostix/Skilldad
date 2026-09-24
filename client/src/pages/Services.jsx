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
import skilldadLogo from '../assets/logo_deep_purple.png';

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

// ── INNOVATIVE & MODERN CUSTOM ICONS FOR "WHAT WE OFFER" CARDS ──

// 1. Modern Skill Courses: Academic Mortarboard with Faceted Gem Top, Knowledge Star & Golden Tassel
const ModernSkillCoursesIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.5L2 7.5L12 12.5L22 7.5L12 2.5Z" fill="white" fillOpacity="0.95" stroke="white" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M12 3.8L3.8 7.5L12 11.2L20.2 7.5L12 3.8Z" fill="#F8FAFC" fillOpacity="0.4" />
        <path d="M6 10V15C6 15 8.5 17.5 12 17.5C15.5 17.5 18 15 18 15V10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 9.2V15C20 15.6 19.4 16 18.8 16C18.2 16 17.8 15.6 17.8 15V10.2" stroke="#FDE047" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="18.8" cy="16.5" r="1.2" fill="#FDE047" />
        <path d="M12 1L12.4 1.8L13.2 2.2L12.4 2.6L12 3.4L11.6 2.6L10.8 2.2L11.6 1.8L12 1Z" fill="#FDE047" />
    </svg>
);

// 2. Modern Diploma Programmes: Parchment Roll with Verified Golden Rosette Stamp & Ribbon Tails
const ModernDiplomaIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.5" y="3.5" width="17" height="13" rx="2" fill="white" fillOpacity="0.95" stroke="white" strokeWidth="0.8" />
        <line x1="7" y1="7" x2="14" y2="7" stroke="#047857" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="7" y1="10" x2="15" y2="10" stroke="#047857" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="7" y1="13" x2="11" y2="13" stroke="#047857" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="17.5" cy="15.5" r="4.2" fill="#FDE047" stroke="white" strokeWidth="1" />
        <path d="M16 15.5L17.2 16.7L19.2 14.5" stroke="#047857" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 19.5L15.2 22L17.5 21L19.8 22L19 19.5" fill="#FDE047" stroke="white" strokeWidth="0.6" />
    </svg>
);

// 3. Modern WBL: High-Tech Enterprise Briefcase with Growth Arrow Indicator
const ModernWblIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.5 5.5V3.5C8.5 2.8 9.2 2.2 10 2.2H14C14.8 2.2 15.5 2.8 15.5 3.5V5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="2.5" y="5.5" width="19" height="14.5" rx="3" fill="white" fillOpacity="0.95" stroke="white" strokeWidth="0.8" />
        <path d="M2.5 10.5C2.5 10.5 7 12 12 12C17 12 21.5 10.5 21.5 10.5" stroke="#5B21B6" strokeWidth="1.2" strokeOpacity="0.5" />
        <rect x="10.5" y="10.5" width="3" height="3" rx="0.8" fill="#5B21B6" />
        <circle cx="18" cy="5.5" r="3.8" fill="#10B981" stroke="white" strokeWidth="1" />
        <path d="M16.8 6.8L19.2 4.4M19.2 4.4H17.4M19.2 4.4V6.2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// 4. Modern Study Abroad: Global Meridian Orbit with Climbing Supersonic Aircraft
const ModernStudyAbroadIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10.5" cy="13.5" r="7.8" fill="white" fillOpacity="0.95" stroke="white" strokeWidth="0.8" />
        <ellipse cx="10.5" cy="13.5" rx="4" ry="7.8" stroke="#047857" strokeWidth="0.8" strokeOpacity="0.6" />
        <line x1="2.7" y1="13.5" x2="18.3" y2="13.5" stroke="#047857" strokeWidth="0.8" strokeOpacity="0.6" />
        <path d="M5 20.5C9 18.5 15 14 19.5 7" stroke="#FDE047" strokeWidth="1.4" strokeDasharray="1.8 1.4" strokeLinecap="round" />
        <g transform="translate(14, 2) rotate(22)">
            <path d="M5 0L6.5 3.2L10 4L6.5 4.8L5.8 7.2L4.2 5.6L2.6 6.4L3.4 4L0 3.2L3.4 2.4L4.2 0L5 0Z" fill="#FDE047" stroke="#047857" strokeWidth="0.7" strokeLinejoin="round" />
        </g>
    </svg>
);

const Services = () => {
    const [expandedId, setExpandedId] = useState(null);
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [selectedCapability, setSelectedCapability] = useState(0);
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

    // ── WHAT WE OFFER (PURPLE GRADIENTS & SHADES FOR SKILLDAD) ──
    const coreOfferings = [
        {
            id: 'skill-courses',
            title: 'Skill Courses',
            description: 'Industry-relevant, job-focused courses to help you build in-demand skills.',
            icon: ModernSkillCoursesIcon,
            badgeBg: 'bg-[#4C1D95]',
            cardBg: 'bg-gradient-to-br from-[#4C1D95] via-[#3B1578] to-[#2E0F61] text-white shadow-[0_20px_45px_-12px_rgba(76,29,149,0.38)] border border-purple-700/50',
            textColor: 'text-white',
            descColor: 'text-purple-100/90',
            rotation: 'lg:-rotate-[3.5deg]',
            link: '/courses',
            badge: 'Job Ready',
            tagColor: 'text-purple-200 font-bold',
            btnBg: 'bg-white/15 hover:bg-white/25 text-white'
        },
        {
            id: 'diploma-programmes',
            title: 'Skill Integrated Diploma Programmes',
            description: 'Structured programmes that combine skill learning with certification and career support.',
            icon: ModernDiplomaIcon,
            badgeBg: 'bg-[#4C1D95]',
            cardBg: 'bg-white text-slate-900 shadow-[0_20px_45px_-12px_rgba(76,29,149,0.12)] border border-purple-100/90',
            textColor: 'text-slate-900',
            descColor: 'text-slate-600',
            rotation: 'lg:rotate-[1.8deg]',
            link: '/courses',
            badge: 'Certified',
            tagColor: 'text-[#4C1D95] font-bold',
            btnBg: 'bg-purple-50 hover:bg-[#4C1D95] hover:text-white text-[#4C1D95]'
        },
        {
            id: 'wbl-learning',
            title: 'WBL (Work Based Learning)',
            description: 'Gain real-world experience through industry collaborations and live projects.',
            icon: ModernWblIcon,
            badgeBg: 'bg-[#4C1D95]',
            cardBg: 'bg-gradient-to-br from-[#4C1D95] via-[#3B1578] to-[#2E0F61] text-white shadow-[0_20px_45px_-12px_rgba(76,29,149,0.38)] border border-purple-700/50',
            textColor: 'text-white',
            descColor: 'text-purple-100/90',
            rotation: 'lg:-rotate-[2.2deg]',
            link: '/wbl',
            badge: 'Industry Live',
            tagColor: 'text-purple-200 font-bold',
            btnBg: 'bg-white/15 hover:bg-white/25 text-white'
        },
        {
            id: 'study-abroad',
            title: 'Study Abroad',
            description: 'Explore global education opportunities with end-to-end guidance and support.',
            icon: ModernStudyAbroadIcon,
            badgeBg: 'bg-[#4C1D95]',
            cardBg: 'bg-white text-slate-900 shadow-[0_20px_45px_-12px_rgba(76,29,149,0.12)] border border-purple-100/90',
            textColor: 'text-slate-900',
            descColor: 'text-slate-600',
            rotation: 'lg:rotate-[3deg]',
            link: '/study-abroad',
            badge: 'Global Pathways',
            tagColor: 'text-[#4C1D95] font-bold',
            btnBg: 'bg-purple-50 hover:bg-[#4C1D95] hover:text-white text-[#4C1D95]'
        }
    ];

    // ── ADVANCED PLATFORM CAPABILITIES (3 CARDS MATCHING REFERENCE VIDEO AT 0:00:07) ──
    const platformCapabilities = [
        {
            title: 'AI-Powered Guidance',
            description: 'Get personalized course and career recommendations with our intelligent AI advisory engine.',
            icon: Brain,
            tag: 'Intelligent Advisory',
            rotation: 'lg:-rotate-[8deg]',
            entranceDelay: 0.18,
            baseZ: 'z-10'
        },
        {
            title: 'Mobile Learning',
            description: 'Learn anytime, anywhere with a seamless mobile experience across all your devices.',
            icon: Smartphone,
            tag: 'Anytime Access',
            rotation: 'lg:rotate-0',
            entranceDelay: 0.05,
            baseZ: 'z-20'
        },
        {
            title: 'Cloud Infrastructure',
            description: 'Scalable, high-speed, and reliable cloud technology ensuring 99.9% uninterrupted learning uptime.',
            icon: Cloud,
            tag: '99.9% Uptime',
            rotation: 'lg:rotate-[7deg]',
            entranceDelay: 0.30,
            baseZ: 'z-30'
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

            {/* ── SECTION 2: WHAT WE OFFER / SERVICE OUTCOMES (LIGHT PURPLE THEME WITH SKILLDAD GRADIENTS) ── */}
            <section className="py-8 sm:py-10 md:py-12 relative z-10 bg-[#FAF8FF] dark:bg-[#080512]">
                <div className="w-full">

                    {/* Light Purple Gradient Rounded Container Card with SkillDad Theme */}
                    <div className="relative rounded-[36px] sm:rounded-[48px] bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF] dark:from-[#170E33] dark:via-[#110A26] dark:to-[#0C061B] border border-purple-200/90 dark:border-purple-800/50 p-5 sm:p-6 lg:p-8 text-slate-900 dark:text-white shadow-[0_20px_50px_-15px_rgba(76,29,149,0.12)] overflow-hidden">
                        
                        {/* Background glow accents in shades of purple */}
                        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300/30 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-300/25 dark:bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Header: WHAT AND WHY tag + Title + Subtitle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-left space-y-3 max-w-2xl mb-8 sm:mb-10 relative z-10"
                        >
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4C1D95]/10 dark:bg-purple-900/40 border border-[#4C1D95]/20 dark:border-purple-800/40 text-[#4C1D95] dark:text-purple-300 text-[11px] font-bold tracking-widest uppercase shadow-2xs">
                                WHAT AND WHY
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E1B4B] dark:text-white tracking-tight leading-[1.2] font-sans">
                                Service Outcomes <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#8B5CF6] dark:from-purple-300 dark:via-pink-200 dark:to-cyan-300">
                                    You Shouldn't Miss
                                </span>
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-purple-200/80 leading-relaxed font-normal max-w-xl">
                                End-to-end support for your learning journey — from skill building to global opportunities.
                            </p>
                        </motion.div>

                        {/* 4 Angled, Overlapping Cards with Top Badges & Video Entrance Animation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 sm:gap-6 lg:gap-4 items-stretch pt-3 pb-1 relative z-10">
                            {coreOfferings.map((offering, idx) => {
                                const IconComponent = offering.icon;

                                return (
                                    <motion.div
                                        key={offering.id}
                                        initial={{ y: 90, opacity: 0, scale: 0.92 }}
                                        whileInView={{ y: 0, opacity: 1, scale: 1 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{
                                            duration: 0.75,
                                            delay: idx * 0.14,
                                            ease: [0.22, 1, 0.36, 1]
                                        }}
                                        whileHover={{
                                            y: -12,
                                            rotate: 0,
                                            scale: 1.04,
                                            zIndex: 40,
                                            transition: { duration: 0.25, ease: 'easeOut' }
                                        }}
                                        className={`h-full relative group cursor-pointer ${offering.rotation} transition-transform`}
                                    >
                                        {/* Perched Top Badge (half overlapping the top border) */}
                                        <div className="absolute -top-5 left-7 z-20">
                                            <div className={`w-11 h-11 rounded-full ${offering.badgeBg} flex items-center justify-center shadow-lg border-2 border-white/25 group-hover:scale-110 transition-transform`}>
                                                <IconComponent className="w-5 h-5 text-white" />
                                            </div>
                                        </div>

                                        {/* Main Card Body */}
                                        <div
                                            className={`h-full rounded-[24px] pt-8 pb-4 px-5 flex flex-col justify-between transition-shadow duration-300 ${offering.cardBg}`}
                                        >
                                            <div className="text-left">
                                                {/* Title */}
                                                <h3 className={`text-[17px] sm:text-[18px] font-extrabold tracking-tight leading-snug mb-1.5 font-sans ${offering.textColor}`}>
                                                    {offering.title}
                                                </h3>

                                                {/* Description */}
                                                <p className={`text-xs sm:text-[12.8px] leading-relaxed font-normal ${offering.descColor}`}>
                                                    {offering.description}
                                                </p>
                                            </div>

                                            {/* Bottom Row: Badge Tag + Action Button */}
                                            <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                                                <span className={`text-[11px] font-bold tracking-wider uppercase ${offering.tagColor}`}>
                                                    {offering.badge}
                                                </span>

                                                <Link
                                                    to={offering.link}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${offering.btnBg}`}
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

                </div>
            </section>

            {/* ── SECTION 3: ADVANCED PLATFORM CAPABILITIES (MATCHING REFERENCE VIDEO AT 0:00:07) ── */}
            <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-12 relative z-10 bg-[#FAF8FF] dark:bg-[#080512] border-t border-purple-100/60 dark:border-purple-900/30">
                <div className="max-w-7xl mx-auto">

                    {/* Light Purple Rounded Container Card Matching Reference Video */}
                    <div className="relative rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-[#F8F4FF] via-[#F1E8FF] to-[#E9DBFF] dark:from-[#170E33] dark:via-[#110A26] dark:to-[#0C061B] border border-purple-200/80 dark:border-purple-800/40 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10 shadow-[0_16px_40px_-15px_rgba(76,29,149,0.10)] overflow-hidden">
                        
                        {/* Soft ambient violet background glows */}
                        <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-cyan-300/20 dark:bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Floating Transparent SkillDad Logo with Floating Motion & Trailing Curve */}
                        <div className="absolute top-2 right-3 sm:top-3 sm:right-6 z-0 pointer-events-none select-none">
                            <motion.div
                                animate={{ y: [-3, 4, -3], rotate: [-2, 2, -2] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative flex items-center justify-center"
                            >
                                {/* Soft ambient purple glow behind the logo */}
                                <div className="absolute inset-0 bg-[#6D28D9]/20 rounded-full blur-lg pointer-events-none scale-110" />

                                {/* Transparent SkillDad Logo */}
                                <motion.img
                                    src={skilldadLogo}
                                    alt="SkillDad Logo"
                                    className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain drop-shadow-[0_6px_14px_rgba(76,29,149,0.22)] relative z-10"
                                    animate={{ scale: [1, 1.04, 1] }}
                                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                                />

                                {/* Curving Wavy String trailing down behind cards */}
                                <svg
                                    className="absolute top-[38px] right-[12px] sm:right-[18px] w-[160px] sm:w-[210px] h-[220px] sm:h-[260px] pointer-events-none overflow-visible stroke-purple-400/40 dark:stroke-purple-500/30 fill-none"
                                    viewBox="0 0 300 350"
                                >
                                    <path
                                        d="M200 0 C 180 80, 220 160, 160 200 C 100 240, 60 170, 100 130 C 140 90, 170 170, 100 240 C 65 275, 55 310, 80 345"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeDasharray="4 2"
                                    />
                                </svg>
                            </motion.div>
                        </div>

                        {/* Header: Centered HOW IT WORKS Tag + Title + Subtitle + Pills Row */}
                        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8 space-y-1 sm:space-y-1.5 relative z-10">
                            <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4C1D95]/10 dark:bg-purple-900/40 border border-[#4C1D95]/20 dark:border-purple-800/40 text-[#4C1D95] dark:text-purple-300 text-[10px] font-bold tracking-widest uppercase shadow-2xs">
                                    HOW IT WORKS
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#1E1B4B] dark:text-white tracking-tight leading-[1.16] font-sans">
                                An Intelligent System, <br className="hidden sm:inline" />
                                <span className="text-[#4C1D95] dark:text-purple-300 sm:ml-1.5">
                                    Not Just A Course
                                </span>
                            </h2>
                            {/* Category Filter Pills Row Matching Video */}
                            <div className="pt-0.5 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
                                {['AI Mentorship', 'Mobile Access', 'Cloud Infrastructure', 'Live Collaboration', 'Career Matrix'].map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="bg-white/80 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/40 text-[#4C1D95] dark:text-purple-300 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-semibold shadow-2xs hover:bg-white dark:hover:bg-purple-900/60 transition-colors cursor-default"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 3 Angled Overlapping Cards with Video Staggered Entrance Animation & Dynamic Selection Color */}
                        <div className="flex flex-col md:flex-row items-center justify-center -space-y-4 md:space-y-0 md:-space-x-7 lg:-space-x-9 pt-1 pb-1 relative z-10 max-w-4xl mx-auto">
                            {platformCapabilities.map((capability, idx) => {
                                const IconComponent = capability.icon;
                                const isSelected = selectedCapability === idx;

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ y: 60, opacity: 0, scale: 0.94 }}
                                        whileInView={{ y: 0, opacity: 1, scale: 1 }}
                                        viewport={{ once: true, amount: 0.25 }}
                                        transition={{
                                            duration: 0.65,
                                            delay: capability.entranceDelay,
                                            ease: [0.22, 1, 0.36, 1]
                                        }}
                                        whileHover={{
                                            y: -8,
                                            scale: 1.04,
                                            zIndex: 40,
                                            transition: { duration: 0.2, ease: 'easeOut' }
                                        }}
                                        onClick={() => setSelectedCapability(idx)}
                                        className={`w-full max-w-[250px] sm:max-w-[260px] md:w-[245px] lg:w-[265px] shrink-0 relative group cursor-pointer ${capability.rotation} ${
                                            isSelected ? 'z-35' : capability.baseZ
                                        } transition-all duration-300`}
                                    >
                                        <div
                                            className={`h-full min-h-[185px] sm:min-h-[200px] rounded-[20px] p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-300 ${
                                                isSelected
                                                    ? 'bg-gradient-to-br from-[#E9D5FF] via-[#D8B4FE] to-[#C084FC] text-[#2E1065] shadow-[0_22px_45px_-10px_rgba(147,51,234,0.38)] border-2 border-purple-300'
                                                    : 'bg-white dark:bg-[#130B24] text-slate-900 dark:text-white shadow-[0_12px_28px_-8px_rgba(76,29,149,0.12)] border border-purple-100/90 dark:border-purple-800/40 hover:border-purple-300'
                                            }`}
                                        >
                                            <div className="space-y-1.5 sm:space-y-2 text-left">
                                                {/* Top Tag & Icon Row */}
                                                <div className="flex items-center justify-between">
                                                    <span
                                                        className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors ${
                                                            isSelected
                                                                ? 'bg-white/80 text-[#4C1D95] shadow-2xs'
                                                                : 'bg-purple-100/70 dark:bg-purple-900/50 text-[#4C1D95] dark:text-purple-300'
                                                        }`}
                                                    >
                                                        {capability.tag}
                                                    </span>
                                                    <div
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                                            isSelected
                                                                ? 'bg-white/70 text-[#4C1D95]'
                                                                : 'bg-purple-50 dark:bg-purple-900/40 text-[#4C1D95] dark:text-purple-300'
                                                        }`}
                                                    >
                                                        <IconComponent size={13} strokeWidth={2.4} />
                                                    </div>
                                                </div>

                                                {/* Title */}
                                                <h3
                                                    className={`text-base sm:text-[17px] font-extrabold tracking-tight leading-snug font-sans transition-colors ${
                                                        isSelected ? 'text-[#2E1065]' : 'text-slate-900 dark:text-white'
                                                    }`}
                                                >
                                                    {capability.title}
                                                </h3>

                                                {/* Description */}
                                                <p
                                                    className={`text-[11px] sm:text-[11.5px] leading-relaxed line-clamp-3 transition-colors ${
                                                        isSelected ? 'text-[#3B0764]/90 font-medium' : 'text-slate-600 dark:text-purple-200/70'
                                                    }`}
                                                >
                                                    {capability.description}
                                                </p>
                                            </div>

                                            {/* Action Arrow Button */}
                                            <div className="pt-2 mt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-end">
                                                <div
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xs ${
                                                        isSelected
                                                            ? 'bg-white/80 hover:bg-[#4C1D95] hover:text-white text-[#4C1D95]'
                                                            : 'bg-purple-50 dark:bg-purple-900/50 hover:bg-[#4C1D95] hover:text-white text-[#4C1D95] dark:text-purple-300'
                                                    }`}
                                                >
                                                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

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
                                const isSelected = selectedServiceId !== null ? selectedServiceId === service.id : index === 0;

                                return (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.08 }}
                                        whileHover={{ y: -4 }}
                                        onClick={() => setSelectedServiceId(service.id)}
                                        className="h-full cursor-pointer"
                                    >
                                        <div
                                            className={`h-full rounded-[22px] transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between ${
                                                isSelected
                                                    ? 'bg-gradient-to-br from-[#4C1D95] via-[#431785] to-[#38126E] text-white shadow-[0_12px_30px_-6px_rgba(76,29,149,0.35)] border border-purple-800/40'
                                                    : 'bg-[#F8F9FA] dark:bg-[#120D24] text-slate-900 dark:text-white border border-slate-200/80 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700/60 shadow-xs hover:shadow-[0_10px_25px_-5px_rgba(76,29,149,0.08)]'
                                            }`}
                                        >
                                            <div className="text-left">
                                                {/* Header: Circular Icon Badge (White on primary, Purple on secondary) + Toggle */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                                                            isSelected
                                                                ? 'bg-white text-[#4C1D95]'
                                                                : 'bg-[#4C1D95] dark:bg-purple-600 text-white shadow-purple-900/20'
                                                        }`}
                                                    >
                                                        <DynamicIcon
                                                            name={service.icon_name}
                                                            size={22}
                                                            className={isSelected ? 'text-[#4C1D95]' : 'text-white'}
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedServiceId(service.id);
                                                            setExpandedId(isExpanded ? null : service.id);
                                                        }}
                                                        className={`p-1.5 rounded-full border transition-colors ${
                                                            isSelected
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
                                                            isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                                                        }`}
                                                    >
                                                        {service.title}
                                                    </h3>
                                                    <p
                                                        className={`text-xs sm:text-[13px] leading-relaxed line-clamp-3 font-normal ${
                                                            isSelected
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
                                                            isSelected
                                                                ? 'border-white/15'
                                                                : 'border-slate-200/70 dark:border-purple-900/30'
                                                        }`}
                                                    >
                                                        {service.features.slice(0, 3).map((feat, fIdx) => (
                                                            <div
                                                                key={fIdx}
                                                                className={`flex items-center gap-2 text-[11px] ${
                                                                    isSelected
                                                                        ? 'text-purple-100/90'
                                                                        : 'text-slate-600 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                <CheckCircle2
                                                                    size={13}
                                                                    className={`shrink-0 ${
                                                                        isSelected
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
                                                    isSelected
                                                        ? 'border-white/15'
                                                        : 'border-slate-200/70 dark:border-purple-900/30'
                                                }`}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedServiceId(service.id);
                                                        setExpandedId(isExpanded ? null : service.id);
                                                    }}
                                                    className={`text-xs font-semibold hover:underline inline-flex items-center gap-1.5 ${
                                                        isSelected
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
                                                                isSelected
                                                                    ? 'border-white/15'
                                                                    : 'border-slate-200/70 dark:border-purple-900/30'
                                                            }`}
                                                        >
                                                            {service.details && (
                                                                <p
                                                                    className={`text-[11px] italic p-2.5 rounded-lg border-l-2 ${
                                                                        isSelected
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
                                                                        isSelected
                                                                            ? 'bg-white/10 border-white/15 text-white'
                                                                            : 'bg-white dark:bg-white/[0.02] border-slate-200/80 dark:border-purple-900/20 text-slate-800 dark:text-slate-200'
                                                                    }`}
                                                                >
                                                                    <div className="font-semibold text-[11px] flex items-center gap-1.5">
                                                                        <span
                                                                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                                                isSelected
                                                                                    ? 'bg-purple-200'
                                                                                    : 'bg-[#4C1D95] dark:bg-purple-400'
                                                                            }`}
                                                                        />
                                                                        {sub.title}
                                                                    </div>
                                                                    <p
                                                                        className={`text-[10px] pl-3 pt-0.5 leading-normal ${
                                                                            isSelected
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
