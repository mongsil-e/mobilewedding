import { $ } from './dom';
import { WEDDING_DAY } from './countdown';

export function buildCalendar() {
  const grid = $('#calendarGrid');
  if (!grid) return;

  const year = WEDDING_DAY.getFullYear();
  const month = WEDDING_DAY.getMonth();
  const target = WEDDING_DAY.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div class="calendar-day"></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    const dow = (firstDay + day - 1) % 7;
    let cls = 'calendar-day';
    if (dow === 0) cls += ' sunday';
    if (dow === 6) cls += ' saturday';
    if (day === target) cls += ' wedding-day';
    html += `<div class="${cls}">${day}</div>`;
  }
  grid.innerHTML = html;
}
