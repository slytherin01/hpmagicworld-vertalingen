-- Muggle Ministry — geconsolideerde, data-veilige portaalmigratie
-- Uitvoeren in Supabase SQL Editor nadat een databaseback-up is gemaakt.
-- Deze migratie verwijdert GEEN tabellen, rijen, accounts, policies buiten de hieronder
-- expliciet beheerde policy-namen, of bestaande ticketgegevens.
-- CREATE TABLE IF NOT EXISTS en INSERT ... ON CONFLICT behouden bestaande records.

begin;

-- Eenmalig uitvoeren in Supabase SQL Editor.
create table if not exists public.page_content (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('text','button')),
  page text not null default 'all',
  title text not null,
  url text not null default '',
  body text not null default '',
  placement text not null default 'top' check (placement in ('top','bottom','sidebar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.page_content enable row level security;

drop policy if exists "Admins can read page content" on public.page_content;
create policy "Admins can read page content"
on public.page_content for select to authenticated
using (exists (
  select 1 from public.translation_admins a
  where a.user_id = auth.uid()
));

drop policy if exists "Admins can insert page content" on public.page_content;
create policy "Admins can insert page content"
on public.page_content for insert to authenticated
with check (exists (
  select 1 from public.translation_admins a
  where a.user_id = auth.uid()
));

drop policy if exists "Admins can update page content" on public.page_content;
create policy "Admins can update page content"
on public.page_content for update to authenticated
using (exists (
  select 1 from public.translation_admins a
  where a.user_id = auth.uid()
))
with check (exists (
  select 1 from public.translation_admins a
  where a.user_id = auth.uid()
));

drop policy if exists "Admins can delete page content" on public.page_content;
create policy "Admins can delete page content"
on public.page_content for delete to authenticated
using (exists (
  select 1 from public.translation_admins a
  where a.user_id = auth.uid()
));


-- Eenmalig uitvoeren in Supabase SQL Editor
create table if not exists public.portal_effects (
  effect_key text primary key,
  enabled boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.portal_effects enable row level security;

drop policy if exists "Public can read portal effects" on public.portal_effects;
create policy "Public can read portal effects"
on public.portal_effects for select to anon, authenticated
using (true);

drop policy if exists "Admins can manage portal effects" on public.portal_effects;
create policy "Admins can manage portal effects"
on public.portal_effects for all to authenticated
using (exists (select 1 from public.translation_admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.translation_admins a where a.user_id = auth.uid()));

insert into public.portal_effects (effect_key, enabled)
values
 ('spring',false),('summer',false),('autumn',false),('winter',false),
 ('christmas',false),('halloween',false),('snow',false),('fireworks',false),('sinterklaas',false)
on conflict (effect_key) do nothing;


-- Aanvullende instellingen voor onderhoudsbericht en countdown
create table if not exists public.portal_widgets (
  id integer primary key default 1 check (id = 1),
  maintenance_enabled boolean not null default false,
  maintenance_text_nl text not null default 'Het portaal is tijdelijk in onderhoud. Probeer het later opnieuw.',
  maintenance_text_en text not null default 'The portal is temporarily under maintenance. Please try again later.',
  maintenance_text_pt text not null default 'O portal está temporariamente em manutenção. Tente novamente mais tarde.',
  countdown_enabled boolean not null default false,
  countdown_title_nl text not null default 'Aftellen naar...',
  countdown_title_en text not null default 'Countdown to...',
  countdown_title_pt text not null default 'Contagem decrescente para...',
  countdown_target timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.portal_widgets enable row level security;
drop policy if exists "Public can read portal widgets" on public.portal_widgets;
create policy "Public can read portal widgets" on public.portal_widgets for select to anon, authenticated using (true);
drop policy if exists "Admins can manage portal widgets" on public.portal_widgets;
create policy "Admins can manage portal widgets" on public.portal_widgets for all to authenticated
using (exists (select 1 from public.translation_admins a where a.user_id=auth.uid()))
with check (exists (select 1 from public.translation_admins a where a.user_id=auth.uid()));
insert into public.portal_widgets (id) values (1) on conflict (id) do nothing;


commit;
