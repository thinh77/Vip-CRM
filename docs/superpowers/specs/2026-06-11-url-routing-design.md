# URL-Based CRM Navigation Design

Date: 2026-06-11
Status: Approved

## Goal

Replace state-driven switching between the CRM pages with URL-based navigation while preserving the current application shell, data state, modals, and Motion transitions.

## Routes

- `/events` renders the monthly care-events page.
- `/customers` renders the customer list.
- `/customers/import` renders the Excel import page.
- `/` redirects to `/events` with history replacement.
- Unknown frontend paths redirect to `/events` with history replacement.

The route path is the source of truth. The app must not keep a duplicate active-page state.

## Architecture

- Wrap the app in `BrowserRouter` at the React entry point.
- Keep `useCrmDashboard()` in `App.tsx` so route changes do not recreate CRM data, filters, mutation state, toasts, or modals.
- Keep route metadata and pathname-to-view mapping in one app-level module.
- Render the three pages with declarative `Routes` and `Route` components.
- Derive header content and animation keys from the current location.
- Keep `useAppNavigation` focused on the mobile drawer, Escape handling, closing after navigation, and scroll-to-top behavior.

Customer details, add/edit forms, search filters, and API mutation flows remain state-driven and are outside this change.

## Navigation Behavior

- Sidebar destinations use `NavLink` so browser history, deep links, and active state share one mechanism.
- `/customers` uses exact matching so it is not active at `/customers/import`.
- Selecting any mobile destination closes the drawer, including the current destination.
- Browser back and forward update the active item, header, and page content.
- A pathname change scrolls to the top on the next animation frame.
- The initial load does not force a scroll.
- Reduced-motion users receive automatic rather than smooth scrolling.
- The import success action uses a normal router link to `/customers`.

## Transitions

Preserve the approved Motion behavior:

- Page content remains under `AnimatePresence mode="wait"`.
- The animated page container is keyed by `location.pathname`.
- Header copy continues to animate from the route-derived `AppView`.
- Sidebar shared active-indicator and mobile-drawer animations remain unchanged.

## Deployment

Development and Vite preview support client-side routing. Production hosting must serve `index.html` for `/events`, `/customers`, `/customers/import`, and unknown frontend paths. Requests under `/api/*` must continue to reach the backend and must not be rewritten to the frontend.

## Verification

- Add focused tests for route metadata and pathname mapping.
- Update structure tests for `BrowserRouter`, declarative routes, redirects, `NavLink`, and route-based transitions.
- Verify no `activeView` state or `selectView` page-switching callback remains.
- Run the complete frontend tests, TypeScript validation, production build, direct-path preview smoke checks, browser navigation checks, and `git diff --check`.
