import { $$, vibrate } from './dom';

export function initAccordions() {
  $$('[data-acc]').forEach((acc) => {
    const head = acc.querySelector<HTMLButtonElement>('.acc-head');
    head?.addEventListener('click', () => {
      const open = acc.classList.toggle('open');
      head.setAttribute('aria-expanded', String(open));
      vibrate(6);
    });
  });
}
