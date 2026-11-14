begin;

create table if not exists public.wizarding_entries (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  slug text not null unique,
  name text not null,
  subtitle text not null default '',
  description text not null default '',
  details jsonb not null default '{}'::jsonb,
  aliases text[] not null default '{}',
  universe text not null default 'Wizarding World',
  canon_status text not null default 'onbekend',
  source_title text not null default '',
  source_url text not null default '',
  image_url text not null default '',
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wizarding_entries_category_idx on public.wizarding_entries(category);
create index if not exists wizarding_entries_name_idx on public.wizarding_entries using gin (to_tsvector('simple', name || ' ' || subtitle || ' ' || description));
create index if not exists wizarding_entries_aliases_idx on public.wizarding_entries using gin (aliases);

alter table public.wizarding_entries enable row level security;

drop policy if exists "Published wizarding entries are public" on public.wizarding_entries;
create policy "Published wizarding entries are public"
on public.wizarding_entries for select to anon, authenticated
using (is_published = true or exists (
  select 1 from public.translation_admins a where a.user_id = auth.uid()
));

drop policy if exists "Wizarding admins can insert entries" on public.wizarding_entries;
create policy "Wizarding admins can insert entries"
on public.wizarding_entries for insert to authenticated
with check (exists (
  select 1 from public.translation_admins a where a.user_id = auth.uid()
));

drop policy if exists "Wizarding admins can update entries" on public.wizarding_entries;
create policy "Wizarding admins can update entries"
on public.wizarding_entries for update to authenticated
using (exists (
  select 1 from public.translation_admins a where a.user_id = auth.uid()
))
with check (exists (
  select 1 from public.translation_admins a where a.user_id = auth.uid()
));

drop policy if exists "Wizarding admins can delete entries" on public.wizarding_entries;
create policy "Wizarding admins can delete entries"
on public.wizarding_entries for delete to authenticated
using (exists (
  select 1 from public.translation_admins a where a.user_id = auth.uid()
));

grant select on table public.wizarding_entries to anon, authenticated;
grant insert, update, delete on table public.wizarding_entries to authenticated;

insert into public.wizarding_entries
(category, slug, name, subtitle, description, details, aliases, universe, canon_status, source_title, sort_order)
values
('spreuken','expelliarmus','Expelliarmus','Ontwapeningsspreuk','Ontwapent een tegenstander door diens toverstok uit de hand te slaan.', '{"incantation":"Expelliarmus","effect":"Ontwapent de tegenstander","type":"Ontwapeningsspreuk"}'::jsonb, array['Ontwapeningsspreuk'], 'Harry Potter','boekcanon','Harry Potter en de Geheime Kamer',10),
('spreuken','lumos','Lumos','Lichtspreuk','Laat licht verschijnen aan de punt van de toverstok.', '{"incantation":"Lumos","effect":"Licht aan de toverstokuiteinde","type":"Lichtspreuk"}'::jsonb, array['Lichtspreuk'], 'Wizarding World','boekcanon','Harry Potter en de Steen der Wijzen',20),
('spreuken','wingardium-leviosa','Wingardium Leviosa','Zweefspreuk','Laat een voorwerp zweven.', '{"incantation":"Wingardium Leviosa","effect":"Laat voorwerpen zweven","type":"Bezwering"}'::jsonb, array['Zweefspreuk'], 'Harry Potter','boekcanon','Harry Potter en de Steen der Wijzen',30),
('personages','harry-potter','Harry Potter','Tovenaar','De hoofdpersoon van de Harry Potter-verhalen, bekend als de Jongen die Bleef Leven.', '{"house":"Griffoendor","species":"Mens","role":"Tovenaar"}'::jsonb, array['De Jongen die Bleef Leven'], 'Harry Potter','boekcanon','Harry Potter en de Steen der Wijzen',10),
('personages','hermione-granger','Hermelien Griffel','Heks','Een briljante heks en een van Harry Potters beste vrienden.', '{"house":"Griffoendor","species":"Mens","role":"Heks"}'::jsonb, array['Hermione Granger'], 'Harry Potter','boekcanon','Harry Potter en de Steen der Wijzen',20),
('personages','albus-dumbledore','Albus Perkamentus','Tovenaar','Hoofd van Zweinstein en een van de invloedrijkste tovenaars van zijn tijd.', '{"house":"Griffoendor","role":"Schoolhoofd"}'::jsonb, array['Albus Dumbledore'], 'Harry Potter','boekcanon','Harry Potter en de Steen der Wijzen',30),
('voorwerpen','elder-wand','Zegevlier','Reliek van de Dood','Een legendarische toverstok die verbonden is met de Relieken van de Dood.', '{"type":"Toverstok","legend":"Relieken van de Dood"}'::jsonb, array['Elder Wand','Alruinstok'], 'Harry Potter','boekcanon','Harry Potter en de Relieken van de Dood',10),
('voorwerpen','invisibility-cloak','Onzichtbaarheidsmantel','Reliek van de Dood','Een mantel die de drager onzichtbaar maakt en een van de Relieken van de Dood is.', '{"type":"Mantel","legend":"Relieken van de Dood"}'::jsonb, array['Cloak of Invisibility'], 'Harry Potter','boekcanon','Harry Potter en de Steen der Wijzen',20),
('locaties','hogwarts','Zweinstein','School voor hekserij en hocus-pocus','De beroemde school waar jonge heksen en tovenaars leren magie te beheersen.', '{"type":"School","country":"Schotland"}'::jsonb, array['Hogwarts','Zweinstein Hogeschool'], 'Wizarding World','boekcanon','Harry Potter en de Steen der Wijzen',10),
('fabeldieren','phoenix','Feniks','Magisch wezen','Een zeldzame vogel die uit zijn eigen as kan herrijzen.', '{"type":"Vogel","abilities":["Herrijzen uit as","Fenikstranen met genezende eigenschappen"]}'::jsonb, array['Phoenix'], 'Wizarding World','boekcanon','Harry Potter en de Geheime Kamer',10)
on conflict (slug) do nothing;

commit;