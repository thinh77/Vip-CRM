import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./MonthlyEvents.tsx", import.meta.url), "utf8");
const utilsSource = readFileSync(new URL("../utils.ts", import.meta.url), "utf8");

test("today events have a high-visibility card treatment and action cue", () => {
  const todayBranch = source.match(/if \(isEventToday\) \{[\s\S]*?\} else if \(isEventUpcoming\)/)?.[0] ?? "";

  assert.match(todayBranch, /border-red-500/);
  assert.match(todayBranch, /ring-red-200/);
  assert.match(todayBranch, /shadow-lg/);
  assert.match(todayBranch, /bg-red-50/);
  assert.match(source, /BellRing/);
  assert.match(source, /Cần chăm sóc hôm nay/);
});

test("today events are summarized above the grid and prioritized first", () => {
  assert.match(source, /todayEvents/);
  assert.match(source, /today-events-priority-banner/);
  assert.match(source, /Hôm nay có/);
  assert.match(source, /Number\(isCareEventToday\(b\)\) - Number\(isCareEventToday\(a\)\)/);
  assert.match(source, /prioritizedEvents\.map/);
});

test("today status text uses icon-free copy for a polished badge", () => {
  assert.match(utilsSource, /return "HÔM NAY";/);
  assert.doesNotMatch(utilsSource, /🎉/);
});
