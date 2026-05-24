(function () {
  'use strict';

  const WEDDING_DAY = new Date(2026, 9, 4);
  const CEREMONY_AT = new Date(2026, 9, 4, 10, 30, 0);

  const STORY_IMAGES = {
    hero: { src: 'images/stories/ourday.jpg', caption: 'Our Wedding Day 💍' },
    'photo-1': { src: 'images/stories/moment.jpg', caption: 'Our Moment ✨' },
    'photo-2': { src: 'images/stories/together.jpg', caption: 'Together 🤍' },
    'photo-3': { src: 'images/stories/memory.jpg', caption: 'Memory 📸' },
    'photo-4': { src: 'images/stories/foever.jpg', caption: 'Forever ♾️' },
  };

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

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  let ddayTimerId = null;
  let demoAnchor = null;

  function getNow() {
    const demo = new URLSearchParams(location.search).get('demo');
    if (demo === 'wedding-day') {
      if (!demoAnchor) {
        demoAnchor = {
          real: Date.now(),
          sim: new Date(2026, 9, 4, 8, 0, 15).getTime(),
        };
      }
      return new Date(demoAnchor.sim + (Date.now() - demoAnchor.real));
    }
    return new Date();
  }

  function setCountdownText(text) {
    const el = document.getElementById('ddayCountdown');
    if (el) el.textContent = text;
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  // D-Day: 날짜는 00시 기준, 당일만 예식까지 시·분·초 카운트다운
  function updateDDay() {
    const countEl = document.getElementById('ddayCount');
    const now = getNow();
    const today = startOfDay(now);
    const weddingDay = startOfDay(WEDDING_DAY);
    const dayDiff = Math.round((weddingDay - today) / 86400000);

    if (dayDiff > 0) {
      const untilCeremony = CEREMONY_AT - now;
      const days = Math.floor(untilCeremony / 86400000);
      const hours = Math.floor((untilCeremony % 86400000) / 3600000);
      const mins = Math.floor((untilCeremony % 3600000) / 60000);
      const secs = Math.floor((untilCeremony % 60000) / 1000);

      if (countEl) countEl.textContent = `D-${dayDiff}`;
      setCountdownText(`${days}일 ${pad(hours)}시간 ${pad(mins)}분 ${pad(secs)}초`);
      return;
    }

    if (dayDiff === 0) {
      const untilCeremony = CEREMONY_AT - now;

      if (countEl) countEl.textContent = 'D-Day';
      if (untilCeremony > 0) {
        const hours = Math.floor(untilCeremony / 3600000);
        const mins = Math.floor((untilCeremony % 3600000) / 60000);
        const secs = Math.floor((untilCeremony % 60000) / 1000);
        setCountdownText(`${pad(hours)}시간 ${pad(mins)}분 ${pad(secs)}초`);
      } else {
        setCountdownText('오늘은 결혼식 날입니다 💍');
      }
      return;
    }

    const daysPast = Math.abs(dayDiff);
    if (countEl) countEl.textContent = `D+${daysPast}`;
    setCountdownText(`결혼식 후 ${daysPast}일`);
  }

  function startDDayTimer() {
    if (ddayTimerId) clearInterval(ddayTimerId);
    updateDDay();
    ddayTimerId = setInterval(updateDDay, 1000);
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
  async function shareInvitation() {
    const data = {
      title: '영건 ♥ 지혜 결혼식에 초대합니다',
      text: '2026년 10월 4일, 저희 결혼식에 초대합니다.',
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
    if (btn) btn.addEventListener('click', shareInvitation);
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

  // Story viewer
  const STORY_ORDER = ['hero', 'photo-1', 'photo-2', 'photo-3', 'photo-4'];
  const STORY_DURATION = 5000;
  const SWIPE_CLOSE_THRESHOLD = 80;

  const viewer = document.getElementById('storyViewer');
  const storyBars = document.getElementById('storyBars');
  const storyViewerContent = document.getElementById('storyViewerContent');
  const storyImg = document.getElementById('storyImage');
  const storyCaption = document.getElementById('storyCaption');
  const storyClose = document.getElementById('storyClose');

  let currentStoryIndex = 0;
  let progressAnimId = null;
  let touchStartY = 0;
  let touchStartX = 0;
  let isDragging = false;

  function buildStoryBars() {
    if (!storyBars) return;
    storyBars.innerHTML = STORY_ORDER.map(
      () => '<div class="story-bar"><span class="story-bar-fill"></span></div>'
    ).join('');
  }

  function updateStoryBars(index, progress) {
    document.querySelectorAll('.story-bar-fill').forEach((fill, i) => {
      if (i < index) {
        fill.style.transform = 'scaleX(1)';
      } else if (i === index) {
        fill.style.transform = `scaleX(${progress})`;
      } else {
        fill.style.transform = 'scaleX(0)';
      }
    });
  }

  function cancelStoryProgress() {
    if (progressAnimId) {
      cancelAnimationFrame(progressAnimId);
      progressAnimId = null;
    }
  }

  function resetViewerTransform() {
    if (!viewer) return;
    viewer.style.transform = '';
    viewer.style.opacity = '';
  }

  function closeStoryViewer() {
    cancelStoryProgress();
    if (!viewer) return;
    viewer.hidden = true;
    document.body.style.overflow = '';
    document.body.classList.remove('story-open');
    resetViewerTransform();
    if (storyImg) storyImg.src = '';
  }

  function startStoryProgress() {
    cancelStoryProgress();
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / STORY_DURATION, 1);
      updateStoryBars(currentStoryIndex, progress);
      if (progress < 1) {
        progressAnimId = requestAnimationFrame(tick);
        return;
      }
      showStoryAt(currentStoryIndex + 1);
    }

    progressAnimId = requestAnimationFrame(tick);
  }

  function showStoryAt(index) {
    if (index >= STORY_ORDER.length) {
      closeStoryViewer();
      return;
    }

    currentStoryIndex = index;
    const key = STORY_ORDER[index];
    const data = STORY_IMAGES[key];
    if (!data || !viewer) return;

    updateStoryBars(index, 0);
    storyCaption.textContent = data.caption;
    storyImg.style.display = 'none';
    storyImg.onerror = () => {
      storyImg.style.display = 'none';
      storyCaption.textContent = `${data.caption} (사진을 추가해 주세요)`;
      startStoryProgress();
    };
    storyImg.onload = () => {
      storyImg.style.display = 'block';
      startStoryProgress();
    };
    storyImg.src = data.src;
    if (storyImg.complete) storyImg.onload();
  }

  function openStoryViewer(startKey) {
    if (!viewer) return;
    buildStoryBars();
    currentStoryIndex = Math.max(0, STORY_ORDER.indexOf(startKey));
    viewer.hidden = false;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('story-open');
    resetViewerTransform();
    showStoryAt(currentStoryIndex);
  }

  document.querySelectorAll('.story').forEach((story) => {
    story.addEventListener('click', () => openStoryViewer(story.dataset.story));
  });

  storyClose?.addEventListener('click', closeStoryViewer);

  viewer?.addEventListener('touchstart', (e) => {
    if (viewer.hidden) return;
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    isDragging = false;
  }, { passive: true });

  viewer?.addEventListener('touchmove', (e) => {
    if (viewer.hidden) return;
    const dy = e.touches[0].clientY - touchStartY;
    const dx = e.touches[0].clientX - touchStartX;
    if (!isDragging && Math.abs(dy) > Math.abs(dx) && dy > 8) {
      isDragging = true;
      cancelStoryProgress();
    }
    if (!isDragging || dy <= 0) return;
    viewer.style.transform = `translateY(${dy}px)`;
    viewer.style.opacity = String(Math.max(0.35, 1 - dy / 280));
  }, { passive: true });

  viewer?.addEventListener('touchend', (e) => {
    if (viewer.hidden) return;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (isDragging && dy >= SWIPE_CLOSE_THRESHOLD) {
      closeStoryViewer();
      return;
    }
    resetViewerTransform();
    if (isDragging) startStoryProgress();
    isDragging = false;
  }, { passive: true });

  viewer?.addEventListener('wheel', (e) => {
    if (viewer.hidden || e.deltaY <= 0) return;
    closeStoryViewer();
  }, { passive: true });

  buildCalendar();
  startDDayTimer();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateDDay();
  });
  window.addEventListener('pageshow', () => startDDayTimer());
})();
