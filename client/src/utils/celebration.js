/**
 * celebration.js – SkillDad Milestone Celebration Animation
 *
 * Usage:
 *   import { showCelebration } from '../utils/celebration';
 *   showCelebration();                          // default center burst
 *   showCelebration({ x: 400, y: 200 });        // burst from custom coord
 *
 * Named milestone helpers:
 *   celebrateEnrollment()   – student successfully enrolled
 *   celebrateCourse()       – course / module completed
 *   celebrateCertificate()  – certificate earned
 *   celebrateCareer()       – career journey step completed
 *
 * Features:
 *  • Canvas + requestAnimationFrame – zero extra dependencies, fully performant
 *  • Particle types: confetti rectangles, circles, 5-point stars, 4-point sparkles, curved streamers
 *  • SkillDad palette: purple, lavender, white, soft gold, rose pink
 *  • Physics: gravity, air drag, rotation/spin, opacity fade
 *  • Non-blocking: canvas is pointer-events:none so users can still interact
 *  • Auto-cleanup: canvas element removed after ~1.8 seconds
 *  • Returns a cleanup function for early cancellation (e.g. on unmount)
 *  • Respects prefers-reduced-motion – skips animation silently
 */

// ── SkillDad celebration palette ─────────────────────────────────────────────
const COLORS = [
  '#6D28FF', // SkillDad purple
  '#8B5CF6', // medium violet
  '#C4B5FD', // lavender
  '#E9D5FF', // pale lavender
  '#FFFFFF', // white
  '#F5F3FF', // near-white tint
  '#F0ABFC', // soft pink / fuchsia
  '#FDE68A', // warm gold
  '#DDD6FE', // periwinkle lavender
  '#A78BFA', // muted violet
  '#FECDD3', // blush rose
];

// ── Particle types ────────────────────────────────────────────────────────────
const TYPES = ['rect', 'circle', 'star', 'sparkle', 'streamer'];

// ── Helpers ───────────────────────────────────────────────────────────────────
const rnd  = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Draw a single particle ────────────────────────────────────────────────────
function drawParticle(ctx, p) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, p.alpha);
  ctx.fillStyle   = p.color;
  ctx.strokeStyle = p.color;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  switch (p.type) {
    case 'rect': {
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      break;
    }
    case 'circle': {
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'star': {
      const spikes = 5;
      const outer  = p.r;
      const inner  = p.r * 0.45;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const a   = (i * Math.PI) / spikes - Math.PI / 2;
        const rad = i % 2 === 0 ? outer : inner;
        i === 0
          ? ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad)
          : ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'sparkle': {
      // 4-point diamond cross
      const s = p.r;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.25, -s * 0.25);
      ctx.lineTo(s, 0);
      ctx.lineTo(s * 0.25, s * 0.25);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.25, s * 0.25);
      ctx.lineTo(-s, 0);
      ctx.lineTo(-s * 0.25, -s * 0.25);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'streamer': {
      // Curved ribbon – bezier stroke
      ctx.lineWidth = p.h;
      ctx.lineCap   = 'round';
      ctx.beginPath();
      ctx.moveTo(-p.w / 2, 0);
      ctx.bezierCurveTo(
        -p.w / 4, -p.h * 3,
         p.w / 4,  p.h * 3,
         p.w / 2,  0
      );
      ctx.stroke();
      break;
    }
    default:
      break;
  }

  ctx.restore();
}

// ── Create one particle ───────────────────────────────────────────────────────
function createParticle(cx, cy) {
  const type  = pick(TYPES);
  const speed = rnd(2.5, 9);
  // Full 360° arc with slight upward bias so burst feels natural
  const angle = rnd(-Math.PI, Math.PI);
  const vx    = Math.cos(angle) * speed;
  const vy    = Math.sin(angle) * speed - rnd(1, 3);

  const base = { x: cx, y: cy, vx, vy, color: pick(COLORS), type, alpha: 1 };

  if (type === 'rect') {
    return { ...base, w: rnd(6, 14), h: rnd(3, 7), angle: rnd(0, Math.PI * 2), spin: rnd(-0.2, 0.2) };
  }
  if (type === 'streamer') {
    return { ...base, w: rnd(18, 36), h: rnd(1.5, 3), angle: rnd(0, Math.PI * 2), spin: rnd(-0.15, 0.15) };
  }
  // circle, star, sparkle
  return { ...base, r: rnd(3, 8), angle: rnd(0, Math.PI * 2), spin: rnd(-0.18, 0.18) };
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * showCelebration(options)
 *
 * @param {object} [options]
 * @param {number} [options.x]     – origin X in viewport px  (default: center)
 * @param {number} [options.y]     – origin Y in viewport px  (default: center)
 * @param {number} [options.count] – particle count           (default: 80)
 * @param {string} [options.type]  – named milestone label (reserved for preset tuning)
 * @returns {function} cleanup – call to cancel early (e.g. on component unmount)
 */
export function showCelebration(options = {}) {
  // Honour reduced-motion preference
  if (typeof window === 'undefined') return () => {};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const {
    x     = window.innerWidth  / 2,
    y     = window.innerHeight / 2,
    count = 80,
  } = options;

  // ── Create full-viewport overlay canvas ────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  Object.assign(canvas.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '100vw',
    height:        '100vh',
    pointerEvents: 'none',  // pass-through – page stays fully interactive
    zIndex:        '99999',
  });

  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // ── Spawn particles ──────────────────────────────────────────────────────────
  const particles = Array.from({ length: count }, () => createParticle(x, y));

  // ── Physics constants ────────────────────────────────────────────────────────
  const GRAVITY    = 0.22;
  const DRAG       = 0.985;
  const FADE_START = 0.75;  // seconds after which alpha decay begins
  const DURATION   = 1.8;   // total seconds before canvas is removed

  let startTime = null;
  let rafId;

  function frame(ts) {
    if (!startTime) startTime = ts;
    const elapsed = (ts - startTime) / 1000; // convert to seconds

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const fadeProgress = Math.max(0, (elapsed - FADE_START) / (DURATION - FADE_START));
    let anyAlive = false;

    for (const p of particles) {
      // Apply physics
      p.vy    += GRAVITY;
      p.vx    *= DRAG;
      p.vy    *= DRAG;
      p.x     += p.vx;
      p.y     += p.vy;
      if (p.spin !== undefined) p.angle += p.spin;

      // Fade out
      p.alpha = Math.max(0, 1 - fadeProgress * 1.2);

      if (p.alpha > 0) {
        anyAlive = true;
        drawParticle(ctx, p);
      }
    }

    if (elapsed < DURATION && anyAlive) {
      rafId = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(rafId);
      canvas.remove();
    }
  }

  rafId = requestAnimationFrame(frame);

  // Return cleanup for consumers that need early cancellation
  return () => {
    cancelAnimationFrame(rafId);
    canvas.remove();
  };
}

// ── Named milestone helpers (DX convenience) ──────────────────────────────────
export const celebrateEnrollment   = (opts) => showCelebration({ type: 'enrollment',   count: 90,  ...opts });
export const celebrateCourse       = (opts) => showCelebration({ type: 'course',       count: 80,  ...opts });
export const celebrateCertificate  = (opts) => showCelebration({ type: 'certificate',  count: 110, ...opts });
export const celebrateCareer       = (opts) => showCelebration({ type: 'career',       count: 100, ...opts });
