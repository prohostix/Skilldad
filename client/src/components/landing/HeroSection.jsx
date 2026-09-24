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
                <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-[#1E293B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L4 5V11C4 16.5 7.5 21.5 12 22C16.5 21.5 20 16.5 20 11V5L12 2Z" />
                    <path d="M12 6V18M8 10L12 6L16 10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            name: "UNIVERSITY OF LONDON",
            crest: (
                <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-[#1E293B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-[#1E293B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 3L3 7L12 11L21 7L12 3Z" />
                    <path d="M5 10V16C5 18.5 8.1 21 12 21C15.9 21 19 18.5 19 16V10" />
                </svg>
            )
        },
        {
            name: "BIRMINGHAM CITY UNIVERSITY",
            crest: (
                <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-[#1E293B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 3V5M12 19V21M3 12H5M19 12H21" strokeLinecap="round" />
                </svg>
            )
        },
        {
            name: "UTS UNIVERSITY OF SYDNEY",
            crest: (
                <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-[#1E293B] dark:text-purple-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 6H20M4 12H20M4 18H20" strokeLinecap="round" />
                    <path d="M8 3V21M16 3V21" strokeLinecap="round" />
                </svg>
            )
        }
    ];

    // 5 Interactive Constellation Nodes around SkillDad Logo matching Reference
    const constellationNodes = [
        {
            id: 'students',
            label: 'Students',
            icon: GraduationCap,
            image: studentImg,
            posClass: 'left-[10%] top-[4%]',
            floatAnim: { y: [-6, 6, -6], x: [-2, 2, -2] },
            floatDuration: 4.6,
            floatDelay: 0
        },
        {
            id: 'universities',
            label: 'Universities',
            icon: Landmark,
            image: universityImg,
            posClass: 'right-[12%] top-[4%]',
            floatAnim: { y: [6, -6, 6], x: [2, -2, 2] },
            floatDuration: 5.2,
            floatDelay: 0.4
        },
        {
            id: 'jobs',
            label: 'Jobs',
            icon: Briefcase,
            image: jobsImg,
            posClass: 'right-[0%] top-[42%]',
            floatAnim: { y: [-5, 6, -5], x: [2, -2, 2] },
            floatDuration: 4.2,
            floatDelay: 0.8
        },
        {
            id: 'courses',
            label: 'Courses',
            icon: BookOpen,
            image: coursesImg,
            posClass: 'left-[36%] bottom-[0%]',
            floatAnim: { y: [6, -5, 6], x: [-2, 2, -2] },
            floatDuration: 4.8,
            floatDelay: 1.2
        },
        {
            id: 'certifications',
            label: 'Certifications',
            icon: Award,
            image: certsImg,
            posClass: 'left-[2%] top-[44%]',
            floatAnim: { y: [-6, 5, -6], x: [-2, 2, -2] },
            floatDuration: 4.4,
            floatDelay: 1.6
        }
    ];

    return (
        <section className="relative w-full min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:min-h-[560px] lg:max-h-[780px] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#FAF8FE] via-[#F8F5FD] to-[#F3EDFC] dark:from-[#090514] dark:via-[#0F0822] dark:to-[#140B2D] pt-1 sm:pt-3">
            
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-1/4 -left-20 w-[420px] h-[420px] bg-purple-300/25 dark:bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[380px] h-[380px] bg-indigo-200/25 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Main Hero Container */}
            <div className="flex-1 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20 py-1 sm:py-2">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-3 items-center">

                    {/* ── LEFT COLUMN: CONSTELLATION NETWORK DIAGRAM (5 cols) ── */}
                    <div className="lg:col-span-5 flex items-center justify-center relative select-none">
                        <div className="w-[310px] xs:w-[350px] sm:w-[390px] md:w-[420px] lg:w-[430px] xl:w-[450px] aspect-square relative flex items-center justify-center shrink-0">
                            
                            {/* Animated SVG Connection Mesh & Rotating Orbit Rings */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="purpleMeshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.85" />
                                        <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.65" />
                                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.85" />
                                    </linearGradient>
                                    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="0.8" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>

                                {/* Rotating Concentric Halo Rings */}
                                <motion.g
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
                                    style={{ transformOrigin: '50px 50px' }}
                                >
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(216, 180, 254, 0.4)" strokeWidth="0.8" strokeDasharray="3 4" />
                                    <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(192, 132, 252, 0.35)" strokeWidth="0.7" strokeDasharray="4 3" />
                                    <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="0.9" strokeDasharray="2 3" />
                                </motion.g>

                                {/* Inter-node Outer Perimeter Network Mesh */}
                                <path d="M 23 21 Q 50 10 77 21" fill="none" stroke="url(#purpleMeshGrad)" strokeWidth="1.1" strokeDasharray="3 3" opacity="0.75" />
                                <path d="M 77 21 Q 90 34 85 52" fill="none" stroke="url(#purpleMeshGrad)" strokeWidth="1.1" strokeDasharray="3 3" opacity="0.75" />
                                <path d="M 85 52 Q 76 74 48 83" fill="none" stroke="url(#purpleMeshGrad)" strokeWidth="1.1" strokeDasharray="3 3" opacity="0.75" />
                                <path d="M 48 83 Q 24 74 16 52" fill="none" stroke="url(#purpleMeshGrad)" strokeWidth="1.1" strokeDasharray="3 3" opacity="0.75" />
                                <path d="M 16 52 Q 10 33 23 21" fill="none" stroke="url(#purpleMeshGrad)" strokeWidth="1.1" strokeDasharray="3 3" opacity="0.75" />

                                {/* Radiating Radial Spokes from Center Hub to Nodes */}
                                <path d="M 50 50 L 23 21" fill="none" stroke="url(#purpleMeshGrad)" strokeWidth="1.3" filter="url(#softGlow)" />
                                <path d="M 50 50 L 77 21" fill="none" stroke="url(#purpleMeshGrad)" strokeWidth="1.3" filter="url(#softGlow)" />
                                <path d="M 50 50 L 85 52" fill="none" stroke="url(#purpleMeshGrad)" strokeWidth="1.3" filter="url(#softGlow)" />
                                <path d="M 50 50 L 48 83" fill="none" stroke="url(#purpleMeshGrad)" strokeWidth="1.3" filter="url(#softGlow)" />
                                <path d="M 50 50 L 16 52" fill="none" stroke="url(#purpleMeshGrad)" strokeWidth="1.3" filter="url(#softGlow)" />

                                {/* Glowing Animated Constellation Dots */}
                                <circle cx="36" cy="35" r="1.6" fill="#A855F7" className="animate-ping" style={{ animationDuration: '3s' }} />
                                <circle cx="36" cy="35" r="1.4" fill="#9333EA" />
                                <circle cx="64" cy="35" r="1.6" fill="#A855F7" className="animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.8s' }} />
                                <circle cx="64" cy="35" r="1.4" fill="#9333EA" />
                                <circle cx="68" cy="51" r="1.6" fill="#A855F7" className="animate-ping" style={{ animationDuration: '4s', animationDelay: '1.2s' }} />
                                <circle cx="68" cy="51" r="1.4" fill="#9333EA" />
                                <circle cx="49" cy="67" r="1.6" fill="#A855F7" className="animate-ping" style={{ animationDuration: '3.2s', animationDelay: '0.5s' }} />
                                <circle cx="49" cy="67" r="1.4" fill="#9333EA" />
                                <circle cx="33" cy="51" r="1.6" fill="#A855F7" className="animate-ping" style={{ animationDuration: '3.8s', animationDelay: '1.5s' }} />
                                <circle cx="33" cy="51" r="1.4" fill="#9333EA" />

                                {/* Perimeter Junction Dots */}
                                <circle cx="50" cy="14" r="1.2" fill="#C084FC" />
                                <circle cx="85" cy="35" r="1.2" fill="#C084FC" />
                                <circle cx="68" cy="71" r="1.2" fill="#C084FC" />
                                <circle cx="28" cy="71" r="1.2" fill="#C084FC" />
                                <circle cx="14" cy="35" r="1.2" fill="#C084FC" />
                            </svg>

                            {/* Floating 3D Gradient Ambient Spheres matching Reference */}
                            <motion.div
                                animate={{ y: [-6, 7, -6], x: [-3, 3, -3] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -left-2 top-[30%] w-5 h-5 rounded-full bg-gradient-to-br from-[#DDD6FE] via-[#A855F7] to-[#6D28D9] shadow-[0_4px_12px_rgba(109,40,217,0.3)] pointer-events-none"
                            />
                            <motion.div
                                animate={{ y: [6, -7, 6], x: [3, -3, 3] }}
                                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                className="absolute left-[24%] bottom-[16%] w-4 h-4 rounded-full bg-gradient-to-br from-[#EDE9FE] via-[#8B5CF6] to-[#5B21B6] shadow-[0_3px_10px_rgba(109,40,217,0.25)] pointer-events-none"
                            />
                            <motion.div
                                animate={{ y: [-5, 6, -5] }}
                                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                                className="absolute right-[22%] top-[34%] w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#EDE9FE] via-[#A855F7] to-[#7C3AED] shadow-[0_2px_8px_rgba(124,58,237,0.2)] pointer-events-none"
                            />

                            {/* Center Hub: SkillDad Logo with Radiant Breathing Aura */}
                            <motion.div
                                animate={{ scale: [1, 1.04, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-22 h-22 sm:w-26 sm:h-26 md:w-28 md:h-28 rounded-full bg-white dark:bg-[#130B24] shadow-[0_12px_36px_rgba(109,40,217,0.22)] border-[3px] border-purple-100 dark:border-purple-800/60 ring-8 ring-purple-100/50 dark:ring-purple-900/30 flex items-center justify-center p-3.5 sm:p-4 relative z-20"
                            >
                                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md pointer-events-none animate-pulse" />
                                <img
                                    src={skilldadLogoDeepPurple}
                                    alt="SkillDad"
                                    className="w-full h-full object-contain relative z-10 drop-shadow-sm"
                                />
                            </motion.div>

                            {/* 5 Surrounding Animated Photo Nodes with White Badges */}
                            {constellationNodes.map((node) => {
                                const IconComponent = node.icon;
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
                                        whileHover={{ scale: 1.12, zIndex: 40 }}
                                        className={`absolute ${node.posClass} flex flex-col items-center group cursor-pointer z-10`}
                                    >
                                        <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-[74px] md:h-[74px] rounded-full border-[3px] border-white dark:border-purple-950 shadow-[0_8px_24px_rgba(109,40,217,0.22)] overflow-hidden bg-white dark:bg-purple-950 shrink-0 group-hover:shadow-[0_12px_28px_rgba(109,40,217,0.38)] transition-shadow duration-300">
                                            <img
                                                src={node.image}
                                                alt={node.label}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="bg-white/95 dark:bg-[#150D2B]/95 backdrop-blur-md px-3 py-1 rounded-full shadow-[0_4px_14px_rgba(76,29,149,0.14)] border border-purple-100/90 dark:border-purple-800/50 flex items-center gap-1.5 -mt-3.5 relative z-10 whitespace-nowrap group-hover:border-purple-300 transition-colors">
                                            <IconComponent size={12} className="text-[#6D28D9] dark:text-purple-400 shrink-0" />
                                            <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-800 dark:text-purple-100 tracking-tight">
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
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[52px] font-black tracking-tight leading-[1.08] font-sans">
                            <span className="text-[#0F172A] dark:text-white block">
                                Confusion to
                            </span>
                            <span className="text-[#6D28D9] dark:text-[#A855F7] block">
                                Career
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xs sm:text-sm md:text-[14px] text-slate-600 dark:text-purple-200/80 leading-relaxed font-normal max-w-lg mt-2.5 sm:mt-3 mb-4 sm:mb-5">
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
                    <div className="lg:col-span-2 hidden lg:flex flex-col items-end justify-center relative h-[340px] select-none">
                        
                        {/* Curved dashed orbit track */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 160 340">
                            <path
                                d="M 120 25 C 50 110, 140 210, 60 320"
                                fill="none"
                                stroke="rgba(192, 132, 252, 0.45)"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                            />
                            {/* Floating decorative purple orb on orbit */}
                            <circle cx="95" cy="170" r="3.5" fill="#A855F7" className="animate-pulse" />
                            <circle cx="120" cy="25" r="2.5" fill="#8B5CF6" />
                            <circle cx="60" cy="320" r="2.5" fill="#C4B5FD" />
                        </svg>

                        {/* 3 Floating Badges matching Reference */}
                        <div className="space-y-7 relative z-20 flex flex-col items-end pr-2">
                            
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
            <div className="absolute bottom-0 right-0 w-[280px] sm:w-[360px] md:w-[440px] lg:w-[480px] pointer-events-none select-none z-0 translate-y-4 opacity-90">
                <img
                    src={heroRibbon}
                    alt="Decorative Silk Ribbon"
                    className="w-full h-auto object-contain drop-shadow-[0_12px_28px_rgba(109,40,217,0.22)]"
                />
            </div>

            {/* ── BOTTOM ROW: TRUSTED BY LEADING UNIVERSITIES & PARTNERS ── */}
            <div className="w-full relative z-20 py-2 sm:py-2.5 border-t border-purple-100/70 dark:border-purple-900/30 bg-white/40 dark:bg-purple-950/20 backdrop-blur-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Divider Label */}
                    <div className="flex items-center justify-center gap-3 mb-1.5 sm:mb-2">
                        <div className="w-8 sm:w-12 h-[1px] bg-purple-200 dark:bg-purple-800" />
                        <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#6D28D9] dark:text-purple-300">
                            TRUSTED BY LEADING UNIVERSITIES & PARTNERS
                        </span>
                        <div className="w-8 sm:w-12 h-[1px] bg-purple-200 dark:bg-purple-800" />
                    </div>

                    {/* Universities Row */}
                    <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 md:gap-10 lg:gap-14 opacity-85 hover:opacity-100 transition-opacity">
                        {referencePartners.map((uni, idx) => (
                            <div key={idx} className="flex items-center gap-2 group cursor-default">
                                {uni.crest}
                                <span className="text-[9.5px] sm:text-[10.5px] font-extrabold uppercase tracking-wider text-[#1E293B] dark:text-slate-200 font-sans">
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
