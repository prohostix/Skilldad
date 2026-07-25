import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
    Target,
    BarChart3,
    Link2,
    ArrowRight
} from 'lucide-react';
import ModernButton from '../ui/ModernButton';

/*
  Optimized CapabilitiesSection
  • Simplified text animation (per-word instead of per-letter)
  • Eliminated expensive blur filters on large scrolling elements
  • Using CSS for tip sparkle and tip shine
*/

const CSS = `
@keyframes cap-sparkle {
    0%, 100% { opacity: 0.8; transform: translate(-50%, 0) scale(1); }
    50% { opacity: 1; transform: translate(-50%, 0) scale(1.2); }
}
`;

let injected = false;
if (typeof document !== 'undefined' && !injected) {
    injected = true;
    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
}

const AnimatedText = ({ text, isLightMode = true }) => {
    return (
        <motion.h3
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`text-lg md:text-xl font-bold font-space tracking-tight group-hover/cap:text-primary transition-colors flex flex-wrap ${isLightMode ? 'text-slate-900' : 'text-white'}`}
        >
            {text}
        </motion.h3>
    );
};

const CapabilitiesSection = ({ isLightMode = true }) => {
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start 90%", "end 10%"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 70,
        damping: 30,
        restDelta: 0.001
    });

    const scaleY = useTransform(smoothProgress, [0, 1], [0, 1]);
    const sparkleTop = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
    const sparkleOpacity = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

    const capabilities = [
        {
            title: 'Adaptive Scaling',
            desc: 'Dynamically adjust resources and workflows to meet evolving business demands with precision and flexibility.',
            icon: Target,
        },
        {
            title: 'Intelligent Insights',
            desc: 'Leverage advanced analytics to uncover hidden patterns and drive strategic decision-making across your organization.',
            icon: BarChart3,
        },
        {
            title: 'Seamless Integration',
            desc: 'Connect disparate systems and platforms effortlessly, creating a unified technological ecosystem for your enterprise.',
            icon: Link2,
        }
    ];

    return (
        <div ref={sectionRef} id="capabilities" style={{ position: 'relative' }} className="py-8 md:py-16 px-6 bg-transparent relative overflow-hidden block">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-start">

                {/* Left Side: Content */}
                <div className="space-y-6 lg:sticky lg:top-32 py-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.4em]"
                    >
                        Capabilities
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] font-jakarta ${isLightMode ? 'text-slate-900' : 'text-white'}`}
                    >
                        Intelligent Tools <br />
                        For <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-accent">Dynamic</span> Teams
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap gap-4 pt-4"
                    >
                        <ModernButton className="!px-8 !py-3 font-black uppercase tracking-widest text-[10px]">
                            Explore
                        </ModernButton>
                        <button className={`flex items-center space-x-2 px-8 py-3 rounded-full border font-black uppercase tracking-widest text-[8px] transition-all group ${isLightMode ? 'bg-white/90 border-purple-200 text-slate-900 hover:bg-white hover:border-primary shadow-sm' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                            <span>Demo</span>
                            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>

                {/* Right Side: Animated Timeline */}
                <div className="relative pl-12 md:pl-24 py-12">
                    {/* Vertical Line Container */}
                    <div className="absolute left-4 md:left-10 top-0 bottom-0 w-[2px]">
                        <div className={`absolute inset-0 rounded-full ${isLightMode ? 'bg-purple-200' : 'bg-white/10'}`} />

                        <motion.div
                            style={{
                                scaleY,
                                originY: 0,
                                willChange: 'transform'
                            }}
                            className="absolute inset-0 z-10 rounded-full overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-[#6D28FF] via-[#C026FF] to-[#6D28FF]" />
                            <div className="absolute inset-0 bg-primary/20 blur-[2px]" />
                        </motion.div>

                        {/* Tip Sparkle */}
                        <motion.div
                            style={{
                                top: sparkleTop,
                                opacity: sparkleOpacity,
                                willChange: 'top, opacity'
                            }}
                            className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full z-20 shadow-[0_0_15px_#C026FF]"
                        />
                    </div>

                    <div className="space-y-12 md:space-y-24">
                        {capabilities.map((cap, index) => (
                            <div key={index} className="relative group/cap px-4">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className={`absolute left-[-28px] md:left-[-50px] top-0 w-8 md:w-10 h-8 md:h-10 rounded-full border z-20 flex items-center justify-center transition-all duration-500 shadow-2xl ${isLightMode ? 'bg-white border-purple-200 group-hover/cap:border-primary group-hover/cap:bg-purple-50' : 'bg-[#05030B] border-white/10 group-hover/cap:border-primary group-hover/cap:bg-primary/5'}`}
                                >
                                    <cap.icon size={16} className={isLightMode ? "text-slate-800 group-hover/cap:text-primary transition-colors" : "text-white group-hover/cap:text-primary transition-colors"} />
                                </motion.div>

                                <div className="pl-6 md:pl-8 space-y-3">
                                    <AnimatedText text={cap.title} isLightMode={isLightMode} />

                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ delay: 0.4 }}
                                        className={`text-xs md:text-sm leading-relaxed max-w-sm font-inter transition-opacity ${isLightMode ? 'text-slate-700 font-medium' : 'text-text-secondary opacity-60 group-hover/cap:opacity-100'}`}
                                    >
                                        {cap.desc}
                                    </motion.p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CapabilitiesSection;
