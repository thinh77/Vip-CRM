import assert from "node:assert/strict";
import { test } from "node:test";
import { createEventsRepository } from "./events.repository.js";

test("listByMonth returns care events using one month-scoped query", async () => {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const db = {
    query: async (text: string, values?: unknown[]) => {
      queries.push({ text, values });
      return {
        rows: [{
          id: "founding-cust-1",
          customer_id: "cust-1",
          customer_name: "Công ty A",
          customer_code: "KH201",
          type: "FOUNDING",
          title: "Kỷ niệm ngày thành lập",
          vip_name: null,
          vip_phone: null,
          vip_role: null,
          date_str: "2018-05-12"
        }]
      };
    }
  };
  const repository = createEventsRepository(db as never);

  const events = await repository.listByMonth(5, new Date("2026-05-10T00:00:00+07:00"));

  assert.equal(events.length, 1);
  assert.equal(events[0].customerCode, "KH201");
  assert.equal(events[0].day, 12);
  assert.equal(queries.length, 1);
  assert.deepEqual(queries[0].values, [5]);
  assert.match(queries[0].text, /extract\(month from c\.ngay_thanh_lap\)/i);
  assert.match(queries[0].text, /extract\(month from v\.ngay_sinh\)/i);
  assert.match(queries[0].text, /v\.position - 1/);
});
