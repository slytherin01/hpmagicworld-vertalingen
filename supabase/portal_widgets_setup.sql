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
