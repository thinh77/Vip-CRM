import { badRequest } from "../shared/errors.js";
import { calculateCalendarEvent, isDateInMonth } from "../shared/date.js";
import type { CustomerRecord } from "../customers/customers.service.js";

export type CareEvent = {
    id: string;
    customerId: string;
    customerName: string;
    customerCode: string;
    type: "FOUNDING" | "VIP_BIRTHDAY";
    title: string;
    vipName?: string;
    vipPhone?: string;
    vipRole?: string;
    originalYear: number;
    dateStr: string;
    day: number;
    daysRemaining: number;
    isToday: boolean;
    age: number;
};

export function validateMonth(value: unknown): number {
    const month = Number(value);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw badRequest("Tháng không hợp lệ.", "month");
    }
    return month;
}

export function buildCareEvents(customers: CustomerRecord[], targetMonth: number, now = new Date()): CareEvent[] {
    const events: CareEvent[] = [];

    for (const customer of customers) {
        if (isDateInMonth(customer.ngayThanhLap, targetMonth)) {
            events.push({
                id: `founding-${customer.id}`,
                customerId: customer.id,
                customerName: customer.tenKH,
                customerCode: customer.maKH,
                type: "FOUNDING",
                title: "Kỷ niệm ngày thành lập",
                dateStr: customer.ngayThanhLap,
                ...calculateCalendarEvent(customer.ngayThanhLap, targetMonth, now)
            });
        }

        customer.vips.forEach((vip, index) => {
            if (!isDateInMonth(vip.ngaySinh, targetMonth)) return;
            events.push({
                id: `vip-birthday-${customer.id}-${index}-${vip.id}`,
                customerId: customer.id,
                customerName: customer.tenKH,
                customerCode: customer.maKH,
                type: "VIP_BIRTHDAY",
                title: `Sinh nhật ${vip.chucVu}`,
                vipName: vip.hoTen,
                vipPhone: vip.soDienThoai,
                vipRole: vip.chucVu,
                dateStr: vip.ngaySinh,
                ...calculateCalendarEvent(vip.ngaySinh, targetMonth, now)
            });
        });
    }

    return events.sort((a, b) => a.day - b.day);
}