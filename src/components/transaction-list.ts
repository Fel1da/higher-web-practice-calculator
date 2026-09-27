import { money } from '../services/budget-calculator';
import { dateLabel } from '../utils/date';

import type { Transaction } from '../models/schemas';

export function transactionList(items: Transaction[], removable = false): string {
  if (items.length === 0) {
    return '<p class="py-5 text-sm text-slate-500">Операций пока нет</p>';
  }
  return `<ul>${items
    .map(
      item => `<li class="flex min-h-10 items-center gap-2 border-b border-slate-400 py-1 last:border-b-0">
    <strong class="min-w-0 flex-1 text-base font-semibold">${item.type === 'income' ? '+' : ''}${money(item.amount)}</strong>
    <span class="whitespace-nowrap text-sm text-slate-500">${dateLabel(item.date).replace(/ \d{4}$/, '')}</span>
    ${removable ? `<button type="button" data-remove="${item.id}" aria-label="Удалить операцию от ${dateLabel(item.date)} на ${money(item.amount)}" class="text-xl font-light leading-none text-slate-500 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-blue-500">×</button>` : ''}
  </li>`
    )
    .join('')}</ul>`;
}
