# Customer List Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce customer-route mount cost by rendering 25 filtered customers per page.

**Architecture:** Keep all customer data and the current page in `useCrmDashboard`. Use a pure pagination module to clamp and slice the filtered collection, then render accessible numbered controls inside `CustomerList` without changing API or routing contracts.

**Tech Stack:** React 19, TypeScript, Motion reduced-motion support, Tailwind CSS 4, Node test runner, Vite.

---

### Task 1: Pure Pagination Contract

**Files:**
- Create: `frontend/src/app/customerPagination.ts`
- Create: `frontend/src/app/customerPagination.test.ts`

- [x] Add failing tests for page count, clamping, slicing, visible ranges, and ellipsis items.
- [x] Run the focused test and confirm it fails because the module is missing.
- [x] Implement `CUSTOMER_PAGE_SIZE`, page helpers, and the `PaginationItem` contract.
- [x] Run the focused test and confirm it passes.

### Task 2: Persistent Dashboard Pagination State

**Files:**
- Modify: `frontend/src/app/useCrmDashboard.ts`
- Modify: `frontend/src/app/useCrmDashboard.structure.test.mjs`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.structure.test.mjs`

- [x] Add failing structure assertions for app-level page state and page props.
- [x] Run the focused tests and confirm the expected failures.
- [x] Add `customerPage`, reset-aware search/filter callbacks, and page-count clamping.
- [x] Wire `currentPage` and `onPageChange` into `CustomerList`.
- [x] Run the focused tests and TypeScript validation.

### Task 3: Paginated Customer Rendering And Controls

**Files:**
- Modify: `frontend/src/components/CustomerList.tsx`
- Modify: `frontend/src/components/CustomerList.structure.test.mjs`

- [x] Add failing structure coverage for paginated rows/cards, range summary, numbered controls, boundary states, accessibility, and scroll behavior.
- [x] Run the focused test and confirm the expected failure.
- [x] Slice the filtered list through the pagination helper and map only the current page in both responsive layouts.
- [x] Add `Trước`, `Sau`, numbered pages, ellipses, current-range copy, and panel scroll handling.
- [x] Run focused tests and TypeScript validation.

### Task 4: Verification

- [x] Run the full frontend test suite.
- [x] Run TypeScript validation and production build.
- [x] Benchmark rendering 25 customers against all current customers.
- [x] Inspect the final diff and run `git diff --check`.
