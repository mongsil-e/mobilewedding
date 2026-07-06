import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { $, $$, reducedMotion } from './dom';
import { lenis } from './scroll';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ── Hero entrance (played when the gate opens) ─── */
export function buildHeroTimeline(onReveal: (v: number) => void) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

  const revealProxy = { v: 0 };
  tl.to(revealProxy, {
    v: 1,
    duration: 2.4,
    ease: 'power2.inOut',
    onUpdate: () => onReveal(revealProxy.v),
  }, 0);

  if (!reducedMotion) {
    $$('[data-split="hero"]').forEach((el, i) => {
      const split = SplitText.create(el, { type: 'chars', mask: 'chars' });
      tl.from(split.chars, {
        yPercent: 118,
        rotate: 6,
        duration: 1.1,
        stagger: 0.045,
        ease: 'power4.out',
      }, 0.35 + i * 0.22);
    });

    tl.from('.hero-amp em', { scale: 0, rotate: -30, duration: 0.9, ease: 'back.out(2.2)' }, 0.9);
    tl.from('.hero .hero-eyebrow', { opacity: 0, y: 14, duration: 0.8 }, 0.3);
    tl.from('.hero .hero-names-ko', { opacity: 0, y: 16, duration: 0.9 }, 1.15);
    tl.from('.hero .hero-meta', { opacity: 0, y: 18, duration: 0.9 }, 1.3);
    tl.from('.hero-scrollcue', { opacity: 0, duration: 1 }, 1.7);
  }

  return tl;
}

/* ── Generic scroll reveals ──────────────────────── */
export function initReveals() {
  if (reducedMotion) return;

  $$('[data-anim="fade"]').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.from(el, {
      opacity: 0,
      y: 26,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  $$('[data-anim="card"]').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 44,
      scale: 0.97,
      duration: 1.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%' },
    });
  });

  /* editorial image reveal: clip + inner scale */
  $$('[data-anim="img"]').forEach((el) => {
    const img = el.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 86%' } });
    tl.from(el, { clipPath: 'inset(12% 6% 12% 6% round 14px)', duration: 1.2, ease: 'power3.out' });
    if (img) tl.from(img, { scale: 1.25, duration: 1.6, ease: 'power3.out' }, 0);
  });

  /* line-masked text reveals */
  document.fonts.ready.then(() => {
    $$('[data-split="lines"]').forEach((el) => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
      gsap.from(split.lines, {
        yPercent: 112,
        duration: 1.05,
        stagger: 0.09,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });
    ScrollTrigger.refresh();
  });
}

/* ── Pinned horizontal gallery ───────────────────── */
export function initHorizontalGallery() {
  const pin = $('#hgalleryPin');
  const track = $('#hgalleryTrack');
  const bar = $('#hgalleryBar');
  if (!pin || !track) return;

  if (reducedMotion) {
    track.style.overflowX = 'auto';
    return;
  }

  const distance = () => track.scrollWidth - pin.clientWidth;

  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin.parentElement,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (bar) bar.style.transform = `scaleX(${self.progress})`;
      },
    },
  });

  /* parallax inside each slide */
  $$('.hslide-img img', track).forEach((img) => {
    gsap.fromTo(img, { xPercent: -6 }, {
      xPercent: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: img.closest('.hslide'),
        containerAnimation: tween,
        start: 'left right',
        end: 'right left',
        scrub: true,
      },
    });
  });
}

/* ── Marquee reacting to scroll velocity ─────────── */
export function initMarquee() {
  const track = $('#marqueeTrack');
  if (!track) return;

  const loop = gsap.to(track, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
  if (reducedMotion) {
    loop.pause();
    return;
  }

  let speed = 1;
  lenis?.on('scroll', ({ velocity }: { velocity: number }) => {
    speed = 1 + Math.min(Math.abs(velocity) * 0.06, 3.4);
  });
  gsap.ticker.add(() => {
    loop.timeScale(gsap.utils.interpolate(loop.timeScale(), speed, 0.08));
    speed = gsap.utils.interpolate(speed, 1, 0.04);
  });
}

/* ── 3D tilt + magnetic hover (fine pointers) ────── */
export function initPointerFX() {
  if (reducedMotion || !matchMedia('(hover: hover)').matches) return;

  $$('[data-tilt]').forEach((card) => {
    const qx = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
    const qy = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
    gsap.set(card, { transformPerspective: 700 });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      qx(((e.clientX - r.left) / r.width - 0.5) * 9);
      qy(((e.clientY - r.top) / r.height - 0.5) * -9);
    });
    card.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });

  $$('[data-magnet]').forEach((btn) => {
    const qx = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
    const qy = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      qx((e.clientX - (r.left + r.width / 2)) * 0.22);
      qy((e.clientY - (r.top + r.height / 2)) * 0.22);
    });
    btn.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });
}

/* ── Hero scroll progress → shader uniform ───────── */
export function bindHeroScroll(setScroll: (v: number) => void) {
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => setScroll(self.progress),
  });
}
