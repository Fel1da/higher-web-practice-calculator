export function numericInput(id: string, label: string, placeholder: string): string {
  return `<label for="${id}" class="mb-1 block pl-3 text-xs text-slate-500">${label}</label>
    <input id="${id}" name="${id}" inputmode="numeric" type="text" autocomplete="off"
      placeholder="${placeholder}" aria-describedby="${id}-error"
      class="w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
    <p id="${id}-error" role="alert" class="mt-1 min-h-4 text-xs text-rose-600"></p>`;
}

export function parseAmount(value: string): number {
  const normalized = value.trim().replace(/\s/g, '').replace('₽', '').replace(',', '.');
  return normalized === '' ? NaN : Number(normalized);
}

export function showError(id: string, message: string): void {
  const input = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  if (error) {
    error.textContent = message;
  }
  input?.setAttribute('aria-invalid', String(Boolean(message)));
}
