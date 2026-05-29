import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./CustomerForm.tsx", import.meta.url), "utf8");

test("customer form role dropdown uses consolidated leadership role", () => {
  assert.match(source, /Lãnh đạo đơn vị/);
  assert.doesNotMatch(source, /Giám đốc/);
  assert.doesNotMatch(source, /Hiệu trưởng/);
});
