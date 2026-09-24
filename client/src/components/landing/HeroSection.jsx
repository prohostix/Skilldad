import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Building2,
    BarChart3,
    Megaphone,
    GraduationCap
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { getMediaUrl } from '../../utils/media';

// Hero Assets exactly matching reference
import studentImg from '../../assets/hero/student.jpg';
import universityImg from '../../assets/hero/university.jpg';
import jobsImg from '../../assets/hero/jobs.jpg';
import coursesImg from '../../assets/hero/courses.jpg';
import certsImg from '../../assets/hero/certifications.jpg';
import heroRibbon from '../../assets/hero-ribbon.png';
import skilldadLogoDeepPurple from '../../assets/logo_deep_purple.png';

const HeroSection = () => {
    const navigate = useNavigate();
    const { user } = useUser();

    const getDashboardLink = () => {
        if (!user) return '/login';
        if (user.role === 'admin') return '/admin';
        if (user.role === 'university') return '/university/dashboard';
        if (user.role === 'instructor') return '/instructor-dashboard';
        return '/dashboard';
    };

    // Uploaded partner universities from database with real images & names
    const [universityPartners, setUniversityPartners] = useState([
        { name: "Amritha Vishwa Vidyapeedam", imageUrl: "/uploads/logo-1788941958199.webp" },
        { name: "Canadian Institute Of Technology (CIT)", imageUrl: "/uploads/logo-1788942025448.jpg" },
        { name: "Mediterranean University (MU)", imageUrl: "/uploads/logo-1788942072427.png" },
        { name: "JAIN UNIVERSITY", imageUrl: "/uploads/logo-1788942119589.png" },
        { name: "GLA UNIVERSITY", imageUrl: "/uploads/logo-1788942159826.png" },
        { name: "MANIPAL UNIVERSITY", imageUrl: "/uploads/logo-1788942206138.png" }
    ]);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await fetch('/api/public/partner-logos');
                const data = await res.json();
                if (data && data.length > 0) {
                    const unis = data.filter(item => item.type === 'university' && item.isActive !== false);
                    if (unis.length > 0) {
                        setUniversityPartners(unis);
                    }
                }
            } catch (e) {
                // Keep default uploaded universities
            }
        };
        fetchPartners();
    }, []);

    // 5 Interactive Constellation Nodes with exact reference icons and labels
    const constellationNodes = [
        {
            id: 'students',
            label: 'Students',
            // Innovative Smart Student Beacon Icon
            icon: (
                <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] p-1 flex items-center justify-center shadow-xs shrink-0 group-hover:rotate-6 transition-transform">
                    <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>
            ),
            image: studentImg,
            posClass: 'left-[14%] top-[7%]',
            floatAnim: { y: [-5, 5, -5], x: [-2, 2, -2] },
            floatDuration: 4.6,
            floatDelay: 0
        },
        {
            id: 'universities',
            label: 'Universities',
            // Innovative Academy Crest Icon
            icon: (
                <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#9333EA] p-1 flex items-center justify-center shadow-xs shrink-0 group-hover:rotate-6 transition-transform">
                    <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>
            ),
            image: universityImg,
            posClass: 'right-[13%] top-[7%]',
            floatAnim: { y: [5, -5, 5], x: [2, -2, 2] },
            floatDuration: 5.2,
            floatDelay: 0.4
        },
        {
            id: 'jobs',
            label: 'Jobs',
            // Innovative Modern Executive Portfolio Icon
            icon: (
                <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-[#5B21B6] to-[#7C3AED] p-1 flex items-center justify-center shadow-xs shrink-0 group-hover:rotate-6 transition-transform">
                    <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="3" />
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        <circle cx="12" cy="14" r="2" />
                        <path d="M12 16v2" />
                    </svg>
                </div>
            ),
            image: jobsImg,
            posClass: 'right-[3%] top-[41%]',
            floatAnim: { y: [-5, 5, -5], x: [2, -2, 2] },
            floatDuration: 4.2,
            floatDelay: 0.8
        },
        {
            id: 'courses',
            label: 'Courses',
            // Innovative Holographic Learning Book Icon
            icon: (
                <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#C084FC] p-1 flex items-center justify-center shadow-xs shrink-0 group-hover:rotate-6 transition-transform">
                    <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        <path d="M9 7h6" />
                        <path d="M9 11h4" />
                    </svg>
                </div>
            ),
            image: coursesImg,
            posClass: 'left-[37%] bottom-[3%]',
            floatAnim: { y: [5, -5, 5], x: [-2, 2, -2] },
            floatDuration: 4.8,
            floatDelay: 1.2
        },
        {
            id: 'certifications',
            label: 'Certifications',
            // Innovative Star Rosette Seal Icon
            icon: (
                <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#EC4899] p-1 flex items-center justify-center shadow-xs shrink-0 group-hover:rotate-6 transition-transform">
                    <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="9" r="6" />
                        <path d="M8.21 13.89L7 22l5-3 5 3-1.21-8.11" />
                        <polygon points="12 6 13.1 8.2 15.5 8.5 13.8 10.2 14.2 12.5 12 11.3 9.8 12.5 10.2 10.2 8.5 8.5 10.9 8.2 12 6" fill="currentColor" stroke="none" />
                    </svg>
                </div>
            ),
            image: certsImg,
            posClass: 'left-[4%] top-[41%]',
            floatAnim: { y: [-5, 5, -5], x: [-2, 2, -2] },
            floatDuration: 4.4,
            floatDelay: 1.6
        }
    ];

    return (
        <section className="relative w-full min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:min-h-[660px] lg:max-h-[860px] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#FAF8FE] via-[#F8F5FD] to-[#F3EDFC] dark:from-[#090514] dark:via-[#0F0822] dark:to-[#140B2D] pt-4 sm:pt-6 pb-2 sm:pb-3">
            
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-1/4 -left-20 w-[440px] h-[440px] bg-purple-300/25 dark:bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-200/25 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Main Hero Container */}
            <div className="flex-1 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20 py-2 sm:py-4">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">

                    {/* ── LEFT COLUMN: CONSTELLATION NETWORK DIAGRAM (Moderately sized) ── */}
                    <div className="lg:col-span-5 flex items-center justify-center relative select-none">
                        <div className="w-[300px] xs:w-[335px] sm:w-[370px] md:w-[400px] lg:w-[415px] xl:w-[425px] aspect-square relative flex items-center justify-center shrink-0">
                            {/* Very Thin, Standard Purple Connection Arc Lines & Moving Purple Dots */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 100">
                                {/* Delicate Central Orbit Track */}
                                <circle cx="50" cy="50" r="14" fill="none" stroke="rgba(147, 51, 234, 0.45)" strokeWidth="0.22" shapeRendering="geometricPrecision" />

                                {/* 1. SkillDad <-> Students Double Connection Lines */}
                                <path
                                    d="M 26 27 Q 29 40 43 45"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />
                                <path
                                    d="M 45 42 Q 38 31 27 25"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* 2. SkillDad <-> Universities Double Connection Lines */}
                                <path
                                    d="M 74 27 Q 71 40 57 45"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />
                                <path
                                    d="M 55 42 Q 62 31 73 25"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* 3. SkillDad <-> Jobs Double Connection Lines */}
                                <path
                                    d="M 58 48 Q 69 42 78 48"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />
                                <path
                                    d="M 78 54 Q 69 60 58 52"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* 4. SkillDad <-> Certifications Double Connection Lines */}
                                <path
                                    d="M 22 48 Q 31 42 42 48"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />
                                <path
                                    d="M 42 52 Q 31 60 22 54"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* 5. SkillDad <-> Courses Double Connection Lines */}
                                <path
                                    d="M 48 58 Q 42 68 46 76"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />
                                <path
                                    d="M 48 76 Q 58 68 52 58"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* Outer Perimeter Petal Arcs connecting adjacent nodes */}
                                <path d="M 28 17 Q 50 7 72 17" fill="none" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.5 2" shapeRendering="geometricPrecision" />
                                <path d="M 78 24 Q 89 34 85 45" fill="none" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.5 2" shapeRendering="geometricPrecision" />
                                <path d="M 84 57 Q 75 76 53 82" fill="none" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.5 2" shapeRendering="geometricPrecision" />
                                <path d="M 41 82 Q 22 76 17 57" fill="none" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.5 2" shapeRendering="geometricPrecision" />
                                <path d="M 15 45 Q 11 29 20 22" fill="none" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.5 2" shapeRendering="geometricPrecision" />

                                {/* Very Small Purple Dots Moving Through Flower Lines */}
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 26 27 Q 29 40 43 45" dur="3.4s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 45 42 Q 38 31 27 25" dur="3.6s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 74 27 Q 71 40 57 45" dur="3.5s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 55 42 Q 62 31 73 25" dur="3.7s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 58 48 Q 69 42 78 48" dur="3.3s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 78 54 Q 69 60 58 52" dur="3.6s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 22 48 Q 31 42 42 48" dur="3.8s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 42 52 Q 31 60 22 54" dur="3.7s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 48 58 Q 42 68 46 76" dur="3.5s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 48 76 Q 58 68 52 58" dur="3.7s" repeatCount="indefinite" />
                                </circle>

                                {/* Moving Very Small Purple Dots around Outer Perimeter */}
                                <circle r="0.4" fill="#9333EA">
                                    <animateMotion path="M 28 17 Q 50 7 72 17" dur="5.5s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.4" fill="#9333EA">
                                    <animateMotion path="M 78 24 Q 89 34 85 45" dur="4.8s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.4" fill="#9333EA">
                                    <animateMotion path="M 84 57 Q 75 76 53 82" dur="5.2s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.4" fill="#9333EA">
                                    <animateMotion path="M 41 82 Q 22 76 17 57" dur="5s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.4" fill="#9333EA">
                                    <animateMotion path="M 15 45 Q 11 29 20 22" dur="5.4s" repeatCount="indefinite" />
                                </circle>
                            </svg>
                            {/* Center Hub: SkillDad Logo with Soft Radiant Aura (Reduced a little) */}
                            <motion.div
                                animate={{ scale: [1, 1.03, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-white dark:bg-[#130B24] shadow-[0_10px_30px_rgba(109,40,217,0.20)] border-2 sm:border-[3px] border-purple-100 dark:border-purple-800/60 ring-4 sm:ring-6 ring-purple-100/50 dark:ring-purple-900/30 flex items-center justify-center p-2.5 sm:p-3 relative z-20"
                            >
                                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md pointer-events-none animate-pulse" />
                                <img
                                    src={skilldadLogoDeepPurple}
                                    alt="SkillDad"
                                    className="w-full h-full object-contain relative z-10 drop-shadow-sm"
                                />
                            </motion.div>

                            {/* 5 Surrounding Animated Photo Nodes with White Badges (Increased a little more) */}
                            {constellationNodes.map((node) => {
                                return (
                                    <motion.div
                                        key={node.id}
                                        animate={node.floatAnim}
                                        transition={{
                                            duration: node.floatDuration,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                            delay: node.floatDelay
                                        }}
                                        whileHover={{ scale: 1.08, zIndex: 40 }}
                                        className={`absolute ${node.posClass} flex flex-col items-center group cursor-pointer z-10`}
                                    >
                                        <div className="w-17 h-17 xs:w-19 xs:h-19 sm:w-21 sm:h-21 md:w-[86px] md:h-[86px] rounded-full border-[3.5px] border-white dark:border-purple-950 shadow-[0_8px_24px_rgba(109,40,217,0.22)] overflow-hidden bg-white dark:bg-purple-950 shrink-0 group-hover:shadow-[0_12px_28px_rgba(109,40,217,0.35)] transition-shadow duration-300">
                                            <img
                                                src={node.image}
                                                alt={node.label}
                                                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full shadow-[0_4px_14px_rgba(76,29,149,0.14)] border border-purple-100/90 dark:border-purple-800/50 flex items-center gap-1.5 -mt-3.5 sm:-mt-4 relative z-10 whitespace-nowrap group-hover:border-purple-300 transition-colors">
                                            {node.icon}
                                            <span className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-purple-100 tracking-tight">
                                                {node.label}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── CENTER COLUMN: EDITORIAL HEADING & ACTIONS (4.8 cols) ── */}
                    <div className="lg:col-span-5 flex flex-col items-start text-left pl-0 lg:pl-2 xl:pl-4 z-20">
                        
                        {/* Eyebrow matching Reference */}
                        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                            <span className="w-5 h-[2px] bg-[#6D28D9] rounded-full inline-block" />
                            <span className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-[0.2em] text-[#6D28D9] dark:text-purple-400">
                                YOUR GATEWAY TO A BRIGHTER FUTURE
                            </span>
                        </div>

                        {/* Redesigned Heading: "Confusion to Career" */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[54px] font-black tracking-tight leading-[1.08] font-sans">
                            <span className="text-[#0F172A] dark:text-white block">
                                Confusion to
                            </span>
                            <span className="text-[#6644C1] dark:text-purple-400 block">
                                Career
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xs sm:text-sm md:text-[14.5px] text-slate-600 dark:text-purple-200/80 leading-relaxed font-normal max-w-lg mt-3 sm:mt-3.5 mb-5 sm:mb-6">
                            SkillDad connects you with top universities, industry-aligned courses and real job opportunities — so you can learn, upskill and get placed.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <button
                                onClick={() => navigate(user ? getDashboardLink() : '/register')}
                                className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#4C1D95] via-[#5B21B6] to-[#6D28D9] hover:from-[#3B1578] hover:to-[#5B21B6] text-white text-xs sm:text-sm font-semibold shadow-[0_10px_25px_-5px_rgba(109,40,217,0.45)] hover:shadow-[0_16px_32px_-5px_rgba(109,40,217,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
                            >
                                <span>{user ? 'Go to Dashboard' : 'Start Learning Today'}</span>
                                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            {!user && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white/90 dark:bg-purple-950/60 hover:bg-purple-50/90 dark:hover:bg-purple-900/60 text-[#4C1D95] dark:text-purple-300 border border-purple-200/90 dark:border-purple-800/60 text-xs sm:text-sm font-semibold shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                >
                                    Login Now
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: FLOATING COURSE BADGES & SILK WAVE (2.2 cols) ── */}
                    <div className="lg:col-span-2 hidden lg:flex flex-col items-end justify-center relative h-[360px] select-none">
                        
                        {/* Curved dashed orbit track */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 160 360">
                            <path
                                d="M 120 25 C 50 110, 140 210, 60 330"
                                fill="none"
                                stroke="rgba(192, 132, 252, 0.45)"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                            />
                            {/* Floating decorative purple orb on orbit */}
                            <circle cx="95" cy="175" r="3.5" fill="#A855F7" className="animate-pulse" />
                            <circle cx="120" cy="25" r="2.5" fill="#8B5CF6" />
                            <circle cx="60" cy="330" r="2.5" fill="#C4B5FD" />
                        </svg>

                        {/* 3 Floating Badges matching Reference */}
                        <div className="space-y-8 relative z-20 flex flex-col items-end pr-2">
                            
                            {/* 1. Hospital Administration */}
                            <motion.div
                                animate={{ y: [-4, 5, -4] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                className="bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_8px_20px_rgba(124,58,237,0.12)] border border-purple-100 dark:border-purple-800/40 flex items-center gap-2 cursor-default hover:scale-105 transition-transform"
                            >
                                <div className="w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                                    <Building2 size={12} className="text-[#7C3AED] dark:text-purple-300" />
                                </div>
                                <span className="text-[11px] font-semibold text-slate-800 dark:text-purple-100 whitespace-nowrap">
                                    Hospital Administration
                                </span>
                            </motion.div>

                            {/* 2. Data Analyst */}
                            <motion.div
                                animate={{ y: [4, -5, 4] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                className="bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_8px_20px_rgba(124,58,237,0.12)] border border-purple-100 dark:border-purple-800/40 flex items-center gap-2 cursor-default hover:scale-105 transition-transform -mr-2"
                            >
                                <div className="w-5 h-5 rounded-full bg-cyan-50 dark:bg-cyan-900/40 flex items-center justify-center shrink-0">
                                    <BarChart3 size={12} className="text-[#06B6D4] dark:text-cyan-300" />
                                </div>
                                <span className="text-[11px] font-semibold text-slate-800 dark:text-purple-100 whitespace-nowrap">
                                    Data Analyst
                                </span>
                            </motion.div>

                            {/* 3. Digital Marketing */}
                            <motion.div
                                animate={{ y: [-3, 5, -3] }}
                                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                className="bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_8px_20px_rgba(124,58,237,0.12)] border border-purple-100 dark:border-purple-800/40 flex items-center gap-2 cursor-default hover:scale-105 transition-transform"
                            >
                                <div className="w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                                    <Megaphone size={12} className="text-[#8B5CF6] dark:text-purple-300" />
                                </div>
                                <span className="text-[11px] font-semibold text-slate-800 dark:text-purple-100 whitespace-nowrap">
                                    Digital Marketing
                                </span>
                            </motion.div>

                        </div>
                    </div>

                </div>
            </div>

            {/* 3D Violet Wave / Ribbon in Bottom-Right Corner matching Reference */}
            <div className="absolute bottom-0 right-0 w-[300px] sm:w-[380px] md:w-[460px] lg:w-[500px] pointer-events-none select-none z-0 translate-y-4 opacity-90">
                <img
                    src={heroRibbon}
                    alt="Decorative Silk Ribbon"
                    className="w-full h-auto object-contain drop-shadow-[0_12px_28px_rgba(109,40,217,0.22)]"
                />
            </div>

            {/* ── BOTTOM ROW: TRUSTED BY LEADING UNIVERSITIES & PARTNERS (Using Uploaded Universities) ── */}
            <div className="w-full relative z-20 py-2 sm:py-2.5 border-t border-purple-100/70 dark:border-purple-900/30 bg-white/40 dark:bg-purple-950/20 backdrop-blur-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Divider Label matching Reference */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-1.5 sm:mb-2">
                        <div className="w-12 sm:w-20 h-[1px] bg-purple-200 dark:bg-purple-800" />
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.22em] text-[#6D28D9] dark:text-purple-300">
                            TRUSTED BY LEADING UNIVERSITIES & PARTNERS
                        </span>
                        <div className="w-12 sm:w-20 h-[1px] bg-purple-200 dark:bg-purple-800" />
                    </div>

                    {/* Universities Single Horizontal Row matching Reference with 2-line stacked lockups */}
                    <div className="flex items-center justify-start sm:justify-center gap-5 sm:gap-7 md:gap-9 lg:gap-12 xl:gap-14 overflow-x-auto no-scrollbar w-full py-1 opacity-90 hover:opacity-100 transition-opacity">
                        {universityPartners.map((uni, idx) => {
                            const rawLogo = uni.imageUrl || uni.logo;
                            const hasLogo = !!rawLogo;
                            const logoSrc = hasLogo ? (rawLogo.startsWith('http') ? rawLogo : getMediaUrl(rawLogo)) : null;

                            // Format into 2-line stacked lockup like reference design
                            let line1 = uni.name;
                            let line2 = '';
                            if (uni.name.includes('(')) {
                                const parts = uni.name.split('(');
                                line1 = parts[0].trim();
                                line2 = `(${parts[1]}`.trim();
                            } else {
                                const words = uni.name.trim().split(' ');
                                if (words.length === 2) {
                                    line1 = words[0];
                                    line2 = words[1];
                                } else if (words.length > 2) {
                                    const mid = Math.ceil(words.length / 2);
                                    line1 = words.slice(0, mid).join(' ');
                                    line2 = words.slice(mid).join(' ');
                                }
                            }

                            return (
                                <div key={uni._id || idx} className="flex items-center gap-2 group cursor-default hover:scale-105 transition-transform duration-200 shrink-0">
                                    {hasLogo ? (
                                        <img
                                            src={logoSrc}
                                            alt={uni.name}
                                            className="h-6 sm:h-7 max-w-[42px] sm:max-w-[48px] object-contain opacity-90 group-hover:opacity-100 transition-opacity shrink-0"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <GraduationCap size={18} className="text-[#6D28D9] shrink-0" />
                                    )}
                                    <div className="flex flex-col leading-[1.1] text-left">
                                        <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            {line1}
                                        </span>
                                        {line2 && (
                                            <span className="text-[9.5px] sm:text-[10.5px] font-sans font-extrabold uppercase tracking-wider text-[#1E293B] dark:text-slate-100 whitespace-nowrap">
                                                {line2}
                                            </span>
                                        )}
                                    </div>
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
