import type { Budget, Transaction } from '../models/schemas';

export interface AppState {
  budget: Budget | null;
  transactions: Transaction[];
  page: 'start' | 'main' | 'history' | 'balance';
}

type Listener = (state: AppState) => void;

export function createStore(initial: AppState) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: (): AppState => state,
    setState(update: Partial<AppState>): void {
      state = { ...state, ...update };
      listeners.forEach(listener => listener(state));
    },
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const store = createStore({ budget: null, transactions: [], page: 'start' });
