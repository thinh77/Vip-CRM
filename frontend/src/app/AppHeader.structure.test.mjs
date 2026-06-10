import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./AppHeader.tsx", import.meta.url), "utf8");

test("topbar describes the active view and exposes the mobile menu", () => {
  assert.match(source, /activeView: AppView/);
  assert.match(source, /onOpenMenu: \(\) => void/);
  assert.match(source, /aria-label="Mở menu điều hướng"/);
  assert.match(source, /lg:hidden/);
  assert.match(source, /Sự kiện chăm sóc/);
  assert.match(source, /Danh sách khách hàng/);
  assert.match(source, /Import khách hàng/);
});

test("topbar derives the displayed system date instead of hard-coding it", () => {
  assert.match(source, /new Intl\.DateTimeFormat\("vi-VN"/);
  assert.doesNotMatch(source, /20\/05\/2026/);
});
