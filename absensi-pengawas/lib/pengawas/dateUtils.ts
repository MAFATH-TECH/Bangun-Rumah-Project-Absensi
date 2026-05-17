import { JAKARTA_TZ } from './constants';

export function todayDateString(now = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: JAKARTA_TZ });
}

export function formatJamDisplay(time: string): string {
  const [h, m] = time.split(':');
  return `${h}.${m}`;
}

export function formatJamRange(mulai: string, selesai: string): string {
  return `${formatJamDisplay(mulai)}–${formatJamDisplay(selesai)}`;
}

export function parseTimeOnDate(time: string, dateStr: string, now: Date): Date {
  const [h, m, s = '0'] = time.split(':');
  const base = new Date(`${dateStr}T00:00:00`);
  const jakartaNow = new Date(
    now.toLocaleString('en-US', { timeZone: JAKARTA_TZ }),
  );
  base.setHours(
    Number(h),
    Number(m),
    Number(s),
    jakartaNow.getMilliseconds(),
  );
  return base;
}
