const DAY_MS = 24 * 60 * 60 * 1000;

function subtractCalendarMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() - months);
  const lastDay = new Date(Date.UTC(
    result.getUTCFullYear(),
    result.getUTCMonth() + 1,
    0,
  )).getUTCDate();
  result.setUTCDate(Math.min(originalDay, lastDay));
  return result;
}

export function retentionCutoffs(now = new Date()) {
  return {
    ip: new Date(now.getTime() - 90 * DAY_MS),
    usage: subtractCalendarMonths(now, 6),
    search: subtractCalendarMonths(now, 12),
    payment: subtractCalendarMonths(now, 60),
  };
}
