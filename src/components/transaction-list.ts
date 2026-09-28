import { money } from '../services/budget-calculator';
import { dateLabel } from '../utils/variables';

import type { Transaction } from '../models/schemas';

export function transactionList(items: Transaction[], removable = false): string {
  if (items.length === 0) {
    return '<p class="py-5 text-sm text-gray-500">Операций пока нет</p>';
  }
  return `<ul class="space-y-1">${items
    .map(
      item => `<li class="flex min-h-6 items-baseline gap-3 border-b border-gray-400 last:border-b-0">
    <strong class="min-w-0 flex-1 text-lg font-semibold leading-[1.3]">${item.type === 'income' ? '+' : ''}${money(item.amount)}</strong>
    <span class="whitespace-nowrap text-base leading-6 text-gray-500">${dateLabel(item.date).replace(/ \d{4}$/, '')}</span>
    ${removable ? `<button type="button" data-remove="${item.id}" aria-label="Удалить операцию от ${dateLabel(item.date)} на ${money(item.amount)}" class="text-xl font-light leading-none text-gray-500 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-blue-500">×</button>` : ''}
  </li>`
    )
    .join('')}</ul>`;
}
