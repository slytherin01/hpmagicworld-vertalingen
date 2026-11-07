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
