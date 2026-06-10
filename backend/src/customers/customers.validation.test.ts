import assert from "node:assert/strict";
import { test } from "node:test";
import {
  validateCustomerImportInput,
  validateCustomerInput,
  validateInteractionInput,
  validateNoteInput
} from "./customers.validation.js";
import { HttpError } from "../shared/errors.js";

const validPayload = {
  maKH: " kh201 ",
  tenKH: " Công ty A ",
  ngayThanhLap: "2018-05-12",
  canBoQuanLy: " Nguyễn Minh Anh ",
  vips: [
    { hoTen: "VIP 1", chucVu: "Lãnh đạo đơn vị", ngaySinh: "1985-08-15", soDienThoai: "0912345678" },
    { hoTen: "VIP 2", chucVu: "Kế toán trưởng", ngaySinh: "1990-05-25", soDienThoai: "0987654321" }
  ]
};

function assertBadRequest(fn: () => unknown, message: RegExp): void {
  assert.throws(fn, (error) => {
    assert.ok(error instanceof HttpError);
    assert.equal(error.status, 400);
    assert.match(error.message, message);
    return true;
  });
}

test("validateCustomerInput normalizes customer data", () => {
  const result = validateCustomerInput(validPayload);
  assert.equal(result.maKH, "KH201");
  assert.equal(result.tenKH, "Công ty A");
  assert.equal(result.canBoQuanLy, "Nguyễn Minh Anh");
  assert.equal(result.vips.length, 2);
});

test("validateCustomerInput requires exactly two VIPs", () => {
  assertBadRequest(
    () => validateCustomerInput({ ...validPayload, vips: [validPayload.vips[0]] }),
    /phải có đúng 2 VIP/
  );
});

test("validateCustomerInput requires canBoQuanLy", () => {
  assertBadRequest(
    () => validateCustomerInput({ ...validPayload, canBoQuanLy: " " }),
    /Cán bộ quản lý/
  );
});

test("validateCustomerInput rejects malformed body with bad request", () => {
  assertBadRequest(
    () => validateCustomerInput(null),
    /Dữ liệu khách hàng không hợp lệ/
  );
});

test("validateCustomerInput rejects malformed VIP entries with bad request", () => {
  assertBadRequest(
    () => validateCustomerInput({ ...validPayload, vips: [null, null] }),
    /VIP không hợp lệ/
  );
});

test("validateCustomerInput rejects invalid VIP role", () => {
  assertBadRequest(
    () =>
      validateCustomerInput({
        ...validPayload,
        vips: [{ ...validPayload.vips[0], chucVu: "Owner" }, validPayload.vips[1]]
      }),
    /Chức vụ VIP không hợp lệ/
  );
});

test("validateCustomerInput rejects removed legacy leadership roles", () => {
  for (const chucVu of ["Giám đốc", "Hiệu trưởng"]) {
    assertBadRequest(
      () =>
        validateCustomerInput({
          ...validPayload,
          vips: [{ ...validPayload.vips[0], chucVu }, validPayload.vips[1]]
        }),
      /Chức vụ VIP không hợp lệ/
    );
  }
});

test("validateCustomerInput rejects invalid customer date", () => {
  assertBadRequest(
    () => validateCustomerInput({ ...validPayload, ngayThanhLap: "2026-02-31" }),
    /Ngày không hợp lệ/
  );
});

test("validateCustomerInput rejects invalid VIP date", () => {
  assertBadRequest(
    () =>
      validateCustomerInput({
        ...validPayload,
        vips: [{ ...validPayload.vips[0], ngaySinh: "2026-02-29" }, validPayload.vips[1]]
      }),
    /Ngày không hợp lệ/
  );
});

test("validateCustomerImportInput validates and normalizes every customer", () => {
  const result = validateCustomerImportInput({
    customers: [
      validPayload,
      { ...validPayload, maKH: " kh202 ", tenKH: " Công ty B " }
    ]
  });

  assert.equal(result.length, 2);
  assert.equal(result[0].maKH, "KH201");
  assert.equal(result[1].maKH, "KH202");
  assert.equal(result[1].tenKH, "Công ty B");
});

test("validateCustomerImportInput rejects empty and oversized batches", () => {
  assertBadRequest(
    () => validateCustomerImportInput({ customers: [] }),
    /phải có ít nhất 1 khách hàng/
  );
  assertBadRequest(
    () => validateCustomerImportInput({
      customers: Array.from({ length: 5001 }, () => validPayload)
    }),
    /không được vượt quá 5000 khách hàng/
  );
});

test("validateCustomerImportInput reports the Excel row for invalid customer data", () => {
  assertBadRequest(
    () => validateCustomerImportInput({
      customers: [
        validPayload,
        { ...validPayload, maKH: "KH202", ngayThanhLap: "2026-02-31" }
      ]
    }),
    /Dòng 3: Ngày không hợp lệ/
  );
});

test("validateInteractionInput normalizes interaction data", () => {
  const result = validateInteractionInput({
    ngayThang: "2026-05-20",
    loaiHinh: "Meeting",
    chiTiet: " Trao đổi hợp đồng "
  });
  assert.deepEqual(result, {
    ngayThang: "2026-05-20",
    loaiHinh: "Meeting",
    chiTiet: "Trao đổi hợp đồng"
  });
});

test("validateInteractionInput rejects malformed body with bad request", () => {
  assertBadRequest(
    () => validateInteractionInput(null),
    /Dữ liệu tương tác không hợp lệ/
  );
});

test("validateInteractionInput rejects invalid interaction type", () => {
  assertBadRequest(
    () =>
      validateInteractionInput({
        ngayThang: "2026-05-20",
        loaiHinh: "SMS",
        chiTiet: "Nhắn tin"
      }),
    /Loại hình tương tác không hợp lệ/
  );
});

test("validateInteractionInput rejects invalid interaction date", () => {
  assertBadRequest(
    () =>
      validateInteractionInput({
        ngayThang: "2026-02-31",
        loaiHinh: "Call",
        chiTiet: "Gọi điện"
      }),
    /Ngày không hợp lệ/
  );
});

test("validateNoteInput returns trimmed note content", () => {
  assert.equal(validateNoteInput({ noiDung: " Gọi lại trong tháng 6 " }), "Gọi lại trong tháng 6");
});

test("validateNoteInput rejects malformed body with bad request", () => {
  assertBadRequest(
    () => validateNoteInput(null),
    /Dữ liệu ghi chú không hợp lệ/
  );
});

test("validateNoteInput rejects empty note", () => {
  assertBadRequest(
    () => validateNoteInput({ noiDung: " " }),
    /Nội dung ghi chú/
  );
});
