import { calendarDays, todayIso } from '../utils/validation';

import type { Budget, Transaction } from '../models/schemas';

export interface BudgetMetrics {
  balance: number;
  dailyBudget: number;
  todayRemaining: number;
  daysRemaining: number;
  averageRemaining: number;
  averageExpense: number;
}

export function calculateMetrics(
  budget: Budget,
  transactions: Transaction[],
  today = todayIso()
): BudgetMetrics {
  const totalDays = calendarDays(budget.startDate, budget.endDate);
  const daysRemaining = Math.max(
    0,
    calendarDays(today < budget.startDate ? budget.startDate : today, budget.endDate)
  );
  const elapsedDays = Math.max(0, Math.min(totalDays, calendarDays(budget.startDate, today)));
  const signedAmount = (item: Transaction): number =>
    item.type === 'income' ? item.amount : -item.amount;
  const balance =
    budget.initialBalance + transactions.reduce((sum, item) => sum + signedAmount(item), 0);
  const dailyBudget = budget.initialBalance / totalDays;
  const todayRemaining =
    dailyBudget +
    transactions
      .filter(item => item.date === today)
      .reduce((sum, item) => sum + signedAmount(item), 0);
  const expenses = transactions
    .filter(item => item.type === 'expense' && item.date >= budget.startDate && item.date <= today)
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    balance,
    dailyBudget,
    todayRemaining,
    daysRemaining,
    averageRemaining: daysRemaining > 0 ? balance / daysRemaining : 0,
    averageExpense: elapsedDays > 0 ? expenses / elapsedDays : 0,
  };
}

export const money = (value: number): string =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(
    value
  ) + ' ₽';
