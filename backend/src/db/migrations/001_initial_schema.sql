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
  chuc_vu text not null check (chuc_vu in ('Lãnh đạo đơn vị', 'Kế toán trưởng')),
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
