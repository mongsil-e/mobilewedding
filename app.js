/* ══════════════════════════════════════════════════
   Young Geon ♥ Ji Hye — interaction engine
   ══════════════════════════════════════════════════ */
(function () {
  'use strict';

  const WEDDING_DAY = new Date(2026, 9, 4);
  const CEREMONY_AT = new Date(2026, 9, 4, 10, 30, 0);

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const pad = (n) => String(n).padStart(2, '0');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const vibrate = (pattern) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  /* ── demo clock (?demo=wedding-day) ─────────────── */
  let demoAnchor = null;
  function getNow() {
    if (new URLSearchParams(location.search).get('demo') === 'wedding-day') {
      if (!demoAnchor) {
        demoAnchor = { real: Date.now(), sim: new Date(2026, 9, 4, 8, 0, 15).getTime() };
      }
      return new Date(demoAnchor.sim + (Date.now() - demoAnchor.real));
    }
    return new Date();
  }

  /* ── Toast ──────────────────────────────────────── */
  let toastTimer;
  function showToast(msg) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  /* ── Petals canvas ──────────────────────────────── */
  const petals = (() => {
    const canvas = $('#petals');
    if (!canvas || reducedMotion) return { start() {}, stop() {} };

    const ctx = canvas.getContext('2d');
    const COLORS = ['#f3d7d7', '#f7e4d4', '#f0cdc4', '#faeee2', '#eec9cf'];
    let parts = [];
    let rafId = null;
    let dpr = 1;

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
    }

    function spawn(initial) {
      const size = 5 + Math.random() * 8;
      return {
        x: Math.random() * innerWidth,
        y: initial ? Math.random() * innerHeight : -20,
        size,
        vy: 0.35 + Math.random() * 0.7,
        drift: 0.6 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        spin: Math.random() * Math.PI * 2,
        spinV: (Math.random() - 0.5) * 0.03,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        alpha: 0.5 + Math.random() * 0.4,
      };
    }

    function tick(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of parts) {
        p.y += p.vy;
        p.x += Math.sin(t / 1600 + p.phase) * p.drift * 0.4;
        p.spin += p.spinV;
        if (p.y > innerHeight + 24) Object.assign(p, spawn(false));

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.globalAlpha = p.alpha * (0.75 + 0.25 * Math.sin(t / 900 + p.phase));
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      rafId = requestAnimationFrame(tick);
    }

    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (parts.length && !rafId) {
        rafId = requestAnimationFrame(tick);
      }
    });

    return {
      start() {
        resize();
        parts = Array.from({ length: innerWidth < 400 ? 18 : 26 }, () => spawn(true));
        canvas.classList.add('on');
        if (!rafId) rafId = requestAnimationFrame(tick);
      },
      stop() {
        canvas.classList.remove('on');
        cancelAnimationFrame(rafId);
        rafId = null;
      },
    };
  })();

  /* ── Split text ─────────────────────────────────── */
  $$('[data-split]').forEach((el) => {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text.trim());
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--ci', i);
      span.textContent = ch;
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
    });
  });

  /* ── Reveal on scroll ───────────────────────────── */
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  $$('[data-reveal], [data-split]').forEach((el) => revealIO.observe(el));

  /* ── Intro gate ─────────────────────────────────── */
  const intro = $('#intro');
  const introOpen = $('#introOpen');

  function enter() {
    if (!intro || intro.classList.contains('open')) return;
    intro.classList.add('open');
    document.body.classList.remove('locked');
    document.body.classList.add('entered');
    vibrate(12);
    petals.start();
    setTimeout(() => intro.classList.add('gone'), 1300);
  }

  introOpen?.addEventListener('click', enter);
  /* 접근성: 인트로가 어떤 이유로든 상호작용 불가하면 6초 후 자동 입장 */
  setTimeout(() => {
    if (document.body.classList.contains('locked')) enter();
  }, 6000);

  /* ── Hero parallax (scroll + gyro) ──────────────── */
  const heroMedia = $('#heroMedia');
  if (heroMedia && !reducedMotion) {
    let gx = 0;
    let gy = 0;
    let sy = 0;
    let rafPending = false;

    function apply() {
      rafPending = false;
      heroMedia.style.transform = `translate3d(${gx}px, ${sy * 0.28 + gy}px, 0)`;
    }

    function schedule() {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(apply);
      }
    }

    addEventListener('scroll', () => {
      const y = scrollY;
      if (y < innerHeight * 1.2) {
        sy = y;
        schedule();
      }
    }, { passive: true });

    addEventListener('deviceorientation', (e) => {
      if (e.gamma == null || e.beta == null) return;
      gx = Math.max(-14, Math.min(14, e.gamma * 0.45));
      gy = Math.max(-10, Math.min(10, (e.beta - 45) * 0.3));
      schedule();
    }, true);
  }

  /* ── Scroll progress (fallback when no scroll-timeline) ── */
  const progressBar = $('#progressBar');
  if (progressBar && !CSS.supports('animation-timeline: scroll()')) {
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        progressBar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── Tilt cards ─────────────────────────────────── */
  if (!reducedMotion && matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${px * 7}deg) rotateX(${py * -7}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ── Calendar ───────────────────────────────────── */
  (function buildCalendar() {
    const grid = $('#calendarGrid');
    if (!grid) return;
    const year = WEDDING_DAY.getFullYear();
    const month = WEDDING_DAY.getMonth();
    const target = WEDDING_DAY.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '';
    for (let i = 0; i < firstDay; i++) html += '<div class="calendar-day"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
      const dow = (firstDay + day - 1) % 7;
      let cls = 'calendar-day';
      if (dow === 0) cls += ' sunday';
      if (dow === 6) cls += ' saturday';
      if (day === target) cls += ' wedding-day';
      html += `<div class="${cls}">${day}</div>`;
    }
    grid.innerHTML = html;
  })();

  /* ── Odometer countdown ─────────────────────────── */
  const odometer = (() => {
    const groups = {};
    $$('[data-odo]').forEach((el) => {
      groups[el.dataset.odo] = { el, cells: [] };
    });
    if (!Object.keys(groups).length) return null;

    function makeCell(group) {
      const cell = document.createElement('div');
      cell.className = 'odo-cell';
      const reel = document.createElement('div');
      reel.className = 'odo-reel';
      for (let i = 0; i <= 9; i++) {
        const d = document.createElement('span');
        d.textContent = i;
        reel.appendChild(d);
      }
      cell.appendChild(reel);
      group.el.appendChild(cell);
      group.cells.push({ cell, reel, value: -1 });
    }

    function setGroup(key, str) {
      const group = groups[key];
      if (!group) return;
      while (group.cells.length < str.length) makeCell(group);
      while (group.cells.length > str.length) {
        group.cells.pop().cell.remove();
      }
      [...str].forEach((ch, i) => {
        const digit = Number(ch);
        const slot = group.cells[i];
        if (slot.value !== digit) {
          slot.value = digit;
          const step = slot.reel.firstElementChild?.offsetHeight || 42;
          slot.reel.style.transform = `translateY(${-digit * step}px)`;
        }
      });
    }

    return { setGroup };
  })();

  function updateCountdown() {
    const caption = $('#ddayCaption');
    const now = getNow();
    const diff = CEREMONY_AT - now;

    if (diff > 0) {
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      odometer?.setGroup('d', String(days).padStart(2, '0'));
      odometer?.setGroup('h', pad(hours));
      odometer?.setGroup('m', pad(mins));
      odometer?.setGroup('s', pad(secs));

      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayDiff = Math.round((WEDDING_DAY - startToday) / 86400000);
      if (caption) {
        caption.textContent = dayDiff === 0
          ? '오늘, 저희 결혼합니다 💍'
          : `영건 ♥ 지혜의 결혼식이 ${dayDiff}일 남았습니다`;
      }
      return;
    }

    odometer?.setGroup('d', '00');
    odometer?.setGroup('h', '00');
    odometer?.setGroup('m', '00');
    odometer?.setGroup('s', '00');
    if (caption) {
      const passed = Math.floor(-diff / 86400000);
      caption.textContent = passed < 1
        ? '저희, 부부가 되었습니다 💍'
        : `결혼 ${passed}일째, 잘 살고 있습니다 🤍`;
    }
  }

  let countdownTimer = null;
  function startCountdown() {
    clearInterval(countdownTimer);
    updateCountdown();
    countdownTimer = setInterval(updateCountdown, 1000);
  }
  startCountdown();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateCountdown();
  });
  addEventListener('pageshow', startCountdown);

  /* ── Accordions ─────────────────────────────────── */
  $$('[data-acc]').forEach((acc) => {
    const head = $('.acc-head', acc);
    head?.addEventListener('click', () => {
      const open = acc.classList.toggle('open');
      head.setAttribute('aria-expanded', String(open));
      vibrate(6);
    });
  });

  /* ── Copy buttons ───────────────────────────────── */
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        vibrate(10);
        if (btn.classList.contains('account-copy')) {
          btn.classList.add('done');
          const prev = btn.textContent;
          btn.textContent = '완료';
          setTimeout(() => {
            btn.classList.remove('done');
            btn.textContent = prev;
          }, 1800);
          showToast('계좌번호가 복사되었습니다');
        } else {
          showToast('주소가 복사되었습니다');
        }
      } catch {
        showToast('복사에 실패했습니다');
      }
    });
  });

  /* ── Share ──────────────────────────────────────── */
  async function shareInvitation() {
    const data = {
      title: '영건 ♥ 지혜 결혼식에 초대합니다',
      text: '2026년 10월 4일 일요일 오전 10:30, 천안 비렌티웨딩홀에서 저희의 첫 시작을 함께해 주세요.',
      url: location.origin + location.pathname,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch (err) {
        if (err.name !== 'AbortError') showToast('공유에 실패했습니다');
      }
    } else {
      try {
        await navigator.clipboard.writeText(data.url);
        showToast('청첩장 링크가 복사되었습니다');
      } catch {
        showToast('공유 기능을 사용할 수 없습니다');
      }
    }
  }
  $('#shareBtn')?.addEventListener('click', shareInvitation);

  /* ── Blessing hearts ────────────────────────────── */
  const blessBtn = $('#blessBtn');
  const blessCount = $('#blessCount');
  const BLESS_KEY = 'yj-blessings';
  let blessings = 0;
  try {
    blessings = parseInt(localStorage.getItem(BLESS_KEY), 10) || 0;
  } catch { /* storage unavailable */ }
  if (blessCount) blessCount.textContent = blessings.toLocaleString();

  function burstHearts(x, y) {
    const glyphs = ['♥', '♡', '❤', '💛'];
    for (let i = 0; i < 7; i++) {
      const h = document.createElement('span');
      h.className = 'float-heart';
      h.textContent = glyphs[(Math.random() * glyphs.length) | 0];
      h.style.left = `${x + (Math.random() - 0.5) * 40}px`;
      h.style.top = `${y - 10}px`;
      h.style.setProperty('--fh-x', `${(Math.random() - 0.5) * 120}px`);
      h.style.setProperty('--fh-r', `${(Math.random() - 0.5) * 70}deg`);
      h.style.setProperty('--fh-size', `${14 + Math.random() * 14}px`);
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1700);
    }
  }

  blessBtn?.addEventListener('click', (e) => {
    blessings += 1;
    if (blessCount) blessCount.textContent = blessings.toLocaleString();
    try { localStorage.setItem(BLESS_KEY, String(blessings)); } catch { /* ignore */ }
    const r = blessBtn.getBoundingClientRect();
    burstHearts(e.clientX || r.left + r.width / 2, e.clientY || r.top);
    vibrate([8, 40, 8]);
  });

  /* ── Dock active state ──────────────────────────── */
  const dockItems = $$('[data-dock]');
  const dockSections = dockItems
    .map((item) => document.getElementById(item.dataset.dock))
    .filter(Boolean);

  if (dockSections.length) {
    const dockIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          dockItems.forEach((item) =>
            item.classList.toggle('is-active', item.dataset.dock === entry.target.id)
          );
        });
      },
      { rootMargin: '-38% 0px -55% 0px' }
    );
    dockSections.forEach((sec) => dockIO.observe(sec));
  }

  /* ── Lightbox ───────────────────────────────────── */
  const lightbox = $('#lightbox');
  const lbTrack = $('#lightboxTrack');
  const lbCounter = $('#lightboxCounter');
  const lbStage = $('#lightboxStage');

  const lbGroups = {};
  $$('[data-lightbox]').forEach((fig) => {
    const img = $('img', fig);
    const src = img?.getAttribute('src');
    if (!src) return;
    const groupName = fig.dataset.lightbox;
    lbGroups[groupName] ??= [];
    const index = lbGroups[groupName].push(src) - 1;

    fig.setAttribute('role', 'button');
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('aria-label', `${img.alt || '사진'} 크게 보기`);
    fig.addEventListener('click', () => openLightbox(groupName, index));
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(groupName, index);
      }
    });
  });

  let lbImages = [];
  let lbIndex = 0;
  let lbZoomed = false;
  let lastTapAt = 0;

  function lbRender(animate = true) {
    if (!lbTrack) return;
    lbTrack.classList.toggle('dragging', !animate);
    lbTrack.style.transform = `translateX(${-lbIndex * 100}%)`;
    if (lbCounter) lbCounter.textContent = `${lbIndex + 1} / ${lbImages.length}`;
  }

  function lbResetZoom() {
    lbZoomed = false;
    $$('.lightbox-slide img', lbTrack).forEach((img) => {
      img.style.transform = '';
    });
  }

  function openLightbox(groupName, index) {
    if (!lightbox || !lbTrack) return;
    lbImages = lbGroups[groupName] || [];
    if (!lbImages.length) return;
    lbTrack.innerHTML = lbImages
      .map((src) => `<div class="lightbox-slide"><img src="${src}" alt="" draggable="false" decoding="async"></div>`)
      .join('');
    lbIndex = Math.max(0, Math.min(index, lbImages.length - 1));
    lbZoomed = false;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbRender(false);
    requestAnimationFrame(() => lbRender(true));
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightbox.style.transform = '';
    lightbox.style.opacity = '';
    document.body.style.overflow = '';
    lbResetZoom();
  }

  $('#lightboxClose')?.addEventListener('click', closeLightbox);

  /* swipe / vertical-dismiss / double-tap zoom */
  let tx0 = 0;
  let ty0 = 0;
  let gesture = null;
  let dragX = 0;

  lbStage?.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    tx0 = e.touches[0].clientX;
    ty0 = e.touches[0].clientY;
    gesture = null;
    dragX = 0;
  }, { passive: true });

  lbStage?.addEventListener('touchmove', (e) => {
    if (lbZoomed || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - tx0;
    const dy = e.touches[0].clientY - ty0;

    if (!gesture) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) gesture = 'h';
      else if (dy > 10 && Math.abs(dy) > Math.abs(dx)) gesture = 'v';
    }

    if (gesture === 'h') {
      const edge = (lbIndex === 0 && dx > 0) || (lbIndex === lbImages.length - 1 && dx < 0);
      dragX = edge ? dx * 0.3 : dx;
      lbTrack.classList.add('dragging');
      lbTrack.style.transform = `translateX(calc(${-lbIndex * 100}% + ${dragX}px))`;
    } else if (gesture === 'v' && dy > 0) {
      lightbox.style.transform = `translateY(${dy}px)`;
      lightbox.style.opacity = String(Math.max(0.4, 1 - dy / 300));
    }
  }, { passive: true });

  lbStage?.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx0;
    const dy = e.changedTouches[0].clientY - ty0;

    if (gesture === 'h') {
      if (dx <= -55 && lbIndex < lbImages.length - 1) lbIndex += 1;
      else if (dx >= 55 && lbIndex > 0) lbIndex -= 1;
      lbRender(true);
      gesture = null;
      return;
    }

    if (gesture === 'v') {
      if (dy >= 90) {
        closeLightbox();
      } else {
        lightbox.style.transform = '';
        lightbox.style.opacity = '';
      }
      gesture = null;
      return;
    }

    /* tap: double-tap to zoom */
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      const now = Date.now();
      if (now - lastTapAt < 320) {
        const img = $$('.lightbox-slide img', lbTrack)[lbIndex];
        if (img) {
          lbZoomed = !lbZoomed;
          if (lbZoomed) {
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
  lbStage?.addEventListener('click', (e) => {
    if (lightbox.hidden || 'ontouchstart' in window) return;
    const ratio = e.clientX / innerWidth;
    if (ratio < 0.35 && lbIndex > 0) lbIndex -= 1;
    else if (ratio > 0.65 && lbIndex < lbImages.length - 1) lbIndex += 1;
    lbRender(true);
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox?.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lbIndex > 0) { lbIndex -= 1; lbRender(true); }
    if (e.key === 'ArrowRight' && lbIndex < lbImages.length - 1) { lbIndex += 1; lbRender(true); }
  });
})();
