-- Granular Forumotion ticket permissions, shared by the Admin tool and portal.
begin;
alter table public.ticket_moderators
  add column if not exists can_view_tickets boolean not null default false,
  add column if not exists can_moderate_tickets boolean not null default false,
  add column if not exists can_delete_tickets boolean not null default false;

-- Only /u1 and /u3 receive ticket access by default. Existing other rows are disabled.
update public.ticket_moderators
set enabled = (forumotion_user_id in (1,3)),
    can_view_tickets = (forumotion_user_id in (1,3)),
    can_moderate_tickets = (forumotion_user_id in (1,3)),
    can_delete_tickets = (forumotion_user_id in (1,3)),
    display_name = case forumotion_user_id when 1 then 'Forumotion /u1' when 3 then 'Forumotion /u3' else display_name end
where true;

insert into public.ticket_moderators
  (forumotion_user_id,display_name,enabled,can_view_tickets,can_moderate_tickets,can_delete_tickets)
values
  (1,'Forumotion /u1',true,true,true,true),
  (3,'Forumotion /u3',true,true,true,true)
on conflict (forumotion_user_id) do update set
  display_name=excluded.display_name,
  enabled=true,
  can_view_tickets=true,
  can_moderate_tickets=true,
  can_delete_tickets=true;
notify pgrst, 'reload schema';
commit;
