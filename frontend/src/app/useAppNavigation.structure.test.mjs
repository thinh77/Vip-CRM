import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const fileUrl = new URL("./useAppNavigation.ts", import.meta.url);
const source = existsSync(fileUrl) ? readFileSync(fileUrl, "utf8") : "";

test("navigation derives changes from the current browser location", () => {
  assert.match(source, /import \{ useLocation \} from "react-router-dom"/);
  assert.match(source, /const location = useLocation\(\)/);
  assert.match(source, /const previousPathnameRef = useRef\(location\.pathname\)/);
  assert.doesNotMatch(source, /AppView|activeView|setActiveView|selectView/);
});

test("mobile drawer can open, close, and close on Escape", () => {
  assert.match(source, /const \[isDrawerOpen, setIsDrawerOpen\] = useState\(false\)/);
  assert.match(source, /const openDrawer = useCallback\(\(\) => setIsDrawerOpen\(true\), \[\]\)/);
  assert.match(source, /const closeDrawer = useCallback\(\(\) => setIsDrawerOpen\(false\), \[\]\)/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /window\.addEventListener\("keydown", handleKeyDown\)/);
  assert.match(source, /window\.removeEventListener\("keydown", handleKeyDown\)/);
});

test("pathname changes close the drawer and scroll to the top after initial load", () => {
  assert.match(source, /import \{ useReducedMotion \} from "motion\/react"/);
  assert.match(source, /const shouldReduceMotion = useReducedMotion\(\)/);
  assert.match(source, /setIsDrawerOpen\(false\)/);
  assert.match(source, /if \(previousPathnameRef\.current === location\.pathname\) return/);
  assert.match(source, /previousPathnameRef\.current = location\.pathname/);
  assert.match(source, /const frame = requestAnimationFrame\(\(\) => \{/);
  assert.match(source, /window\.scrollTo\(\{/);
  assert.match(source, /top: 0/);
  assert.match(source, /behavior: shouldReduceMotion === true \? "auto" : "smooth"/);
  assert.match(source, /return \(\) => cancelAnimationFrame\(frame\)/);
  assert.match(source, /\}, \[location\.pathname, shouldReduceMotion\]\)/);
});
