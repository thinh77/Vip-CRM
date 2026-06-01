import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./CustomerModalLayer.tsx", import.meta.url), "utf8");

test("customer form renders in separate add and edit modals", () => {
  assert.match(source, /id="add-customer-modal"/);
  assert.match(source, /id="add-customer-modal-panel"/);
  assert.match(source, /id="edit-customer-modal"/);
  assert.match(source, /id="edit-customer-modal-panel"/);
  assert.match(source, /\{isFormOpen && !customerToEdit && \(/);
  assert.match(source, /\{isFormOpen && customerToEdit && \(/);
  assert.match(source, /existingCodes=\{existingCodes\}/);
});

test("customer modals center their panels in the viewport", () => {
  const centeredWrappers = source.match(/className="min-h-\[calc\(100dvh-3rem\)\] sm:min-h-\[calc\(100dvh-4rem\)\] flex items-center justify-center"/g) ?? [];
  const scrollablePanels = source.match(/className="w-full max-w-(?:5xl|6xl) max-h-\[calc\(100dvh-3rem\)\] sm:max-h-\[calc\(100dvh-4rem\)\] overflow-y-auto"/g) ?? [];

  assert.equal(centeredWrappers.length, 3);
  assert.equal(scrollablePanels.length, 3);
  assert.doesNotMatch(source, /items-start/);
});

test("customer details render in a separate modal and preserve note focus", () => {
  assert.match(source, /id="customer-detail-modal"/);
  assert.match(source, /id="customer-detail-modal-panel"/);
  assert.match(source, /id="customer-detail-modal"[\s\S]*?<CustomerDetails/);
  assert.match(source, /shouldFocusNote=\{noteFocusCustomerId === activeCustomer\.id\}/);
  assert.match(source, /onNoteFocusHandled=\{onNoteFocusHandled\}/);
  assert.doesNotMatch(source, /id="workspace-action-panel"/);
  assert.doesNotMatch(source, /scrollIntoView/);
});
