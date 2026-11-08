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
