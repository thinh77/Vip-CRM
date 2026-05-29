import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("initial migration defines required tables and canBoQuanLy column", () => {
  const sql = readFileSync(
    join(__dirname, "migrations", "001_initial_schema.sql"),
    "utf8"
  );

  assert.match(sql, /create table if not exists customers/i);
  assert.match(sql, /can_bo_quan_ly text not null/i);
  assert.match(sql, /create table if not exists vips/i);
  assert.match(sql, /create table if not exists interactions/i);
  assert.match(sql, /create table if not exists notes/i);
});
