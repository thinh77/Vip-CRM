import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { app } from "./app.js";

let server: Server;
let baseUrl = "";

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      assert.equal(typeof address, "object");
      assert.ok(address);
      baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("GET /api/health returns ok", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test("GET /api/customers responds with JSON", async () => {
  const response = await fetch(`${baseUrl}/api/customers`);
  assert.notEqual(response.status, 404);
  assert.match(response.headers.get("content-type") || "", /application\/json/);
});

test("POST /api/customers/import accepts payloads larger than the default 1mb limit", async () => {
  const response = await fetch(`${baseUrl}/api/customers/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customers: [], padding: "x".repeat(1024 * 1024) })
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /ít nhất 1 khách hàng/);
});

test("POST /api/customers/import returns JSON 413 above the 10mb limit", async () => {
  const response = await fetch(`${baseUrl}/api/customers/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customers: [], padding: "x".repeat(10 * 1024 * 1024) })
  });

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), {
    message: "Dữ liệu gửi lên vượt quá giới hạn cho phép."
  });
});
