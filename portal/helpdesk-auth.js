/* Supabase Auth bridge for the shared Hpmagicworld helpdesk.
 * Reuses the same Supabase project and translation_admins allow-list as translations.
 * Forumotion remains responsible for forum login and ticket conversations.
 */
(function (window) {
  "use strict";
  const URL = "https://vuaajsjjluwgqmneinds.supabase.co";
  const KEY = "sb_publishable_tto6sNxZPLv1VhUdMRlPHg_ptzg9odx";
  if (!window.supabase || !window.supabase.createClient) {
    console.error("Supabase JS kon niet worden geladen.");
    return;
  }
  const db = window.supabase.createClient(URL, KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  async function authorizedUser() {
    const result = await db.auth.getUser();
    if (result.error || !result.data.user) return null;
    const uid = result.data.user.id;
    const [translationCheck, roleCheck] = await Promise.all([
      db.from("translation_admins").select("user_id").eq("user_id", uid).maybeSingle(),
      db.from("tool_access_roles").select("user_id,role").eq("user_id", uid).eq("role", "administrator").maybeSingle()
    ]);
    if (translationCheck.error) throw translationCheck.error;
    if (roleCheck.error) throw roleCheck.error;
    return (translationCheck.data || roleCheck.data) ? result.data.user : null;
  }

  window.hpmwGetSupabaseAccessToken = async function () {
    const result = await db.auth.getSession();
    if (result.error) throw result.error;
    const session = result.data.session;
    if (!session || !session.access_token) throw new Error("Log in met je Supabase-beheerdersaccount.");
    return session.access_token;
  };

  window.HpmwHelpdeskAuth = Object.freeze({
    ensure: async function () {
      try {
        let user = await authorizedUser();
        if (user) return true;
        const email = window.prompt("Log in met hetzelfde e-mailadres als bij het vertalingen- of portaalbeheer:");
        if (!email) return false;
        const password = window.prompt("Supabase-wachtwoord:");
        if (!password) return false;
        const login = await db.auth.signInWithPassword({ email: email.trim(), password: password });
        if (login.error) throw login.error;
        user = await authorizedUser();
        if (!user) {
          await db.auth.signOut();
          throw new Error("Dit Supabase-account staat niet in translation_admins.");
        }
        return true;
      } catch (error) {
        window.alert("Supabase-beheerderslogin mislukt: " + (error && error.message ? error.message : "onbekende fout"));
        return false;
      }
    },
    signOut: async function () { await db.auth.signOut(); }
  });
})(window);
