import { z } from 'zod';

export const dateSchema = z.iso.date();

export const budgetSchema = z
  .object({
    initialBalance: z.number().finite().positive('Введите сумму больше нуля'),
    startDate: dateSchema,
    endDate: dateSchema,
    createdAt: dateSchema,
  })
  .refine(data => data.endDate >= data.startDate, {
    message: 'Дата окончания должна быть не раньше даты начала',
    path: ['endDate'],
  });

export const transactionSchema = z.object({
  id: z.number().int().positive(),
  amount: z.number().finite().positive('Введите сумму больше нуля'),
  type: z.enum(['expense', 'income']),
  date: dateSchema,
});

export type Budget = z.infer<typeof budgetSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionType = Transaction['type'];
