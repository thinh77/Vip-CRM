import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateCalendarEvent, isIsoDate } from "./date.js";

test("calculateCalendarEvent computes same-month upcoming event", () => {
  const result = calculateCalendarEvent("1990-05-25", 5, new Date("2026-05-20T08:00:00+07:00"));
  assert.deepEqual(result, {
    originalYear: 1990,
    day: 25,
    daysRemaining: 5,
    isToday: false,
    age: 36
  });
});

test("calculateCalendarEvent marks today", () => {
  const result = calculateCalendarEvent("2018-05-20", 5, new Date("2026-05-20T08:00:00+07:00"));
  assert.equal(result.isToday, true);
  assert.equal(result.daysRemaining, 0);
  assert.equal(result.age, 8);
});

test("isIsoDate accepts leap day in leap year", () => {
  assert.equal(isIsoDate("2024-02-29"), true);
});

test("isIsoDate rejects leap day in non-leap year", () => {
  assert.equal(isIsoDate("2026-02-29"), false);
});

test("isIsoDate rejects impossible month day", () => {
  assert.equal(isIsoDate("2026-02-31"), false);
});
