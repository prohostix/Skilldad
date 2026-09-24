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
import skilldadLogoDeepPurple from '../../assets/logo_deep_purple.png';

// Prestigious Monochrome Deep-Purple University Partner Logos matching Reference
import melbourneLogo from '../../assets/hero/partners/melbourne.png';
import londonLogo from '../../assets/hero/partners/london.png';
import southamptonLogo from '../../assets/hero/partners/southampton.png';
import birminghamLogo from '../../assets/hero/partners/birmingham.png';
import utsLogo from '../../assets/hero/partners/uts.png';

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

    // 5 Prestigious University Partners in Monochrome Deep Purple matching Reference
    const defaultUniversityPartners = [
        { name: "The University of Melbourne", logo: melbourneLogo, alt: "The University of Melbourne" },
        { name: "University of London", logo: londonLogo, alt: "University of London" },
        { name: "University of Southampton", logo: southamptonLogo, alt: "University of Southampton" },
        { name: "Birmingham City University", logo: birminghamLogo, alt: "Birmingham City University" },
        { name: "UTS University of Sydney", logo: utsLogo, alt: "UTS University of Sydney" }
    ];

    const [universityPartners, setUniversityPartners] = useState(defaultUniversityPartners);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await fetch('/api/public/partner-logos');
                const data = await res.json();
                if (data && data.length > 0) {
                    const unis = data.filter(item => item.type === 'university' && item.isActive !== false);
                    if (unis.length >= 4) {
                        setUniversityPartners(unis.map(u => ({
                            name: u.name,
                            logo: u.imageUrl || u.logo ? (u.imageUrl?.startsWith('http') ? u.imageUrl : getMediaUrl(u.imageUrl || u.logo)) : null,
                            alt: u.name
                        })));
                    }
                }
            } catch (e) {
                // Keep default prestigious reference universities
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
            posClass: '-left-[3.5%] sm:-left-[4.5%] md:-left-[5%] top-[41%]',
            floatAnim: { y: [-4, 4, -4], x: [-1, 1, -1] },
            floatDuration: 4.4,
            floatDelay: 1.6
        }
    ];

    return (
        <section className="relative w-full min-h-[600px] lg:h-[calc(100vh-64px)] lg:min-h-[630px] lg:max-h-[780px] xl:max-h-[810px] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#FAF8FE] via-[#FFFFFF] to-[#FFFFFF] dark:from-[#090514] dark:via-[#0F0822] dark:to-[#140B2D] pt-2 sm:pt-2.5 pb-0">
            
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-1/4 -left-20 w-[440px] h-[440px] bg-purple-300/25 dark:bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-200/25 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Main Hero Container */}
            <div className="flex-1 flex items-center justify-start lg:justify-between max-w-7xl mx-auto px-5 sm:px-8 lg:px-8 w-full relative z-20 py-4 sm:py-6 lg:py-2">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">

                    {/* ── LEFT COLUMN: CONSTELLATION NETWORK DIAGRAM (Hidden on mobile responsive, visible on desktop) ── */}
                    <div className="hidden lg:flex lg:col-span-5 items-center justify-center relative select-none">
                        <div className="w-[290px] sm:w-[355px] md:w-[380px] lg:w-[395px] xl:w-[410px] aspect-square relative flex items-center justify-center shrink-0">
                            {/* Very Thin, Standard Purple Connection Arc Lines & Moving Purple Dots */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 100">
                                {/* Delicate Central Orbit Track */}
                                <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(147, 51, 234, 0.4)" strokeWidth="0.22" strokeDasharray="1.0 1.2" shapeRendering="geometricPrecision" />

                                {/* 1. SkillDad <-> Students Flower Petal Arcs (Identical Geometry with Dotted Lines) */}
                                <path
                                    d="M 41.5 41.5 Q 41.3 29.3 29.1 29.1"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />
                                <path
                                    d="M 29.1 29.1 Q 29.3 41.3 41.5 41.5"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* 2. SkillDad <-> Universities Flower Petal Arcs (Identical Geometry with Dotted Lines) */}
                                <path
                                    d="M 58.5 41.5 Q 70.7 41.3 70.9 29.1"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />
                                <path
                                    d="M 70.9 29.1 Q 58.7 29.3 58.5 41.5"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* 3. SkillDad <-> Jobs Flower Petal Arcs (Identical Geometry with Dotted Lines) */}
                                <path
                                    d="M 62.0 50.0 Q 70.8 58.5 79.5 50.0"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />
                                <path
                                    d="M 79.5 50.0 Q 70.8 41.5 62.0 50.0"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* 4. SkillDad <-> Certifications Flower Petal Arcs (Identical Geometry with Dotted Lines) */}
                                <path
                                    d="M 38.0 50.0 Q 30.5 42.0 23.0 50.0"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />
                                <path
                                    d="M 23.0 50.0 Q 30.5 58.0 38.0 50.0"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* 5. SkillDad <-> Courses Flower Petal Arcs (Identical Geometry with Dotted Lines) */}
                                <path
                                    d="M 50.0 62.0 Q 41.5 70.8 50.0 79.5"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />
                                <path
                                    d="M 50.0 79.5 Q 58.5 70.8 50.0 62.0"
                                    fill="none"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.22"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* Outer Perimeter Arcs connecting adjacent nodes */}
                                <path d="M 29.1 29.1 Q 50 14 70.9 29.1" fill="none" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.2 1.5" shapeRendering="geometricPrecision" />
                                <path d="M 70.9 29.1 Q 88 36 79.5 50.0" fill="none" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.2 1.5" shapeRendering="geometricPrecision" />
                                <path d="M 50.0 79.5 Q 74 74 79.5 50.0" fill="none" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.2 1.5" shapeRendering="geometricPrecision" />
                                <path d="M 50.0 79.5 Q 31 73 23.0 50.0" fill="none" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.2 1.5" shapeRendering="geometricPrecision" />
                                <path d="M 23.0 50.0 Q 15 36 29.1 29.1" fill="none" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.2 1.5" shapeRendering="geometricPrecision" />

                                {/* Small Circle Bubbles / Dots along connection lines (Matching right-side style, kept small) */}
                                <circle cx="35.3" cy="35.3" r="0.55" fill="#8B5CF6" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.1" />
                                <circle cx="32.0" cy="32.0" r="0.45" fill="#A855F7" />

                                <circle cx="64.7" cy="35.3" r="0.55" fill="#8B5CF6" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.1" />
                                <circle cx="68.0" cy="32.0" r="0.45" fill="#A855F7" />

                                <circle cx="70.8" cy="50.0" r="0.55" fill="#8B5CF6" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.1" />
                                <circle cx="75.2" cy="50.0" r="0.45" fill="#A855F7" />

                                <circle cx="31.8" cy="50.0" r="0.55" fill="#8B5CF6" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.1" />
                                <circle cx="27.5" cy="50.0" r="0.45" fill="#A855F7" />

                                <circle cx="50.0" cy="70.8" r="0.55" fill="#8B5CF6" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.1" />
                                <circle cx="50.0" cy="75.2" r="0.45" fill="#A855F7" />

                                {/* Perimeter subtle dots */}
                                <circle cx="50.0" cy="20.0" r="0.45" fill="#A855F7" />
                                <circle cx="80.0" cy="40.5" r="0.45" fill="#A855F7" />
                                <circle cx="65.5" cy="73.5" r="0.45" fill="#A855F7" />
                                <circle cx="34.5" cy="73.5" r="0.45" fill="#A855F7" />
                                <circle cx="23.0" cy="40.5" r="0.45" fill="#A855F7" />

                                {/* Very Small Purple Dots Moving Through Flower Petal Lines */}
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 41.5 41.5 Q 41.3 29.3 29.1 29.1" dur="3.4s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 29.1 29.1 Q 29.3 41.3 41.5 41.5" dur="3.6s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 58.5 41.5 Q 70.7 41.3 70.9 29.1" dur="3.5s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 70.9 29.1 Q 58.7 29.3 58.5 41.5" dur="3.7s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 62.0 50.0 Q 70.8 58.5 79.5 50.0" dur="3.3s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 79.5 50.0 Q 70.8 41.5 62.0 50.0" dur="3.6s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 38.0 50.0 Q 30.5 42.0 23.0 50.0" dur="3.8s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 23.0 50.0 Q 30.5 58.0 38.0 50.0" dur="3.7s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 50.0 62.0 Q 41.5 70.8 50.0 79.5" dur="3.5s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.45" fill="#7C3AED">
                                    <animateMotion path="M 50.0 79.5 Q 58.5 70.8 50.0 62.0" dur="3.7s" repeatCount="indefinite" />
                                </circle>

                                {/* Moving Very Small Purple Dots around Outer Perimeter - Courses to Job explicit direction */}
                                <circle r="0.4" fill="#9333EA">
                                    <animateMotion path="M 29.1 29.1 Q 50 14 70.9 29.1" dur="5.5s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.4" fill="#9333EA">
                                    <animateMotion path="M 70.9 29.1 Q 88 36 79.5 50.0" dur="4.8s" repeatCount="indefinite" />
                                </circle>
                                {/* Moving Small Ball From Courses to Job */}
                                <circle r="0.4" fill="#9333EA">
                                    <animateMotion path="M 50.0 79.5 Q 74 74 79.5 50.0" dur="4.6s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.4" fill="#9333EA">
                                    <animateMotion path="M 50.0 79.5 Q 26 74 23.0 50.0" dur="5s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.4" fill="#9333EA">
                                    <animateMotion path="M 23.0 50.0 Q 14 36 29.1 29.1" dur="5.4s" repeatCount="indefinite" />
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
                                        <div className="w-17 h-17 sm:w-21 sm:h-21 md:w-[86px] md:h-[86px] rounded-full border-[3.5px] border-white dark:border-purple-950 shadow-[0_8px_24px_rgba(109,40,217,0.22)] overflow-hidden bg-white dark:bg-purple-950 shrink-0 group-hover:shadow-[0_12px_28px_rgba(109,40,217,0.35)] transition-shadow duration-300">
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

                    {/* ── CENTER-LEFT COLUMN: EDITORIAL HEADING & ACTIONS (Placed center-left on mobile) ── */}
                    <div className="w-full lg:col-span-7 flex flex-col items-start text-left pl-1 sm:pl-2 lg:pl-2 xl:pl-4 z-20 my-auto py-8 sm:py-12 lg:py-0 max-w-xl lg:max-w-none">
                        
                        {/* Eyebrow matching Reference */}
                        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                            <span className="w-5 h-[2px] bg-[#6D28D9] rounded-full inline-block" />
                            <span className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-[0.2em] text-[#6D28D9] dark:text-purple-400">
                                YOUR GATEWAY TO A BRIGHTER FUTURE
                            </span>
                        </div>

                        {/* Heading: "Confusion to Career" */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[40px] xl:text-[48px] font-black tracking-tight leading-[1.08] font-sans">
                            <span className="text-[#0F172A] dark:text-white block">
                                Confusion to
                            </span>
                            <span className="text-[#6644C1] dark:text-purple-400 block">
                                Career
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xs sm:text-sm md:text-[13.5px] text-slate-600 dark:text-purple-200/80 leading-relaxed font-normal max-w-lg mt-2 sm:mt-2.5 mb-3.5 sm:mb-4">
                            A collaborative venture initiated by IITians and leading job providers in India, in partnership with reputed universities across the world.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <button
                                onClick={() => navigate(user ? getDashboardLink() : '/register')}
                                className="px-5 sm:px-6 py-2.5 sm:py-2.5 rounded-full bg-gradient-to-r from-[#4C1D95] via-[#5B21B6] to-[#6D28D9] hover:from-[#3B1578] hover:to-[#5B21B6] text-white text-xs sm:text-sm font-semibold shadow-[0_10px_25px_-5px_rgba(109,40,217,0.45)] hover:shadow-[0_16px_32px_-5px_rgba(109,40,217,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
                            >
                                <span>{user ? 'Go to Dashboard' : 'Start Learning Today'}</span>
                                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            {!user && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-5 sm:px-6 py-2.5 sm:py-2.5 rounded-full bg-white/90 dark:bg-purple-950/60 hover:bg-purple-50/90 dark:hover:bg-purple-900/60 text-[#4C1D95] dark:text-purple-300 border border-purple-200/90 dark:border-purple-800/60 text-xs sm:text-sm font-semibold shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                >
                                    Login Now
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* ── RIGHT EDGE: CONSTELLATION NETWORK, 3D SPHERES & EXACT FLOWING SILK WAVES (Flush with page edge, no gap) ── */}
            <div className="absolute right-0 top-[10%] sm:top-[12%] lg:top-[14%] bottom-[50px] sm:bottom-[60px] lg:bottom-[70px] w-[320px] sm:w-[350px] md:w-[380px] lg:w-[410px] xl:w-[450px] hidden lg:flex flex-col items-end justify-center select-none z-10 pointer-events-auto pr-0 overflow-visible">
                
                {/* SVG Layer: Exact flowing silk ribbon waves + constellation network tracks + 3D spheres + moving glowing particles */}
                <svg
                    className="absolute -right-2 -bottom-6 w-[340px] sm:w-[380px] h-[520px] pointer-events-none overflow-visible z-0"
                    viewBox="0 0 353 595"
                    fill="none"
                >
                    <defs>
                        {/* Main Bold Silk Ribbon Gradient (Rich vibrant royal purple to violet) */}
                        <linearGradient id="mainSilkGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#9333EA" stopOpacity="0.92" />
                            <stop offset="28%" stopColor="#7C3AED" stopOpacity="0.98" />
                            <stop offset="65%" stopColor="#6D28D9" stopOpacity="0.98" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.88" />
                        </linearGradient>

                        {/* Mid-layer Translucent Violet Ribbon Gradient */}
                        <linearGradient id="midVioletGrad" x1="10%" y1="90%" x2="90%" y2="10%">
                            <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.25" />
                            <stop offset="30%" stopColor="#C4B5FD" stopOpacity="0.65" />
                            <stop offset="70%" stopColor="#A855F7" stopOpacity="0.75" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.45" />
                        </linearGradient>

                        {/* Upper Sheer Lavender Aura Wave */}
                        <linearGradient id="sheerAuraGrad" x1="100%" y1="10%" x2="20%" y2="90%">
                            <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.55" />
                            <stop offset="40%" stopColor="#DDD6FE" stopOpacity="0.45" />
                            <stop offset="75%" stopColor="#C4B5FD" stopOpacity="0.30" />
                            <stop offset="100%" stopColor="#9333EA" stopOpacity="0.08" />
                        </linearGradient>

                        {/* Filters */}
                        <filter id="silkBlur" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="9" />
                        </filter>
                        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" />
                        </filter>
                        <filter id="ribbonDropShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="-2" dy="6" stdDeviation="9" floodColor="#4C1D95" floodOpacity="0.26" />
                        </filter>
                    </defs>

                    {/* ── 1. UPPER SHEER CHIFFON AURA (Flowing down from top right) ── */}
                    <motion.path
                        animate={{ y: [0, -4, 0], x: [0, -2, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                        d="M 353 90
                           C 330 180, 305 270, 268 350
                           C 225 435, 160 485, 90 520
                           C 145 480, 230 430, 280 355
                           C 320 280, 342 185, 353 105 Z"
                        fill="url(#sheerAuraGrad)"
                        filter="url(#silkBlur)"
                    />

                    {/* ── 2. MID-LAYER TRANSLUCENT VIOLET RIBBON ── */}
                    <motion.path
                        animate={{ y: [0, -5, 0], x: [0, -3, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                        d="M 60 535
                           C 115 505, 185 455, 255 400
                           C 290 370, 325 340, 353 305
                           L 353 375
                           C 320 405, 280 438, 235 470
                           C 175 512, 120 535, 60 545 Z"
                        fill="url(#midVioletGrad)"
                        filter="url(#softGlow)"
                    />

                    {/* ── 3. MAIN BOLD PURPLE SILK RIBBON (Exact needle tip & swooping arc) ── */}
                    <motion.path
                        animate={{ y: [0, -6, 0], x: [0, -2, 0] }}
                        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                        d="M -2 546
                           C 40 552, 95 545, 160 515
                           C 225 485, 290 438, 353 372
                           L 353 438
                           C 290 488, 225 532, 155 555
                           C 85 578, 30 565, -2 546 Z"
                        fill="url(#mainSilkGrad)"
                        filter="url(#ribbonDropShadow)"
                    />

                    {/* Satin Crest Specular Line */}
                    <motion.path
                        animate={{ y: [0, -6, 0], x: [0, -2, 0] }}
                        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                        d="M -2 546
                           C 40 552, 95 545, 160 515
                           C 225 485, 290 438, 353 372"
                        stroke="rgba(255, 255, 255, 0.48)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        fill="none"
                    />
                </svg>

                {/* 3 Floating Badges matching Reference */}
                <div className="space-y-6 sm:space-y-7 relative z-20 flex flex-col items-end pr-2 pt-2">
                    {/* 1. Hospital Administration */}
                    <motion.div
                        animate={{ y: [-4, 4, -4] }}
                        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_8px_22px_rgba(124,58,237,0.10)] border border-purple-100/90 dark:border-purple-800/40 flex items-center gap-2.5 cursor-default hover:scale-105 transition-transform mr-1"
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
                        className="bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_8px_22px_rgba(124,58,237,0.10)] border border-purple-100/90 dark:border-purple-800/40 flex items-center gap-2.5 cursor-default hover:scale-105 transition-transform -mr-1"
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
                        className="bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_8px_22px_rgba(124,58,237,0.10)] border border-purple-100/90 dark:border-purple-800/40 flex items-center gap-2.5 cursor-default hover:scale-105 transition-transform mr-2"
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

            {/* ── BOTTOM ROW: PREMIUM "TRUSTED BY LEADING UNIVERSITIES & PARTNERS" STRIP ── */}
            <div className="w-full relative z-20 bg-gradient-to-b from-[#ECE4FA] via-[#E8DEFA] to-[#E4D8F8] dark:from-[#140A26] dark:via-[#160D2C] dark:to-[#1B1034] pt-2 sm:pt-3 pb-3 sm:pb-4 transition-colors">
                
                {/* Soft Lavender Curved Wave Background Transition from Hero (with subtle defining stroke) */}
                <div className="absolute -top-6 sm:-top-8 md:-top-9 lg:-top-10 left-0 w-full overflow-hidden leading-none pointer-events-none z-10">
                    <svg
                        className="relative block w-full h-6 sm:h-8 md:h-9 lg:h-10 overflow-visible"
                        viewBox="0 0 1440 60"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M 0 28 C 220 10 440 45 720 40 C 1000 35 1220 10 1440 26 L 1440 60 L 0 60 Z"
                            fill="#ECE4FA"
                            stroke="rgba(147, 51, 234, 0.22)"
                            strokeWidth="1"
                            className="dark:fill-[#140A26] dark:stroke-purple-800/40 transition-colors"
                        />
                    </svg>
                </div>

                {/* Subtle Fade / Slide-in Animation when entering viewport */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20"
                >
                    
                    {/* Centered Small Uppercase Label with Thin Purple Dividers */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 mb-2.5 sm:mb-3">
                        <div className="w-12 sm:w-20 md:w-28 h-[1px] bg-purple-400/80 dark:bg-purple-700/80" />
                        <span className="text-[9.5px] sm:text-[10.5px] md:text-[11px] font-bold uppercase tracking-[0.22em] text-[#5B21B6] dark:text-purple-300 select-none whitespace-nowrap">
                            TRUSTED BY LEADING UNIVERSITIES & PARTNERS
                        </span>
                        <div className="w-12 sm:w-20 md:w-28 h-[1px] bg-purple-400/80 dark:bg-purple-700/80" />
                    </div>

                    {/* 5-6 University / Partner Logos Evenly Spaced in One Horizontal Row (Monochrome Deep-Purple with Consistent Sizing & Generous Spacing) */}
                    <div className="flex items-center justify-start sm:justify-center gap-8 sm:gap-11 md:gap-14 lg:gap-18 xl:gap-22 overflow-x-auto no-scrollbar w-full py-1">
                        {universityPartners.map((uni, idx) => (
                            <div
                                key={idx}
                                className="group flex items-center justify-center cursor-default shrink-0 opacity-85 hover:opacity-100 transition-all duration-200 hover:scale-105"
                            >
                                <img
                                    src={uni.logo}
                                    alt={uni.alt || uni.name}
                                    className="h-5 sm:h-6 md:h-6.5 w-auto max-w-[120px] sm:max-w-[135px] md:max-w-[150px] object-contain select-none mix-blend-multiply dark:mix-blend-screen brightness-90 contrast-125 dark:brightness-150"
                                />
                            </div>
                        ))}
                    </div>

                </motion.div>
            </div>

        </section>
    );
};

export default HeroSection;
