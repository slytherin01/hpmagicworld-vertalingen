import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function decodeBase64Utf8(value: string): string {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Gebruik POST." }, 405);

  try {
    const accessToken = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!accessToken) return json({ error: "Niet ingelogd." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    const repo = Deno.env.get("GITHUB_REPO") ?? "slytherin01/muggle-ministry";
    const branch = Deno.env.get("GITHUB_BRANCH") ?? "main";
    if (!supabaseUrl || !anonKey || !serviceRoleKey || !githubToken) {
      return json({ error: "Serverconfiguratie ontbreekt. Controleer de Supabase secrets." }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "Je sessie is ongeldig. Log opnieuw in." }, 401);

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: roleRow, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (roleError || !roleRow || !["admin", "moderator"].includes(roleRow.role)) {
      return json({ error: "Geen beheerrechten om vertalingen te publiceren." }, 403);
    }

    const { data: rows, error: rowsError } = await adminClient
      .from("portal_translations")
      .select("nl,en,pt")
      .order("nl");
    if (rowsError) return json({ error: "Vertalingen lezen mislukt: " + rowsError.message }, 500);

    const dictionaries: Record<string, Record<string, string>> = { nl: {}, en: {}, pt: {} };
    for (const row of rows ?? []) {
      const key = typeof row.source_key === "string" && row.source_key.trim() ? row.source_key.trim() : (typeof row.nl === "string" ? row.nl.trim() : "");
      if (!key) continue;
      dictionaries.nl[key] = row.nl;
      for (const lang of ["en", "pt"]) {
        const value = row[lang];
        if (typeof value === "string" && value.length > 0) dictionaries[lang][key] = value;
      }
    }

    const apiBase = `https://api.github.com/repos/${repo}/contents/translations.js`;
    const headers = {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };
    const getResponse = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, { headers });
    if (!getResponse.ok) {
      const detail = await getResponse.text();
      return json({ error: `GitHub bestand ophalen mislukt (${getResponse.status}): ${detail.slice(0, 350)}` }, 502);
    }
    const file = await getResponse.json();
    let source = decodeBase64Utf8(file.content ?? "");
    const startMarker = "// BEGIN SUPABASE TRANSLATIONS - automatisch beheerd";
    const endMarker = "// END SUPABASE TRANSLATIONS";
    const generated = [
      startMarker,
      ...["nl", "en", "pt"].map((lang) =>
        `Object.assign(translations.${lang}, ${JSON.stringify(dictionaries[lang], null, 2)});`
      ),
      endMarker,
    ].join("\n");

    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker);
    if (start >= 0 && end >= start) {
      source = source.slice(0, start) + generated + source.slice(end + endMarker.length);
    } else {
      const insertionPoint = source.indexOf("let current='nl';");
      if (insertionPoint < 0) {
        return json({ error: "De vertaalcode heeft niet de verwachte invoegplek. Er is niets gepubliceerd." }, 500);
      }
      source = source.slice(0, insertionPoint) + generated + "\n" + source.slice(insertionPoint);
    }

    const putResponse = await fetch(apiBase, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "Publiceer portalvertalingen vanuit Supabase",
        content: encodeBase64Utf8(source),
        sha: file.sha,
        branch,
      }),
    });
    if (!putResponse.ok) {
      const detail = await putResponse.text();
      return json({ error: `GitHub publiceren mislukt (${putResponse.status}): ${detail.slice(0, 350)}` }, 502);
    }
    const result = await putResponse.json();
    return json({
      success: true,
      count: rows?.length ?? 0,
      commit: result.commit?.html_url ?? null,
      message: `${rows?.length ?? 0} vertaalregels gepubliceerd naar translations.js.`,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Onbekende fout." }, 500);
  }
});
