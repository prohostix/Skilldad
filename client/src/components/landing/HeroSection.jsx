import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    GraduationCap,
    Landmark,
    Briefcase,
    BookOpen,
    Award,
    Building2,
    BarChart3,
    Megaphone
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

    // 5 Renowned Partner Universities matching Reference Design
    const referencePartners = [
        {
            name: "THE UNIVERSITY OF MELBOURNE",
            crest: (
                <svg className="w-7 h-7 shrink-0 text-[#1E293B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L4 5V11C4 16.5 7.5 21.5 12 22C16.5 21.5 20 16.5 20 11V5L12 2Z" />
                    <path d="M12 6V18M8 10L12 6L16 10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            name: "UNIVERSITY OF LONDON",
            crest: (
                <svg className="w-7 h-7 shrink-0 text-[#1E293B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <line x1="12" y1="4" x2="12" y2="20" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <circle cx="7.5" cy="8" r="1.5" fill="currentColor" />
                    <circle cx="16.5" cy="8" r="1.5" fill="currentColor" />
                </svg>
            )
        },
        {
            name: "UNIVERSITY OF SOUTHAMPTON",
            crest: (
                <svg className="w-7 h-7 shrink-0 text-[#1E293B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 3L3 7L12 11L21 7L12 3Z" />
                    <path d="M5 10V16C5 18.5 8.1 21 12 21C15.9 21 19 18.5 19 16V10" />
                </svg>
            )
        },
        {
            name: "BIRMINGHAM CITY UNIVERSITY",
            crest: (
                <svg className="w-7 h-7 shrink-0 text-[#1E293B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 3V5M12 19V21M3 12H5M19 12H21" strokeLinecap="round" />
                </svg>
            )
        },
        {
            name: "UTS UNIVERSITY OF SYDNEY",
            crest: (
                <svg className="w-7 h-7 shrink-0 text-[#1E293B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 6H20M4 12H20M4 18H20" strokeLinecap="round" />
                    <path d="M8 3V21M16 3V21" strokeLinecap="round" />
                </svg>
            )
        }
    ];

    // Dynamic partner fetch fallback
    const [dynamicPartners, setDynamicPartners] = useState([]);
    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await fetch('/api/public/partner-logos');
                const data = await response.json();
                if (data && data.length > 0) {
                    const valid = data.filter(l => l.logo || l.imageUrl);
                    if (valid.length > 0) setDynamicPartners(valid);
                }
            } catch (e) {
                // Keep default reference partners
            }
        };
        fetchPartners();
    }, []);

    // 5 Interactive Constellation Nodes around SkillDad Logo
    const constellationNodes = [
        {
            id: 'students',
            label: 'Students',
            icon: GraduationCap,
            image: studentImg,
            posClass: 'left-[6%] top-[8%]',
            svgTarget: { x: 20, y: 22 }
        },
        {
            id: 'universities',
            label: 'Universities',
            icon: Landmark,
            image: universityImg,
            posClass: 'right-[8%] top-[5%]',
            svgTarget: { x: 80, y: 18 }
        },
        {
            id: 'jobs',
            label: 'Jobs',
            icon: Briefcase,
            image: jobsImg,
            posClass: 'right-[0%] top-[45%]',
            svgTarget: { x: 86, y: 52 }
        },
        {
            id: 'courses',
            label: 'Courses',
            icon: BookOpen,
            image: coursesImg,
            posClass: 'left-[30%] bottom-[2%]',
            svgTarget: { x: 48, y: 84 }
        },
        {
            id: 'certifications',
            label: 'Certifications',
            icon: Award,
            image: certsImg,
            posClass: 'left-[0%] bottom-[24%]',
            svgTarget: { x: 18, y: 62 }
        }
    ];

    return (
        <section className="relative w-full min-h-[calc(100vh-68px)] lg:h-[calc(100vh-68px)] lg:min-h-[580px] lg:max-h-[820px] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#FBF9FE] via-[#F8F5FD] to-[#F3EDFB] dark:from-[#080512] dark:via-[#0D071E] dark:to-[#120A28] pt-2 sm:pt-4">
            
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-1/4 -left-20 w-[420px] h-[420px] bg-purple-300/25 dark:bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[380px] h-[380px] bg-indigo-200/25 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Main Hero Container */}
            <div className="flex-1 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20 py-2 sm:py-4">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">

                    {/* ── LEFT COLUMN: CONSTELLATION NETWORK DIAGRAM (4.5 cols) ── */}
                    <div className="lg:col-span-5 flex items-center justify-center relative select-none">
                        <div className="w-[310px] xs:w-[350px] sm:w-[400px] md:w-[430px] lg:w-[440px] xl:w-[470px] aspect-square relative flex items-center justify-center shrink-0">
                            
                            {/* SVG Connection Lines & Orbit Rings */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="purpleLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
                                    </linearGradient>
                                </defs>

                                {/* Concentric Decorative Halo Rings */}
                                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(216, 180, 254, 0.35)" strokeWidth="0.8" strokeDasharray="3 3" />
                                <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(192, 132, 252, 0.4)" strokeWidth="0.8" />
                                <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1" strokeDasharray="2 2" />

                                {/* Radiating Curved Lines to Nodes */}
                                <path d="M 50 50 Q 35 34 20 22" fill="none" stroke="url(#purpleLineGrad)" strokeWidth="1.2" />
                                <path d="M 50 50 Q 66 32 80 18" fill="none" stroke="url(#purpleLineGrad)" strokeWidth="1.2" />
                                <path d="M 50 50 Q 68 51 86 52" fill="none" stroke="url(#purpleLineGrad)" strokeWidth="1.2" />
                                <path d="M 50 50 Q 49 68 48 84" fill="none" stroke="url(#purpleLineGrad)" strokeWidth="1.2" />
                                <path d="M 50 50 Q 32 57 18 62" fill="none" stroke="url(#purpleLineGrad)" strokeWidth="1.2" />

                                {/* Subtle Traveling Glowing Dots */}
                                <circle cx="34" cy="35" r="1.3" fill="#A855F7" className="animate-pulse" />
                                <circle cx="66" cy="33" r="1.3" fill="#A855F7" className="animate-pulse" />
                                <circle cx="70" cy="51" r="1.3" fill="#A855F7" className="animate-pulse" />
                                <circle cx="49" cy="69" r="1.3" fill="#A855F7" className="animate-pulse" />
                                <circle cx="33" cy="56" r="1.3" fill="#A855F7" className="animate-pulse" />
                            </svg>

                            {/* Center Hub: SkillDad Logo Circular Card */}
                            <motion.div
                                animate={{ scale: [1, 1.03, 1] }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full bg-white dark:bg-[#130B24] shadow-[0_12px_36px_rgba(109,40,217,0.22)] border-2 border-purple-100 dark:border-purple-800/60 flex items-center justify-center p-3.5 relative z-20"
                            >
                                <div className="absolute inset-0 bg-purple-400/15 rounded-full blur-md pointer-events-none" />
                                <img
                                    src={skilldadLogoDeepPurple}
                                    alt="SkillDad"
                                    className="w-full h-full object-contain relative z-10 drop-shadow-sm"
                                />
                            </motion.div>

                            {/* 5 Surrounding Photo Nodes with White Badges */}
                            {constellationNodes.map((node) => {
                                const IconComponent = node.icon;
                                return (
                                    <motion.div
                                        key={node.id}
                                        whileHover={{ scale: 1.08, zIndex: 30 }}
                                        transition={{ duration: 0.25, ease: 'easeOut' }}
                                        className={`absolute ${node.posClass} flex flex-col items-center group cursor-pointer z-10`}
                                    >
                                        <div className="w-13 h-13 xs:w-15 xs:h-15 sm:w-17 sm:h-17 md:w-[70px] md:h-[70px] rounded-full border-[3px] border-white dark:border-purple-950 shadow-[0_8px_22px_rgba(109,40,217,0.22)] overflow-hidden bg-white dark:bg-purple-950 shrink-0">
                                            <img
                                                src={node.image}
                                                alt={node.label}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-[0_4px_14px_rgba(76,29,149,0.12)] border border-purple-100/90 dark:border-purple-800/50 flex items-center gap-1.5 -mt-3.5 sm:-mt-3 relative z-10 whitespace-nowrap">
                                            <IconComponent size={12} className="text-[#6D28D9] dark:text-purple-400 shrink-0" />
                                            <span className="text-[10px] sm:text-[11.5px] font-bold text-slate-800 dark:text-purple-100 tracking-tight">
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
                            <span className="text-[#6D28D9] dark:text-[#A855F7] block">
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

                    {/* ── RIGHT COLUMN: FLOATING COURSE BADGES & SILK WAVE RIBBON (2.7 cols) ── */}
                    <div className="lg:col-span-2 hidden lg:flex flex-col items-end justify-center relative h-[360px] select-none">
                        
                        {/* Curved dashed orbit track */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 160 360">
                            <path
                                d="M 120 30 C 50 120, 140 220, 60 330"
                                fill="none"
                                stroke="rgba(192, 132, 252, 0.45)"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                            />
                            {/* Floating decorative purple orb on orbit */}
                            <circle cx="95" cy="180" r="3.5" fill="#A855F7" className="animate-pulse" />
                            <circle cx="120" cy="30" r="2.5" fill="#8B5CF6" />
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
            <div className="absolute -bottom-6 -right-10 w-[300px] sm:w-[420px] md:w-[500px] lg:w-[560px] pointer-events-none select-none z-10 opacity-95">
                <img
                    src={heroRibbon}
                    alt="Decorative Silk Ribbon"
                    className="w-full h-auto object-contain drop-shadow-[0_12px_28px_rgba(109,40,217,0.22)]"
                />
            </div>

            {/* ── BOTTOM ROW: TRUSTED BY LEADING UNIVERSITIES & PARTNERS ── */}
            <div className="w-full relative z-20 py-2 sm:py-3 border-t border-purple-100/70 dark:border-purple-900/30 bg-white/40 dark:bg-purple-950/20 backdrop-blur-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Divider Label */}
                    <div className="flex items-center justify-center gap-3 mb-2 sm:mb-2.5">
                        <div className="w-8 sm:w-12 h-[1px] bg-purple-200 dark:bg-purple-800" />
                        <span className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#6D28D9] dark:text-purple-300">
                            TRUSTED BY LEADING UNIVERSITIES & PARTNERS
                        </span>
                        <div className="w-8 sm:w-12 h-[1px] bg-purple-200 dark:bg-purple-800" />
                    </div>

                    {/* Universities Row */}
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 opacity-85 hover:opacity-100 transition-opacity">
                        {referencePartners.map((uni, idx) => (
                            <div key={idx} className="flex items-center gap-2 group cursor-default">
                                {uni.crest}
                                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#1E293B] dark:text-slate-200 font-sans">
                                    {uni.name}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

        </section>
    );
};

export default HeroSection;
