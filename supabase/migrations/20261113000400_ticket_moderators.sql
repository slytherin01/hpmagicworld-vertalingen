-- Manage Forumotion ticket moderators from the separate Admin tool.
begin;
create table if not exists public.ticket_moderators (
  forumotion_user_id integer primary key check (forumotion_user_id > 0),
  display_name text not null default '',
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.ticket_moderators enable row level security;
drop policy if exists "Ticket moderators public read" on public.ticket_moderators;
create policy "Ticket moderators public read" on public.ticket_moderators
  for select to anon, authenticated using (true);
drop policy if exists "Admins manage ticket moderators" on public.ticket_moderators;
create policy "Admins manage ticket moderators" on public.ticket_moderators
  for all to authenticated
  using (public.has_admin_permission('can_manage_permissions'))
  with check (public.has_admin_permission('can_manage_permissions') and updated_by=auth.uid());
grant select on public.ticket_moderators to anon, authenticated;
grant insert, update, delete on public.ticket_moderators to authenticated;
insert into public.ticket_moderators(forumotion_user_id,display_name,enabled)
values (1,'Forumotion account #1',true),(2,'Forumotion account #2',true),(3,'Test Account 2',true)
on conflict (forumotion_user_id) do nothing;
commit;
