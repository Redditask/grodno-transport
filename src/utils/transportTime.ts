import type { Schedule } from '@/domain/schedule';

export type DayType = keyof Schedule['departures'];

const timeZone = 'Europe/Minsk';
const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const dayFormatter = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' });

export const formatTransportTime = (now: Date): string => timeFormatter.format(now);

export const getDayType = (now: Date, dayOffset = 0): DayType => {
  const day = dayFormatter.format(new Date(now.getTime() + dayOffset * 86_400_000));

  return day === 'Sat' || day === 'Sun' ? 'weekend' : 'weekday';
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
};

export const formatDayOffset = (offset: number): string => {
  if (offset === 0) return '';
  if (offset === 1) return 'завтра';
  return `через ${offset} дн.`;
};
