import * as XLSX from "xlsx";
import { parseCustomerImportFile } from "./customerImport";

const CUSTOMER_COUNT = 5000;
const TARGET_MS = 1000;
const headers = [
  "MÃ KH",
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

const rows = Array.from({ length: CUSTOMER_COUNT }, (_, index) => {
  const sequence = String(index + 1).padStart(5, "0");
  return [
    `BENCH${sequence}`,
    `Đơn vị benchmark ${sequence}`,
    `Cán bộ ${index % 20}`,
    `Lãnh đạo ${sequence}`,
    `090${String(index).padStart(7, "0")}`,
    "15/05/1985",
    `Kế toán ${sequence}`,
    `091${String(index).padStart(7, "0")}`,
    "25/05/1990",
    "12/05/2018"
  ];
});
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([headers, ...rows]), "Import");
const data = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
const file = new File([data], "benchmark-5000.xlsx");

const startedAt = performance.now();
const customers = await parseCustomerImportFile(file);
const parseMs = performance.now() - startedAt;

if (customers.length !== CUSTOMER_COUNT) {
  throw new Error(`Expected ${CUSTOMER_COUNT} parsed customers, received ${customers.length}.`);
}
if (parseMs >= TARGET_MS) {
  throw new Error(`Excel parsing took ${parseMs.toFixed(1)}ms; target is under ${TARGET_MS}ms.`);
}

console.log(JSON.stringify({
  customerCount: CUSTOMER_COUNT,
  workbookBytes: file.size,
  parseMs: Number(parseMs.toFixed(1))
}));
