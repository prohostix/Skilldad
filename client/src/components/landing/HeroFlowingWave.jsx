import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroFlowingWave
 * Premium, modern, elegant flowing purple ribbon/wave for the right side of the Hero section.
 * - Perfectly mirrors the curves, bends, and silk layers from the reference image.
 * - Bold, sweeping 3D satin purple ribbon (#581C87 to #8B5CF6) with sharp left tip dipping above the wave.
 * - Upper translucent lavender silk sheet sweeping high up along the right edge behind the badges.
 * - Soft diffuse ambient glow.
 * - Calm, continuous organic motion (9-12s cycle, easeInOut, infinite, respects prefers-reduced-motion).
 */
const HeroFlowingWave = () => {
    const shouldReduceMotion = useReducedMotion();

    const waveMotion = shouldReduceMotion
        ? {}
        : {
            animate: {
                y: [0, -6, 3, 0],
                x: [0, -4, 2, 0],
                opacity: [0.92, 1, 0.95, 0.92]
            },
            transition: {
                duration: 11,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        };

    return (
        <div
            className="absolute right-0 bottom-0 w-[380px] sm:w-[480px] md:w-[560px] lg:w-[660px] xl:w-[720px] h-[340px] sm:h-[400px] md:h-[460px] lg:h-[500px] pointer-events-none select-none z-0 overflow-visible flex items-end justify-end"
            aria-hidden="true"
        >
            <motion.div
                className="w-full h-full relative"
                {...waveMotion}
            >
                <svg
                    viewBox="0 0 600 440"
                    fill="none"
                    preserveAspectRatio="xMaxYMax meet"
                    className="w-full h-full object-contain overflow-visible"
                    shapeRendering="geometricPrecision"
                >
                    <defs>
                        {/* Deep Vibrant Purple Ribbon Gradient (#581C87 -> #6D28D9 -> #8B5CF6 -> #9333EA) */}
                        <linearGradient id="refRibbonGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4C1D95" stopOpacity="0.95" />
                            <stop offset="25%" stopColor="#5B21B6" stopOpacity="1" />
                            <stop offset="55%" stopColor="#6D28D9" stopOpacity="1" />
                            <stop offset="85%" stopColor="#8B5CF6" stopOpacity="0.98" />
                            <stop offset="100%" stopColor="#9333EA" stopOpacity="0.95" />
                        </linearGradient>

                        {/* Translucent Lavender Sheet Gradient */}
                        <linearGradient id="refLavenderSheet" x1="0%" y1="100%" x2="90%" y2="10%">
                            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.6" />
                            <stop offset="35%" stopColor="#DDD6FE" stopOpacity="0.45" />
                            <stop offset="70%" stopColor="#C084FC" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.05" />
                        </linearGradient>

                        {/* Soft Ambient Glow Filter */}
                        <filter id="refAmbientGlow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="22" result="blur" />
                        </filter>

                        {/* Sheer Soft Filter */}
                        <filter id="refSheerBlur" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                        </filter>

                        {/* Gentle Ribbon Edge Shadow */}
                        <filter id="refRibbonShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#3B1578" floodOpacity="0.25" />
                        </filter>
                    </defs>

                    {/* 1. Ambient diffused purple glow behind the ribbon */}
                    <path
                        d="M 80 360 C 220 320 380 220 480 120 C 540 60 580 20 600 0 L 600 440 L 80 440 Z"
                        fill="url(#refLavenderSheet)"
                        filter="url(#refAmbientGlow)"
                        opacity="0.65"
                    />

                    {/* 2. Translucent Lavender Silk Sheet (Layer 2 - sweeping high up along right edge) */}
                    <path
                        d="M 70 350 C 200 310 350 200 450 100 C 510 40 560 10 600 0 L 600 120 C 540 190 440 280 320 350 C 210 395 130 380 70 350 Z"
                        fill="url(#refLavenderSheet)"
                        filter="url(#refSheerBlur)"
                        opacity="0.85"
                    />

                    {/* 3. Solid Vibrant Purple Ribbon (Layer 1 - bold sweeping ribbon with sharp tip on left) */}
                    <g filter="url(#refRibbonShadow)">
                        <path
                            d="M 30 365 C 160 360 310 315 440 235 C 500 195 550 150 600 110 L 600 200 C 540 245 470 295 370 350 C 260 405 140 395 30 365 Z"
                            fill="url(#refRibbonGrad)"
                        />
                    </g>

                    {/* 4. Subtle Inner Highlight Crest along upper curve of solid ribbon */}
                    <path
                        d="M 45 364 C 165 358 312 313 440 235 C 500 195 550 150 600 110"
                        stroke="rgba(255, 255, 255, 0.45)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        filter="url(#refSheerBlur)"
                    />

                    {/* 5. Delicate accent ribbon filament */}
                    <path
                        d="M 95 330 C 220 270 340 160 420 60 C 450 20 480 5 510 0"
                        stroke="rgba(196, 181, 253, 0.5)"
                        strokeWidth="2"
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
