import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./AppFeedback.tsx", import.meta.url), "utf8");

test("toast feedback is isolated from App composition", () => {
  assert.match(source, /export function AppToast/);
  assert.match(source, /id="global-alert-toast"/);
  assert.match(source, /toast\.type === "success"/);
  assert.match(source, /toast\.type === "info"/);
  assert.match(source, /toast\.type === "error"/);
});

test("delete customer uses a custom confirm toast instead of browser confirm", () => {
  assert.doesNotMatch(source, /window\.confirm/);
  assert.match(source, /export function DeleteCustomerConfirmToast/);
  assert.match(source, /delete-customer-confirm-toast/);
  assert.match(source, /btn-cancel-delete-customer/);
  assert.match(source, /btn-confirm-delete-customer/);
});
