import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export const todayIso = (): string => format(new Date(), 'yyyy-MM-dd');
export const dateLabel = (date: string): string =>
  format(parseISO(date), 'd MMMM yyyy', { locale: ru });
export const calendarDays = (from: string, through: string): number =>
  differenceInCalendarDays(parseISO(through), parseISO(from)) + 1;
