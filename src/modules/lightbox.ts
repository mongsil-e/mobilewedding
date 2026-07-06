import { $, $$ } from './dom';

export function initLightbox() {
  const lightbox = $('#lightbox');
  const track = $('#lightboxTrack');
  const counter = $('#lightboxCounter');
  const stage = $('#lightboxStage');
  if (!lightbox || !track || !stage) return;

  const groups: Record<string, string[]> = {};

  $$('[data-lightbox]').forEach((fig) => {
    const img = fig.querySelector('img');
    const src = img?.getAttribute('src');
    if (!src) return;
    const name = fig.dataset.lightbox!;
    groups[name] ??= [];
    const index = groups[name].push(src) - 1;

    fig.setAttribute('role', 'button');
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('aria-label', `${img!.alt || '사진'} 크게 보기`);
    fig.addEventListener('click', () => open(name, index));
    fig.addEventListener('keydown', (e) => {
      const k = e as KeyboardEvent;
      if (k.key === 'Enter' || k.key === ' ') {
        k.preventDefault();
        open(name, index);
      }
    });
  });

  let images: string[] = [];
  let index = 0;
  let zoomed = false;
  let lastTapAt = 0;

  function render(animate = true) {
    track!.classList.toggle('dragging', !animate);
    track!.style.transform = `translateX(${-index * 100}%)`;
    if (counter) counter.textContent = `${index + 1} / ${images.length}`;
  }

  function open(name: string, at: number) {
    images = groups[name] || [];
    if (!images.length) return;
    track!.innerHTML = images
      .map((src) => `<div class="lightbox-slide"><img src="${src}" alt="" draggable="false" decoding="async"></div>`)
      .join('');
    index = Math.max(0, Math.min(at, images.length - 1));
    zoomed = false;
    lightbox!.hidden = false;
    render(false);
    requestAnimationFrame(() => render(true));
  }

  function close() {
    lightbox!.hidden = true;
    lightbox!.style.transform = '';
    lightbox!.style.opacity = '';
    zoomed = false;
  }

  $('#lightboxClose')?.addEventListener('click', close);

  let tx0 = 0;
  let ty0 = 0;
  let gesture: 'h' | 'v' | null = null;

  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    tx0 = e.touches[0].clientX;
    ty0 = e.touches[0].clientY;
    gesture = null;
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (zoomed || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - tx0;
    const dy = e.touches[0].clientY - ty0;

    if (!gesture) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) gesture = 'h';
      else if (dy > 10 && Math.abs(dy) > Math.abs(dx)) gesture = 'v';
    }

    if (gesture === 'h') {
      const edge = (index === 0 && dx > 0) || (index === images.length - 1 && dx < 0);
      const drag = edge ? dx * 0.3 : dx;
      track!.classList.add('dragging');
      track!.style.transform = `translateX(calc(${-index * 100}% + ${drag}px))`;
    } else if (gesture === 'v' && dy > 0) {
      lightbox!.style.transform = `translateY(${dy}px)`;
      lightbox!.style.opacity = String(Math.max(0.4, 1 - dy / 300));
    }
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx0;
    const dy = e.changedTouches[0].clientY - ty0;

    if (gesture === 'h') {
      if (dx <= -55 && index < images.length - 1) index += 1;
      else if (dx >= 55 && index > 0) index -= 1;
      render(true);
      gesture = null;
      return;
    }

    if (gesture === 'v') {
      if (dy >= 90) close();
      else {
        lightbox!.style.transform = '';
        lightbox!.style.opacity = '';
      }
      gesture = null;
      return;
    }

    /* double-tap zoom */
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      const now = Date.now();
      if (now - lastTapAt < 320) {
        const img = $$('.lightbox-slide img', track!)[index];
        if (img) {
          zoomed = !zoomed;
          if (zoomed) {
            const r = img.getBoundingClientRect();
            const ox = ((e.changedTouches[0].clientX - r.left) / r.width - 0.5) * -100;
            const oy = ((e.changedTouches[0].clientY - r.top) / r.height - 0.5) * -100;
            img.style.transform = `scale(2.2) translate(${ox / 2.2}px, ${oy / 2.2}px)`;
          } else {
            img.style.transform = '';
          }
        }
        lastTapAt = 0;
      } else {
        lastTapAt = now;
      }
    }
  }, { passive: true });

  /* desktop conveniences */
  stage.addEventListener('click', (e) => {
    if (lightbox!.hidden || 'ontouchstart' in window) return;
    const ratio = (e as MouseEvent).clientX / innerWidth;
    if (ratio < 0.35 && index > 0) index -= 1;
    else if (ratio > 0.65 && index < images.length - 1) index += 1;
    render(true);
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox!.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft' && index > 0) { index -= 1; render(true); }
    if (e.key === 'ArrowRight' && index < images.length - 1) { index += 1; render(true); }
  });
}
