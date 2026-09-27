import { transactionList } from '../components/transaction-list';
import { type Budget, type Transaction } from '../models/schemas';
import { calculateMetrics, money } from '../services/budget-calculator';

export function historyPage(
  budget: Budget,
  transactions: Transaction[],
  onRemove: (id: number) => Promise<void>,
  onBack: () => void
): HTMLElement {
  const section = document.createElement('main');
  section.className =
    'mx-auto flex min-h-dvh w-full max-w-[524px] flex-col bg-white px-4 pt-8 pb-8 md:mt-16 md:min-h-0 md:rounded-2xl md:border md:border-gray-200 md:p-6 md:shadow-[0_2px_8px_rgba(0,0,0,0.1)] xl:max-w-[558px]';
  section.innerHTML = `<h1 class="text-2xl font-bold md:text-[32px]">История расходов</h1><p class="mt-1 text-xs text-blue-500 md:text-base">Средние траты в день: ${money(calculateMetrics(budget, transactions).averageExpense)}</p>
    <section id="history-list" class="mt-3"></section><label class="mt-5 text-xs text-gray-500 md:text-sm">Фильтр по дате <input id="history-date" type="date" class="mt-1 block rounded border border-gray-200 bg-white px-2 py-1 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></label><p id="delete-error" role="alert" class="text-sm text-rose-600"></p>
    <button id="back" type="button" class="mt-auto w-full rounded border border-blue-500 px-4 py-2.5 text-base text-blue-500 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500 md:mt-7">Вернуться</button>`;
  section.querySelector<HTMLButtonElement>('#back')!.onclick = onBack;
  const filter = section.querySelector<HTMLInputElement>('#history-date')!;
  const list = section.querySelector<HTMLElement>('#history-list')!;
  const renderList = (): void => {
    list.innerHTML = transactionList(
      filter.value ? transactions.filter(item => item.date === filter.value) : transactions,
      true
    );
  };
  filter.oninput = renderList;
  list.addEventListener('click', async event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-remove]');
    if (!button) {
      return;
    }
    button.disabled = true;
    try {
      await onRemove(Number(button.dataset.remove));
    } catch {
      section.querySelector<HTMLElement>('#delete-error')!.textContent =
        'Не удалось удалить операцию. Попробуйте ещё раз.';
      button.disabled = false;
    }
  });
  renderList();
  return section;
}
