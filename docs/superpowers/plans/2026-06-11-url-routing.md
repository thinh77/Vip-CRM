# URL-Based CRM Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace CRM page-selection state with clean browser routes while preserving the existing shell and transitions.

**Architecture:** Use React Router declarative mode with `BrowserRouter` at the entry point and route definitions inside the existing `App` shell. Centralize route metadata, derive the active view from `location.pathname`, and leave CRM data and modal ownership unchanged.

**Tech Stack:** React 19, TypeScript, React Router 7, Motion, Tailwind CSS 4, Node test runner, Vite.

---

### Task 1: Route Contract

**Files:**
- Create: `frontend/src/app/appRoutes.ts`
- Create: `frontend/src/app/appRoutes.test.ts`

- [ ] Write tests for the three public paths and pathname-to-view mapping.
- [ ] Run the focused test and confirm it fails because the module is missing.
- [ ] Implement `AppView`, `APP_ROUTES`, and `getAppView`.
- [ ] Run the focused test and confirm it passes.

### Task 2: Router-Owned Page Rendering

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/pnpm-lock.yaml`
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.structure.test.mjs`

- [ ] Add failing structure assertions for `BrowserRouter`, `Routes`, `Route`, `Navigate`, `useLocation`, route paths, and pathname animation keys.
- [ ] Run the focused structure test and confirm the expected failure.
- [ ] Install `react-router-dom@^7.17.0`.
- [ ] Wrap the root with `BrowserRouter`.
- [ ] Replace active-view conditionals with routes while keeping `useCrmDashboard()` and shell-level feedback mounted.
- [ ] Redirect `/` and unknown paths to `/events` with `replace`.
- [ ] Run the focused tests and TypeScript validation.

### Task 3: Route-Aware Navigation Controls

**Files:**
- Modify: `frontend/src/app/useAppNavigation.ts`
- Modify: `frontend/src/app/useAppNavigation.structure.test.mjs`
- Modify: `frontend/src/app/AppSidebar.tsx`
- Modify: `frontend/src/app/AppSidebar.structure.test.mjs`
- Modify: `frontend/src/app/AppHeader.tsx`
- Modify: `frontend/src/app/CustomerImportPage.tsx`
- Modify: `frontend/src/app/CustomerImportPage.structure.test.mjs`

- [ ] Add failing tests requiring the removal of page-selection state and the use of `NavLink`/`Link`.
- [ ] Run the focused tests and confirm the expected failures.
- [ ] Refactor `useAppNavigation` to derive the view from `useLocation`, close the drawer on path changes, and scroll after non-initial navigation.
- [ ] Convert sidebar destinations to exact router links without changing visual motion.
- [ ] Import `AppView` from the route contract in the header.
- [ ] Replace the import success callback with a link to `/customers`.
- [ ] Run all focused tests and TypeScript validation.

### Task 4: Deployment Documentation And Verification

**Files:**
- Modify: `frontend/README.md`

- [ ] Document SPA fallback requirements and the `/api/*` exception.
- [ ] Run the full frontend test suite.
- [ ] Run TypeScript validation and the Vite production build.
- [ ] Start Vite preview and smoke-check `/`, `/events`, `/customers`, `/customers/import`, and an unknown path.
- [ ] Inspect the final diff and run `git diff --check`.
