(function () {
  'use strict';

  const WEDDING_AT = new Date(2026, 9, 4, 10, 30, 0);

  const STORY_IMAGES = {
    hero: { src: 'images/profile/avatar.jpg', caption: 'Our Wedding Day 💍' },
    'photo-1': { src: 'images/stories/02-moment.jpg', caption: 'Our Moment ✨' },
    'photo-2': { src: 'images/stories/03-together.jpg', caption: 'Together 🤍' },
    'photo-3': { src: 'images/stories/04-memory.jpg', caption: 'Memory 📸' },
    'photo-4': { src: 'images/stories/05-forever.jpg', caption: 'Forever ♾️' },
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

    const year = WEDDING_AT.getFullYear();
    const month = WEDDING_AT.getMonth();
    const weddingDay = WEDDING_AT.getDate();
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

  // D-Day (실시간 갱신)
  function updateDDay() {
    const countEl = document.getElementById('ddayCount');
    const detailEl = document.getElementById('ddayCountdown');
    const now = new Date();
    const diffMs = WEDDING_AT - now;

    if (diffMs > 0) {
      const days = Math.floor(diffMs / 86400000);
      const hours = Math.floor((diffMs % 86400000) / 3600000);
      const mins = Math.floor((diffMs % 3600000) / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);

      if (countEl) countEl.textContent = days > 0 ? `D-${days}` : 'Today';
      if (detailEl) {
        detailEl.textContent = days > 0
          ? `${days}일 ${pad(hours)}시간 ${pad(mins)}분 ${pad(secs)}초`
          : `${pad(hours)}시간 ${pad(mins)}분 ${pad(secs)}초`;
      }
      return;
    }

    const pastMs = Math.abs(diffMs);
    const days = Math.floor(pastMs / 86400000);

    if (countEl) countEl.textContent = days > 0 ? `D+${days}` : 'Today';
    if (detailEl) {
      detailEl.textContent = days > 0
        ? `결혼식 후 ${days}일`
        : '오늘은 결혼식 날입니다 💍';
    }
  }

  function startDDayTimer() {
    updateDDay();
    setInterval(updateDDay, 1000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) updateDDay();
    });
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
      url: window.location.href,
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
  const viewer = document.getElementById('storyViewer');
  const storyImg = document.getElementById('storyImage');
  const storyCaption = document.getElementById('storyCaption');
  const storyClose = document.getElementById('storyClose');

  document.querySelectorAll('.story').forEach((story) => {
    story.addEventListener('click', () => {
      const key = story.dataset.story;
      const data = STORY_IMAGES[key];
      if (!data || !viewer) return;

      storyImg.src = data.src;
      storyImg.onerror = () => {
        storyImg.style.display = 'none';
        storyCaption.textContent = data.caption + ' (사진을 추가해 주세요)';
      };
      storyImg.onload = () => { storyImg.style.display = 'block'; };
      storyCaption.textContent = data.caption;
      viewer.hidden = false;
      document.body.style.overflow = 'hidden';

      const bar = viewer.querySelector('.story-viewer-bar span');
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = '';
    });
  });

  storyClose?.addEventListener('click', () => {
    viewer.hidden = true;
    document.body.style.overflow = '';
  });

  buildCalendar();
  startDDayTimer();
})();
