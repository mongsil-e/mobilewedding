import { $, showToast } from './dom';

/* 예식: 2026-10-04 10:30–12:00 KST (UTC+9) */
const ICS = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//YJ Wedding OS//KO',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'BEGIN:VEVENT',
  'UID:wedding-20261004@ohmywedding.love',
  'DTSTAMP:20260101T000000Z',
  'DTSTART:20261004T013000Z',
  'DTEND:20261004T030000Z',
  'SUMMARY:영건 ♥ 지혜 결혼식',
  'DESCRIPTION:허영건 ♥ 이지혜 결혼식에 초대합니다. 오전 10시 30분\\, 비렌티웨딩홀 4층 매그넘홀',
  'LOCATION:비렌티웨딩홀 4층 매그넘홀 (충남 천안시 서북구 천안대로 1198-30)',
  'URL:https://ohmywedding.love/',
  'BEGIN:VALARM',
  'TRIGGER:-P1D',
  'ACTION:DISPLAY',
  'DESCRIPTION:내일은 영건 ♥ 지혜 결혼식 날이에요 💍',
  'END:VALARM',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

export function initIcs() {
  $('#icsBtn')?.addEventListener('click', () => {
    const blob = new Blob([ICS], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'younggeon-jihye-wedding.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    showToast('캘린더 일정 파일을 내려받았어요');
  });
}
