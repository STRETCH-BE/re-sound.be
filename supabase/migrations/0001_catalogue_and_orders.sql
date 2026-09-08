-- ============================================================================
-- re-sound.be — catalogue and orders
--
-- Applied 8 September 2026 to Supabase project toroqgofzsanxcisdbkn
-- (eu-central-1), the project created for this site next to the STRETCH one.
--
-- Design:
--   • The price list is the source of truth for every price the site shows
--     and every amount an order is priced at. One row per re-sound article
--     (RS-<model>-<article>), grouped by product and by category.
--   • The catalogue is public information (it is printed on the site), so the
--     anon key may read it. Orders, order lines and the supplier
--     cross-reference have NO policies: they are reachable only through the
--     service role or the place_order() function below.
--   • place_order() is the single write path. It runs as SECURITY DEFINER so
--     the site can store an order with the anon key kept on the server, and
--     it assigns the reference from a sequence in the same transaction as the
--     line snapshot. What the buyer was shown is what is stored; lines are
--     never recomputed from a later price list.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Price lists — one row per published list ('booths-2026')
-- ---------------------------------------------------------------------------
create table if not exists public.price_lists (
  id          text primary key,
  name        text not null,
  currency    text not null default 'EUR',
  valid_from  date,
  price_basis text,
  terms       jsonb not null default '{}'::jsonb,
  packaging   jsonb not null default '[]'::jsonb,
  contacts    jsonb not null default '[]'::jsonb,
  notes       text[] not null default '{}',
  source_file text,
  imported_at timestamptz not null default now(),
  active      boolean not null default true
);

-- ---------------------------------------------------------------------------
-- 2. Products — the seven booth models plus the two textile products the
--    site sells per set / per piece
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id            text primary key,                 -- 'solo-flex', 'duo-work', 'interior'
  price_list_id text references public.price_lists (id),
  model_code    text unique,                      -- 'SF' … booths only
  name          text not null,
  description   text,
  kind          text not null check (kind in ('booth', 'panel')),
  unit          text not null check (unit in ('booth', 'set', 'piece', 'm2')),
  -- The product page this model is sold from. Several models may share a
  -- page (Duo Work and Duo Flex are both /products/duo); null = no page yet.
  website_slug  text,
  max_qty       integer not null default 25,
  ref_page      integer,
  tech          jsonb not null default '{}'::jsonb,   -- technical & logistics rows
  sort          integer not null default 0,
  active        boolean not null default true,
  updated_at    timestamptz not null default now()
);
create index if not exists products_website_slug_idx on public.products (website_slug) where website_slug is not null;

-- ---------------------------------------------------------------------------
-- 3. Categories — how a group of articles is chosen in the configurator
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  key         text primary key,                   -- 'construction', 'exterior_color', …
  name        text not null,                      -- English, as on the price list
  labels      jsonb not null default '{}'::jsonb, -- { "nl": "…", "fr": "…" }
  select_mode text not null check (select_mode in ('single', 'multi')),
  required    boolean not null default true,
  sort        integer not null default 0
);

-- ---------------------------------------------------------------------------
-- 4. Articles — one row per re-sound article number
-- ---------------------------------------------------------------------------
create table if not exists public.articles (
  code           text primary key,                -- 'RS-SF-BF'
  product_id     text not null references public.products (id) on delete cascade,
  category_key   text not null references public.categories (key),
  sheet_category text,                            -- as written on the model sheet
  "group"        text,
  description    text not null,                   -- English, as on the price list
  labels         jsonb not null default '{}'::jsonb,
  price_cents    integer,                         -- null = on request
  price_type     text not null check (price_type in ('base', 'included', 'option', 'credit')),
  -- Modular XL fire protection is priced per 0.9 m segment (base module = 2,
  -- each extension article adds `segments`).
  per_segment    boolean not null default false,
  segments       integer,
  is_default     boolean not null default false,
  source         text not null default 'price-list' check (source in ('price-list', 'website')),
  notes          text,
  sort           integer not null default 0,
  active         boolean not null default true,
  updated_at     timestamptz not null default now()
);
create index if not exists articles_product_idx on public.articles (product_id, sort);

-- ---------------------------------------------------------------------------
-- 5. Supplier cross-reference — INTERNAL. Purchase prices and margins. No
--    policy: service role only. Never printed, never exported to the repo.
-- ---------------------------------------------------------------------------
create table if not exists public.supplier_articles (
  article_code   text primary key references public.articles (code) on delete cascade,
  supplier       text,
  supplier_code  text,
  purchase_cents integer,
  sales_cents    integer,
  margin_cents   integer,
  notes          text
);

-- ---------------------------------------------------------------------------
-- 6. Orders — one row per order, a frozen line snapshot per order
-- ---------------------------------------------------------------------------
create sequence if not exists public.order_ref_seq;

create table if not exists public.orders (
  id                   uuid primary key default gen_random_uuid(),
  reference            text not null unique,      -- RS-2026-0001
  status               text not null default 'received'
                       check (status in ('received', 'confirmed', 'in_production', 'shipped', 'cancelled')),
  locale               text not null,
  product_id           text references public.products (id),
  website_slug         text,
  quantity             integer not null,
  config               jsonb not null,            -- the submitted selection, verbatim
  customer_type        text not null check (customer_type in ('company', 'private')),
  company_name         text,
  vat_number           text,
  vat_number_status    text,                      -- valid | invalid | unverified | not_eligible
  vat_registered_name  text,
  first_name           text not null,
  last_name            text not null,
  email                text not null,
  phone                text,
  street               text not null,
  postal_code          text not null,
  city                 text not null,
  country              text not null,
  notes                text,
  vat_mode             text not null,             -- domestic | reverse-charge | export
  vat_rate             numeric(5,4) not null,
  net_cents            integer not null,
  vat_cents            integer not null,
  gross_cents          integer not null,
  has_on_request_items boolean not null default false,
  price_list_id        text,
  internal_email_sent  boolean not null default false,
  customer_email_sent  boolean not null default false,
  idempotency_key      text unique,
  client_hash          text,                      -- hashed address, abuse triage only
  user_agent           text,
  internal_note        text,                      -- admin only, never mailed
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_email_idx   on public.orders (email, created_at desc);
create index if not exists orders_status_idx  on public.orders (status, created_at desc);

create table if not exists public.order_lines (
  id               bigint generated always as identity primary key,
  order_id         uuid not null references public.orders (id) on delete cascade,
  line_no          integer not null,
  article_code     text,                          -- null for website-only lines
  category_key     text,
  description      text not null,
  price_type       text,
  qty              integer not null,
  unit_price_cents integer,                       -- null = on request
  line_total_cents integer,
  note             text
);
create index if not exists order_lines_order_idx on public.order_lines (order_id, line_no);

-- ---------------------------------------------------------------------------
-- 7. Row-level security
-- ---------------------------------------------------------------------------
alter table public.price_lists       enable row level security;
alter table public.products          enable row level security;
alter table public.categories        enable row level security;
alter table public.articles          enable row level security;
alter table public.supplier_articles enable row level security;
alter table public.orders            enable row level security;
alter table public.order_lines       enable row level security;

drop policy if exists price_lists_read on public.price_lists;
create policy price_lists_read on public.price_lists for select to anon, authenticated using (active);

drop policy if exists products_read on public.products;
create policy products_read on public.products for select to anon, authenticated using (active);

drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select to anon, authenticated using (true);

drop policy if exists articles_read on public.articles;
create policy articles_read on public.articles for select to anon, authenticated using (active);

-- ---------------------------------------------------------------------------
-- 8. place_order — the one write path
-- ---------------------------------------------------------------------------
create or replace function public.place_order(p_order jsonb, p_lines jsonb)
returns table (order_id uuid, order_reference text, order_created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id      uuid;
  v_ref     text;
  v_created timestamptz;
  v_key     text := nullif(p_order->>'idempotency_key', '');
  v_line    jsonb;
  v_n       integer := 0;
begin
  -- The same submission twice (a retry after a timeout) is one order.
  if v_key is not null then
    select o.id, o.reference, o.created_at into v_id, v_ref, v_created
      from public.orders o where o.idempotency_key = v_key;
    if found then
      return query select v_id, v_ref, v_created;
      return;
    end if;
  end if;

  v_ref := 'RS-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_ref_seq')::text, 4, '0');

  insert into public.orders (
    reference, locale, product_id, website_slug, quantity, config,
    customer_type, company_name, vat_number, vat_number_status, vat_registered_name,
    first_name, last_name, email, phone, street, postal_code, city, country, notes,
    vat_mode, vat_rate, net_cents, vat_cents, gross_cents, has_on_request_items,
    price_list_id, idempotency_key, client_hash, user_agent
  ) values (
    v_ref,
    p_order->>'locale',
    nullif(p_order->>'product_id', ''),
    nullif(p_order->>'website_slug', ''),
    (p_order->>'quantity')::int,
    coalesce(p_order->'config', '{}'::jsonb),
    p_order->>'customer_type',
    nullif(p_order->>'company_name', ''),
    nullif(p_order->>'vat_number', ''),
    nullif(p_order->>'vat_number_status', ''),
    nullif(p_order->>'vat_registered_name', ''),
    p_order->>'first_name',
    p_order->>'last_name',
    p_order->>'email',
    nullif(p_order->>'phone', ''),
    p_order->>'street',
    p_order->>'postal_code',
    p_order->>'city',
    p_order->>'country',
    nullif(p_order->>'notes', ''),
    p_order->>'vat_mode',
    (p_order->>'vat_rate')::numeric,
    (p_order->>'net_cents')::int,
    (p_order->>'vat_cents')::int,
    (p_order->>'gross_cents')::int,
    coalesce((p_order->>'has_on_request_items')::boolean, false),
    nullif(p_order->>'price_list_id', ''),
    v_key,
    nullif(p_order->>'client_hash', ''),
    nullif(p_order->>'user_agent', '')
  )
  returning orders.id, orders.reference, orders.created_at into v_id, v_ref, v_created;

  for v_line in select * from jsonb_array_elements(coalesce(p_lines, '[]'::jsonb)) loop
    v_n := v_n + 1;
    insert into public.order_lines (
      order_id, line_no, article_code, category_key, description, price_type, qty,
      unit_price_cents, line_total_cents, note
    ) values (
      v_id, v_n,
      nullif(v_line->>'article_code', ''),
      nullif(v_line->>'category_key', ''),
      v_line->>'description',
      nullif(v_line->>'price_type', ''),
      (v_line->>'qty')::int,
      (v_line->>'unit_price_cents')::int,
      (v_line->>'line_total_cents')::int,
      nullif(v_line->>'note', '')
    );
  end loop;

  return query select v_id, v_ref, v_created;
end;
$$;

revoke all on function public.place_order(jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb) to anon, service_role;

-- Written once the two e-mails have gone out (or failed), so the table says
-- which orders still need a hand-written confirmation.
create or replace function public.mark_order_mailed(p_id uuid, p_internal boolean, p_customer boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update public.orders
     set internal_email_sent = p_internal,
         customer_email_sent = p_customer,
         updated_at = now()
   where id = p_id;
$$;

revoke all on function public.mark_order_mailed(uuid, boolean, boolean) from public;
grant execute on function public.mark_order_mailed(uuid, boolean, boolean) to anon, service_role;
