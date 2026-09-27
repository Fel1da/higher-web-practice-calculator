import { openDB, type DBSchema } from 'idb';

import { budgetSchema, transactionSchema, type Budget, type Transaction } from '../models/schemas';

interface CalculatorDatabase extends DBSchema {
  budget: { key: string; value: Budget };
  transactions: { key: number; value: Transaction; indexes: { 'by-date': string } };
}

const database = openDB<CalculatorDatabase>('daily-budget-manager', 1, {
  upgrade(db) {
    db.createObjectStore('budget');
    const transactions = db.createObjectStore('transactions', { keyPath: 'id' });
    transactions.createIndex('by-date', 'date');
  },
});

export async function loadBudget(): Promise<Budget | null> {
  const record = await (await database).get('budget', 'current');
  const parsed = budgetSchema.safeParse(record);
  return parsed.success ? parsed.data : null;
}

export async function saveBudget(value: Budget): Promise<void> {
  const budget = budgetSchema.parse(value);
  await (await database).put('budget', budget, 'current');
}

export async function loadTransactions(): Promise<Transaction[]> {
  const records = await (await database).getAll('transactions');
  return records
    .flatMap(record => {
      const parsed = transactionSchema.safeParse(record);
      return parsed.success ? [parsed.data] : [];
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}

export async function saveTransaction(value: Transaction): Promise<void> {
  await (await database).put('transactions', transactionSchema.parse(value));
}

export async function removeTransaction(id: number): Promise<void> {
  await (await database).delete('transactions', id);
}
