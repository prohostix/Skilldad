import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/*
  UniversityOrb3D — Performance-optimised version
  • All infinite loops use CSS @keyframes (GPU-composited transform+opacity only)
  • No boxShadow animation (triggers repaint every frame)
  • No backdrop-blur on orbiting elements
  • Math.random() values memoised — never called on re-render
  • will-change: transform on every animated layer
*/

/* ── CSS Keyframes injected once ──────────────────────────── */
const STYLES = `
@keyframes orb-spin      { to { transform: rotate(360deg); } }
@keyframes orb-pulse     { 0%,100%{transform:translate(-50%,-50%) scale(1)}  50%{transform:translate(-50%,-50%) scale(1.07)} }
@keyframes orb-float     { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-8px)} }
@keyframes orb-fade      { 0%,100%{opacity:0; transform:translate(var(--px),var(--py)) scale(0.6)}
                            50%{opacity:1; transform:translate(var(--px),calc(var(--py) - 18px)) scale(1.3)} }
@keyframes badge-float   { 0%,100%{transform:translate(var(--bx),var(--by))}
                           50%{transform:translate(var(--bx),calc(var(--by) - 7px))} }
`;

let styleInjected = false;
const injectStyles = () => {
    if (styleInjected || typeof document === 'undefined') return;
    const el = document.createElement('style');
    el.textContent = STYLES;
    document.head.appendChild(el);
    styleInjected = true;
};

/* ── Badge data ──────────────────────────────────────────── */
const BADGES = [
    { label: 'Oxford', angle: 0, color: '#7C3AED', dur: '3.1s' },
    { label: 'MIT', angle: 72, color: '#C026D3', dur: '2.8s' },
    { label: 'Stanford', angle: 144, color: '#4F46E5', dur: '3.4s' },
    { label: 'ETH', angle: 216, color: '#7C3AED', dur: '2.6s' },
    { label: 'Harvard', angle: 288, color: '#9333EA', dur: '3.7s' },
];
const RADIUS = 118;

/* ── Ring data ───────────────────────────────────────────── */
const RINGS = [
    { size: 255, tilt: 75, dur: '12s', color: '#7C3AED50', dashed: false },
    { size: 198, tilt: 55, dur: '9s', color: '#C026D360', dashed: true },
    { size: 148, tilt: 20, dur: '15s', color: '#4F46E540', dashed: false },
    { size: 275, tilt: 10, dur: '20s', color: '#7C3AED25', dashed: true },
];

/* ── Travel dots ─────────────────────────────────────────── */
const DOTS = [
    { size: 255, tilt: 75, dur: '4s', color: '#A855F7' },
    { size: 198, tilt: 55, dur: '6s', color: '#EC4899' },
    { size: 148, tilt: 20, dur: '5s', color: '#818CF8' },
];

/* ── Particle data (fixed, never random on render) ───────── */
const PARTICLE_DATA = [
    { px: -80, py: 60, size: 3, color: '#A855F7', dur: '3.2s', delay: '0s' },
    { px: 90, py: -50, size: 4, color: '#EC4899', dur: '4.1s', delay: '0.6s' },
    { px: -40, py: -90, size: 2, color: '#818CF8', dur: '3.8s', delay: '1.2s' },
    { px: 70, py: 80, size: 3, color: '#C026D3', dur: '2.9s', delay: '0.3s' },
    { px: -100, py: 20, size: 2, color: '#A855F7', dur: '4.5s', delay: '1.8s' },
    { px: 50, py: -110, size: 4, color: '#EC4899', dur: '3.5s', delay: '0.9s' },
];

/* ── Main component ──────────────────────────────────────── */
const UniversityOrb3D = ({ universities = [] }) => {
    injectStyles();

    // Use dynamic universities or fallback to static badges
    const displayBadges = universities.length > 0
        ? universities.slice(0, 5).map((u, i) => ({
            label: u.name.split(' ')[0], // Kurz name for badge
            fullName: u.name,
            angle: i * (360 / Math.min(5, universities.length)),
            color: ['#7C3AED', '#C026D3', '#4F46E5', '#9333EA', '#7C3AED'][i % 5],
            dur: `${2.5 + (i * 0.3)}s`
        }))
        : BADGES;

    return (
        <div
            className="relative w-full h-full flex items-center justify-center select-none"
            style={{ perspective: 800 }}
        >
            {/* Ambient glow — static, no animation needed */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full"
                    style={{ background: 'radial-gradient(circle, #7C3AED1A 0%, transparent 70%)' }} />
            </div>

            {/* Scene */}
            <div style={{ position: 'relative', width: 280, height: 280 }}>

                {/* Rings — pure CSS spin, GPU only */}
                {RINGS.map((r, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            width: r.size,
                            height: r.size,
                            marginLeft: -r.size / 2,
                            marginTop: -r.size / 2,
                            borderRadius: '50%',
                            border: `1.5px ${r.dashed ? 'dashed' : 'solid'} ${r.color}`,
                            transform: `rotateX(${r.tilt}deg)`,
                            animation: `orb-spin ${r.dur} linear infinite`,
                            willChange: 'transform',
                        }}
                    />
                ))}

                {/* Travel dots — ring wrapper spins, dot just sits at top */}
                {DOTS.map((d, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            width: d.size,
                            height: d.size,
                            marginLeft: -d.size / 2,
                            marginTop: -d.size / 2,
                            transform: `rotateX(${d.tilt}deg)`,
                            animation: `orb-spin ${d.dur} linear infinite`,
                            willChange: 'transform',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: -4,
                                left: '50%',
                                width: 8,
                                height: 8,
                                marginLeft: -4,
                                borderRadius: '50%',
                                background: d.color,
                                boxShadow: `0 0 10px 3px ${d.color}`,
                            }}
                        />
                    </div>
                ))}

                {/* Core sphere — scale pulse only, no boxShadow animation */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 35% 35%, #A78BFA, #6D28D9 50%, #1e0050)',
                        boxShadow: '0 0 40px 10px #7C3AED60, inset 0 0 20px #ffffff20',
                        animation: 'orb-pulse 3.5s ease-in-out infinite',
                        willChange: 'transform',
                    }}
                >
                    {/* Shine highlight — static */}
                    <div style={{
                        position: 'absolute', top: 10, left: 12,
                        width: 22, height: 14, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.22)',
                        filter: 'blur(3px)',
                        transform: 'rotate(-20deg)',
                    }} />
                </div>

                {/* Orbiting badges — CSS float animation, no backdrop-blur */}
                {displayBadges.map((b) => {
                    const rad = (b.angle * Math.PI) / 180;
                    const bx = Math.cos(rad) * RADIUS;
                    const by = Math.sin(rad) * RADIUS;
                    return (
                        <div
                            key={b.label}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                '--bx': `${bx - 28}px`,
                                '--by': `${by - 13}px`,
                                animation: `badge-float ${b.dur} ease-in-out infinite`,
                                willChange: 'transform',
                                zIndex: 10,
                            }}
                        >
                            <div
                                className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                                style={{
                                    background: `${b.color}28`,
                                    border: `1px solid ${b.color}55`,
                                    boxShadow: `0 0 8px ${b.color}35`,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {b.label}
                            </div>
                        </div>
                    );
                })}

                {/* Particles — memoised positions, CSS fade+float */}
                {PARTICLE_DATA.map((p, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            width: p.size,
                            height: p.size,
                            borderRadius: '50%',
                            background: p.color,
                            boxShadow: `0 0 5px 2px ${p.color}`,
                            '--px': `${p.px}px`,
                            '--py': `${p.py}px`,
                            animation: `orb-fade ${p.dur} ease-in-out ${p.delay} infinite`,
                            willChange: 'transform, opacity',
                        }}
                    />
                ))}
            </div>

            {/* Ground reflection — static */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 110,
                    height: 20,
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse, #7C3AED28 0%, transparent 80%)',
                    filter: 'blur(5px)',
                }}
            />
        </div>
    );
};


export default UniversityOrb3D;
