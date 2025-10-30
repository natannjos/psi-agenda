import { DateTime, Interval } from 'luxon';

export const USER_TIMEZONE = 'America/Sao_Paulo';

export function localDateFromISO(date: string) {
  return DateTime.fromISO(date, { zone: USER_TIMEZONE });
}

export function utcFromLocal(date: DateTime) {
  return date.setZone('UTC');
}

export function toIsoLocal(date: DateTime) {
  return date.toISO({ suppressMilliseconds: true });
}

export function intervalOverlaps(interval: Interval, others: Interval[]) {
  return others.some((other) => interval.overlaps(other));
}

export function minutesToTime(weekdayDate: DateTime, minute: number) {
  return weekdayDate.set({ hour: Math.floor(minute / 60), minute: minute % 60, second: 0, millisecond: 0 });
}
