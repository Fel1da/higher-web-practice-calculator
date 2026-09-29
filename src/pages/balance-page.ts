import { attachCalendar, dateInput } from '../components/date-input';
import { numericInput, parseAmount, showError } from '../components/input';
import { budgetSchema, type Budget, type Transaction } from '../models/schemas';
import { calculateMetrics, money } from '../services/budget-calculator';
import { todayIso } from '../utils/validation';

export function balancePage(
  budget: Budget,
  transactions: Transaction[],
  onSave: (value: Budget) => Promise<void>,
  onBack: () => void
): HTMLElement {
  const metrics = calculateMetrics(budget, transactions);
  const section = document.createElement('main');
  section.className =
    'mx-auto flex min-h-dvh w-full max-w-[524px] flex-col bg-white px-4 pt-7 pb-8 md:mt-16 md:min-h-0 md:rounded-2xl md:border md:border-gray-200 md:p-6 md:shadow-[0_2px_8px_rgba(0,0,0,0.1)] xl:max-w-[558px]';
  section.innerHTML = `<div class="flex items-center justify-between gap-2"><h1 class="text-2xl font-bold md:text-[32px]">Общий баланс</h1><span class="whitespace-nowrap text-sm text-blue-500 md:text-xl">${money(metrics.dailyBudget)} в день</span></div>
    <form id="balance-form" novalidate class="mt-4 flex flex-1 flex-col md:block">
      <div>${numericInput('currentBalance', 'Ваш баланс', money(metrics.balance))}</div>
      <div class="mt-1">${numericInput('topUp', 'Пополнить', '+0 ₽')}</div>
      <div class="mt-1">${dateInput('balanceEndDate', 'На срок', budget.endDate, todayIso())}</div>
      <div class="mt-auto space-y-5 pt-8 md:mt-5 md:space-y-3 md:pt-0">
        <button id="cancel-balance" type="button" class="w-full rounded border border-blue-500 px-4 py-2.5 text-base text-blue-500 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500">Вернуться без сохранения</button>
        <button class="w-full rounded bg-blue-500 px-4 py-2.5 text-base text-white hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-blue-500" type="submit">Сохранить</button>
        <p id="balance-submit-error" role="alert" class="text-sm text-rose-600"></p>
      </div>
    </form>`;
  section.querySelector<HTMLInputElement>('#currentBalance')!.value = String(metrics.balance);
  section.querySelector<HTMLButtonElement>('#cancel-balance')!.onclick = onBack;
  section.querySelector<HTMLFormElement>('form')!.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const currentBalance = parseAmount(
      (form.elements.namedItem('currentBalance') as HTMLInputElement).value
    );
    const topUpInput = (form.elements.namedItem('topUp') as HTMLInputElement).value;
    const topUp = topUpInput.trim() ? parseAmount(topUpInput) : 0;
    const endDate = form.querySelector<HTMLInputElement>('input[name="balanceEndDate"]')!.value;
    const result = budgetSchema.safeParse({
      ...budget,
      initialBalance: budget.initialBalance + currentBalance - metrics.balance + topUp,
      endDate,
    });
    showError(
      'currentBalance',
      Number.isFinite(currentBalance) && currentBalance >= 0 ? '' : 'Введите корректный баланс'
    );
    showError(
      'topUp',
      Number.isFinite(topUp) && topUp >= 0 ? '' : 'Пополнение не может быть отрицательным'
    );
    document.getElementById('balanceEndDate-error')!.textContent =
      endDate >= todayIso() ? '' : 'Выберите сегодняшнюю или будущую дату';
    if (
      !result.success ||
      !Number.isFinite(currentBalance) ||
      currentBalance < 0 ||
      !Number.isFinite(topUp) ||
      topUp < 0 ||
      endDate < todayIso()
    ) {
      if (
        !result.success &&
        result.error.issues.some(issue => issue.path[0] === 'initialBalance')
      ) {
        showError('currentBalance', 'Итоговый баланс должен быть больше нуля');
      }
      return;
    }
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    button.disabled = true;
    try {
      await onSave(result.data);
    } catch {
      document.getElementById('balance-submit-error')!.textContent =
        'Не удалось сохранить баланс. Попробуйте ещё раз.';
      button.disabled = false;
    }
  });
  queueMicrotask(() => attachCalendar('balanceEndDate'));
  return section;
}
