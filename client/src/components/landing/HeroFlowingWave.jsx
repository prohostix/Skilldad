import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroFlowingWave
 * Premium, modern, elegant flowing purple ribbon/wave for the right side of the Hero section.
 * - Perfectly mirrors the fluid curves, bends, and silk layers from the reference image.
 * - Smooth horizontal launch with concave S-curve scoop dipping right above the bottom wave.
 * - Bold 3D satin purple ribbon (#4C1D95 to #9333EA) with specular sheen crest highlight.
 * - Billowing upper translucent lavender silk veil sweeping high behind floating badges.
 * - Gentle, continuous organic floating animation (10s cycle, easeInOut, infinite).
 */
const HeroFlowingWave = () => {
    const shouldReduceMotion = useReducedMotion();

    const waveMotion = shouldReduceMotion
        ? {}
        : {
            animate: {
                y: [0, -5, 2, 0],
                x: [0, -3, 1, 0],
                rotate: [0, 0.4, -0.3, 0]
            },
            transition: {
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        };

    return (
        <div
            className="absolute right-0 bottom-[68px] sm:bottom-[76px] md:bottom-[82px] lg:bottom-[88px] w-[360px] sm:w-[460px] md:w-[540px] lg:w-[620px] xl:w-[680px] h-[300px] sm:h-[350px] md:h-[390px] lg:h-[420px] pointer-events-none select-none z-10 overflow-visible flex items-end justify-end"
            aria-hidden="true"
        >
            <motion.div
                className="w-full h-full relative"
                {...waveMotion}
            >
                <svg
                    viewBox="0 0 600 380"
                    fill="none"
                    preserveAspectRatio="xMaxYMax meet"
                    className="w-full h-full object-contain overflow-visible"
                    shapeRendering="geometricPrecision"
                >
                    <defs>
                        {/* Deep Vibrant Satin Purple Ribbon Gradient (#4C1D95 -> #6D28D9 -> #8B5CF6 -> #9333EA) */}
                        <linearGradient id="refRibbonGrad" x1="0%" y1="90%" x2="100%" y2="10%">
                            <stop offset="0%" stopColor="#4C1D95" stopOpacity="0.96" />
                            <stop offset="28%" stopColor="#5B21B6" stopOpacity="1" />
                            <stop offset="58%" stopColor="#6D28D9" stopOpacity="1" />
                            <stop offset="85%" stopColor="#8B5CF6" stopOpacity="0.98" />
                            <stop offset="100%" stopColor="#9333EA" stopOpacity="0.95" />
                        </linearGradient>

                        {/* Translucent Lavender Silk Veil Gradient */}
                        <linearGradient id="refLavenderVeil" x1="10%" y1="100%" x2="90%" y2="0%">
                            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.55" />
                            <stop offset="40%" stopColor="#DDD6FE" stopOpacity="0.38" />
                            <stop offset="75%" stopColor="#C084FC" stopOpacity="0.20" />
                            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.04" />
                        </linearGradient>

                        {/* Ambient Glow Filter */}
                        <filter id="refAmbientGlow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="20" result="blur" />
                        </filter>

                        {/* Sheer Soft Filter */}
                        <filter id="refSheerBlur" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                        </filter>

                        {/* 3D Ribbon Drop Shadow */}
                        <filter id="refRibbonShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="-2" dy="8" stdDeviation="12" floodColor="#3B1578" floodOpacity="0.28" />
                        </filter>
                    </defs>

                    {/* 1. Ambient diffuse glow behind the wave */}
                    <path
                        d="M 60 290 C 180 270 330 180 440 90 C 500 40 550 10 600 0 L 600 240 C 480 280 320 330 160 330 Z"
                        fill="url(#refLavenderVeil)"
                        filter="url(#refAmbientGlow)"
                        opacity="0.6"
                    />

                    {/* 2. Translucent Upper Lavender Silk Veil (Billowing high behind badges) */}
                    <path
                        d="M 75 285 C 160 265 270 175 390 85 C 460 35 530 8 600 0 L 600 115 C 520 165 410 225 300 275 C 210 315 140 315 75 285 Z"
                        fill="url(#refLavenderVeil)"
                        filter="url(#refSheerBlur)"
                        opacity="0.85"
                    />

                    {/* 3. Primary 3D Satin Purple Ribbon (Curving concave S-curve scoop, no straight slope) */}
                    <g filter="url(#refRibbonShadow)">
                        <path
                            d="M 35 292 C 115 295 225 262 345 208 C 425 172 505 132 600 88 L 600 172 C 515 212 425 252 340 282 C 250 312 135 312 35 292 Z"
                            fill="url(#refRibbonGrad)"
                        />
                    </g>

                    {/* 4. Specular Sheen Highlight Ridge along ribbon crest (Liquid silk gleam) */}
                    <path
                        d="M 50 291 C 125 293 230 261 345 208 C 425 172 505 132 600 88"
                        stroke="rgba(255, 255, 255, 0.48)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        filter="url(#refSheerBlur)"
                    />

                    {/* 5. Delicate accent filament tendril */}
                    <path
                        d="M 90 270 C 190 220 310 130 420 50 C 470 15 510 5 550 0"
                        stroke="rgba(196, 181, 253, 0.55)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        fill="none"
                        filter="url(#refSheerBlur)"
                    />
                </svg>
            </motion.div>
        </div>
    );
};

export default HeroFlowingWave;
