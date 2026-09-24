import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroFlowingWave
 * Elegant, lightweight flowing purple/lavender wave layers for the right side of the Hero section.
 * - 4 thin, translucent curved layers emerging from the bottom-right corner, sweeping up along the right edge.
 * - Each layer floats independently at its own gentle pace so the whole thing feels alive rather than
 *   one static rigid block moving together.
 * - Deliberately low opacity throughout - this is meant to read as soft ambient motion behind the
 *   hero content, never as a solid decorative shape competing with it.
 */
const HeroFlowingWave = () => {
    const shouldReduceMotion = useReducedMotion();

    const floatFor = (duration, delay = 0, amplitude = 6) =>
        shouldReduceMotion
            ? {}
            : {
                animate: { y: [0, -amplitude, 0], x: [0, -amplitude * 0.6, 0] },
                transition: { duration, repeat: Infinity, ease: 'easeInOut', delay }
            };

    return (
        <div
            className="absolute right-0 bottom-[68px] sm:bottom-[76px] md:bottom-[82px] lg:bottom-[88px] w-[360px] sm:w-[460px] md:w-[540px] lg:w-[620px] xl:w-[680px] h-[300px] sm:h-[350px] md:h-[390px] lg:h-[420px] pointer-events-none select-none z-10 overflow-visible flex items-end justify-end"
            aria-hidden="true"
        >
            <div className="w-full h-full relative">
                <svg
                    viewBox="0 0 600 380"
                    fill="none"
                    preserveAspectRatio="xMaxYMax meet"
                    className="w-full h-full object-contain overflow-visible"
                >
                    <defs>
                        {/* Widest, softest, deepest layer */}
                        <linearGradient id="waveL1" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4C1D95" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="#9333EA" stopOpacity="0.18" />
                        </linearGradient>
                        {/* Mid layer */}
                        <linearGradient id="waveL2" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6D28D9" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.24" />
                        </linearGradient>
                        {/* Thin ribbon accent */}
                        <linearGradient id="waveL3" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.20" />
                            <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.38" />
                        </linearGradient>
                        {/* Thinnest highlight sheen */}
                        <linearGradient id="waveL4" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.30" />
                            <stop offset="100%" stopColor="#F5F3FF" stopOpacity="0.50" />
                        </linearGradient>

                        <filter id="waveSoftGlow" x="-40%" y="-40%" width="180%" height="180%">
                            <feGaussianBlur stdDeviation="14" />
                        </filter>
                    </defs>

                    {/* Layer 1: widest curling wave, softest and deepest */}
                    <motion.path
                        {...floatFor(11, 0, 5)}
                        d="M 600 365 C 460 380 335 328 258 232 C 210 173 202 108 248 68 C 210 112 214 178 260 232 C 335 322 465 358 600 340 Z"
                        fill="url(#waveL1)"
                        filter="url(#waveSoftGlow)"
                    />

                    {/* Layer 2: mid curling wave, nested inside layer 1 */}
                    <motion.path
                        {...floatFor(9.5, 0.6, 6)}
                        d="M 600 325 C 485 338 380 292 315 210 C 278 162 274 112 312 80 C 280 116 282 168 320 212 C 380 284 480 312 600 300 Z"
                        fill="url(#waveL2)"
                    />

                    {/* Layer 3: thin translucent ribbon tracing the wave's crest */}
                    <motion.path
                        {...floatFor(8, 1.1, 7)}
                        d="M 590 300 C 495 312 405 272 350 205 C 320 168 316 130 344 105"
                        stroke="url(#waveL3)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                    />

                    {/* Layer 4: thinnest highlight sheen, innermost curl */}
                    <motion.path
                        {...floatFor(7, 1.6, 8)}
                        d="M 575 278 C 495 288 420 254 372 197 C 348 168 344 138 364 118"
                        stroke="url(#waveL4)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                    />
                </svg>
            </div>
        </div>
    );
};

export default HeroFlowingWave;
