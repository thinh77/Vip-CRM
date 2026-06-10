import assert from "node:assert/strict";
import { test } from "node:test";
import { createCustomersRepository } from "./customers.repository.js";
import type { CustomerInput } from "../shared/types.js";

test("list filters customers by management officer", async () => {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const db = {
    query: async (text: string, values?: unknown[]) => {
      queries.push({ text, values });

      if (text.includes("select c.id")) {
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
            { customer_id: "cust-1", id: "vip-1", ho_ten: "VIP 1", chuc_vu: "Lãnh đạo đơn vị", ngay_sinh: "1985-08-15", so_dien_thoai: "0912345678" },
            { customer_id: "cust-1", id: "vip-2", ho_ten: "VIP 2", chuc_vu: "Kế toán trưởng", ngay_sinh: "1990-05-25", so_dien_thoai: "0987654321" }
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
  assert.equal(queries.length, 4);
});

test("list loads all customer relations with a fixed four-query budget", async () => {
  const queries: string[] = [];
  const db = {
    query: async (text: string) => {
      queries.push(text);
      if (text.includes("from customers c")) {
        return {
          rows: [
            { id: "cust-1", ma_kh: "KH201", ten_kh: "Công ty A", ngay_thanh_lap: "2018-05-12", can_bo_quan_ly: "A" },
            { id: "cust-2", ma_kh: "KH202", ten_kh: "Công ty B", ngay_thanh_lap: "2019-05-12", can_bo_quan_ly: "B" }
          ]
        };
      }
      if (text.includes("from vips")) {
        return {
          rows: [
            { customer_id: "cust-1", id: "vip-1", ho_ten: "VIP 1", chuc_vu: "Lãnh đạo đơn vị", ngay_sinh: "1985-08-15", so_dien_thoai: "091" },
            { customer_id: "cust-1", id: "vip-2", ho_ten: "VIP 2", chuc_vu: "Kế toán trưởng", ngay_sinh: "1990-05-25", so_dien_thoai: "092" },
            { customer_id: "cust-2", id: "vip-3", ho_ten: "VIP 3", chuc_vu: "Lãnh đạo đơn vị", ngay_sinh: "1986-08-15", so_dien_thoai: "093" },
            { customer_id: "cust-2", id: "vip-4", ho_ten: "VIP 4", chuc_vu: "Kế toán trưởng", ngay_sinh: "1991-05-25", so_dien_thoai: "094" }
          ]
        };
      }
      return { rows: [] };
    }
  };
  const repository = createCustomersRepository(db as never);

  const customers = await repository.list();

  assert.equal(customers.length, 2);
  assert.equal(customers[1].vips[1].id, "vip-4");
  assert.equal(queries.length, 4);
});

test("createMany inserts the full batch with one set-based statement in one transaction", async () => {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const client = {
    query: async (text: string, values?: unknown[]) => {
      queries.push({ text, values });
      if (text.includes("jsonb_to_recordset")) {
        return { rows: [{ imported_count: 2 }] };
      }
      return { rows: [] };
    },
    release: () => {}
  };
  const db = { connect: async () => client };
  const repository = createCustomersRepository(db as never);
  const inputs: CustomerInput[] = [
    {
      maKH: "KH201",
      tenKH: "Công ty A",
      ngayThanhLap: "2018-05-12",
      canBoQuanLy: "A",
      vips: [
        { hoTen: "VIP 1", chucVu: "Lãnh đạo đơn vị", ngaySinh: "1985-08-15", soDienThoai: "091" },
        { hoTen: "VIP 2", chucVu: "Kế toán trưởng", ngaySinh: "1990-05-25", soDienThoai: "092" }
      ]
    },
    {
      maKH: "KH202",
      tenKH: "Công ty B",
      ngayThanhLap: "2019-05-12",
      canBoQuanLy: "B",
      vips: [
        { hoTen: "VIP 3", chucVu: "Lãnh đạo đơn vị", ngaySinh: "1986-08-15", soDienThoai: "093" },
        { hoTen: "VIP 4", chucVu: "Kế toán trưởng", ngaySinh: "1991-05-25", soDienThoai: "094" }
      ]
    }
  ];

  const count = await repository.createMany(inputs);

  assert.equal(count, 2);
  assert.equal(queries[0].text, "begin");
  assert.match(queries[1].text, /jsonb_to_recordset/);
  assert.match(queries[1].text, /insert into customers/);
  assert.match(queries[1].text, /insert into vips/);
  assert.equal(queries[2].text, "commit");
  assert.equal(queries.length, 3);
});
