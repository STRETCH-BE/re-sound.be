-- ============================================================================
-- STRETCH CLIENT PORTAL — database schema (run once in Supabase: SQL Editor)
--
-- Design decisions:
--   • The pricebook holds ONLY client-safe columns. Margin % and the cost
--     build-up stay in the Alto Pricing System Excel and are never uploaded.
--   • Every client account is granted a set of price groups ("markets");
--     row-level security enforces visibility in the database itself, so even
--     an application bug cannot leak another market's pricing.
--   • All writes go through the service-role key (admin API routes / CLI
--     scripts). Signed-in users are read-only by construction: no INSERT /
--     UPDATE / DELETE policies exist.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Portal user profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.portal_users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  company     text,
  role        text not null default 'client' check (role in ('client', 'admin')),
  -- Price groups this account may see (values match pricebook.market).
  markets     text[] not null default '{}',
  all_markets boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Pricebook — flat product × market pricelist (mirrors the Excel PriceBook)
-- ---------------------------------------------------------------------------
create table if not exists public.pricebook (
  id            bigint generated always as identity primary key,
  category      text not null,
  code          text,
  product       text not null,
  unit          text,
  market        text not null,
  price_eur     numeric(12, 2) not null,
  price_pln     numeric(12, 2),
  product_group text,
  -- Occurrence number among rows sharing category+product+market: the Excel
  -- PriceBook legitimately contains same-named rows with different prices
  -- (e.g. roll width bands), and none may be dropped.
  seq           integer not null default 1,
  sort          integer not null default 0,
  updated_at    timestamptz not null default now(),
  unique (category, product, market, seq)
);

create index if not exists pricebook_market_idx on public.pricebook (market);
create index if not exists pricebook_sort_idx on public.pricebook (sort);

-- ---------------------------------------------------------------------------
-- 3. Pricelist metadata (single row: version, FX reference, source file)
-- ---------------------------------------------------------------------------
create table if not exists public.pricebook_meta (
  id         boolean primary key default true check (id), -- forces one row
  version    text,
  fx_eur_pln numeric(10, 4),
  source     text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. Row-level security
-- ---------------------------------------------------------------------------
alter table public.portal_users  enable row level security;
alter table public.pricebook     enable row level security;
alter table public.pricebook_meta enable row level security;

-- A user may read their own profile (needed at login / session resolution).
drop policy if exists portal_users_read_own on public.portal_users;
create policy portal_users_read_own
  on public.portal_users for select
  to authenticated
  using (id = auth.uid());

-- Pricebook: visible when the signed-in, ACTIVE profile is granted the row's
-- market (or all markets). Admins always see everything.
drop policy if exists pricebook_read_by_market on public.pricebook;
create policy pricebook_read_by_market
  on public.pricebook for select
  to authenticated
  using (
    exists (
      select 1
      from public.portal_users u
      where u.id = auth.uid()
        and u.active
        and (u.all_markets or u.role = 'admin' or pricebook.market = any (u.markets))
    )
  );

-- Metadata: readable by any active portal account.
drop policy if exists pricebook_meta_read on public.pricebook_meta;
create policy pricebook_meta_read
  on public.pricebook_meta for select
  to authenticated
  using (
    exists (
      select 1 from public.portal_users u
      where u.id = auth.uid() and u.active
    )
  );

-- No write policies on purpose: only the service role (which bypasses RLS)
-- may write, and it is used exclusively by the admin API routes/CLI scripts.
