import gsap from 'gsap';
import { $, $$, getNow, vibrate, reducedMotion } from './dom';
import { WEDDING_DAY } from './countdown';

const DARK_APPS = new Set(['app-music']);

let currentApp: HTMLElement | null = null;

function device() {
  return $('#device')!;
}

/* ── clocks + status ────────────────────────────── */
export function initStatus() {
  const dows = ['일', '월', '화', '수', '목', '금', '토'];

  function tick() {
    const now = getNow();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    $$('[data-clock]').forEach((el) => (el.textContent = `${hh}:${mm}`));
    $$('[data-clock-big]').forEach((el) => (el.textContent = `${hh}:${mm}`));

    const lockDate = $('#lockDate');
    if (lockDate) {
      lockDate.textContent = `${now.getMonth() + 1}월 ${now.getDate()}일 ${dows[now.getDay()]}요일`;
    }

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((WEDDING_DAY.getTime() - today.getTime()) / 86400000);
    const label = days > 0 ? `D-${days}` : days === 0 ? 'D-DAY' : `D+${-days}`;

    const sb = $('#sbDday');
    if (sb) sb.textContent = label;
    const widget = $('#widgetDday');
    if (widget) widget.textContent = days === 0 ? 'D-DAY ♥' : label;
    const noti = $('#notiDdayText');
    if (noti) {
      noti.textContent = days > 0
        ? `영건 ♥ 지혜 결혼식까지 ${days}일 남았어요`
        : days === 0
          ? '오늘은 영건 ♥ 지혜의 결혼식 날이에요 💍'
          : '영건 ♥ 지혜, 부부가 되었습니다 🤍';
    }

    /* battery gag: charge toward 100% as the day approaches */
    const fill = $('#sbBatteryFill');
    if (fill) {
      const pct = Math.max(8, Math.min(100, 100 - days / 3.65));
      fill.style.width = `${pct}%`;
    }
  }

  tick();
  setInterval(tick, 1000);
}

/* ── screen switching ───────────────────────────── */
export function showHome() {
  const home = $('#home');
  if (!home) return;
  home.hidden = false;
  device().setAttribute('data-theme', 'dark');
  if (!reducedMotion) {
    gsap.from('#home .widget, #home .grid .icon, #home .dock', {
      opacity: 0,
      y: 26,
      scale: 0.94,
      duration: 0.7,
      stagger: 0.035,
      ease: 'power3.out',
      clearProps: 'all',
    });
  }
}

/* ── app windows ────────────────────────────────── */
export function openApp(id: string, origin?: HTMLElement | null) {
  const app = document.getElementById(id);
  if (!app || app === currentApp) return;

  const previous = currentApp;
  if (previous) {
    previous.hidden = true;
    gsap.set(previous, { clearProps: 'all' });
  }

  currentApp = app;
  app.hidden = false;
  device().classList.add('app-open');
  device().setAttribute('data-theme', DARK_APPS.has(id) ? 'dark' : 'light');
  vibrate(6);
  app.dispatchEvent(new CustomEvent('app:open'));

  if (reducedMotion) return;

  if (origin && !previous) {
    /* zoom out of the tapped icon */
    const r = origin.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    gsap.fromTo(app,
      {
        scale: 0.08,
        opacity: 0.4,
        borderRadius: '40px',
        transformOrigin: `${(cx / innerWidth) * 100}% ${(cy / innerHeight) * 100}%`,
      },
      { scale: 1, opacity: 1, borderRadius: '0px', duration: 0.55, ease: 'power3.out', clearProps: 'transform,borderRadius,opacity' });
  } else {
    gsap.fromTo(app,
      { x: previous ? 40 : 0, scale: previous ? 1 : 0.94, opacity: 0 },
      { x: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'all' });
  }
}

export function closeApp() {
  if (!currentApp) return;
  const app = currentApp;
  currentApp = null;
  vibrate(4);

  const done = () => {
    app.hidden = true;
    gsap.set(app, { clearProps: 'all' });
    device().classList.remove('app-open');
    device().setAttribute('data-theme', 'dark');
  };

  if (reducedMotion) {
    done();
    return;
  }

  gsap.to(app, {
    scale: 0.86,
    opacity: 0,
    borderRadius: '36px',
    duration: 0.32,
    ease: 'power2.in',
    onComplete: done,
  });
}

export function initAppNavigation() {
  /* any [data-open] button opens that app */
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-open]');
    if (target) {
      openApp(target.dataset.open!, target.closest('.icon') ? target : null);
      /* clear the messages badge once read */
      if (target.dataset.open === 'app-messages') {
        $$('.icon-badge').forEach((b) => b.remove());
      }
      return;
    }
    if ((e.target as HTMLElement).closest('[data-close]')) closeApp();
  });

  $('#homeBar')?.addEventListener('click', closeApp);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#lightbox')?.hidden) return;
    if (e.key === 'Escape') closeApp();
  });
}
