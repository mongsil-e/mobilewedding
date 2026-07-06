import gsap from 'gsap';
import { $, vibrate, reducedMotion } from './dom';

/* falling petals on the lock screen (lightweight 2D canvas) */
function startPetals(canvas: HTMLCanvasElement) {
  if (reducedMotion) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const COLORS = ['#f3d7d7', '#f7e4d4', '#f0cdc4', '#eec9cf'];
  let raf = 0;
  let dpr = 1;

  const spawn = (initial: boolean) => ({
    x: Math.random() * canvas.clientWidth,
    y: initial ? Math.random() * canvas.clientHeight : -20,
    size: 4 + Math.random() * 7,
    vy: 0.3 + Math.random() * 0.6,
    phase: Math.random() * Math.PI * 2,
    spin: Math.random() * Math.PI * 2,
    spinV: (Math.random() - 0.5) * 0.03,
    color: COLORS[(Math.random() * COLORS.length) | 0],
    alpha: 0.4 + Math.random() * 0.4,
  });

  let parts = Array.from({ length: 16 }, () => spawn(true));

  function resize() {
    dpr = Math.min(devicePixelRatio, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  }
  resize();
  addEventListener('resize', resize);

  function tick(t: number) {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for (const p of parts) {
      p.y += p.vy;
      p.x += Math.sin(t / 1600 + p.phase) * 0.3;
      p.spin += p.spinV;
      if (p.y > canvas.clientHeight + 20) Object.assign(p, spawn(false));
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.spin);
      ctx!.globalAlpha = p.alpha;
      ctx!.fillStyle = p.color;
      ctx!.beginPath();
      ctx!.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();
    }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(raf);
}

export function initLock(onUnlock: (thenOpen?: string) => void) {
  const lock = $('#lock');
  if (!lock) return;

  const petalsStop = { fn: () => {} };
  const canvas = $('#lockPetals') as unknown as HTMLCanvasElement | null;

  let unlocked = false;

  function unlock(thenOpen?: string) {
    if (unlocked) return;
    unlocked = true;
    vibrate([10, 30, 10]);
    petalsStop.fn();

    const finish = () => {
      lock!.hidden = true;
      onUnlock(thenOpen);
    };

    if (reducedMotion) {
      finish();
      return;
    }

    gsap.to(lock, {
      yPercent: -100,
      opacity: 0.6,
      duration: 0.6,
      ease: 'power3.inOut',
      onComplete: finish,
    });
  }

  /* swipe up to unlock */
  let y0 = 0;
  let dragging = false;
  let lastY = 0;
  let lastT = 0;
  let velocity = 0;

  lock.addEventListener('pointerdown', (e) => {
    if (unlocked) return;
    dragging = true;
    y0 = lastY = e.clientY;
    lastT = performance.now();
    lock.setPointerCapture(e.pointerId);
  });

  lock.addEventListener('pointermove', (e) => {
    if (!dragging || unlocked) return;
    const dy = Math.min(0, e.clientY - y0);
    const now = performance.now();
    velocity = (e.clientY - lastY) / Math.max(1, now - lastT);
    lastY = e.clientY;
    lastT = now;
    gsap.set(lock, { y: dy * 0.85, opacity: 1 + dy / 900 });
  });

  const release = (e: PointerEvent) => {
    if (!dragging || unlocked) return;
    dragging = false;
    const dy = e.clientY - y0;
    if (dy < -110 || velocity < -0.55) {
      unlock();
    } else {
      gsap.to(lock, { y: 0, opacity: 1, duration: 0.45, ease: 'elastic.out(1, 0.6)' });
    }
  };

  lock.addEventListener('pointerup', release);
  lock.addEventListener('pointercancel', release);

  /* notifications: unlock straight into an app */
  $('#notiInvite')?.addEventListener('click', () => unlock('app-invite'));
  $('#notiCal')?.addEventListener('click', () => unlock('app-calendar'));
  $('#lockHint')?.addEventListener('click', () => unlock());

  /* keyboard accessibility */
  document.addEventListener('keydown', (e) => {
    if (!lock.hidden && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp')) unlock();
  });

  return {
    show() {
      lock.hidden = false;
      if (canvas) petalsStop.fn = startPetals(canvas);
      if (!reducedMotion) {
        gsap.from('.lock-top, .lock-notis .noti, .lock-hint', {
          opacity: 0,
          y: 24,
          duration: 0.8,
          stagger: 0.09,
          ease: 'power3.out',
          clearProps: 'all',
        });
      }
    },
  };
}
