# Customer List Pagination Design

Date: 2026-06-11
Status: Approved

## Goal

Remove the repeated pause when opening the customer route by limiting how many customer rows and cards React mounts at once.

The current API already loads customers when the application shell starts. Opening `/customers` does not trigger another customer request. The expensive work is mounting the complete responsive list: every customer is rendered once as a desktop table row and again as a mobile card, even though CSS hides one layout.

## Pagination Behavior

- Keep client-side filtering over the complete loaded customer collection.
- Render 25 filtered customers per page.
- Keep the current page in `useCrmDashboard` so route changes do not reset it.
- Reset to page 1 when the search term or manager filter changes.
- Clamp the current page when filtering, deletion, import, or refresh reduces the available page count.
- Do not add pagination state to the URL or change backend endpoints.

## Controls

- Show the current range and total, for example `Đang hiển thị 1-25 / 284 khách hàng`.
- Show `Trước`, `Sau`, the first and last page, up to five nearby pages, and ellipses where pages are omitted.
- Hide the controls when there is only one page.
- Mark the active page with `aria-current="page"` and the existing CRM red color.
- Disable boundary controls on the first and last pages.
- Scroll the customer panel to its top after a page change; use automatic scrolling for reduced-motion users and smooth scrolling otherwise.

## Architecture

- Add a pure pagination module for page counting, clamping, slicing, range calculation, and pagination item generation.
- Keep pagination state and reset/clamp behavior in `useCrmDashboard`.
- Pass `currentPage` and `onPageChange` through `App.tsx`.
- Keep `CustomerList` responsible for rendering the paginated records and controls.

Virtualization, server pagination, responsive DOM splitting, API changes, and route-transition changes are outside this iteration.

## Verification

- Unit-test page counts, boundaries, slicing, empty collections, and ellipses.
- Add structure coverage for persistent dashboard state, reset/clamp behavior, paginated rendering, controls, accessibility, and reduced-motion scrolling.
- Run the full frontend test suite, TypeScript validation, production build, render benchmark, and `git diff --check`.
