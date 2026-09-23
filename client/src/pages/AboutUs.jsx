import React from 'react';
import axios from 'axios';
import { motion, useInView } from 'framer-motion';
import {
    Rocket, Globe, Award, Users, Book, Target, Linkedin, Loader2,
    Activity, CheckCircle2, Briefcase, GraduationCap, Zap, ShieldCheck,
    TrendingUp, Sparkles, ArrowRight, Laptop, Layers, Building2
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import GlassCard from '../components/ui/GlassCard';
import ModernButton from '../components/ui/ModernButton';
import { getMediaUrl } from '../utils/media';

// Helper to resolve CMS image paths or defaults
const resolveAboutImg = (imgUrl, defaultUrl) => {
    if (!imgUrl) return defaultUrl;
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:')) {
        return imgUrl;
    }
    if (imgUrl.startsWith('/assets/') || imgUrl.startsWith('assets/')) {
        return imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
    }
    return getMediaUrl(imgUrl);
};

// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
};

const floatAnimation = {
    y: ["-3%", "3%"],
    transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
    }
};

// ── HERO TOP SECTION ANIMATIONS ──
// Left side content: Rows slowly appear from top to bottom (staggered)
const heroLeftContainer = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.28,
            delayChildren: 0.05
        }
    }
};

const heroRowFromTop = {
    hidden: { opacity: 0, y: -32 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 1.1,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

// Right side logo/image: Slowly appears from bottom to top (revealing line-by-line upwards)
const heroRightImageReveal = {
    hidden: {
        opacity: 0,
        y: 80,
        clipPath: 'inset(100% 0% 0% 0%)'
    },
    visible: {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0% 0% 0%)',
        transition: {
            duration: 1.7,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.05
        }
    }
};

// ── OUR MISSION SECTION ANIMATIONS (SLOW PROGRESSIVE LEFT-TO-RIGHT CASCADE) ──
const missionCardContainerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

const missionCollageVariants = {
    hidden: { opacity: 0, x: -70 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 1.25,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.05
        }
    }
};

const missionBadgeVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 1.05,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.30
        }
    }
};

const missionHeadlineVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 1.05,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.46
        }
    }
};

const missionDescVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 1.05,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.62
        }
    }
};

// ── OUR VISION SECTION ANIMATIONS (SLOW PROGRESSIVE RIGHT-TO-LEFT CASCADE) ──
const visionCardContainerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

const visionCollageVariants = {
    hidden: { opacity: 0, x: 70 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 1.25,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.05
        }
    }
};

const visionBadgeVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 1.05,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.30
        }
    }
};

const visionHeadlineVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 1.05,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.46
        }
    }
};

const visionDescVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 1.05,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.62
        }
    }
};

// ── HOW SKILLDAD WORKS (CAREER ENGINE) ANIMATIONS: TOP-TO-BOTTOM HEADER, CENTER-TO-SURROUNDINGS CARDS ──
const careerEngineCardContainerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

const careerEngineBadgeVariants = {
    hidden: { opacity: 0, y: -28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.05
        }
    }
};

const careerEngineHeadlineVariants = {
    hidden: { opacity: 0, y: -28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.22
        }
    }
};

const careerEngineDescVariants = {
    hidden: { opacity: 0, y: -28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.38
        }
    }
};

// ── EXECUTIVE LEADERSHIP DIAGONAL LINE-BY-LINE REVEAL ANIMATIONS ──
// Both cards reveal along crisp diagonal lines sweeping slowly from corner to opposite corner.
// (Card 1: Top-Left to Bottom-Right, Card 2: Top-Right to Bottom-Left)
const executiveDiagonalRevealVariants = {
    hidden: {
        opacity: 0,
        clipPath: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)'
    },
    visible: (customDelay = 0.2) => ({
        opacity: 1,
        clipPath: 'polygon(0% 0%, 250% 0%, 0% 250%, 0% 0%)',
        transition: {
            duration: 2.8,
            ease: [0.16, 1, 0.3, 1],
            delay: customDelay,
            opacity: { duration: 0.2, delay: customDelay }
        },
        transitionEnd: {
            clipPath: 'none'
        }
    })
};

// ── INNOVATIVE STANDARD EXECUTIVE LEADERSHIP CARD (HUMBLE, SIMPLE & COMPACT) ──
const ExecutiveLeadershipCard = ({ member, direction, delay = 0.1 }) => {
    const cardRef = React.useRef(null);
    const isInView = useInView(cardRef, { once: true, amount: 0.05, margin: "60px 0px 60px 0px" });

    const memberName = member.name || member.title || 'Executive Leader';
    const memberRole = member.role || member.title || 'Leadership';
    const rawImg = member.imageUrl || member.image || member.logo;
    const resolvedImg = resolveAboutImg(rawImg, null);
    const linkedinUrl = member.linkedinUrl || member.linkedin_url;

    // Concise, humble bio
    const getExecutiveBio = () => {
        if (member.bio && member.bio.trim().length > 10) {
            const trimmed = member.bio.trim();
            if (trimmed.length > 110) {
                return trimmed.slice(0, 105).replace(/[,.]?\s+\S*$/, '') + '...';
            }
            return trimmed;
        }
        if (memberName.toLowerCase().includes('basil')) {
            return "Guiding SkillDad's strategic university alliances and enterprise placement ecosystem.";
        }
        if (memberName.toLowerCase().includes('dilshad')) {
            return "Directing SkillDad's core platform innovation, curriculum, and hiring partnerships.";
        }
        return "Guiding the strategic alignment of SkillDad's academic matrix and student placements.";
    };

    const isFlipped = direction === 'right-top-to-left-bottom';

    return (
        <div ref={cardRef} className="w-full h-full relative">
            <div className={`w-full h-full ${isFlipped ? '-scale-x-100' : ''}`}>
                <motion.div
                    custom={delay}
                    variants={executiveDiagonalRevealVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="w-full h-full"
                >
                    <div className={`w-full h-full ${isFlipped ? '-scale-x-100' : ''}`}>
                        <div className="bg-white dark:bg-[#0E091D] rounded-2xl border border-purple-100/80 dark:border-purple-900/30 p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group">
                            
                            {/* 1. Simple, Compact Framed Photo (NO crop & NO zoom) */}
                            <div className="relative w-full h-40 sm:h-44 md:h-48 rounded-xl overflow-hidden bg-slate-50/80 dark:bg-purple-950/20 border border-slate-100 dark:border-purple-900/20 flex items-end justify-center">
                        
                        {/* Leader Photo: object-contain object-bottom ensures NO CROPPING, NO ZOOM on hover */}
                        {resolvedImg ? (
                            <img
                                src={resolvedImg}
                                alt={memberName}
                                className="max-h-full max-w-full object-contain object-bottom relative z-10 transition-none select-none"
                                style={{ transform: 'none' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}

                        {/* Initial Fallback Avatar */}
                        <div className={`w-full h-full flex flex-col items-center justify-center bg-purple-50 dark:bg-purple-950/40 ${resolvedImg ? 'hidden' : 'flex'}`}>
                            <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/50 text-[#4C1D95] dark:text-purple-300 font-extrabold text-lg flex items-center justify-center shadow-xs">
                                {memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                        </div>

                        {/* Soft bottom gradient fade into card body */}
                        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-[#0E091D] dark:via-[#0E091D]/40 dark:to-transparent z-15 pointer-events-none" />
                    </div>

                    {/* 2. Simple, humble text details */}
                    <div className="pt-2.5 pb-0.5 text-center flex-1 flex flex-col justify-between">
                        <div>
                            {/* Member Name */}
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug font-sans">
                                {memberName}
                            </h3>

                            {/* Member Role / Title */}
                            <p className="text-[10px] sm:text-[10.5px] font-semibold text-[#4C1D95] dark:text-purple-300 mt-0.5 uppercase tracking-wider">
                                {memberRole}
                            </p>

                            {/* Institution / University Badge (e.g. IIT Bombay) */}
                            {member.university && (
                                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full bg-[#4C1D95]/10 border border-[#4C1D95]/20 text-[9.5px] font-bold text-[#4C1D95] dark:text-purple-300">
                                    <GraduationCap size={11} className="text-[#4C1D95] shrink-0" />
                                    <span>{member.university}</span>
                                </div>
                            )}

                            {/* Humble Short Bio */}
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1.5 max-w-xs mx-auto font-normal">
                                {getExecutiveBio()}
                            </p>
                        </div>

                        {/* Clean Minimalist LinkedIn Connect Link */}
                        {linkedinUrl && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-center">
                                <a
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-50 dark:bg-white/[0.04] hover:bg-[#0077B5] hover:text-white dark:hover:bg-[#0077B5] text-slate-600 dark:text-slate-300 text-[10px] font-medium border border-slate-200/80 dark:border-white/10 transition-all duration-200 group/link"
                                >
                                    <Linkedin size={11} fill="currentColor" stroke="none" className="text-[#0077B5] group-hover/link:text-white transition-colors" />
                                    <span>Connect on LinkedIn</span>
                                </a>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </motion.div>
    </div>
</div>
);
};

// ── REFERENCE-MATCHING 3-PHOTO COLLAGE COMPONENT ──
const CollageVisual = ({
    mainImg,
    mainAlt,
    topImg,
    topAlt,
    bottomImg,
    bottomAlt
}) => {
    return (
        <div className="relative w-full max-w-[340px] sm:max-w-[370px] lg:max-w-[395px] mx-auto select-none py-1.5 px-1">
            {/* Organic soft backdrop slab matching reference image */}
            <div
                className="absolute -left-3 sm:-left-4 top-4 sm:top-5 w-[106%] h-[80%] bg-[#DDD6FE]/60 dark:bg-purple-950/40 rounded-[32px] sm:rounded-[38px] -rotate-10 pointer-events-none transition-transform duration-700"
            />

            {/* 3 crisp radiating purple accent strokes at top-left of main card in deep purple */}
            <svg
                className="absolute -top-3.5 -left-3 sm:-top-4 sm:-left-3.5 w-10 sm:w-11 h-10 sm:h-11 text-[#4C1D95] dark:text-purple-300 z-40 pointer-events-none drop-shadow-xs"
                viewBox="0 0 34 34"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.4"
                strokeLinecap="round"
            >
                {/* Top ray pointing up-right */}
                <line x1="24" y1="16" x2="27" y2="5" />
                {/* Middle ray pointing up-left */}
                <line x1="17" y1="19" x2="8" y2="10" />
                {/* Bottom ray pointing left */}
                <line x1="15" y1="25" x2="4" y2="22" />
            </svg>

            {/* Layered photo cards composition with crisp white frames matching reference */}
            <div className="relative w-full h-[225px] sm:h-[245px] md:h-[260px]">
                {/* 1. Main Large Photo (tilted counter-clockwise, spans vertical height on left) */}
                <motion.div
                    whileHover={{ scale: 1.02, rotate: -5 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="absolute left-1 top-1 bottom-1 w-[57%] sm:w-[58%] rounded-[20px] sm:rounded-[24px] border-[4.5px] sm:border-[5px] border-white dark:border-slate-800 shadow-[0_16px_36px_-8px_rgba(76,29,149,0.22)] dark:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.6)] overflow-hidden z-10 -rotate-[6deg] transition-transform duration-500"
                >
                    <img
                        src={mainImg}
                        alt={mainAlt}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-106"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800";
                        }}
                    />
                </motion.div>

                {/* 2. Overlapping Top Right Photo (gently floats up and down, tilted slightly clockwise) */}
                <motion.div
                    animate={{ y: [-6, 6, -6] }}
                    transition={{
                        duration: 3.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    whileHover={{ scale: 1.04, rotate: 4 }}
                    className="absolute right-0.5 top-0.5 w-[49%] sm:w-[50%] h-[50%] rounded-[18px] sm:rounded-[20px] border-[4.5px] sm:border-[5px] border-white dark:border-slate-800 shadow-[0_14px_28px_-6px_rgba(76,29,149,0.20)] dark:shadow-[0_14px_28px_-6px_rgba(0,0,0,0.6)] overflow-hidden z-20 rotate-[5deg]"
                >
                    <img
                        src={topImg}
                        alt={topAlt}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-106"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800";
                        }}
                    />
                </motion.div>

                {/* 3. Overlapping Bottom Right Photo (gently floats up and down with offset, tilted slightly counter-clockwise) */}
                <motion.div
                    animate={{ y: [6, -6, 6] }}
                    transition={{
                        duration: 4.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                    }}
                    whileHover={{ scale: 1.04, rotate: -1 }}
                    className="absolute right-1 bottom-0.5 w-[49%] sm:w-[50%] h-[50%] rounded-[18px] sm:rounded-[20px] border-[4.5px] sm:border-[5px] border-white dark:border-slate-800 shadow-[0_14px_30px_-6px_rgba(76,29,149,0.24)] dark:shadow-[0_14px_30px_-6px_rgba(0,0,0,0.6)] overflow-hidden z-25 -rotate-[2deg]"
                >
                    <img
                        src={bottomImg}
                        alt={bottomAlt}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-106"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800";
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

const AboutUs = () => {
    const [team, setTeam] = React.useState([]);
    const [cms, setCms] = React.useState({});
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [teamRes, cmsRes] = await Promise.all([
                    axios.get('/api/public/directors'),
                    axios.get('/api/public/cms/about_us')
                ]);
                setTeam(teamRes.data || []);
                setCms(cmsRes.data || {});
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };
        fetchData();
    }, []);

    // Fallback static leaders if server list is empty
    const staticDirectors = [
        {
            _id: 'dir_1',
            name: 'Dr. Basil Thomas',
            role: 'GROUP CEO & DIRECTOR',
            university: 'SKILLDAD GLOBAL',
            bio: "Visionary global educational leader orchestrating SkillDad's strategic university alliances, international expansion, and enterprise placement ecosystem. Championing outcome-driven higher education across global academic & industry markets."
        },
        {
            _id: 'dir_2',
            name: 'Dilshad Ashraf',
            role: 'CEO',
            university: 'SKILLDAD',
            bio: "Driving SkillDad's core platform innovation, curriculum engineering, and corporate hiring partnerships. Dedicated to transforming student potential into high-growth tech and business careers through practical hands-on mastery."
        }
    ];

    const fetchedDirectors = team.filter(m => m.display_target === 'ABOUT_DIRECTOR' || (!m.display_target && (m.category === 'DIRECTOR' || !m.category)));
    const directors = fetchedDirectors.length > 0 ? fetchedDirectors : staticDirectors;
    const advisory = team.filter(m => m.display_target === 'ABOUT_ADVISORY' || (!m.display_target && m.category === 'ADVISORY'));

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05030B] flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="w-10 h-10 text-primary" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen about-us-page bg-[#080512] [.light-mode_&]:!bg-white text-white [.light-mode_&]:!text-slate-800 overflow-hidden relative font-sans transition-colors duration-300">
            <Navbar />

            {/* ── HERO SECTION (REDESIGNED TO MATCH REFERENCE IMAGE) ── */}
            <section className="relative pt-8 sm:pt-12 md:pt-14 pb-20 sm:pb-22 md:pb-24 lg:pb-28 px-4 sm:px-6 lg:px-12 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-[#FAF8FF] [.dark-mode_&]:!from-[#080512] [.dark-mode_&]:!via-[#0E091D] [.dark-mode_&]:!to-[#150D2B] border-b border-slate-100 [.dark-mode_&]:!border-purple-900/30">
                {/* Decorative background subtle wave curves matching reference */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#4C1D95]/15 [.dark-mode_&]:stroke-purple-600/10 fill-none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-100 240 C 150 140, 320 320, 520 240 C 720 160, 880 320, 1250 190" strokeWidth="1.5" />
                    <path d="M-50 480 C 200 410, 480 570, 780 490 C 1080 410, 1280 530, 1550 460" strokeWidth="1.5" />
                    <path d="M700 -50 C 850 160, 1050 80, 1200 260" strokeWidth="1.5" />
                </svg>

                {/* Soft ambient blur glows */}
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#4C1D95]/5 [.dark-mode_&]:bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-[#4C1D95]/5 [.dark-mode_&]:bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                        
                        {/* LEFT COLUMN: Content & Features (Animated slowly row by row from top to bottom) */}
                        <motion.div
                            variants={heroLeftContainer}
                            initial="hidden"
                            animate="visible"
                            className="lg:col-span-7 space-y-6 text-left"
                        >
                            {/* Row 1: "About Us" Pill Badge */}
                            <motion.div variants={heroRowFromTop}>
                                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#4C1D95]/10 border border-[#4C1D95]/20 text-[#4C1D95] text-[11px] md:text-xs font-semibold tracking-wide shadow-xs [.dark-mode_&]:!bg-purple-950/60 [.dark-mode_&]:!border-purple-800/50 [.dark-mode_&]:!text-purple-300">
                                    About Us
                                </div>
                            </motion.div>

                            {/* Row 2: Headline */}
                            <motion.h1
                                variants={heroRowFromTop}
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[48px] font-extrabold tracking-tight leading-[1.18] text-[#1E1B4B] [.dark-mode_&]:!text-white font-sans"
                            >
                                Empowering Students to <br />
                                <span className="text-[#4C1D95] [.dark-mode_&]:!text-purple-300">
                                    Learn, Grow &amp; Get Hired
                                </span>
                            </motion.h1>

                            {/* Row 3: Mission Description */}
                            <motion.p
                                variants={heroRowFromTop}
                                className="text-sm md:text-[15px] text-slate-600 [.dark-mode_&]:!text-slate-300 max-w-xl leading-relaxed font-normal"
                            >
                                We are on a mission to revolutionize the education landscape by bridging the gap between talent, institutions, and industry leaders through high-fidelity digital learning experiences.
                            </motion.p>

                            {/* Row 4: 4 Feature Columns with Faint Dividers */}
                            <motion.div variants={heroRowFromTop} className="pt-2 sm:pt-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x divide-slate-200/90 [.dark-mode_&]:divide-white/10">
                                    {/* Feature 1: Industry-Relevant Courses */}
                                    <div className="flex flex-col items-start sm:items-center text-left sm:text-center sm:px-3">
                                        <div className="w-11 h-11 rounded-full bg-[#4C1D95]/10 border border-[#4C1D95]/20 text-[#4C1D95] flex items-center justify-center mb-2.5 shadow-xs [.dark-mode_&]:!bg-purple-900/40 [.dark-mode_&]:!border-purple-700/50 [.dark-mode_&]:!text-purple-300">
                                            <GraduationCap size={20} />
                                        </div>
                                        <span className="text-[11px] sm:text-xs font-semibold text-slate-700 [.dark-mode_&]:!text-slate-200 leading-tight">
                                            Industry-Relevant <br className="hidden sm:inline" />Courses
                                        </span>
                                    </div>

                                    {/* Feature 2: Expert Guidance */}
                                    <div className="flex flex-col items-start sm:items-center text-left sm:text-center sm:px-3">
                                        <div className="w-11 h-11 rounded-full bg-[#4C1D95]/10 border border-[#4C1D95]/20 text-[#4C1D95] flex items-center justify-center mb-2.5 shadow-xs [.dark-mode_&]:!bg-purple-900/40 [.dark-mode_&]:!border-purple-700/50 [.dark-mode_&]:!text-purple-300">
                                            <Users size={20} />
                                        </div>
                                        <span className="text-[11px] sm:text-xs font-semibold text-slate-700 [.dark-mode_&]:!text-slate-200 leading-tight">
                                            Expert <br className="hidden sm:inline" />Guidance
                                        </span>
                                    </div>

                                    {/* Feature 3: Placement Support */}
                                    <div className="flex flex-col items-start sm:items-center text-left sm:text-center sm:px-3">
                                        <div className="w-11 h-11 rounded-full bg-[#4C1D95]/10 border border-[#4C1D95]/20 text-[#4C1D95] flex items-center justify-center mb-2.5 shadow-xs [.dark-mode_&]:!bg-purple-900/40 [.dark-mode_&]:!border-purple-700/50 [.dark-mode_&]:!text-purple-300">
                                            <Briefcase size={20} />
                                        </div>
                                        <span className="text-[11px] sm:text-xs font-semibold text-slate-700 [.dark-mode_&]:!text-slate-200 leading-tight">
                                            Placement <br className="hidden sm:inline" />Support
                                        </span>
                                    </div>

                                    {/* Feature 4: Career Growth */}
                                    <div className="flex flex-col items-start sm:items-center text-left sm:text-center sm:px-3">
                                        <div className="w-11 h-11 rounded-full bg-[#4C1D95]/10 border border-[#4C1D95]/20 text-[#4C1D95] flex items-center justify-center mb-2.5 shadow-xs [.dark-mode_&]:!bg-purple-900/40 [.dark-mode_&]:!border-purple-700/50 [.dark-mode_&]:!text-purple-300">
                                            <TrendingUp size={20} />
                                        </div>
                                        <span className="text-[11px] sm:text-xs font-semibold text-slate-700 [.dark-mode_&]:!text-slate-200 leading-tight">
                                            Career <br className="hidden sm:inline" />Growth
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* RIGHT COLUMN: Asterisk Student Photo Collage Graphic (Animated slowly bottom-to-top, positioned lower) */}
                        <div className="lg:col-span-5 flex items-center justify-center relative select-none pt-4 sm:pt-6 lg:pt-8 translate-y-3 sm:translate-y-5 lg:translate-y-7">
                            <motion.div
                                variants={heroRightImageReveal}
                                initial="hidden"
                                animate="visible"
                                className="relative w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[460px]"
                            >
                                {/* Gentle Floating Effect active after entrance */}
                                <motion.div
                                    animate={{ y: [-4, 4, -4] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.7 }}
                                >
                                    <img
                                        src="/assets/about_hero_collage.png"
                                        alt="Empowering Students at SkillDad"
                                        className="w-full h-auto object-contain drop-shadow-[0_15px_35px_rgba(94,2,137,0.14)]"
                                    />
                                </motion.div>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ── 3 DEDICATED SECTIONS: MISSION, VISION, VALUES (MATCHING REFERENCE DESIGN) ── */}
            <section className="py-5 sm:py-7 md:py-8 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">

                    {/* SECTION 1: OUR MISSION (Animated slowly from left to right) */}
                    <motion.div
                        variants={missionCardContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.15 }}
                        className="bg-white dark:bg-[#0E091D] rounded-[20px] sm:rounded-[24px] border border-purple-100/90 dark:border-purple-900/40 p-4 sm:p-5 md:p-6 shadow-[0_10px_30px_-10px_rgba(94,2,137,0.05)] relative overflow-hidden transition-all duration-500"
                    >
                        {/* Ambient subtle glow behind card */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#4C1D95]/5 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

                        <motion.div className="grid lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-center">
                            {/* LEFT COLUMN: 3-Photo Collage (Appears slowly from left to right) */}
                            <motion.div variants={missionCollageVariants} className="lg:col-span-5 w-full">
                                <CollageVisual
                                    mainImg={resolveAboutImg(cms.mission?.main_image, "/assets/about/mission_laptop.jpg")}
                                    mainAlt="Student studying with open laptop and notes"
                                    topImg={resolveAboutImg(cms.mission?.top_image, "/assets/about/mission_collab.jpg")}
                                    topAlt="Diverse students collaborating on laptop"
                                    bottomImg={resolveAboutImg(cms.mission?.bottom_image, "/assets/about/mission_headphones.jpg")}
                                    bottomAlt="Smiling student with headphones learning"
                                    reversed={false}
                                />
                            </motion.div>

                            {/* RIGHT COLUMN: Mission Content (Appears slowly left-to-right staggered) */}
                            <motion.div className="lg:col-span-7 space-y-2 sm:space-y-2.5">
                                {/* Pill Badge */}
                                <motion.div variants={missionBadgeVariants}>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4C1D95]/10 text-[#4C1D95] dark:bg-purple-950/70 dark:text-purple-300 text-[10px] font-bold tracking-wider uppercase shadow-2xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#4C1D95] dark:bg-purple-300" />
                                        <span>Our Mission</span>
                                    </div>
                                </motion.div>

                                {/* Headline */}
                                <motion.h2
                                    variants={missionHeadlineVariants}
                                    className="text-base sm:text-lg lg:text-xl xl:text-[22px] font-extrabold text-[#0F172A] dark:text-white leading-[1.25] tracking-tight font-sans"
                                >
                                    To make quality education{" "}
                                    <span className="text-[#4C1D95] dark:text-purple-300">
                                        accessible to everyone
                                    </span>
                                    , everywhere.
                                </motion.h2>

                                {/* Narrative Description */}
                                <motion.p
                                    variants={missionDescVariants}
                                    className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal font-normal"
                                >
                                    {cms.mission?.description || "To democratize quality education and make advanced learning accessible to everyone, everywhere, regardless of their background."}
                                </motion.p>

                                {/* 2x2 Feature Cards Grid (Staggered from left to right) */}
                                <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-0.5">
                                    {[
                                        {
                                            title: 'Industry-Driven Curriculum',
                                            desc: 'Courses co-designed with corporate tech leaders to ensure every topic matches live industry hiring demand.',
                                            icon: Book,
                                            delay: 0.78,
                                        },
                                        {
                                            title: 'Hands-On Project Portfolio',
                                            desc: 'Students build real-world applications and enterprise codebases that prove competency to hiring managers.',
                                            icon: Laptop,
                                            delay: 1.06,
                                        },
                                        {
                                            title: 'Direct Corporate Placements',
                                            desc: 'Seamless connections with 450+ partner companies, startup hubs, and multinational recruiters.',
                                            icon: Briefcase,
                                            delay: 0.92,
                                        },
                                        {
                                            title: 'Equal Learning Access',
                                            desc: 'Affordable, scalable digital learning that unlocks high-tech opportunities for students across all regions.',
                                            icon: GraduationCap,
                                            delay: 1.20,
                                        }
                                    ].map((pillar, idx) => (
                                        <motion.div
                                            key={idx}
                                            variants={{
                                                hidden: { opacity: 0, x: -35 },
                                                visible: {
                                                    opacity: 1,
                                                    x: 0,
                                                    transition: {
                                                        duration: 0.95,
                                                        ease: [0.16, 1, 0.3, 1],
                                                        delay: pillar.delay
                                                    }
                                                }
                                            }}
                                            className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#FAFAFC] dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 hover:border-[#4C1D95]/30 dark:hover:border-purple-500/40 transition-all duration-300 hover:shadow-xs group flex items-start gap-2 sm:gap-2.5"
                                        >
                                            <div className="w-7 sm:w-7.5 h-7 sm:h-7.5 rounded-lg bg-[#4C1D95]/10 dark:bg-purple-900/30 border border-[#4C1D95]/20 dark:border-purple-800/40 flex items-center justify-center text-[#4C1D95] dark:text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
                                                <pillar.icon size={14} strokeWidth={2} />
                                            </div>
                                            <div className="space-y-0.5 min-w-0">
                                                <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                                                    {pillar.title}
                                                </h4>
                                                <p className="text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal">
                                                    {pillar.desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* SECTION 2: OUR VISION (ANIMATED SLOWLY FROM RIGHT TO LEFT) */}
                    <motion.div
                        variants={visionCardContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.15 }}
                        className="bg-white dark:bg-[#0E091D] rounded-[20px] sm:rounded-[24px] border border-purple-100/90 dark:border-purple-900/40 p-4 sm:p-5 md:p-6 shadow-[0_10px_30px_-10px_rgba(94,2,137,0.05)] relative overflow-hidden transition-all duration-500"
                    >
                        {/* Ambient subtle glow behind card */}
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#4C1D95]/5 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

                        <motion.div className="grid lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-center">
                            {/* LEFT COLUMN: Vision Content & 2x2 Feature Grid (Glides in from right to left) */}
                            <motion.div className="lg:col-span-7 space-y-2 sm:space-y-2.5">
                                {/* Pill Badge */}
                                <motion.div variants={visionBadgeVariants}>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4C1D95]/10 text-[#4C1D95] dark:bg-purple-950/70 dark:text-purple-300 text-[10px] font-bold tracking-wider uppercase shadow-2xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#4C1D95] dark:bg-purple-300" />
                                        <span>Our Vision</span>
                                    </div>
                                </motion.div>

                                {/* Headline */}
                                <motion.h2
                                    variants={visionHeadlineVariants}
                                    className="text-base sm:text-lg lg:text-xl xl:text-[22px] font-extrabold text-[#0F172A] dark:text-white leading-[1.25] tracking-tight font-sans"
                                >
                                    Building a global ecosystem{" "}
                                    <span className="text-[#4C1D95] dark:text-purple-300">
                                        where talent meets opportunity
                                    </span>
                                    .
                                </motion.h2>

                                {/* Narrative Description */}
                                <motion.p
                                    variants={visionDescVariants}
                                    className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal font-normal"
                                >
                                    {cms.vision?.description || "Creating a global ecosystem where knowledge flows seamlessly between world-class institutions and ambitious learners."}
                                </motion.p>

                                {/* 2x2 Feature Cards Grid (Staggered from right to left) */}
                                <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-0.5">
                                    {[
                                        {
                                            title: 'Global Career Mobility',
                                            desc: 'Connecting ambitious students directly to international employers and remote high-salary job roles.',
                                            icon: Globe,
                                            delay: 1.06,
                                        },
                                        {
                                            title: 'Academic Partnerships',
                                            desc: 'Collaborating with accredited universities to enrich degree programs with accredited practical skill tracks.',
                                            icon: GraduationCap,
                                            delay: 0.78,
                                        },
                                        {
                                            title: 'AI-Powered Learning Paths',
                                            desc: 'Adaptive neural recommendations that guide students step-by-step toward their exact career targets.',
                                            icon: Zap,
                                            delay: 1.20,
                                        },
                                        {
                                            title: 'Continuous Upskilling',
                                            desc: 'Lifetime access to updated modules, advanced tech tracks, and alumni career mentorship networks.',
                                            icon: TrendingUp,
                                            delay: 0.92,
                                        }
                                    ].map((pillar, idx) => (
                                        <motion.div
                                            key={idx}
                                            variants={{
                                                hidden: { opacity: 0, x: 35 },
                                                visible: {
                                                    opacity: 1,
                                                    x: 0,
                                                    transition: {
                                                        duration: 0.95,
                                                        ease: [0.16, 1, 0.3, 1],
                                                        delay: pillar.delay
                                                    }
                                                }
                                            }}
                                            className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#FAFAFC] dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 hover:border-[#4C1D95]/30 dark:hover:border-purple-500/40 transition-all duration-300 hover:shadow-xs group flex items-start gap-2 sm:gap-2.5"
                                        >
                                            <div className="w-7 sm:w-7.5 h-7 sm:h-7.5 rounded-lg bg-[#4C1D95]/10 dark:bg-purple-900/30 border border-[#4C1D95]/20 dark:border-purple-800/40 flex items-center justify-center text-[#4C1D95] dark:text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
                                                <pillar.icon size={14} strokeWidth={2} />
                                            </div>
                                            <div className="space-y-0.5 min-w-0">
                                                <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                                                    {pillar.title}
                                                </h4>
                                                <p className="text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal">
                                                    {pillar.desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>

                            {/* RIGHT COLUMN: 3-Photo Collage (Glides in first from right to left) */}
                            <motion.div variants={visionCollageVariants} className="lg:col-span-5 w-full">
                                <CollageVisual
                                    mainImg={resolveAboutImg(cms.vision?.main_image, "/assets/about/vision_campus.jpg")}
                                    mainAlt="International university modern campus plaza"
                                    topImg={resolveAboutImg(cms.vision?.top_image, "/assets/about/vision_innovators.jpg")}
                                    topAlt="Ambitious students innovating in tech lab"
                                    bottomImg={resolveAboutImg(cms.vision?.bottom_image, "/assets/about/vision_graduate.jpg")}
                                    bottomAlt="Confident young professional graduate"
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* SECTION 3: OUR CORE VALUES (ANIMATED SLOWLY FROM LEFT TO RIGHT LIKE OUR MISSION) */}
                    <motion.div
                        variants={missionCardContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.15 }}
                        className="bg-white dark:bg-[#0E091D] rounded-[20px] sm:rounded-[24px] border border-purple-100/90 dark:border-purple-900/40 p-4 sm:p-5 md:p-6 shadow-[0_10px_30px_-10px_rgba(94,2,137,0.05)] relative overflow-hidden transition-all duration-500"
                    >
                        {/* Ambient subtle glow behind card */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#4C1D95]/5 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

                        <motion.div className="grid lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-center">
                            {/* LEFT COLUMN: 3-Photo Collage (Appears slowly from left to right) */}
                            <motion.div variants={missionCollageVariants} className="lg:col-span-5 w-full">
                                <CollageVisual
                                    mainImg={resolveAboutImg(cms.values?.main_image, "/assets/about/values_mastery.jpg")}
                                    mainAlt="Students mastering technical skills and hands-on projects"
                                    topImg={resolveAboutImg(cms.values?.top_image, "/assets/about/values_mentor.jpg")}
                                    topAlt="Dedicated tech mentor guiding students"
                                    bottomImg={resolveAboutImg(cms.values?.bottom_image, "/assets/about/values_success.jpg")}
                                    bottomAlt="Proud graduate celebrating career success"
                                    reversed={false}
                                />
                            </motion.div>

                            {/* RIGHT COLUMN: Values Content & 2x2 Feature Grid (Staggered left-to-right) */}
                            <motion.div className="lg:col-span-7 space-y-2 sm:space-y-2.5">
                                {/* Pill Badge */}
                                <motion.div variants={missionBadgeVariants}>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4C1D95]/10 text-[#4C1D95] dark:bg-purple-950/70 dark:text-purple-300 text-[10px] font-bold tracking-wider uppercase shadow-2xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#4C1D95] dark:bg-purple-300" />
                                        <span>Our Core Values</span>
                                    </div>
                                </motion.div>

                                {/* Headline */}
                                <motion.h2
                                    variants={missionHeadlineVariants}
                                    className="text-base sm:text-lg lg:text-xl xl:text-[22px] font-extrabold text-[#0F172A] dark:text-white leading-[1.25] tracking-tight font-sans"
                                >
                                    {cms.values?.title && cms.values.title !== 'Our Values' && cms.values.title !== 'Core Values' ? (
                                        cms.values.title
                                    ) : (
                                        <>
                                            Guiding principles that anchor{" "}
                                            <span className="text-[#4C1D95] dark:text-purple-300">
                                                student excellence
                                            </span>
                                            .
                                        </>
                                    )}
                                </motion.h2>

                                {/* Narrative Description */}
                                <motion.p
                                    variants={missionDescVariants}
                                    className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal font-normal"
                                >
                                    {cms.values?.description || "The fundamental principles that guide every curriculum decision, placement initiative, and student interaction at SkillDad."}
                                </motion.p>

                                {/* 2x2 Feature Cards Grid - Full text display without clipping */}
                                <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-0.5">
                                    {[
                                        {
                                            title: 'Student Success First',
                                            desc: 'Every program is evaluated strictly by how effectively it accelerates student career outcomes and job placement.',
                                            icon: Users,
                                            tag: 'Primary Directive',
                                            delay: 0.78,
                                        },
                                        {
                                            title: 'Practical Mastery',
                                            desc: 'We prioritize real building, project execution, and practical problem-solving over passive rote learning.',
                                            icon: Laptop,
                                            tag: 'Skill Focused',
                                            delay: 1.06,
                                        },
                                        {
                                            title: 'Outcome Transparency',
                                            desc: 'Honest guidance, clear skill benchmark evaluation, and genuine corporate placement assistance.',
                                            icon: ShieldCheck,
                                            tag: 'Trust & Ethics',
                                            delay: 0.92,
                                        },
                                        {
                                            title: 'Continuous Innovation',
                                            desc: 'Constantly updating our platform with modern technologies like AI, Cloud Computing, and Data Science.',
                                            icon: Zap,
                                            tag: 'Future Ready',
                                            delay: 1.20,
                                        }
                                    ].map((val, idx) => (
                                        <motion.div
                                            key={idx}
                                            variants={{
                                                hidden: { opacity: 0, x: -35 },
                                                visible: {
                                                    opacity: 1,
                                                    x: 0,
                                                    transition: {
                                                        duration: 0.95,
                                                        ease: [0.16, 1, 0.3, 1],
                                                        delay: val.delay
                                                    }
                                                }
                                            }}
                                            className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#FAFAFC] dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 hover:border-purple-200 dark:hover:border-purple-500/40 transition-all duration-300 hover:shadow-xs group flex items-start gap-2 sm:gap-2.5"
                                        >
                                            <div className="w-7 sm:w-7.5 h-7 sm:h-7.5 rounded-lg bg-[#4C1D95]/10 dark:bg-purple-900/30 border border-[#4C1D95]/20 dark:border-purple-800/40 flex items-center justify-center text-[#4C1D95] dark:text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
                                                <val.icon size={14} strokeWidth={2} />
                                            </div>
                                            <div className="space-y-0.5 flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center justify-between gap-1">
                                                    <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                                                        {val.title}
                                                    </h4>
                                                    <span className="text-[8px] font-bold uppercase tracking-wider text-[#4C1D95] dark:text-purple-300 bg-[#4C1D95]/10 dark:bg-purple-900/40 px-1.5 py-0.5 rounded-full shrink-0">
                                                        {val.tag}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal">
                                                    {val.desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                </div>
            </section>

            {/* ── HOW SKILLDAD WORKS (LEARN SKILLS & GET JOB) ── */}
            <section className="py-5 sm:py-7 md:py-8 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        variants={careerEngineCardContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.15 }}
                        className="bg-white dark:bg-[#0E091D] rounded-[20px] sm:rounded-[24px] border border-purple-100/90 dark:border-purple-900/40 p-5 sm:p-6 md:p-7 shadow-[0_10px_30px_-10px_rgba(94,2,137,0.05)] relative overflow-hidden transition-all duration-500"
                    >
                        {/* Ambient subtle glow behind card */}
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#4C1D95]/5 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Section Header (Appears from top to bottom) */}
                        <motion.div className="text-center max-w-xl mx-auto space-y-2 mb-6 sm:mb-7">
                            {/* Pill Badge */}
                            <motion.div variants={careerEngineBadgeVariants}>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4C1D95]/10 text-[#4C1D95] dark:bg-purple-950/70 dark:text-purple-300 text-[10px] font-bold tracking-wider uppercase shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4C1D95] dark:bg-purple-300" />
                                    <span>Student Career Engine</span>
                                </div>
                            </motion.div>

                            {/* Headline */}
                            <motion.h2
                                variants={careerEngineHeadlineVariants}
                                className="text-base sm:text-lg lg:text-xl xl:text-[22px] font-extrabold text-[#0F172A] dark:text-white leading-[1.25] tracking-tight font-sans"
                            >
                                How Students{" "}
                                <span className="text-[#4C1D95] dark:text-purple-300">
                                    Learn Skills & Get Hired
                                </span>
                            </motion.h2>

                            {/* Narrative Description */}
                            <motion.p
                                variants={careerEngineDescVariants}
                                className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal font-normal"
                            >
                                A structured 4-step framework taking learners from foundational learning to landing high-paying corporate roles.
                            </motion.p>
                        </motion.div>

                        {/* 4 Standard Step Cards (Appears from centre to surroundings, after header has appeared) */}
                        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
                            {[
                                {
                                    step: '01',
                                    title: 'Learn In-Demand Skills',
                                    desc: 'Access industry-curated courses taught by tech leads and subject matter experts.',
                                    icon: Book,
                                    stage: 'Foundation',
                                    delay: 0.94,
                                    xOffset: 35,
                                },
                                {
                                    step: '02',
                                    title: 'Build Live Projects',
                                    desc: 'Develop real-world software applications and case studies for your professional portfolio.',
                                    icon: Laptop,
                                    stage: 'Practice',
                                    delay: 0.68,
                                    xOffset: 16,
                                },
                                {
                                    step: '03',
                                    title: 'Earn Certifications',
                                    desc: 'Gain accredited skill certifications recognized by partner universities and corporate recruiters.',
                                    icon: Award,
                                    stage: 'Credential',
                                    delay: 0.68,
                                    xOffset: -16,
                                },
                                {
                                    step: '04',
                                    title: 'Land Corporate Jobs',
                                    desc: 'Get direct referral access to exclusive hiring drives, interview prep, and corporate placements.',
                                    icon: Briefcase,
                                    stage: 'Placement',
                                    delay: 0.94,
                                    xOffset: -35,
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={{
                                        hidden: { opacity: 0, scale: 0.88, x: item.xOffset },
                                        visible: {
                                            opacity: 1,
                                            scale: 1,
                                            x: 0,
                                            transition: {
                                                duration: 0.95,
                                                ease: [0.16, 1, 0.3, 1],
                                                delay: item.delay
                                            }
                                        }
                                    }}
                                    className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAFAFC] dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 hover:border-purple-200 dark:hover:border-purple-500/40 transition-all duration-300 hover:shadow-xs group flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Header Row: Icon + Subtle Step Badge */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg sm:rounded-xl bg-[#4C1D95]/10 dark:bg-purple-900/30 border border-[#4C1D95]/20 dark:border-purple-800/40 flex items-center justify-center text-[#4C1D95] dark:text-purple-300 group-hover:scale-105 transition-transform">
                                                <item.icon size={15} strokeWidth={2.2} />
                                            </div>
                                            <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-[#4C1D95] dark:text-purple-300 bg-[#4C1D95]/10 dark:bg-purple-900/40 px-2 py-0.5 rounded-full">
                                                Step {item.step}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-snug mb-1 font-sans">
                                            {item.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                                            {item.desc}
                                        </p>
                                    </div>

                                    {/* Simple & Humble Footer */}
                                    <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                                        <span>Stage {idx + 1}</span>
                                        <span className="text-[#4C1D95] dark:text-purple-300 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                            {item.stage} <ArrowRight size={10} />
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── EXECUTIVE LEADERSHIP SECTION (COORDINATES WITH) ── */}
            {directors.length > 0 && (
                <section className="py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 relative border-t border-purple-100/70 dark:border-purple-900/30">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center mb-5 sm:mb-6 space-y-1"
                        >
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4C1D95]/10 border border-[#4C1D95]/20 text-[#4C1D95] dark:bg-purple-950/70 dark:border-purple-800/50 dark:text-purple-300 text-[10px] font-bold tracking-wider uppercase shadow-2xs">
                                {/* Innovative Executive Leadership Coordination Emblem */}
                                <svg className="w-3.5 h-3.5 text-[#4C1D95] dark:text-purple-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="9.5" className="opacity-40" strokeDasharray="3 2" />
                                    <polygon points="12 3 14.8 9.2 21 12 14.8 14.8 12 21 9.2 14.8 3 12 9.2 9.2 12 3" fill="currentColor" fillOpacity="0.18" />
                                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                                </svg>
                                <span>Executive Leadership</span>
                            </div>

                            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug font-sans">
                                SkillDad <span className="text-[#4C1D95] dark:text-purple-300">Coordinates With</span>
                            </h2>
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal max-w-md mx-auto leading-relaxed">
                                Visionary executive leadership guiding the nexus of global institutional excellence, corporate partnerships, and student placement success.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 max-w-2xl lg:max-w-[640px] mx-auto items-stretch">
                            {directors.map((member, idx) => (
                                <ExecutiveLeadershipCard
                                    key={member._id || member.name}
                                    member={member}
                                    direction={idx % 2 === 0 ? 'left-top-to-right-bottom' : 'right-top-to-left-bottom'}
                                    delay={idx === 0 ? 0.35 : 0.75}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── ADVISORY BOARD SECTION ── */}
            {advisory.length > 0 && (
                <section className="py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 relative border-t border-purple-100/70 dark:border-purple-900/30">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-5 sm:mb-6 space-y-1"
                        >
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4C1D95]/10 text-[#4C1D95] dark:bg-purple-950/70 dark:text-purple-300 text-[9.5px] font-bold tracking-wider uppercase shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#4C1D95] dark:bg-purple-300" />
                                <span>Academic & Industry Council</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug font-sans">
                                Advisory <span className="text-[#4C1D95] dark:text-purple-300">Board</span>
                            </h2>
                            {cms.advisory_header?.description && (
                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal max-w-md mx-auto leading-relaxed italic">
                                    "{cms.advisory_header.description}"
                                </p>
                            )}
                        </motion.div>

                        <div className="flex flex-wrap items-stretch justify-center gap-4 sm:gap-6 max-w-3xl mx-auto">
                            {advisory.map((member) => (
                                <div key={member._id || member.name} className="w-full max-w-[280px] sm:max-w-[310px]">
                                    <ExecutiveLeadershipCard member={member} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── CALL TO ACTION SECTION (STANDARD, REFINED & MODERN) ── */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative border-t border-purple-100/70 dark:border-purple-900/30 overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="rounded-3xl bg-white dark:bg-[#0E091D] border border-slate-200/90 dark:border-purple-900/40 p-8 sm:p-10 md:p-12 text-center shadow-[0_12px_36px_-15px_rgba(76,29,149,0.08)] relative overflow-hidden"
                    >
                        {/* Subtle ambient blur glow inside card */}
                        <div className="absolute -top-16 -right-16 w-60 h-60 bg-[#4C1D95]/5 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-slate-100/60 dark:bg-purple-950/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            {/* Pill Badge */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#4C1D95]/10 text-[#4C1D95] dark:bg-purple-950/70 dark:text-purple-300 text-[10px] font-bold tracking-wider uppercase shadow-2xs mb-3.5">
                                <GraduationCap size={12} className="text-[#4C1D95] dark:text-purple-300" />
                                <span>Skill Development & Career Growth</span>
                            </div>

                            {/* Headline with believable, professional typography */}
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug font-sans">
                                Ready to Build In-Demand Skills <br className="hidden sm:inline" />
                                <span className="text-[#4C1D95] dark:text-purple-300">
                                    for Real-World Careers?
                                </span>
                            </h2>

                            {/* Subtitle - Realistic, authentic, and grounded without demo metrics */}
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-lg mx-auto mt-2.5 leading-relaxed">
                                Gain practical, project-based knowledge guided by experienced mentors and accredited academic partners to accelerate your career.
                            </p>

                            {/* Standard, clean CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6">
                                <button
                                    onClick={() => window.location.href = '/courses'}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#4C1D95]/25 hover:shadow-lg hover:shadow-[#4C1D95]/35 transition-all duration-200 active:scale-98 cursor-pointer"
                                >
                                    <span>Explore Skill Programs</span>
                                    <ArrowRight size={15} />
                                </button>
                                <button
                                    onClick={() => window.location.href = '/register'}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-white/10 hover:border-[#4C1D95]/40 dark:hover:border-purple-500/40 transition-all duration-200 active:scale-98 shadow-2xs cursor-pointer"
                                >
                                    <span>Register Now</span>
                                </button>
                            </div>

                            {/* Trust badges - Believable and realistic */}
                            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 mt-6 border-t border-purple-100/70 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                    <span>Practical Project-Based Learning</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                    <span>Academic & Industry Aligned</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                    <span>Dedicated Placement Support</span>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutUs;
