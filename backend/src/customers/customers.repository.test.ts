import assert from "node:assert/strict";
import { test } from "node:test";
import { createCustomersRepository } from "./customers.repository.js";

test("list filters customers by management officer", async () => {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const db = {
    query: async (text: string, values?: unknown[]) => {
      queries.push({ text, values });

      if (text.includes("select c.id")) {
        return { rows: [{ id: "cust-1" }] };
      }

      if (text.includes("select id, ma_kh, ten_kh, ngay_thanh_lap, can_bo_quan_ly")) {
        return {
          rows: [{
            id: "cust-1",
            ma_kh: "KH201",
            ten_kh: "Công ty A",
            ngay_thanh_lap: "2018-05-12",
            can_bo_quan_ly: "Nguyễn Minh Anh"
          }]
        };
      }

      if (text.includes("from vips")) {
        return {
          rows: [
            { id: "vip-1", ho_ten: "VIP 1", chuc_vu: "Lãnh đạo đơn vị", ngay_sinh: "1985-08-15", so_dien_thoai: "0912345678" },
            { id: "vip-2", ho_ten: "VIP 2", chuc_vu: "Kế toán trưởng", ngay_sinh: "1990-05-25", so_dien_thoai: "0987654321" }
          ]
        };
      }

      if (text.includes("from interactions") || text.includes("from notes")) {
        return { rows: [] };
      }

      throw new Error(`Unexpected query: ${text}`);
    }
  };
  const repository = createCustomersRepository(db as never);

  await repository.list({ manager: "Nguyễn Minh Anh" });

  assert.match(queries[0].text, /c\.can_bo_quan_ly = \$1/);
  assert.deepEqual(queries[0].values, ["Nguyễn Minh Anh"]);
});
