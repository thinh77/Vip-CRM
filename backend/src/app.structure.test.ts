import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("./app.ts", import.meta.url), "utf8");

test("customer import gets a dedicated 10mb JSON parser before the default 1mb parser", () => {
  const importParser = source.indexOf('app.use("/api/customers/import", express.json({ limit: "10mb" }))');
  const defaultParser = source.indexOf('app.use(express.json({ limit: "1mb" }))');

  assert.ok(importParser >= 0);
  assert.ok(defaultParser > importParser);
});
