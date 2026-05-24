(function () {
  'use strict';

  const WEDDING_DATE = new Date(2026, 5, 14);

  const STORY_IMAGES = {
    hero: { src: 'images/hero.jpg', caption: 'Our Wedding Day 💍' },
    'photo-1': { src: 'images/photo-1.jpg', caption: 'Our Moment ✨' },
    'photo-2': { src: 'images/photo-2.jpg', caption: 'Together 🤍' },
    'photo-3': { src: 'images/photo-3.jpg', caption: 'Memory 📸' },
    'photo-4': { src: 'images/photo-4.jpg', caption: 'Forever ♾️' },
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

    const year = 2026;
    const month = 5;
    const weddingDay = 14;
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

  // D-Day
  function updateDDay() {
    const el = document.getElementById('ddayCount');
    if (!el) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(WEDDING_DATE);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

    if (diff > 0) el.textContent = `D-${diff}`;
    else if (diff === 0) el.textContent = 'Today';
    else el.textContent = `D+${Math.abs(diff)}`;
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
      title: '민수 ♥ 지은 결혼식에 초대합니다',
      text: '2026년 6월 14일, 저희 결혼식에 초대합니다.',
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

  // Account tabs
  document.querySelectorAll('.account-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.account-tab').forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.account-panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(`panel-${tab.dataset.tab}`)?.classList.add('active');
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
  updateDDay();
})();
