-- Add pinning support for HP Nieuws. Existing content is preserved.
alter table public.admin_content
  add column if not exists is_pinned boolean not null default false;

create index if not exists admin_content_news_pinned_idx
  on public.admin_content(kind, published, is_pinned desc, sort_order, updated_at desc)
  where kind = 'news';
