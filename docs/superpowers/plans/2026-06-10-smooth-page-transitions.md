# Smooth Page Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add coordinated, reduced-motion-aware transitions for CRM page content, topbar copy, sidebar active state, and the mobile navigation drawer.

**Architecture:** Keep `activeView` and drawer ownership in `useAppNavigation`, adding duplicate-selection and scroll-to-top behavior there. Use `motion/react` at the existing composition boundaries: `App.tsx` animates the active page, `AppHeader.tsx` animates only title copy, and `AppSidebar.tsx` animates the shared active background plus mobile drawer. Existing CRM pages, data loading, errors, toasts, and modals remain unchanged.

**Tech Stack:** React 19, TypeScript, Motion (`motion/react`), Tailwind CSS 4, Node test runner structure tests, Vite.

---

## File Map

- Modify `frontend/src/app/useAppNavigation.ts` for duplicate-selection handling, reduced-motion detection, drawer close, and scroll-to-top.
- Modify `frontend/src/App.tsx` for keyed page exit/enter animation.
- Modify `frontend/src/app/AppHeader.tsx` for keyed title/description animation.
- Modify `frontend/src/app/AppSidebar.tsx` for the shared active indicator and animated mobile drawer.
- Extend the four matching `*.structure.test.mjs` files to lock exact motion behavior without introducing a browser test dependency.

### Task 1: Navigation Selection And Scroll-To-Top

**Files:**
- Modify: `frontend/src/app/useAppNavigation.structure.test.mjs`
- Modify: `frontend/src/app/useAppNavigation.ts`

- [ ] **Step 1: Add failing structure coverage for reduced motion, duplicate selection, and scroll**

Append this test to `frontend/src/app/useAppNavigation.structure.test.mjs`:

```js
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
```

Update the existing typed-view test so it still expects `selectView(view: AppView)` but no longer assumes an empty dependency array.

- [ ] **Step 2: Run the focused test and verify RED**

Run from `frontend/`:

```bash
rtk node --test src/app/useAppNavigation.structure.test.mjs
```

Expected: FAIL because `useReducedMotion`, duplicate-selection handling, `requestAnimationFrame`, and `window.scrollTo` are absent.

- [ ] **Step 3: Implement the navigation behavior**

Update `frontend/src/app/useAppNavigation.ts` to this shape:

```ts
import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

export type AppView = "events" | "customers" | "import";

export function useAppNavigation() {
  const [activeView, setActiveView] = useState<AppView>("events");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const selectView = useCallback((view: AppView) => {
    setIsDrawerOpen(false);
    if (view === activeView) return;

    setActiveView(view);
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: shouldReduceMotion === true ? "auto" : "smooth"
      });
    });
  }, [activeView, shouldReduceMotion]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeDrawer, isDrawerOpen]);

  return {
    activeView,
    closeDrawer,
    isDrawerOpen,
    openDrawer,
    selectView
  };
}
```

The drawer close occurs before the duplicate-view return so tapping the current destination still closes the mobile drawer. The state setter naturally converges on the final view when users click destinations rapidly.

- [ ] **Step 4: Run the focused test and verify GREEN**

```bash
rtk node --test src/app/useAppNavigation.structure.test.mjs
```

Expected: all navigation structure tests PASS.

- [ ] **Step 5: Run TypeScript validation**

```bash
rtk npm run lint
```

Expected: `tsc --noEmit` exits `0`.

- [ ] **Step 6: Commit the navigation behavior**

```bash
rtk git add frontend/src/app/useAppNavigation.ts frontend/src/app/useAppNavigation.structure.test.mjs
rtk git commit -m "feat(ui): smooth CRM view selection"
```

### Task 2: Active Page And Topbar Transitions

**Files:**
- Modify: `frontend/src/App.structure.test.mjs`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/app/AppHeader.structure.test.mjs`
- Modify: `frontend/src/app/AppHeader.tsx`

- [ ] **Step 1: Add failing page-transition structure coverage**

Append this test to `frontend/src/App.structure.test.mjs`:

```js
test("App animates only the keyed active page with the approved transition", () => {
  assert.match(source, /import \{ AnimatePresence, motion, useReducedMotion \} from "motion\/react"/);
  assert.match(source, /const shouldReduceMotion = useReducedMotion\(\)/);
  assert.match(source, /const pageOffset = shouldReduceMotion \? 0 : 8/);
  assert.match(source, /<AnimatePresence mode="wait" initial=\{false\}>/);
  assert.match(source, /<motion\.div\s+key=\{navigation\.activeView\}/);
  assert.match(source, /initial=\{\{ opacity: 0, y: pageOffset \}\}/);
  assert.match(source, /animate=\{\{\s*opacity: 1,\s*y: 0,/s);
  assert.match(source, /duration: shouldReduceMotion \? 0\.08 : 0\.2/);
  assert.match(source, /ease: \[0\.22, 1, 0\.36, 1\]/);
  assert.match(source, /exit=\{\{\s*opacity: 0,\s*y: 0,/s);
  assert.match(source, /duration: shouldReduceMotion \? 0\.08 : 0\.1/);
});
```

Keep the existing tests that assert loading and errors remain at shell level.

- [ ] **Step 2: Add failing topbar-transition structure coverage**

Append this test to `frontend/src/app/AppHeader.structure.test.mjs`:

```js
test("topbar animates only the active view copy", () => {
  assert.match(source, /import \{ AnimatePresence, motion, useReducedMotion \} from "motion\/react"/);
  assert.match(source, /const shouldReduceMotion = useReducedMotion\(\)/);
  assert.match(source, /<AnimatePresence mode="wait" initial=\{false\}>/);
  assert.match(source, /<motion\.div\s+key=\{activeView\}/);
  assert.match(source, /initial=\{\{ opacity: 0, y: shouldReduceMotion \? 0 : 4 \}\}/);
  assert.match(source, /duration: shouldReduceMotion \? 0\.08 : 0\.16/);
  assert.match(source, /duration: shouldReduceMotion \? 0\.08 : 0\.09/);

  const animatedBlock = source.match(/<AnimatePresence[\s\S]*?<\/AnimatePresence>/)?.[0] ?? "";
  assert.match(animatedBlock, /\{content\.title\}/);
  assert.match(animatedBlock, /\{content\.description\}/);
  assert.doesNotMatch(animatedBlock, /systemDate/);
  assert.doesNotMatch(animatedBlock, /Mở menu điều hướng/);
});
```

- [ ] **Step 3: Run both focused test files and verify RED**

```bash
rtk node --test src/App.structure.test.mjs src/app/AppHeader.structure.test.mjs
```

Expected: FAIL because `AnimatePresence`, `motion`, and reduced-motion-aware variants are not present.

- [ ] **Step 4: Animate the active page in `App.tsx`**

Add the Motion import and reduced-motion values:

```ts
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
```

Inside `App()` after the two existing hooks:

```ts
const shouldReduceMotion = useReducedMotion();
const pageOffset = shouldReduceMotion ? 0 : 8;
```

Keep load errors and loading feedback directly inside `<main>`. Replace only the three conditional view blocks with:

```tsx
<AnimatePresence mode="wait" initial={false}>
  <motion.div
    key={navigation.activeView}
    initial={{ opacity: 0, y: pageOffset }}
    animate={{
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.08 : 0.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }}
    exit={{
      opacity: 0,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.08 : 0.1,
        ease: "easeOut"
      }
    }}
  >
    {navigation.activeView === "events" && (
      <section id="banner-events-this-month">
        <MonthlyEvents
          events={crm.events}
          selectedMonth={crm.selectedMonth}
          currentMonth={crm.currentMonth}
          onSelectedMonthChange={crm.setSelectedMonth}
          onSelectCustomer={crm.openCustomerDetails}
          onStartNote={crm.startCustomerNote}
        />
      </section>
    )}

    {navigation.activeView === "customers" && (
      <section id="main-list-crm-panel">
        <CustomerList
          customers={crm.customers}
          onSelectCustomer={crm.openCustomerDetails}
          onEditCustomer={crm.openEditCustomerForm}
          onDeleteCustomer={crm.requestDeleteCustomer}
          searchTerm={crm.searchTerm}
          managerFilter={crm.managerFilter}
          managerOptions={crm.managerOptions}
          onSearchTermChange={crm.setSearchTerm}
          onManagerFilterChange={crm.setManagerFilter}
          onAddNewClick={crm.openAddCustomerForm}
        />
      </section>
    )}

    {navigation.activeView === "import" && (
      <CustomerImportPage
        customerImportState={crm.customerImportState}
        onImportCustomers={crm.importCustomersFromExcel}
        onViewCustomers={() => navigation.selectView("customers")}
      />
    )}
  </motion.div>
</AnimatePresence>
```

Do not move loading, error, toast, delete confirmation, or modal markup into the keyed motion container.

- [ ] **Step 5: Animate only the header copy**

In `frontend/src/app/AppHeader.tsx`, add:

```ts
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
```

Inside `AppHeader()`:

```ts
const shouldReduceMotion = useReducedMotion();
```

Replace the current title/description `<div className="min-w-0">` with:

```tsx
<div className="relative min-w-0 flex-1 overflow-hidden">
  <AnimatePresence mode="wait" initial={false}>
    <motion.div
      key={activeView}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0.08 : 0.16,
          ease: [0.22, 1, 0.36, 1]
        }
      }}
      exit={{
        opacity: 0,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0.08 : 0.09,
          ease: "easeOut"
        }
      }}
    >
      <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
        {content.title}
      </h1>
      <p className="hidden truncate text-[11px] font-medium text-slate-500 sm:block">
        {content.description}
      </p>
    </motion.div>
  </AnimatePresence>
</div>
```

The menu button and system date remain outside this block.

- [ ] **Step 6: Run focused tests and verify GREEN**

```bash
rtk node --test src/App.structure.test.mjs src/app/AppHeader.structure.test.mjs
```

Expected: all App and header structure tests PASS.

- [ ] **Step 7: Run the full frontend test suite and typecheck**

```bash
rtk npm test
rtk npm run lint
```

Expected: all tests PASS and `tsc --noEmit` exits `0`.

- [ ] **Step 8: Commit page and topbar animation**

```bash
rtk git add frontend/src/App.tsx frontend/src/App.structure.test.mjs frontend/src/app/AppHeader.tsx frontend/src/app/AppHeader.structure.test.mjs
rtk git commit -m "feat(ui): animate CRM page transitions"
```

### Task 3: Sidebar Indicator And Mobile Drawer

**Files:**
- Modify: `frontend/src/app/AppSidebar.structure.test.mjs`
- Modify: `frontend/src/app/AppSidebar.tsx`

- [ ] **Step 1: Add failing coverage for the shared active indicator**

Append this test to `frontend/src/app/AppSidebar.structure.test.mjs`:

```js
test("sidebar moves one shared active indicator between destinations", () => {
  assert.match(source, /import \{ AnimatePresence, LayoutGroup, motion, useReducedMotion \} from "motion\/react"/);
  assert.match(source, /layoutGroupId: string/);
  assert.match(source, /<LayoutGroup id=\{layoutGroupId\}>/);
  assert.match(source, /layoutId="sidebar-active-indicator"/);
  assert.match(source, /type: "spring"/);
  assert.match(source, /stiffness: 420/);
  assert.match(source, /damping: 34/);
  assert.match(source, /aria-current=\{isActive \? "page" : undefined\}/);
  assert.match(source, /layoutGroupId="desktop-sidebar"/);
  assert.match(source, /layoutGroupId="mobile-sidebar"/);
});
```

Using separate `LayoutGroup` IDs prevents the always-mounted desktop sidebar and the temporary mobile drawer from sharing projection state while preserving the same stable child `layoutId`.

- [ ] **Step 2: Add failing drawer animation coverage**

Append:

```js
test("mobile drawer and overlay animate through mount and unmount", () => {
  assert.match(source, /<AnimatePresence initial=\{false\}>/);
  assert.match(source, /key="mobile-navigation-drawer"/);
  assert.match(source, /initial="hidden"/);
  assert.match(source, /animate="visible"/);
  assert.match(source, /exit="exit"/);
  assert.match(source, /const drawerOffset = shouldReduceMotion \? 0 : "-100%"/);
  assert.match(source, /const overlayDuration = shouldReduceMotion \? 0\.08 : 0\.16/);
  assert.match(source, /const drawerDuration = shouldReduceMotion \? 0\.08 : 0\.22/);
  assert.match(source, /<motion\.button/);
  assert.match(source, /<motion\.aside/);
  assert.match(source, /aria-label="Đóng menu điều hướng"/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
});
```

- [ ] **Step 3: Run the focused test and verify RED**

```bash
rtk node --test src/app/AppSidebar.structure.test.mjs
```

Expected: FAIL because the sidebar still uses static background classes and the drawer unmounts immediately.

- [ ] **Step 4: Add the shared sidebar indicator**

Import Motion:

```ts
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
```

Extend `SidebarContentProps`:

```ts
interface SidebarContentProps {
  activeView: AppView;
  layoutGroupId: string;
  onSelectView: (view: AppView) => void;
  onClose?: () => void;
}
```

Inside `SidebarContent`, add:

```ts
const shouldReduceMotion = useReducedMotion();
```

Wrap the navigation in:

```tsx
<LayoutGroup id={layoutGroupId}>
  <nav className="flex-1 space-y-2 px-3 py-5" aria-label="Điều hướng CRM">
    {navigationItems.map(({ icon: Icon, label, view }) => {
      const isActive = activeView === view;

      return (
        <button
          key={view}
          type="button"
          onClick={() => onSelectView(view)}
          aria-current={isActive ? "page" : undefined}
          className={`relative isolate flex w-full items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3 text-left text-sm font-bold transition-colors ${
            isActive ? "text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          }`}
        >
          {isActive && (
            <motion.span
              layoutId="sidebar-active-indicator"
              className="absolute inset-0 z-0 rounded-xl bg-[#B01137] shadow-md shadow-rose-900/15"
              transition={
                shouldReduceMotion
                  ? { duration: 0.08 }
                  : { type: "spring", stiffness: 420, damping: 34 }
              }
            />
          )}
          <span
            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
              isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="relative z-10">{label}</span>
        </button>
      );
    })}
  </nav>
</LayoutGroup>
```

Pass isolated groups at both call sites:

```tsx
<SidebarContent
  activeView={activeView}
  layoutGroupId="desktop-sidebar"
  onSelectView={onSelectView}
/>
```

```tsx
<SidebarContent
  activeView={activeView}
  layoutGroupId="mobile-sidebar"
  onSelectView={onSelectView}
  onClose={onClose}
/>
```

- [ ] **Step 5: Animate the mobile drawer and overlay**

Inside `AppSidebar`, add:

```ts
const shouldReduceMotion = useReducedMotion();
const drawerOffset = shouldReduceMotion ? 0 : "-100%";
const overlayDuration = shouldReduceMotion ? 0.08 : 0.16;
const drawerDuration = shouldReduceMotion ? 0.08 : 0.22;
```

Replace the current `{isDrawerOpen && (...)}` block with:

```tsx
<AnimatePresence initial={false}>
  {isDrawerOpen && (
    <motion.div
      key="mobile-navigation-drawer"
      className="fixed inset-0 z-50 lg:hidden"
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Đóng menu điều hướng"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: overlayDuration } },
          exit: { opacity: 0, transition: { duration: overlayDuration } }
        }}
      />
      <motion.aside
        className="relative flex h-full w-[min(82vw,288px)] flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
        variants={{
          hidden: { x: drawerOffset, opacity: shouldReduceMotion ? 0 : 1 },
          visible: {
            x: 0,
            opacity: 1,
            transition: {
              duration: drawerDuration,
              ease: [0.22, 1, 0.36, 1]
            }
          },
          exit: {
            x: drawerOffset,
            opacity: shouldReduceMotion ? 0 : 1,
            transition: {
              duration: drawerDuration,
              ease: "easeOut"
            }
          }
        }}
      >
        <SidebarContent
          activeView={activeView}
          layoutGroupId="mobile-sidebar"
          onSelectView={onSelectView}
          onClose={onClose}
        />
      </motion.aside>
    </motion.div>
  )}
</AnimatePresence>
```

The direct child of `AnimatePresence` has `exit="exit"`, allowing both descendant variants to finish before the drawer subtree unmounts.

- [ ] **Step 6: Run the focused test and verify GREEN**

```bash
rtk node --test src/app/AppSidebar.structure.test.mjs
```

Expected: all sidebar structure tests PASS.

- [ ] **Step 7: Run full tests, typecheck, and build**

```bash
rtk npm test
rtk npm run lint
rtk npm run build
```

Expected: all frontend tests PASS, TypeScript exits `0`, and Vite finishes with `built in`.

- [ ] **Step 8: Commit sidebar and drawer animation**

```bash
rtk git add frontend/src/app/AppSidebar.tsx frontend/src/app/AppSidebar.structure.test.mjs
rtk git commit -m "feat(ui): animate CRM sidebar navigation"
```

### Task 4: Final Regression And Runtime Verification

**Files:**
- Verify only; no planned production changes.

- [ ] **Step 1: Run all automated gates from a clean command invocation**

From `frontend/`:

```bash
rtk npm test
rtk npm run lint
rtk npm run build
```

Expected:

- Node test runner reports zero failures.
- `tsc --noEmit` exits `0`.
- Vite production build exits `0`.

- [ ] **Step 2: Verify repository hygiene**

From the repository root:

```bash
rtk git diff --check
rtk git status --short --branch
```

Expected: no whitespace errors; only intentional committed work is present.

- [ ] **Step 3: Smoke-test the production bundle**

Start preview from `frontend/`:

```bash
rtk npm run preview -- --host 127.0.0.1 --port 4173
```

In another terminal:

```bash
rtk curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4173/
```

Expected: `200`. Stop the preview process after the check.

- [ ] **Step 4: Perform visual acceptance**

Open the running frontend and verify:

1. `Sự kiện -> Khách hàng -> Import khách hàng` uses the approved fade plus `8px` rise without horizontal movement.
2. Topbar copy changes softly while the menu button and date stay fixed.
3. The red sidebar indicator moves between destinations without flashing.
4. Mobile drawer slides in and out; overlay, close button, Escape, and destination selection still close it.
5. Every destination switch returns the document to the top.
6. With operating-system reduced motion enabled, positional movement disappears and navigation still works.

- [ ] **Step 5: Review the complete branch diff**

```bash
rtk git diff 08b98cf..HEAD -- frontend/src/App.tsx frontend/src/app/AppHeader.tsx frontend/src/app/AppSidebar.tsx frontend/src/app/useAppNavigation.ts
rtk git log --oneline --decorate 08b98cf..HEAD
```

Expected: changes are limited to the approved animation behavior, its tests, design spec, and implementation plan.
