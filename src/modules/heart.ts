import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion } from './dom';

interface P {
  x: number; y: number;
  vx: number; vy: number;
  tx: number; ty: number;
  size: number;
  hue: number;
}

/* particles scatter → converge into a heart as the section scrolls in */
export function initHeartCanvas() {
  const el = document.getElementById('heartCanvas');
  if (!(el instanceof HTMLCanvasElement) || reducedMotion) return { burst: () => {} };
  const canvas: HTMLCanvasElement = el;

  const ctx = canvas.getContext('2d')!;
  const COUNT = 620;
  let parts: P[] = [];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let progress = 0;
  let raf = 0;
  let running = false;
  let burstUntil = 0;

  function heartPoint(t: number, scale: number, cx: number, cy: number) {
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x: cx + x * scale, y: cy - y * scale };
  }

  function resize() {
    dpr = Math.min(devicePixelRatio, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const scale = Math.min(w, h) / 40;
    parts = Array.from({ length: COUNT }, (_, i) => {
      const t = (i / COUNT) * Math.PI * 2;
      const target = heartPoint(t, scale * (0.86 + Math.random() * 0.22), w / 2, h / 2 - 6);
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        tx: target.x,
        ty: target.y,
        size: 0.8 + Math.random() * 1.7,
        hue: Math.random(),
      };
    });
  }

  function tick(now: number) {
    if (!running) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const gather = progress;
    const bursting = now < burstUntil;

    for (const p of parts) {
      if (bursting) {
        p.vx += (Math.random() - 0.5) * 1.6;
        p.vy += (Math.random() - 0.5) * 1.6;
      }
      const ax = (p.tx - p.x) * 0.012 * gather;
      const ay = (p.ty - p.y) * 0.012 * gather;
      p.vx = (p.vx + ax) * 0.9;
      p.vy = (p.vy + ay) * 0.9;
      /* idle drift so scattered state stays alive */
      p.vx += Math.sin(now / 900 + p.hue * 9) * 0.008 * (1 - gather);
      p.vy += Math.cos(now / 1100 + p.hue * 7) * 0.008 * (1 - gather);
      p.x += p.vx;
      p.y += p.vy;

      const alpha = 0.25 + gather * 0.55;
      ctx.globalAlpha = alpha * (0.6 + p.hue * 0.4);
      ctx.fillStyle = p.hue > 0.55 ? '#d98f83' : '#c9a06c';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + gather * 0.3), 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  resize();
  addEventListener('resize', resize);

  ScrollTrigger.create({
    trigger: canvas,
    start: 'top 95%',
    end: 'bottom 25%',
    onUpdate: (self) => { progress = Math.min(1, self.progress * 1.6); },
    onToggle: (self) => (self.isActive ? start() : stop()),
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });

  return {
    burst: () => { burstUntil = performance.now() + 500; },
  };
}
