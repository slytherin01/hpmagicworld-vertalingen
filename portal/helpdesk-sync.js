/* Shared Hpmagicworld helpdesk metadata.
 * This module stores moderator-only metadata in Supabase; Forumotion remains
 * authoritative for accounts, ticket topics and conversation posts.
 *
 * Configure window.HPMW_SUPABASE = { url: "...", anonKey: "..." }.
 * Provide window.hpmwGetSupabaseAccessToken = async () => "<Supabase user access token>".
 * Never put a service_role key in this file or in browser code.
 */
(function (window) {
  "use strict";

  const TABLE = "helpdesk_ticket_metadata";
  const EVENTS = "helpdesk_ticket_events";

  function config() {
    const value = window.HPMW_SUPABASE || {};
    if (!value.url || !value.anonKey) {
      throw new Error("Supabase-configuratie ontbreekt.");
    }
    if (typeof window.hpmwGetSupabaseAccessToken !== "function") {
      throw new Error("Er is nog geen Supabase-login gekoppeld aan de Forumotion-gebruiker.");
    }
    return { url: String(value.url).replace(/\/+$/, ""), anonKey: value.anonKey };
  }

  async function request(path, options) {
    const cfg = config();
    const token = await window.hpmwGetSupabaseAccessToken();
    if (!token) throw new Error("Geen geldige Supabase-sessie. Log opnieuw in.");
    const response = await fetch(cfg.url + "/rest/v1/" + path, {
      method: options.method || "GET",
      headers: Object.assign({
        apikey: cfg.anonKey,
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Prefer: options.prefer || "return=representation"
      }, options.headers || {}),
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store"
    });
    const body = await response.text();
    if (!response.ok) {
      let detail = body;
      try { detail = JSON.parse(body).message || body; } catch (_) {}
      throw new Error("Supabase (" + response.status + "): " + detail);
    }
    return body ? JSON.parse(body) : null;
  }

  function ticketKey(ticket) {
    const forumId = Number(ticket && (ticket.openForumId || ticket.forumId));
    const topicId = String(ticket && ticket.id || "").trim();
    if (!Number.isInteger(forumId) || forumId <= 0 || !/^\d+$/.test(topicId)) {
      throw new Error("Ongeldige Forumotion-forum- of topic-ID.");
    }
    return forumId + ":" + topicId;
  }

  async function audit(key, eventType, eventData) {
    await request(EVENTS, {
      method: "POST",
      body: { ticket_key: key, event_type: eventType, event_data: eventData || {} }
    });
  }

  async function get(ticket) {
    const key = ticketKey(ticket);
    const rows = await request(TABLE + "?ticket_key=eq." + encodeURIComponent(key) + "&select=*", {});
    return rows && rows[0] || null;
  }

  async function list() {
    return await request(TABLE + "?select=*&order=updated_at.desc", {});
  }

  async function save(ticket, patch, actor) {
    const key = ticketKey(ticket);
    const allowed = ["status", "priority", "assignee_forumotion_user_id",
      "assignee_name", "department", "internal_note"];
    const clean = {};
    allowed.forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(patch || {}, field)) clean[field] = patch[field];
    });
    if (!Object.keys(clean).length) throw new Error("Geen toegestane ticketvelden om op te slaan.");

    const existing = await get(ticket);
    const record = Object.assign({}, existing || {}, {
      ticket_key: key,
      forumotion_topic_id: String(ticket.id),
      forumotion_forum_id: Number(ticket.openForumId || ticket.forumId),
      ticket_number: String(ticket.num || ""),
      subject: String(ticket.title || ""),
      category: String(ticket.cat || ""),
      created_by_forumotion_user_id: Number(ticket.userId) || null,
      created_by_name: String(ticket.user || ""),
      updated_at: new Date().toISOString()
    }, clean);
    delete record.created_at;
    delete record.updated_by;
    const rows = await request(TABLE + "?on_conflict=ticket_key", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
      body: record
    });
    const changed = Object.keys(clean);
    const eventType = changed.includes("status") ? "status_changed" :
      changed.includes("priority") ? "priority_changed" :
      changed.includes("assignee_forumotion_user_id") ? "assigned" :
      changed.includes("internal_note") ? "note_added" : "metadata_updated";
    await audit(key, eventType, { fields: changed, actor: actor || null });
    return rows && rows[0] || record;
  }

  window.HpmwHelpdeskSync = Object.freeze({
    keyFor: ticketKey,
    get: get,
    list: list,
    save: save
  });
})(window);
