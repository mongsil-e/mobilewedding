(function () {
  'use strict';

  const WEDDING_DAY = new Date(2026, 9, 4);
  const WEDDING_DAY_UTC = Date.UTC(2026, 9, 4);
  const STORY_CONTENT = {
    thanks: {
      icon: '♡',
      title: '우리, 결혼했어요',
      body: '함께해 주시고, 멀리서도 마음 보내주신\n모든 분들께 진심으로 감사드립니다.\n\n보내주신 축복을 오래 간직하며\n서로 아끼고 사랑하며 잘 살겠습니다.',
    },
    beginning: {
      icon: '∞',
      title: '이제, 우리의 매일',
      body: '2026년 10월 4일,\n저희 두 사람은 부부가 되었습니다.\n\n함께 웃고, 서로의 곁을 지키며\n차곡차곡 행복을 쌓아가겠습니다.\n저희의 시작을 축복해 주셔서 감사합니다.',
    },
  };

  // Intro cover
  (function () {
    const intro = document.getElementById('intro');
    if (!intro) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.add('intro-open');

    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      document.body.classList.remove('intro-open');
      if (reduceMotion) {
        intro.classList.add('done');
        return;
      }
      intro.classList.add('leave');
      const finish = () => intro.classList.add('done');
      intro.addEventListener('transitionend', finish, { once: true });
      setTimeout(finish, 900);
    }

    if (reduceMotion) {
      dismiss();
      return;
    }
    intro.addEventListener('click', dismiss);
    intro.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dismiss();
      }
    });
    setTimeout(dismiss, 2600);
  })();

  // Background music
  (function () {
    const audio = document.getElementById('bgmAudio');
    const btn = document.getElementById('musicToggleBtn');
    if (!audio || !btn) return;

    audio.volume = 0.5;
    let userPaused = false;

    function setState(playing) {
      btn.classList.toggle('is-muted', !playing);
      btn.setAttribute('aria-pressed', String(playing));
      btn.setAttribute('aria-label', playing ? '배경음악 끄기' : '배경음악 켜기');
    }

    function tryPlay() {
      if (userPaused) return;
      audio.play().then(() => setState(true)).catch(() => setState(false));
    }

    btn.addEventListener('click', () => {
      if (audio.paused) {
        userPaused = false;
        tryPlay();
      } else {
        audio.pause();
        userPaused = true;
        setState(false);
      }
    });

    // Most mobile browsers block autoplay with sound until a real user
    // gesture, so start playback on the visitor's first tap anywhere.
    const unlock = () => tryPlay();
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true, passive: true });
  })();

  // Scroll reveal
  document.querySelectorAll('[data-animate]').forEach((el) => {
    new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && el.classList.add('visible')),
      { threshold: 0.1 }
    ).observe(el);
  });

  // Calendar
  function buildCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    const year = WEDDING_DAY.getFullYear();
    const month = WEDDING_DAY.getMonth();
    const weddingDay = WEDDING_DAY.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '';
    for (let i = 0; i < firstDay; i++) html += '<div class="calendar-day empty"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
      const dow = (firstDay + day - 1) % 7;
      let cls = 'calendar-day';
      if (dow === 0) cls += ' sunday';
      if (dow === 6) cls += ' saturday';
      if (day === weddingDay) cls += ' wedding-day';
      html += `<div class="${cls}">${day}</div>`;
    }
    grid.innerHTML = html;
  }

  let ddayTimerId = null;
  const koreanDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric', day: 'numeric',
  });

  // Count calendar days in Korea, including for guests reading from abroad.
  function updateDDay() {
    const parts = Object.fromEntries(koreanDate.formatToParts(new Date())
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]));
    const todayUTC = Date.UTC(parts.year, parts.month - 1, parts.day);
    const daysPast = Math.max(0, Math.round((todayUTC - WEDDING_DAY_UTC) / 86400000));
    const countEl = document.getElementById('ddayCount');
    if (countEl) countEl.textContent = `D+${daysPast}`;
    const text = daysPast === 0 ? '오늘, 부부가 되었습니다 🤍' : `부부가 된 지 ${daysPast}일`;
    ['marriedDays', 'ddayCountdown'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    });
  }

  function startDDayTimer() {
    if (ddayTimerId) clearInterval(ddayTimerId);
    updateDDay();
    ddayTimerId = setInterval(updateDDay, 60000);
  }

  // Toast
  let toastTimer;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // Share
  async function shareThanks() {
    const data = {
      title: '영건 ♥ 지혜 · 저희 결혼했어요',
      text: '2026년 10월 4일, 부부가 되었습니다. 보내주신 사랑과 축복에 감사드립니다.',
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
        await navigator.clipboard.writeText(window.location.href);
        showToast('링크가 복사되었습니다');
      } catch {
        showToast('공유 기능을 사용할 수 없습니다');
      }
    }
  }

  ['shareHeaderBtn', 'sharePostBtn', 'shareTabBtn'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', shareThanks);
  });

  // Like buttons
  document.querySelectorAll('.like-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('liked');
      const post = btn.closest('.post');
      const countEl = post?.querySelector('.like-count');
      if (!countEl) return;
      const base = parseInt(countEl.textContent.replace(/,/g, ''), 10);
      const liked = btn.classList.contains('liked');
      countEl.textContent = (liked ? base + 1 : base - 1).toLocaleString();
      const heart = btn.querySelector('.icon-heart');
      if (heart) {
        heart.setAttribute('fill', liked ? '#ed4956' : 'none');
        heart.setAttribute('stroke', liked ? '#ed4956' : 'currentColor');
      }
    });
  });

  // Copy account
  document.querySelectorAll('.btn-copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = '완료';
        showToast('계좌번호가 복사되었습니다');
        setTimeout(() => { btn.textContent = '복사'; }, 2000);
      } catch {
        showToast('복사에 실패했습니다');
      }
    });
  });

  // Text stories keep the familiar ring and swipe interaction without photos.
  const STORY_ORDER = Object.keys(STORY_CONTENT);
  const STORY_DURATION = 10000;
  const SWIPE_CLOSE_THRESHOLD = 80;
  const viewer = document.getElementById('storyViewer');
  const storyBars = document.getElementById('storyBars');
  const storyClose = document.getElementById('storyClose');
  const storyPause = document.getElementById('storyPause');
  const storyPrev = document.getElementById('storyPrev');
  const storyNext = document.getElementById('storyNext');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let storyBarFills = [];
  let currentStoryIndex = 0;
  let progressAnimId = null;
  let elapsed = 0;
  let lastStamp = null;
  let paused = false;
  let returnFocus = null;
  let previousOverflow = '';
  let touchStartX = 0;
  let touchStartY = 0;
  let touchingStory = false;
  let isDragging = false;
  let suppressStoryClick = false;

  function bindTap(el, handler) {
    el.addEventListener('click', handler);
  }

  function markStoryViewed(key) {
    document.querySelectorAll(`[data-story="${key}"]`).forEach((button) => {
      button.classList.add('viewed');
      button.querySelector('.story-ring')?.classList.add('viewed');
    });
  }

  function buildStoryBars() {
    storyBars.innerHTML = STORY_ORDER.map(
      () => '<div class="story-bar"><span class="story-bar-fill"></span></div>'
    ).join('');
    storyBarFills = [...storyBars.querySelectorAll('.story-bar-fill')];
  }

  function updateStoryBars() {
    storyBarFills.forEach((fill, i) => {
      const progress = i < currentStoryIndex ? 1 : i === currentStoryIndex ? elapsed / STORY_DURATION : 0;
      fill.style.width = `${Math.min(progress, 1) * 100}%`;
    });
  }

  function cancelStoryProgress() {
    if (progressAnimId !== null) cancelAnimationFrame(progressAnimId);
    progressAnimId = null;
    lastStamp = null;
  }

  function resetViewerTransform() {
    viewer.style.transform = '';
    viewer.style.opacity = '';
  }

  function closeStoryViewer() {
    if (viewer.hidden) return;
    cancelStoryProgress();
    viewer.hidden = true;
    document.body.style.overflow = previousOverflow;
    document.body.classList.remove('story-open');
    resetViewerTransform();
    returnFocus?.focus({ preventScroll: true });
  }

  function startStoryProgress() {
    cancelStoryProgress();
    if (paused || viewer.hidden || document.hidden) return;
    function tick(now) {
      if (lastStamp !== null) elapsed += now - lastStamp;
      lastStamp = now;
      updateStoryBars();
      if (elapsed >= STORY_DURATION) {
        showStoryAt(currentStoryIndex + 1);
      } else {
        progressAnimId = requestAnimationFrame(tick);
      }
    }
    progressAnimId = requestAnimationFrame(tick);
  }

  function updatePauseButton() {
    storyPause.textContent = paused ? '▶' : 'Ⅱ';
    storyPause.setAttribute('aria-label', paused ? '스토리 재생' : '스토리 일시정지');
    storyPause.setAttribute('aria-pressed', String(paused));
  }

  function showStoryAt(index) {
    if (index < 0) return;
    if (index >= STORY_ORDER.length) {
      closeStoryViewer();
      return;
    }
    cancelStoryProgress();
    currentStoryIndex = index;
    elapsed = 0;
    const key = STORY_ORDER[index];
    const data = STORY_CONTENT[key];
    document.getElementById('storyIcon').textContent = data.icon;
    document.getElementById('storyTitle').textContent = data.title;
    document.getElementById('storyBody').textContent = data.body;
    storyPrev.disabled = index === 0;
    storyNext.setAttribute('aria-label', index === STORY_ORDER.length - 1 ? '스토리 마치기' : '다음 스토리');
    markStoryViewed(key);
    updateStoryBars();
    startStoryProgress();
  }

  function openStoryViewer(key) {
    returnFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    buildStoryBars();
    viewer.hidden = false;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('story-open');
    paused = reducedMotion;
    updatePauseButton();
    resetViewerTransform();
    showStoryAt(Math.max(0, STORY_ORDER.indexOf(key)));
    storyClose.focus({ preventScroll: true });
  }

  document.querySelectorAll('[data-story]').forEach((button) => {
    bindTap(button, () => openStoryViewer(button.dataset.story));
  });
  storyClose.addEventListener('click', closeStoryViewer);
  storyPrev.addEventListener('click', () => showStoryAt(currentStoryIndex - 1));
  storyNext.addEventListener('click', () => showStoryAt(currentStoryIndex + 1));
  storyPause.addEventListener('click', () => {
    paused = !paused;
    updatePauseButton();
    if (paused) cancelStoryProgress();
    else startStoryProgress();
  });

  viewer.addEventListener('click', (e) => {
    if (suppressStoryClick || e.target.closest('button')) return;
    const midpoint = viewer.getBoundingClientRect().width / 2;
    showStoryAt(currentStoryIndex + (e.clientX < midpoint ? -1 : 1));
  });
  viewer.addEventListener('touchstart', (e) => {
    touchingStory = !e.target.closest('button');
    if (!touchingStory) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = false;
  }, { passive: true });
  viewer.addEventListener('touchmove', (e) => {
    if (!touchingStory) return;
    const dy = e.touches[0].clientY - touchStartY;
    const dx = e.touches[0].clientX - touchStartX;
    if (dy > 8 && Math.abs(dy) > Math.abs(dx)) {
      isDragging = true;
      cancelStoryProgress();
      viewer.style.transform = `translateY(${dy}px)`;
      viewer.style.opacity = String(Math.max(0.35, 1 - dy / 280));
    }
  }, { passive: true });
  viewer.addEventListener('touchend', (e) => {
    if (!touchingStory) return;
    touchingStory = false;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (isDragging || Math.abs(dx) >= 12 || Math.abs(dy) >= 12) {
      suppressStoryClick = true;
      setTimeout(() => { suppressStoryClick = false; }, 400);
    }
    if (isDragging && dy >= SWIPE_CLOSE_THRESHOLD) {
      closeStoryViewer();
    } else {
      resetViewerTransform();
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
        showStoryAt(currentStoryIndex + (dx < 0 ? 1 : -1));
      } else if (isDragging) {
        startStoryProgress();
      }
    }
    isDragging = false;
  }, { passive: true });
  viewer.addEventListener('touchcancel', () => {
    touchingStory = false;
    isDragging = false;
    resetViewerTransform();
    startStoryProgress();
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (viewer.hidden) return;
    if (e.key === 'Escape') closeStoryViewer();
    if (e.key === 'ArrowLeft') showStoryAt(currentStoryIndex - 1);
    if (e.key === 'ArrowRight') showStoryAt(currentStoryIndex + 1);
    if (e.key === 'Tab') {
      const buttons = [...viewer.querySelectorAll('button:not(:disabled)')];
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelStoryProgress();
    else startStoryProgress();
  });

  // Existing deep links still open the archived invitation when necessary.
  function revealArchiveForHash(hash = location.hash) {
    if (!hash || hash === '#') return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    const archive = target?.closest('.invitation-archive');
    if (archive) archive.open = true;
  }
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => revealArchiveForHash(link.getAttribute('href')));
  });
  window.addEventListener('hashchange', () => revealArchiveForHash());
  revealArchiveForHash();

  const transportToggle = document.getElementById('transportToggle');
  const transportPanel = document.getElementById('transportPanel');
  if (transportToggle && transportPanel) {
    bindTap(transportToggle, () => {
      const open = transportPanel.hidden;
      transportPanel.hidden = !open;
      transportToggle.setAttribute('aria-expanded', String(open));
      transportToggle.classList.toggle('is-active', open);
    });
  }

  // Bus tabs toggle
  const busTabs = document.querySelectorAll('.bus-tab');
  const busPanels = document.querySelectorAll('.bus-panel');
  if (busTabs.length && busPanels.length) {
    busTabs.forEach((tab) => {
      bindTap(tab, () => {
        const targetId = tab.getAttribute('aria-controls');
        busTabs.forEach((t) => {
          const isActive = t === tab;
          t.classList.toggle('is-active', isActive);
          t.setAttribute('aria-selected', String(isActive));
        });
        busPanels.forEach((p) => {
          const isTarget = p.id === targetId;
          p.classList.toggle('is-active', isTarget);
          p.hidden = !isTarget;
        });
      });
    });
  }

  buildCalendar();
  startDDayTimer();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateDDay();
  });
  window.addEventListener('pageshow', () => startDDayTimer());
})();
