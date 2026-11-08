-- Hpmagicworld Ticket Support: role table for Supabase Auth
-- Run this in Supabase SQL Editor.

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'moderator', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon;
grant select on public.user_roles to authenticated;

drop policy if exists "Users can read their own role" on public.user_roles;
create policy "Users can read their own role"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

-- No client-side write policies: assign roles only in SQL Editor or trusted server code.
-- Example (replace UUID with the user's id from Authentication > Users):
-- insert into public.user_roles (user_id, role)
-- values ('00000000-0000-0000-0000-000000000000', 'admin')
-- on conflict (user_id) do update set role = excluded.role;
