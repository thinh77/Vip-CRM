import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./CustomerDetails.tsx", import.meta.url), "utf8");

test("customer details can focus the new-note input when opened from event cards", () => {
  assert.match(source, /shouldFocusNote\?: boolean/);
  assert.match(source, /onNoteFocusHandled\?: \(\) => void/);
  assert.match(source, /const noteInputRef = useRef<HTMLInputElement>\(null\)/);
  assert.match(source, /noteInputRef\.current\?\.focus\(\)/);
  assert.match(source, /onNoteFocusHandled\?\.\(\)/);
  assert.match(source, /ref=\{noteInputRef\}/);
  assert.match(source, /id="input-new-note"/);
});
