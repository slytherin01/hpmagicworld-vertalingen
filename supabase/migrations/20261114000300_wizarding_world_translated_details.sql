alter table public.wizarding_entries
  add column if not exists details_en jsonb not null default '{}'::jsonb,
  add column if not exists details_pt jsonb not null default '{}'::jsonb;

update public.wizarding_entries set details_en='{"type":"Bird","abilities":["Rebirth from ashes","Healing tears"]}'::jsonb,details_pt='{"tipo":"Ave","capacidades":["Renascer das cinzas","Lágrimas curativas"]}'::jsonb where slug='phoenix';
update public.wizarding_entries set details_en='{"type":"School","country":"Scotland"}'::jsonb,details_pt='{"tipo":"Escola","país":"Escócia"}'::jsonb where slug='hogwarts';
update public.wizarding_entries set details_en='{"role":"Wizard","house":"Gryffindor","species":"Human"}'::jsonb,details_pt='{"papel":"Feiticeiro","casa":"Gryffindor","espécie":"Humano"}'::jsonb where slug='harry-potter';
update public.wizarding_entries set details_en='{"role":"Witch","house":"Gryffindor","species":"Human"}'::jsonb,details_pt='{"papel":"Bruxa","casa":"Gryffindor","espécie":"Humana"}'::jsonb where slug='hermione-granger';
update public.wizarding_entries set details_en='{"role":"Headmaster","house":"Gryffindor"}'::jsonb,details_pt='{"papel":"Diretor","casa":"Gryffindor"}'::jsonb where slug='albus-dumbledore';
update public.wizarding_entries set details_en='{"type":"Disarming Charm","effect":"Disarms an opponent","incantation":"Expelliarmus"}'::jsonb,details_pt='{"tipo":"Feitiço de Desarmamento","efeito":"Desarma o adversário","encantamento":"Expelliarmus"}'::jsonb where slug='expelliarmus';
update public.wizarding_entries set details_en='{"type":"Wand-lighting Charm","effect":"Produces light at the wand tip","incantation":"Lumos"}'::jsonb,details_pt='{"tipo":"Feitiço de Iluminação","efeito":"Produz luz na ponta da varinha","encantamento":"Lumos"}'::jsonb where slug='lumos';
update public.wizarding_entries set details_en='{"type":"Levitation Charm","effect":"Makes objects levitate","incantation":"Wingardium Leviosa"}'::jsonb,details_pt='{"tipo":"Feitiço de Levitação","efeito":"Faz objetos levitarem","encantamento":"Wingardium Leviosa"}'::jsonb where slug='wingardium-leviosa';
update public.wizarding_entries set details_en='{"type":"Wand","legend":"Deathly Hallows"}'::jsonb,details_pt='{"tipo":"Varinha","lenda":"Relíquias da Morte"}'::jsonb where slug='elder-wand';
update public.wizarding_entries set details_en='{"type":"Cloak","legend":"Deathly Hallows"}'::jsonb,details_pt='{"tipo":"Capa","lenda":"Relíquias da Morte"}'::jsonb where slug='invisibility-cloak';