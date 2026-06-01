import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("./customers.routes.ts", import.meta.url), "utf8");

test("customer list route accepts management officer filter query", () => {
  assert.match(source, /manager: typeof req\.query\.manager === "string" \? req\.query\.manager : undefined/);
});
