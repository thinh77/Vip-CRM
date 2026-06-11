import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

test("the React entry point provides browser routing", () => {
  assert.match(source, /import \{ BrowserRouter \} from "react-router-dom"/);
  assert.match(source, /<BrowserRouter>/);
  assert.match(source, /<App \/>/);
  assert.match(source, /<\/BrowserRouter>/);
});
