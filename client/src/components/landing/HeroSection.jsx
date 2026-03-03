import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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
    { id: 'root', x: 160, y: 250, r: 20, label: 'SkillDad', delay: 0 },
    { id: 'courses', x: 55, y: 130, r: 13, label: 'Courses', delay: 0.3 },
    { id: 'university', x: 275, y: 110, r: 13, label: 'University', delay: 0.6 },
    { id: 'partner', x: 315, y: 275, r: 13, label: 'Partners', delay: 0.9 },
    { id: 'ai', x: 45, y: 365, r: 13, label: 'AI Engine', delay: 1.2 },
    { id: 'cert', x: 225, y: 415, r: 11, label: 'Certs', delay: 1.5 },
    { id: 'job', x: 350, y: 385, r: 11, label: 'Jobs', delay: 1.8 },
    { id: 'student', x: 130, y: 490, r: 11, label: 'Student', delay: 2.1 },
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
        className="absolute -left-28 sm:-left-10 lg:left-0 top-[54%] -translate-y-1/2 z-[15] pointer-events-none select-none scale-50 md:scale-75 xl:scale-100 origin-left opacity-25 md:opacity-80 lg:opacity-100"
        style={{ width: 420, height: 580 }}
    >
        <div
            style={{
                width: '100%',
                height: '100%',
                animation: 'hero-diagram-float 20s ease-in-out infinite'
            }}
        >
            <svg viewBox="-10 60 420 520" width="420" height="520" xmlns="http://www.w3.org/2000/svg">
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
    const { user } = useUser();
    const navigate = useNavigate();
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

    // Helper to get dashboard link based on role
    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/admin/dashboard';
            case 'university': return '/university/dashboard';
            case 'partner': return '/partner/dashboard';
            case 'finance': return '/finance/dashboard';
            default: return '/dashboard';
        }
    };

    return (
        <section className="relative min-h-[90vh] md:min-h-[100vh] flex items-center overflow-hidden bg-transparent">
            <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />

            <div className="absolute inset-0 z-0 gpu-accelerated">
                <AlyraOrb />
            </div>

            {/* Purple Network Diagram — left */}
            <div className="gpu-accelerated">
                <NetworkDiagram />
            </div>

            {/* Hero Content */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 w-full relative z-[20]">
                <div className="max-w-[850px] py-12 md:py-24 text-center mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div role="heading" aria-level="1" className="text-[28px] xs:text-[36px] sm:text-[48px] md:text-[62px] lg:text-[76px] font-bold leading-[1.05] tracking-[-0.03em] mb-6 md:mb-10 font-space">
                            <span className="text-white/30 block mb-2">Transform Your</span>
                            <span className="text-white block">
                                Skills with{' '}
                                <span
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-primary inline-block"
                                    style={{
                                        backgroundSize: "200% auto",
                                        animation: 'hero-text-gradient 5s linear infinite'
                                    }}
                                >
                                    SkillDad
                                </span>
                            </span>
                        </div>


                        <p className="text-base sm:text-lg md:text-2xl text-[#B8B8D0] mb-6 md:mb-10 max-w-[700px] mx-auto leading-relaxed font-inter font-medium px-4 opacity-90">
                            Smart learning automation for students,<br className="hidden md:block" /> professionals, and companies.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-5 px-6">
                            <button
                                onClick={() => navigate(user ? getDashboardLink() : '/register')}
                                className="w-full sm:w-auto px-7 md:px-10 py-3 md:py-4 rounded-full bg-gradient-to-r from-[#8A2BE2] to-[#FF2FD1] text-white font-black text-[10px] md:text-[12px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 group hover:shadow-[0_0_40px_rgba(255,47,209,0.4)] hover:scale-[1.03] active:scale-95 shadow-lg"
                            >
                                {user ? 'Go to Dashboard' : 'Start Learning Today'}
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
                            </button>

                            {!user && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full sm:w-auto px-7 md:px-10 py-3 md:py-4 rounded-full bg-black/40 backdrop-blur-md border-[1.5px] border-white/20 text-white font-black text-[10px] md:text-[12px] uppercase tracking-[0.15em] transition-all hover:bg-white/10 hover:border-white active:scale-95"
                                >
                                    Login Now
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* University Ticker */}
            <div className="absolute bottom-4 left-0 right-0 py-5 overflow-hidden whitespace-nowrap z-20">
                <div className="flex animate-scroll hover:pause will-change-transform" style={{ animationDuration: '150s' }}>
                    {[...partners, ...partners, ...partners].map((partner, i) => (
                        <div key={i} className="mx-16 md:mx-28 flex items-center transition-all hover:scale-110 cursor-default">
                            <span className="text-[16px] md:text-[22px] font-black uppercase tracking-[0.3em] text-white hover:text-white font-inter">{partner}</span>
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
