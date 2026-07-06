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
        if (btn.classList.contains('account-copy')) {
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
export function initShare() {
  $('#shareBtn')?.addEventListener('click', async () => {
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
  });
}

/* ── Blessing button: physics confetti ──────────── */
const BLESS_KEY = 'yj-blessings';

export function initBless(onBless: () => void) {
  const btn = $('#blessBtn');
  const countEl = $('#blessCount');
  if (!btn) return;

  let count = 0;
  try { count = parseInt(localStorage.getItem(BLESS_KEY) || '0', 10) || 0; } catch { /* ignore */ }
  if (countEl) countEl.textContent = count.toLocaleString();

  const GLYPHS = ['♥', '♡', '❀', '✿'];
  const COLORS = ['#d98f83', '#c9a06c', '#e7b9ae', '#b98b52'];

  btn.addEventListener('click', (e) => {
    count += 1;
    if (countEl) countEl.textContent = count.toLocaleString();
    try { localStorage.setItem(BLESS_KEY, String(count)); } catch { /* ignore */ }
    vibrate([8, 40, 8]);
    onBless();

    const me = e as MouseEvent;
    const r = btn.getBoundingClientRect();
    const x = me.clientX || r.left + r.width / 2;
    const y = me.clientY || r.top;

    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span');
      s.className = 'confetti-heart';
      s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      s.style.cssText = `left:${x}px;top:${y}px;color:${COLORS[(Math.random() * COLORS.length) | 0]};font-size:${12 + Math.random() * 14}px`;
      document.body.appendChild(s);

      gsap.to(s, {
        physics2D: {
          velocity: gsap.utils.random(260, 560),
          angle: gsap.utils.random(-125, -55),
          gravity: 900,
        },
        rotation: gsap.utils.random(-180, 180),
        duration: 1.7,
        ease: 'none',
      });
      gsap.to(s, {
        opacity: 0,
        duration: 0.5,
        delay: 1.2,
        onComplete: () => s.remove(),
      });
    }
  });
}

/* ── Generative music box (WebAudio) ────────────── */
export function initMusic() {
  const btn = $('#musicBtn');
  if (!btn) return;

  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let step = 0;

  /* gentle music-box arpeggio — I · V · vi · IV in A major, pentatonic-leaning */
  const SEQ: (number | null)[] = [
    440, 554.37, 659.25, 880, null, 659.25, 554.37, null,
    329.63, 493.88, 659.25, 830.61, null, 659.25, 493.88, null,
    369.99, 554.37, 739.99, 880, null, 739.99, 554.37, null,
    293.66, 440, 587.33, 739.99, null, 587.33, 440, null,
  ];

  function pluck(freq: number, at: number) {
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 2600;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.16, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.4);
    osc.connect(filter).connect(gain).connect(master);
    osc.start(at);
    osc.stop(at + 1.5);
  }

  function start() {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.5;

      /* soft space: feedback delay */
      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.42;
      const fb = ctx.createGain();
      fb.gain.value = 0.28;
      const wet = ctx.createGain();
      wet.gain.value = 0.35;
      master.connect(ctx.destination);
      master.connect(delay);
      delay.connect(fb).connect(delay);
      delay.connect(wet).connect(ctx.destination);
    }
    ctx.resume();
    step = 0;
    timer = setInterval(() => {
      const note = SEQ[step % SEQ.length];
      if (note && ctx) pluck(note, ctx.currentTime + 0.02);
      step += 1;
    }, 300);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    ctx?.suspend();
  }

  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? '배경음악 끄기' : '배경음악 켜기');
    if (on) start();
    else stop();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && btn.getAttribute('aria-pressed') === 'true') {
      btn.setAttribute('aria-pressed', 'false');
      stop();
    }
  });
}
