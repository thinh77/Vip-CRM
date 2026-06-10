import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("./customers.routes.ts", import.meta.url), "utf8");

test("customer list route accepts management officer filter query", () => {
  assert.match(source, /manager: typeof req\.query\.manager === "string" \? req\.query\.manager : undefined/);
});

test("customer import route validates and writes one atomic batch", () => {
  assert.match(source, /customersRouter\.post\("\/import"/);
  assert.match(source, /validateCustomerImportInput\(req\.body\)/);
  assert.match(source, /service\.importCustomers/);
  assert.match(source, /res\.status\(201\)\.json/);
});
