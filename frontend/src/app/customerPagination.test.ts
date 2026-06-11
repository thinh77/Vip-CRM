import assert from "node:assert/strict";
import test from "node:test";
import {
  CUSTOMER_PAGE_SIZE,
  clampCustomerPage,
  getCustomerPageCount,
  getPaginationItems,
  paginateCustomers
} from "./customerPagination";

test("uses 25 customers per page and counts partial final pages", () => {
  assert.equal(CUSTOMER_PAGE_SIZE, 25);
  assert.equal(getCustomerPageCount(284), 12);
  assert.equal(getCustomerPageCount(25), 1);
  assert.equal(getCustomerPageCount(0), 1);
});

test("clamps page numbers to the available customer range", () => {
  assert.equal(clampCustomerPage(-1, 284), 1);
  assert.equal(clampCustomerPage(7, 284), 7);
  assert.equal(clampCustomerPage(99, 284), 12);
  assert.equal(clampCustomerPage(3, 0), 1);
});

test("returns only the requested customer page with a one-based range", () => {
  const customers = Array.from({ length: 284 }, (_, index) => index + 1);

  assert.deepEqual(paginateCustomers(customers, 1), {
    items: customers.slice(0, 25),
    page: 1,
    totalPages: 12,
    start: 1,
    end: 25
  });
  assert.deepEqual(paginateCustomers(customers, 12), {
    items: customers.slice(275),
    page: 12,
    totalPages: 12,
    start: 276,
    end: 284
  });
});

test("returns an empty safe range when there are no customers", () => {
  assert.deepEqual(paginateCustomers([], 5), {
    items: [],
    page: 1,
    totalPages: 1,
    start: 0,
    end: 0
  });
});

test("builds numbered pagination with stable boundary ellipses", () => {
  assert.deepEqual(getPaginationItems(1, 12), [1, 2, 3, 4, 5, "ellipsis-right", 12]);
  assert.deepEqual(getPaginationItems(6, 12), [
    1,
    "ellipsis-left",
    4,
    5,
    6,
    7,
    8,
    "ellipsis-right",
    12
  ]);
  assert.deepEqual(getPaginationItems(11, 12), [1, "ellipsis-left", 8, 9, 10, 11, 12]);
  assert.deepEqual(getPaginationItems(1, 1), [1]);
});
