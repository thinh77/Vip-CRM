# Smooth Page Transitions Design

Date: 2026-06-10  
Status: Approved

## Goal

Make switching between `Sự kiện`, `Khách hàng`, and `Import khách hàng` feel continuous instead of instantly unmounting one view and mounting another.

The sidebar, topbar, and page content behave as one coordinated application shell. The change does not alter routing, CRM data loading, or the behavior inside each page.

## Current State

`App.tsx` conditionally renders one of three views from the `activeView` state in `useAppNavigation`.

Current transitions are abrupt because:

- The old page disappears and the new page appears in the same render.
- The topbar title changes immediately.
- The sidebar active state switches between static background classes.
- The mobile drawer mounts and unmounts without an enter or exit transition.

The frontend already depends on `motion`, so this design uses `motion/react` without adding another package.

## Motion Direction

Use the approved option A: a short fade combined with a small upward entrance.

### Page Content

- Wrap the active page in `AnimatePresence` with `mode="wait"`.
- Key the animated container by `activeView`.
- Exit: opacity `1 -> 0`, duration `100ms`.
- Enter: opacity `0 -> 1` and vertical position `8px -> 0`, duration `200ms`.
- Use `[0.22, 1, 0.36, 1]` for entrance easing and `"easeOut"` for exit easing.
- Keep the content container width stable and do not animate its height.

Only the active CRM page is animated. Loading messages, load errors, toasts, confirmation UI, and customer modals remain outside the page transition.

### Topbar

- Animate the title and description as one keyed block.
- Exit with a `90ms` fade.
- Enter with opacity and a `4px` upward movement over `160ms`.
- Keep the mobile menu button and system date stationary.

### Sidebar Active Indicator

- Replace the active item's static red background with one shared motion background using a stable `layoutId`.
- The red indicator moves between items with a spring using stiffness `420` and damping `34`.
- Icons and labels remain above the shared background and change foreground colors with normal CSS transitions.
- Preserve `aria-current="page"` on the active navigation button.

### Mobile Drawer

- Keep the drawer under `AnimatePresence` so exit animation can finish before unmount.
- Overlay fades in and out over `160ms`.
- Drawer enters from the left and exits to the left over `220ms`.
- Existing close interactions remain unchanged: destination selection, close button, overlay click, and Escape.

## Navigation Behavior

`useAppNavigation.selectView(view)` remains the single entry point for switching pages.

- Ignore a request that selects the already active view, except that an open mobile drawer still closes.
- Close the mobile drawer on every destination selection.
- Set the new active view immediately so the coordinated exit/enter animation begins.
- On the next animation frame, call `window.scrollTo({ top: 0, behavior: "smooth" })`.
- Rapid selections must converge on the latest selected view. Intermediate views must not remain visible or leave stale animation state.
- Do not add URL routing, history behavior, or persisted view state.

## Reduced Motion

Respect the operating system's `prefers-reduced-motion` setting through Motion's reduced-motion support.

When reduced motion is enabled:

- Remove positional movement, springs, and drawer sliding.
- Use opacity-only transitions of `80ms`; set all positional offsets to `0`.
- Scroll to the top with `behavior: "auto"` instead of smooth scrolling.
- Preserve all navigation and accessibility behavior.

## Component Boundaries

- `App.tsx` owns the keyed animated page container but remains a composition shell.
- `AppHeader.tsx` owns its title/description transition.
- `AppSidebar.tsx` owns the shared active indicator and mobile drawer transition.
- `useAppNavigation.ts` owns destination selection, drawer state, duplicate-selection handling, and scroll-to-top behavior.
- Existing page components remain unchanged unless a wrapper prop is needed for animation composition.

## Testing

Add focused regression coverage for:

- `App.tsx` uses `AnimatePresence mode="wait"` and keys page content by `activeView`.
- Page animation uses the approved opacity and `8px` entrance behavior.
- Topbar title and description are keyed and animated while menu/date remain stationary.
- Sidebar uses one shared `layoutId` active background and preserves `aria-current`.
- Mobile overlay and drawer define enter and exit animation states.
- Selecting a new view closes the drawer and scrolls to the top.
- Selecting the active view does not restart the page transition.
- Reduced-motion users receive no positional movement and non-smooth scrolling.
- Existing CRM view wiring, import behavior, and accessibility labels remain intact.

Run the complete frontend test suite, TypeScript typecheck, production build, and `git diff --check`.

## Out Of Scope

- React Router or URL-based navigation.
- Keeping a separate scroll position for each view.
- Animating tables, event cards, import progress, modals, toasts, or loading states.
- Skeleton screens or changes to API loading.
- Visual redesign of the approved sidebar or page layouts.
