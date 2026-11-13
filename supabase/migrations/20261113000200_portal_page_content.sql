-- Allow editable welcome and other portal page copy in the central CMS.
begin;
alter table public.admin_content drop constraint if exists admin_content_kind_check;
alter table public.admin_content
  add constraint admin_content_kind_check
  check (kind in ('page','faq','news','job','maintenance'));
commit;
