import type pg from "pg";
import { calculateCalendarEvent } from "../shared/date.js";
import type { CareEvent } from "./events.service.js";

type Queryable = Pick<pg.Pool, "query">;

type CareEventRow = {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_code: string;
  type: CareEvent["type"];
  title: string;
  vip_name: string | null;
  vip_phone: string | null;
  vip_role: string | null;
  date_str: string | Date;
};

function toIsoDate(value: string | Date): string {
  if (typeof value === "string") return value.slice(0, 10);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createEventsRepository(db: Queryable) {
  return {
    async listByMonth(month: number, now = new Date()): Promise<CareEvent[]> {
      const result = await db.query<CareEventRow>(
        `
          select
            'founding-' || c.id as id,
            c.id as customer_id,
            c.ten_kh as customer_name,
            c.ma_kh as customer_code,
            'FOUNDING' as type,
            'Kỷ niệm ngày thành lập' as title,
            null::text as vip_name,
            null::text as vip_phone,
            null::text as vip_role,
            c.ngay_thanh_lap as date_str
          from customers c
          where extract(month from c.ngay_thanh_lap) = $1

          union all

          select
            'vip-birthday-' || c.id || '-' || (v.position - 1) || '-' || v.id as id,
            c.id as customer_id,
            c.ten_kh as customer_name,
            c.ma_kh as customer_code,
            'VIP_BIRTHDAY' as type,
            'Sinh nhật ' || v.chuc_vu as title,
            v.ho_ten as vip_name,
            v.so_dien_thoai as vip_phone,
            v.chuc_vu as vip_role,
            v.ngay_sinh as date_str
          from customers c
          join vips v on v.customer_id = c.id
          where extract(month from v.ngay_sinh) = $1
        `,
        [month]
      );

      return result.rows
        .map((row) => {
          const dateStr = toIsoDate(row.date_str);
          return {
            id: row.id,
            customerId: row.customer_id,
            customerName: row.customer_name,
            customerCode: row.customer_code,
            type: row.type,
            title: row.title,
            ...(row.vip_name ? { vipName: row.vip_name } : {}),
            ...(row.vip_phone ? { vipPhone: row.vip_phone } : {}),
            ...(row.vip_role ? { vipRole: row.vip_role } : {}),
            dateStr,
            ...calculateCalendarEvent(dateStr, month, now)
          };
        })
        .sort((a, b) => a.day - b.day);
    }
  };
}
