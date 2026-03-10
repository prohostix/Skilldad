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

const AnimatedText = ({ text }) => {
    return (
        <motion.h3
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-lg md:text-xl font-bold text-white font-space tracking-tight group-hover/cap:text-primary transition-colors flex flex-wrap"
        >
            {text}
        </motion.h3>
    );
};

const CapabilitiesSection = () => {
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
                        className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] font-jakarta"
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
                        <button className="flex items-center space-x-2 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[8px] hover:bg-white/10 transition-all group">
                            <span>Demo</span>
                            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>

                {/* Right Side: Animated Timeline */}
                <div className="relative pl-12 md:pl-24 py-12">
                    {/* Vertical Line Container */}
                    <div className="absolute left-4 md:left-10 top-0 bottom-0 w-[2px]">
                        <div className="absolute inset-0 bg-white/10 rounded-full" />

                        <motion.div
                            style={{
                                scaleY,
                                originY: 0
                            }}
                            className="absolute inset-0 z-10 rounded-full overflow-hidden"
                            willChange="transform"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-[#6D28FF] via-[#C026FF] to-[#6D28FF]" />
                            {/* Static Glow instead of heavy Blur */}
                            <div className="absolute inset-0 bg-primary/20 blur-[2px]" />
                        </motion.div>

                        {/* Tip Sparkle */}
                        <motion.div
                            style={{
                                top: sparkleTop,
                                opacity: sparkleOpacity
                            }}
                            className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full z-20 shadow-[0_0_15px_#C026FF]"
                            willChange="top, opacity"
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
                                    className="absolute left-[-28px] md:left-[-50px] top-0 w-8 md:w-10 h-8 md:h-10 rounded-full bg-[#05030B] border border-white/10 z-20 flex items-center justify-center group-hover/cap:border-primary group-hover/cap:bg-primary/5 transition-all duration-500 shadow-2xl"
                                >
                                    <cap.icon size={16} className="text-white group-hover/cap:text-primary transition-colors" />
                                </motion.div>

                                <div className="pl-6 md:pl-8 space-y-3">
                                    <AnimatedText text={cap.title} />

                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ delay: 0.4 }}
                                        className="text-text-secondary text-xs md:text-sm leading-relaxed max-w-sm font-inter opacity-60 group-hover/cap:opacity-100 transition-opacity"
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
