-- 0002 — place_order(): concurrency-safe idempotency, no burnt reference
-- numbers on a replay, and the reference year taken in Belgian local time.
--
-- Two submissions with the same idempotency key could previously race past
-- the initial SELECT, both take a sequence number, and the second one fail on
-- the unique index. Now the INSERT itself is the check (ON CONFLICT DO
-- NOTHING); the losing call re-reads the winner's row and returns it. The
-- sequence number is drawn only when the key is known to be new, so a replay
-- never consumes one. The year in RS-<year>-<n> follows Europe/Brussels, so
-- an order placed at 00:30 on 1 January is a new-year order, not a UTC one.
-- Behaviour, arguments and grants are otherwise unchanged (see 0001).

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
