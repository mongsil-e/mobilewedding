import { $, reducedMotion } from './dom';
import { openApp } from './os';

type Sender = 'yg' | 'jh' | 'sys';

interface Line {
  from: Sender;
  text?: string;
  invite?: boolean;
  pause?: number;
}

const SCRIPT: Line[] = [
  { from: 'sys', text: '2026년, 가을의 문턱에서' },
  { from: 'yg', text: '드디어 모두에게 말할 수 있게 됐어요..!' },
  { from: 'yg', text: '저희 두 사람, 결혼합니다 💍' },
  { from: 'jh', text: '2026년 10월 4일 일요일, 오전 10시 30분 ☀️' },
  { from: 'yg', text: '천안 비렌티웨딩홀 4층 매그넘홀에서요!' },
  { from: 'jh', text: '서로 다른 두 길을 걸어온 우리, 이제 하나의 길을 함께 걸어가려 해요.' },
  { from: 'yg', text: '오셔서 저희의 첫 시작을 축복해 주시면 더없이 행복하겠습니다 🙏' },
  { from: 'jh', invite: true, pause: 500 },
  { from: 'sys', text: '💌 초대장이 도착했습니다 — 아이콘을 눌러 앱을 구경해 보세요' },
];

const AVATARS: Record<Sender, string> = { yg: '🤵🏻', jh: '👰🏻', sys: '' };
const NAMES: Record<Sender, string> = { yg: '영건', jh: '지혜', sys: '' };

function buildBubble(line: Line): HTMLElement {
  const row = document.createElement('div');

  if (line.from === 'sys') {
    row.className = 'msg msg--sys';
    row.innerHTML = `<div class="msg-bubble">${line.text}</div>`;
    return row;
  }

  const side = line.from === 'jh' ? 'msg--right' : '';
  row.className = `msg ${side}`;

  const content = line.invite
    ? `<div class="msg-invite">
         <img src="/images/gallery/DSCF3804.jpg" alt="청첩장 미리보기" loading="lazy">
         <div class="msg-invite-body">
           <strong>영건 ♥ 지혜 결혼식에 초대합니다</strong>
           <span>10월 4일 (일) 오전 10:30 · 비렌티웨딩홀 4층</span>
         </div>
         <div class="msg-invite-actions">
           <button type="button" data-open="app-calendar">📅 일정 보기</button>
           <button type="button" data-open="app-map">📍 오시는 길</button>
         </div>
       </div>`
    : `<div class="msg-bubble">${line.text}</div>`;

  row.innerHTML = `
    <span class="msg-avatar">${AVATARS[line.from]}</span>
    <div class="msg-col">
      <span class="msg-name">${NAMES[line.from]}</span>
      ${content}
    </div>`;
  return row;
}

function buildTyping(from: Sender): HTMLElement {
  const row = document.createElement('div');
  row.className = `msg ${from === 'jh' ? 'msg--right' : ''}`;
  row.innerHTML = `
    <span class="msg-avatar">${AVATARS[from]}</span>
    <div class="msg-col">
      <span class="msg-name">${NAMES[from]}</span>
      <div class="msg-bubble msg-typing"><i></i><i></i><i></i></div>
    </div>`;
  return row;
}

export function initMessages() {
  const stream = $('#chatStream');
  const body = $('#chatBody');
  const skip = $('#chatSkip');
  const app = $('#app-messages');
  if (!stream || !body || !app) return;

  let played = false;
  let playing = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const scrollDown = () => {
    body.scrollTo({ top: body.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  function renderAll() {
    if (timer) clearTimeout(timer);
    playing = false;
    played = true;
    stream!.innerHTML = '';
    SCRIPT.forEach((line) => stream!.appendChild(buildBubble(line)));
    scrollDown();
  }

  function play() {
    if (playing || played) return;
    playing = true;
    let i = 0;

    const next = () => {
      if (i >= SCRIPT.length) {
        playing = false;
        played = true;
        return;
      }
      const line = SCRIPT[i];
      i += 1;

      if (line.from === 'sys') {
        stream!.appendChild(buildBubble(line));
        scrollDown();
        timer = setTimeout(next, 700);
        return;
      }

      const typing = buildTyping(line.from);
      stream!.appendChild(typing);
      scrollDown();

      const typeFor = reducedMotion ? 10 : Math.min(1400, 480 + (line.text?.length ?? 20) * 22);
      timer = setTimeout(() => {
        typing.replaceWith(buildBubble(line));
        scrollDown();
        timer = setTimeout(next, (line.pause ?? 0) + (reducedMotion ? 10 : 620));
      }, typeFor);
    };

    next();
  }

  app.addEventListener('app:open', () => {
    if (played) {
      renderAll();
      requestAnimationFrame(scrollDown);
    } else {
      setTimeout(play, 500);
    }
  });

  skip?.addEventListener('click', renderAll);

  /* invite-card buttons switch apps */
  stream.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-open]');
    if (btn) openApp(btn.dataset.open!);
  });
}
