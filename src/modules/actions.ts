import gsap from 'gsap';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { $, $$, showToast, vibrate } from './dom';

gsap.registerPlugin(Physics2DPlugin);

/* ── Copy buttons ───────────────────────────────── */
export function initCopy() {
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy!);
        vibrate(10);
        if (btn.classList.contains('pay-copy')) {
          btn.classList.add('done');
          const prev = btn.textContent;
          btn.textContent = '완료';
          setTimeout(() => {
            btn.classList.remove('done');
            btn.textContent = prev;
          }, 1800);
        }
        showToast(btn.dataset.copyMsg || '복사되었습니다');
      } catch {
        showToast('복사에 실패했습니다');
      }
    });
  });
}

/* ── Web Share ──────────────────────────────────── */
export async function shareInvitation() {
  const data = {
    title: '영건 ♥ 지혜 결혼식에 초대합니다',
    text: '2026년 10월 4일 일요일 오전 10:30, 천안 비렌티웨딩홀에서 저희의 첫 시작을 함께해 주세요.',
    url: location.origin + location.pathname,
  };
  if (navigator.share) {
    try {
      await navigator.share(data);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') showToast('공유에 실패했습니다');
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

export function initShare() {
  $('#shareBtn')?.addEventListener('click', shareInvitation);
  $('#dockShare')?.addEventListener('click', shareInvitation);
}

/* ── Blessing button: physics confetti ──────────── */
const BLESS_KEY = 'yj-blessings';

export function initBless() {
  const btn = $('#blessBtn');
  const countEl = $('#blessCount');
  if (!btn) return;

  let count = 0;
  try { count = parseInt(localStorage.getItem(BLESS_KEY) || '0', 10) || 0; } catch { /* ignore */ }
  if (countEl) countEl.textContent = count.toLocaleString();

  const GLYPHS = ['♥', '♡', '❀', '✿'];
  const COLORS = ['#d98f83', '#c9a06c', '#e7b9ae', '#b98b52'];

  btn.addEventListener('click', () => {
    count += 1;
    if (countEl) countEl.textContent = count.toLocaleString();
    try { localStorage.setItem(BLESS_KEY, String(count)); } catch { /* ignore */ }
    vibrate([8, 40, 8]);

    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;

    for (let i = 0; i < 18; i++) {
      const s = document.createElement('span');
      s.className = 'confetti-heart';
      s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      s.style.cssText = `left:${x}px;top:${y}px;color:${COLORS[(Math.random() * COLORS.length) | 0]};font-size:${12 + Math.random() * 15}px`;
      document.body.appendChild(s);

      gsap.to(s, {
        physics2D: {
          velocity: gsap.utils.random(280, 620),
          angle: gsap.utils.random(-140, -40),
          gravity: 900,
        },
        rotation: gsap.utils.random(-180, 180),
        duration: 1.8,
        ease: 'none',
      });
      gsap.to(s, { opacity: 0, duration: 0.5, delay: 1.3, onComplete: () => s.remove() });
    }
  });
}
