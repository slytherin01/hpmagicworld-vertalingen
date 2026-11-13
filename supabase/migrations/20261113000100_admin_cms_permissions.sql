-- Admin CMS and granular permissions for Muggle Ministry.
-- Additive only: existing accounts, tickets and content are preserved.
begin;

create table if not exists public.admin_content (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('faq','news','job','maintenance')),
  title text not null,
  body text not null default '',
  source text not null default '',
  author text not null default '',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists admin_content_kind_published_idx
  on public.admin_content(kind, published, sort_order, updated_at desc);
alter table public.admin_content enable row level security;

create table if not exists public.admin_permissions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  can_view_faq boolean not null default false,
  can_edit_faq boolean not null default false,
  can_publish_faq boolean not null default false,
  can_delete_faq boolean not null default false,
  can_view_news boolean not null default false,
  can_edit_news boolean not null default false,
  can_publish_news boolean not null default false,
  can_delete_news boolean not null default false,
  can_view_jobs boolean not null default false,
  can_edit_jobs boolean not null default false,
  can_publish_jobs boolean not null default false,
  can_delete_jobs boolean not null default false,
  can_view_maintenance boolean not null default false,
  can_edit_maintenance boolean not null default false,
  can_publish_maintenance boolean not null default false,
  can_delete_maintenance boolean not null default false,
  can_manage_permissions boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.admin_permissions enable row level security;

create or replace function public.has_admin_permission(permission_name text)
returns boolean language plpgsql stable security definer
set search_path = public
as $$
declare allowed boolean := false;
begin
  if exists (select 1 from public.user_roles r where r.user_id=auth.uid() and r.role='admin') then
    return true;
  end if;
  execute format('select coalesce((select %I from public.admin_permissions where user_id=$1), false)', permission_name)
    into allowed using auth.uid();
  return coalesce(allowed,false);
end;
$$;
revoke all on function public.has_admin_permission(text) from public;
grant execute on function public.has_admin_permission(text) to authenticated;

drop policy if exists "Admin content published read" on public.admin_content;
create policy "Admin content published read" on public.admin_content
for select to anon, authenticated using (published = true);
drop policy if exists "Admin content authorized read" on public.admin_content;
create policy "Admin content authorized read" on public.admin_content
for select to authenticated using (
  public.has_admin_permission('can_view_' || case kind when 'faq' then 'faq' when 'news' then 'news' when 'job' then 'jobs' else 'maintenance' end)
);
drop policy if exists "Admin content authorized insert" on public.admin_content;
create policy "Admin content authorized insert" on public.admin_content
for insert to authenticated with check (
  public.has_admin_permission('can_edit_' || case kind when 'faq' then 'faq' when 'news' then 'news' when 'job' then 'jobs' else 'maintenance' end)
  and created_by = auth.uid()
);
drop policy if exists "Admin content authorized update" on public.admin_content;
create policy "Admin content authorized update" on public.admin_content
for update to authenticated using (
  public.has_admin_permission('can_edit_' || case kind when 'faq' then 'faq' when 'news' then 'news' when 'job' then 'jobs' else 'maintenance' end)
) with check (
  public.has_admin_permission('can_edit_' || case kind when 'faq' then 'faq' when 'news' then 'news' when 'job' then 'jobs' else 'maintenance' end)
  and updated_by = auth.uid()
);
drop policy if exists "Admin content authorized delete" on public.admin_content;
create policy "Admin content authorized delete" on public.admin_content
for delete to authenticated using (
  public.has_admin_permission('can_delete_' || case kind when 'faq' then 'faq' when 'news' then 'news' when 'job' then 'jobs' else 'maintenance' end)
);
drop policy if exists "Users read own admin permissions" on public.admin_permissions;
create policy "Users read own admin permissions" on public.admin_permissions
for select to authenticated using (user_id=auth.uid() or public.has_admin_permission('can_manage_permissions'));
drop policy if exists "Admins manage admin permissions" on public.admin_permissions;
create policy "Admins manage admin permissions" on public.admin_permissions
for all to authenticated using (public.has_admin_permission('can_manage_permissions'))
with check (public.has_admin_permission('can_manage_permissions') and updated_by=auth.uid());

grant select on public.admin_content to anon, authenticated;
grant insert, update, delete on public.admin_content to authenticated;
grant select, insert, update, delete on public.admin_permissions to authenticated;

commit;
