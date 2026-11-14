/* Muggle Ministry Wiki loader — same loading method as the working portal loader. */
(function () {
  if (window.__muggleMinistryWikiLoading) return;
  window.__muggleMinistryWikiLoading = true;

  var version = "20261114-5";
  var sources = [
    "https://raw.githubusercontent.com/slytherin01/muggle-ministry/main/wizarding-world/index.html?cachebust=" + version,
    "https://slytherin01.github.io/muggle-ministry/wizarding-world/index.html?v=" + version
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
    console.error("Muggle Ministry Wiki load failed:", error);
    document.open();
    document.write('<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wiki laden mislukt</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#090d16;color:#edf2fa;font:16px Arial"><main style="max-width:650px;margin:24px;padding:28px;border:1px solid #4b467c;border-radius:14px;background:#101827"><h2 style="color:#e4e0ff">Muggle Ministry Wiki</h2><p id="load-error">De wiki kon niet worden geladen.</p><button onclick="location.reload()" style="padding:10px 16px;border:0;border-radius:8px;background:#6658c9;color:white">Opnieuw proberen</button></main></body></html>');
    document.close();
    var node = document.getElementById("load-error");
    if (node) node.textContent = "De wiki kon niet worden geladen. " + String(error && error.message || error);
  }

  var attempts = sources.map(function (url) {
    return fetchWithTimeout(url, 10000).then(function (html) {
      if (!html || html.length < 8000 || html.indexOf("<html") === -1 || html.indexOf("<body") === -1) {
        throw new Error("Ongeldige HTML-bron: " + url);
      }
      return html;
    });
  });

  Promise.any(attempts).then(function (html) {
    document.open();
    document.write(html);
    document.close();
  }).catch(showError);
})();