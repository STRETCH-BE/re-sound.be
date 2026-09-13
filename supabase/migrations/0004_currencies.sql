-- 0004 — prices in euros, one column per currency (13 September 2026).
--
-- Until now every price was an integer in cents (price_cents = 411875 for
-- € 4 118,75), which is awkward to edit in the dashboard. From now on:
--   - articles.price_eur holds the euro amount as a decimal (4118.75);
--   - articles.price_isk / price_pln / price_chf / price_usd hold the same
--     article's price in those currencies, each typed by hand (never
--     converted by the site); empty = no price in that currency;
--   - public.currencies says which site locales are priced in which
--     currency and whether that currency is switched on. A locale's
--     currency is the ACTIVE currency whose `locales` array contains it,
--     else EUR. ISK is wired to the `is` locale and PLN to `pl` (a Polish
--     locale does not exist yet); both start inactive, so nothing on the
--     site changes until the prices are filled in and `active` is set;
--   - public.prices is the view to edit prices in: one row per article,
--     the five price columns side by side. It is updatable (single table);
--   - orders.currency records the currency an order was priced in and
--     place_order() stores it (default EUR for older builds that omit it).
-- price_cents is kept as a read-only GENERATED mirror of price_eur so the
-- build that is live while this runs keeps reading it; the site now reads
-- the price_* columns. Idempotent: every statement can run again.

begin;

-- ---------------------------------------------------------------------------
-- 1. Currencies
-- ---------------------------------------------------------------------------
create table if not exists public.currencies (
  code       text primary key check (code ~ '^[A-Z]{3}$'),
  name       text not null,
  minor_unit smallint not null default 2 check (minor_unit in (0, 2)),
  symbol     text,
  locales    text[] not null default '{}',
  active     boolean not null default false,
  sort       integer not null default 0
);
comment on table public.currencies is 'Currencies the catalogue can be priced in. locales = site locales shown in this currency (empty for EUR, the default for every other locale); active = switch it on once every article that needs a price in it has one.';
comment on column public.currencies.minor_unit is '0 for ISK (no decimals), 2 for the others.';

insert into public.currencies (code, name, minor_unit, symbol, locales, active, sort) values
  ('EUR', 'Euro', 2, '€', '{}', true, 1),
  ('ISK', 'Icelandic króna', 0, 'kr.', '{is}', false, 2),
  ('PLN', 'Polish złoty', 2, 'zł', '{pl}', false, 3),
  ('CHF', 'Swiss franc', 2, 'CHF', '{}', false, 4),
  ('USD', 'US dollar', 2, '$', '{}', false, 5)
on conflict (code) do update set name = excluded.name, minor_unit = excluded.minor_unit, symbol = excluded.symbol,
  locales = excluded.locales, sort = excluded.sort;
-- `active` is Michael's switch and is deliberately not overwritten on re-run.

alter table public.currencies enable row level security;
drop policy if exists currencies_read on public.currencies;
create policy currencies_read on public.currencies for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- 2. Article prices as decimals, one column per currency
-- ---------------------------------------------------------------------------
alter table public.articles
  add column if not exists price_eur numeric(12, 2),
  add column if not exists price_isk numeric(12, 0),
  add column if not exists price_pln numeric(12, 2),
  add column if not exists price_chf numeric(12, 2),
  add column if not exists price_usd numeric(12, 2);

-- Backfill the euro amount from the old cents (first run only: afterwards
-- price_cents is derived from price_eur and this is a no-op).
update public.articles set price_eur = price_cents / 100.0 where price_eur is null and price_cents is not null;

alter table public.articles drop column if exists price_cents;
alter table public.articles add column price_cents integer
  generated always as (case when price_eur is null then null else round(price_eur * 100)::integer end) stored;

comment on column public.articles.price_eur is 'Sales price in euros excl. VAT, e.g. 4118.75. Empty = on request. Edit prices in the view public.prices.';
comment on column public.articles.price_isk is 'Price in Icelandic krónur (whole krónur), typed by hand; empty = no ISK price.';
comment on column public.articles.price_pln is 'Price in Polish złoty, typed by hand; empty = no PLN price.';
comment on column public.articles.price_chf is 'Price in Swiss francs, typed by hand; empty = no CHF price.';
comment on column public.articles.price_usd is 'Price in US dollars, typed by hand; empty = no USD price.';
comment on column public.articles.price_cents is 'Read-only mirror of price_eur in cents (generated). Older builds read it; edit price_eur instead.';

-- ---------------------------------------------------------------------------
-- 3. The editing surface
-- ---------------------------------------------------------------------------
create or replace view public.prices with (security_invoker = true) as
  select code, product_id, category_key, description, price_eur, price_isk, price_pln, price_chf, price_usd, price_type, active
  from public.articles;
comment on view public.prices is 'Edit prices here: one row per article, euro and the other currencies side by side. Amounts excl. VAT; empty = on request / no price in that currency. Updatable: a change here changes public.articles.';

-- ---------------------------------------------------------------------------
-- 4. Orders carry their currency
-- ---------------------------------------------------------------------------
alter table public.orders add column if not exists currency text not null default 'EUR'
  references public.currencies (code);
comment on column public.orders.currency is 'Currency the order was priced in; net_cents, vat_cents, gross_cents and the lines are in its minor unit (cents; whole krónur for ISK).';

-- Same function as 0002 plus the currency column; arguments and grants unchanged.
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

  v_ref := 'RS-' || to_char(now() at time zone 'Europe/Brussels', 'YYYY') || '-'
        || lpad(nextval('public.order_ref_seq')::text, 4, '0');

  insert into public.orders (
    reference, locale, product_id, website_slug, quantity, config,
    customer_type, company_name, vat_number, vat_number_status, vat_registered_name,
    first_name, last_name, email, phone, street, postal_code, city, country, notes,
    currency, vat_mode, vat_rate, net_cents, vat_cents, gross_cents, has_on_request_items,
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
    coalesce(nullif(p_order->>'currency', ''), 'EUR'),
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
  on conflict (idempotency_key) do nothing
  returning orders.id, orders.reference, orders.created_at into v_id, v_ref, v_created;

  -- Lost the race against an identical submission: hand back the winner's row.
  if v_id is null then
    select o.id, o.reference, o.created_at into v_id, v_ref, v_created
      from public.orders o where o.idempotency_key = v_key;
    return query select v_id, v_ref, v_created;
    return;
  end if;

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

commit;
