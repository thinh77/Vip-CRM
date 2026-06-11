import assert from "node:assert/strict";
import test from "node:test";
import { APP_ROUTES, getAppView } from "./appRoutes";

test("exposes the approved public route for each CRM view", () => {
  assert.deepEqual(APP_ROUTES, {
    events: "/events",
    customers: "/customers",
    import: "/customers/import"
  });
});

test("maps route paths to the active CRM view", () => {
  assert.equal(getAppView("/events"), "events");
  assert.equal(getAppView("/events/"), "events");
  assert.equal(getAppView("/customers"), "customers");
  assert.equal(getAppView("/customers/"), "customers");
  assert.equal(getAppView("/customers/import"), "import");
  assert.equal(getAppView("/customers/import/"), "import");
});

test("falls back to the events view while an invalid route redirects", () => {
  assert.equal(getAppView("/"), "events");
  assert.equal(getAppView("/missing"), "events");
});
