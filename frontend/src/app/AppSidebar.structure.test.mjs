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

test("sidebar moves one shared active indicator between destinations", () => {
  assert.match(source, /import \{ AnimatePresence, LayoutGroup, motion, useReducedMotion \} from "motion\/react"/);
  assert.match(source, /layoutGroupId: string/);
  assert.match(source, /<LayoutGroup id=\{layoutGroupId\}>/);
  assert.match(source, /layoutId="sidebar-active-indicator"/);
  assert.match(source, /type: "spring"/);
  assert.match(source, /stiffness: 420/);
  assert.match(source, /damping: 34/);
  assert.match(source, /aria-current=\{isActive \? "page" : undefined\}/);
  assert.match(source, /layoutGroupId="desktop-sidebar"/);
  assert.match(source, /layoutGroupId="mobile-sidebar"/);
});

test("mobile drawer and overlay animate through mount and unmount", () => {
  assert.match(source, /<AnimatePresence initial=\{false\}>/);
  assert.match(source, /key="mobile-navigation-drawer"/);
  assert.match(source, /initial="hidden"/);
  assert.match(source, /animate="visible"/);
  assert.match(source, /exit="exit"/);
  assert.match(source, /const drawerOffset = shouldReduceMotion \? 0 : "-100%"/);
  assert.match(source, /const overlayDuration = shouldReduceMotion \? 0\.08 : 0\.16/);
  assert.match(source, /const drawerDuration = shouldReduceMotion \? 0\.08 : 0\.22/);
  assert.match(source, /<motion\.button/);
  assert.match(source, /<motion\.aside/);
  assert.match(source, /aria-label="Đóng menu điều hướng"/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
});
