import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Landmark, Sparkles, BookOpen, Handshake, Bot, Award, Briefcase, GraduationCap } from 'lucide-react';
import AlyraOrb from './AlyraOrb';
import { useUser } from '../../context/UserContext';
import { getMediaUrl } from '../../utils/media';
import skilldadLogo from '../../assets/logo.png';
import { getMergedDiagramNodes, DIAGRAM_ICON_MAP } from '../../utils/networkDiagramConfig';



/* ─── Performance CSS ─── */
const HERO_CSS = `
@keyframes hero-node-pulse {
    0%, 100% { transform: scale(1); opacity: 0.15; }
    50% { transform: scale(1.3); opacity: 0.45; }
}
@keyframes hero-node-core-glow {
    0%, 100% { filter: drop-shadow(0 0 4px rgba(192,38,255,0.4)); }
    50% { filter: drop-shadow(0 0 12px rgba(192,38,255,0.7)); }
}
@keyframes hero-node-white-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.9; }
}
@keyframes hero-dot-travel {
    0% { offset-distance: 0%; opacity: 0; }
    5% { opacity: 1; }
    90% { opacity: 1; }
    100% { offset-distance: 100%; opacity: 0; }
}
@keyframes hero-text-gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
@keyframes hero-diagram-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-18px); }
}
@keyframes hero-brand-blink {
    0%, 100% { 
        filter: drop-shadow(0 0 15px rgba(192, 38, 255, 0.8));
    }
    50% { 
        filter: drop-shadow(0 0 30px rgba(37, 99, 235, 0.9));
    }
}
@keyframes hero-brand-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
/* Rises with a gentle sideways wobble rather than a straight line -
   --drift-x (positive, set per-bubble) controls how wide the sway is.
   All multipliers stay positive so the bubble only ever sways further
   right (deeper into its own right-side lane) and never swings back
   toward the page's center. */
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
/* The shell itself vanishes right at the pop point - it's the droplets
   (hero-shard-*) that linger and drift slowly afterward, not the bubble. */
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
/* Network diagram node labels: crisp glow in dark mode, high contrast deep purple in light mode */
.hero-diagram-node-label {
    fill: #e9d5ff;
    font-weight: 700;
    filter: drop-shadow(0 0 6px rgba(192, 38, 255, 0.7));
    transition: fill 0.25s ease, filter 0.25s ease;
    user-select: none;
}

html.light-mode .hero-diagram-node-label,
.light-mode .hero-diagram-node-label,
.light .hero-diagram-node-label,
[data-theme="light"] .hero-diagram-node-label {
    fill: #3b0764 !important;
    font-weight: 800 !important;
    letter-spacing: 0.08em !important;
    filter: drop-shadow(0 1px 3px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 2px #ffffff) !important;
}
`;

/* ─── Floating course bubbles (right side) ───────────────────────
   Two kinds: "convert" bubbles rise then morph in place into a
   course-name pill (crossfading with the bubble at a per-item pop
   height - 'mid' or 'high' - so labels don't all stack at one spot);
   "plain" bubbles never convert, they just keep rising off the top. */
const bubbleVisualStyle = {
    background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85), rgba(192,38,255,0.35) 55%, rgba(76,29,149,0.25) 100%)',
    border: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 0 16px rgba(192,38,255,0.35)'
};

const PLAIN_BUBBLES = [
    { id: 'p1', left: 10, size: 18, duration: 9, delay: 0.8, drift: 45 },
    { id: 'p2', left: 60, size: 14, duration: 10.5, delay: 4.5, drift: 55 },
];

// No hardcoded label here - what each bubble displays when it pops comes
// from the admin-configured list (Admin > Site Content > Landing Page
// Controls > Hero Bubble Pop-up Text), cycled across these slots below.
const CONVERT_BUBBLES = [
    { id: 'c1', left: 20, size: 28, duration: 9, delay: 0, pop: 'mid', drift: 50 },
    { id: 'c2', left: 55, size: 24, duration: 10, delay: 4.5, pop: 'high', drift: 40 },
    { id: 'c3', left: 78, size: 22, duration: 8.5, delay: 8, pop: 'mid', drift: 45 },
];

// 6 droplets bursting outward in a ring when a bubble cracks, angle offset
// per-bubble so they don't all shatter in the exact same pattern.
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
    const hasTexts = Array.isArray(texts) && texts.length > 0;

    return (
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[42%] lg:w-[38%] z-[16] pointer-events-none select-none overflow-hidden">
            {/* Plain bubbles - rise and drift off the top, never convert */}
            {PLAIN_BUBBLES.map((b) => (
                <div
                    key={b.id}
                    className="absolute bottom-0 rounded-full"
                    style={{
                        left: `${b.left}%`,
                        width: b.size, height: b.size,
                        ...bubbleVisualStyle,
                        '--drift-x': `${b.drift}px`,
                        animation: `hero-bubble-float ${b.duration}s ease-in-out infinite`,
                        animationDelay: `${b.delay}s`,
                        animationFillMode: 'backwards'
                    }}
                />
            ))}

            {/* Convert bubbles - rise, then morph into admin-configured text.
                Until an admin adds any text (Site Content > Landing Page
                Controls), these just behave as plain rising bubbles too. */}
            {CONVERT_BUBBLES.map((b, i) => {
                if (!hasTexts) {
                    return (
                        <div
                            key={b.id}
                            className="absolute bottom-0 rounded-full"
                            style={{
                                left: `${b.left}%`,
                                width: b.size, height: b.size,
                                ...bubbleVisualStyle,
                                '--drift-x': `${b.drift}px`,
                                animation: `hero-bubble-float ${b.duration}s ease-in-out infinite`,
                                animationDelay: `${b.delay}s`,
                                animationFillMode: 'backwards'
                            }}
                        />
                    );
                }

                const label = texts[i % texts.length];
                return (
                    <div
                        key={b.id}
                        className="absolute bottom-0"
                        style={{
                            left: `${b.left}%`,
                            width: b.size, height: b.size,
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
                                        width: Math.max(4, b.size * 0.22), height: Math.max(4, b.size * 0.22),
                                        ...bubbleVisualStyle,
                                        '--dx': `${s.dx}px`, '--dy': `${s.dy}px`, '--rot': `${s.rot}deg`,
                                        animation: `hero-shard-${b.pop} ${b.duration}s ease-out infinite`,
                                        animationDelay: `${b.delay}s`,
                                        animationFillMode: 'backwards'
                                    }}
                                />
                            ))}
                            <div
                                className="absolute top-1/2 left-1/2 whitespace-nowrap px-2 py-1 text-[11px] sm:text-xs font-extrabold tracking-wide text-white bg-transparent"
                                style={{
                                    textShadow: '0 2px 10px rgba(0,0,0,0.5), 0 0 18px rgba(192,38,255,0.65)',
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

/* ─── Node / Edge data ───────────────────────────────────────── */
const edges = [
    ['root', 'courses'],
    ['root', 'university'],
    ['root', 'partner'],
    ['root', 'ai'],
    ['courses', 'cert'],
    ['university', 'cert'],
    ['partner', 'job'],
    ['ai', 'student'],
    ['cert', 'student'],
    ['job', 'student'],
];

/* ─── SVG sub-components (Optimised with CSS) ───────────────── */
const DiagramEdge = ({ from, to, index, nodeMap }) => {
    const a = nodeMap[from];
    const b = nodeMap[to];
    if (!a || !b) return null;
    return (
        <motion.line
            id={`edge-${from}-${to}`}
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.4, pathLength: 1 }}
            transition={{ duration: 3, delay: 1 + index * 0.2, ease: "easeInOut" }}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="#C026FF"
            strokeWidth="0.8"
            strokeDasharray="4 4"
            style={{ willChange: 'opacity' }}
        />
    );
};

const DiagramNode = ({ node, index }) => {
    // Resolve image URL if string or asset
    const rawImage = node.image;
    const resolvedImage = rawImage
        ? (typeof rawImage === 'string' && (rawImage.startsWith('http') || rawImage.startsWith('data:') || rawImage.startsWith('/assets') || rawImage.startsWith('/src'))
            ? rawImage
            : getMediaUrl(rawImage))
        : null;

    const IconComponent = node.icon || Sparkles;

    return (
        <motion.g
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 2.5,
                delay: node.delay * 1.5,
                ease: [0.34, 1.56, 0.64, 1] // Slight overshoot for elegant "pop"
            }}
            style={{ willChange: 'transform, opacity' }}
        >
            {/* Highlight ring - only root/highlighted node gets wider pulse ring */}
            {node.highlight && (
                <circle
                    cx={node.x} cy={node.y} r={node.r + 15}
                    fill="none" stroke="#C026FF" strokeWidth="0.8"
                    style={{
                        transformOrigin: `${node.x}px ${node.y}px`,
                        animation: `hero-node-pulse ${3.2}s ease-in-out infinite`,
                        animationDelay: `${node.delay + 0.4}s`
                    }}
                />
            )}
            {/* Outer pulse ring */}
            <circle
                cx={node.x} cy={node.y} r={node.r + 9}
                fill="none" stroke="#C026FF" strokeWidth="0.6"
                style={{
                    transformOrigin: `${node.x}px ${node.y}px`,
                    animation: `hero-node-pulse ${2.5 + index * 0.3}s ease-in-out infinite`,
                    animationDelay: `${node.delay + 0.8}s`
                }}
            />
            {/* Core */}
            <circle
                cx={node.x} cy={node.y} r={node.r}
                fill={resolvedImage ? (node.imageBg || '#ffffff') : 'url(#nGrad)'}
                stroke="#9333EA"
                strokeWidth={node.highlight ? 2.25 : 1.5}
                style={{
                    animation: `hero-node-core-glow 3s ease-in-out infinite ${node.delay}s`,
                    filter: node.highlight ? 'drop-shadow(0 0 10px rgba(192,38,255,0.55))' : undefined
                }}
            />
            {/* Real image when available, otherwise the lucide icon fallback */}
            <foreignObject
                x={node.x - node.r * (resolvedImage ? 0.78 : 0.62)} y={node.y - node.r * (resolvedImage ? 0.78 : 0.62)}
                width={node.r * (resolvedImage ? 1.56 : 1.24)} height={node.r * (resolvedImage ? 1.56 : 1.24)}
                style={{
                    animation: `hero-node-white-pulse 2s ease-in-out infinite ${node.delay}s`
                }}
            >
                <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '50%' }}
                >
                    {resolvedImage ? (
                        <img
                            src={resolvedImage}
                            alt={node.label}
                            style={{ width: '100%', height: '100%', objectFit: node.imageFit || 'cover' }}
                        />
                    ) : (
                        <IconComponent size={node.r * 1.15} color="#fff" strokeWidth={2.25} />
                    )}
                </div>
            </foreignObject>
            {/* Label - visible in both light mode and dark mode */}
            <text
                x={node.x} y={node.y + node.r + 14}
                textAnchor="middle"
                className="hero-diagram-node-label"
                fontSize="9.5"
                fontFamily="Inter, sans-serif"
                fontWeight="700"
                letterSpacing="0.06em"
            >
                {node.label}
            </text>
        </motion.g>
    );
};

const TravelDot = ({ from, to, delay, nodeMap }) => {
    const a = nodeMap[from];
    const b = nodeMap[to];
    if (!a || !b) return null;
    // Create a path for the dot to follow - browsers support motion-path/offset-path now
    const path = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    return (
        <circle
            r={2.5}
            fill="#C026FF"
            style={{
                filter: 'drop-shadow(0 0 4px #C026FF)',
                offsetPath: `path('${path}')`,
                animation: `hero-dot-travel 2s infinite linear`,
                animationDelay: `${delay}s`,
                willChange: 'offset-distance, opacity'
            }}
        />
    );
};

const NetworkDiagram = ({ customNodesConfig }) => {
    const currentNodes = React.useMemo(() => {
        return getMergedDiagramNodes(customNodesConfig);
    }, [customNodesConfig]);

    const activeNodeMap = React.useMemo(() => {
        return Object.fromEntries(currentNodes.map(n => [n.id, n]));
    }, [currentNodes]);

    return (
        <div
            className="absolute -left-28 sm:-left-10 lg:left-0 top-[40%] sm:top-[36%] md:top-[34%] -translate-y-1/2 z-[15] pointer-events-none select-none scale-40 sm:scale-50 md:scale-75 xl:scale-100 origin-left opacity-10 sm:opacity-25 md:opacity-80 lg:opacity-100"
            style={{ width: 420, height: 500 }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    animation: 'hero-diagram-float 20s ease-in-out infinite'
                }}
            >
                <svg viewBox="-10 40 420 480" width="420" height="480" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="nGrad" cx="38%" cy="32%" r="65%">
                            <stop offset="0%" stopColor="#C026FF" />
                            <stop offset="100%" stopColor="#4C1D95" />
                        </radialGradient>
                    </defs>

                    {/* Edges */}
                    {edges.map(([from, to], i) => (
                        <DiagramEdge key={`${from}-${to}`} from={from} to={to} index={i} nodeMap={activeNodeMap} />
                    ))}

                    {/* Travel dots */}
                    {[
                        { from: 'root', to: 'courses', delay: 1.0 },
                        { from: 'root', to: 'university', delay: 1.8 },
                        { from: 'root', to: 'partner', delay: 2.5 },
                        { from: 'courses', to: 'cert', delay: 3.2 },
                        { from: 'partner', to: 'job', delay: 3.8 },
                        { from: 'cert', to: 'student', delay: 4.5 },
                    ].map((t, i) => (
                        <TravelDot key={i} {...t} nodeMap={activeNodeMap} />
                    ))}

                    {/* Nodes on top */}
                    {currentNodes.map((node, i) => (
                        <DiagramNode key={node.id} node={node} index={i} />
                    ))}
                </svg>
            </div>

            {/* Fade right edge to blend into hero */}
            <div
                className="absolute inset-y-0 right-0 w-20 pointer-events-none"
                style={{ background: 'linear-gradient(to right, transparent, #000)' }}
            />
        </div>
    );
};

/* ─── HeroSection ────────────────────────────────────────────── */
const HeroSection = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    const getDashboardLink = () => {
        if (!user) return '/login';
        if (user.role === 'admin') return '/admin';
        if (user.role === 'university') return '/university/dashboard';
        if (user.role === 'instructor') return '/instructor-dashboard';
        return '/dashboard';
    };

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.classList.contains('light-mode') ? 'light' : 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Universities and companies together in one ticker (previously two
    // separate lists/sections) - each entry keeps its type so the fallback
    // icon (when there's no logo image) matches university vs company.
    const [partners, setPartners] = React.useState([
        { name: "Oxford Digital", type: 'university', logo: null },
        { name: "MIT Horizon", type: 'university', logo: null },
        { name: "Stanford Online", type: 'university', logo: null },
        { name: "ETH Zurich", type: 'university', logo: null },
        { name: "Google", type: 'corporate', logo: null },
        { name: "Microsoft", type: 'corporate', logo: null },
        { name: "Amazon", type: 'corporate', logo: null },
        { name: "IBM", type: 'corporate', logo: null }
    ]);

    React.useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await fetch('/api/public/partner-logos');
                const data = await response.json();
                if (data && data.length > 0) {
                    const combined = data
                        .filter(logo => logo.type === 'university' || logo.type === 'corporate')
                        .map(logo => ({ name: logo.name, type: logo.type, logo: logo.logo || logo.imageUrl || null }));
                    if (combined.length > 0) {
                        setPartners(combined);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch partner logos:', error);
            }
        };
        fetchPartners();
    }, []);

    // Admin-configured text shown when a hero bubble pops (Admin > Site
    // Content > Landing Page Controls > Hero Bubble Pop-up Text). Empty
    // until an admin adds entries - bubbles just rise as plain bubbles then.
    // Admin-configured CMS data for landing page: hero bubble pop-ups and network diagram nodes
    const [bubbleTexts, setBubbleTexts] = useState([]);
    const [networkDiagramNodes, setNetworkDiagramNodes] = useState(null);

    useEffect(() => {
        const fetchLandingCms = async () => {
            try {
                const response = await fetch('/api/public/cms/landing_page');
                const data = await response.json();
                const items = data?.hero_bubbles?.items;
                if (Array.isArray(items) && items.length > 0) {
                    setBubbleTexts(items.map(i => i.text).filter(Boolean));
                }
                if (data?.network_diagram?.nodes) {
                    setNetworkDiagramNodes(data.network_diagram.nodes);
                }
            } catch (error) {
                console.error('Failed to fetch landing CMS data:', error);
            }
        };
        fetchLandingCms();
    }, []);

    return (
        <section className="relative min-h-[100dvh] md:min-h-[100vh] flex flex-col md:flex-row justify-center md:items-center overflow-hidden bg-transparent">
            <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />

            <div className="absolute inset-0 z-0 gpu-accelerated">
                <AlyraOrb />
            </div>

            {/* Mobile-only fade for the ribbon animation at the bottom of the hero */}
            <div className={`md:hidden absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t ${theme === 'dark' ? 'from-black' : 'from-[#FAF9F6]'} to-transparent z-[1] pointer-events-none`} />

            {/* Purple Network Diagram - left */}
            <div className="gpu-accelerated">
                <NetworkDiagram customNodesConfig={networkDiagramNodes} />
            </div>

            {/* Floating course bubbles - right */}
            <CourseBubbles texts={bubbleTexts} />

            {/* Hero Content */}
            <div className="max-w-[1400px] pb-16 h-auto md:h-full mx-auto px-0 sm:px-6 lg:px-12 w-full relative z-[20]">
                <div className="max-w-[900px] h-auto md:h-full pt-[100px]  md:pb-[100px] md:pt-[120px] md:pb-[120px] md:py-28 text-left md:text-center mx-auto flex flex-col items-start md:items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="w-full h-auto md:h-full flex flex-col items-start md:items-center"
                    >


                        {/* Main Heading */}
                        <div
                            role="heading"
                            aria-level="1"
                            className="text-[36px] xs:text-[42px] sm:text-[50px] md:text-[58px] lg:text-[70px] font-black leading-[1.1] tracking-tight mb-4 font-jakarta px-4 sm:px-0 text-left md:text-center"
                        >
                            <span
                                className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary"
                                style={{
                                    backgroundSize: '200% auto',
                                    animation: 'hero-text-gradient 5s linear infinite'
                                }}
                            >
                                Placement-Assured Courses
                            </span>
                        </div>

                        {/* Subtitle */}
                        <p className="text-[14.5px] sm:text-xl text-text-secondary mb-8 max-w-[280px] xs:max-w-[320px] sm:max-w-3xl font-inter leading-[1.6] px-4 sm:px-0 text-left md:text-center mx-0 md:mx-auto">
                            A collaborative venture initiated by <span className="text-primary font-semibold">IITians</span> and leading job providers in India, in partnership with reputed universities across the world.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start md:justify-center gap-3 w-full sm:max-w-none mb-12 md:mb-0 px-4 sm:px-0">
                            <button
                                onClick={() => navigate(user ? getDashboardLink() : '/register')}
                                className="relative w-[80%] max-w-[260px] sm:max-w-none sm:w-auto px-6 md:px-10 py-3 md:py-4 rounded-full bg-primary text-white font-inter font-normal text-[14px] transition-all flex items-center justify-center gap-2 group hover:shadow-glow-purple active:scale-95 shadow-xl before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.5)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms]"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {user ? 'Go to Dashboard' : 'Start Learning Today'}
                                    <ChevronRight
                                        className="group-hover:translate-x-2 transition-transform duration-[800ms] ease-in-out"
                                        size={18}
                                    />
                                </span>
                            </button>

                            {!user && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className={theme === 'dark'
                                        ? "w-[80%] max-w-[260px] sm:max-w-none sm:w-auto px-6 md:px-10 py-3 md:py-4 rounded-full border border-white/20 bg-transparent text-white font-inter font-normal text-[14px] transition-colors hover:border-white/40 hover:bg-white/5 active:scale-95"
                                        : "w-[80%] max-w-[260px] sm:max-w-none sm:w-auto px-6 md:px-10 py-3 md:py-4 rounded-full border border-primary/30 bg-linear-to-r from-primary/20 via-blue-500/20 to-primary/20 backdrop-blur-md text-black font-inter font-normal text-[14px] transition-colors hover:from-primary/40 hover:via-blue-500/40 hover:to-primary/40 hover:border-primary/50 shadow-[0_0_20px_rgba(110,40,255,0.3)] active:scale-95"
                                    }
                                >
                                    Login Now
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Universities & Companies Ticker (combined) */}
            <div className=" absolute bottom-0 w-full md:left-0 md:right-0 md:bottom-1 py-2 sm:py-5 overflow-hidden whitespace-nowrap z-[20] pointer-events-none sm:pointer-events-auto">
                <div className="md:hidden z-12 px-4 sm:px-6 mb-5 flex flex-col items-start">
                    <div className="w-10 h-[2px] bg-primary mb-2 opacity-70"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] font-inter">Trusted by leading universities & companies</span>
                </div>
                <div className="relative">
                    <div className="flex animate-scroll hover:pause-on-desktop will-change-transform" style={{ animationDuration: '260s' }}>
                        {[...partners, ...partners, ...partners].map((partner, i) => {
                            const hasRealLogo = !!partner.logo;
                            const isUniversity = partner.type?.toLowerCase() === 'university';
                            const avatarLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&size=64&background=6D28D9&color=fff&bold=true`;
                            const logoUrl = hasRealLogo
                                ? (partner.logo.startsWith('http') ? partner.logo : getMediaUrl(partner.logo))
                                : avatarLogo;
                            return (
                                <div key={i} className={`flex items-center transition-all hover:scale-105 cursor-default shrink-0 ${
                                    isUniversity ? 'mx-2 sm:mx-3 md:mx-4 gap-2 sm:gap-2.5' : 'mx-3 sm:mx-4 md:mx-5'
                                }`}>
                                    {hasRealLogo ? (
                                        <>
                                            <img
                                                src={logoUrl}
                                                alt={partner.name}
                                                className={
                                                    isUniversity
                                                        ? "h-6 sm:h-8 max-w-[90px] sm:max-w-[110px] object-contain opacity-85 hover:opacity-100 transition-opacity shrink-0"
                                                        : "h-8 sm:h-10 md:h-11 max-w-[150px] sm:max-w-[180px] md:max-w-[210px] object-contain opacity-90 hover:opacity-100 transition-all shrink-0"
                                                }
                                                onError={(e) => { e.target.onerror = null; e.target.src = avatarLogo; e.target.className = 'w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0'; }}
                                            />
                                            {isUniversity && (
                                                <span className={`text-xs sm:text-sm font-semibold normal-case tracking-normal whitespace-nowrap transition-colors font-inter ${theme === 'dark' ? 'text-white/85 hover:text-white' : 'text-slate-800 hover:text-black'}`}>
                                                    {partner.name}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {/* No logo uploaded for this partner yet - use a generated
                                                initials logo instead of a generic icon */}
                                            <img
                                                src={logoUrl}
                                                alt={partner.name}
                                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0"
                                            />
                                            <span className={`text-xs sm:text-sm font-medium normal-case tracking-normal whitespace-nowrap transition-colors font-inter ${theme === 'dark' ? 'text-white/65 hover:text-white/90' : 'text-black hover:text-black/80'}`}>{partner.name}</span>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>





            {/* Bottom transition gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
        </section>
    );
};

export default HeroSection;
