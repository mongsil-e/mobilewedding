export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);

export const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) =>
  [...root.querySelectorAll<T>(sel)];

export const pad = (n: number) => String(n).padStart(2, '0');

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const vibrate = (pattern: number | number[]) => {
  navigator.vibrate?.(pattern);
};

/* ── demo clock (?demo=wedding-day) ─────────────── */
let demoAnchor: { real: number; sim: number } | null = null;

export function getNow(): Date {
  if (new URLSearchParams(location.search).get('demo') === 'wedding-day') {
    demoAnchor ??= { real: Date.now(), sim: new Date(2026, 9, 4, 8, 0, 15).getTime() };
    return new Date(demoAnchor.sim + (Date.now() - demoAnchor.real));
  }
  return new Date();
}

/* ── Toast ──────────────────────────────────────── */
let toastTimer: ReturnType<typeof setTimeout>;

export function showToast(msg: string) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}
