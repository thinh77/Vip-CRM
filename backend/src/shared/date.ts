import { badRequest } from "./errors.js";

export function isIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function assertIsoDate(value: string, field: string): void {
  if (!isIsoDate(value)) {
    throw badRequest("Ngày không hợp lệ.", field);
  }
}

export function isDateInMonth(dateStr: string, month: number): boolean {
  return Number(dateStr.slice(5, 7)) === month;
}

export function calculateCalendarEvent(dateStr: string, targetMonth: number, now = new Date()) {
  assertIsoDate(dateStr, "date");
  const originalYear = Number(dateStr.slice(0, 4));
  const day = Number(dateStr.slice(8, 10));
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const eventDate = new Date(currentYear, targetMonth - 1, day);
  const todayDateOnly = new Date(currentYear, currentMonth - 1, currentDay);
  const daysRemaining = Math.ceil((eventDate.getTime() - todayDateOnly.getTime()) / 86_400_000);

  return {
    originalYear,
    day,
    daysRemaining: targetMonth === currentMonth ? daysRemaining : 0,
    isToday: currentMonth === targetMonth && day === currentDay,
    age: currentYear - originalYear
  };
}
