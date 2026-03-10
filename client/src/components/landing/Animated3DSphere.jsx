import React from 'react';

/*
  Animated3DSphere — Performance-optimised
  • Every animation uses CSS keyframes → GPU-composited transform/opacity only
  • No Framer Motion used (was 43+ simultaneous motion instances)
  • No width/height/margin animation (caused layout reflows every frame)
  • Energy waves now scale from center, not width/height expand
  • Particle positions fixed at module level — no render-time Math.random()
  • will-change: transform on all animated layers
*/

/* ── CSS injected once ─────────────────────────────────────── */
const CSS = `
@keyframes s3d-rotY    { to { transform: rotateY(360deg); } }
@keyframes s3d-pulse   { 0%,100%{transform:translate(-50%,-50%) scale(1)}
                          50%{transform:translate(-50%,-50%) scale(1.10)} }
@keyframes s3d-ringZ   { to { transform: var(--ring-base) rotateZ(360deg); } }
@keyframes s3d-wave    { 0%   { transform:translate(-50%,-50%) scale(0.28); opacity:0.7; }
                          100% { transform:translate(-50%,-50%) scale(1);    opacity:0;   } }
@keyframes s3d-dot     { 0%,100%{opacity:0.4; transform:translate(var(--dx),var(--dy)) scale(1)}
                          50%   {opacity:1;   transform:translate(var(--dx),var(--dy)) scale(1.6)} }
@keyframes s3d-line    { 0%,100%{opacity:0; stroke-dashoffset:var(--dl)}
                          50%   {opacity:0.6; stroke-dashoffset:0} }
`;

let injected = false;
if (typeof document !== 'undefined' && !injected) {
    injected = true;
    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
}

/* ── Static data ──────────────────────────────────────────── */
const RINGS = [
    { size: 200, dur: '15s', color: '#C026FF', opacity: 0.6, rx: 75, rz: 0 },
    { size: 240, dur: '18s', color: '#8B5CF6', opacity: 0.5, rx: 60, rz: 45 },
    { size: 280, dur: '20s', color: '#7C3AED', opacity: 0.4, rx: 45, rz: 90 },
];

// 8 particles per ring — positions computed once at module load
const RING_PARTICLES = RINGS.map(ring =>
    Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI * 2) / 8;
        return {
            dx: Math.cos(a) * (ring.size / 2),
            dy: Math.sin(a) * (ring.size / 2),
            color: ring.color,
            delay: `${i * 0.25}s`,
            dur: '2s',
        };
    })
);

// 12 outer data points
const DATA_POINTS = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI * 2) / 12;
    return {
        dx: Math.cos(a) * 168,
        dy: Math.sin(a) * 168,
        delay: `${i * 0.2}s`,
    };
});

// 6 SVG connecting lines
const LINES = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI * 2) / 6;
    return {
        x1: 175 + Math.cos(a) * 60,
        y1: 175 + Math.sin(a) * 60,
        x2: 175 + Math.cos(a) * 148,
        y2: 175 + Math.sin(a) * 148,
        delay: `${i * 0.5}s`,
        len: 88, // approximate dash length
    };
});

/* ── Component ────────────────────────────────────────────── */
const Animated3DSphere = () => (
    <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: '1200px' }}
    >
        {/* Spinning outer container */}
        <div
            style={{
                position: 'relative',
                width: 350,
                height: 350,
                transformStyle: 'preserve-3d',
                animation: 's3d-rotY 25s linear infinite',
                willChange: 'transform',
            }}
        >
            {/* Central sphere — scale pulse only */}
            <div
                className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full"
                style={{
                    background: 'radial-gradient(circle at 30% 30%, #E879F9 0%, #C026FF 30%, #7C3AED 60%, #4C1D95 100%)',
                    boxShadow: '0 0 80px rgba(192,38,255,0.7), 0 0 120px rgba(124,58,237,0.4), inset 0 0 40px rgba(255,255,255,0.15)',
                    animation: 's3d-pulse 4s ease-in-out infinite',
                    willChange: 'transform',
                }}
            />

            {/* Orbital rings */}
            {RINGS.map((ring, ri) => (
                <div
                    key={ri}
                    className="absolute top-1/2 left-1/2 rounded-full border-2"
                    style={{
                        width: ring.size,
                        height: ring.size,
                        marginLeft: -ring.size / 2,
                        marginTop: -ring.size / 2,
                        borderColor: ring.color,
                        opacity: ring.opacity,
                        /* CSS var trick: set base transform, animation builds on it */
                        '--ring-base': `rotateX(${ring.rx}deg) rotateZ(${ring.rz}deg)`,
                        transform: `rotateX(${ring.rx}deg) rotateZ(${ring.rz}deg)`,
                        transformStyle: 'preserve-3d',
                        animation: `s3d-ringZ ${ring.dur} linear infinite`,
                        willChange: 'transform',
                    }}
                >
                    {/* Ring particles — opacity+scale only */}
                    {RING_PARTICLES[ri].map((p, pi) => (
                        <div
                            key={pi}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                left: '50%',
                                top: '50%',
                                backgroundColor: p.color,
                                boxShadow: `0 0 8px ${p.color}`,
                                '--dx': `${p.dx - 4}px`,
                                '--dy': `${p.dy - 4}px`,
                                animation: `s3d-dot ${p.dur} ease-in-out ${p.delay} infinite`,
                                willChange: 'transform, opacity',
                            }}
                        />
                    ))}
                </div>
            ))}

            {/* Floating outer data points */}
            {DATA_POINTS.map((pt, i) => (
                <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-primary-light"
                    style={{
                        left: '50%',
                        top: '50%',
                        boxShadow: '0 0 8px rgba(139,92,246,0.8)',
                        '--dx': `${pt.dx - 3}px`,
                        '--dy': `${pt.dy - 3}px`,
                        animation: `s3d-dot 3s ease-in-out ${pt.delay} infinite`,
                        willChange: 'transform, opacity',
                    }}
                />
            ))}
        </div>

        {/* Energy waves — scale from center, NOT width/height expand */}
        {[0, 1, 2].map(i => (
            <div
                key={i}
                className="absolute top-1/2 left-1/2 rounded-full border border-primary/30"
                style={{
                    width: 360,
                    height: 360,
                    animation: `s3d-wave 3s ease-out ${i}s infinite`,
                    willChange: 'transform, opacity',
                }}
            />
        ))}

        {/* Ambient glow — static */}
        <div
            className="absolute inset-0 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #C026FF 0%, #7C3AED 40%, transparent 70%)' }}
        />

        {/* Connecting lines SVG */}
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
        >
            <defs>
                <linearGradient id="sLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C026FF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.2" />
                </linearGradient>
            </defs>
            {LINES.map((ln, i) => (
                <line
                    key={i}
                    x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                    stroke="url(#sLineGrad)"
                    strokeWidth="1"
                    strokeDasharray={ln.len}
                    style={{
                        '--dl': ln.len,
                        animation: `s3d-line 3s ease-in-out ${ln.delay} infinite`,
                        willChange: 'opacity',
                    }}
                />
            ))}
        </svg>
    </div>
);

export default Animated3DSphere;
