import gsap from 'gsap';
import { $, vibrate } from './dom';

/* preloader: real asset progress → gate → curtains */
export function initVeil(onEnter: () => void) {
  const veil = $('#veil');
  const loadPhase = $('#veilLoad');
  const gatePhase = $('#veilGate');
  const countEl = $('#loadCount');
  const openBtn = $('#openBtn');
  if (!veil || !loadPhase || !gatePhase || !countEl || !openBtn) {
    onEnter();
    return;
  }

  const progress = { fonts: 0, hero: 0, win: 0 };
  const displayed = { v: 0 };
  const startAt = performance.now();

  function target() {
    return progress.fonts * 30 + progress.hero * 50 + progress.win * 20;
  }

  function renderCount() {
    countEl!.textContent = String(Math.round(displayed.v));
  }

  function advance() {
    gsap.to(displayed, {
      v: target(),
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: renderCount,
      onComplete: maybeFinish,
    });
  }

  let finished = false;
  function maybeFinish() {
    if (finished || target() < 100) return;
    /* keep the loader visible at least 1.2s so it doesn't flash */
    const wait = Math.max(0, 1200 - (performance.now() - startAt));
    finished = true;
    setTimeout(() => {
      gsap.to(displayed, {
        v: 100,
        duration: 0.3,
        onUpdate: renderCount,
        onComplete: showGate,
      });
    }, wait);
  }

  function showGate() {
    gsap.to(loadPhase, {
      opacity: 0,
      y: -16,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        loadPhase!.hidden = true;
        gatePhase!.hidden = false;
        const ring = $('#monoRing');
        gsap.from(gatePhase!.children, { opacity: 0, y: 22, stagger: 0.1, duration: 0.9, ease: 'power3.out' });
        if (ring) {
          const len = 2 * Math.PI * 57;
          gsap.fromTo(ring,
            { strokeDasharray: len, strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 2, ease: 'power2.out', delay: 0.2 });
        }
      },
    });
  }

  /* real progress signals */
  document.fonts.ready.then(() => { progress.fonts = 1; advance(); });

  const heroImg = new Image();
  heroImg.onload = heroImg.onerror = () => { progress.hero = 1; advance(); };
  heroImg.src = '/images/background/invitation.jpg';

  if (document.readyState === 'complete') {
    progress.win = 1;
    advance();
  } else {
    addEventListener('load', () => { progress.win = 1; advance(); }, { once: true });
  }

  /* safety net: never hold guests hostage on a flaky network */
  setTimeout(() => {
    progress.fonts = progress.hero = progress.win = 1;
    advance();
  }, 7000);

  /* gate → enter */
  let entered = false;
  openBtn.addEventListener('click', () => {
    if (entered) return;
    entered = true;
    vibrate(12);

    /* iOS gyro permission must be requested inside a user gesture */
    interface DOEStatic { requestPermission?: () => Promise<string> }
    (DeviceOrientationEvent as unknown as DOEStatic).requestPermission?.().catch(() => {});

    gsap.timeline()
      .to('#veilGate', { opacity: 0, scale: 0.94, duration: 0.45, ease: 'power2.in' }, 0)
      .to('.veil-panel--top', { yPercent: -101, duration: 1.15, ease: 'power4.inOut' }, 0.15)
      .to('.veil-panel--bottom', { yPercent: 101, duration: 1.15, ease: 'power4.inOut' }, 0.15)
      .add(() => onEnter(), 0.35)
      .add(() => veil!.classList.add('gone'));
  });
}
