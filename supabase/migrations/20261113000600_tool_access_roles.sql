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
create policy "Tool roles self read" on public.tool_access_roles for select to authenticated using (user_id=auth.uid() or public.is_tool_administrator());
create or replace function public.is_tool_administrator()
returns boolean language sql stable security definer set search_path=public
as $ select exists(select 1 from public.tool_access_roles where user_id=auth.uid() and role='administrator') $;
revoke all on function public.is_tool_administrator() from public;
grant execute on function public.is_tool_administrator() to authenticated;
drop policy if exists "Administrators manage tool roles" on public.tool_access_roles;
create policy "Administrators manage tool roles" on public.tool_access_roles for all to authenticated
 using (public.is_tool_administrator())
 with check (public.is_tool_administrator() and updated_by=auth.uid());
grant select,insert,update,delete on public.tool_access_roles to authenticated;

create or replace function public.is_tool_news_poster()
returns boolean language sql stable security definer set search_path=public
as $ select exists(select 1 from public.tool_access_roles where user_id=auth.uid() and role in ('administrator','news_poster')) $;
revoke all on function public.is_tool_news_poster() from public;
grant execute on function public.is_tool_news_poster() to authenticated;

-- Nieuwsplaatsers mogen uitsluitend nieuws beheren; alle overige content blijft beschermd.
drop policy if exists "News posters manage news" on public.admin_content;
create policy "News posters manage news" on public.admin_content for all to authenticated
 using (kind='news' and public.is_tool_news_poster())
 with check (kind='news' and public.is_tool_news_poster());
-- Bestaande Supabase-admins behouden volledige toegang.
insert into public.tool_access_roles(user_id,role)
select user_id,'administrator' from public.user_roles where role='admin'
on conflict(user_id) do update set role='administrator';

-- Administrator-role grants all existing CMS permissions as well.
create or replace function public.has_admin_permission(permission_name text)
returns boolean language plpgsql stable security definer
set search_path = public
as $
declare allowed boolean := false;
begin
  if public.is_tool_administrator() then return true; end if;
  if exists (select 1 from public.user_roles r where r.user_id=auth.uid() and r.role='admin') then return true; end if;
  execute format('select coalesce((select %I from public.admin_permissions where user_id=$1), false)', permission_name)
    into allowed using auth.uid();
  return coalesce(allowed,false);
end;
$;
revoke all on function public.has_admin_permission(text) from public;
grant execute on function public.has_admin_permission(text) to authenticated;

commit;
