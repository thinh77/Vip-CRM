import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const fileUrl = new URL("./AppSidebar.tsx", import.meta.url);
const source = existsSync(fileUrl) ? readFileSync(fileUrl, "utf8") : "";

test("sidebar exposes the three approved CRM destinations", () => {
  assert.match(source, /Sự kiện/);
  assert.match(source, /Khách hàng/);
  assert.match(source, /Import khách hàng/);
  assert.match(source, /CalendarDays/);
  assert.match(source, /Users/);
  assert.match(source, /FileUp/);
  assert.match(source, /aria-current=\{isActive \? "page" : undefined\}/);
  assert.match(source, /bg-\[#B01137\]/);
});

test("sidebar has a fixed desktop rail and an accessible mobile drawer", () => {
  assert.match(source, /hidden[^"]*lg:flex/);
  assert.match(source, /fixed inset-0 z-50 lg:hidden/);
  assert.match(source, /aria-label="Đóng menu điều hướng"/);
  assert.match(source, /onClick=\{onClose\}/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
});
