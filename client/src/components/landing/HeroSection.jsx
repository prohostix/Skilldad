import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    ArrowRight,
    GraduationCap,
    BookOpen,
    Briefcase,
    Award,
    UserCheck,
    Building2,
    BarChart3,
    Megaphone,
    Landmark
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { getMediaUrl } from '../../utils/media';
import skilldadLogo from '../../assets/logo.png';
import studentImg from '../../assets/hero/student.jpg';
import universityImg from '../../assets/hero/university.jpg';
import jobsImg from '../../assets/hero/jobs.jpg';
import coursesImg from '../../assets/hero/courses.jpg';
import certsImg from '../../assets/hero/certifications.jpg';

/* ─── Prestigious University Partners (Matching Reference) ─── */
const DEFAULT_UNIVERSITY_PARTNERS = [
    {
        name: 'The University of Melbourne',
        sub: 'EST. 1853',
        crest: (
            <svg className="w-8 h-8 shrink-0 text-[#1E1B4B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L4 5v6.5C4 16.5 7.5 21 12 22c4.5-1 8-5.5 8-10.5V5L12 2z" />
                <path d="M12 6v12M8 10h8" />
            </svg>
        )
    },
    {
        name: 'University of London',
        sub: 'EST. 1836',
        crest: (
            <svg className="w-8 h-8 shrink-0 text-[#1E1B4B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 3v18M3 12h18M7 7l10 10M17 7L7 17" />
            </svg>
        )
    },
    {
        name: 'University of Southampton',
        sub: 'RUSSELL GROUP',
        crest: (
            <svg className="w-8 h-8 shrink-0 text-[#1E1B4B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L3 7v6c0 5 4 9 9 9s9-4 9-9V7l-9-5z" />
                <path d="M12 7l4 4-4 4-4-4 4-4z" />
            </svg>
        )
    },
    {
        name: 'Birmingham City University',
        sub: 'UNITED KINGDOM',
        crest: (
            <svg className="w-8 h-8 shrink-0 text-[#1E1B4B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10M8 9h8M9 15h6" />
            </svg>
        )
    },
    {
        name: 'UTS University of Technology Sydney',
        sub: 'AUSTRALIA',
        crest: (
            <svg className="w-8 h-8 shrink-0 text-[#1E1B4B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 6h16M12 6v14M8 12h8" />
            </svg>
        )
    }
];

/* ─── Hero Ecosystem Nodes ─── */
const ECOSYSTEM_NODES = [
    {
        id: 'students',
        title: 'Students',
        icon: UserCheck,
        image: studentImg,
        left: '14%',
        top: '12%',
        anchorX: 70,
        anchorY: 60
    },
    {
        id: 'universities',
        title: 'Universities',
        icon: GraduationCap,
        image: universityImg,
        left: '74%',
        top: '16%',
        anchorX: 370,
        anchorY: 80
    },
    {
        id: 'jobs',
        title: 'Jobs',
        icon: Briefcase,
        image: jobsImg,
        left: '78%',
        top: '52%',
        anchorX: 390,
        anchorY: 260
    },
    {
        id: 'courses',
        title: 'Courses',
        icon: BookOpen,
        image: coursesImg,
        left: '42%',
        top: '80%',
        anchorX: 210,
        anchorY: 400
    },
    {
        id: 'certifications',
        title: 'Certifications',
        icon: Award,
        image: certsImg,
        left: '10%',
        top: '50%',
        anchorX: 50,
        anchorY: 250
    }
];

const HeroSection = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [dynamicPartners, setDynamicPartners] = useState([]);

    const getDashboardLink = () => {
        if (!user) return '/login';
        if (user.role === 'admin') return '/admin';
        if (user.role === 'university') return '/university/dashboard';
        if (user.role === 'instructor') return '/instructor-dashboard';
        return '/dashboard';
    };

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await fetch('/api/public/partner-logos');
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    setDynamicPartners(data);
                }
            } catch (err) {
                console.error('Failed to fetch partner logos:', err);
            }
        };
        fetchPartners();
    }, []);

    return (
        <section className="relative min-h-[92vh] lg:min-h-[96vh] flex flex-col justify-between pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#FAF8FF] via-[#F6F0FF] to-[#ECE1FF] dark:from-[#080512] dark:via-[#0F0824] dark:to-[#170E35] overflow-hidden select-none">
            
            {/* Ambient subtle violet background gradients */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/4 -right-32 w-[480px] h-[480px] bg-purple-300/30 dark:bg-purple-800/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-violet-200/30 dark:bg-violet-950/20 rounded-full blur-3xl pointer-events-none" />

            {/* Smooth 3D Silk Purple Ribbon sweeping across bottom-right (Exact match to reference) */}
            <div className="absolute right-0 top-1/4 bottom-0 w-[360px] sm:w-[480px] md:w-[600px] lg:w-[680px] pointer-events-none overflow-hidden z-0">
                <svg
                    viewBox="0 0 700 800"
                    className="w-full h-full object-cover opacity-90 dark:opacity-80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="silkGrad1" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#C084FC" stopOpacity="0.8" />
                            <stop offset="40%" stopColor="#8B5CF6" stopOpacity="0.9" />
                            <stop offset="70%" stopColor="#6D28D9" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="#4C1D95" stopOpacity="0.98" />
                        </linearGradient>
                        <linearGradient id="silkGrad2" x1="90%" y1="10%" x2="10%" y2="90%">
                            <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.6" />
                            <stop offset="50%" stopColor="#A855F7" stopOpacity="0.75" />
                            <stop offset="100%" stopColor="#581C87" stopOpacity="0.9" />
                        </linearGradient>
                        <linearGradient id="silkShine" x1="0%" y1="50%" x2="100%" y2="50%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                        </linearGradient>
                        <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#F3E8FF" />
                            <stop offset="35%" stopColor="#C084FC" />
                            <stop offset="75%" stopColor="#7C3AED" />
                            <stop offset="100%" stopColor="#4C1D95" />
                        </radialGradient>
                    </defs>

                    {/* Sweeping silk ribbon wave shape 1 */}
                    <path
                        d="M 650 300 C 580 420, 420 540, 480 680 C 540 820, 720 780, 760 850 L 760 900 L 350 900 C 420 780, 480 660, 400 580 C 320 500, 440 380, 650 300 Z"
                        fill="url(#silkGrad1)"
                    />
                    {/* Sweeping silk ribbon wave shape 2 with highlight */}
                    <path
                        d="M 700 240 C 620 380, 460 480, 520 620 C 580 760, 750 720, 800 800 L 750 820 C 700 740, 540 760, 480 620 C 420 480, 580 380, 660 260 Z"
                        fill="url(#silkGrad2)"
                    />
                    {/* Silk highlight crest line */}
                    <path
                        d="M 680 270 C 600 400, 440 510, 500 650 C 560 790, 740 750, 780 820"
                        stroke="url(#silkShine)"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Dotted Orbit Arc connecting to badges on right */}
                    <path
                        d="M 450 150 C 580 260, 600 420, 480 560"
                        stroke="#A855F7"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        strokeOpacity="0.45"
                    />
                    <circle cx="575" cy="270" r="3" fill="#A855F7" />
                    <circle cx="585" cy="380" r="3" fill="#A855F7" />
                    <circle cx="510" cy="510" r="3" fill="#A855F7" />
                </svg>
            </div>

            {/* ── MAIN HERO GRID (BALANCED 2-COLUMN MATCHING REFERENCE) ── */}
            <div className="max-w-7xl mx-auto w-full relative z-10 my-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
                    
                    {/* ── LEFT COLUMN: 5-NODE ECOSYSTEM NETWORK (MATCHING REFERENCE) ── */}
                    <div className="lg:col-span-6 relative flex items-center justify-center">
                        <div className="relative w-[340px] h-[340px] xs:w-[380px] xs:h-[380px] sm:w-[440px] sm:h-[440px] md:w-[480px] md:h-[480px]">
                            
                            {/* SVG Connection Lines & Animated Travel Pulses */}
                            <svg
                                viewBox="0 0 500 500"
                                className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
                            >
                                <defs>
                                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#C084FC" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#A855F7" stopOpacity="0.8" />
                                    </linearGradient>
                                </defs>

                                {/* Connections from Center Hub (250, 250) to Nodes */}
                                {/* To Students (90, 85) */}
                                <path d="M 250 250 C 200 180, 140 125, 90 85" stroke="url(#lineGrad)" strokeWidth="1.8" fill="none" />
                                {/* To Universities (390, 95) */}
                                <path d="M 250 250 C 300 180, 350 135, 390 95" stroke="url(#lineGrad)" strokeWidth="1.8" fill="none" />
                                {/* To Jobs (405, 275) */}
                                <path d="M 250 250 C 310 255, 355 265, 405 275" stroke="url(#lineGrad)" strokeWidth="1.8" fill="none" />
                                {/* To Courses (230, 415) */}
                                <path d="M 250 250 C 245 310, 240 365, 230 415" stroke="url(#lineGrad)" strokeWidth="1.8" fill="none" />
                                {/* To Certifications (70, 270) */}
                                <path d="M 250 250 C 180 255, 125 265, 70 270" stroke="url(#lineGrad)" strokeWidth="1.8" fill="none" />

                                {/* Inter-node connection loops matching reference */}
                                <path d="M 90 85 C 55 160, 50 210, 70 270" stroke="#DDD6FE" strokeWidth="1.4" strokeDasharray="3 3" fill="none" />
                                <path d="M 70 270 C 95 365, 150 405, 230 415" stroke="#DDD6FE" strokeWidth="1.4" strokeDasharray="3 3" fill="none" />
                                <path d="M 390 95 C 415 165, 420 215, 405 275" stroke="#DDD6FE" strokeWidth="1.4" strokeDasharray="3 3" fill="none" />

                                {/* Glowing Junction Dots */}
                                <circle cx="160" cy="160" r="3.5" fill="#A855F7" className="animate-ping" style={{ animationDuration: '3s' }} />
                                <circle cx="330" cy="180" r="3" fill="#9333EA" />
                                <circle cx="335" cy="260" r="3" fill="#A855F7" />
                                <circle cx="238" cy="340" r="3.5" fill="#7C3AED" className="animate-ping" style={{ animationDuration: '4s' }} />
                                <circle cx="150" cy="260" r="3" fill="#9333EA" />
                            </svg>

                            {/* ── CENTER HUB: SKILLDAD LOGO (EXACT USER REQUIREMENT) ── */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none">
                                {/* Outer Subtle Concentric Purple Glow Ring */}
                                <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-purple-300/60 dark:border-purple-700/40 animate-pulse pointer-events-none" />
                                <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-purple-400/15 dark:bg-purple-600/15 blur-xl pointer-events-none" />

                                {/* Central Circular Card with SkillDad Logo */}
                                <motion.div
                                    animate={{ scale: [1, 1.04, 1], y: [-2, 3, -2] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white dark:bg-[#1A1035] shadow-[0_12px_36px_rgba(109,40,217,0.22)] border-2 border-purple-200/90 dark:border-purple-600/50 flex items-center justify-center p-3 relative z-20 pointer-events-auto cursor-pointer hover:shadow-[0_16px_45px_rgba(109,40,217,0.32)] transition-shadow"
                                    onClick={() => navigate('/')}
                                >
                                    <img
                                        src={skilldadLogo}
                                        alt="SkillDad"
                                        className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_4px_10px_rgba(76,29,149,0.25)]"
                                    />
                                </motion.div>
                            </div>

                            {/* ── 5 CIRCULAR PHOTO NODES WITH ATTACHED PILL BADGES ── */}
                            {ECOSYSTEM_NODES.map((node, i) => {
                                const IconComp = node.icon;
                                return (
                                    <motion.div
                                        key={node.id}
                                        initial={{ opacity: 0, scale: 0.6 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.7, delay: i * 0.12, ease: 'easeOut' }}
                                        whileHover={{ scale: 1.08, zIndex: 30 }}
                                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center cursor-pointer group"
                                        style={{ left: node.left, top: node.top }}
                                    >
                                        {/* Circular Realistic Photo Node Frame */}
                                        <div className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full p-1 bg-white dark:bg-[#1A1035] shadow-[0_8px_24px_rgba(76,29,149,0.18)] border-2 border-white dark:border-purple-600/50 overflow-hidden relative transition-transform duration-300 group-hover:shadow-[0_12px_28px_rgba(76,29,149,0.28)]">
                                            <img
                                                src={node.image}
                                                alt={node.title}
                                                className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>

                                        {/* Pill Badge Attached Directly Beneath Photo */}
                                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/95 dark:bg-[#1A1035]/95 backdrop-blur-md border border-purple-200/90 dark:border-purple-700/60 shadow-[0_4px_12px_rgba(76,29,149,0.10)] text-[11px] sm:text-xs font-bold text-[#4C1D95] dark:text-purple-300 whitespace-nowrap group-hover:bg-purple-50 dark:group-hover:bg-purple-900/40 transition-colors">
                                            <IconComp size={13} className="text-[#6D28D9] dark:text-purple-400 shrink-0" strokeWidth={2.4} />
                                            <span>{node.title}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}

                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: HERO TEXT & 3 FLOATING CATEGORY BADGES ── */}
                    <div className="lg:col-span-6 relative z-10 flex flex-col items-start text-left lg:pl-4">
                        
                        {/* Eyebrow: YOUR GATEWAY TO A BRIGHTER FUTURE */}
                        <div className="flex items-center gap-2.5 mb-3.5">
                            <span className="w-7 h-[2px] bg-[#6D28D9] rounded-full"></span>
                            <span className="text-[11px] sm:text-xs md:text-[12.5px] font-extrabold uppercase tracking-widest text-[#6D28D9] dark:text-purple-400 font-sans">
                                YOUR GATEWAY TO A BRIGHTER FUTURE
                            </span>
                        </div>

                        {/* Main Headline: "Confusion to Career" (Exact User Requirement) */}
                        <h1 className="text-4xl sm:text-5xl md:text-[54px] lg:text-[58px] xl:text-[64px] font-black tracking-tight leading-[1.08] mb-4 font-sans text-[#1E1B4B] dark:text-white">
                            Confusion to <br />
                            <span className="text-[#4C1D95] dark:text-[#A855F7]">
                                Career
                            </span>
                        </h1>

                        {/* Subtitle Matching Reference Exactly */}
                        <p className="text-sm sm:text-base md:text-[16px] lg:text-[17px] text-slate-600 dark:text-purple-200/80 max-w-xl leading-relaxed mb-8 font-normal font-sans">
                            SkillDad connects you with top universities, industry-aligned courses and real job opportunities — so you can learn, upskill and get placed.
                        </p>

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 mb-6">
                            <button
                                onClick={() => navigate(user ? getDashboardLink() : '/courses')}
                                className="rounded-full bg-[#4C1D95] hover:bg-[#3B1578] text-white px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-[15px] font-bold shadow-[0_12px_28px_-6px_rgba(76,29,149,0.45)] flex items-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
                            >
                                <span>{user ? 'Go to Dashboard' : 'Start Learning Today'}</span>
                                <ArrowRight size={17} className="stroke-[2.5]" />
                            </button>

                            {!user && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="rounded-full bg-white/90 hover:bg-white dark:bg-[#1A1035] dark:hover:bg-[#25174B] border border-purple-200/90 dark:border-purple-700/60 text-[#4C1D95] dark:text-purple-300 px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-[15px] font-bold shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
                                >
                                    Login Now
                                </button>
                            )}
                        </div>

                        {/* ── 3 FLOATING CATEGORY BADGES ALONG THE ORBIT (MATCHING REFERENCE) ── */}
                        <div className="hidden sm:flex flex-col gap-3.5 absolute -right-6 lg:-right-12 xl:-right-16 top-6 pointer-events-auto">
                            {/* Badge 1: Hospital Administration */}
                            <motion.div
                                animate={{ y: [-4, 5, -4] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                className="px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#1A1035]/90 backdrop-blur-md shadow-[0_8px_20px_rgba(76,29,149,0.12)] border border-purple-200/80 dark:border-purple-700/60 flex items-center gap-2.5 text-xs font-bold text-[#1E1B4B] dark:text-purple-200 hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => navigate('/courses?search=Hospital')}
                            >
                                <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-[#6D28D9] dark:text-purple-300">
                                    <Building2 size={13} strokeWidth={2.4} />
                                </div>
                                <span>Hospital Administration</span>
                            </motion.div>

                            {/* Badge 2: Data Analyst */}
                            <motion.div
                                animate={{ y: [4, -5, 4] }}
                                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                className="px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#1A1035]/90 backdrop-blur-md shadow-[0_8px_20px_rgba(76,29,149,0.12)] border border-purple-200/80 dark:border-purple-700/60 flex items-center gap-2.5 text-xs font-bold text-[#1E1B4B] dark:text-purple-200 hover:scale-105 transition-transform cursor-pointer ml-6"
                                onClick={() => navigate('/courses?search=Data')}
                            >
                                <div className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-700 dark:text-cyan-300">
                                    <BarChart3 size={13} strokeWidth={2.4} />
                                </div>
                                <span>Data Analyst</span>
                            </motion.div>

                            {/* Badge 3: Digital Marketing */}
                            <motion.div
                                animate={{ y: [-3, 4, -3] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                className="px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#1A1035]/90 backdrop-blur-md shadow-[0_8px_20px_rgba(76,29,149,0.12)] border border-purple-200/80 dark:border-purple-700/60 flex items-center gap-2.5 text-xs font-bold text-[#1E1B4B] dark:text-purple-200 hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => navigate('/courses?search=Marketing')}
                            >
                                <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-[#6D28D9] dark:text-purple-300">
                                    <Megaphone size={13} strokeWidth={2.4} />
                                </div>
                                <span>Digital Marketing</span>
                            </motion.div>

                            {/* Floating 3D Purple Orb Sphere */}
                            <motion.div
                                animate={{ y: [-6, 8, -6], scale: [1, 1.05, 1] }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-9 h-9 rounded-full shadow-[0_10px_20px_rgba(109,40,217,0.35)] ml-14 mt-2"
                                style={{ background: 'radial-gradient(circle at 35% 35%, #F3E8FF 0%, #C084FC 35%, #7C3AED 75%, #4C1D95 100%)' }}
                            />
                        </div>

                    </div>

                </div>
            </div>

            {/* ── BOTTOM: TRUSTED BY LEADING UNIVERSITIES & PARTNERS (MATCHING REFERENCE) ── */}
            <div className="w-full relative z-10 pt-10 sm:pt-14 pb-2">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Header line: — TRUSTED BY LEADING UNIVERSITIES & PARTNERS — */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="w-8 sm:w-16 h-[1.5px] bg-purple-300/50 dark:bg-purple-800/40"></span>
                        <span className="text-[10px] sm:text-[11.5px] font-extrabold uppercase tracking-[0.2em] text-[#6D28D9] dark:text-purple-400">
                            TRUSTED BY LEADING UNIVERSITIES & PARTNERS
                        </span>
                        <span className="w-8 sm:w-16 h-[1.5px] bg-purple-300/50 dark:bg-purple-800/40"></span>
                    </div>

                    {/* Logos Strip Matching Reference Style */}
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-14 px-4 opacity-85 hover:opacity-100 transition-opacity">
                        {/* Standard Prestigious Academic Logos */}
                        {DEFAULT_UNIVERSITY_PARTNERS.map((partner, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2.5 transition-transform hover:scale-105 cursor-default shrink-0 group"
                            >
                                <div className="opacity-90 group-hover:opacity-100 transition-opacity">
                                    {partner.crest}
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-xs sm:text-[13px] font-extrabold tracking-tight text-[#1E1B4B] dark:text-purple-200 leading-tight">
                                        {partner.name}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 dark:text-purple-400/60 tracking-wider">
                                        {partner.sub}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Any dynamically configured CMS logos */}
                        {dynamicPartners.slice(0, 3).map((partner, idx) => {
                            const logoUrl = partner.logo || partner.imageUrl;
                            if (!logoUrl) return null;

                            return (
                                <div key={`dyn-${idx}`} className="flex items-center gap-2 shrink-0">
                                    <img
                                        src={logoUrl.startsWith('http') ? logoUrl : getMediaUrl(logoUrl)}
                                        alt={partner.name}
                                        className="h-6 sm:h-7 max-w-[100px] object-contain opacity-80 hover:opacity-100 transition-opacity"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>

        </section>
    );
};

export default HeroSection;
