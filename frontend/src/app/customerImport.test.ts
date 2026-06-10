import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "xlsx";
import { ChucVu } from "../types";
import {
  getCustomerImportLabel,
  isSupportedCustomerImportFile,
  mapCustomerImportSheet,
  normalizeImportHeaders,
  parseCustomerImportFile
} from "./customerImport";

const headers = [
  " MÃ KH ",
  "TÊN ĐƠN VỊ",
  "CÁN BỘ QUẢN LÝ",
  "HỌ TÊN LÃNH ĐẠO",
  "SỐ ĐIỆN THOẠI LÃNH ĐẠO",
  "SINH NHẬT LÃNH ĐẠO",
  "HỌ TÊN KẾ TOÁN",
  "SỐ ĐIỆN THOẠI KẾ TOÁN",
  "SINH NHẬT KẾ TOÁN",
  "NGÀY THÀNH LẬP"
];

test("normalizes Excel headers to lowercase before mapping customers", () => {
  assert.deepEqual(normalizeImportHeaders([" MÃ KH ", "Tên Đơn Vị"]), ["mã kh", "tên đơn vị"]);

  const customers = mapCustomerImportSheet([
    headers,
    [
      " kh001 ",
      "Trường THCS Nguyễn Trãi",
      "Nguyễn Văn Quản",
      "Lê Lãnh Đạo",
      "0912345678",
      "01/02/1980",
      "Trần Kế Toán",
      "0987654321",
      "03/04/1985",
      "09/10/2000"
    ]
  ]);

  assert.equal(customers.length, 1);
  assert.equal(customers[0].maKH, "KH001");
  assert.equal(customers[0].tenKH, "Trường THCS Nguyễn Trãi");
  assert.equal(customers[0].canBoQuanLy, "Nguyễn Văn Quản");
  assert.equal(customers[0].ngayThanhLap, "2000-10-09");
  assert.deepEqual(customers[0].vips, [
    {
      hoTen: "Lê Lãnh Đạo",
      chucVu: ChucVu.LanhDaoDonVi,
      soDienThoai: "0912345678",
      ngaySinh: "1980-02-01"
    },
    {
      hoTen: "Trần Kế Toán",
      chucVu: ChucVu.KeToanTruong,
      soDienThoai: "0987654321",
      ngaySinh: "1985-04-03"
    }
  ]);
});

test("reports missing required import headers after lowercase normalization", () => {
  assert.throws(
    () => mapCustomerImportSheet([["MÃ KH"], ["KH001"]]),
    /Thiếu cột bắt buộc: tên đơn vị/
  );
});

test("skips blank rows and reports the Excel row number for invalid dates", () => {
  assert.throws(
    () => mapCustomerImportSheet([headers, [], ["KH002", "Đơn vị B", "Cán bộ", "Lãnh đạo", "090", "31/02/1980", "Kế toán", "091", "01/01/1981", "01/01/2001"]]),
    /Dòng 3: Sinh nhật lãnh đạo không hợp lệ/
  );
});

test("parses the first worksheet from a real Excel file", async () => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      headers,
      ["KH003", "Đơn vị C", "Cán bộ C", "Lãnh đạo C", "0903", "15/05/1982", "Kế toán C", "0913", "20/06/1984", "25/12/2005"]
    ]),
    "Import"
  );

  const data = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  const file = new File([data], "khach-hang.xlsx");
  const customers = await parseCustomerImportFile(file);

  assert.equal(customers[0].maKH, "KH003");
  assert.equal(customers[0].vips[0].ngaySinh, "1982-05-15");
  assert.equal(customers[0].vips[1].ngaySinh, "1984-06-20");
  assert.equal(customers[0].ngayThanhLap, "2005-12-25");
});

test("formats each customer import phase for the action button", () => {
  assert.equal(getCustomerImportLabel({ phase: "idle", count: 0 }), "Import Excel");
  assert.equal(getCustomerImportLabel({ phase: "parsing", count: 0 }), "Đang đọc file...");
  assert.equal(getCustomerImportLabel({ phase: "saving", count: 2500 }), "Đang lưu 2500 khách hàng...");
  assert.equal(getCustomerImportLabel({ phase: "refreshing", count: 2500 }), "Đang cập nhật dữ liệu...");
});

test("accepts only Excel workbook files for customer import", () => {
  assert.equal(isSupportedCustomerImportFile(new File([], "khach-hang.xlsx")), true);
  assert.equal(isSupportedCustomerImportFile(new File([], "KHACH-HANG.XLS")), true);
  assert.equal(isSupportedCustomerImportFile(new File([], "khach-hang.csv")), false);
  assert.equal(isSupportedCustomerImportFile(new File([], "khach-hang.xlsx.exe")), false);
});
