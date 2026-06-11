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

test("customer list leaves Excel import to the dedicated import page", () => {
  assert.doesNotMatch(source, /onImportCustomers/);
  assert.doesNotMatch(source, /customerImportState/);
  assert.doesNotMatch(source, /import-customers-excel-input/);
  assert.doesNotMatch(source, /btn-import-customers-excel/);
  assert.doesNotMatch(source, /getCustomerImportLabel/);
  assert.doesNotMatch(source, /<Upload/);
});

test("customer list renders only the current page in both responsive layouts", () => {
  assert.match(source, /currentPage: number/);
  assert.match(source, /onPageChange: \(page: number\) => void/);
  assert.match(source, /paginateCustomers\(customers, currentPage\)/);
  assert.match(source, /const paginatedCustomers = pagination\.items/);
  assert.equal((source.match(/paginatedCustomers\.map/g) ?? []).length, 2);
  assert.doesNotMatch(source, /finalCustomers\.map/);
});

test("customer pagination exposes range, numbered controls, and accessible boundaries", () => {
  assert.match(source, /getPaginationItems\(pagination\.page, pagination\.totalPages\)/);
  assert.match(source, /id="customer-list-range"/);
  assert.match(source, /Đang hiển thị/);
  assert.match(source, /id="customer-pagination"/);
  assert.match(source, />\s*Trước\s*</);
  assert.match(source, />\s*Sau\s*</);
  assert.match(source, /"ellipsis-left" \|\| item === "ellipsis-right"/);
  assert.match(source, /aria-current=\{pageNumber === pagination\.page \? "page" : undefined\}/);
  assert.match(source, /disabled=\{pagination\.page === 1\}/);
  assert.match(source, /disabled=\{pagination\.page === pagination\.totalPages\}/);
  assert.match(source, /pagination\.totalPages > 1/);
});

test("changing customer page scrolls the panel with reduced-motion support", () => {
  assert.match(source, /import \{ useReducedMotion \} from "motion\/react"/);
  assert.match(source, /const panelRef = useRef<HTMLDivElement>\(null\)/);
  assert.match(source, /const shouldReduceMotion = useReducedMotion\(\)/);
  assert.match(source, /onPageChange\(page\)/);
  assert.match(source, /requestAnimationFrame\(\(\) => \{/);
  assert.match(source, /panelRef\.current\?\.scrollIntoView\(\{/);
  assert.match(source, /behavior: shouldReduceMotion === true \? "auto" : "smooth"/);
  assert.match(source, /block: "start"/);
  assert.match(source, /ref=\{panelRef\}/);
});
