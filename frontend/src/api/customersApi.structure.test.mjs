import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./customersApi.ts", import.meta.url), "utf8");

test("customer list API sends manager filter instead of role filter", () => {
  assert.match(source, /list: \(params: \{ search\?: string; manager\?: string \} = \{\}\)/);
  assert.match(source, /query\.set\("manager", params\.manager\)/);
  assert.doesNotMatch(source, /role\?: string/);
  assert.doesNotMatch(source, /query\.set\("role"/);
});

test("customer import API sends the entire batch in one request", () => {
  assert.match(source, /importMany: \(customers: CustomerPayload\[\]\)/);
  assert.match(source, /apiRequest<\{ importedCount: number \}>\("\/customers\/import"/);
  assert.match(source, /body: JSON\.stringify\(\{ customers \}\)/);
});
