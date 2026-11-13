/* Hpmagicworld Ticket Support loader — CORS-friendly source order with GitHub Pages fallback. */
(function () {
  if (window.__muggleMinistryPortalLoading) return;
  window.__muggleMinistryPortalLoading = true;

  var version = "20261113-42";
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

  function loadFrom(index, previousError) {
    if (index >= sources.length) {
      showError(previousError || new Error("Geen geldige portaalbron beschikbaar."));
      return;
    }
    fetchWithTimeout(sources[index], 15000).then(function (html) {
      if (!html || html.length < 10000 || !/<html[\s>]/i.test(html) || !/<body[\s>]/i.test(html)) {
        throw new Error("De portaalbron gaf geen volledige HTML-pagina terug.");
      }
      document.open();
      document.write(html);
      document.close();
    }).catch(function (error) {
      console.warn("Portaalbron " + (index + 1) + " niet beschikbaar; volgende bron wordt geprobeerd.", error);
      loadFrom(index + 1, error);
    });
  }

  loadFrom(0);
})();
