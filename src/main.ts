/* fonts (self-hosted, subset woff2) */
import '@fontsource/italiana/400.css';
import '@fontsource/great-vibes/400.css';
import '@fontsource/gowun-batang/400.css';
import '@fontsource/gowun-batang/700.css';
import '@fontsource/noto-sans-kr/300.css';
import '@fontsource/noto-sans-kr/400.css';
import '@fontsource/noto-sans-kr/500.css';

import './styles/main.css';

import { registerSW } from 'virtual:pwa-register';
import { $, reducedMotion } from './modules/dom';
import { initScroll, unlockScroll } from './modules/scroll';
import {
  buildHeroTimeline,
  initReveals,
  initHorizontalGallery,
  initMarquee,
  initPointerFX,
  bindHeroScroll,
} from './modules/animations';
import type { HeroGL } from './modules/webgl-hero';
import { initHeartCanvas } from './modules/heart';
import { initCountdown } from './modules/countdown';
import { buildCalendar } from './modules/calendar';
import { initAccordions } from './modules/accordion';
import { initLightbox } from './modules/lightbox';
import { initCopy, initShare, initBless, initMusic } from './modules/actions';
import { initVeil } from './modules/veil';

registerSW({ immediate: true });

/* ── scroll layer first: everything hooks into it ── */
initScroll();

/* ── WebGL hero, code-split (graceful fallback to <img>) ── */
let heroGL: HeroGL | null = null;
let entered = false;

const webglMount = $('#heroWebgl');
const webglReady = (webglMount && !reducedMotion
  ? import('./modules/webgl-hero').then(({ HeroGL }) => {
      const gl = new HeroGL(webglMount, '/images/background/invitation.jpg');
      if (!gl.ok) return;
      heroGL = gl;
      bindHeroScroll((v) => gl.setScroll(v));
      if (entered) {
        gl.setReveal(1);
        gl.play();
      }
    })
  : Promise.resolve()
).catch(() => {});

const heroTl = buildHeroTimeline((v) => heroGL?.setReveal(v));

/* ── content ─────────────────────────────────────── */
buildCalendar();
initCountdown();
initAccordions();
initLightbox();
initCopy();
initShare();
initMusic();
initReveals();
initHorizontalGallery();
initMarquee();
initPointerFX();

const heart = initHeartCanvas();
initBless(() => heart.burst());

/* ── entry gate ──────────────────────────────────── */
initVeil(() => {
  entered = true;
  unlockScroll();
  webglReady.then(() => heroGL?.play());
  heroTl.play();
});
