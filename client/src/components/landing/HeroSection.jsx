import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Landmark } from 'lucide-react';
import AlyraOrb from './AlyraOrb';
import { useUser } from '../../context/UserContext';



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
`;

/* ─── Node / Edge data ───────────────────────────────────────── */
const nodes = [
    { id: 'root', x: 160, y: 220, r: 20, label: 'SkillDad', delay: 0 },
    { id: 'courses', x: 55, y: 100, r: 13, label: 'Courses', delay: 0.3 },
    { id: 'university', x: 275, y: 80, r: 13, label: 'University', delay: 0.6 },
    { id: 'partner', x: 315, y: 245, r: 13, label: 'Partners', delay: 0.9 },
    { id: 'ai', x: 45, y: 335, r: 13, label: 'AI Engine', delay: 1.2 },
    { id: 'cert', x: 225, y: 385, r: 11, label: 'Certs', delay: 1.5 },
    { id: 'job', x: 350, y: 355, r: 11, label: 'Jobs', delay: 1.8 },
    { id: 'student', x: 130, y: 460, r: 11, label: 'Student', delay: 2.1 },
];

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

const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

/* ─── SVG sub-components (Optimised with CSS) ───────────────── */
const DiagramEdge = ({ from, to, index }) => {
    const a = nodeMap[from];
    const b = nodeMap[to];
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

const DiagramNode = ({ node, index }) => (
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
            fill="url(#nGrad)"
            stroke="#9333EA"
            strokeWidth="1.5"
            style={{
                animation: `hero-node-core-glow 3s ease-in-out infinite ${node.delay}s`
            }}
        />
        {/* Inner highlight */}
        <circle
            cx={node.x} cy={node.y} r={node.r * 0.28}
            fill="white"
            style={{
                animation: `hero-node-white-pulse 2s ease-in-out infinite ${node.delay}s`
            }}
        />
        {/* Label */}
        <text
            x={node.x} y={node.y + node.r + 14}
            textAnchor="middle"
            fill="rgba(210,180,255,0.7)"
            fontSize="9"
            fontFamily="Inter, sans-serif"
            fontWeight="700"
            letterSpacing="0.07em"
        >
            {node.label}
        </text>
    </motion.g>
);

const TravelDot = ({ from, to, delay }) => {
    const a = nodeMap[from];
    const b = nodeMap[to];
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

const NetworkDiagram = () => (
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
                    <DiagramEdge key={`${from}-${to}`} from={from} to={to} index={i} />
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
                    <TravelDot key={i} {...t} />
                ))}

                {/* Nodes on top */}
                {nodes.map((node, i) => (
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

/* ─── HeroSection ────────────────────────────────────────────── */
const HeroSection = () => {
    const navigate = useNavigate();
    const { user, getDashboardLink } = useUser();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.classList.contains('light-mode') ? 'light' : 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const [partners, setPartners] = React.useState([
        "Oxford Digital", "MIT Horizon", "Stanford Online", "ETH Zurich",
        "Berkeley Tech", "Cambridge AI", "Harvard Tech", "Yale AI"
    ]);

    React.useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await fetch('/api/public/partner-logos');
                const data = await response.json();
                if (data && data.length > 0) {
                    const universities = data.filter(logo => logo.type === 'university');
                    if (universities.length > 0) {
                        setPartners(universities.map(logo => logo.name));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch university partner logos:', error);
            }
        };
        fetchPartners();
    }, []);



    return (
        <section className="relative min-h-[800px] h-[100dvh] md:min-h-[100vh] flex items-start md:items-center overflow-hidden bg-transparent">
            <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />

            <div className="absolute inset-0 z-0 gpu-accelerated">
                <AlyraOrb />
            </div>

            {/* Purple Network Diagram - left */}
            <div className="gpu-accelerated">
                <NetworkDiagram />
            </div>

            {/* Hero Content */}
            <div className="max-w-[1400px] h-full mx-auto px-0 sm:px-6 lg:px-12 w-full relative z-[20]">
                <div className="max-w-[900px] h-full pt-[100px]  md:pb-[100px] md:pt-[120px] md:pb-[120px] md:py-28 text-left md:text-center mx-auto flex flex-col items-start md:items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="w-full h-full flex flex-col items-start md:items-center"
                    >


                        {/* Main Heading */}
                        <div
                            role="heading"
                            aria-level="1"
                            className="text-[36px] xs:text-[42px] sm:text-[50px] md:text-[58px] lg:text-[70px] font-black leading-[1.1] tracking-tight mb-4 font-jakarta px-4 sm:px-0 text-left md:text-center"
                        >
                            <span className="text-text-primary">
                                <span
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary"
                                    style={{
                                        backgroundSize: '200% auto',
                                        animation: 'hero-text-gradient 5s linear infinite'
                                    }}
                                >
                                    Confusion
                                </span>{' '}
                                To <br className="block sm:hidden" />
                                <span
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#C026FF] to-primary"
                                    style={{
                                        backgroundSize: '200% auto',
                                        animation: 'hero-text-gradient 5s linear infinite'
                                    }}
                                >
                                    Career
                                </span>
                            </span>
                        </div>

                        {/* Subtitle */}
                        <p className="text-[14.5px] sm:text-xl text-text-secondary mb-8 max-w-[280px] xs:max-w-[320px] sm:max-w-2xl font-inter leading-[1.6] px-4 sm:px-0 text-left md:text-center mx-0 md:mx-auto">
                            Turn uncertainty into clarity with industry-ready <span className="text-primary font-semibold">skills</span>. Start building a career that actually moves you forward with <span className="text-primary font-semibold">Skilldad</span>.
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

            {/* University Ticker */}
            <div className="absolute bottom-64 md:bottom-8 left-0 right-0 py-2 sm:py-5 overflow-hidden whitespace-nowrap z-[20] pointer-events-none sm:pointer-events-auto">
                <div className="md:hidden px-4 sm:px-6 mb-5 flex flex-col items-start">
                    <div className="w-10 h-[2px] bg-primary mb-2 opacity-70"></div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] font-inter">Trusted by learners from</span>
                </div>
                <div className="flex animate-scroll hover:pause-on-desktop will-change-transform" style={{ animationDuration: '150s' }}>
                    {[...partners, ...partners, ...partners].map((partner, i) => (
                        <div key={i} className="mx-6 sm:mx-10 md:mx-16 flex items-center gap-3 transition-all hover:scale-110 cursor-default">
                            <Landmark className="text-primary" size={18} />
                            <span className="text-[11px] xs:text-xs md:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-500 hover:text-gray-300 font-inter">{partner}</span>
                        </div>
                    ))}
                </div>
                {/* Subtle edge fades */}
                <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-black via-black/40 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-black via-black/40 to-transparent z-10 pointer-events-none" />
            </div>





            {/* Bottom transition gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
        </section>
    );
};

export default HeroSection;
