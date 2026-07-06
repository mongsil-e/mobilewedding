/* fonts (self-hosted, subset woff2) */
import '@fontsource/italiana/400.css';
import '@fontsource/great-vibes/400.css';
import '@fontsource/gowun-batang/400.css';
import '@fontsource/gowun-batang/700.css';
import '@fontsource/noto-sans-kr/300.css';
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-sans-kr/500.css';
import '@fontsource/noto-sans-kr/700.css';

import './styles/main.css';

import { registerSW } from 'virtual:pwa-register';
import { $ } from './modules/dom';
import { initStatus, initAppNavigation, showHome, openApp } from './modules/os';
import { initLock } from './modules/lock';
import { initMessages } from './modules/messages';
import { initCountdown } from './modules/countdown';
import { buildCalendar } from './modules/calendar';
import { initAccordions } from './modules/accordion';
import { initLightbox } from './modules/lightbox';
import { initCopy, initShare, initBless } from './modules/actions';
import { initMusic } from './modules/music';
import { initIcs } from './modules/ics';

registerSW({ immediate: true });

/* ── OS services ─────────────────────────────────── */
initStatus();
initAppNavigation();

/* ── apps ────────────────────────────────────────── */
buildCalendar();
initCountdown();
initAccordions();
initLightbox();
initCopy();
initShare();
initBless();
initMusic();
initIcs();
initMessages();

/* ── boot → lock → home ──────────────────────────── */
const lock = initLock((thenOpen) => {
  showHome();
  if (thenOpen) setTimeout(() => openApp(thenOpen), 450);
});

const boot = $('#boot');
setTimeout(() => {
  boot?.classList.add('off');
  lock?.show();
  setTimeout(() => boot?.remove(), 700);
}, 1500);
