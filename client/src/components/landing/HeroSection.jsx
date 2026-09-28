import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    GraduationCap
} from 'lucide-react';
import AlyraOrb from './AlyraOrb';
import { useUser } from '../../context/UserContext';
import { getMediaUrl } from '../../utils/media';

/* ─── Hero Bubble Floating Physics & Pop Keyframes ─────────────── */
const HERO_BUBBLE_CSS = `
@keyframes hero-bubble-float {
    0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
    8% { opacity: 1; }
    20% { transform: translate(calc(var(--drift-x) * 0.4), -115px) scale(0.82); }
    40% { transform: translate(calc(var(--drift-x) * 0.85), -270px) scale(0.95); }
    60% { transform: translate(calc(var(--drift-x) * 0.55), -410px) scale(1); }
    80% { transform: translate(calc(var(--drift-x) * 0.9), -545px) scale(1.02); }
    94% { opacity: 1; transform: translate(calc(var(--drift-x) * 0.65), -625px) scale(1.05); }
    100% { transform: translate(calc(var(--drift-x) * 0.75), -660px) scale(1.05); opacity: 0; }
}
@keyframes hero-bubble-visual-mid {
    0%, 41% { opacity: 1; transform: scale(1); }
    43% { opacity: 0; transform: scale(1.2); }
    100% { opacity: 0; transform: scale(1.2); }
}
@keyframes hero-bubble-text-mid {
    0%, 54% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
    68% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes hero-shard-mid {
    0%, 39% { opacity: 0; transform: translate(-50%, -50%) translate(0, 0) scale(0.5) rotate(0deg); }
    44% { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg); }
    66% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.3) rotate(var(--rot)); }
    100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.3) rotate(var(--rot)); }
}
@keyframes hero-bubble-visual-high {
    0%, 61% { opacity: 1; transform: scale(1); }
    63% { opacity: 0; transform: scale(1.2); }
    100% { opacity: 0; transform: scale(1.2); }
}
@keyframes hero-bubble-text-high {
    0%, 74% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
    88% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes hero-shard-high {
    0%, 59% { opacity: 0; transform: translate(-50%, -50%) translate(0, 0) scale(0.5) rotate(0deg); }
    64% { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg); }
    86% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.3) rotate(var(--rot)); }
    100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.3) rotate(var(--rot)); }
}
@keyframes hero-marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
}
.animate-hero-marquee {
    display: flex;
    width: max-content;
    animation: hero-marquee 28s linear infinite;
}
.animate-hero-marquee:hover {
    animation-play-state: paused;
}
`;

/* ─── Floating Course & Stat Bubbles (Right Side) ──────────────── */
const bubbleVisualStyle = {
    background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.92), rgba(192,38,255,0.42) 55%, rgba(76,29,149,0.28) 100%)',
    border: '1px solid rgba(255,255,255,0.65)',
    boxShadow: '0 0 16px rgba(192,38,255,0.38)'
};

const PLAIN_BUBBLES = [
    { id: 'p1', left: 15, size: 16, duration: 9, delay: 0.8, drift: 20 },
    { id: 'p2', left: 60, size: 13, duration: 10.5, delay: 4.5, drift: 25 },
    { id: 'p3', left: 35, size: 18, duration: 11, delay: 2.5, drift: 18 },
    { id: 'p4', left: 75, size: 14, duration: 9.5, delay: 6.0, drift: 22 },
];

const CONVERT_BUBBLES = [
    { id: 'c1', left: 20, size: 24, duration: 9, delay: 0, pop: 'mid', drift: 20 },
    { id: 'c2', left: 50, size: 22, duration: 10, delay: 4.5, pop: 'high', drift: 18 },
    { id: 'c3', left: 70, size: 20, duration: 8.5, delay: 8, pop: 'mid', drift: 22 },
];

const SHARD_ANGLES = [0, 60, 120, 180, 240, 300];
const getShards = (bubble) => {
    const dist = bubble.size * 2.3;
    const offset = (bubble.id.charCodeAt(1) * 17) % 60;
    return SHARD_ANGLES.map((deg) => {
        const rad = ((deg + offset) * Math.PI) / 180;
        return {
            dx: Math.round(Math.cos(rad) * dist),
            dy: Math.round(Math.sin(rad) * dist),
            rot: Math.round(90 + deg)
        };
    });
};

const CourseBubbles = ({ texts }) => {
    const defaultTexts = ['196547+Openings', '215676+Hiring Partners'];
    const activeTexts = (Array.isArray(texts) && texts.length > 0) ? texts : defaultTexts;

    return (
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[22%] lg:w-[18%] xl:w-[16%] z-[16] pointer-events-none select-none overflow-hidden">
            {/* Plain bubbles - rise and drift off the top */}
            {PLAIN_BUBBLES.map((b) => (
                <div
                    key={b.id}
                    className="absolute bottom-0 rounded-full"
                    style={{
                        left: `${b.left}%`,
                        width: b.size,
                        height: b.size,
                        ...bubbleVisualStyle,
                        '--drift-x': `${b.drift}px`,
                        animation: `hero-bubble-float ${b.duration}s ease-in-out infinite`,
                        animationDelay: `${b.delay}s`,
                        animationFillMode: 'backwards'
                    }}
                />
            ))}

            {/* Convert bubbles - rise and pop into badge text pills */}
            {CONVERT_BUBBLES.map((b, i) => {
                const label = activeTexts[i % activeTexts.length];
                return (
                    <div
                        key={b.id}
                        className="absolute bottom-0"
                        style={{
                            left: `${b.left}%`,
                            width: b.size,
                            height: b.size,
                            '--drift-x': `${b.drift}px`,
                            animation: `hero-bubble-float ${b.duration}s ease-in-out infinite`,
                            animationDelay: `${b.delay}s`,
                            animationFillMode: 'backwards'
                        }}
                    >
                        <div className="relative w-full h-full">
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    ...bubbleVisualStyle,
                                    animation: `hero-bubble-visual-${b.pop} ${b.duration}s ease-in-out infinite`,
                                    animationDelay: `${b.delay}s`,
                                    animationFillMode: 'backwards'
                                }}
                            />
                            {getShards(b).map((s, si) => (
                                <div
                                    key={si}
                                    className="absolute top-1/2 left-1/2 rounded-full"
                                    style={{
                                        width: Math.max(4, b.size * 0.22),
                                        height: Math.max(4, b.size * 0.22),
                                        ...bubbleVisualStyle,
                                        '--dx': `${s.dx}px`,
                                        '--dy': `${s.dy}px`,
                                        '--rot': `${s.rot}deg`,
                                        animation: `hero-shard-${b.pop} ${b.duration}s ease-out infinite`,
                                        animationDelay: `${b.delay}s`,
                                        animationFillMode: 'backwards'
                                    }}
                                />
                            ))}
                            <div
                                className="absolute top-1/2 left-1/2 whitespace-nowrap px-2.5 py-1 text-[11.5px] sm:text-xs font-extrabold tracking-tight text-slate-900 dark:text-purple-100 bg-transparent"
                                style={{
                                    textShadow: '0 2px 10px rgba(0,0,0,0.22), 0 0 16px rgba(192,38,255,0.5)',
                                    animation: `hero-bubble-text-${b.pop} ${b.duration}s ease-in-out infinite`,
                                    animationDelay: `${b.delay}s`,
                                    animationFillMode: 'backwards'
                                }}
                            >
                                {label}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Hero Assets exactly matching reference
import studentImg from '../../assets/hero/student.jpg';
import universityImg from '../../assets/hero/university.jpg';
import jobsImg from '../../assets/hero/jobs.jpg';
import coursesImg from '../../assets/hero/courses.jpg';
import certsImg from '../../assets/hero/certifications.jpg';
import skilldadLogoDeepPurple from '../../assets/logo_deep_purple.png';

// Real partner universities & corporate partners from SkillDad CMS database
const REAL_PARTNERS_INITIAL = [
    { id: 'amritha', name: 'Amritha Vishwa Vidyapeedam', logo: '/uploads/logo-1790585866527.png', type: 'university' },
    { id: 'cit', name: 'Canadian Institute Of Technology (CIT)', logo: '/uploads/logo-1790586007998.png', type: 'university' },
    { id: 'mu', name: 'Mediterranean University (MU)', logo: '/uploads/logo-1788942072427.png', type: 'university' },
    { id: 'jain', name: 'JAIN UNIVERSITY', logo: '/uploads/logo-1788942119589.png', type: 'university' },
    { id: 'capgemini', name: 'Capgemini', logo: '/uploads/logo-1786942696943.png', type: 'corporate' },
    { id: 'accenture', name: 'Accenture', logo: '/uploads/logo-1786942705224.png', type: 'corporate' },
    { id: 'gla', name: 'GLA UNIVERSITY', logo: '/uploads/logo-1788942159826.png', type: 'university' },
    { id: 'infosys', name: 'Infosys', logo: '/uploads/logo-1786942732509.webp', type: 'corporate' },
    { id: 'manipal', name: 'MANIPAL UNIVERSITY', logo: '/uploads/logo-1790586513522.png', type: 'university' },
    { id: 'tcs', name: 'TCS', logo: '/uploads/logo-1786942739987.webp', type: 'corporate' },
    { id: 'wipro', name: 'Wipro', logo: '/uploads/logo-1786942747313.png', type: 'corporate' },
    { id: 'prohostix', name: 'ProHostix', logo: '/uploads/logo-1787132719537.png', type: 'corporate' }
];

const splitIntoBatches = (items, batchSize = 6) => {
    if (!items || items.length === 0) return [];
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
    }
    return batches;
};

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

    const [bubbleTexts, setBubbleTexts] = useState(['196547+Openings', '215676+Hiring Partners']);
    const [partnersList, setPartnersList] = useState(REAL_PARTNERS_INITIAL);
    const [partnerBatchIndex, setPartnerBatchIndex] = useState(0);
    const [isPartnerHovered, setIsPartnerHovered] = useState(false);

    const partnerBatches = useMemo(() => {
        return splitIntoBatches(partnersList, 6);
    }, [partnersList]);

    // Rotate batches on desktop every 3.5s (pauses on hover)
    useEffect(() => {
        if (!partnerBatches || partnerBatches.length <= 1 || isPartnerHovered) return;
        const interval = setInterval(() => {
            setPartnerBatchIndex(prev => (prev + 1) % partnerBatches.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [partnerBatches, isPartnerHovered]);

    // Fetch dynamic partner logos from DB API
    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await fetch('/api/public/partner-logos');
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const active = data.filter(item => item.isActive !== false && (item.imageUrl || item.logo));
                    if (active.length > 0) {
                        const mapped = active.map(p => ({
                            id: p._id || p.name,
                            name: p.name,
                            logo: p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : getMediaUrl(p.imageUrl)) : getMediaUrl(p.logo),
                            type: p.type || 'partner'
                        }));
                        setPartnersList(mapped);
                    }
                }
            } catch (e) {
                // Keep initial real partner list
            }
        };
        fetchPartners();
    }, []);

    useEffect(() => {
        const fetchCmsData = async () => {
            try {
                const res = await fetch('/api/public/cms/landing_page');
                const data = await res.json();
                const items = data?.hero_bubbles?.items;
                if (Array.isArray(items) && items.length > 0) {
                    const list = items.map(i => i.text).filter(Boolean);
                    if (list.length > 0) setBubbleTexts(list);
                }
            } catch (e) {
                // Keep default texts
            }
        };
        fetchCmsData();
    }, []);

    // ── 5 INNOVATIVE & ATTRACTIVE CUSTOM ICONS FOR CONSTELLATION NODES ──
    const InnovativeStudentsIcon = ({ className = "w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="istudGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#581C87" />
                </linearGradient>
                <linearGradient id="istudGold" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDE047" />
                    <stop offset="1" stopColor="#EAB308" />
                </linearGradient>
            </defs>
            {/* Student Torso with Sleek V-Collar */}
            <path d="M4 21C4 17.5 7.5 15 12 15C16.5 15 20 17.5 20 21" stroke="url(#istudGrad)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M9 20.5L12 17L15 20.5" stroke="#A855F7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Head Circle */}
            <circle cx="12" cy="10" r="3.6" fill="url(#istudGrad)" />
            {/* Sleek Diamond Graduation Cap on Head */}
            <path d="M12 3L5.5 6.2L12 9.4L18.5 6.2L12 3Z" fill="url(#istudGrad)" stroke="#4C1D95" strokeWidth="0.8" strokeLinejoin="round" />
            <path d="M18.5 6.5V9.5C18.5 9.5 17.8 10.2 17 10.2" stroke="url(#istudGold)" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="17" cy="10.8" r="0.9" fill="url(#istudGold)" />
            {/* Ambition Sparkle Star */}
            <path d="M19 1.5L19.4 2.4L20.3 2.8L19.4 3.2L19 4.1L18.6 3.2L17.7 2.8L18.6 2.4L19 1.5Z" fill="url(#istudGold)" />
        </svg>
    );

    const InnovativeUniversitiesIcon = ({ className = "w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="iunivGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7C3AED" />
                    <stop offset="1" stopColor="#4C1D95" />
                </linearGradient>
                <linearGradient id="iunivGold" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FCD34D" />
                    <stop offset="1" stopColor="#F59E0B" />
                </linearGradient>
            </defs>
            {/* Neoclassical Pediment (Triangular Temple Roof) */}
            <path d="M12 2.5L2 7.5H22L12 2.5Z" fill="url(#iunivGrad)" stroke="#3B0764" strokeWidth="0.6" strokeLinejoin="round" />
            <path d="M12 4.2L5 7.5H19L12 4.2Z" fill="white" fillOpacity="0.25" />
            {/* Dome Spire / University Torch */}
            <line x1="12" y1="1" x2="12" y2="2.5" stroke="url(#iunivGold)" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="12" cy="1" r="1.1" fill="url(#iunivGold)" />
            {/* Entablature Header Bar */}
            <rect x="3" y="7.5" width="18" height="2" rx="0.5" fill="#6D28D9" />
            {/* 4 Classical Columns */}
            <rect x="4.5" y="9.5" width="2" height="7" rx="0.4" fill="url(#iunivGrad)" />
            <rect x="9" y="9.5" width="2" height="7" rx="0.4" fill="url(#iunivGrad)" />
            <rect x="13" y="9.5" width="2" height="7" rx="0.4" fill="url(#iunivGrad)" />
            <rect x="17.5" y="9.5" width="2" height="7" rx="0.4" fill="url(#iunivGrad)" />
            {/* Central Entrance Gateway Arch */}
            <path d="M10 16.5V13.5C10 12.4 10.9 11.5 12 11.5C13.1 11.5 14 12.4 14 13.5V16.5" stroke="url(#iunivGold)" strokeWidth="1.2" strokeLinecap="round" />
            {/* Foundation Stepped Base */}
            <rect x="2" y="16.5" width="20" height="2.2" rx="0.6" fill="#581C87" />
            <rect x="1" y="18.7" width="22" height="2.2" rx="0.6" fill="url(#iunivGrad)" />
        </svg>
    );

    const InnovativeJobsIcon = ({ className = "w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="ijobGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366F1" />
                    <stop offset="0.5" stopColor="#4C1D95" />
                    <stop offset="1" stopColor="#2E1065" />
                </linearGradient>
                <linearGradient id="ijobGreen" x1="14" y1="2" x2="22" y2="10" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10B981" />
                    <stop offset="1" stopColor="#059669" />
                </linearGradient>
            </defs>
            {/* Sleek Briefcase Handle */}
            <path d="M8.5 5.5V3.5C8.5 2.7 9.2 2 10 2H14C14.8 2 15.5 2.7 15.5 3.5V5.5" stroke="url(#ijobGrad)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Main Briefcase Body with Curved Corners */}
            <rect x="2.5" y="5.5" width="19" height="14.5" rx="3.2" fill="url(#ijobGrad)" stroke="#3B0764" strokeWidth="0.8" />
            {/* Stylized Leather Contrast Flap */}
            <path d="M2.5 11C2.5 11 7 12.8 12 12.8C17 12.8 21.5 11 21.5 11" stroke="white" strokeWidth="1.1" strokeOpacity="0.35" />
            {/* Metallic Clasp */}
            <rect x="10.2" y="10.8" width="3.6" height="2.8" rx="0.8" fill="#F8FAFC" stroke="#C084FC" strokeWidth="0.6" />
            {/* Career Surge Growth Badge with Rising Arrow */}
            <circle cx="18.5" cy="5.5" r="4.2" fill="url(#ijobGreen)" stroke="white" strokeWidth="1.2" />
            <path d="M16.8 7.2L20.2 3.8M20.2 3.8H17.8M20.2 3.8V6.2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const InnovativeCoursesIcon = ({ className = "w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="icourseGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#4C1D95" />
                </linearGradient>
                <linearGradient id="icourseGold" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDE047" />
                    <stop offset="1" stopColor="#F59E0B" />
                </linearGradient>
            </defs>
            {/* Open Digital Knowledge Book / Interactive Wings */}
            <path d="M12 6.5C10 5.2 6.5 5 2.5 5.5V18.5C6.5 18 10 18.2 12 19.5C14 18.2 17.5 18 21.5 18.5V5.5C17.5 5 14 5.2 12 6.5Z" fill="url(#icourseGrad)" stroke="#3B0764" strokeWidth="0.8" strokeLinejoin="round" />
            {/* Translucent Pages Effect */}
            <path d="M12 6.5C10 5.2 6.5 5 2.5 5.5V16C6.5 15.5 10 15.8 12 17" fill="white" fillOpacity="0.25" />
            <path d="M12 6.5C14 5.2 17.5 5 21.5 5.5V16C17.5 15.5 14 15.8 12 17" fill="white" fillOpacity="0.18" />
            {/* Spine Divider Line */}
            <line x1="12" y1="6.5" x2="12" y2="19.5" stroke="#DDD6FE" strokeWidth="1.2" strokeLinecap="round" />
            {/* Rising Interactive Learning Play / Discovery Chevron */}
            <circle cx="12" cy="3.5" r="2.8" fill="url(#icourseGold)" stroke="white" strokeWidth="0.8" />
            <path d="M11.2 2.2L13.4 3.5L11.2 4.8Z" fill="#7C2D12" />
        </svg>
    );

    const InnovativeCertificationsIcon = ({ className = "w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="icertGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#9333EA" />
                    <stop offset="1" stopColor="#581C87" />
                </linearGradient>
                <linearGradient id="icertGold" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FBBF24" />
                    <stop offset="1" stopColor="#D97706" />
                </linearGradient>
            </defs>
            {/* Dual Flowing Purple Ribbon Tails */}
            <path d="M8 15L6.5 22L12 19.2L17.5 22L16 15" fill="#E9D5FF" stroke="#4C1D95" strokeWidth="1" strokeLinejoin="round" />
            <path d="M12 19.2L17.5 22L16 15" fill="#DDD6FE" />
            {/* Verified Rosette Outer Scalloped Badge */}
            <circle cx="12" cy="9.5" r="7.6" fill="url(#icertGrad)" stroke="#4C1D95" strokeWidth="0.8" />
            <circle cx="12" cy="9.5" r="6" stroke="white" strokeWidth="0.7" strokeOpacity="0.4" strokeDasharray="2 1.2" />
            {/* Verified Bold Checkmark */}
            <path d="M9 9.8L11.1 11.9L15.2 7.8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            {/* Top Golden Crown Sparkle */}
            <path d="M12 0.8L12.5 1.8L13.5 2.3L12.5 2.8L12 3.8L11.5 2.8L10.5 2.3L11.5 1.8L12 0.8Z" fill="url(#icertGold)" />
        </svg>
    );

    // 5 Interactive Constellation Nodes with exact reference icons and labels (no icon background)
    const constellationNodes = [
        {
            id: 'students',
            label: 'Students',
            icon: <InnovativeStudentsIcon />,
            image: studentImg,
            posClass: 'left-[14%] top-[7%]',
            floatAnim: { y: [-5, 5, -5], x: [-2, 2, -2] },
            floatDuration: 4.6,
            floatDelay: 0
        },
        {
            id: 'universities',
            label: 'Universities',
            icon: <InnovativeUniversitiesIcon />,
            image: universityImg,
            posClass: 'right-[13%] top-[7%]',
            floatAnim: { y: [5, -5, 5], x: [2, -2, 2] },
            floatDuration: 5.2,
            floatDelay: 0.4
        },
        {
            id: 'jobs',
            label: 'Jobs',
            icon: <InnovativeJobsIcon />,
            image: jobsImg,
            posClass: 'right-[3%] top-[41%]',
            floatAnim: { y: [-5, 5, -5], x: [2, -2, 2] },
            floatDuration: 4.2,
            floatDelay: 0.8
        },
        {
            id: 'courses',
            label: 'Courses',
            icon: <InnovativeCoursesIcon />,
            image: coursesImg,
            posClass: 'left-[37%] bottom-[3%]',
            floatAnim: { y: [5, -5, 5], x: [-2, 2, -2] },
            floatDuration: 4.8,
            floatDelay: 1.2
        },
        {
            id: 'certifications',
            label: 'Certifications',
            icon: <InnovativeCertificationsIcon />,
            image: certsImg,
            posClass: '-left-[3.5%] sm:-left-[4.5%] md:-left-[5%] top-[41%]',
            floatAnim: { y: [-4, 4, -4], x: [-1, 1, -1] },
            floatDuration: 4.4,
            floatDelay: 1.6
        }
    ];

    return (
        <section className="relative w-full max-w-full overflow-hidden min-h-[100dvh] h-auto lg:h-[calc(100vh-64px)] lg:min-h-[630px] lg:max-h-[780px] xl:max-h-[810px] flex flex-col justify-between bg-gradient-to-b from-[#FAF8FE] via-[#FFFFFF] to-[#FFFFFF] dark:from-[#090514] dark:via-[#0F0822] dark:to-[#140B2D] pt-14 sm:pt-16 lg:pt-2.5 pb-0">
            {/* Keyframe styles for hero bubbles */}
            <style dangerouslySetInnerHTML={{ __html: HERO_BUBBLE_CSS }} />

            {/* Kinetic Energy Ribbon System (Right Edge Background) */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                <AlyraOrb />
            </div>
            
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-1/4 -left-20 w-[260px] sm:w-[440px] h-[260px] sm:h-[440px] bg-purple-300/25 dark:bg-purple-600/15 rounded-full blur-[70px] sm:blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 -right-20 sm:right-1/4 w-[240px] sm:w-[400px] h-[240px] sm:h-[400px] bg-indigo-200/25 dark:bg-indigo-600/10 rounded-full blur-[70px] sm:blur-[100px] pointer-events-none" />

            {/* Main Hero Container */}
            <div className="flex-1 flex flex-col justify-center items-start lg:items-center lg:justify-between max-w-7xl mx-auto px-5 sm:px-8 lg:px-8 w-full relative z-20 min-h-0 overflow-hidden py-1 sm:py-2 lg:py-2">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center my-auto">

                    {/* ── LEFT COLUMN: CONSTELLATION NETWORK DIAGRAM (Hidden on mobile responsive, visible on desktop) ── */}
                    <div className="hidden lg:flex lg:col-span-5 items-center justify-center relative select-none">
                        <div className="w-[290px] sm:w-[355px] md:w-[380px] lg:w-[395px] xl:w-[410px] aspect-square relative flex items-center justify-center shrink-0">
                            {/* Very Thin, Standard Purple Connection Arc Lines & Moving Purple Dots */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 100">
                                {/* Delicate Central Orbit Track */}
                                <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(147, 51, 234, 0.4)" strokeWidth="0.22" strokeDasharray="1.0 1.2" shapeRendering="geometricPrecision" />

                                {/* 1. SkillDad <-> Students Straight Connection Line */}
                                <line
                                    x1="41.5" y1="41.5" x2="29.1" y2="29.1"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.25"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* 2. SkillDad <-> Universities Straight Connection Line */}
                                <line
                                    x1="58.5" y1="41.5" x2="70.9" y2="29.1"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.25"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* 3. SkillDad <-> Jobs Straight Connection Line */}
                                <line
                                    x1="62.0" y1="50.0" x2="79.5" y2="50.0"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.25"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* 4. SkillDad <-> Certifications Straight Connection Line */}
                                <line
                                    x1="38.0" y1="50.0" x2="23.0" y2="50.0"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.25"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* 5. SkillDad <-> Courses Straight Connection Line */}
                                <line
                                    x1="50.0" y1="62.0" x2="50.0" y2="79.5"
                                    stroke="rgba(147, 51, 234, 0.55)"
                                    strokeWidth="0.25"
                                    strokeDasharray="1.0 1.2"
                                    strokeLinecap="round"
                                    shapeRendering="geometricPrecision"
                                />

                                {/* Outer Perimeter Straight Lines connecting adjacent nodes */}
                                <line x1="29.1" y1="29.1" x2="70.9" y2="29.1" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.2 1.5" shapeRendering="geometricPrecision" />
                                <line x1="70.9" y1="29.1" x2="79.5" y2="50.0" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.2 1.5" shapeRendering="geometricPrecision" />
                                <line x1="79.5" y1="50.0" x2="50.0" y2="79.5" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.2 1.5" shapeRendering="geometricPrecision" />
                                <line x1="50.0" y1="79.5" x2="23.0" y2="50.0" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.2 1.5" shapeRendering="geometricPrecision" />
                                <line x1="23.0" y1="50.0" x2="29.1" y2="29.1" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="0.2" strokeDasharray="1.2 1.5" shapeRendering="geometricPrecision" />

                                {/* One Moving Dot on Every Spoke Connection Line */}
                                <circle r="0.55" fill="#7C3AED">
                                    <animateMotion path="M 41.5 41.5 L 29.1 29.1" dur="3.2s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.55" fill="#7C3AED">
                                    <animateMotion path="M 58.5 41.5 L 70.9 29.1" dur="3.4s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.55" fill="#7C3AED">
                                    <animateMotion path="M 62.0 50.0 L 79.5 50.0" dur="3.1s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.55" fill="#7C3AED">
                                    <animateMotion path="M 38.0 50.0 L 23.0 50.0" dur="3.3s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.55" fill="#7C3AED">
                                    <animateMotion path="M 50.0 62.0 L 50.0 79.5" dur="3.2s" repeatCount="indefinite" />
                                </circle>

                                {/* One Moving Dot on Every Perimeter Connection Line */}
                                <circle r="0.48" fill="#9333EA">
                                    <animateMotion path="M 29.1 29.1 L 70.9 29.1" dur="5.0s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.48" fill="#9333EA">
                                    <animateMotion path="M 70.9 29.1 L 79.5 50.0" dur="4.6s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.48" fill="#9333EA">
                                    <animateMotion path="M 79.5 50.0 L 50.0 79.5" dur="4.8s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.48" fill="#9333EA">
                                    <animateMotion path="M 50.0 79.5 L 23.0 50.0" dur="5.1s" repeatCount="indefinite" />
                                </circle>
                                <circle r="0.48" fill="#9333EA">
                                    <animateMotion path="M 23.0 50.0 L 29.1 29.1" dur="4.7s" repeatCount="indefinite" />
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
                    <div className="w-full lg:col-span-7 flex flex-col items-start text-left pl-0 sm:pl-2 lg:pl-2 xl:pl-4 z-20 my-auto py-0 max-w-xl lg:max-w-none">
                        
                        {/* Eyebrow matching Reference */}
                        <div className="flex items-center gap-2 mb-1.5 sm:mb-2.5">
                            <span className="w-5 h-[2px] bg-[#6D28D9] rounded-full inline-block" />
                            <span className="text-[10px] sm:text-[11.5px] font-bold uppercase tracking-[0.2em] text-[#6D28D9] dark:text-purple-400">
                                YOUR GATEWAY TO A BRIGHTER FUTURE
                            </span>
                        </div>

                        {/* Heading: "Confusion to Career" */}
                        <h1 className="text-[36px] sm:text-[44px] md:text-[52px] lg:text-[54px] xl:text-[62px] 2xl:text-[68px] font-black tracking-tight leading-[1.06] font-sans">
                            <span className="text-[#0F172A] dark:text-white block">
                                Confusion to
                            </span>
                            <span className="text-[#4C1D95] dark:text-purple-300 block">
                                Career
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xs sm:text-sm md:text-[13.5px] text-slate-600 dark:text-purple-200/80 leading-relaxed font-normal max-w-sm sm:max-w-lg mt-1.5 sm:mt-2.5 mb-3 sm:mb-4">
                            A collaborative venture initiated by IITians and leading job providers in India, in partnership with reputed universities across the world.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
                            <button
                                onClick={() => navigate(user ? getDashboardLink() : '/register')}
                                className="px-4.5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#4C1D95] hover:bg-[#3B1578] text-white text-xs sm:text-sm font-semibold shadow-[0_10px_25px_-5px_rgba(76,29,149,0.5)] hover:shadow-[0_16px_32px_-5px_rgba(76,29,149,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 group cursor-pointer shrink-0"
                            >
                                <span>{user ? 'Go to Dashboard' : 'Start Learning Today'}</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            {!user && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-4.5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/90 dark:bg-purple-950/60 hover:bg-purple-50/90 dark:hover:bg-purple-900/60 text-[#4C1D95] dark:text-purple-300 border border-purple-200/90 dark:border-purple-800/60 text-xs sm:text-sm font-semibold shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                                >
                                    Login Now
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* ── RIGHT EDGE: FLOATING COURSE POP BUBBLES ── */}
            <CourseBubbles texts={bubbleTexts} />

            {/* ── BOTTOM ROW: PREMIUM "TRUSTED BY LEADING UNIVERSITIES & PARTNERS" STRIP (REAL DATA) ── */}
            <div className="w-full max-w-full relative z-20 bg-gradient-to-b from-[#ECE4FA] via-[#E8DEFA] to-[#E4D8F8] dark:from-[#140A26] dark:via-[#160D2C] dark:to-[#1B1034] pt-1 sm:pt-1.5 pb-1.5 sm:pb-2.5 transition-colors shrink-0">
                
                {/* Soft Lavender Curved Wave Background Transition from Hero */}
                <div className="absolute -top-3.5 sm:-top-5 md:-top-7 lg:-top-8 left-0 w-full overflow-hidden leading-none pointer-events-none z-10">
                    <svg
                        className="relative block w-full h-3.5 sm:h-5 md:h-7 lg:h-8"
                        viewBox="0 0 1440 60"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M 0 28 C 220 10 440 45 720 40 C 1000 35 1220 10 1440 26 L 1440 62 L 0 62 Z"
                            fill="#ECE4FA"
                            className="dark:fill-[#140A26] transition-colors"
                        />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                    
                    {/* Centered Small Uppercase Label with Thin Purple Dividers */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3.5 md:gap-4.5 mb-1 sm:mb-1.5 px-2">
                        <div className="w-6 sm:w-16 md:w-24 h-[1px] bg-purple-400/80 dark:bg-purple-700/80" />
                        <span className="text-[9px] sm:text-[10.5px] md:text-[11.5px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#5B21B6] dark:text-purple-300 select-none whitespace-nowrap">
                            TRUSTED BY LEADING UNIVERSITIES & PARTNERS
                        </span>
                        <div className="w-6 sm:w-16 md:w-24 h-[1px] bg-purple-400/80 dark:bg-purple-700/80" />
                    </div>

                    {/* Mobile Marquee: Infinite Continuous Smooth Scrolling Ticker so All Real Partners Flow Fluidly */}
                    {/* Mobile Marquee: Infinite Continuous Smooth Scrolling Ticker with Uniform Logo Slots */}
                    <div className="sm:hidden relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] py-0.5">
                        <div className="flex w-max items-center gap-4 animate-hero-marquee will-change-transform">
                            {[...partnersList, ...partnersList].map((partner, idx) => {
                                const logoSrc = partner.logo?.startsWith('http') ? partner.logo : getMediaUrl(partner.logo);
                                return (
                                    <div
                                        key={`m-${partner.id || partner.name}-${idx}`}
                                        className="w-24 h-8 flex items-center justify-center shrink-0 opacity-90 px-1"
                                        title={partner.name}
                                    >
                                        <img
                                            src={logoSrc}
                                            alt={partner.name}
                                            className="max-h-6.5 max-w-[85%] w-auto h-auto object-contain select-none mix-blend-multiply dark:mix-blend-screen brightness-90 contrast-125 dark:brightness-150"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop / Tablet: Centered Real Partner Batch Rotation with Uniform Equal-Sized Logo Slots */}
                    <div
                        className="hidden sm:flex relative min-h-[44px] md:min-h-[48px] items-center justify-center w-full px-2"
                        onMouseEnter={() => setIsPartnerHovered(true)}
                        onMouseLeave={() => setIsPartnerHovered(false)}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={partnerBatchIndex}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 w-full py-0.5"
                            >
                                {partnerBatches[partnerBatchIndex]?.map((partner, idx) => {
                                    const logoSrc = partner.logo?.startsWith('http') ? partner.logo : getMediaUrl(partner.logo);
                                    return (
                                        <div
                                            key={partner.id || partner.name || idx}
                                            className="w-28 sm:w-32 md:w-36 lg:w-40 h-10 sm:h-11 md:h-12 flex items-center justify-center cursor-default shrink-0 opacity-85 hover:opacity-100 transition-all duration-200 hover:scale-105"
                                            title={partner.name}
                                        >
                                            <img
                                                src={logoSrc}
                                                alt={partner.name}
                                                className="max-h-7.5 sm:max-h-8.5 md:max-h-9 max-w-[85%] w-auto h-auto object-contain select-none mix-blend-multiply dark:mix-blend-screen brightness-90 contrast-125 dark:brightness-150"
                                            />
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>

        </section>
    );
};

export default HeroSection;
