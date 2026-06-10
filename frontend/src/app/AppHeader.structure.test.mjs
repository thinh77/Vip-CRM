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

test("topbar animates only the active view copy", () => {
  assert.match(source, /import \{ AnimatePresence, motion, useReducedMotion \} from "motion\/react"/);
  assert.match(source, /const shouldReduceMotion = useReducedMotion\(\)/);
  assert.match(source, /<AnimatePresence mode="wait" initial=\{false\}>/);
  assert.match(source, /<motion\.div\s+key=\{activeView\}/);
  assert.match(source, /initial=\{\{ opacity: 0, y: shouldReduceMotion \? 0 : 4 \}\}/);
  assert.match(source, /duration: shouldReduceMotion \? 0\.08 : 0\.16/);
  assert.match(source, /duration: shouldReduceMotion \? 0\.08 : 0\.09/);

  const animatedBlock = source.match(/<AnimatePresence[\s\S]*?<\/AnimatePresence>/)?.[0] ?? "";
  assert.match(animatedBlock, /\{content\.title\}/);
  assert.match(animatedBlock, /\{content\.description\}/);
  assert.doesNotMatch(animatedBlock, /systemDate/);
  assert.doesNotMatch(animatedBlock, /Mở menu điều hướng/);
});
