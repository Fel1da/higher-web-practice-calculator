export function numericInput(id: string, label: string, placeholder: string): string {
  return `<label for="${id}" class="mb-1 block pl-3 text-xs leading-[1.4] text-gray-500">${label}</label>
    <input id="${id}" name="${id}" inputmode="numeric" type="text" autocomplete="off"
      placeholder="${placeholder}" aria-describedby="${id}-error"
      class="h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-base text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-2 focus:border-blue-500" />
    <p id="${id}-error" role="alert" class="empty:hidden mt-1 text-xs text-rose-600"></p>`;
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
