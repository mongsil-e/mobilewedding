import { $$, vibrate } from './dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initAccordions() {
  $$('[data-acc]').forEach((acc) => {
    const head = acc.querySelector<HTMLButtonElement>('.acc-head');
    head?.addEventListener('click', () => {
      const open = acc.classList.toggle('open');
      head.setAttribute('aria-expanded', String(open));
      vibrate(6);
      setTimeout(() => ScrollTrigger.refresh(), 550);
    });
  });
}
