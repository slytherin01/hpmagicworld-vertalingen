-- Hpmagicworld portal translations
create table if not exists public.portal_translations (
  alias text primary key,
  folder text not null default '',
  nl text not null default '',
  en text not null default '',
  pt text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.portal_translations enable row level security;

-- Public portal may read translations; no anonymous writes.
drop policy if exists "Portal translations are readable" on public.portal_translations;
create policy "Portal translations are readable"
on public.portal_translations for select
to anon, authenticated
using (true);

-- Only signed-in admin/moderator accounts from user_roles may change translations.
drop policy if exists "Admins and moderators manage portal translations" on public.portal_translations;
create policy "Admins and moderators manage portal translations"
on public.portal_translations for all
to authenticated
using (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
  )
)
with check (
  exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('admin', 'moderator')
  )
);

create index if not exists portal_translations_folder_idx
on public.portal_translations(folder);
