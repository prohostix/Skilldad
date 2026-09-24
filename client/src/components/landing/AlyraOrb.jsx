import React, { useEffect, useRef } from 'react';

/**
 * AlyraOrb - High-Performance Cinematic Energy Ribbons
 * Elegant, dimmed, translucent ribbons positioned strictly within the right 10-15% of the page.
 */
const AlyraOrb = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        let animationFrameId;

        const LOOP_DURATION = 8000;
        const startTime = Date.now();

        let isMobile = window.innerWidth < 768;

        const resize = () => {
            isMobile = window.innerWidth < 768;
            const dpr = 1.0;
            const w = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
            const h = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;

            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
        };

        const handleMouseMove = (e) => {
            mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 25;
            mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 25;
        };

        const generateRibbonPath = (xBase, slant, amp, globalTime, direction, phaseOffset = 0) => {
            const path = new Path2D();
            const loopT = (globalTime % LOOP_DURATION) / LOOP_DURATION;
            const phaseShift = (loopT * Math.PI * 2) + phaseOffset;

            const points = [];
            const step = isMobile ? 40 : 25;
            const h = canvas.height || window.innerHeight;

            for (let y = -150; y < h + 150; y += step) {
                const yNorm = y / h;

                // Gentle S-curve
                const waveX = Math.sin(yNorm * 1.3 * Math.PI - (phaseShift * 0.4 * direction)) * amp;

                // Organic slant
                const slantOffset = slant * (yNorm - 0.5);

                const mouseShift = mouseRef.current.currentX * (0.08 + (1 - yNorm) * 0.12);
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
        const FRAME_BUDGET = isMobile ? 33 : 20;

        const render = (timestamp = 0) => {
            if (!isVisible) {
                animationFrameId = null;
                return;
            }

            if (timestamp - lastFrameTime < FRAME_BUDGET) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }
            lastFrameTime = timestamp;

            const currentTime = Date.now() - startTime;
            mouseRef.current.currentX += (mouseRef.current.targetX - mouseRef.current.currentX) * 0.04;
            mouseRef.current.currentY += (mouseRef.current.targetY - mouseRef.current.currentY) * 0.04;

            const w = canvas.width || window.innerWidth;
            const h = canvas.height || window.innerHeight;

            ctx.clearRect(0, 0, w, h);

            ctx.save();

            // Subtle camera oscillation
            const camOsc = Math.sin(currentTime * 0.0006) * 8;
            ctx.translate(camOsc, 0);

            // Confine to right 10-15% space of the page
            const areaWidth = Math.max(140, w * 0.12);

            const configs = [
                { x: w - areaWidth * 0.65, slant: 38, amp: areaWidth * 0.38, color: '#e000ff', dir: 1, phase: 0 },
                { x: w - areaWidth * 0.28, slant: -32, amp: areaWidth * 0.30, color: '#0084ff', dir: -1, phase: Math.PI }
            ];

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const isLightMode = !document.documentElement.classList.contains('dark') || document.documentElement.classList.contains('light-mode');
            ctx.globalCompositeOperation = isLightMode ? 'source-over' : 'lighter';

            configs.forEach(cfg => {
                const mainPath = generateRibbonPath(cfg.x, cfg.slant, cfg.amp, currentTime, cfg.dir, cfg.phase);

                ctx.save();

                // 1. LIQUID-GLASS HOLLOW BODY (Dim, soft gradient)
                const bodyGrad = ctx.createLinearGradient(0, 0, 0, h);
                bodyGrad.addColorStop(0, `${cfg.color}06`);
                bodyGrad.addColorStop(0.5, `${cfg.color}30`);
                bodyGrad.addColorStop(1, `${cfg.color}06`);

                const edgeSeparation = isMobile ? 6 : 14;

                [-1, 1].forEach(side => {
                    ctx.save();
                    ctx.translate(side * (edgeSeparation / 2), 0);
                    ctx.strokeStyle = bodyGrad;
                    ctx.lineWidth = isMobile ? 2 : 3.5;
                    ctx.globalAlpha = 0.28;
                    if (!isMobile) ctx.filter = 'blur(1px)';
                    ctx.stroke(mainPath);
                    ctx.restore();
                });

                // 2. REFLECTIVE SPECULAR HIGHLIGHTS (Dimmed, gentle shimmer)
                const separation = isMobile ? 18 : 45;
                const individualTiming = currentTime + (cfg.phase * 500);
                const streakT = (individualTiming % 5000) / 5000;
                const streakPos = (streakT * 5000 * cfg.dir) + (cfg.dir === -1 ? 2500 : -2500);

                const specularGrad = ctx.createLinearGradient(0, streakPos - 450, 0, streakPos + 450);
                specularGrad.addColorStop(0, 'transparent');
                specularGrad.addColorStop(0.38, cfg.color);
                specularGrad.addColorStop(0.48, 'rgba(255, 255, 255, 0.7)');
                specularGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
                specularGrad.addColorStop(0.52, 'rgba(255, 255, 255, 0.7)');
                specularGrad.addColorStop(0.62, cfg.color);
                specularGrad.addColorStop(1, 'transparent');

                [-1, 1].forEach(side => {
                    ctx.save();
                    ctx.translate(side * (separation / 2), 0);

                    // Deeper atmospheric glow base
                    ctx.strokeStyle = cfg.color;
                    ctx.lineWidth = isMobile ? 10 : 18;
                    ctx.globalAlpha = 0.08;
                    if (!isMobile) ctx.filter = 'blur(6px)';
                    ctx.stroke(mainPath);

                    // Subtle core streak (dimmed)
                    ctx.strokeStyle = specularGrad;
                    ctx.lineWidth = isMobile ? 2 : 3;
                    ctx.globalAlpha = 0.42;
                    ctx.stroke(mainPath);

                    // Bloom layer
                    if (!isMobile) {
                        ctx.globalAlpha = 0.16;
                        ctx.lineWidth = side === 1 ? 8 : 4;
                        ctx.filter = 'blur(2px)';
                        ctx.stroke(mainPath);
                    }

                    ctx.restore();
                });

                // 3. PURPLE ENERGY STREAKS (Dimmed)
                const purpleMain = '#e000ff';
                const purpleHighlight = '#ffb0ff';

                const extraPurpleStreaks = cfg.color === '#0084ff'
                    ? [{ offset: 800, speed: 3800, width: 2.5, alpha: 0.26, blur: 1.5, xShift: 10 }]
                    : [{ offset: 1800, speed: 4800, width: 3, alpha: 0.22, blur: 2, xShift: -8 }];

                extraPurpleStreaks.forEach(s => {
                    const pTiming = currentTime + s.offset + (cfg.phase * 1500);
                    const pT = (pTiming % s.speed) / s.speed;
                    const pPos = (pT * 8000 * cfg.dir) + (cfg.dir === -1 ? 4000 : -4000);

                    const pGrad = ctx.createLinearGradient(0, pPos - 800, 0, pPos + 800);
                    pGrad.addColorStop(0, 'transparent');
                    pGrad.addColorStop(0.4, purpleMain);
                    pGrad.addColorStop(0.5, '#ffffff');
                    pGrad.addColorStop(0.6, purpleHighlight);
                    pGrad.addColorStop(1, 'transparent');

                    ctx.save();
                    ctx.translate(s.xShift, 0);

                    ctx.strokeStyle = pGrad;
                    ctx.lineWidth = s.width;
                    ctx.globalAlpha = s.alpha;
                    if (!isMobile) ctx.filter = `blur(${s.blur}px)`;
                    ctx.stroke(mainPath);

                    ctx.restore();
                });

                // 4. ATMOSPHERIC SHIMMER
                ctx.strokeStyle = cfg.color;
                ctx.lineWidth = isMobile ? 80 : 160;
                ctx.globalAlpha = 0.02;
                if (!isMobile) ctx.filter = 'blur(45px)';
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
