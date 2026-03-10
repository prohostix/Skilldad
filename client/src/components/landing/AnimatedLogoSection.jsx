import React from 'react';
import { motion } from 'framer-motion';
import SkillDadLogo from '../ui/SkillDadLogo';

/*
  Optimized AnimatedLogoSection
  • Infinite loops converted to CSS Keyframes (GPU-composited)
  • backdrop-blur removed from heavy items
  • will-change added to all moving layers
  • Using scale/opacity instead of layout reflows
*/

const CSS = `
@keyframes logo-float {
    0%, 100% { transform: translateY(0) rotateY(0deg) rotateX(0deg); }
    33% { transform: translateY(-15px) rotateY(15deg) rotateX(-10deg); }
    66% { transform: translateY(0) rotateY(-15deg) rotateX(10deg); }
}
@keyframes orbit-360 { from { transform: rotateZ(0deg); } to { transform: rotateZ(360deg); } }
@keyframes orbit-reverse { from { transform: rotateZ(360deg); } to { transform: rotateZ(0deg); } }
@keyframes scan-line { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }
@keyframes orbital-glow {
    0%, 100% { transform: translate(var(--x), var(--y)) scale(1); opacity: 0.4; }
    50% { transform: translate(var(--x), var(--y)) scale(1.3); opacity: 0.8; }
}
@keyframes light-streak {
    0% { transform: translateX(-100%) skewX(-12deg); }
    50%, 100% { transform: translateX(200%) skewX(-12deg); }
}
`;

let injected = false;
if (typeof document !== 'undefined' && !injected) {
    injected = true;
    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
}

const ORBITALS = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45) * Math.PI / 180;
    return {
        x: `${Math.cos(angle) * 160}px`,
        y: `${Math.sin(angle) * 160}px`,
        color: i % 2 === 0 ? "#8A2BE2" : "#007BFF",
        delay: `${i * 0.5}s`,
        dur: `${4 + (i * 0.5)}s`
    };
});

const AnimatedLogoSection = () => {
    return (
        <section className="relative py-12 md:py-16 overflow-hidden bg-transparent" style={{ perspective: "1200px" }}>
            {/* Background Glows — Static */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center justify-center text-center space-y-12">

                    {/* 3D Animated Logo Container */}
                    <div className="relative group">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            style={{
                                transformStyle: "preserve-3d",
                                animation: 'logo-float 12s ease-in-out infinite',
                                willChange: 'transform'
                            }}
                            className="relative z-10"
                        >
                            {/* Outer 3D Rings */}
                            <div
                                style={{
                                    animation: 'orbit-360 30s linear infinite',
                                    willChange: 'transform'
                                }}
                                className="absolute -inset-16 border-[0.5px] border-primary/20 rounded-full opacity-40 pointer-events-none"
                            />

                            <div
                                style={{
                                    animation: 'orbit-reverse 40s linear infinite',
                                    willChange: 'transform'
                                }}
                                className="absolute -inset-24 border-[0.5px] border-blue-500/10 rounded-full opacity-20 pointer-events-none"
                            />

                            <div className="relative z-10 p-4 transition-all duration-700 hover:scale-110">
                                <SkillDadLogo className="w-24 h-24 md:w-48 md:h-48" />

                                {/* Inner Light Streak */}
                                <div
                                    style={{ animation: 'light-streak 6s linear infinite' }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                                />
                            </div>

                            {/* Floating Orbitals */}
                            {ORBITALS.map((o, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        backgroundColor: o.color,
                                        boxShadow: `0 0 15px ${o.color}`,
                                        '--x': o.x,
                                        '--y': o.y,
                                        animation: `orbital-glow ${o.dur} ease-in-out ${o.delay} infinite`,
                                        willChange: 'transform, opacity'
                                    }}
                                />
                            ))}
                        </motion.div>

                        {/* Ground Shadow/Glow */}
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 h-10 bg-primary/10 blur-3xl rounded-full opacity-30" />
                    </div>

                    {/* Text Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="space-y-6 max-w-2xl"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-[-0.02em] leading-tight font-space">
                            Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A2BE2] via-[#C026FF] to-[#007BFF]">SkillDad</span>
                        </h2>
                        <div className="flex items-center justify-center space-x-4">
                            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-primary/50" />
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-primary/50" />
                        </div>
                        <p className="text-text-muted text-base md:text-xl leading-relaxed font-inter font-medium opacity-70">
                            Experience the evolution of learning through our intelligent 3D neural engine,
                            synchronizing global institutions with professional success.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Cinematic Scanning Lines */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                <div
                    style={{ animation: 'scan-line 10s linear infinite' }}
                    className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                />
            </div>
        </section>
    );
};

export default AnimatedLogoSection;
