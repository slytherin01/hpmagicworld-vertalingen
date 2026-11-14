alter table public.wizarding_entries
  add column if not exists name_en text,
  add column if not exists name_pt text,
  add column if not exists subtitle_en text,
  add column if not exists subtitle_pt text,
  add column if not exists description_en text,
  add column if not exists description_pt text;

-- The initial seed entries have independent, concise translations.
update public.wizarding_entries set name_en='Phoenix',name_pt='Fénix',subtitle_en='Magical creature',subtitle_pt='Criatura mágica',description_en='A rare bird said to be reborn from its own ashes.',description_pt='Uma ave rara que, segundo a tradição, renasce das próprias cinzas.' where slug='phoenix';
update public.wizarding_entries set name_en='Hogwarts',name_pt='Hogwarts',subtitle_en='School of Witchcraft and Wizardry',subtitle_pt='Escola de Magia e Bruxaria',description_en='The renowned school where young witches and wizards study and develop their magical abilities.',description_pt='A famosa escola onde jovens bruxas e feiticeiros estudam e desenvolvem as suas capacidades mágicas.' where slug='hogwarts';
update public.wizarding_entries set name_en='Harry Potter',name_pt='Harry Potter',subtitle_en='Wizard',subtitle_pt='Feiticeiro',description_en='The central character of the stories, known in the wizarding world as the Boy Who Lived.',description_pt='A personagem central das histórias, conhecida no mundo mágico como o Rapaz Que Sobreviveu.' where slug='harry-potter';
update public.wizarding_entries set name_en='Hermione Granger',name_pt='Hermione Granger',subtitle_en='Witch',subtitle_pt='Bruxa',description_en='A highly talented witch and one of Harry Potter’s closest friends.',description_pt='Uma bruxa extremamente talentosa e uma das amigas mais próximas de Harry Potter.' where slug='hermione-granger';
update public.wizarding_entries set name_en='Albus Dumbledore',name_pt='Albus Dumbledore',subtitle_en='Wizard',subtitle_pt='Feiticeiro',description_en='Headmaster of Hogwarts and one of the most influential wizards of his era.',description_pt='Diretor de Hogwarts e um dos feiticeiros mais influentes da sua época.' where slug='albus-dumbledore';
update public.wizarding_entries set name_en='Expelliarmus',name_pt='Expelliarmus',subtitle_en='Disarming Charm',subtitle_pt='Feitiço de Desarmamento',description_en='A charm that disarms an opponent by making them lose their wand.',description_pt='Um feitiço que desarma um adversário, fazendo-o perder a varinha.' where slug='expelliarmus';
update public.wizarding_entries set name_en='Lumos',name_pt='Lumos',subtitle_en='Wand-lighting Charm',subtitle_pt='Feitiço de Iluminação',description_en='A charm that produces light at the tip of a wand.',description_pt='Um feitiço que produz luz na ponta de uma varinha.' where slug='lumos';
update public.wizarding_entries set name_en='Wingardium Leviosa',name_pt='Wingardium Leviosa',subtitle_en='Levitation Charm',subtitle_pt='Feitiço de Levitação',description_en='A charm used to make an object levitate.',description_pt='Um feitiço utilizado para fazer um objeto levitar.' where slug='wingardium-leviosa';
update public.wizarding_entries set name_en='Elder Wand',name_pt='Varinha das Varinhas',subtitle_en='Deathly Hallow',subtitle_pt='Relíquia da Morte',description_en='A legendary wand associated with the Deathly Hallows.',description_pt='Uma varinha lendária associada às Relíquias da Morte.' where slug='elder-wand';
update public.wizarding_entries set name_en='Invisibility Cloak',name_pt='Capa da Invisibilidade',subtitle_en='Deathly Hallow',subtitle_pt='Relíquia da Morte',description_en='A cloak that conceals its wearer and is one of the Deathly Hallows.',description_pt='Uma capa que oculta quem a usa e é uma das Relíquias da Morte.' where slug='invisibility-cloak';

update public.wizarding_entries
set source_title='HarryPotter.com — Official Fact Files',
    source_url=case
      when category='personages' then 'https://www.harrypotter.com/fact-file/characters-and-pets'
      when category='locaties' then 'https://www.harrypotter.com/fact-file/locations'
      when category='fabeldieren' then 'https://www.harrypotter.com/fact-file/creatures'
      when category='spreuken' then 'https://www.harrypotter.com/fact-file/spells'
      when category='voorwerpen' then 'https://www.harrypotter.com/fact-file/objects'
      else 'https://www.harrypotter.com/fact-file'
    end
where source_url is null or source_url='';