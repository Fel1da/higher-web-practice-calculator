import { attachCalendar, dateInput } from '../components/date-input';
import { numericInput, parseAmount, showError } from '../components/input';
import { budgetSchema, type Budget } from '../models/schemas';
import { todayIso } from '../utils/date';

export function startPage(onSave: (budget: Budget) => Promise<void>): HTMLElement {
  const section = document.createElement('main');
  section.className =
    'mx-auto flex min-h-dvh w-full max-w-[524px] flex-col bg-white px-4 pt-8 pb-8 md:mt-20 xl:mt-[4.4vw] md:min-h-0 md:rounded-2xl md:p-7 md:shadow-lg xl:w-[39%] xl:max-w-[840px]';
  section.innerHTML = `<h1 class="mb-4 text-[32px] font-bold leading-tight tracking-tight md:text-4xl">Начнём!</h1>
    <form id="budget-form" novalidate class="flex min-h-[calc(100dvh-118px)] flex-1 flex-col md:min-h-0">
      <div>${numericInput('initialBalance', 'Укажите баланс', '10 000 ₽')}</div>
      <div class="mt-1">${dateInput('endDate', 'На срок')}</div>
      <div class="mt-auto pt-8 md:mt-5"><button class="w-full rounded bg-blue-500 px-5 py-2.5 text-base font-medium text-white hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" type="submit">Рассчитать</button>
      <p id="budget-submit-error" role="alert" class="mt-2 text-sm text-rose-600"></p></div>
    </form>`;
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
