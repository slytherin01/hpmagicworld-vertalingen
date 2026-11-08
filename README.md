# Muggle Ministry — repository layout

## Canonical portal
- `portal/index.html` — the single portal application (ticket support, Mijn tickets, Ticketbeheer and intranet views).
- `portal/loader.js` — the Forumotion embed loader. It fetches the canonical portal HTML from this repository.
- `index.html` — GitHub Pages landing page for the Admin Tool.
- `tool/index.html` — Admin Tool.
- `translations.js` — shared NL/EN/PT translation dictionary.

## Supabase
- `supabase/migrations/20261108000100_consolidated_portal_schema.sql` — consolidated, idempotent setup for the existing page content, portal effects and portal widgets tables.

### Data safety
The migration uses `CREATE TABLE IF NOT EXISTS` and conflict-safe seed inserts. It does not drop tables or delete rows, user accounts, or ticket data. It recreates only the named RLS policies for the three portal settings tables. Make a Supabase backup before running it.

The existing `translation_admins` and `translations` tables are not recreated or modified by this migration. The translation sync Edge Function remains at `supabase/functions/sync-translations/index.ts`.

## Important ticket storage note
The current ticket conversation source is still Forumotion. Some ticket metadata in the current portal is browser-local. A fully shared helpdesk database requires a separate, authenticated backend migration; this repository cleanup does not silently migrate or delete existing Forumotion tickets.


## Shared helpdesk groundwork (new)
- `supabase/migrations/20261108000200_shared_helpdesk_metadata.sql` — additive schema for shared ticket status, priority, moderator assignment, department, internal notes and an append-only moderation event log.
- `portal/helpdesk-sync.js` — browser-side Supabase REST client for that metadata.

This is groundwork, not a live portal integration yet. The helper deliberately fails closed until both a Supabase project URL/anon key and a real Supabase Auth access-token provider are configured. A Forumotion login/session is not a Supabase Auth token and must not be trusted as one. Only users present in the existing `translation_admins` table can access these moderator-only tables through RLS. Never put a Supabase `service_role` key in browser code.

The new migration has been committed to GitHub but has **not** been run in Supabase. Run it only after reviewing it and taking a fresh database backup. Existing Forumotion tickets and conversations are untouched.
