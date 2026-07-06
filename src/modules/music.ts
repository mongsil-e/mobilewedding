import { $, $$ } from './dom';

/* generative music box — no audio files, pure WebAudio */
const SEQ: (number | null)[] = [
  440, 554.37, 659.25, 880, null, 659.25, 554.37, null,
  329.63, 493.88, 659.25, 830.61, null, 659.25, 493.88, null,
  369.99, 554.37, 739.99, 880, null, 739.99, 554.37, null,
  293.66, 440, 587.33, 739.99, null, 587.33, 440, null,
];

export function initMusic() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let step = 0;
  let on = false;

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

  function set(state: boolean) {
    on = state;
    document.body.classList.toggle('music-on', on);
    $$('#musicPlay').forEach((b) => {
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? '일시정지' : '재생');
    });
    if (on) start();
    else stop();
  }

  $('#musicPlay')?.addEventListener('click', () => set(!on));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && on) set(false);
  });
}
