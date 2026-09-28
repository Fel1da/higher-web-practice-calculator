import { attachCalendar, dateInput } from '../components/date-input';
import { numericInput, parseAmount, showError } from '../components/input';
import { budgetSchema, type Budget } from '../models/schemas';
import { todayIso } from '../utils/variables';

export function startPage(onSave: (budget: Budget) => Promise<void>): HTMLElement {
  const section = document.createElement('main');
  section.className =
    'mx-auto flex min-h-dvh w-full max-w-[524px] flex-col bg-white px-4 py-8 md:justify-center md:bg-transparent md:px-0 md:py-0 md:pb-16 xl:max-w-[558px]';
  section.innerHTML = `<div class="flex flex-1 flex-col md:flex-none md:rounded-2xl md:border md:border-gray-200 md:bg-white md:p-6 md:shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
    <h1 class="mb-3 text-[32px] font-bold leading-[1.2]">Начнём!</h1>
    <form id="budget-form" novalidate class="flex flex-1 flex-col md:flex-none">
      <div>${numericInput('initialBalance', 'Укажите баланс', '10 000 ₽')}</div>
      <div class="mt-3">${dateInput('endDate', 'На срок')}</div>
      <div class="mt-auto pt-8 md:mt-6 md:pt-0"><button class="h-12 w-full rounded bg-blue-500 px-5 text-base font-medium text-white hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" type="submit">Рассчитать</button>
      <p id="budget-submit-error" role="alert" class="empty:hidden mt-2 text-sm text-rose-600"></p></div>
    </form></div>`;
  section.querySelector<HTMLInputElement>('#initialBalance')!.value = '10000';
  section.querySelector<HTMLFormElement>('form')!.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const amount = parseAmount(
      (form.elements.namedItem('initialBalance') as HTMLInputElement).value
    );
    const endDate = form.querySelector<HTMLInputElement>('input[name="endDate"]')!.value;
    const today = todayIso();
    const result = budgetSchema.safeParse({
      initialBalance: amount,
      startDate: today,
      endDate,
      createdAt: today,
    });
    showError('initialBalance', '');
    document.getElementById('endDate-error')!.textContent = '';
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === 'initialBalance') {
          showError('initialBalance', issue.message);
        }
        if (field === 'endDate') {
          document.getElementById('endDate-error')!.textContent = issue.message;
        }
      }
      return;
    }
    if (endDate < today) {
      document.getElementById('endDate-error')!.textContent =
        'Выберите сегодняшнюю или будущую дату';
      return;
    }
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    button.disabled = true;
    try {
      await onSave(result.data);
    } catch {
      document.getElementById('budget-submit-error')!.textContent =
        'Не удалось сохранить бюджет. Попробуйте ещё раз.';
      button.disabled = false;
    }
  });
  queueMicrotask(() => attachCalendar('endDate'));
  return section;
}
