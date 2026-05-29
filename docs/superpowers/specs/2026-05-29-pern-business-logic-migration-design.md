# PERN Business Logic Migration Design

Date: 2026-05-29
Status: Draft for user review

## Goal

Move the CRM business logic currently implemented in the React frontend into a PERN backend:

- PostgreSQL stores CRM data.
- Express/Node TypeScript exposes the domain API.
- React calls API endpoints and renders the existing UI.
- No authentication or role-based permission system is included in this phase.

This keeps the current product behavior while replacing `localStorage` and frontend-only domain rules with backend-owned rules.

## Current State

The app is currently a Vite/React frontend with an empty `backend/` directory.

Frontend-owned business logic today includes:

- Loading and saving customers in `localStorage` under `crm_customers`.
- Creating, updating, and deleting customers in `App.tsx`.
- Creating and deleting interactions and notes in `App.tsx`.
- Generating timestamp-based IDs in the browser.
- Validating customer form data and duplicate customer codes in `CustomerForm.tsx`.
- Searching and filtering customers in `CustomerList.tsx`.
- Calculating monthly founding and VIP birthday events in `utils.ts`.
- Calculating simple dashboard stats in `App.tsx`.

## Scope

Included:

- Add a TypeScript Express backend under `backend/`.
- Add PostgreSQL schema and migrations.
- Move customer CRUD, validation, search/filter, event calculation, stats, interactions, and notes logic to backend services.
- Add API client code in frontend.
- Replace `localStorage` data persistence with API calls.
- Preserve the current UI layout and visible workflows.
- Add customer management officer field directly on the customer record.

Not included:

- Authentication.
- Role-based access control.
- A separate staff/officer table.
- Import/export.
- Audit logs.
- Multi-tenant data separation.
- Redesigning the UI.

## Data Model

### customers

Stores one CRM customer or organization.

- `id uuid primary key`
- `ma_kh text not null unique`
- `ten_kh text not null`
- `ngay_thanh_lap date not null`
- `can_bo_quan_ly text not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

`can_bo_quan_ly` is a plain text field. The system does not validate it against a staff table in this phase.

### vips

Stores exactly two VIP contacts for each customer.

- `id uuid primary key`
- `customer_id uuid not null references customers(id) on delete cascade`
- `position smallint not null`
- `ho_ten text not null`
- `chuc_vu text not null`
- `ngay_sinh date not null`
- `so_dien_thoai text not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Rules:

- `position` must be `1` or `2`.
- `(customer_id, position)` is unique.
- A customer create/update request must contain exactly two VIPs.
- `chuc_vu` accepts the existing values: `Giám đốc`, `Hiệu trưởng`, `Kế toán trưởng`.

### interactions

Stores customer care activity history.

- `id uuid primary key`
- `customer_id uuid not null references customers(id) on delete cascade`
- `ngay_thang date not null`
- `loai_hinh text not null`
- `chi_tiet text not null`
- `created_at timestamptz not null default now()`

Rules:

- `loai_hinh` accepts the existing values: `Call`, `Meeting`, `Email`, `Gift`, `Other`.
- Newest interactions are returned first.

### notes

Stores internal customer notes.

- `id uuid primary key`
- `customer_id uuid not null references customers(id) on delete cascade`
- `ngay_tao date not null default current_date`
- `noi_dung text not null`
- `created_at timestamptz not null default now()`

Newest notes are returned first.

## API Design

All API responses use camelCase fields to match the frontend TypeScript types.

### Customers

`GET /api/customers?search=&role=`

- Returns customers with their two VIPs and summary counts.
- `search` matches `maKH`, `tenKH`, `canBoQuanLy`, and VIP names.
- `role` filters customers that have a VIP with that role.
- Sorting defaults to `maKH` ascending.

`GET /api/customers/:id`

- Returns one customer with VIPs, interactions, and notes.
- Returns `404` if the customer does not exist.

`POST /api/customers`

- Creates a customer and exactly two VIPs in one transaction.
- Validates required fields and duplicate `maKH`.
- Trims string fields.
- Uppercases `maKH`.

`PUT /api/customers/:id`

- Updates customer fields and replaces the two VIP profiles by position in one transaction.
- Preserves existing interactions and notes.
- Validates duplicate `maKH` excluding the current customer.

`DELETE /api/customers/:id`

- Deletes the customer and cascades VIPs, interactions, and notes.
- Returns `404` if the customer does not exist.

### Interactions

`POST /api/customers/:id/interactions`

- Creates one interaction for the customer.
- Used by both manual interaction entry and quick interaction from monthly events.

`DELETE /api/customers/:id/interactions/:interactionId`

- Deletes one interaction belonging to the customer.

### Notes

`POST /api/customers/:id/notes`

- Creates one internal note for the customer.
- Backend sets `ngayTao` to the current server date.

`DELETE /api/customers/:id/notes/:noteId`

- Deletes one note belonging to the customer.

### Events And Stats

`GET /api/events?month=5`

- Returns founding anniversaries and VIP birthdays for the requested month.
- Computes `daysRemaining`, `isToday`, and `age` on the backend using the server date.
- Sorts events by day of month ascending.

`GET /api/stats`

- Returns:
  - `totalCustomers`
  - `monthEventsCount` for the current server month
  - `totalInteractions`

## Backend Structure

Recommended structure:

```text
backend/
  package.json
  tsconfig.json
  src/
    app.ts
    server.ts
    db/
      pool.ts
      migrations/
      seed.ts
    customers/
      customers.routes.ts
      customers.controller.ts
      customers.service.ts
      customers.repository.ts
      customers.validation.ts
    events/
      events.routes.ts
      events.service.ts
    stats/
      stats.routes.ts
      stats.service.ts
    shared/
      errors.ts
      http.ts
      date.ts
      types.ts
```

Service files own business rules. Controller files translate HTTP input/output. Repository files own SQL.

## Frontend Changes

### Types

Update `KhachHang` to include:

- `canBoQuanLy: string`

Keep frontend field names in Vietnamese camelCase so component changes stay small.

### API Client

Add a small API layer, for example:

- `src/api/client.ts`
- `src/api/customersApi.ts`
- `src/api/eventsApi.ts`
- `src/api/statsApi.ts`

The frontend reads `VITE_API_URL`, falling back to same-origin `/api`.

### App State

`App.tsx` stops reading/writing `localStorage`.

It will:

- Fetch initial customers, events, and stats from API.
- Refresh the relevant data after create/update/delete actions.
- Keep only UI state locally: selected customer, open form, toast, loading, and error state.

### Customer Form

Add a required input labeled `Cán bộ quản lý`.

Frontend keeps lightweight required-field checks for immediate feedback, but backend remains the source of truth for validation.

### Customer List

Customer search and role filter move to API query parameters.

The list displays `canBoQuanLy` in both desktop table and mobile card views.

### Monthly Events

`MonthlyEvents` no longer calculates events from `customers`. It receives events from the API for the selected month.

Changing month calls `GET /api/events?month=<month>`.

## Error Handling

Backend errors return a consistent JSON shape:

```json
{
  "message": "Mã khách hàng đã tồn tại trên hệ thống.",
  "field": "maKH"
}
```

`field` is optional. Frontend shows form-level errors for validation failures and toast errors for action failures.

Expected errors:

- `400` for invalid required fields, invalid role, invalid interaction type, missing two VIPs, invalid month.
- `404` for customer, interaction, or note not found.
- `409` for duplicate `maKH`.
- `500` for unexpected backend errors.

## Data Seeding And Migration

The existing `frontend/src/initialData.ts` data should be copied into a backend seed script so local development starts with the same demo customers.

After the backend is connected, `initialData.ts` should no longer be used as runtime persistence. It may remain only as a temporary reference during migration, then can be removed if no component imports it.

## Testing

Backend tests should cover:

- Customer create with exactly two VIPs.
- Customer create rejects duplicate `maKH`.
- Customer create/update trims strings and uppercases `maKH`.
- Customer update preserves interactions and notes.
- Customer delete cascades related rows.
- Search matches customer code, customer name, management officer, and VIP name.
- Role filter returns customers with matching VIP role.
- Monthly events include founding anniversaries and VIP birthdays.
- Monthly events compute `age`, `daysRemaining`, and `isToday`.
- Add/delete interaction.
- Add/delete note.

Frontend verification should cover:

- TypeScript check.
- Production build.
- Manual smoke test for list, create, edit, delete, notes, interactions, monthly events, and search/filter.

## Implementation Order

1. Scaffold backend TypeScript/Express/PostgreSQL configuration.
2. Add database schema, migration, and seed data.
3. Implement customer repository/service/controller/routes with tests.
4. Implement interactions and notes endpoints with tests.
5. Implement events and stats endpoints with tests.
6. Add frontend API client and environment configuration.
7. Replace `localStorage` usage in `App.tsx`.
8. Add `canBoQuanLy` to frontend types, form, list, and API payloads.
9. Switch search/filter and monthly events to backend APIs.
10. Run backend tests, frontend typecheck, frontend build, and a smoke test.

## Open Decisions

No open decisions remain for this phase.
