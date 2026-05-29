import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createCustomersService,
  type CustomerRecord,
  type CustomersRepositoryPort
} from "./customers.service.js";
import type { CustomerInput } from "../shared/types.js";

const baseInput: CustomerInput = {
  maKH: "KH201",
  tenKH: "Công ty A",
  ngayThanhLap: "2018-05-12",
  canBoQuanLy: "Nguyễn Minh Anh",
  vips: [
    { hoTen: "VIP 1", chucVu: "Lãnh đạo đơn vị", ngaySinh: "1985-08-15", soDienThoai: "0912345678" },
    { hoTen: "VIP 2", chucVu: "Kế toán trưởng", ngaySinh: "1990-05-25", soDienThoai: "0987654321" }
  ]
};

const baseRecord: CustomerRecord = {
  id: "cust-1",
  ...baseInput,
  lichSuTuongTac: [],
  ghiChuList: []
};

function fakeRepository(overrides: Partial<CustomersRepositoryPort> = {}): CustomersRepositoryPort {
  return {
    findByCode: async () => null,
    findById: async () => null,
    list: async () => [],
    create: async (input) => ({ id: "cust-1", ...input, lichSuTuongTac: [], ghiChuList: [] }),
    update: async (id, input) => ({ id, ...input, lichSuTuongTac: [], ghiChuList: [] }),
    delete: async () => true,
    createInteraction: async () => ({ id: "int-1", ngayThang: "2026-05-20", loaiHinh: "Call", chiTiet: "Call" }),
    deleteInteraction: async () => true,
    createNote: async () => ({ id: "note-1", ngayTao: "2026-05-20", noiDung: "Note" }),
    deleteNote: async () => true,
    ...overrides
  };
}

test("createCustomer rejects duplicate maKH", async () => {
  const service = createCustomersService(fakeRepository({ findByCode: async () => ({ id: "existing" }) }));
  await assert.rejects(() => service.createCustomer(baseInput), /đã tồn tại/);
});

test("updateCustomer preserves existing interactions and notes through repository update", async () => {
  const service = createCustomersService(fakeRepository({
    findById: async () => baseRecord,
    update: async (id, input) => ({
      id,
      ...input,
      lichSuTuongTac: [{ id: "int-1", ngayThang: "2026-05-20", loaiHinh: "Call", chiTiet: "Existing" }],
      ghiChuList: [{ id: "note-1", ngayTao: "2026-05-20", noiDung: "Existing note" }]
    })
  }));

  const result = await service.updateCustomer("cust-1", baseInput);
  assert.equal(result.lichSuTuongTac.length, 1);
  assert.equal(result.ghiChuList.length, 1);
});
