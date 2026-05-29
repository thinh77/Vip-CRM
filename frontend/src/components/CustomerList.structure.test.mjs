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

test("role filter uses the consolidated leadership role", () => {
  assert.match(source, /Có Lãnh đạo đơn vị/);
  assert.doesNotMatch(source, /Có Giám đốc/);
  assert.doesNotMatch(source, /Có Hiệu trưởng/);
});
