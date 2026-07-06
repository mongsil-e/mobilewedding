import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { $, $$, reducedMotion } from './dom';

gsap.registerPlugin(ScrollTrigger);

export let lenis: Lenis | null = null;

export function initScroll() {
  if (!reducedMotion) {
    lenis = new Lenis({
      autoRaf: false,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.stop();

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis!.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* anchor links through lenis */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.4 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* top progress bar */
  const fill = $('#progressFill');
  if (fill) {
    gsap.to(fill, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: () => ScrollTrigger.maxScroll(window), scrub: 0.3 },
    });
  }

  /* dock active section */
  const dockItems = $$('[data-dock]');
  dockItems.forEach((item) => {
    const section = document.getElementById(item.dataset.dock!);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (self.isActive) {
          dockItems.forEach((d) => d.classList.toggle('is-active', d === item));
        }
      },
    });
  });
}

export function unlockScroll() {
  document.body.classList.remove('locked');
  document.body.classList.add('entered');
  lenis?.start();
}
