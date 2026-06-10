import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const fileUrl = new URL("./useAppNavigation.ts", import.meta.url);
const source = existsSync(fileUrl) ? readFileSync(fileUrl, "utf8") : "";

test("navigation defaults to events and exposes typed CRM views", () => {
  assert.match(source, /export type AppView = "events" \| "customers" \| "import"/);
  assert.match(source, /useState<AppView>\("events"\)/);
  assert.match(source, /const selectView = useCallback\(\(view: AppView\) => \{/);
  assert.match(source, /setActiveView\(view\)/);
  assert.match(source, /setIsDrawerOpen\(false\)/);
});

test("mobile drawer can open, close, and close on Escape", () => {
  assert.match(source, /const \[isDrawerOpen, setIsDrawerOpen\] = useState\(false\)/);
  assert.match(source, /const openDrawer = useCallback\(\(\) => setIsDrawerOpen\(true\), \[\]\)/);
  assert.match(source, /const closeDrawer = useCallback\(\(\) => setIsDrawerOpen\(false\), \[\]\)/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /window\.addEventListener\("keydown", handleKeyDown\)/);
  assert.match(source, /window\.removeEventListener\("keydown", handleKeyDown\)/);
});

test("view selection closes the drawer, ignores the active view, and scrolls to the top", () => {
  assert.match(source, /import \{ useReducedMotion \} from "motion\/react"/);
  assert.match(source, /const shouldReduceMotion = useReducedMotion\(\)/);
  assert.match(source, /setIsDrawerOpen\(false\)/);
  assert.match(source, /if \(view === activeView\) return/);
  assert.match(source, /setActiveView\(view\)/);
  assert.match(source, /requestAnimationFrame\(\(\) => \{/);
  assert.match(source, /window\.scrollTo\(\{/);
  assert.match(source, /top: 0/);
  assert.match(source, /behavior: shouldReduceMotion === true \? "auto" : "smooth"/);
  assert.match(source, /\}, \[activeView, shouldReduceMotion\]\)/);
});
