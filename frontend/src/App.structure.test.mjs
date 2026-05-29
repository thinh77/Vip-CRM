import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

test("customer form renders in separate add and edit modals", () => {
  assert.match(source, /id="add-customer-modal"/);
  assert.match(source, /id="add-customer-modal-panel"/);
  assert.match(source, /id="edit-customer-modal"/);
  assert.match(source, /id="edit-customer-modal-panel"/);
  assert.match(source, /\{isFormOpen && !customerToEdit && \(/);
  assert.match(source, /\{isFormOpen && customerToEdit && \(/);

  const workspace = source.match(/id="workspace-action-panel"[\s\S]*?id="main-list-crm-panel"/)?.[0] ?? "";
  assert.doesNotMatch(workspace, /!customerToEdit/);
  assert.doesNotMatch(workspace, /<CustomerForm/);
});

test("delete customer uses a custom confirm toast instead of browser confirm", () => {
  assert.doesNotMatch(source, /window\.confirm/);
  assert.match(source, /delete-customer-confirm-toast/);
  assert.match(source, /pendingDeleteCustomer/);
  assert.match(source, /btn-cancel-delete-customer/);
  assert.match(source, /btn-confirm-delete-customer/);
});
