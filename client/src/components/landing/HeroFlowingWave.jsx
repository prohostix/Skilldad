import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroFlowingWave
 * Premium, elegant decorative flowing purple ribbon/wave for the right side of the Hero section.
 * - Layered Bézier ribbon paths (deep SkillDad purple #4C1D95, soft lavender #8B5CF6, sheer translucent lavender)
 * - Subtle organic motion (slow 10-12s cycle, calm, respects prefers-reduced-motion)
 * - Anchored to bottom-right, flowing upward along the right edge (15-25% width)
 * - Never overlaps or occludes center headline or buttons
 */
const HeroFlowingWave = () => {
    const shouldReduceMotion = useReducedMotion();

    const waveAnimProps = shouldReduceMotion
        ? {}
        : {
            animate: {
                y: [0, -7, 2, 0],
                x: [0, -3, 2, 0],
                opacity: [0.94, 1, 0.96, 0.94]
            },
            transition: {
                duration: 11,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        };

    const secondaryAnimProps = shouldReduceMotion
        ? {}
        : {
            animate: {
                y: [0, 6, -5, 0],
                x: [0, 4, -2, 0],
                opacity: [0.88, 0.98, 0.9, 0.88]
            },
            transition: {
                duration: 13,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.8
            }
        };

    return (
        <div
            className="absolute right-0 bottom-0 top-0 w-[42%] sm:w-[32%] md:w-[26%] lg:w-[22%] xl:w-[20%] h-full pointer-events-none select-none z-0 overflow-hidden flex items-end justify-end"
            aria-hidden="true"
        >
            <motion.div
                className="relative w-full h-[110%] -bottom-4 right-0"
                {...waveAnimProps}
            >
                <svg
                    viewBox="0 0 320 800"
                    fill="none"
                    preserveAspectRatio="none"
                    className="w-full h-full object-fill overflow-visible"
                    shapeRendering="geometricPrecision"
                >
                    <defs>
                        {/* 1. Main Deep SkillDad Purple Gradient (#4C1D95 -> #5B21B6 -> #6D28D9) */}
                        <linearGradient id="waveDeepPurpleGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3B1578" stopOpacity="0.95" />
                            <stop offset="25%" stopColor="#4C1D95" stopOpacity="1" />
                            <stop offset="60%" stopColor="#5B21B6" stopOpacity="1" />
                            <stop offset="85%" stopColor="#6D28D9" stopOpacity="0.98" />
                            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.9" />
                        </linearGradient>

                        {/* 2. Secondary Soft Lavender Gradient (#8B5CF6 -> #A78BFA) */}
                        <linearGradient id="waveLavenderGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6D28D9" stopOpacity="0.85" />
                            <stop offset="40%" stopColor="#8B5CF6" stopOpacity="0.85" />
                            <stop offset="75%" stopColor="#A78BFA" stopOpacity="0.75" />
                            <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.5" />
                        </linearGradient>

                        {/* 3. Sheer Translucent Lavender Gradient (low opacity, airy highlight) */}
                        <linearGradient id="waveSheerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.5" />
                            <stop offset="35%" stopColor="#DDD6FE" stopOpacity="0.35" />
                            <stop offset="70%" stopColor="#A78BFA" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
                        </linearGradient>

                        {/* Ambient Lavender Glow Filter */}
                        <filter id="waveAmbientBlur" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="18" result="blur" />
                        </filter>

                        {/* Sheer Soft Filter */}
                        <filter id="waveSheerBlur" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                        </filter>

                        {/* Gentle Ribbon Edge Shadow */}
                        <filter id="waveRibbonShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#3B1578" floodOpacity="0.18" />
                        </filter>
                    </defs>

                    {/* 1. Very soft blurred ambient lavender glow behind the wave */}
                    <path
                        d="M 50 780 C 140 730 215 570 265 400 C 295 290 310 160 320 50 L 320 800 L 50 800 Z"
                        fill="url(#waveSheerGrad)"
                        filter="url(#waveAmbientBlur)"
                        opacity="0.5"
                    />

                    {/* 2. Translucent Sheer Lavender Ribbon Layer (sweeps up gracefully along right edge) */}
                    <path
                        d="M 70 760 C 145 710 205 560 250 410 C 285 295 305 180 320 70 L 320 180 C 305 280 280 380 240 490 C 195 610 140 710 100 770 Z"
                        fill="url(#waveSheerGrad)"
                        filter="url(#waveSheerBlur)"
                        opacity="0.85"
                    />

                    {/* 3. Secondary Soft Lavender Ribbon Band (#8B5CF6 to #A78BFA) */}
                    <path
                        d="M 45 765 C 130 730 200 640 260 515 C 290 450 310 380 320 300 L 320 390 C 308 460 280 540 230 635 C 175 725 110 760 45 765 Z"
                        fill="url(#waveLavenderGrad)"
                        opacity="0.88"
                    />

                    {/* 4. Main Deep SkillDad Purple Ribbon (#4C1D95 to #6D28D9) */}
                    <g filter="url(#waveRibbonShadow)">
                        <path
                            d="M 15 770 C 105 760 190 705 255 605 C 290 555 310 495 320 435 L 320 535 C 305 605 270 685 205 750 C 140 800 65 785 15 770 Z"
                            fill="url(#waveDeepPurpleGrad)"
                        />
                    </g>

                    {/* 5. Subtle White Translucent Sheen / Inner Crest highlight */}
                    <path
                        d="M 28 768 C 112 758 193 703 256 605 C 291 555 310 495 320 435"
                        stroke="rgba(255, 255, 255, 0.45)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        filter="url(#waveSheerBlur)"
                    />

                    {/* 6. Thin Translucent Purple Accent Ribbon flowing upward */}
                    <path
                        d="M 90 750 C 165 680 235 520 280 340 C 298 270 310 180 320 100"
                        stroke="rgba(167, 139, 250, 0.45)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        fill="none"
                        filter="url(#waveSheerBlur)"
                    />
                </svg>
            </motion.div>
        </div>
    );
};

export default HeroFlowingWave;
