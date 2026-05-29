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