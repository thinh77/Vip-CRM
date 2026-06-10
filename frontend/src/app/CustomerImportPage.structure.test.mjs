import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const fileUrl = new URL("./CustomerImportPage.tsx", import.meta.url);
const source = existsSync(fileUrl) ? readFileSync(fileUrl, "utf8") : "";

test("import page supports selecting and dropping one Excel file", () => {
  assert.match(source, /onImportCustomers: \(file: File\) => Promise<number>/);
  assert.match(source, /accept="\.xlsx,\.xls"/);
  assert.match(source, /onDrop=\{handleDrop\}/);
  assert.match(source, /onDragOver=\{handleDragOver\}/);
  assert.match(source, /files\.length !== 1/);
  assert.match(source, /files\?\.\[0\]/);
  assert.match(source, /isSupportedCustomerImportFile\(file\)/);
  assert.match(source, /Bắt đầu import/);
});

test("import page documents the current workbook contract", () => {
  for (const header of [
    "Mã KH",
    "Tên đơn vị",
    "Cán bộ quản lý",
    "Họ tên lãnh đạo",
    "Số điện thoại lãnh đạo",
    "Sinh nhật lãnh đạo",
    "Họ tên kế toán",
    "Số điện thoại kế toán",
    "Sinh nhật kế toán",
    "Ngày thành lập"
  ]) {
    assert.match(source, new RegExp(header));
  }
  assert.match(source, /DD\/MM\/YYYY/);
});

test("import page presents progress, inline errors, success, and customer navigation", () => {
  assert.match(source, /customerImportState\.phase !== "idle"/);
  assert.match(source, /getCustomerImportLabel\(customerImportState\)/);
  assert.match(source, /id="customer-import-error"/);
  assert.match(source, /id="customer-import-success"/);
  assert.match(source, /Xem danh sách khách hàng/);
  assert.match(source, /onViewCustomers/);
});
