import { addMonths, format, getDay, getDaysInMonth, parseISO, startOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

import { calendarDays, todayIso } from '../utils/date';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function periodLabel(date: string, minimum: string): string {
  if (!date) {
    return 'Выберите срок';
  }
  const days = calendarDays(minimum, date);
  return `${days} ${days % 10 === 1 && days % 100 !== 11 ? 'день' : days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 12 || days % 100 > 14) ? 'дня' : 'дней'} (до ${format(parseISO(date), 'd MMMM', { locale: ru })})`;
}

export function dateInput(id: string, label: string, initial = '', minimum = todayIso()): string {
  return `<div class="relative" data-calendar="${id}" data-minimum="${minimum}">
    <label class="mb-1 block pl-3 text-xs text-gray-500" for="${id}">${label}</label>
    <button id="${id}" type="button" aria-haspopup="dialog" aria-expanded="false" aria-describedby="${id}-error"
      class="flex w-full items-center justify-between h-12 rounded-lg border border-gray-200 bg-white px-3 text-left text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
      <span data-date-value>${periodLabel(initial, minimum)}</span><span aria-hidden="true" class="mr-1 size-3 rotate-45 border-r border-b border-gray-500"></span>
    </button>
    <input type="hidden" name="${id}" value="${initial}" />
    <div data-calendar-panel class="absolute z-20 mt-2 hidden w-full min-w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-xl" role="dialog" aria-label="Выбор даты"></div>
    <p id="${id}-error" role="alert" class="empty:hidden mt-1 text-xs text-rose-600"></p>
  </div>`;
}

export function attachCalendar(id: string): void {
  const root = document.querySelector<HTMLElement>(`[data-calendar="${id}"]`);
  const trigger = root?.querySelector<HTMLButtonElement>('button');
  const input = root?.querySelector<HTMLInputElement>('input');
  const panel = root?.querySelector<HTMLElement>('[data-calendar-panel]');
  if (!root || !trigger || !input || !panel) {
    return;
  }
  const minimum = root.dataset.minimum || todayIso();
  let displayed = startOfMonth(parseISO(input.value || minimum));
  const draw = (): void => {
    panel.replaceChildren();
    const header = document.createElement('div');
    header.className = 'mb-3 flex items-center justify-between';
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.textContent = '‹';
    previous.setAttribute('aria-label', 'Предыдущий месяц');
    const heading = document.createElement('strong');
    heading.textContent = format(displayed, 'LLLL yyyy', { locale: ru });
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = '›';
    next.setAttribute('aria-label', 'Следующий месяц');
    previous.className = next.className =
      'rounded px-3 py-1 text-xl hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500';
    previous.disabled = format(displayed, 'yyyy-MM') <= minimum.slice(0, 7);
    previous.onclick = () => {
      displayed = addMonths(displayed, -1);
      draw();
    };
    next.onclick = () => {
      displayed = addMonths(displayed, 1);
      draw();
    };
    header.append(previous, heading, next);
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-7 gap-1 text-center';
    weekdays.forEach(day => {
      const label = document.createElement('span');
      label.textContent = day;
      label.className = 'py-2 text-xs text-gray-500';
      grid.append(label);
    });
    const offset = (getDay(displayed) + 6) % 7;
    for (let blank = 0; blank < offset; blank += 1) {
      grid.append(document.createElement('span'));
    }
    for (let day = 1; day <= getDaysInMonth(displayed); day += 1) {
      const value = format(
        new Date(displayed.getFullYear(), displayed.getMonth(), day),
        'yyyy-MM-dd'
      );
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.textContent = String(day);
      cell.disabled = value < minimum;
      cell.setAttribute('aria-label', format(parseISO(value), 'd MMMM yyyy', { locale: ru }));
      cell.className =
        'rounded py-2 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:text-gray-300 disabled:hover:bg-transparent' +
        (value === input.value ? ' bg-blue-500 text-white hover:bg-blue-600' : '');
      cell.onclick = () => {
        input.value = value;
        const text = trigger.querySelector('[data-date-value]');
        if (text) {
          text.textContent = periodLabel(value, minimum);
        }
        panel.classList.add('hidden');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
        document.getElementById(`${id}-error`)!.textContent = '';
      };
      grid.append(cell);
    }
    panel.append(header, grid);
  };
  trigger.onclick = () => {
    const opening = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !opening);
    trigger.setAttribute('aria-expanded', String(opening));
    if (opening) {
      draw();
    }
  };
  document.addEventListener('pointerdown', event => {
    if (!root.contains(event.target as Node)) {
      panel.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      panel.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }
  });
}
