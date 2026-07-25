import React, { useEffect, useRef } from 'react';

/**
 * AlyraOrb - High-Performance Cinematic Energy Ribbons
 * 
 * Optimization Log:
 * 1. Capped DPR to 1.5 (1.0 on mobile) to reduce fill rate pressure.
 * 2. Increased point step size (10 -> 20) to halve the geometry calculation.
 * 3. Reduced blur passes on mobile devices.
 * 4. Used 'screen' blending for better performance than 'lighter' where possible.
 */
const AlyraOrb = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: Disable alpha channel if opaque background
        let animationFrameId;

        const LOOP_DURATION = 8000;
        const startTime = Date.now();

        let cachedBgGrad = null;
        let isMobile = window.innerWidth < 768;

        const resize = () => {
            isMobile = window.innerWidth < 768;
            // Cap DPR to 1.0 to significantly reduce pixel processing load
            const dpr = 1.0;

            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            // Deep satin black background foundation
            cachedBgGrad = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
            cachedBgGrad.addColorStop(0, 'rgba(4, 2, 10, 1)');
            cachedBgGrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
        };

        const handleMouseMove = (e) => {
            mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 40;
            mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 40;
        };

        const generateRibbonPath = (xBase, slant, amp, globalTime, direction, phaseOffset = 0) => {
            const path = new Path2D();
            const loopT = (globalTime % LOOP_DURATION) / LOOP_DURATION;
            const phaseShift = (loopT * Math.PI * 2) + phaseOffset;

            const points = [];
            // Optimization: Increased step size to reduce point count (45 mobile, 30 desktop)
            const step = isMobile ? 45 : 30;

            for (let y = -200; y < window.innerHeight + 200; y += step) {
                const yNorm = y / window.innerHeight;

                // Pure majestic S-curve
                const waveX = Math.sin(yNorm * 1.4 * Math.PI - (phaseShift * 0.4 * direction)) * amp;

                // Organic slant
                const slantOffset = slant * (yNorm - 0.5);

                const mouseShift = mouseRef.current.currentX * (0.12 + (1 - yNorm) * 0.18);
                const x = xBase + slantOffset + waveX + mouseShift;
                points.push({ x, y });
            }

            if (points.length > 0) {
                path.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    const xc = (points[i].x + points[i - 1].x) / 2;
                    const yc = (points[i].y + points[i - 1].y) / 2;
                    path.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
                }
            }
            return path;
        };

        let isVisible = true;
        let lastFrameTime = 0;
        // Target ~45fps (22ms) on desktop, ~30fps (33ms) on mobile to reduce CPU pressure
        const FRAME_BUDGET = isMobile ? 33 : 22;

        const render = (timestamp = 0) => {
            if (!isVisible) {
                animationFrameId = null;
                return;
            }

            // Frame throttle — skip frame if budget not elapsed
            if (timestamp - lastFrameTime < FRAME_BUDGET) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }
            lastFrameTime = timestamp;

            const currentTime = Date.now() - startTime;
            mouseRef.current.currentX += (mouseRef.current.targetX - mouseRef.current.currentX) * 0.04;
            mouseRef.current.currentY += (mouseRef.current.targetY - mouseRef.current.currentY) * 0.04;

            ctx.fillStyle = cachedBgGrad || '#000';
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            ctx.save();

            // Subtle camera movement
            const camOsc = Math.sin(currentTime * 0.0006) * 12;
            ctx.translate(camOsc, 0);

            const areaWidth = window.innerWidth * 0.15;

            const configs = [
                { x: window.innerWidth - areaWidth * 0.7, slant: 60, amp: areaWidth * 0.6, color: '#e000ff', dir: 1, phase: 0 },
                { x: window.innerWidth - areaWidth * 0.3, slant: -60, amp: areaWidth * 0.5, color: '#0084ff', dir: -1, phase: Math.PI }
            ];

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // 'lighter' is expensive, consider reducing usage or switching to screen if possible, but lighter looks best for glowing energy
            ctx.globalCompositeOperation = 'lighter';

            configs.forEach(cfg => {
                const mainPath = generateRibbonPath(cfg.x, cfg.slant, cfg.amp, currentTime, cfg.dir, cfg.phase);

                ctx.save();

                // 1. LIQUID-GLASS HOLLOW BODY
                // Simplified gradient creation
                const bodyGrad = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
                bodyGrad.addColorStop(0, `${cfg.color}10`);
                bodyGrad.addColorStop(0.5, `${cfg.color}40`);
                bodyGrad.addColorStop(1, `${cfg.color}10`);

                const edgeSeparation = isMobile ? 8 : 18;

                // Draw edges
                [-1, 1].forEach(side => {
                    ctx.save();
                    ctx.translate(side * (edgeSeparation / 2), 0);
                    ctx.strokeStyle = bodyGrad;
                    ctx.lineWidth = isMobile ? 3 : 8;
                    ctx.globalAlpha = 0.3;
                    // Disable blur on mobile/mid-range for performance
                    if (!isMobile && window.innerWidth > 1024) ctx.filter = 'blur(1px)';
                    ctx.stroke(mainPath);
                    ctx.restore();
                });

                // 2. REFLECTIVE SPECULAR HIGHLIGHTS
                const separation = isMobile ? 25 : 65;
                const individualTiming = currentTime + (cfg.phase * 500);
                const streakT = (individualTiming % 5000) / 5000;
                const streakPos = (streakT * 6000 * cfg.dir) + (cfg.dir === -1 ? 3000 : -3000);

                const specularGrad = ctx.createLinearGradient(0, streakPos - 600, 0, streakPos + 600);
                specularGrad.addColorStop(0, 'transparent');
                specularGrad.addColorStop(0.4, cfg.color);
                specularGrad.addColorStop(0.48, '#ffffff');
                specularGrad.addColorStop(0.5, '#ffffff');
                specularGrad.addColorStop(0.52, '#ffffff');
                specularGrad.addColorStop(0.6, cfg.color);
                specularGrad.addColorStop(1, 'transparent');

                [-1, 1].forEach(side => {
                    ctx.save();
                    ctx.translate(side * (separation / 2), 0);

                    // Deeper atmospheric base - Reduced complexity
                    ctx.strokeStyle = cfg.color;
                    ctx.lineWidth = 20;
                    ctx.globalAlpha = 0.15;
                    if (!isMobile && window.innerWidth > 1024) ctx.filter = 'blur(8px)'; // Reduce heavy blur radius
                    ctx.stroke(mainPath);

                    // High-intensity white-hot core streak
                    ctx.strokeStyle = specularGrad;
                    // Thinner line needs less processing
                    ctx.lineWidth = 4;
                    ctx.globalAlpha = 1.0;
                    // ctx.filter = 'blur(0.5px)'; // Removed sub-pixel blur for perf
                    ctx.stroke(mainPath);

                    // Reduced bloom layers on mobile
                    if (!isMobile) {
                        ctx.globalAlpha = 0.4;
                        ctx.lineWidth = side === 1 ? 12 : 6;
                        ctx.filter = 'blur(2px)';
                        ctx.stroke(mainPath);
                    }

                    ctx.restore();
                });

                // 2.5 PURPLE ENERGY STREAKS
                // Reduced count of streaks for performance
                const purpleMain = '#e000ff';
                const purpleHighlight = '#ffb0ff';

                // Simplied streaks array
                const extraPurpleStreaks = cfg.color === '#0084ff'
                    ? [{ offset: 800, speed: 3500, width: 3.5, alpha: 0.95, blur: 1.2, xShift: 15 }]
                    : [{ offset: 1800, speed: 4800, width: 4.5, alpha: 0.7, blur: 3, xShift: -12 }];

                if (!isMobile) {
                    // Add secondary streaks only on desktop
                    if (cfg.color === '#0084ff') extraPurpleStreaks.push({ offset: 3200, speed: 5200, width: 2.5, alpha: 0.75, blur: 2.5, xShift: -10 });
                }

                extraPurpleStreaks.forEach(s => {
                    const pTiming = currentTime + s.offset + (cfg.phase * 1500);
                    const pT = (pTiming % s.speed) / s.speed;
                    const pPos = (pT * 10000 * cfg.dir) + (cfg.dir === -1 ? 5000 : -5000);

                    const pGrad = ctx.createLinearGradient(0, pPos - 1200, 0, pPos + 1200);
                    pGrad.addColorStop(0, 'transparent');
                    pGrad.addColorStop(0.4, purpleMain);
                    pGrad.addColorStop(0.5, '#ffffff');
                    pGrad.addColorStop(0.6, purpleHighlight);
                    pGrad.addColorStop(1, 'transparent');

                    ctx.save();
                    ctx.translate(s.xShift, 0);

                    // Single pass for streak instead of double pass
                    ctx.strokeStyle = pGrad;
                    ctx.lineWidth = s.width;
                    ctx.globalAlpha = s.alpha;
                    if (!isMobile) ctx.filter = `blur(${s.blur}px)`;
                    ctx.stroke(mainPath);

                    ctx.restore();
                });

                // 3. ATMOSPHERIC SHIMMER
                // Simplified for performance
                ctx.strokeStyle = cfg.color;
                ctx.lineWidth = isMobile ? 150 : 300;
                ctx.globalAlpha = 0.03;
                if (!isMobile) ctx.filter = 'blur(60px)';
                ctx.stroke(mainPath);

                ctx.restore();
            });

            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible && !animationFrameId) {
                    render();
                } else if (!isVisible && animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            });
            // Optimization: Unobserve if not needed or managing visibility manually better? 
            // IntersectionObserver is good.
        }, { threshold: 0 });

        observer.observe(canvas);
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        // Initial setup
        resize();
        animationFrameId = requestAnimationFrame(render);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

export default AlyraOrb;
