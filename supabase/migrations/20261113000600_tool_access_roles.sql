-- Centrale toolrollen: Administrator, Support Moderator, Nieuwsposter.
begin;
create table if not exists public.tool_access_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('administrator','support_moderator','news_poster')),
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null
);
alter table public.tool_access_roles enable row level security;
drop policy if exists "Tool roles self read" on public.tool_access_roles;
create policy "Tool roles self read" on public.tool_access_roles for select to authenticated using (user_id=auth.uid());
drop policy if exists "Administrators manage tool roles" on public.tool_access_roles;
create policy "Administrators manage tool roles" on public.tool_access_roles for all to authenticated
 using (exists(select 1 from public.tool_access_roles r where r.user_id=auth.uid() and r.role='administrator'))
 with check (exists(select 1 from public.tool_access_roles r where r.user_id=auth.uid() and r.role='administrator') and updated_by=auth.uid());
grant select,insert,update,delete on public.tool_access_roles to authenticated;
-- Bestaande Supabase-admins behouden volledige toegang.
insert into public.tool_access_roles(user_id,role)
select user_id,'administrator' from public.user_roles where role='admin'
on conflict(user_id) do update set role='administrator';
commit;
