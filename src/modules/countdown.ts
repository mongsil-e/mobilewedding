import { $, $$, pad, getNow } from './dom';

export const WEDDING_DAY = new Date(2026, 9, 4);
export const CEREMONY_AT = new Date(2026, 9, 4, 10, 30, 0);

interface Cell { cell: HTMLElement; reel: HTMLElement; value: number }
interface Group { el: HTMLElement; cells: Cell[] }

function makeOdometer() {
  const groups: Record<string, Group> = {};
  $$('[data-odo]').forEach((el) => {
    groups[el.dataset.odo!] = { el, cells: [] };
  });
  if (!Object.keys(groups).length) return null;

  function makeCell(group: Group) {
    const cell = document.createElement('div');
    cell.className = 'odo-cell';
    const reel = document.createElement('div');
    reel.className = 'odo-reel';
    for (let i = 0; i <= 9; i++) {
      const d = document.createElement('span');
      d.textContent = String(i);
      reel.appendChild(d);
    }
    cell.appendChild(reel);
    group.el.appendChild(cell);
    group.cells.push({ cell, reel, value: -1 });
  }

  return function setGroup(key: string, str: string) {
    const group = groups[key];
    if (!group) return;
    while (group.cells.length < str.length) makeCell(group);
    while (group.cells.length > str.length) group.cells.pop()!.cell.remove();
    [...str].forEach((ch, i) => {
      const digit = Number(ch);
      const slot = group.cells[i];
      if (slot.value !== digit) {
        slot.value = digit;
        const step = (slot.reel.firstElementChild as HTMLElement)?.offsetHeight || 42;
        slot.reel.style.transform = `translateY(${-digit * step}px)`;
      }
    });
  };
}

export function initCountdown() {
  const setGroup = makeOdometer();
  const caption = $('#ddayCaption');

  function update() {
    const now = getNow();
    const diff = CEREMONY_AT.getTime() - now.getTime();

    if (diff > 0) {
      setGroup?.('d', String(Math.floor(diff / 86400000)).padStart(2, '0'));
      setGroup?.('h', pad(Math.floor((diff % 86400000) / 3600000)));
      setGroup?.('m', pad(Math.floor((diff % 3600000) / 60000)));
      setGroup?.('s', pad(Math.floor((diff % 60000) / 1000)));

      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayDiff = Math.round((WEDDING_DAY.getTime() - startToday.getTime()) / 86400000);
      if (caption) {
        caption.textContent = dayDiff === 0
          ? '오늘, 저희 결혼합니다 💍'
          : `영건 ♥ 지혜의 결혼식이 ${dayDiff}일 남았습니다`;
      }
      return;
    }

    (['d', 'h', 'm', 's'] as const).forEach((k) => setGroup?.(k, '00'));
    if (caption) {
      const passed = Math.floor(-diff / 86400000);
      caption.textContent = passed < 1
        ? '저희, 부부가 되었습니다 💍'
        : `결혼 ${passed}일째, 잘 살고 있습니다 🤍`;
    }
  }

  update();
  setInterval(update, 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) update();
  });
}
