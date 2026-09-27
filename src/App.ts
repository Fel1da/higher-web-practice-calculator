import { balancePage } from './pages/balance-page';
import { historyPage } from './pages/history-page';
import { mainPage } from './pages/main-page';
import { startPage } from './pages/start-page';
import {
  loadBudget,
  loadTransactions,
  removeTransaction,
  saveBudget,
  saveTransaction,
} from './utils/db';
import { store } from './utils/state';

import type { Budget, Transaction } from './models/schemas';

export async function initApp(): Promise<void> {
  history.scrollRestoration = 'manual';
  const root = document.getElementById('app');
  if (!root) {
    throw new Error('Не найден корневой элемент приложения');
  }
  root.innerHTML = '<p class="mx-auto max-w-4xl p-8 text-slate-600">Загрузка…</p>';
  try {
    const [budget, transactions] = await Promise.all([loadBudget(), loadTransactions()]);
    const page =
      location.hash === '#history' ? 'history' : location.hash === '#balance' ? 'balance' : 'main';
    store.setState({ budget, transactions, page: budget ? page : 'start' });
  } catch {
    root.innerHTML =
      '<p role="alert" class="mx-auto max-w-4xl p-8 text-rose-600">Не удалось открыть хранилище браузера. Разрешите хранение данных и перезагрузите страницу.</p>';
    return;
  }
  const render = (): void => {
    const { budget, transactions, page } = store.getState();
    let view: HTMLElement;
    if (!budget) {
      view = startPage(createBudget);
    } else if (page === 'history') {
      view = historyPage(budget, transactions, deleteEntry, () => navigate('main'));
    } else if (page === 'balance') {
      view = balancePage(budget, transactions, updateBudget, () => navigate('main'));
    } else {
      view = mainPage(
        budget,
        transactions,
        createEntry,
        () => navigate('history'),
        () => navigate('balance')
      );
    }
    root.replaceChildren(view);
  };
  const navigate = (page: 'main' | 'history' | 'balance'): void => {
    location.hash = page;
    store.setState({ page });
    window.scrollTo(0, 0);
  };
  const createBudget = async (value: Budget): Promise<void> => {
    await saveBudget(value);
    location.hash = 'main';
    store.setState({ budget: value, page: 'main' });
  };
  const updateBudget = async (value: Budget): Promise<void> => {
    await saveBudget(value);
    location.hash = 'main';
    store.setState({ budget: value, page: 'main' });
  };
  const createEntry = async (value: Transaction): Promise<void> => {
    await saveTransaction(value);
    store.setState({ transactions: await loadTransactions() });
  };
  const deleteEntry = async (id: number): Promise<void> => {
    await removeTransaction(id);
    store.setState({ transactions: await loadTransactions() });
  };
  store.subscribe(render);
  window.addEventListener('hashchange', () => {
    if (store.getState().budget) {
      store.setState({
        page:
          location.hash === '#history'
            ? 'history'
            : location.hash === '#balance'
              ? 'balance'
              : 'main',
      });
    }
  });
  render();
  requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
}
