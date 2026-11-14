/* Hpmagicworld Ticket Support loader — CORS-friendly source order with GitHub Pages fallback. */
(function () {
  if (window.__muggleMinistryPortalLoading) return;
  window.__muggleMinistryPortalLoading = true;

  var version = "20261114-104";
  var sources = [
    "https://raw.githubusercontent.com/slytherin01/muggle-ministry/main/portal/index.html?cachebust=" + version,
    "https://slytherin01.github.io/muggle-ministry/portal/index.html?v=" + version
  ];

  function fetchWithTimeout(url, ms) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, ms);
    return fetch(url, {
      cache: "no-store",
      credentials: "omit",
      mode: "cors",
      signal: controller.signal
    }).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status + " bij " + url);
      return response.text();
    }).finally(function () { clearTimeout(timer); });
  }

  function showError(error) {
    console.error("Hpmagicworld portal load failed:", error);
    document.open();
    document.write('<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hpmagicworld laden mislukt</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#080f1a;color:#edf4fa;font:16px Arial"><main style="max-width:620px;margin:24px;padding:28px;border:1px solid #344963;border-radius:14px;background:#111e2e"><h2>Hpmagicworld Ticket Support</h2><p id="load-error"></p><button onclick="location.reload()" style="padding:10px 16px;border:0;border-radius:8px;background:#287f98;color:white">Opnieuw proberen</button></main></body></html>');
    document.close();
    var node = document.getElementById("load-error");
    if (node) node.textContent = "Het portaal kon niet worden geladen. " + String(error && error.message || error);
  }

  function loadPortal() {
    /* Gebruik altijd eerst de actuele raw-main versie. GitHub Pages kan nog een
       oudere deployment bevatten; die mag nooit winnen door een snellere response. */
    function fetchSource(index, lastError) {
      if (index >= sources.length) {
        showError(lastError || new Error("Geen geldige portalbron beschikbaar."));
        return;
      }
      fetchWithTimeout(sources[index], 10000).then(function (html) {
        if (!html || html.length < 10000 || html.indexOf("<html") === -1 || html.indexOf("<body") === -1) {
          throw new Error("Ongeldige HTML-bron: " + sources[index]);
        }
        return html;
      }).then(function (html) {
        try {
          var d = window._userdata || null;
          var id = d ? (Number(d.user_id) || 0) : 0;
          if (d && id > 0 && Number(d.session_logged_in) > 0) {
            sessionStorage.setItem("hpmw_forumotion_session", JSON.stringify({
              id: id,
              name: String(d.username || d.username_clean || d.name || "Gebruiker").trim(),
              avatar: String(d.user_avatar || d.avatar || ""),
              logged: true,
              savedAt: Date.now()
            }));
          }
        } catch (e) { console.warn("Forumotion-sessie kon niet vooraf worden vastgelegd:", e); }
        console.info("[Hpmw] Portal geladen vanaf bron", sources[index], "loader", version);
        document.open();
        document.write(html);
        document.close();
      }).catch(function (error) {
        console.warn("[Hpmw] Portalbron mislukt; probeer fallback:", sources[index], error);
        fetchSource(index + 1, error);
      });
    }
    fetchSource(0, null);
  }

  loadPortal();
})();
