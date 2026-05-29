/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns the current month (1-indexed, i.e., 1-12)
 * Based on system time or May if simulated.
 */
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Check if a date string in YYYY-MM-DD format falls in the current month.
 */
export function isDateInMonth(dateStr: string, month: number): boolean {
  if (!dateStr) return false;
  const parts = dateStr.split("-");
  if (parts.length < 2) return false;
  const itemMonth = parseInt(parts[1], 10);
  return itemMonth === month;
}

/**
 * Formats a YYYY-MM-DD string into DD/MM/YYYY
 */
export function formatDateVN(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function formatDayMonth(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

/**
 * High contrast status text helper for events
 */
export function getEventStatusText(daysRemaining: number, isToday: boolean, eventMonth: number, currentMonth: number): string {
  if (eventMonth !== currentMonth) {
    return "Trong tháng";
  }
  if (isToday) {
    return "HÔM NAY! 🎉";
  }
  if (daysRemaining > 0) {
    return `Còn ${daysRemaining} ngày`;
  }
  if (daysRemaining < 0) {
    return `Đã qua (${Math.abs(daysRemaining)} ngày trước)`;
  }
  return "Hôm nay";
}
