/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KhachHang, VIP } from "./types";

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
 * Interface representing a calendar event of a customer or their VIPs in the target month.
 */
export interface CareEvent {
  id: string; // unique key
  customerId: string;
  customerName: string;
  customerCode: string;
  type: "FOUNDING" | "VIP_BIRTHDAY";
  title: string;
  vipName?: string;
  vipPhone?: string;
  vipRole?: string;
  originalYear: number;
  dateStr: string; // YYYY-MM-DD
  day: number;
  daysRemaining: number; // calculated relative to the current date (May 20, 2026)
  isToday: boolean;
  age: number; // turning age this year
}

/**
 * Compile all care events of customers in the current month.
 * Target date is fixed to current local time (May 20, 2026) for stability, but uses the system date as context.
 */
export function getCareEventsInMonth(customers: KhachHang[], targetMonth: number): CareEvent[] {
  const events: CareEvent[] = [];
  const systemDate = new Date(); // In testing/runtime: 2026-05-20
  const currentDay = systemDate.getDate();
  const currentMonth = systemDate.getMonth() + 1;
  const currentYear = systemDate.getFullYear();

  customers.forEach((kh) => {
    // Check Founding anniversary
    if (isDateInMonth(kh.ngayThanhLap, targetMonth)) {
      const parts = kh.ngayThanhLap.split("-");
      const day = parseInt(parts[2], 10);
      const foundingYear = parseInt(parts[0], 10);
      
      // Calculate daysRemaining in target month of currentYear
      const eventDate = new Date(currentYear, targetMonth - 1, day);
      const todayDateOnly = new Date(currentYear, currentMonth - 1, currentDay);
      
      const diffTime = eventDate.getTime() - todayDateOnly.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isToday = currentMonth === targetMonth && day === currentDay;

      events.push({
        id: `founding-${kh.id}`,
        customerId: kh.id,
        customerName: kh.tenKH,
        customerCode: kh.maKH,
        type: "FOUNDING",
        title: "Kỷ niệm ngày thành lập",
        originalYear: foundingYear,
        dateStr: kh.ngayThanhLap,
        day,
        daysRemaining: targetMonth === currentMonth ? daysRemaining : 0,
        isToday,
        age: currentYear - foundingYear
      });
    }

    // Check 2 VIPs
    kh.vips.forEach((vip, index) => {
      if (vip && vip.ngaySinh && isDateInMonth(vip.ngaySinh, targetMonth)) {
        const parts = vip.ngaySinh.split("-");
        const day = parseInt(parts[2], 10);
        const birthYear = parseInt(parts[0], 10);

        const eventDate = new Date(currentYear, targetMonth - 1, day);
        const todayDateOnly = new Date(currentYear, currentMonth - 1, currentDay);

        const diffTime = eventDate.getTime() - todayDateOnly.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isToday = currentMonth === targetMonth && day === currentDay;

        events.push({
          id: `vip-birthday-${kh.id}-${index}-${vip.id}`,
          customerId: kh.id,
          customerName: kh.tenKH,
          customerCode: kh.maKH,
          type: "VIP_BIRTHDAY",
          title: `Sinh nhật ${vip.chucVu}`,
          vipName: vip.hoTen,
          vipPhone: vip.soDienThoai,
          vipRole: vip.chucVu,
          originalYear: birthYear,
          dateStr: vip.ngaySinh,
          day,
          daysRemaining: targetMonth === currentMonth ? daysRemaining : 0,
          isToday,
          age: currentYear - birthYear
        });
      }
    });
  });

  // Sort events chronologically by day of month
  return events.sort((a, b) => a.day - b.day);
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
