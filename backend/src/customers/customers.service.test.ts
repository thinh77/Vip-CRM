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
    findByCodes: async () => [],
    findById: async () => null,
    list: async () => [],
    create: async (input) => ({ id: "cust-1", ...input, lichSuTuongTac: [], ghiChuList: [] }),
    createMany: async (inputs) => inputs.length,
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
  const service = createCustomersService(fakeRepository({
    findByCode: async () => ({ id: "existing", maKH: "KH201" })
  }));
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

test("listCustomers forwards management officer filter to repository", async () => {
  let receivedFilters: unknown;
  const service = createCustomersService(fakeRepository({
    list: async (filters) => {
      receivedFilters = filters;
      return [];
    }
  }));

  await service.listCustomers({ search: "KH201", manager: "Nguyễn Minh Anh" });

  assert.deepEqual(receivedFilters, { search: "KH201", manager: "Nguyễn Minh Anh" });
});

test("importCustomers rejects duplicate customer codes inside the batch", async () => {
  const service = createCustomersService(fakeRepository());

  await assert.rejects(
    () => service.importCustomers([
      baseInput,
      { ...baseInput, maKH: "KH201", tenKH: "Công ty B" }
    ]),
    /Mã khách hàng KH201 bị trùng trong file Excel/
  );
});

test("importCustomers rejects existing customer codes before writing", async () => {
  let createManyCalled = false;
  const service = createCustomersService(fakeRepository({
    findByCodes: async () => [{ id: "existing", maKH: "KH202" }],
    createMany: async () => {
      createManyCalled = true;
      return 0;
    }
  }));

  await assert.rejects(
    () => service.importCustomers([
      baseInput,
      { ...baseInput, maKH: "KH202", tenKH: "Công ty B" }
    ]),
    /Mã khách hàng KH202 đã tồn tại/
  );
  assert.equal(createManyCalled, false);
});

test("importCustomers writes the complete batch once", async () => {
  let receivedInputs: CustomerInput[] = [];
  const service = createCustomersService(fakeRepository({
    createMany: async (inputs) => {
      receivedInputs = inputs;
      return inputs.length;
    }
  }));
  const inputs = [
    baseInput,
    { ...baseInput, maKH: "KH202", tenKH: "Công ty B" }
  ];

  const result = await service.importCustomers(inputs);

  assert.deepEqual(receivedInputs, inputs);
  assert.deepEqual(result, { importedCount: 2 });
});
