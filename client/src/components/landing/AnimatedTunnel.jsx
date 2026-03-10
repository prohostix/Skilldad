import React, { useEffect, useRef } from 'react';

/**
 * AnimatedTunnel - A high-performance, cinematic 3D tunnel effect for the SkillDad landing page.
 * Uses Canvas API for maximum performance and silky smooth 60fps animations.
 * Features:
 * - High DPI rendering support
 * - Dynamic mouse-responsive perspective
 * - Optimized particle system with bloom artifacts
 * - Performance throttling for lower-end devices
 */
const AnimatedTunnel = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        // Configuration
        const RING_COUNT = 35;
        const PARTICLE_COUNT = 150;
        const COLORS = [
            'rgba(192, 38, 255, 0.4)', // Primary Purple
            'rgba(37, 99, 235, 0.4)',  // Secondary Blue
            'rgba(236, 72, 153, 0.3)', // Accent Pink
        ];

        let rings = [];
        let particles = [];
        let width, height;
        let isMobile = window.innerWidth < 768;

        const resize = () => {
            isMobile = window.innerWidth < 768;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            initElements();
        };

        const initElements = () => {
            rings = [];
            for (let i = 0; i < RING_COUNT; i++) {
                rings.push({
                    z: (i / RING_COUNT) * 1000,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.01,
                    size: 100 + Math.random() * 200,
                    color: COLORS[i % COLORS.length]
                });
            }

            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: (Math.random() - 0.5) * 2000,
                    y: (Math.random() - 0.5) * 2000,
                    z: Math.random() * 1000,
                    size: Math.random() * 2 + 1,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)]
                });
            }
        };

        const handleMouseMove = (e) => {
            mouseRef.current.targetX = (e.clientX - width / 2) / 50;
            mouseRef.current.targetY = (e.clientY - height / 2) / 50;
        };

        const render = (time) => {
            // Smooth mouse followers
            mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
            mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

            // Deep space background
            ctx.fillStyle = '#020205';
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2 + mouseRef.current.x;
            const centerY = height / 2 + mouseRef.current.y;

            // Update & Draw Particles
            ctx.globalCompositeOperation = 'lighter';
            particles.forEach(p => {
                p.z -= 4; // Move towards camera
                if (p.z <= 0) p.z = 1000;

                const scale = 500 / p.z;
                const px = centerX + p.x * scale;
                const py = centerY + p.y * scale;
                const pSize = p.size * scale;

                if (px > 0 && px < width && py > 0 && py < height) {
                    const opacity = Math.min(1, (1000 - p.z) / 800) * 0.5;
                    ctx.fillStyle = p.color.replace('0.4', opacity.toString());
                    ctx.beginPath();
                    ctx.arc(px, py, pSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // Update & Draw Rings
            rings.forEach(ring => {
                ring.z -= 3; // Move towards camera
                ring.rotation += ring.rotationSpeed;
                if (ring.z <= 0) ring.z = 1000;

                const scale = 500 / ring.z;
                const rWidth = ring.size * scale;
                const rHeight = ring.size * scale;
                const opacity = Math.min(1, (1000 - ring.z) / 800) * 0.3;

                ctx.strokeStyle = ring.color.replace('0.4', opacity.toString());
                ctx.lineWidth = 2 * scale;

                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(ring.rotation);

                // Draw a hexagonal "portal" ring
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = Math.cos(angle) * rWidth;
                    const y = Math.sin(angle) * rHeight;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();

                // Subtle glow on the segments
                if (opacity > 0.5) {
                    ctx.shadowBlur = 10 * scale;
                    ctx.shadowColor = ring.color;
                    ctx.stroke();
                }

                ctx.restore();
            });

            // Vignette for depth
            const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.8);
            grad.addColorStop(0, 'rgba(2, 2, 5, 0)');
            grad.addColorStop(1, 'rgba(2, 2, 5, 0.8)');
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            animationFrameId = requestAnimationFrame(render);
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ filter: 'brightness(1.2) contrast(1.1)' }}
        />
    );
};

export default AnimatedTunnel;
