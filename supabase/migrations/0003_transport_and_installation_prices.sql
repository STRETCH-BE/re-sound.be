-- 0003 — transport and installation prices (Michael, 12 September 2026).
--
-- Transport within mainland Europe and installation by Re-Sound become fixed
-- amounts per model for the five booths sold online (Solo ECO, Solo Flex,
-- Duo Work, Duo Flex, Modular XL). Two schema changes carry them:
--   - categories.select_mode gains 'auto': an auto category is never offered
--     as a choice; the site adds its line by rule (canonicalSelection in
--     src/lib/catalogue/select.ts — rule 8 in src/lib/catalogue/types.ts);
--   - articles.per_extension: line quantity = order quantity × extension
--     segments, i.e. the sum of `segments` over the selected
--     additional_segments articles (Modular XL: AS1 = 1, AS2 = 2, AS3 = 3);
--     when that sum is 0 the line is omitted (rule 7).
-- Then the data: two auto categories (installation_extension, transport),
-- the five installation prices, one "installation of an extra element" line
-- for Modular XL, and two transport lines per booth: …-TRANSPORT-EU (flat
-- rate, default) and …-TRANSPORT-XX (on request; the order form's islands
-- GB, XI, IE, MT, CY, IS). Solo Stand, Modular 4, Interior, Divide and Solid
-- received no figure: their installation stays on request and they get no
-- transport line.
-- Idempotent: every statement can run again. supabase/seed/booths-2026.sql
-- carries the same rows (block "Services priced by Michael, 12 Sep 2026").
-- The articles_read policy (0001) already covers the new active rows.

begin;

-- ---------------------------------------------------------------------------
-- 1. select_mode 'auto'
-- ---------------------------------------------------------------------------
alter table public.categories drop constraint if exists categories_select_mode_check;
alter table public.categories add constraint categories_select_mode_check check (select_mode in ('single', 'multi', 'auto'));

-- ---------------------------------------------------------------------------
-- 2. per_extension
-- ---------------------------------------------------------------------------
alter table public.articles add column if not exists per_extension boolean not null default false;
comment on column public.articles.per_extension is 'Line quantity = order quantity × extension segments (sum of segments over the selected additional_segments articles); omitted when 0.';

-- ---------------------------------------------------------------------------
-- 3. Categories added by rule, never offered as a choice
-- ---------------------------------------------------------------------------
insert into public.categories (key, name, labels, select_mode, required, sort) values
  ('installation_extension', 'Installation of extra elements', '{"nl":"Installatie van extra elementen","fr":"Installation des éléments supplémentaires","de":"Montage zusätzlicher Elemente","es":"Instalación de elementos adicionales","pt":"Instalação de elementos adicionais","da":"Montering af ekstra elementer","sv":"Montering av extra element","no":"Montering av ekstra elementer","is":"Uppsetning aukaeininga"}'::jsonb, 'auto', false, 13),
  ('transport', 'Transport', '{"nl":"Transport","fr":"Transport","de":"Transport","es":"Transporte","pt":"Transporte","da":"Transport","sv":"Transport","no":"Transport","is":"Flutningur"}'::jsonb, 'auto', false, 14)
on conflict (key) do update set name = excluded.name, labels = excluded.labels, select_mode = excluded.select_mode, required = excluded.required, sort = excluded.sort;

-- ---------------------------------------------------------------------------
-- 4. Installation prices (WEB-SOLO-STAND-INST, WEB-MODULAR-4-INST,
--    WEB-INTERIOR-INST, WEB-DIVIDE-INST, WEB-SOLID-INST stay on request)
-- ---------------------------------------------------------------------------
update public.articles set price_cents = 87500, notes = 'Michael, 12 Sep 2026: € 875 excl. VAT', updated_at = now() where code = 'WEB-SOLO-ECO-INST';
update public.articles set price_cents = 124500, notes = 'Michael, 12 Sep 2026: € 1 245 excl. VAT', updated_at = now() where code = 'WEB-SOLO-FLEX-INST';
update public.articles set price_cents = 124500, notes = 'Michael, 12 Sep 2026: € 1 245 excl. VAT', updated_at = now() where code = 'WEB-DUO-WORK-INST';
update public.articles set price_cents = 124500, notes = 'Michael, 12 Sep 2026: € 1 245 excl. VAT', updated_at = now() where code = 'WEB-DUO-FLEX-INST';
update public.articles set price_cents = 164500, description = 'Installation by Re-Sound (main module)', labels = '{"nl":"Installatie door Re-Sound (basismodule)","fr":"Installation par Re-Sound (module de base)","de":"Montage durch Re-Sound (Basismodul)","es":"Instalación por Re-Sound (módulo base)","pt":"Instalação pela Re-Sound (módulo base)","da":"Montering af Re-Sound (basismodul)","sv":"Montering av Re-Sound (basmodul)","no":"Montering av Re-Sound (basismodul)","is":"Uppsetning af hálfu Re-Sound (grunneining)"}'::jsonb, notes = 'Michael, 12 Sep 2026: € 1 645 excl. VAT', updated_at = now() where code = 'WEB-MODULAR-XL-INST';

-- ---------------------------------------------------------------------------
-- 5. Installation of an extra element (Modular XL) — per_extension
-- 6. Transport lines per booth sold online
-- ---------------------------------------------------------------------------
insert into public.articles (code, product_id, category_key, sheet_category, "group", description, labels, price_cents, price_type, per_segment, per_extension, segments, is_default, source, notes, sort, active) values
  ('WEB-MODULAR-XL-INST-EXT', 'modular-xl', 'installation_extension', null, 'Services', 'Installation of an extra element', '{"nl":"Installatie van een extra element","fr":"Installation d''un élément supplémentaire","de":"Montage eines zusätzlichen Elements","es":"Instalación de un elemento adicional","pt":"Instalação de um elemento adicional","da":"Montering af et ekstra element","sv":"Montering av ett extra element","no":"Montering av et ekstra element","is":"Uppsetning á aukaeiningu"}'::jsonb, 124500, 'option', false, true, null, false, 'website', 'Michael, 12 Sep 2026: € 1 245 per extra module; added automatically when installation is chosen', 901, true),
  ('WEB-SOLO-ECO-TRANSPORT-EU', 'solo-eco', 'transport', null, 'Services', 'Transport within mainland Europe', '{"nl":"Transport binnen het vasteland van Europa","fr":"Transport en Europe continentale","de":"Transport innerhalb des europäischen Festlands","es":"Transporte en Europa continental","pt":"Transporte na Europa continental","da":"Transport inden for det europæiske fastland","sv":"Transport inom det europeiska fastlandet","no":"Transport innenfor det europeiske fastlandet","is":"Flutningur innan meginlands Evrópu"}'::jsonb, 30000, 'option', false, false, null, true, 'website', 'Michael, 12 Sep 2026: € 300 within mainland Europe, per unit', 950, true),
  ('WEB-SOLO-ECO-TRANSPORT-XX', 'solo-eco', 'transport', null, 'Services', 'Transport outside mainland Europe', '{"nl":"Transport buiten het vasteland van Europa","fr":"Transport hors Europe continentale","de":"Transport außerhalb des europäischen Festlands","es":"Transporte fuera de Europa continental","pt":"Transporte fora da Europa continental","da":"Transport uden for det europæiske fastland","sv":"Transport utanför det europeiska fastlandet","no":"Transport utenfor det europeiske fastlandet","is":"Flutningur utan meginlands Evrópu"}'::jsonb, null, 'option', false, false, null, false, 'website', 'Outside mainland Europe transport is quoted with the order confirmation', 951, true),
  ('WEB-SOLO-FLEX-TRANSPORT-EU', 'solo-flex', 'transport', null, 'Services', 'Transport within mainland Europe', '{"nl":"Transport binnen het vasteland van Europa","fr":"Transport en Europe continentale","de":"Transport innerhalb des europäischen Festlands","es":"Transporte en Europa continental","pt":"Transporte na Europa continental","da":"Transport inden for det europæiske fastland","sv":"Transport inom det europeiska fastlandet","no":"Transport innenfor det europeiske fastlandet","is":"Flutningur innan meginlands Evrópu"}'::jsonb, 50000, 'option', false, false, null, true, 'website', 'Michael, 12 Sep 2026: € 500 within mainland Europe, per unit', 950, true),
  ('WEB-SOLO-FLEX-TRANSPORT-XX', 'solo-flex', 'transport', null, 'Services', 'Transport outside mainland Europe', '{"nl":"Transport buiten het vasteland van Europa","fr":"Transport hors Europe continentale","de":"Transport außerhalb des europäischen Festlands","es":"Transporte fuera de Europa continental","pt":"Transporte fora da Europa continental","da":"Transport uden for det europæiske fastland","sv":"Transport utanför det europeiska fastlandet","no":"Transport utenfor det europeiske fastlandet","is":"Flutningur utan meginlands Evrópu"}'::jsonb, null, 'option', false, false, null, false, 'website', 'Outside mainland Europe transport is quoted with the order confirmation', 951, true),
  ('WEB-DUO-WORK-TRANSPORT-EU', 'duo-work', 'transport', null, 'Services', 'Transport within mainland Europe', '{"nl":"Transport binnen het vasteland van Europa","fr":"Transport en Europe continentale","de":"Transport innerhalb des europäischen Festlands","es":"Transporte en Europa continental","pt":"Transporte na Europa continental","da":"Transport inden for det europæiske fastland","sv":"Transport inom det europeiska fastlandet","no":"Transport innenfor det europeiske fastlandet","is":"Flutningur innan meginlands Evrópu"}'::jsonb, 50000, 'option', false, false, null, true, 'website', 'Michael, 12 Sep 2026: € 500 within mainland Europe, per unit', 950, true),
  ('WEB-DUO-WORK-TRANSPORT-XX', 'duo-work', 'transport', null, 'Services', 'Transport outside mainland Europe', '{"nl":"Transport buiten het vasteland van Europa","fr":"Transport hors Europe continentale","de":"Transport außerhalb des europäischen Festlands","es":"Transporte fuera de Europa continental","pt":"Transporte fora da Europa continental","da":"Transport uden for det europæiske fastland","sv":"Transport utanför det europeiska fastlandet","no":"Transport utenfor det europeiske fastlandet","is":"Flutningur utan meginlands Evrópu"}'::jsonb, null, 'option', false, false, null, false, 'website', 'Outside mainland Europe transport is quoted with the order confirmation', 951, true),
  ('WEB-DUO-FLEX-TRANSPORT-EU', 'duo-flex', 'transport', null, 'Services', 'Transport within mainland Europe', '{"nl":"Transport binnen het vasteland van Europa","fr":"Transport en Europe continentale","de":"Transport innerhalb des europäischen Festlands","es":"Transporte en Europa continental","pt":"Transporte na Europa continental","da":"Transport inden for det europæiske fastland","sv":"Transport inom det europeiska fastlandet","no":"Transport innenfor det europeiske fastlandet","is":"Flutningur innan meginlands Evrópu"}'::jsonb, 50000, 'option', false, false, null, true, 'website', 'Michael, 12 Sep 2026: € 500 within mainland Europe, per unit', 950, true),
  ('WEB-DUO-FLEX-TRANSPORT-XX', 'duo-flex', 'transport', null, 'Services', 'Transport outside mainland Europe', '{"nl":"Transport buiten het vasteland van Europa","fr":"Transport hors Europe continentale","de":"Transport außerhalb des europäischen Festlands","es":"Transporte fuera de Europa continental","pt":"Transporte fora da Europa continental","da":"Transport uden for det europæiske fastland","sv":"Transport utanför det europeiska fastlandet","no":"Transport utenfor det europeiske fastlandet","is":"Flutningur utan meginlands Evrópu"}'::jsonb, null, 'option', false, false, null, false, 'website', 'Outside mainland Europe transport is quoted with the order confirmation', 951, true),
  ('WEB-MODULAR-XL-TRANSPORT-EU', 'modular-xl', 'transport', null, 'Services', 'Transport within mainland Europe', '{"nl":"Transport binnen het vasteland van Europa","fr":"Transport en Europe continentale","de":"Transport innerhalb des europäischen Festlands","es":"Transporte en Europa continental","pt":"Transporte na Europa continental","da":"Transport inden for det europæiske fastland","sv":"Transport inom det europeiska fastlandet","no":"Transport innenfor det europeiske fastlandet","is":"Flutningur innan meginlands Evrópu"}'::jsonb, 75000, 'option', false, false, null, true, 'website', 'Michael, 12 Sep 2026: € 750 within mainland Europe, per unit', 950, true),
  ('WEB-MODULAR-XL-TRANSPORT-XX', 'modular-xl', 'transport', null, 'Services', 'Transport outside mainland Europe', '{"nl":"Transport buiten het vasteland van Europa","fr":"Transport hors Europe continentale","de":"Transport außerhalb des europäischen Festlands","es":"Transporte fuera de Europa continental","pt":"Transporte fora da Europa continental","da":"Transport uden for det europæiske fastland","sv":"Transport utanför det europeiska fastlandet","no":"Transport utenfor det europeiske fastlandet","is":"Flutningur utan meginlands Evrópu"}'::jsonb, null, 'option', false, false, null, false, 'website', 'Outside mainland Europe transport is quoted with the order confirmation', 951, true)
on conflict (code) do update set product_id = excluded.product_id, category_key = excluded.category_key, sheet_category = excluded.sheet_category,
  "group" = excluded."group", description = excluded.description, labels = excluded.labels, price_cents = excluded.price_cents, price_type = excluded.price_type,
  per_segment = excluded.per_segment, per_extension = excluded.per_extension, segments = excluded.segments, is_default = excluded.is_default, source = excluded.source,
  notes = excluded.notes, sort = excluded.sort, active = excluded.active, updated_at = now();

commit;
