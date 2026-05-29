import assert from "node:assert/strict";
import { test } from "node:test";
import { validateCustomerInput } from "./customers.validation.js";

const validPayload = {
  maKH: " kh201 ",
  tenKH: " Công ty A ",
  ngayThanhLap: "2018-05-12",
  canBoQuanLy: " Nguyễn Minh Anh ",
  vips: [
    { hoTen: "VIP 1", chucVu: "Giám đốc", ngaySinh: "1985-08-15", soDienThoai: "0912345678" },
    { hoTen: "VIP 2", chucVu: "Kế toán trưởng", ngaySinh: "1990-05-25", soDienThoai: "0987654321" }
  ]
};

test("validateCustomerInput normalizes customer data", () => {
  const result = validateCustomerInput(validPayload);
  assert.equal(result.maKH, "KH201");
  assert.equal(result.tenKH, "Công ty A");
  assert.equal(result.canBoQuanLy, "Nguyễn Minh Anh");
  assert.equal(result.vips.length, 2);
});

test("validateCustomerInput requires exactly two VIPs", () => {
  assert.throws(
    () => validateCustomerInput({ ...validPayload, vips: [validPayload.vips[0]] }),
    /phải có đúng 2 VIP/
  );
});

test("validateCustomerInput requires canBoQuanLy", () => {
  assert.throws(
    () => validateCustomerInput({ ...validPayload, canBoQuanLy: " " }),
    /Cán bộ quản lý/
  );
});
