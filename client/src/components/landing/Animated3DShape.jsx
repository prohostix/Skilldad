import React from 'react';

/*
  Animated3DShape — Performance-optimised
  • All animations use CSS keyframes (GPU-composited transform+opacity only)
  • No Framer Motion infinite loops (reduced from multiple instances to 0)
  • Eliminated backdrop-blur on rotating cube faces (very expensive)
  • Pre-computed particle positions
  • will-change: transform on all animated layers
*/

const CSS = `
@keyframes s3d-cube-rotate { 
    0% { transform: rotateX(0deg) rotateY(0deg); }
    100% { transform: rotateX(360deg) rotateY(360deg); }
}
@keyframes s3d-face-pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.5; }
}
@keyframes s3d-core-pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
    50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
}
@keyframes s3d-particle-orbit {
    0% { transform: rotate(0deg) translate(var(--rx), var(--ry)) scale(1); opacity: 0.4; }
    50% { transform: rotate(180deg) translate(var(--rx), var(--ry)) scale(1.3); opacity: 0.8; }
    100% { transform: rotate(360deg) translate(var(--rx), var(--ry)) scale(1); opacity: 0.4; }
}
`;

let injected = false;
if (typeof document !== 'undefined' && !injected) {
    injected = true;
    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
}

const FACES = [
    { transform: 'rotateY(0deg) translateZ(150px)', bg: 'from-primary/20 to-primary/10' },
    { transform: 'rotateY(90deg) translateZ(150px)', bg: 'from-purple-500/20 to-purple-500/10' },
    { transform: 'rotateY(180deg) translateZ(150px)', bg: 'from-primary-dark/20 to-primary-dark/10' },
    { transform: 'rotateY(-90deg) translateZ(150px)', bg: 'from-primary-light/20 to-primary-light/10' },
    { transform: 'rotateX(90deg) translateZ(150px)', bg: 'from-purple-600/20 to-purple-600/10' },
    { transform: 'rotateX(-90deg) translateZ(150px)', bg: 'from-primary-accent/20 to-primary-accent/10' },
];

const PARTICLES = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 6;
    const radius = 120;
    return {
        rx: `${Math.cos(angle) * radius}px`,
        ry: `${Math.sin(angle) * radius}px`,
        delay: `${i * 0.4}s`
    };
});

const Animated3DShape = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none" style={{ perspective: '1000px' }}>
            {/* Main 3D Cube Container */}
            <div
                style={{
                    position: 'relative',
                    width: '300px',
                    height: '300px',
                    transformStyle: 'preserve-3d',
                    animation: 's3d-cube-rotate 20s linear infinite',
                    willChange: 'transform'
                }}
            >
                {/* Cube Faces */}
                {FACES.map((face, index) => (
                    <div
                        key={index}
                        className={`absolute w-[300px] h-[300px] bg-gradient-to-br ${face.bg} border border-primary/25`}
                        style={{
                            transform: face.transform,
                            transformStyle: 'preserve-3d',
                            animation: `s3d-face-pulse 4s ease-in-out ${index * 0.5}s infinite`,
                            willChange: 'opacity',
                            boxShadow: '0 0 30px rgba(192, 38, 255, 0.3), inset 0 0 30px rgba(192, 38, 255, 0.2)'
                        }}
                    >
                        {/* Grid Pattern — static */}
                        <div className="absolute inset-0 opacity-20">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={`h-${i}`}
                                    className="absolute w-full h-px bg-primary/40"
                                    style={{ top: `${(i + 1) * 16.66}%` }}
                                />
                            ))}
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={`v-${i}`}
                                    className="absolute h-full w-px bg-primary/40"
                                    style={{ left: `${(i + 1) * 16.66}%` }}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Center Glowing Sphere */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #C026FF 0%, #7C3AED 50%, transparent 70%)',
                        boxShadow: '0 0 80px rgba(192, 38, 255, 0.8), 0 0 120px rgba(124, 58, 237, 0.6), 0 0 160px rgba(192, 38, 255, 0.4)',
                        animation: 's3d-core-pulse 3s ease-in-out infinite',
                        willChange: 'transform, opacity'
                    }}
                />
            </div>

            {/* Orbiting Particles */}
            {PARTICLES.map((p, i) => (
                <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-primary-light"
                    style={{
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.8), 0 0 30px rgba(192, 38, 255, 0.5)',
                        left: '50%',
                        top: '50%',
                        '--rx': p.rx,
                        '--ry': p.ry,
                        animation: `s3d-particle-orbit 8s linear ${p.delay} infinite`,
                        willChange: 'transform, opacity'
                    }}
                />
            ))}

            {/* Background Glow */}
            <div
                className="absolute inset-0 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, #C026FF 0%, #7C3AED 30%, transparent 70%)'
                }}
            />
        </div>
    );
};

export default Animated3DShape;
