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
    setTimeout(dismiss, 2600);
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

  function markStoryViewed(key) {
    const story = document.querySelector(`.story[data-story="${key}"]`);
    const ring = story?.querySelector('.story-ring');
    if (!story || !ring) return;
    story.classList.add('viewed');
    ring.classList.add('viewed');
    void ring.offsetWidth;
  }

  function markProfileViewed() {
    const wrap = document.querySelector('.profile-avatar-wrap');
    const ring = wrap?.querySelector('.story-ring');
    if (!wrap || !ring) return;
    wrap.classList.add('viewed');
    ring.classList.add('viewed');
    void ring.offsetWidth;
  }

  function bindTap(el, handler) {
    el.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      handler(e);
    });
  }

  const viewportMeta = document.getElementById('viewportMeta');
  const DEFAULT_VIEWPORT = viewportMeta?.content || '';
  let zoomLockCount = 0;
  let storyBarFills = [];

  function onPinchTouchMove(e) {
    if (e.touches.length > 1) e.preventDefault();
  }

  function onGesture(e) {
    e.preventDefault();
  }

  function enableZoomLock() {
    zoomLockCount += 1;
    if (zoomLockCount > 1) return;
    if (viewportMeta) {
      viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, viewport-fit=cover, user-scalable=no';
    }
    document.addEventListener('touchmove', onPinchTouchMove, { passive: false });
    document.addEventListener('gesturestart', onGesture, { passive: false });
    document.addEventListener('gesturechange', onGesture, { passive: false });
    document.addEventListener('gestureend', onGesture, { passive: false });
  }

  function disableZoomLock() {
    zoomLockCount = Math.max(0, zoomLockCount - 1);
    if (zoomLockCount > 0) return;
    if (viewportMeta) viewportMeta.content = DEFAULT_VIEWPORT;
    document.removeEventListener('touchmove', onPinchTouchMove);
    document.removeEventListener('gesturestart', onGesture);
    document.removeEventListener('gesturechange', onGesture);
    document.removeEventListener('gestureend', onGesture);
  }

  const viewer = document.getElementById('storyViewer');
  const storyBars = document.getElementById('storyBars');
  const storyImg = document.getElementById('storyImage');
  const storyCaption = document.getElementById('storyCaption');
  const storyClose = document.getElementById('storyClose');

  let currentStoryIndex = 0;
  let progressAnimId = null;
  let touchStartY = 0;
  let touchStartX = 0;
  let isDragging = false;
  let suppressStoryClick = false;

  function handleStoryNavigation(clientX) {
    const ratio = clientX / window.innerWidth;
    if (ratio < 0.5) {
      if (currentStoryIndex > 0) showStoryAt(currentStoryIndex - 1);
      return;
    }
    if (currentStoryIndex < STORY_ORDER.length - 1) showStoryAt(currentStoryIndex + 1);
  }

  function buildStoryBars() {
    if (!storyBars) return;
    storyBars.innerHTML = STORY_ORDER.map(
      () => '<div class="story-bar"><span class="story-bar-fill"></span></div>'
    ).join('');
    storyBarFills = [...storyBars.querySelectorAll('.story-bar-fill')];
  }

  function updateStoryBars(index, progress) {
    const pct = `${Math.max(0, Math.min(progress, 1)) * 100}%`;
    storyBarFills.forEach((fill, i) => {
      if (i < index) fill.style.width = '100%';
      else if (i === index) fill.style.width = pct;
      else fill.style.width = '0%';
    });
  }

  function loadStoryImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(src);
      img.onerror = reject;
      img.src = src;
    });
  }

  function clearStoryImage() {
    if (!storyImg) return;
    storyImg.style.display = 'none';
    storyImg.style.backgroundImage = '';
  }

  function setStoryImage(src) {
    if (!storyImg) return;
    storyImg.style.backgroundImage = `url("${src}")`;
    storyImg.style.display = 'block';
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
    disableZoomLock();
    resetViewerTransform();
    clearStoryImage();
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

    markStoryViewed(key);
    cancelStoryProgress();
    updateStoryBars(index, 0);
    storyCaption.textContent = data.caption;
    clearStoryImage();

    loadStoryImage(data.src)
      .then((src) => {
        if (currentStoryIndex !== index || viewer.hidden) return;
        setStoryImage(src);
        startStoryProgress();
      })
      .catch(() => {
        if (currentStoryIndex !== index || viewer.hidden) return;
        clearStoryImage();
        storyCaption.textContent = `${data.caption} (사진을 추가해 주세요)`;
        startStoryProgress();
      });
  }

  function openStoryViewer(startKey) {
    if (!viewer) return;
    buildStoryBars();
    currentStoryIndex = Math.max(0, STORY_ORDER.indexOf(startKey));
    viewer.hidden = false;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('story-open');
    enableZoomLock();
    resetViewerTransform();
    showStoryAt(currentStoryIndex);
  }

  function openStoryFromButton(storyEl) {
    const key = storyEl.dataset.story;
    if (!key) return;
    markStoryViewed(key);
    openStoryViewer(key);
  }

  document.querySelectorAll('.story').forEach((story) => {
    bindTap(story, () => openStoryFromButton(story));
  });

  storyClose?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeStoryViewer();
  });

  viewer?.addEventListener('click', (e) => {
    if (viewer.hidden || suppressStoryClick || isDragging) return;
    if (e.target.closest('#storyClose')) return;
    handleStoryNavigation(e.clientX);
  });

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
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (isDragging && dy >= SWIPE_CLOSE_THRESHOLD) {
      closeStoryViewer();
      isDragging = false;
      return;
    }

    if (!isDragging && Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      suppressStoryClick = true;
      handleStoryNavigation(e.changedTouches[0].clientX);
      setTimeout(() => { suppressStoryClick = false; }, 400);
      isDragging = false;
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

  // Gallery viewer
  const galleryViewer = document.getElementById('galleryViewer');
  const galleryTrack = document.getElementById('galleryTrack');
  const galleryStage = document.getElementById('galleryStage');
  const galleryCounter = document.getElementById('galleryCounter');
  const galleryClose = document.getElementById('galleryClose');

  const galleryImages = [...document.querySelectorAll('.profile-grid .grid-item:not(.empty) img')]
    .map((img) => img.getAttribute('src'))
    .filter(Boolean);

  let activeGalleryImages = galleryImages;

  let galleryIndex = 0;
  let galleryDragOffset = 0;
  let galleryTouchStartX = 0;
  let galleryTouchStartY = 0;
  let galleryGesture = null;
  let galleryBlockClick = false;

  function buildGalleryTrack(images) {
    if (!galleryTrack) return;
    galleryTrack.innerHTML = images.map(
      (src) => `<div class="gallery-slide"><img src="${src}" alt="" draggable="false" loading="lazy" decoding="async"></div>`
    ).join('');
  }

  function clampGalleryIndex(index) {
    return Math.max(0, Math.min(index, activeGalleryImages.length - 1));
  }

  function setGalleryTransform(animate) {
    if (!galleryTrack) return;
    galleryTrack.classList.toggle('is-dragging', !animate);
    galleryTrack.style.transform = `translateX(calc(-${galleryIndex * 100}% + ${galleryDragOffset}px))`;
    if (galleryCounter) {
      galleryCounter.textContent = `${galleryIndex + 1} / ${activeGalleryImages.length}`;
    }
  }

  function resetGalleryTransform() {
    if (!galleryViewer) return;
    galleryViewer.style.transform = '';
    galleryViewer.style.opacity = '';
  }

  function closeGalleryViewer() {
    if (!galleryViewer) return;
    galleryViewer.hidden = true;
    document.body.style.overflow = '';
    document.body.classList.remove('gallery-open');
    disableZoomLock();
    resetGalleryTransform();
    galleryDragOffset = 0;
    galleryGesture = null;
  }

  function showGalleryAt(index, animate = true) {
    galleryIndex = clampGalleryIndex(index);
    galleryDragOffset = 0;
    setGalleryTransform(animate);
  }

  function openGalleryViewer(index, images = galleryImages) {
    if (!galleryViewer || !images.length) return;
    activeGalleryImages = images;
    buildGalleryTrack(activeGalleryImages);
    galleryViewer.hidden = false;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('gallery-open');
    enableZoomLock();
    resetGalleryTransform();
    showGalleryAt(index, false);
    requestAnimationFrame(() => setGalleryTransform(true));
  }

  function shiftGallery(step) {
    if (activeGalleryImages.length <= 1) return;
    showGalleryAt(galleryIndex + step);
  }

  document.querySelectorAll('.profile-grid .grid-item:not(.empty)').forEach((item, index) => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `사진 ${index + 1} 보기`);
    item.addEventListener('click', () => openGalleryViewer(index));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGalleryViewer(index);
      }
    });
  });

  const locationMapMedia = document.querySelector('.post-media--map:not(.is-empty)');
  const locationMapImg = locationMapMedia?.querySelector('img');
  if (locationMapMedia && locationMapImg?.getAttribute('src')) {
    locationMapMedia.classList.add('post-media--clickable');
    locationMapMedia.setAttribute('role', 'button');
    locationMapMedia.setAttribute('tabindex', '0');
    locationMapMedia.setAttribute('aria-label', '약도 크게 보기');
    const openLocationMap = () => openGalleryViewer(0, [locationMapImg.getAttribute('src')]);
    locationMapMedia.addEventListener('click', openLocationMap);
    locationMapMedia.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLocationMap();
      }
    });
  }

  const profileAvatarWrap = document.querySelector('.profile-avatar-wrap');
  const profileImg = profileAvatarWrap?.querySelector('img');
  if (profileAvatarWrap && profileImg?.getAttribute('src')) {
    profileAvatarWrap.classList.add('profile-avatar-wrap--clickable');
    profileAvatarWrap.setAttribute('role', 'button');
    profileAvatarWrap.setAttribute('tabindex', '0');
    profileAvatarWrap.setAttribute('aria-label', '프로필 사진 크게 보기');
    const openProfilePhoto = () => {
      markProfileViewed();
      openGalleryViewer(0, [profileImg.getAttribute('src')]);
    };
    bindTap(profileAvatarWrap, openProfilePhoto);
    profileAvatarWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProfilePhoto();
      }
    });
  }

  galleryClose?.addEventListener('click', closeGalleryViewer);

  galleryStage?.addEventListener('click', (e) => {
    if (galleryViewer.hidden || galleryBlockClick || activeGalleryImages.length <= 1) return;
    const ratio = e.clientX / window.innerWidth;
    if (ratio < 0.35) shiftGallery(-1);
    else if (ratio > 0.65) shiftGallery(1);
  });

  galleryViewer?.addEventListener('touchstart', (e) => {
    if (galleryViewer.hidden) return;
    galleryTouchStartX = e.touches[0].clientX;
    galleryTouchStartY = e.touches[0].clientY;
    galleryGesture = null;
    galleryDragOffset = 0;
  }, { passive: true });

  galleryViewer?.addEventListener('touchmove', (e) => {
    if (galleryViewer.hidden) return;
    const dx = e.touches[0].clientX - galleryTouchStartX;
    const dy = e.touches[0].clientY - galleryTouchStartY;

    if (!galleryGesture) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) galleryGesture = 'horizontal';
      else if (dy > 8 && Math.abs(dy) > Math.abs(dx)) galleryGesture = 'vertical';
    }

    if (galleryGesture === 'horizontal') {
      const atStart = galleryIndex === 0 && dx > 0;
      const atEnd = galleryIndex === activeGalleryImages.length - 1 && dx < 0;
      galleryDragOffset = atStart || atEnd ? dx * 0.35 : dx;
      setGalleryTransform(false);
      return;
    }

    if (galleryGesture === 'vertical' && dy > 0) {
      galleryViewer.style.transform = `translateY(${dy}px)`;
      galleryViewer.style.opacity = String(Math.max(0.35, 1 - dy / 280));
    }
  }, { passive: true });

  galleryViewer?.addEventListener('touchend', (e) => {
    if (galleryViewer.hidden) return;
    const dx = e.changedTouches[0].clientX - galleryTouchStartX;
    const dy = e.changedTouches[0].clientY - galleryTouchStartY;

    if (galleryGesture === 'horizontal') {
      if (dx <= -60) shiftGallery(1);
      else if (dx >= 60) shiftGallery(-1);
      else showGalleryAt(galleryIndex);
      galleryBlockClick = true;
      setTimeout(() => { galleryBlockClick = false; }, 300);
      galleryGesture = null;
      return;
    }

    if (galleryGesture === 'vertical' && dy >= SWIPE_CLOSE_THRESHOLD) {
      closeGalleryViewer();
      return;
    }

    resetGalleryTransform();
    galleryGesture = null;
  }, { passive: true });

  galleryViewer?.addEventListener('wheel', (e) => {
    if (galleryViewer.hidden) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (e.deltaX > 0) shiftGallery(1);
      else shiftGallery(-1);
      return;
    }
    if (e.deltaY > 0) closeGalleryViewer();
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (galleryViewer?.hidden) return;
    if (e.key === 'Escape') closeGalleryViewer();
    if (e.key === 'ArrowLeft') shiftGallery(-1);
    if (e.key === 'ArrowRight') shiftGallery(1);
  });

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

  buildCalendar();
  startDDayTimer();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateDDay();
  });
  window.addEventListener('pageshow', () => startDDayTimer());
})();
