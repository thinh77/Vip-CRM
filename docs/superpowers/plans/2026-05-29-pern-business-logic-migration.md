# PERN Business Logic Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Vip-CRM persistence and domain rules from React/localStorage into a TypeScript Express + PostgreSQL backend, including the `canBoQuanLy` customer field.

**Architecture:** The backend owns validation, ID generation, SQL transactions, search/filter, monthly event calculation, and stats. React keeps UI state only and talks to `/api` through a small typed client. PostgreSQL schema is managed with plain SQL migrations executed by a lightweight Node script using `pg`.

**Tech Stack:** React 19, Vite 6, TypeScript, Express 4, node-postgres (`pg`), PostgreSQL, Node built-in test runner, `tsx`.

---

## Spec

Approved spec: `docs/superpowers/specs/2026-05-29-pern-business-logic-migration-design.md`

## File Structure

Create or modify these files:

- Create `backend/package.json`: backend scripts and dependencies.
- Create `backend/tsconfig.json`: TypeScript config for backend.
- Create `backend/.env.example`: database and server env template.
- Create `backend/src/app.ts`: Express app wiring.
- Create `backend/src/server.ts`: HTTP server entrypoint.
- Create `backend/src/app.test.ts`: health route test.
- Create `backend/src/db/pool.ts`: PostgreSQL pool creation.
- Create `backend/src/db/migrate.ts`: plain SQL migration runner.
- Create `backend/src/db/seed.ts`: development seed data.
- Create `backend/src/db/migrations/001_initial_schema.sql`: schema.
- Create `backend/src/shared/types.ts`: domain/API TypeScript types.
- Create `backend/src/shared/errors.ts`: HTTP/domain errors.
- Create `backend/src/shared/http.ts`: async route wrapper and error middleware.
- Create `backend/src/shared/date.ts`: ISO date and event date helpers.
- Create `backend/src/shared/date.test.ts`: date helper tests.
- Create `backend/src/customers/customers.validation.ts`: request validation and normalization.
- Create `backend/src/customers/customers.validation.test.ts`: validation tests.
- Create `backend/src/customers/customers.repository.ts`: customer SQL access.
- Create `backend/src/customers/customers.service.ts`: customer business operations.
- Create `backend/src/customers/customers.routes.ts`: customer, interaction, note routes.
- Create `backend/src/customers/customers.service.test.ts`: service tests using a fake repository boundary.
- Create `backend/src/events/events.service.ts`: monthly event business logic.
- Create `backend/src/events/events.routes.ts`: event route.
- Create `backend/src/events/events.service.test.ts`: event tests.
- Create `backend/src/stats/stats.service.ts`: stats business logic.
- Create `backend/src/stats/stats.routes.ts`: stats route.
- Modify `frontend/.env.example`: add `VITE_API_URL`.
- Modify `frontend/vite.config.ts`: add dev proxy to backend.
- Modify `frontend/src/types.ts`: add `canBoQuanLy`, API event/stat types.
- Modify `frontend/src/initialData.ts`: add `canBoQuanLy` to demo records while migration is in progress.
- Create `frontend/src/api/client.ts`: typed fetch wrapper.
- Create `frontend/src/api/customersApi.ts`: customer API calls.
- Create `frontend/src/api/eventsApi.ts`: event API calls.
- Create `frontend/src/api/statsApi.ts`: stats API calls.
- Modify `frontend/src/App.tsx`: replace localStorage with API state.
- Modify `frontend/src/components/CustomerForm.tsx`: add required `Cán bộ quản lý` input.
- Modify `frontend/src/components/CustomerList.tsx`: move search/filter to parent/API and display `canBoQuanLy`.
- Modify `frontend/src/components/MonthlyEvents.tsx`: consume API events instead of computing from `customers`.
- Modify `frontend/src/utils.ts`: keep formatting helpers, remove backend-owned event logic imports from UI.

## Task 1: Backend Scaffold And Health Route

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env.example`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `backend/src/shared/errors.ts`
- Create: `backend/src/shared/http.ts`
- Test: `backend/src/app.test.ts`

- [ ] **Step 1: Write the failing health test**

Create `backend/src/app.test.ts`:

```ts
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import { app } from "./app";

let server: Server;
let baseUrl = "";

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      assert.equal(typeof address, "object");
      assert.ok(address);
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("GET /api/health returns ok", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});
```

- [ ] **Step 2: Add backend package and config**

Create `backend/package.json`:

```json
{
  "name": "vip-crm-backend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "node dist/server.js",
    "build": "tsc -p tsconfig.json",
    "test": "node --import tsx --test \"src/**/*.test.ts\"",
    "migrate": "tsx src/db/migrate.ts",
    "seed": "tsx src/db/seed.ts",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "pg": "^8.13.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/pg": "^8.11.10",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2"
  }
}
```

Create `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

Create `backend/.env.example`:

```bash
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/vip_crm
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/vip_crm_test
CORS_ORIGIN=http://localhost:3000
```

- [ ] **Step 3: Implement Express app and shared HTTP helpers**

Create `backend/src/shared/errors.ts`:

```ts
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly field?: string
  ) {
    super(message);
  }
}

export function badRequest(message: string, field?: string): HttpError {
  return new HttpError(400, message, field);
}

export function notFound(message: string): HttpError {
  return new HttpError(404, message);
}

export function conflict(message: string, field?: string): HttpError {
  return new HttpError(409, message, field);
}
```

Create `backend/src/shared/http.ts`:

```ts
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpError } from "./errors.js";

export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({
      message: error.message,
      ...(error.field ? { field: error.field } : {})
    });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Lỗi hệ thống không xác định." });
}
```

Create `backend/src/app.ts`:

```ts
import cors from "cors";
import express from "express";
import { errorMiddleware } from "./shared/http.js";

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(errorMiddleware);
```

Create `backend/src/server.ts`:

```ts
import "dotenv/config";
import { app } from "./app.js";

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`Vip-CRM backend listening on http://localhost:${port}`);
});
```

- [ ] **Step 4: Install dependencies and verify**

Run:

```bash
cd backend
npm install
npm test
npm run lint
```

Expected:

```text
test app.test.ts
ok 1 - GET /api/health returns ok
```

- [ ] **Step 5: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/tsconfig.json backend/.env.example backend/src
git commit -m "feat: scaffold Vip-CRM backend"
```

## Task 2: Database Pool, Migration Runner, Schema, And Seed

**Files:**
- Create: `backend/src/db/pool.ts`
- Create: `backend/src/db/migrate.ts`
- Create: `backend/src/db/migrations/001_initial_schema.sql`
- Create: `backend/src/db/seed.ts`
- Test: `backend/src/db/migrate.test.ts`

- [ ] **Step 1: Write migration smoke test**

Create `backend/src/db/migrate.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("initial migration defines required tables and canBoQuanLy column", () => {
  const sql = readFileSync(
    join(__dirname, "migrations", "001_initial_schema.sql"),
    "utf8"
  );

  assert.match(sql, /create table if not exists customers/i);
  assert.match(sql, /can_bo_quan_ly text not null/i);
  assert.match(sql, /create table if not exists vips/i);
  assert.match(sql, /create table if not exists interactions/i);
  assert.match(sql, /create table if not exists notes/i);
});
```

- [ ] **Step 2: Add pool and migration runner**

Create `backend/src/db/pool.ts`:

```ts
import "dotenv/config";
import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

export function createPool(connectionString: string): pg.Pool {
  return new pg.Pool({ connectionString });
}
```

Create `backend/src/db/migrate.ts`:

```ts
import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type pg from "pg";
import { pool } from "./pool.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "migrations");

export async function runMigrations(db: pg.Pool): Promise<void> {
  await db.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const alreadyApplied = await db.query(
      "select 1 from schema_migrations where filename = $1",
      [file]
    );
    if (alreadyApplied.rowCount) continue;

    const sql = await readFile(join(migrationsDir, file), "utf8");
    const client = await db.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into schema_migrations(filename) values ($1)", [file]);
      await client.query("commit");
      console.log(`Applied migration ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await runMigrations(pool);
  await pool.end();
}
```

- [ ] **Step 3: Add schema migration**

Create `backend/src/db/migrations/001_initial_schema.sql`:

```sql
create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  ma_kh text not null unique,
  ten_kh text not null,
  ngay_thanh_lap date not null,
  can_bo_quan_ly text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vips (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  position smallint not null check (position in (1, 2)),
  ho_ten text not null,
  chuc_vu text not null check (chuc_vu in ('Giám đốc', 'Hiệu trưởng', 'Kế toán trưởng')),
  ngay_sinh date not null,
  so_dien_thoai text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, position)
);

create table if not exists interactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  ngay_thang date not null,
  loai_hinh text not null check (loai_hinh in ('Call', 'Meeting', 'Email', 'Gift', 'Other')),
  chi_tiet text not null,
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  ngay_tao date not null default current_date,
  noi_dung text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_customers_ma_kh on customers(ma_kh);
create index if not exists idx_customers_ten_kh on customers(ten_kh);
create index if not exists idx_customers_can_bo_quan_ly on customers(can_bo_quan_ly);
create index if not exists idx_vips_customer_id on vips(customer_id);
create index if not exists idx_vips_ho_ten on vips(ho_ten);
create index if not exists idx_interactions_customer_id on interactions(customer_id);
create index if not exists idx_notes_customer_id on notes(customer_id);
```

- [ ] **Step 4: Add deterministic seed script**

Create `backend/src/db/seed.ts`:

```ts
import "dotenv/config";
import { pool } from "./pool.js";

type SeedCustomer = {
  maKH: string;
  tenKH: string;
  ngayThanhLap: string;
  canBoQuanLy: string;
  vips: Array<{
    position: 1 | 2;
    hoTen: string;
    chucVu: string;
    ngaySinh: string;
    soDienThoai: string;
  }>;
  interactions: Array<{
    ngayThang: string;
    loaiHinh: string;
    chiTiet: string;
  }>;
  notes: Array<{
    ngayTao: string;
    noiDung: string;
  }>;
};

const seedCustomers: SeedCustomer[] = [
  {
    maKH: "KH201",
    tenKH: "Công ty TNHH Giải pháp Công nghệ Việt",
    ngayThanhLap: "2018-05-12",
    canBoQuanLy: "Nguyễn Minh Anh",
    vips: [
      { position: 1, hoTen: "Trần Huy Hoàng", chucVu: "Giám đốc", ngaySinh: "1985-08-15", soDienThoai: "0912345678" },
      { position: 2, hoTen: "Phạm Thùy Chi", chucVu: "Kế toán trưởng", ngaySinh: "1990-05-25", soDienThoai: "0987654321" }
    ],
    interactions: [
      { ngayThang: "2026-05-12", loaiHinh: "Gift", chiTiet: "Gửi lẵng hoa chúc mừng kỷ niệm 8 năm ngày thành lập công ty." },
      { ngayThang: "2026-04-10", loaiHinh: "Meeting", chiTiet: "Gặp mặt đàm phán gia hạn hợp đồng dịch vụ phần mềm năm 2026. Khách hàng rất hài lòng." }
    ],
    notes: [
      { ngayTao: "2026-01-15", noiDung: "Thích tặng trà mạn mộc và ghét phong cách gói quà quá sặc sỡ." }
    ]
  },
  {
    maKH: "KH306",
    tenKH: "Trường Tiểu học Chu Văn An",
    ngayThanhLap: "2010-09-05",
    canBoQuanLy: "Trần Quốc Bảo",
    vips: [
      { position: 1, hoTen: "Lê Thị Thanh Vân", chucVu: "Hiệu trưởng", ngaySinh: "1978-05-04", soDienThoai: "0905112233" },
      { position: 2, hoTen: "Trần Thanh Sơn", chucVu: "Kế toán trưởng", ngaySinh: "1982-11-20", soDienThoai: "0935445566" }
    ],
    interactions: [
      { ngayThang: "2026-05-04", loaiHinh: "Call", chiTiet: "Gọi điện chúc mừng sinh nhật Hiệu trưởng Thanh Vân. Chị Vân gửi lời cảm ơn hệ thống." }
    ],
    notes: [
      { ngayTao: "2025-11-01", noiDung: "Ưu tiên hỗ trợ kỹ thuật nhanh vào dịp chuẩn bị khai giảng (tháng 8, tháng 9)." }
    ]
  }
];

async function seed(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    for (const customer of seedCustomers) {
      const inserted = await client.query<{ id: string }>(
        `insert into customers(ma_kh, ten_kh, ngay_thanh_lap, can_bo_quan_ly)
         values ($1, $2, $3, $4)
         on conflict (ma_kh) do update
         set ten_kh = excluded.ten_kh,
             ngay_thanh_lap = excluded.ngay_thanh_lap,
             can_bo_quan_ly = excluded.can_bo_quan_ly,
             updated_at = now()
         returning id`,
        [customer.maKH, customer.tenKH, customer.ngayThanhLap, customer.canBoQuanLy]
      );
      const customerId = inserted.rows[0].id;

      await client.query("delete from vips where customer_id = $1", [customerId]);
      for (const vip of customer.vips) {
        await client.query(
          `insert into vips(customer_id, position, ho_ten, chuc_vu, ngay_sinh, so_dien_thoai)
           values ($1, $2, $3, $4, $5, $6)`,
          [customerId, vip.position, vip.hoTen, vip.chucVu, vip.ngaySinh, vip.soDienThoai]
        );
      }
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

await seed();
await pool.end();
console.log("Seed data inserted.");
```

- [ ] **Step 5: Verify migration test and typecheck**

Run:

```bash
cd backend
npm test
npm run lint
```

Expected:

```text
ok 1 - initial migration defines required tables and canBoQuanLy column
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/db
git commit -m "feat: add PostgreSQL schema and seed"
```

## Task 3: Shared Domain Types, Date Helpers, And Validation

**Files:**
- Create: `backend/src/shared/types.ts`
- Create: `backend/src/shared/date.ts`
- Test: `backend/src/shared/date.test.ts`
- Create: `backend/src/customers/customers.validation.ts`
- Test: `backend/src/customers/customers.validation.test.ts`

- [ ] **Step 1: Write date helper tests**

Create `backend/src/shared/date.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateCalendarEvent } from "./date.js";

test("calculateCalendarEvent computes same-month upcoming event", () => {
  const result = calculateCalendarEvent("1990-05-25", 5, new Date("2026-05-20T08:00:00+07:00"));
  assert.deepEqual(result, {
    originalYear: 1990,
    day: 25,
    daysRemaining: 5,
    isToday: false,
    age: 36
  });
});

test("calculateCalendarEvent marks today", () => {
  const result = calculateCalendarEvent("2018-05-20", 5, new Date("2026-05-20T08:00:00+07:00"));
  assert.equal(result.isToday, true);
  assert.equal(result.daysRemaining, 0);
  assert.equal(result.age, 8);
});
```

- [ ] **Step 2: Add shared types and date helpers**

Create `backend/src/shared/types.ts`:

```ts
export const CHUC_VU_VALUES = ["Giám đốc", "Hiệu trưởng", "Kế toán trưởng"] as const;
export type ChucVu = (typeof CHUC_VU_VALUES)[number];

export const INTERACTION_TYPE_VALUES = ["Call", "Meeting", "Email", "Gift", "Other"] as const;
export type InteractionType = (typeof INTERACTION_TYPE_VALUES)[number];

export type VipInput = {
  id?: string;
  hoTen: string;
  chucVu: ChucVu;
  ngaySinh: string;
  soDienThoai: string;
};

export type CustomerInput = {
  maKH: string;
  tenKH: string;
  ngayThanhLap: string;
  canBoQuanLy: string;
  vips: [VipInput, VipInput];
};

export type InteractionInput = {
  ngayThang: string;
  loaiHinh: InteractionType;
  chiTiet: string;
};
```

Create `backend/src/shared/date.ts`:

```ts
import { badRequest } from "./errors.js";

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export function assertIsoDate(value: string, field: string): void {
  if (!isIsoDate(value)) {
    throw badRequest("Ngày không hợp lệ.", field);
  }
}

export function isDateInMonth(dateStr: string, month: number): boolean {
  return Number(dateStr.slice(5, 7)) === month;
}

export function calculateCalendarEvent(dateStr: string, targetMonth: number, now = new Date()) {
  assertIsoDate(dateStr, "date");
  const originalYear = Number(dateStr.slice(0, 4));
  const day = Number(dateStr.slice(8, 10));
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const eventDate = new Date(currentYear, targetMonth - 1, day);
  const todayDateOnly = new Date(currentYear, currentMonth - 1, currentDay);
  const daysRemaining = Math.ceil((eventDate.getTime() - todayDateOnly.getTime()) / 86_400_000);

  return {
    originalYear,
    day,
    daysRemaining: targetMonth === currentMonth ? daysRemaining : 0,
    isToday: currentMonth === targetMonth && day === currentDay,
    age: currentYear - originalYear
  };
}
```

- [ ] **Step 3: Write validation tests**

Create `backend/src/customers/customers.validation.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { validateCustomerInput } from "./customers.validation.js";

const validPayload = {
  maKH: " kh201 ",
  tenKH: " Công ty A ",
  ngayThanhLap: "2018-05-12",
  canBoQuanLy: " Nguyễn Minh Anh ",
  vips: [
    { hoTen: "VIP 1", chucVu: "Giám đốc", ngaySinh: "1985-08-15", soDienThoai: "0912345678" },
    { hoTen: "VIP 2", chucVu: "Kế toán trưởng", ngaySinh: "1990-05-25", soDienThoai: "0987654321" }
  ]
};

test("validateCustomerInput normalizes customer data", () => {
  const result = validateCustomerInput(validPayload);
  assert.equal(result.maKH, "KH201");
  assert.equal(result.tenKH, "Công ty A");
  assert.equal(result.canBoQuanLy, "Nguyễn Minh Anh");
  assert.equal(result.vips.length, 2);
});

test("validateCustomerInput requires exactly two VIPs", () => {
  assert.throws(
    () => validateCustomerInput({ ...validPayload, vips: [validPayload.vips[0]] }),
    /phải có đúng 2 VIP/
  );
});

test("validateCustomerInput requires canBoQuanLy", () => {
  assert.throws(
    () => validateCustomerInput({ ...validPayload, canBoQuanLy: " " }),
    /Cán bộ quản lý/
  );
});
```

- [ ] **Step 4: Implement validation**

Create `backend/src/customers/customers.validation.ts`:

```ts
import { badRequest } from "../shared/errors.js";
import { assertIsoDate } from "../shared/date.js";
import {
  CHUC_VU_VALUES,
  INTERACTION_TYPE_VALUES,
  type CustomerInput,
  type InteractionInput
} from "../shared/types.js";

function requireText(value: unknown, field: string, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw badRequest(`${label} là bắt buộc.`, field);
  }
  return value.trim();
}

export function validateCustomerInput(value: unknown): CustomerInput {
  const input = value as Record<string, unknown>;
  const maKH = requireText(input.maKH, "maKH", "Mã khách hàng").toUpperCase();
  const tenKH = requireText(input.tenKH, "tenKH", "Tên khách hàng");
  const ngayThanhLap = requireText(input.ngayThanhLap, "ngayThanhLap", "Ngày thành lập");
  const canBoQuanLy = requireText(input.canBoQuanLy, "canBoQuanLy", "Cán bộ quản lý");
  assertIsoDate(ngayThanhLap, "ngayThanhLap");

  if (!Array.isArray(input.vips) || input.vips.length !== 2) {
    throw badRequest("Khách hàng phải có đúng 2 VIP.", "vips");
  }

  const vips = input.vips.map((item, index) => {
    const vip = item as Record<string, unknown>;
    const chucVu = requireText(vip.chucVu, `vips.${index}.chucVu`, "Chức vụ VIP");
    if (!CHUC_VU_VALUES.includes(chucVu as never)) {
      throw badRequest("Chức vụ VIP không hợp lệ.", `vips.${index}.chucVu`);
    }
    const ngaySinh = requireText(vip.ngaySinh, `vips.${index}.ngaySinh`, "Ngày sinh VIP");
    assertIsoDate(ngaySinh, `vips.${index}.ngaySinh`);
    return {
      id: typeof vip.id === "string" ? vip.id : undefined,
      hoTen: requireText(vip.hoTen, `vips.${index}.hoTen`, "Họ tên VIP"),
      chucVu: chucVu as CustomerInput["vips"][number]["chucVu"],
      ngaySinh,
      soDienThoai: requireText(vip.soDienThoai, `vips.${index}.soDienThoai`, "Số điện thoại VIP")
    };
  }) as CustomerInput["vips"];

  return { maKH, tenKH, ngayThanhLap, canBoQuanLy, vips };
}

export function validateInteractionInput(value: unknown): InteractionInput {
  const input = value as Record<string, unknown>;
  const ngayThang = requireText(input.ngayThang, "ngayThang", "Ngày tương tác");
  assertIsoDate(ngayThang, "ngayThang");
  const loaiHinh = requireText(input.loaiHinh, "loaiHinh", "Loại hình tương tác");
  if (!INTERACTION_TYPE_VALUES.includes(loaiHinh as never)) {
    throw badRequest("Loại hình tương tác không hợp lệ.", "loaiHinh");
  }
  return {
    ngayThang,
    loaiHinh: loaiHinh as InteractionInput["loaiHinh"],
    chiTiet: requireText(input.chiTiet, "chiTiet", "Chi tiết tương tác")
  };
}

export function validateNoteInput(value: unknown): string {
  return requireText((value as Record<string, unknown>).noiDung, "noiDung", "Nội dung ghi chú");
}
```

- [ ] **Step 5: Verify and commit**

Run:

```bash
cd backend
npm test
npm run lint
```

Expected: date and validation tests pass.

Commit:

```bash
git add backend/src/shared backend/src/customers/customers.validation.ts backend/src/customers/customers.validation.test.ts
git commit -m "feat: add backend domain validation"
```

## Task 4: Customer Repository And Service

**Files:**
- Create: `backend/src/customers/customers.repository.ts`
- Create: `backend/src/customers/customers.service.ts`
- Test: `backend/src/customers/customers.service.test.ts`

- [ ] **Step 1: Write service tests against fake repository**

Create `backend/src/customers/customers.service.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { createCustomersService, type CustomersRepositoryPort } from "./customers.service.js";
import type { CustomerInput } from "../shared/types.js";

const baseInput: CustomerInput = {
  maKH: "KH201",
  tenKH: "Công ty A",
  ngayThanhLap: "2018-05-12",
  canBoQuanLy: "Nguyễn Minh Anh",
  vips: [
    { hoTen: "VIP 1", chucVu: "Giám đốc", ngaySinh: "1985-08-15", soDienThoai: "0912345678" },
    { hoTen: "VIP 2", chucVu: "Kế toán trưởng", ngaySinh: "1990-05-25", soDienThoai: "0987654321" }
  ]
};

function fakeRepository(overrides: Partial<CustomersRepositoryPort> = {}): CustomersRepositoryPort {
  return {
    findByCode: async () => null,
    findById: async () => null,
    list: async () => [],
    create: async (input) => ({ id: "cust-1", ...input, lichSuTuongTac: [], ghiChuList: [] }),
    update: async (id, input) => ({ id, ...input, lichSuTuongTac: [], ghiChuList: [] }),
    delete: async () => true,
    createInteraction: async () => ({ id: "int-1", ngayThang: "2026-05-20", loaiHinh: "Call", chiTiet: "Call" }),
    deleteInteraction: async () => true,
    createNote: async () => ({ id: "note-1", ngayTao: "2026-05-20", noiDung: "Note" }),
    deleteNote: async () => true,
    ...overrides
  };
}

test("createCustomer rejects duplicate maKH", async () => {
  const service = createCustomersService(fakeRepository({ findByCode: async () => ({ id: "existing" }) }));
  await assert.rejects(() => service.createCustomer(baseInput), /đã tồn tại/);
});

test("updateCustomer preserves existing interactions and notes through repository update", async () => {
  const service = createCustomersService(fakeRepository({
    findById: async () => ({ id: "cust-1" }),
    update: async (id, input) => ({
      id,
      ...input,
      lichSuTuongTac: [{ id: "int-1", ngayThang: "2026-05-20", loaiHinh: "Call", chiTiet: "Existing" }],
      ghiChuList: [{ id: "note-1", ngayTao: "2026-05-20", noiDung: "Existing note" }]
    })
  }));

  const result = await service.updateCustomer("cust-1", baseInput);
  assert.equal(result.lichSuTuongTac.length, 1);
  assert.equal(result.ghiChuList.length, 1);
});
```

- [ ] **Step 2: Implement service port and business rules**

Create `backend/src/customers/customers.service.ts`:

```ts
import { conflict, notFound } from "../shared/errors.js";
import type { CustomerInput, InteractionInput } from "../shared/types.js";

export type CustomerRecord = CustomerInput & {
  id: string;
  lichSuTuongTac: Array<{ id: string; ngayThang: string; loaiHinh: string; chiTiet: string }>;
  ghiChuList: Array<{ id: string; ngayTao: string; noiDung: string }>;
};

export type CustomersRepositoryPort = {
  findByCode(maKH: string): Promise<{ id: string } | null>;
  findById(id: string): Promise<{ id: string } | null>;
  list(filters: { search?: string; role?: string }): Promise<CustomerRecord[]>;
  create(input: CustomerInput): Promise<CustomerRecord>;
  update(id: string, input: CustomerInput): Promise<CustomerRecord>;
  delete(id: string): Promise<boolean>;
  createInteraction(customerId: string, input: InteractionInput): Promise<{ id: string; ngayThang: string; loaiHinh: string; chiTiet: string }>;
  deleteInteraction(customerId: string, interactionId: string): Promise<boolean>;
  createNote(customerId: string, noiDung: string): Promise<{ id: string; ngayTao: string; noiDung: string }>;
  deleteNote(customerId: string, noteId: string): Promise<boolean>;
};

export function createCustomersService(repository: CustomersRepositoryPort) {
  return {
    listCustomers: (filters: { search?: string; role?: string }) => repository.list(filters),

    async getCustomer(id: string) {
      const customer = await repository.findById(id);
      if (!customer) throw notFound("Không tìm thấy khách hàng.");
      return customer;
    },

    async createCustomer(input: CustomerInput) {
      const existing = await repository.findByCode(input.maKH);
      if (existing) throw conflict(`Mã khách hàng "${input.maKH}" đã tồn tại trên hệ thống.`, "maKH");
      return repository.create(input);
    },

    async updateCustomer(id: string, input: CustomerInput) {
      const current = await repository.findById(id);
      if (!current) throw notFound("Không tìm thấy khách hàng.");
      const duplicate = await repository.findByCode(input.maKH);
      if (duplicate && duplicate.id !== id) {
        throw conflict(`Mã khách hàng "${input.maKH}" đã tồn tại trên hệ thống.`, "maKH");
      }
      return repository.update(id, input);
    },

    async deleteCustomer(id: string) {
      const deleted = await repository.delete(id);
      if (!deleted) throw notFound("Không tìm thấy khách hàng.");
    },

    async addInteraction(customerId: string, input: InteractionInput) {
      if (!(await repository.findById(customerId))) throw notFound("Không tìm thấy khách hàng.");
      return repository.createInteraction(customerId, input);
    },

    async deleteInteraction(customerId: string, interactionId: string) {
      const deleted = await repository.deleteInteraction(customerId, interactionId);
      if (!deleted) throw notFound("Không tìm thấy dòng tương tác.");
    },

    async addNote(customerId: string, noiDung: string) {
      if (!(await repository.findById(customerId))) throw notFound("Không tìm thấy khách hàng.");
      return repository.createNote(customerId, noiDung);
    },

    async deleteNote(customerId: string, noteId: string) {
      const deleted = await repository.deleteNote(customerId, noteId);
      if (!deleted) throw notFound("Không tìm thấy ghi chú.");
    }
  };
}
```

- [ ] **Step 3: Implement repository SQL**

Create `backend/src/customers/customers.repository.ts` with these exported functions:

```ts
import type pg from "pg";
import type { CustomerInput, InteractionInput } from "../shared/types.js";
import type { CustomerRecord, CustomersRepositoryPort } from "./customers.service.js";

function toCustomer(row: any, vips: any[], interactions: any[] = [], notes: any[] = []): CustomerRecord {
  return {
    id: row.id,
    maKH: row.ma_kh,
    tenKH: row.ten_kh,
    ngayThanhLap: row.ngay_thanh_lap,
    canBoQuanLy: row.can_bo_quan_ly,
    vips: vips
      .sort((a, b) => a.position - b.position)
      .map((vip) => ({
        id: vip.id,
        hoTen: vip.ho_ten,
        chucVu: vip.chuc_vu,
        ngaySinh: vip.ngay_sinh,
        soDienThoai: vip.so_dien_thoai
      })) as CustomerRecord["vips"],
    lichSuTuongTac: interactions.map((item) => ({
      id: item.id,
      ngayThang: item.ngay_thang,
      loaiHinh: item.loai_hinh,
      chiTiet: item.chi_tiet
    })),
    ghiChuList: notes.map((item) => ({
      id: item.id,
      ngayTao: item.ngay_tao,
      noiDung: item.noi_dung
    }))
  };
}

export function createCustomersRepository(db: pg.Pool): CustomersRepositoryPort {
  return {
    async findByCode(maKH) {
      const result = await db.query("select id from customers where ma_kh = $1", [maKH]);
      return result.rows[0] ?? null;
    },

    async findById(id) {
      const customer = await db.query("select * from customers where id = $1", [id]);
      if (!customer.rows[0]) return null;
      const vips = await db.query("select * from vips where customer_id = $1 order by position", [id]);
      const interactions = await db.query("select * from interactions where customer_id = $1 order by ngay_thang desc, created_at desc", [id]);
      const notes = await db.query("select * from notes where customer_id = $1 order by ngay_tao desc, created_at desc", [id]);
      return toCustomer(customer.rows[0], vips.rows, interactions.rows, notes.rows);
    },

    async list(filters) {
      const params: string[] = [];
      const where: string[] = [];
      if (filters.search?.trim()) {
        params.push(`%${filters.search.trim()}%`);
        where.push(`(c.ma_kh ilike $${params.length} or c.ten_kh ilike $${params.length} or c.can_bo_quan_ly ilike $${params.length} or exists (select 1 from vips sv where sv.customer_id = c.id and sv.ho_ten ilike $${params.length}))`);
      }
      if (filters.role && filters.role !== "All") {
        params.push(filters.role);
        where.push(`exists (select 1 from vips rv where rv.customer_id = c.id and rv.chuc_vu = $${params.length})`);
      }
      const customers = await db.query(
        `select c.* from customers c ${where.length ? `where ${where.join(" and ")}` : ""} order by c.ma_kh asc`,
        params
      );
      const output: CustomerRecord[] = [];
      for (const row of customers.rows) {
        const full = await this.findById(row.id);
        if (full) output.push(full);
      }
      return output;
    },

    async create(input) {
      const client = await db.connect();
      try {
        await client.query("begin");
        const customer = await client.query(
          `insert into customers(ma_kh, ten_kh, ngay_thanh_lap, can_bo_quan_ly)
           values ($1, $2, $3, $4) returning *`,
          [input.maKH, input.tenKH, input.ngayThanhLap, input.canBoQuanLy]
        );
        const id = customer.rows[0].id;
        for (const [index, vip] of input.vips.entries()) {
          await client.query(
            `insert into vips(customer_id, position, ho_ten, chuc_vu, ngay_sinh, so_dien_thoai)
             values ($1, $2, $3, $4, $5, $6)`,
            [id, index + 1, vip.hoTen, vip.chucVu, vip.ngaySinh, vip.soDienThoai]
          );
        }
        await client.query("commit");
        return (await this.findById(id)) as CustomerRecord;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },

    async update(id, input) {
      const client = await db.connect();
      try {
        await client.query("begin");
        await client.query(
          `update customers set ma_kh = $2, ten_kh = $3, ngay_thanh_lap = $4, can_bo_quan_ly = $5, updated_at = now()
           where id = $1`,
          [id, input.maKH, input.tenKH, input.ngayThanhLap, input.canBoQuanLy]
        );
        for (const [index, vip] of input.vips.entries()) {
          await client.query(
            `insert into vips(customer_id, position, ho_ten, chuc_vu, ngay_sinh, so_dien_thoai)
             values ($1, $2, $3, $4, $5, $6)
             on conflict (customer_id, position) do update
             set ho_ten = excluded.ho_ten,
                 chuc_vu = excluded.chuc_vu,
                 ngay_sinh = excluded.ngay_sinh,
                 so_dien_thoai = excluded.so_dien_thoai,
                 updated_at = now()`,
            [id, index + 1, vip.hoTen, vip.chucVu, vip.ngaySinh, vip.soDienThoai]
          );
        }
        await client.query("commit");
        return (await this.findById(id)) as CustomerRecord;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },

    async delete(id) {
      const result = await db.query("delete from customers where id = $1", [id]);
      return Boolean(result.rowCount);
    },

    async createInteraction(customerId, input: InteractionInput) {
      const result = await db.query(
        `insert into interactions(customer_id, ngay_thang, loai_hinh, chi_tiet)
         values ($1, $2, $3, $4)
         returning id, ngay_thang, loai_hinh, chi_tiet`,
        [customerId, input.ngayThang, input.loaiHinh, input.chiTiet]
      );
      const row = result.rows[0];
      return { id: row.id, ngayThang: row.ngay_thang, loaiHinh: row.loai_hinh, chiTiet: row.chi_tiet };
    },

    async deleteInteraction(customerId, interactionId) {
      const result = await db.query("delete from interactions where customer_id = $1 and id = $2", [customerId, interactionId]);
      return Boolean(result.rowCount);
    },

    async createNote(customerId, noiDung) {
      const result = await db.query(
        `insert into notes(customer_id, noi_dung) values ($1, $2) returning id, ngay_tao, noi_dung`,
        [customerId, noiDung]
      );
      const row = result.rows[0];
      return { id: row.id, ngayTao: row.ngay_tao, noiDung: row.noi_dung };
    },

    async deleteNote(customerId, noteId) {
      const result = await db.query("delete from notes where customer_id = $1 and id = $2", [customerId, noteId]);
      return Boolean(result.rowCount);
    }
  };
}
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
cd backend
npm test
npm run lint
```

Expected: all service tests pass.

Commit:

```bash
git add backend/src/customers
git commit -m "feat: add customer service and repository"
```

## Task 5: Customer, Interaction, And Note HTTP Routes

**Files:**
- Create: `backend/src/customers/customers.routes.ts`
- Modify: `backend/src/app.ts`

- [ ] **Step 1: Add route wiring test**

Extend `backend/src/app.test.ts`:

```ts
test("GET /api/customers responds with JSON", async () => {
  const response = await fetch(`${baseUrl}/api/customers`);
  assert.notEqual(response.status, 404);
  assert.match(response.headers.get("content-type") || "", /application\/json/);
});
```

This test fails before routes are mounted.

- [ ] **Step 2: Implement customers routes**

Create `backend/src/customers/customers.routes.ts`:

```ts
import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../shared/http.js";
import { createCustomersRepository } from "./customers.repository.js";
import { createCustomersService } from "./customers.service.js";
import { validateCustomerInput, validateInteractionInput, validateNoteInput } from "./customers.validation.js";

const repository = createCustomersRepository(pool);
const service = createCustomersService(repository);

export const customersRouter = Router();

customersRouter.get("/", asyncHandler(async (req, res) => {
  const customers = await service.listCustomers({
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    role: typeof req.query.role === "string" ? req.query.role : undefined
  });
  res.json(customers);
}));

customersRouter.get("/:id", asyncHandler(async (req, res) => {
  res.json(await service.getCustomer(req.params.id));
}));

customersRouter.post("/", asyncHandler(async (req, res) => {
  const customer = await service.createCustomer(validateCustomerInput(req.body));
  res.status(201).json(customer);
}));

customersRouter.put("/:id", asyncHandler(async (req, res) => {
  res.json(await service.updateCustomer(req.params.id, validateCustomerInput(req.body)));
}));

customersRouter.delete("/:id", asyncHandler(async (req, res) => {
  await service.deleteCustomer(req.params.id);
  res.status(204).end();
}));

customersRouter.post("/:id/interactions", asyncHandler(async (req, res) => {
  const interaction = await service.addInteraction(req.params.id, validateInteractionInput(req.body));
  res.status(201).json(interaction);
}));

customersRouter.delete("/:id/interactions/:interactionId", asyncHandler(async (req, res) => {
  await service.deleteInteraction(req.params.id, req.params.interactionId);
  res.status(204).end();
}));

customersRouter.post("/:id/notes", asyncHandler(async (req, res) => {
  const note = await service.addNote(req.params.id, validateNoteInput(req.body));
  res.status(201).json(note);
}));

customersRouter.delete("/:id/notes/:noteId", asyncHandler(async (req, res) => {
  await service.deleteNote(req.params.id, req.params.noteId);
  res.status(204).end();
}));
```

Modify `backend/src/app.ts`:

```ts
import { customersRouter } from "./customers/customers.routes.js";

app.use("/api/customers", customersRouter);
```

Place the `app.use("/api/customers", customersRouter);` line before `app.use(errorMiddleware);`.

- [ ] **Step 3: Verify and commit**

Run:

```bash
cd backend
npm test
npm run lint
```

Expected: route test no longer returns 404 and response content type is JSON.

Commit:

```bash
git add backend/src/app.ts backend/src/app.test.ts backend/src/customers/customers.routes.ts
git commit -m "feat: expose customer APIs"
```

## Task 6: Events And Stats Backend APIs

**Files:**
- Create: `backend/src/events/events.service.ts`
- Create: `backend/src/events/events.routes.ts`
- Test: `backend/src/events/events.service.test.ts`
- Create: `backend/src/stats/stats.service.ts`
- Create: `backend/src/stats/stats.routes.ts`
- Modify: `backend/src/app.ts`

- [ ] **Step 1: Write events service tests**

Create `backend/src/events/events.service.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCareEvents } from "./events.service.js";

test("buildCareEvents returns founding and VIP birthday events sorted by day", () => {
  const events = buildCareEvents(
    [
      {
        id: "cust-1",
        maKH: "KH201",
        tenKH: "Công ty A",
        ngayThanhLap: "2018-05-12",
        canBoQuanLy: "Nguyễn Minh Anh",
        vips: [
          { id: "vip-1", hoTen: "VIP 1", chucVu: "Giám đốc", ngaySinh: "1985-08-15", soDienThoai: "0912345678" },
          { id: "vip-2", hoTen: "VIP 2", chucVu: "Kế toán trưởng", ngaySinh: "1990-05-25", soDienThoai: "0987654321" }
        ],
        lichSuTuongTac: [],
        ghiChuList: []
      }
    ],
    5,
    new Date("2026-05-20T08:00:00+07:00")
  );

  assert.equal(events.length, 2);
  assert.equal(events[0].type, "FOUNDING");
  assert.equal(events[0].age, 8);
  assert.equal(events[1].type, "VIP_BIRTHDAY");
  assert.equal(events[1].daysRemaining, 5);
});
```

- [ ] **Step 2: Implement events service and route**

Create `backend/src/events/events.service.ts`:

```ts
import { badRequest } from "../shared/errors.js";
import { calculateCalendarEvent, isDateInMonth } from "../shared/date.js";
import type { CustomerRecord } from "../customers/customers.service.js";

export type CareEvent = {
  id: string;
  customerId: string;
  customerName: string;
  customerCode: string;
  type: "FOUNDING" | "VIP_BIRTHDAY";
  title: string;
  vipName?: string;
  vipPhone?: string;
  vipRole?: string;
  originalYear: number;
  dateStr: string;
  day: number;
  daysRemaining: number;
  isToday: boolean;
  age: number;
};

export function validateMonth(value: unknown): number {
  const month = Number(value);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw badRequest("Tháng không hợp lệ.", "month");
  }
  return month;
}

export function buildCareEvents(customers: CustomerRecord[], targetMonth: number, now = new Date()): CareEvent[] {
  const events: CareEvent[] = [];

  for (const customer of customers) {
    if (isDateInMonth(customer.ngayThanhLap, targetMonth)) {
      events.push({
        id: `founding-${customer.id}`,
        customerId: customer.id,
        customerName: customer.tenKH,
        customerCode: customer.maKH,
        type: "FOUNDING",
        title: "Kỷ niệm ngày thành lập",
        dateStr: customer.ngayThanhLap,
        ...calculateCalendarEvent(customer.ngayThanhLap, targetMonth, now)
      });
    }

    customer.vips.forEach((vip, index) => {
      if (!isDateInMonth(vip.ngaySinh, targetMonth)) return;
      events.push({
        id: `vip-birthday-${customer.id}-${index}-${vip.id}`,
        customerId: customer.id,
        customerName: customer.tenKH,
        customerCode: customer.maKH,
        type: "VIP_BIRTHDAY",
        title: `Sinh nhật ${vip.chucVu}`,
        vipName: vip.hoTen,
        vipPhone: vip.soDienThoai,
        vipRole: vip.chucVu,
        dateStr: vip.ngaySinh,
        ...calculateCalendarEvent(vip.ngaySinh, targetMonth, now)
      });
    });
  }

  return events.sort((a, b) => a.day - b.day);
}
```

Create `backend/src/events/events.routes.ts`:

```ts
import { Router } from "express";
import { pool } from "../db/pool.js";
import { createCustomersRepository } from "../customers/customers.repository.js";
import { asyncHandler } from "../shared/http.js";
import { buildCareEvents, validateMonth } from "./events.service.js";

const repository = createCustomersRepository(pool);
export const eventsRouter = Router();

eventsRouter.get("/", asyncHandler(async (req, res) => {
  const month = validateMonth(req.query.month);
  const customers = await repository.list({});
  res.json(buildCareEvents(customers, month));
}));
```

- [ ] **Step 3: Implement stats service and route**

Create `backend/src/stats/stats.service.ts`:

```ts
import { buildCareEvents } from "../events/events.service.js";
import type { CustomerRecord } from "../customers/customers.service.js";

export function buildStats(customers: CustomerRecord[], now = new Date()) {
  return {
    totalCustomers: customers.length,
    monthEventsCount: buildCareEvents(customers, now.getMonth() + 1, now).length,
    totalInteractions: customers.reduce((sum, customer) => sum + customer.lichSuTuongTac.length, 0)
  };
}
```

Create `backend/src/stats/stats.routes.ts`:

```ts
import { Router } from "express";
import { pool } from "../db/pool.js";
import { createCustomersRepository } from "../customers/customers.repository.js";
import { asyncHandler } from "../shared/http.js";
import { buildStats } from "./stats.service.js";

const repository = createCustomersRepository(pool);
export const statsRouter = Router();

statsRouter.get("/", asyncHandler(async (_req, res) => {
  const customers = await repository.list({});
  res.json(buildStats(customers));
}));
```

Modify `backend/src/app.ts`:

```ts
import { eventsRouter } from "./events/events.routes.js";
import { statsRouter } from "./stats/stats.routes.js";

app.use("/api/events", eventsRouter);
app.use("/api/stats", statsRouter);
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
cd backend
npm test
npm run lint
```

Expected: event service tests pass and TypeScript passes.

Commit:

```bash
git add backend/src/events backend/src/stats backend/src/app.ts
git commit -m "feat: add events and stats APIs"
```

## Task 7: Frontend API Layer And Types

**Files:**
- Modify: `frontend/.env.example`
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/src/types.ts`
- Modify: `frontend/src/initialData.ts`
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/customersApi.ts`
- Create: `frontend/src/api/eventsApi.ts`
- Create: `frontend/src/api/statsApi.ts`

- [ ] **Step 1: Add API env and proxy**

Modify `frontend/.env.example`:

```bash
VITE_API_URL=http://localhost:4000/api
```

Modify `frontend/vite.config.ts` inside `server`:

```ts
proxy: {
  '/api': {
    target: 'http://localhost:4000',
    changeOrigin: true,
  },
},
```

- [ ] **Step 2: Update frontend types**

Modify `frontend/src/types.ts`:

```ts
export interface KhachHang {
  id: string;
  maKH: string;
  tenKH: string;
  ngayThanhLap: string;
  canBoQuanLy: string;
  vips: [VIP, VIP];
  lichSuTuongTac: Interaction[];
  ghiChuList: GhiChu[];
}

export interface CareEvent {
  id: string;
  customerId: string;
  customerName: string;
  customerCode: string;
  type: "FOUNDING" | "VIP_BIRTHDAY";
  title: string;
  vipName?: string;
  vipPhone?: string;
  vipRole?: string;
  originalYear: number;
  dateStr: string;
  day: number;
  daysRemaining: number;
  isToday: boolean;
  age: number;
}

export interface DashboardStats {
  totalCustomers: number;
  monthEventsCount: number;
  totalInteractions: number;
}
```

- [ ] **Step 3: Add API client modules**

Create `frontend/src/api/client.ts`:

```ts
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly field?: string
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.message || "Không thể kết nối máy chủ.", response.status, data?.field);
  }
  return data as T;
}
```

Create `frontend/src/api/customersApi.ts`:

```ts
import type { Interaction, KhachHang, VIP } from "../types";
import { apiRequest } from "./client";

export type CustomerPayload = {
  maKH: string;
  tenKH: string;
  ngayThanhLap: string;
  canBoQuanLy: string;
  vips: [Omit<VIP, "id"> & { id?: string }, Omit<VIP, "id"> & { id?: string }];
};

export const customersApi = {
  list: (params: { search?: string; role?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.role && params.role !== "All") query.set("role", params.role);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<KhachHang[]>(`/customers${suffix}`);
  },
  getById: (id: string) => apiRequest<KhachHang>(`/customers/${id}`),
  create: (payload: CustomerPayload) => apiRequest<KhachHang>("/customers", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: CustomerPayload) => apiRequest<KhachHang>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: string) => apiRequest<void>(`/customers/${id}`, { method: "DELETE" }),
  addInteraction: (customerId: string, interaction: Omit<Interaction, "id">) =>
    apiRequest<Interaction>(`/customers/${customerId}/interactions`, { method: "POST", body: JSON.stringify(interaction) }),
  deleteInteraction: (customerId: string, interactionId: string) =>
    apiRequest<void>(`/customers/${customerId}/interactions/${interactionId}`, { method: "DELETE" }),
  addNote: (customerId: string, noiDung: string) =>
    apiRequest(`/customers/${customerId}/notes`, { method: "POST", body: JSON.stringify({ noiDung }) }),
  deleteNote: (customerId: string, noteId: string) =>
    apiRequest<void>(`/customers/${customerId}/notes/${noteId}`, { method: "DELETE" })
};
```

Create `frontend/src/api/eventsApi.ts`:

```ts
import type { CareEvent } from "../types";
import { apiRequest } from "./client";

export const eventsApi = {
  listByMonth: (month: number) => apiRequest<CareEvent[]>(`/events?month=${month}`)
};
```

Create `frontend/src/api/statsApi.ts`:

```ts
import type { DashboardStats } from "../types";
import { apiRequest } from "./client";

export const statsApi = {
  get: () => apiRequest<DashboardStats>("/stats")
};
```

- [ ] **Step 4: Keep demo data type-compatible**

Modify every customer object in `frontend/src/initialData.ts` to include `canBoQuanLy`:

```ts
canBoQuanLy: "Nguyễn Minh Anh",
```

Use these values for the existing demo customers:

```text
KH201: Nguyễn Minh Anh
KH306: Trần Quốc Bảo
KH511: Lê Thu Hà
KH088: Phạm Đức Long
KH144: Đỗ Hồng Nhung
```

- [ ] **Step 5: Verify and commit**

Run:

```bash
cd frontend
npm run lint
npm run build
```

Expected: TypeScript check and Vite build pass.

Commit:

```bash
git add frontend/.env.example frontend/vite.config.ts frontend/src/types.ts frontend/src/initialData.ts frontend/src/api
git commit -m "feat: add frontend API client"
```

## Task 8: Refactor App State From localStorage To API

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Replace initial localStorage loading with API fetch**

In `frontend/src/App.tsx`, remove imports of `initialCustomers` and backend-owned event helpers:

```ts
import { customersApi } from "./api/customersApi";
import { eventsApi } from "./api/eventsApi";
import { statsApi } from "./api/statsApi";
import type { CareEvent, DashboardStats } from "./types";
```

Add state:

```ts
const [events, setEvents] = useState<CareEvent[]>([]);
const [stats, setStats] = useState<DashboardStats>({ totalCustomers: 0, monthEventsCount: 0, totalInteractions: 0 });
const [searchTerm, setSearchTerm] = useState("");
const [roleFilter, setRoleFilter] = useState("All");
const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
const [isLoading, setIsLoading] = useState(true);
const [loadError, setLoadError] = useState<string | null>(null);
```

Add loaders:

```ts
const loadCustomers = async () => {
  const list = await customersApi.list({ search: searchTerm, role: roleFilter });
  setCustomers(list);
  if (activeCustomerId) {
    const stillExists = list.some((customer) => customer.id === activeCustomerId);
    if (!stillExists) setActiveCustomerId(null);
  }
};

const loadDashboard = async () => {
  const [nextEvents, nextStats] = await Promise.all([
    eventsApi.listByMonth(selectedMonth),
    statsApi.get()
  ]);
  setEvents(nextEvents);
  setStats(nextStats);
};

const refreshAll = async () => {
  setLoadError(null);
  await Promise.all([loadCustomers(), loadDashboard()]);
};
```

Use effects:

```ts
useEffect(() => {
  setIsLoading(true);
  refreshAll()
    .catch((error) => setLoadError(error instanceof Error ? error.message : "Không thể tải dữ liệu."))
    .finally(() => setIsLoading(false));
}, [searchTerm, roleFilter, selectedMonth]);
```

- [ ] **Step 2: Replace mutation handlers with API calls**

Change create/update handler:

```ts
await customersApi.update(customerToEdit.id, formData);
await refreshAll();
```

and create branch:

```ts
await customersApi.create(formData);
await refreshAll();
```

Change delete handler:

```ts
await customersApi.remove(id);
await refreshAll();
```

Change interaction and note handlers:

```ts
await customersApi.addInteraction(customerId, intData);
await refreshAll();
```

```ts
await customersApi.deleteInteraction(customerId, interactionId);
await refreshAll();
```

```ts
await customersApi.addNote(customerId, content);
await refreshAll();
```

```ts
await customersApi.deleteNote(customerId, noteId);
await refreshAll();
```

Quick interaction uses the same `customersApi.addInteraction`.

- [ ] **Step 3: Use backend stats**

Replace local computed stats:

```ts
const totalCustomers = stats.totalCustomers;
const monthEventsCount = stats.monthEventsCount;
const totalInteractions = stats.totalInteractions;
```

Add a simple load error panel before main sections:

```tsx
{loadError && (
  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
    {loadError}
  </div>
)}
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
cd frontend
npm run lint
```

Expected: remaining TypeScript errors point to component prop changes handled in the next task.

Commit:

```bash
git add frontend/src/App.tsx
git commit -m "feat: load CRM data from backend API"
```

## Task 9: Update Customer Form, List, And Monthly Events Components

**Files:**
- Modify: `frontend/src/components/CustomerForm.tsx`
- Modify: `frontend/src/components/CustomerList.tsx`
- Modify: `frontend/src/components/MonthlyEvents.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/utils.ts`

- [ ] **Step 1: Add canBoQuanLy to CustomerForm**

In `CustomerFormProps.onSubmit`, add:

```ts
canBoQuanLy: string;
```

Add state:

```ts
const [canBoQuanLy, setCanBoQuanLy] = useState("");
```

When editing:

```ts
setCanBoQuanLy(initialData.canBoQuanLy);
```

Validation:

```ts
if (!maKH.trim() || !tenKH.trim() || !ngayThanhLap || !canBoQuanLy.trim()) {
  setError("Vui lòng điền đầy đủ Mã, Tên khách hàng, Cán bộ quản lý và Ngày thành lập.");
  return;
}
```

Submit payload:

```ts
canBoQuanLy: canBoQuanLy.trim(),
```

Add input in the customer info grid:

```tsx
<div>
  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
    Cán bộ quản lý <span className="text-rose-500">*</span>
  </label>
  <input
    type="text"
    value={canBoQuanLy}
    onChange={(e) => setCanBoQuanLy(e.target.value)}
    placeholder="Ví dụ: Nguyễn Minh Anh"
    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all font-medium"
    required
    id="input-can-bo-quan-ly"
  />
</div>
```

- [ ] **Step 2: Move CustomerList search/filter state to App**

Change `CustomerListProps`:

```ts
searchTerm: string;
roleFilter: string;
onSearchTermChange: (value: string) => void;
onRoleFilterChange: (value: string) => void;
```

Remove local `useState` for `searchTerm` and `roleFilter`.

Use API-returned `customers` directly:

```ts
const finalCustomers = customers;
```

Display `canBoQuanLy` in desktop name cell:

```tsx
<span className="text-[10px] text-slate-400">
  Cán bộ: {kh.canBoQuanLy}
</span>
```

Display it in mobile card:

```tsx
<p className="text-[10px] text-slate-500 mt-1">Cán bộ quản lý: {kh.canBoQuanLy}</p>
```

Pass props from `App.tsx`:

```tsx
searchTerm={searchTerm}
roleFilter={roleFilter}
onSearchTermChange={setSearchTerm}
onRoleFilterChange={setRoleFilter}
```

- [ ] **Step 3: Convert MonthlyEvents to API events**

Change `MonthlyEventsProps`:

```ts
events: CareEvent[];
selectedMonth: number;
currentMonth: number;
onSelectedMonthChange: (month: number) => void;
```

Remove `customers` prop and local selected month state.

Update navigation:

```ts
const handlePrevMonth = () => {
  onSelectedMonthChange(selectedMonth === 1 ? 12 : selectedMonth - 1);
};

const handleNextMonth = () => {
  onSelectedMonthChange(selectedMonth === 12 ? 1 : selectedMonth + 1);
};
```

Pass props from `App.tsx`:

```tsx
<MonthlyEvents
  events={events}
  selectedMonth={selectedMonth}
  currentMonth={getCurrentMonth()}
  onSelectedMonthChange={setSelectedMonth}
  onSelectCustomer={(id) => {
    setActiveCustomerId(id);
    setIsFormOpen(false);
    setTimeout(() => {
      document.getElementById(`details-container-${id}`)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }}
  onQuickInteract={handleQuickInteraction}
/>
```

- [ ] **Step 4: Keep only formatting helpers in utils**

Leave these exports in `frontend/src/utils.ts`:

```ts
export function getCurrentMonth(): number
export function getCurrentYear(): number
export function isDateInMonth(dateStr: string, month: number): boolean
export function formatDateVN(dateStr: string): string
export function formatDayMonth(dateStr: string): string
export function getEventStatusText(daysRemaining: number, isToday: boolean, eventMonth: number, currentMonth: number): string
```

Remove `CareEvent` interface and `getCareEventsInMonth` from frontend imports if no component uses them.

- [ ] **Step 5: Verify and commit**

Run:

```bash
cd frontend
npm run lint
npm run build
```

Expected: TypeScript and production build pass.

Commit:

```bash
git add frontend/src/App.tsx frontend/src/components/CustomerForm.tsx frontend/src/components/CustomerList.tsx frontend/src/components/MonthlyEvents.tsx frontend/src/utils.ts
git commit -m "feat: move frontend workflows to backend APIs"
```

## Task 10: End-To-End Local Runtime Verification

**Files:**
- Modify: `frontend/README.md`

- [ ] **Step 1: Document local run commands**

Append to `frontend/README.md`:

````md
## PERN Local Development

Start PostgreSQL and create databases:

```bash
createdb vip_crm
createdb vip_crm_test
```

Backend:

```bash
cd ../backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

Frontend:

```bash
cd ../frontend
npm install
npm run dev
```

Open http://localhost:3000.
````

- [ ] **Step 2: Run backend verification**

Run:

```bash
cd backend
npm test
npm run lint
npm run build
```

Expected:

```text
tests pass
TypeScript emits dist/
```

- [ ] **Step 3: Run frontend verification**

Run:

```bash
cd frontend
npm run lint
npm run build
```

Expected:

```text
TypeScript passes
Vite build completes
```

- [ ] **Step 4: Smoke test with running servers**

Run backend:

```bash
cd backend
npm run dev
```

Run frontend in another terminal:

```bash
cd frontend
npm run dev
```

Manual checks:

- Open `http://localhost:3000`.
- Customer list loads from backend.
- Add customer with `Cán bộ quản lý`.
- Edit that customer and confirm interactions/notes remain.
- Search by `canBoQuanLy`.
- Filter by VIP role.
- Open monthly events and switch month.
- Use quick interaction from an event.
- Add and delete a note.
- Delete the test customer.

- [ ] **Step 5: Commit docs and any runtime fixes**

```bash
git add frontend/README.md
git commit -m "docs: add PERN local development workflow"
```

## Plan Self-Review Checklist

- Spec coverage:
  - PostgreSQL schema: Task 2.
  - Express TypeScript backend: Task 1.
  - Customer CRUD, validation, duplicate code, exactly two VIPs: Tasks 3-5.
  - Interactions and notes: Tasks 4-5.
  - Events and stats: Task 6.
  - `canBoQuanLy` text field on customers: Tasks 2, 3, 7, 9.
  - Frontend API migration and localStorage removal: Tasks 7-9.
  - Tests and verification: Tasks 1-10.
- Placeholder scan:
  - No placeholder markers or open decisions.
  - Every task lists exact files, commands, and expected verification.
- Type consistency:
  - Backend API returns camelCase field names.
  - `canBoQuanLy` is camelCase in frontend/API and `can_bo_quan_ly` in SQL.
  - VIP roles and interaction types match existing frontend values.
