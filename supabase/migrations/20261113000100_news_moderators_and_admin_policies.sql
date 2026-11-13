-- Muggle Ministry: Nieuwspagina permissions and portal read policies
-- Run once in the Supabase SQL Editor. This migration is safe to re-run.

CREATE TABLE IF NOT EXISTS public.news_moderators (
  forumotion_user_id BIGINT PRIMARY KEY CHECK (forumotion_user_id > 0),
  display_name TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  can_view_news BOOLEAN NOT NULL DEFAULT FALSE,
  can_publish_news BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit_news BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete_news BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.news_moderators ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.news_moderators TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news_moderators TO authenticated;

DROP POLICY IF EXISTS "news_moderators_admin_all" ON public.news_moderators;
CREATE POLICY "news_moderators_admin_all"
ON public.news_moderators
FOR ALL TO authenticated
USING (public.is_administrator())
WITH CHECK (public.is_administrator());

-- The portal only needs to read the enabled view permissions.
DROP POLICY IF EXISTS "news_moderators_public_read_enabled" ON public.news_moderators;
CREATE POLICY "news_moderators_public_read_enabled"
ON public.news_moderators
FOR SELECT TO anon, authenticated
USING (enabled = TRUE AND can_view_news = TRUE);

-- Repair access to the Supabase role list used by the administrator form.
ALTER TABLE public.tool_access_roles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_access_roles TO authenticated;

DROP POLICY IF EXISTS "tool_access_roles_admin_all" ON public.tool_access_roles;
CREATE POLICY "tool_access_roles_admin_all"
ON public.tool_access_roles
FOR ALL TO authenticated
USING (public.is_administrator())
WITH CHECK (public.is_administrator());

-- The public portal reads active ticket moderators to decide which Forumotion
-- users may open Ticketbeheer. Do not expose disabled moderator rows.
GRANT SELECT ON public.ticket_moderators TO anon, authenticated;
DROP POLICY IF EXISTS "ticket_moderators_public_read_enabled" ON public.ticket_moderators;
CREATE POLICY "ticket_moderators_public_read_enabled"
ON public.ticket_moderators
FOR SELECT TO anon, authenticated
USING (enabled = TRUE AND can_view_tickets = TRUE);

DROP POLICY IF EXISTS "ticket_moderators_admin_all" ON public.ticket_moderators;
CREATE POLICY "ticket_moderators_admin_all"
ON public.ticket_moderators
FOR ALL TO authenticated
USING (public.is_administrator())
WITH CHECK (public.is_administrator());

-- Published items are readable by the public portal. Administrators can
-- manage all content; news_poster accounts can manage only news items.
ALTER TABLE public.admin_content ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.admin_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.admin_content TO authenticated;

CREATE OR REPLACE FUNCTION public.has_tool_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tool_access_roles
    WHERE user_id = (SELECT auth.uid())
      AND role = required_role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_tool_role(TEXT) TO authenticated;

DROP POLICY IF EXISTS "admin_content_public_read_published" ON public.admin_content;
CREATE POLICY "admin_content_public_read_published"
ON public.admin_content
FOR SELECT TO anon, authenticated
USING (published = TRUE OR public.is_administrator() OR public.has_tool_role('news_poster'));

DROP POLICY IF EXISTS "admin_content_admin_insert" ON public.admin_content;
CREATE POLICY "admin_content_admin_insert"
ON public.admin_content
FOR INSERT TO authenticated
WITH CHECK (
  public.is_administrator()
  OR (kind = 'news' AND public.has_tool_role('news_poster'))
);

DROP POLICY IF EXISTS "admin_content_admin_update" ON public.admin_content;
CREATE POLICY "admin_content_admin_update"
ON public.admin_content
FOR UPDATE TO authenticated
USING (
  public.is_administrator()
  OR (kind = 'news' AND public.has_tool_role('news_poster'))
)
WITH CHECK (
  public.is_administrator()
  OR (kind = 'news' AND public.has_tool_role('news_poster'))
);

DROP POLICY IF EXISTS "admin_content_admin_delete" ON public.admin_content;
CREATE POLICY "admin_content_admin_delete"
ON public.admin_content
FOR DELETE TO authenticated
USING (
  public.is_administrator()
  OR (kind = 'news' AND public.has_tool_role('news_poster'))
);
