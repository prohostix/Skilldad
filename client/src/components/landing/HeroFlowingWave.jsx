import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroFlowingWave
 * Premium flowing silk ribbons / energy waves on the right side of the hero section,
 * perfectly matching the reference design:
 *
 * 1. 3–4 distinct curved bands, mostly wide filled ribbon shapes, not thin lines.
 * 2. Positioned along the right edge, starting around the middle-right and flowing down toward the bottom-right corner.
 * 3. The ribbons curve inward toward the center, then sweep back outward toward the right/bottom edge.
 * 4. No tight spiral or circular curl — long, smooth S-shaped flowing arcs.
 * 5. Varied widths: one thick main vibrant purple ribbon, with 2–3 thinner translucent lavender/white ribbons around it.
 * 6. Subtle color transitions along ribbons: light lavender → brighter purple → soft translucent purple.
 * 7. Soft glow / blur around edges for a silky, ethereal ambient presence.
 * 8. Positioned behind hero content (z-0), occupying the far-right 20–25% of the hero.
 */
const HeroFlowingWave = () => {
    const shouldReduceMotion = useReducedMotion();

    const floatAnim = (duration, delay = 0, yAmp = 6, xAmp = 3) =>
        shouldReduceMotion
            ? {}
            : {
                animate: {
                    y: [0, -yAmp, 1, 0],
                    x: [0, -xAmp, 1.5, 0]
                },
                transition: {
                    duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay
                }
            };

    return (
        <div
            className="absolute right-0 top-[6%] sm:top-[8%] lg:top-[10%] bottom-[50px] sm:bottom-[60px] lg:bottom-[70px] w-[340px] sm:w-[440px] md:w-[520px] lg:w-[580px] xl:w-[640px] pointer-events-none select-none z-0 overflow-visible flex items-center justify-end"
            aria-hidden="true"
        >
            <div className="w-full h-full relative">
                <svg
                    viewBox="0 0 540 520"
                    fill="none"
                    preserveAspectRatio="xMaxYMid meet"
                    className="w-full h-full object-contain overflow-visible"
                >
                    <defs>
                        {/* Main Silk Ribbon Gradient: Light Lavender -> Brighter Purple -> Vibrant Royal Purple -> Soft Translucent Purple */}
                        <linearGradient id="mainSilkGrad" x1="90%" y1="12%" x2="68%" y2="92%">
                            <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.65" />
                            <stop offset="22%" stopColor="#C084FC" stopOpacity="0.88" />
                            <stop offset="52%" stopColor="#7C3AED" stopOpacity="0.96" />
                            <stop offset="78%" stopColor="#6D28D9" stopOpacity="0.94" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.40" />
                        </linearGradient>

                        {/* Upper Translucent Lavender Ribbon Gradient */}
                        <linearGradient id="lavenderRibbonGrad" x1="92%" y1="14%" x2="64%" y2="88%">
                            <stop offset="0%" stopColor="#F5F3FF" stopOpacity="0.38" />
                            <stop offset="35%" stopColor="#DDD6FE" stopOpacity="0.60" />
                            <stop offset="70%" stopColor="#C4B5FD" stopOpacity="0.50" />
                            <stop offset="100%" stopColor="#9333EA" stopOpacity="0.18" />
                        </linearGradient>

                        {/* Inner Sheer White-Lavender Crest Gradient */}
                        <linearGradient id="sheerWhiteGrad" x1="86%" y1="18%" x2="52%" y2="84%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.60" />
                            <stop offset="38%" stopColor="#EDE9FE" stopOpacity="0.52" />
                            <stop offset="74%" stopColor="#C084FC" stopOpacity="0.38" />
                            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.12" />
                        </linearGradient>

                        {/* Soft Edge Glow Filter */}
                        <filter id="ribbonSoftGlow" x="-25%" y="-25%" width="150%" height="150%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Ambient Ethereal Aura Blur */}
                        <filter id="ambientMistGlow" x="-35%" y="-35%" width="170%" height="170%">
                            <feGaussianBlur stdDeviation="16" />
                        </filter>

                        {/* Satin Ribbon Soft Drop Shadow */}
                        <filter id="satinShadow" x="-25%" y="-25%" width="150%" height="150%">
                            <feDropShadow dx="-3" dy="6" stdDeviation="10" floodColor="#4C1D95" floodOpacity="0.24" />
                        </filter>
                    </defs>

                    {/* ── 1. Soft Ambient Silk Energy Wave (Ethereal Background Aura) ── */}
                    <motion.path
                        {...floatAnim(11.5, 0, 5, 2.5)}
                        d="M 540 60
                           C 440 120, 290 200, 210 290
                           C 130 380, 200 450, 360 480
                           C 430 492, 500 495, 540 498
                           L 540 435
                           C 480 430, 420 415, 360 390
                           C 270 350, 240 270, 330 190
                           C 410 120, 490 65, 540 30 Z"
                        fill="url(#mainSilkGrad)"
                        opacity="0.18"
                        filter="url(#ambientMistGlow)"
                    />

                    {/* ── 2. Upper Translucent Lavender Silk Ribbon (Band 2) ── */}
                    {/* Width ~32px, smooth S-arc hugging the outer upper flank */}
                    <motion.path
                        {...floatAnim(10, 0.5, 6, 3)}
                        d="M 540 90
                           C 455 145, 330 225, 260 305
                           C 200 375, 235 435, 375 470
                           C 440 485, 495 490, 540 492
                           L 540 460
                           C 485 455, 430 445, 370 425
                           C 285 395, 260 345, 315 285
                           C 375 215, 475 145, 540 115 Z"
                        fill="url(#lavenderRibbonGrad)"
                        filter="url(#ribbonSoftGlow)"
                    />

                    {/* ── 3. MAIN THICK VIBRANT PURPLE SILK RIBBON (Band 1) ── */}
                    {/* Wide filled ribbon shape (width ~50-60px), starting middle-right, curving inward to (210, 335), sweeping outward to bottom-right */}
                    <motion.path
                        {...floatAnim(9, 1.0, 7, 3.5)}
                        d="M 540 125
                           C 435 180, 290 255, 210 335
                           C 140 405, 175 455, 320 482
                           C 410 498, 480 500, 540 500
                           L 540 445
                           C 470 442, 400 435, 325 410
                           C 230 380, 220 330, 280 270
                           C 350 200, 460 135, 540 85 Z"
                        fill="url(#mainSilkGrad)"
                        filter="url(#satinShadow)"
                    />

                    {/* ── 4. Inner Translucent Lavender/White Silk Ribbon (Band 3) ── */}
                    {/* Width ~24px, delicately nested along the inner fold */}
                    <motion.path
                        {...floatAnim(8.2, 1.5, 6, 2.5)}
                        d="M 540 160
                           C 440 215, 315 285, 250 355
                           C 195 415, 215 452, 330 475
                           C 415 488, 485 492, 540 495
                           L 540 472
                           C 475 468, 405 460, 335 440
                           C 255 415, 245 380, 290 335
                           C 345 280, 450 220, 540 180 Z"
                        fill="url(#sheerWhiteGrad)"
                    />

                    {/* ── 5. Luminous Specular Silk Crest Filament ── */}
                    {/* Subtle satin light reflection tracing the main crest curvature */}
                    <motion.path
                        {...floatAnim(9, 1.0, 7, 3.5)}
                        d="M 540 125
                           C 435 180, 290 255, 210 335
                           C 140 405, 175 455, 320 482
                           C 410 498, 480 500, 540 500"
                        stroke="rgba(255, 255, 255, 0.52)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        fill="none"
                    />

                    {/* ── 6. Delicate Whispering Outer Echo Sheen ── */}
                    <motion.path
                        {...floatAnim(10.5, 0.8, 5, 2)}
                        d="M 540 100
                           C 465 155, 345 235, 280 315
                           C 225 380, 255 435, 385 468
                           C 445 482, 498 488, 540 490"
                        stroke="rgba(221, 214, 254, 0.40)"
                        strokeWidth="1.2"
                        strokeDasharray="6 4"
                        fill="none"
                    />
                </svg>
            </div>
        </div>
    );
};

export default HeroFlowingWave;
