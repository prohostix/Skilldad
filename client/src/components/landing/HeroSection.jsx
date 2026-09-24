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

    // 5 Interactive Constellation Nodes with exact reference icons and labels (no icon background)
    const constellationNodes = [
        {
            id: 'students',
            label: 'Students',
            // Student / ID Card Icon matching reference
            icon: (
                <svg className="w-3.5 h-3.5 text-[#6D28D9] dark:text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="7" width="14" height="14" rx="2" />
                    <circle cx="12" cy="12" r="2.5" />
                    <path d="M8 18c0-1.5 1.8-2.5 4-2.5s4 1 4 2.5" />
                    <path d="M12 3v4" />
                    <path d="M9 3h6" />
                </svg>
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
            // Classical Mortarboard / University Cap matching reference
            icon: (
                <svg className="w-3.5 h-3.5 text-[#6D28D9] dark:text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
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
            // Executive Briefcase matching reference
            icon: (
                <svg className="w-3.5 h-3.5 text-[#6D28D9] dark:text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
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
            // Open Book matching reference
            icon: (
                <svg className="w-3.5 h-3.5 text-[#6D28D9] dark:text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
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
            // Ribbon Rosette Medal matching reference
            icon: (
                <svg className="w-3.5 h-3.5 text-[#6D28D9] dark:text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="5" />
                    <path d="M15.4 12.8L17 22l-5-3-5 3 1.6-9.2" />
                </svg>
            ),
            image: certsImg,
            posClass: 'left-[4%] top-[41%]',
            floatAnim: { y: [-5, 5, -5], x: [-2, 2, -2] },
            floatDuration: 4.4,
            floatDelay: 1.6
        }
    ];

    return (
        <section className="relative w-full min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:min-h-[660px] lg:max-h-[860px] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#FAF8FE] via-[#FFFFFF] to-[#FFFFFF] dark:from-[#090514] dark:via-[#0F0822] dark:to-[#140B2D] pt-4 sm:pt-6 pb-0">
            
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-1/4 -left-20 w-[440px] h-[440px] bg-purple-300/25 dark:bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-200/25 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Main Hero Container */}
            <div className="flex-1 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20 py-2 sm:py-4">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">

                    {/* ── LEFT COLUMN: CONSTELLATION NETWORK DIAGRAM (Matching Reference Design) ── */}
                    <div className="lg:col-span-5 flex items-center justify-center relative select-none">
                        <div className="w-[300px] xs:w-[335px] sm:w-[370px] md:w-[400px] lg:w-[415px] xl:w-[425px] aspect-square relative flex items-center justify-center shrink-0">
                            {/* SVG Connection Lines, 3D Circle Bubbles & Moving Glowing Dots */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 100">
                                <defs>
                                    {/* 3D Spherical Purple Gradient for Circle Bubbles */}
                                    <radialGradient id="bubble3DGrad" cx="32%" cy="28%" r="72%">
                                        <stop offset="0%" stopColor="#FFFFFF" />
                                        <stop offset="20%" stopColor="#E9D5FF" />
                                        <stop offset="50%" stopColor="#A855F7" />
                                        <stop offset="82%" stopColor="#6D28D9" />
                                        <stop offset="100%" stopColor="#3B0764" />
                                    </radialGradient>
                                    {/* Soft drop shadow for Circle Bubbles */}
                                    <filter id="bubbleShadow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="0.8" stdDeviation="0.8" floodColor="#581C87" floodOpacity="0.35" />
                                    </filter>
                                </defs>

                                {/* Concentric Faint Halo Orbits around Center Hub */}
                                <circle cx="50" cy="50" r="17.5" fill="none" stroke="rgba(147, 51, 234, 0.22)" strokeWidth="0.25" />
                                <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(147, 51, 234, 0.12)" strokeWidth="0.2" strokeDasharray="1.2 2" />

                                {/* 1. RADIAL CONNECTION LINES (Center Hub -> 5 Nodes) */}
                                {/* Center -> Students */}
                                <path
                                    d="M 40.5 40.5 Q 33 31 27 24"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.32"
                                    strokeLinecap="round"
                                />
                                {/* Center -> Universities */}
                                <path
                                    d="M 59.5 40.5 Q 67 31 73 24"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.32"
                                    strokeLinecap="round"
                                />
                                {/* Center -> Jobs */}
                                <path
                                    d="M 63 50 Q 70 48.5 76 50"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.32"
                                    strokeLinecap="round"
                                />
                                {/* Center -> Courses */}
                                <path
                                    d="M 50 63 Q 48.5 69 50 74"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.32"
                                    strokeLinecap="round"
                                />
                                {/* Center -> Certifications */}
                                <path
                                    d="M 37 50 Q 30 51.5 24 50"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.32"
                                    strokeLinecap="round"
                                />

                                {/* 2. OUTER PERIMETER ARCS CONNECTING ADJACENT NODES */}
                                {/* Students <-> Universities */}
                                <path
                                    d="M 28 17 Q 50 10 72 17"
                                    fill="none"
                                    stroke="rgba(168, 85, 247, 0.45)"
                                    strokeWidth="0.3"
                                    strokeDasharray="1.5 2"
                                />
                                {/* Universities <-> Jobs */}
                                <path
                                    d="M 77 25 Q 86 36 82 46"
                                    fill="none"
                                    stroke="rgba(168, 85, 247, 0.45)"
                                    strokeWidth="0.3"
                                    strokeDasharray="1.5 2"
                                />
                                {/* Jobs <-> Courses */}
                                <path
                                    d="M 80 54 Q 76 72 56 78"
                                    fill="none"
                                    stroke="rgba(168, 85, 247, 0.45)"
                                    strokeWidth="0.3"
                                    strokeDasharray="1.5 2"
                                />
                                {/* Courses <-> Certifications */}
                                <path
                                    d="M 44 78 Q 24 72 20 54"
                                    fill="none"
                                    stroke="rgba(168, 85, 247, 0.45)"
                                    strokeWidth="0.3"
                                    strokeDasharray="1.5 2"
                                />
                                {/* Certifications <-> Students */}
                                <path
                                    d="M 18 46 Q 14 36 24 25"
                                    fill="none"
                                    stroke="rgba(168, 85, 247, 0.45)"
                                    strokeWidth="0.3"
                                    strokeDasharray="1.5 2"
                                />

                                {/* 3. 3D CIRCLE BUBBLES ON RADIAL LINES (Matching Right Side Style) */}
                                <g filter="url(#bubbleShadow)">
                                    {/* Bubble on Center-Students Line */}
                                    <circle cx="33.5" cy="32" r="1.5" fill="url(#bubble3DGrad)" />
                                    {/* Bubble on Center-Universities Line */}
                                    <circle cx="66.5" cy="32" r="1.5" fill="url(#bubble3DGrad)" />
                                    {/* Bubble on Center-Jobs Line */}
                                    <circle cx="69.5" cy="49.3" r="1.5" fill="url(#bubble3DGrad)" />
                                    {/* Bubble on Center-Courses Line */}
                                    <circle cx="49.3" cy="68.5" r="1.5" fill="url(#bubble3DGrad)" />
                                    {/* Bubble on Center-Certifications Line */}
                                    <circle cx="30.5" cy="50.7" r="1.5" fill="url(#bubble3DGrad)" />

                                    {/* 3D CIRCLE BUBBLES ON PERIMETER ARCS */}
                                    {/* Bubble between Students & Universities */}
                                    <circle cx="50" cy="13.5" r="1.6" fill="url(#bubble3DGrad)" />
                                    {/* Bubble between Universities & Jobs */}
                                    <circle cx="82" cy="36" r="1.5" fill="url(#bubble3DGrad)" />
                                    {/* Bubble between Jobs & Courses */}
                                    <circle cx="70" cy="68" r="1.6" fill="url(#bubble3DGrad)" />
                                    {/* Bubble between Courses & Certifications */}
                                    <circle cx="30" cy="68" r="1.6" fill="url(#bubble3DGrad)" />
                                    {/* Bubble between Certifications & Students */}
                                    <circle cx="18" cy="36" r="1.5" fill="url(#bubble3DGrad)" />
                                </g>

                                {/* Static Small Purple Dots along tracks */}
                                <circle cx="36" cy="13" r="0.6" fill="#8B5CF6" />
                                <circle cx="64" cy="13" r="0.6" fill="#8B5CF6" />
                                <circle cx="61" cy="76" r="0.6" fill="#8B5CF6" />
                                <circle cx="39" cy="76" r="0.6" fill="#8B5CF6" />

                                {/* 4. MOVING PURPLE GLOWING DOTS (Continuous Flow) */}
                                {/* Moving Ball from Courses to Jobs (Per User Requirement) */}
                                <circle r="0.6" fill="#9333EA" className="filter drop-shadow-[0_0_1.5px_#9333EA]">
                                    <animateMotion path="M 50 80 Q 76 72 82 50" dur="4.6s" repeatCount="indefinite" />
                                </circle>

                                {/* Moving Ball from Students to Universities */}
                                <circle r="0.55" fill="#8B5CF6" className="filter drop-shadow-[0_0_1.5px_#8B5CF6]">
                                    <animateMotion path="M 28 17 Q 50 10 72 17" dur="5.0s" repeatCount="indefinite" />
                                </circle>

                                {/* Moving Ball from Certifications to Students */}
                                <circle r="0.55" fill="#8B5CF6" className="filter drop-shadow-[0_0_1.5px_#8B5CF6]">
                                    <animateMotion path="M 18 46 Q 14 36 24 25" dur="4.8s" repeatCount="indefinite" />
                                </circle>

                                {/* Moving Ball from Center to Students */}
                                <circle r="0.5" fill="#7C3AED" className="filter drop-shadow-[0_0_1.5px_#7C3AED]">
                                    <animateMotion path="M 40.5 40.5 Q 33 31 27 24" dur="3.6s" repeatCount="indefinite" />
                                </circle>

                                {/* Moving Ball from Center to Universities */}
                                <circle r="0.5" fill="#7C3AED" className="filter drop-shadow-[0_0_1.5px_#7C3AED]">
                                    <animateMotion path="M 59.5 40.5 Q 67 31 73 24" dur="3.8s" repeatCount="indefinite" />
                                </circle>

                                {/* Moving Ball from Center to Jobs */}
                                <circle r="0.5" fill="#7C3AED" className="filter drop-shadow-[0_0_1.5px_#7C3AED]">
                                    <animateMotion path="M 63 50 Q 70 48.5 76 50" dur="3.4s" repeatCount="indefinite" />
                                </circle>
                            </svg>

                            {/* Center Hub: SkillDad Logo with Radiant Aura */}
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

                            {/* 5 Surrounding Animated Photo Nodes with Badges (No Icon Background) */}
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

                    {/* ── CENTER COLUMN: EDITORIAL HEADING & ACTIONS (4 cols) ── */}
                    <div className="lg:col-span-4 xl:col-span-4 flex flex-col items-start text-left pl-0 lg:pl-1 xl:pl-2 z-20">
                        
                        {/* Eyebrow matching Reference */}
                        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                            <span className="w-5 h-[2px] bg-[#6D28D9] rounded-full inline-block" />
                            <span className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-[0.2em] text-[#6D28D9] dark:text-purple-400">
                                YOUR GATEWAY TO A BRIGHTER FUTURE
                            </span>
                        </div>

                        {/* Heading: Confusion to Career */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[52px] font-black tracking-tight leading-[1.08] font-sans">
                            <span className="text-[#0F172A] dark:text-white block">
                                Confusion to
                            </span>
                            <span className="text-[#6644C1] dark:text-purple-400 block">
                                Career
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xs sm:text-sm md:text-[14px] text-slate-600 dark:text-purple-200/80 leading-relaxed font-normal max-w-md mt-3 sm:mt-3.5 mb-5 sm:mb-6">
                            A collaborative venture initiated by IITians and leading job providers in India, in partnership with reputed universities across the world.
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

                    {/* ── RIGHT COLUMN: CONSTELLATION NETWORK, 3D CIRCLE BUBBLES & FLOATING BADGES (3 cols) ── */}
                    <div className="lg:col-span-3 xl:col-span-3 hidden lg:flex items-center justify-center relative select-none">
                        <div className="relative w-full max-w-[320px] h-[390px]">
                            
                            {/* Constellation Network SVG Layer with 3D Spheres & Moving Purple Dots */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 300 390">
                                <defs>
                                    {/* 3D Purple Sphere Gradient */}
                                    <radialGradient id="rightSphere3D" cx="32%" cy="28%" r="72%">
                                        <stop offset="0%" stopColor="#FFFFFF" />
                                        <stop offset="18%" stopColor="#E9D5FF" />
                                        <stop offset="48%" stopColor="#A855F7" />
                                        <stop offset="80%" stopColor="#6D28D9" />
                                        <stop offset="100%" stopColor="#3B0764" />
                                    </radialGradient>
                                    <filter id="rightSphereShadow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#581C87" floodOpacity="0.28" />
                                    </filter>
                                </defs>

                                {/* Thin, sharp purple constellation tracks matching reference */}
                                <path
                                    d="M 130 20 L 125 75"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.42)"
                                    strokeWidth="0.9"
                                    strokeDasharray="2.5 3"
                                />
                                <path
                                    d="M 125 75 Q 115 110 100 155"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.42)"
                                    strokeWidth="0.9"
                                    strokeDasharray="2.5 3"
                                />
                                <path
                                    d="M 100 155 Q 170 178 245 155"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.42)"
                                    strokeWidth="0.9"
                                    strokeDasharray="2.5 3"
                                />
                                <path
                                    d="M 100 155 C 95 210 115 265 135 315"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.45)"
                                    strokeWidth="0.9"
                                    strokeDasharray="2.5 3"
                                />
                                <path
                                    d="M 135 315 C 138 342 142 360 145 375"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.42)"
                                    strokeWidth="0.9"
                                    strokeDasharray="2.5 3"
                                />
                                <path
                                    d="M 135 315 Q 185 340 225 358"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.35)"
                                    strokeWidth="0.9"
                                    strokeDasharray="2.5 3"
                                />

                                {/* Static Purple Dot Nodes along tracks */}
                                <circle cx="130" cy="20" r="2.2" fill="#8B5CF6" />
                                <circle cx="125" cy="75" r="2.0" fill="#A855F7" />
                                <circle cx="112" cy="225" r="2.0" fill="#8B5CF6" />
                                <circle cx="180" cy="342" r="2.0" fill="#A855F7" />
                                <circle cx="225" cy="358" r="2.4" fill="#8B5CF6" />

                                {/* 3D Purple Spheres / Circle Bubbles */}
                                {/* Medium Bubble 1 (Left of Data Analyst) */}
                                <g filter="url(#rightSphereShadow)">
                                    <circle cx="100" cy="155" r="7.5" fill="url(#rightSphere3D)" />
                                </g>

                                {/* Medium Bubble 2 (Right of Data Analyst) */}
                                <g filter="url(#rightSphereShadow)">
                                    <circle cx="245" cy="155" r="6.5" fill="url(#rightSphere3D)" />
                                </g>

                                {/* Large Central 3D Bubble (Beneath Digital Marketing) */}
                                <g filter="url(#rightSphereShadow)">
                                    <circle cx="135" cy="315" r="14.5" fill="url(#rightSphere3D)" />
                                </g>

                                {/* Lower Small Bubble */}
                                <g filter="url(#rightSphereShadow)">
                                    <circle cx="145" cy="375" r="5" fill="url(#rightSphere3D)" />
                                </g>

                                {/* Moving Purple Glowing Dots through tracks */}
                                <circle r="2.4" fill="#7C3AED" className="filter drop-shadow-[0_0_3px_#A855F7]">
                                    <animateMotion
                                        dur="4.4s"
                                        repeatCount="indefinite"
                                        path="M 100 155 C 95 210 115 265 135 315"
                                    />
                                </circle>

                                <circle r="2.0" fill="#8B5CF6" className="filter drop-shadow-[0_0_2.5px_#A855F7]">
                                    <animateMotion
                                        dur="4.0s"
                                        repeatCount="indefinite"
                                        path="M 100 155 Q 170 178 245 155"
                                    />
                                </circle>

                                <circle r="2.0" fill="#9333EA" className="filter drop-shadow-[0_0_2.5px_#A855F7]">
                                    <animateMotion
                                        dur="3.2s"
                                        repeatCount="indefinite"
                                        path="M 135 315 C 138 342 142 360 145 375"
                                    />
                                </circle>

                                <circle r="2.0" fill="#8B5CF6" className="filter drop-shadow-[0_0_2.5px_#A855F7]">
                                    <animateMotion
                                        dur="3.8s"
                                        repeatCount="indefinite"
                                        path="M 135 315 Q 185 340 225 358"
                                    />
                                </circle>
                            </svg>

                            {/* 3 Floating Badges (Positioned cleanly relative to network) */}
                            {/* 1. Hospital Administration */}
                            <motion.div
                                animate={{ y: [-4, 4, -4] }}
                                transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute top-[28px] right-[10px] z-20 bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_8px_22px_rgba(124,58,237,0.10)] border border-purple-100/90 dark:border-purple-800/40 flex items-center gap-2.5 cursor-default hover:scale-105 transition-transform"
                            >
                                <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                                    <Building2 size={13} className="text-[#6D28D9] dark:text-purple-300" />
                                </div>
                                <span className="text-[11.5px] font-semibold text-slate-800 dark:text-purple-100 whitespace-nowrap">
                                    Hospital Administration
                                </span>
                            </motion.div>

                            {/* 2. Data Analyst */}
                            <motion.div
                                animate={{ y: [4, -4, 4] }}
                                transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                                className="absolute top-[138px] right-[24px] z-20 bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_8px_22px_rgba(124,58,237,0.10)] border border-purple-100/90 dark:border-purple-800/40 flex items-center gap-2.5 cursor-default hover:scale-105 transition-transform"
                            >
                                <div className="w-6 h-6 rounded-lg bg-[#E0F2FE] dark:bg-cyan-950/50 flex items-center justify-center shrink-0">
                                    <BarChart3 size={13} className="text-[#0284C7] dark:text-cyan-300" />
                                </div>
                                <span className="text-[11.5px] font-semibold text-slate-800 dark:text-purple-100 whitespace-nowrap">
                                    Data Analyst
                                </span>
                            </motion.div>

                            {/* 3. Digital Marketing */}
                            <motion.div
                                animate={{ y: [-3, 4, -3] }}
                                transition={{ duration: 5.0, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                                className="absolute top-[244px] right-[8px] z-20 bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_8px_22px_rgba(124,58,237,0.10)] border border-purple-100/90 dark:border-purple-800/40 flex items-center gap-2.5 cursor-default hover:scale-105 transition-transform"
                            >
                                <div className="w-6 h-6 rounded-lg bg-purple-100/70 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                                    <Megaphone size={13} className="text-[#7C3AED] dark:text-purple-300" />
                                </div>
                                <span className="text-[11.5px] font-semibold text-slate-800 dark:text-purple-100 whitespace-nowrap">
                                    Digital Marketing
                                </span>
                            </motion.div>

                        </div>
                    </div>

                </div>
            </div>

            {/* 3D Violet Wave / Ribbon in Bottom-Right Corner matching Reference */}
            <div className="absolute bottom-0 right-0 w-[380px] sm:w-[460px] md:w-[540px] lg:w-[620px] pointer-events-none select-none z-0 overflow-visible opacity-95">
                <svg
                    viewBox="0 0 600 300"
                    fill="none"
                    className="w-full h-auto drop-shadow-[0_16px_36px_rgba(109,40,217,0.22)]"
                >
                    <defs>
                        <linearGradient id="satinGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.95" />
                            <stop offset="25%" stopColor="#8B5CF6" stopOpacity="1" />
                            <stop offset="60%" stopColor="#704CE1" stopOpacity="1" />
                            <stop offset="85%" stopColor="#5B21B6" stopOpacity="0.98" />
                            <stop offset="100%" stopColor="#4C1D95" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="sheerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.55" />
                            <stop offset="40%" stopColor="#DDD6FE" stopOpacity="0.4" />
                            <stop offset="75%" stopColor="#C084FC" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.05" />
                        </linearGradient>
                        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="16" result="blur" />
                        </filter>
                        <filter id="sheerBlur" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                        </filter>
                    </defs>

                    {/* Ambient background glow behind ribbon */}
                    <path
                        d="M 120 280 C 280 240 450 160 600 20 L 600 300 L 120 300 Z"
                        fill="url(#sheerGrad)"
                        filter="url(#softGlow)"
                        opacity="0.75"
                    />

                    {/* Translucent sheer wave layer (sweeps up behind badges) */}
                    <path
                        d="M 110 270 C 240 230 380 140 480 60 C 530 20 570 -10 600 -30 L 600 90 C 540 150 450 210 330 250 C 230 285 160 280 110 270 Z"
                        fill="url(#sheerGrad)"
                        filter="url(#sheerBlur)"
                        opacity="0.85"
                    />

                    {/* Solid Satin 3D Ribbon (Layer 1) */}
                    <path
                        d="M 75 272 C 200 268 350 232 475 165 C 525 138 565 105 600 80 L 600 165 C 550 205 470 250 365 285 C 255 320 145 295 75 272 Z"
                        fill="url(#satinGrad)"
                    />

                    {/* Highlight sheen along top edge of solid ribbon */}
                    <path
                        d="M 85 271 C 205 266 352 230 475 165 C 525 138 565 105 600 80"
                        stroke="rgba(255, 255, 255, 0.45)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        filter="url(#sheerBlur)"
                    />
                </svg>
            </div>

            {/* ── BOTTOM ROW: TRUSTED BY LEADING UNIVERSITIES & PARTNERS (Organic Wave Background matching Reference #F3F4FD) ── */}
            <div className="w-full relative z-20 bg-[#F3F4FD] dark:bg-[#0B081A] pt-3 sm:pt-4 pb-3 sm:pb-4 transition-colors">
                {/* Organic Wave Boundary at Top */}
                <div className="absolute -top-7 sm:-top-10 md:-top-12 left-0 w-full overflow-hidden leading-none pointer-events-none z-10">
                    <svg
                        className="relative block w-full h-7 sm:h-10 md:h-12"
                        viewBox="0 0 1440 70"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M 0 32 C 340 76 560 76 840 42 C 1120 12 1320 22 1440 14 L 1440 70 L 0 70 Z"
                            fill="#F3F4FD"
                            className="dark:fill-[#0B081A] transition-colors"
                        />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                    
                    {/* Divider Label matching Reference */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2 sm:mb-2.5">
                        <div className="w-14 sm:w-24 h-[1px] bg-purple-300/80 dark:bg-purple-800/80" />
                        <span className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#6D28D9] dark:text-purple-300">
                            TRUSTED BY LEADING UNIVERSITIES & PARTNERS
                        </span>
                        <div className="w-14 sm:w-24 h-[1px] bg-purple-300/80 dark:bg-purple-800/80" />
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
