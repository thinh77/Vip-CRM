import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./CustomerList.tsx", import.meta.url), "utf8");

test("desktop customer table shows management officer as its own column", () => {
  const thead = source.match(/<thead>[\s\S]*?<\/thead>/)?.[0] ?? "";

  assert.match(thead, /<th className="[^"]*">Cán bộ quản lý<\/th>/);
  assert.match(thead, /<th className="[^"]*">Thao tác<\/th>/);
  assert.ok(thead.indexOf("Cán bộ quản lý") < thead.indexOf("Thao tác"));

  assert.match(source, /<td className="[^"]*">\s*<div className="[^"]*">\s*<User[\s\S]*?\{kh\.canBoQuanLy\}/);
});

test("manager filter uses customer management officers instead of VIP roles", () => {
  assert.match(source, /managerOptions: string\[\]/);
  assert.match(source, /id="filter-manager-select"/);
  assert.match(source, /Tất cả cán bộ quản lý/);
  assert.match(source, /managerOptions\.map/);
  assert.match(source, /onManagerFilterChange/);
  assert.doesNotMatch(source, /new Set\(customers\.map/);
  assert.doesNotMatch(source, /id="filter-role-select"/);
  assert.doesNotMatch(source, /roleFilter/);
  assert.doesNotMatch(source, /Có Lãnh đạo đơn vị/);
  assert.doesNotMatch(source, /Có Kế toán/);
});

test("customer list exposes an Excel import control beside customer actions", () => {
  assert.match(source, /onImportCustomers: \(file: File\) => void/);
  assert.match(source, /isImportingCustomers: boolean/);
  assert.match(source, /useRef<HTMLInputElement>\(null\)/);
  assert.match(source, /id="import-customers-excel-input"/);
  assert.match(source, /accept="\.xlsx,\.xls"/);
  assert.match(source, /id="btn-import-customers-excel"/);
  assert.match(source, /onImportCustomers\(file\)/);
});
