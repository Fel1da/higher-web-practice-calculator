import { numericInput, parseAmount, showError } from '../components/input';
import { transactionList } from '../components/transaction-list';
import { transactionSchema, type Budget, type Transaction } from '../models/schemas';
import { calculateMetrics, money } from '../services/budget-calculator';
import { todayIso } from '../utils/date';

export function mainPage(
  budget: Budget,
  transactions: Transaction[],
  onAdd: (transaction: Transaction) => Promise<void>,
  onHistory: () => void,
  onBalance: () => void
): HTMLElement {
  const metrics = calculateMetrics(budget, transactions);
  const section = document.createElement('main');
  section.className =
    'mx-auto flex min-h-dvh w-full max-w-[524px] flex-col gap-2 bg-white px-4 py-7 md:mt-20 xl:mt-[4.4vw] md:min-h-0 md:bg-transparent md:px-0 md:py-0 xl:w-[39%] xl:max-w-[840px] xl:pb-[10vw]';
  section.innerHTML = `<section class="md:rounded-2xl md:bg-white md:p-7 md:shadow-lg">
      <div class="flex items-start justify-between gap-2 text-slate-500"><span class="text-base md:text-xl">Общий баланс</span><span class="whitespace-nowrap text-sm text-blue-500 md:text-xl">${money(metrics.dailyBudget)} в день</span></div>
      <p class="mt-1 flex flex-wrap items-baseline gap-x-2"><strong class="text-2xl font-bold leading-none md:text-4xl">${money(metrics.balance)}</strong><span class="text-sm text-slate-500 md:text-xl">на ${metrics.daysRemaining} дней</span></p>
      <div class="mt-5 grid grid-cols-2 gap-4 md:block"><button id="edit-balance" type="button" class="w-full rounded border border-blue-500 px-2 py-2.5 text-base text-blue-500 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500">Изменить</button><button id="mobile-history" type="button" class="rounded border border-blue-500 px-1 py-2.5 text-base text-blue-500 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500 md:hidden">История расходов</button></div>
    </section>
    <section class="mt-1 md:rounded-2xl md:bg-white md:p-7 md:shadow-lg"><h2 class="text-base text-slate-500 md:text-2xl">На сегодня доступно</h2>
      <p class="mt-1 text-[32px] font-bold leading-tight"><span class="${metrics.todayRemaining >= 0 ? 'text-emerald-500' : 'text-rose-600'}">${money(metrics.todayRemaining)}</span><span class="text-slate-500"> / ${money(metrics.dailyBudget)}</span></p>
      <p class="mt-2 text-xs md:text-xs">${metrics.todayRemaining >= 0 ? '🎉 Отлично справились — сегодня вы в пределах лимита!' : 'Сегодня дневной лимит превышен'}</p>
      <form id="transaction-form" class="mt-2" novalidate><div>${numericInput('amount', 'Введите трату', '0 ₽')}</div>
      <button class="mt-1 w-full rounded bg-blue-500 px-5 py-2.5 text-base font-medium text-white hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" type="submit">Сохранить</button>
      <p id="transaction-submit-error" role="alert" class="mt-2 text-sm text-rose-600"></p></form></section>
    <section class="mt-1 hidden md:block md:rounded-2xl md:bg-white md:p-7 md:shadow-lg"><h2 class="text-2xl font-bold">История расходов</h2><p class="mt-1 text-sm text-blue-500">Средние траты в день: ${money(metrics.averageExpense)}</p>
      <div class="mt-4">${transactionList(transactions.slice(0, 3))}</div><button id="show-history" type="button" class="mt-6 w-full rounded border border-blue-500 px-4 py-2.5 text-blue-500 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500">Смотреть всю историю</button></section>`;
  section.querySelector<HTMLButtonElement>('#edit-balance')!.onclick = onBalance;
  section.querySelector<HTMLButtonElement>('#mobile-history')!.onclick = onHistory;
  section.querySelector<HTMLButtonElement>('#show-history')!.onclick = onHistory;
  section.querySelector<HTMLFormElement>('form')!.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const amount = parseAmount((form.elements.namedItem('amount') as HTMLInputElement).value);
    const result = transactionSchema.safeParse({
      id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
      amount,
      type: 'expense',
      date: todayIso(),
    });
    showError(
      'amount',
      result.success ? '' : result.error.issues[0]?.message || 'Некорректная сумма'
    );
    if (!result.success) {
      return;
    }
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    button.disabled = true;
    try {
      await onAdd(result.data);
    } catch {
      document.getElementById('transaction-submit-error')!.textContent =
        'Не удалось сохранить операцию. Попробуйте ещё раз.';
      button.disabled = false;
    }
  });
  return section;
}
