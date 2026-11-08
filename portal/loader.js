/* Muggle Ministry loader — bounded fetch with visible failure state. */
(function () {
  if (window.__muggleMinistryPortalLoading) return;
  window.__muggleMinistryPortalLoading = true;
  var source = "https://raw.githubusercontent.com/slytherin01/muggle-ministry/main/portal/index.html?cachebust=20261108-15";
  var controller = new AbortController();
  var timeout = setTimeout(function () { controller.abort(); }, 20000);
  fetch(source, { cache: "no-store", credentials: "omit", signal: controller.signal })
    .then(function (response) {
      if (!response.ok) throw new Error("GitHub antwoordde met HTTP " + response.status);
      return response.text();
    })
    .then(function (html) {
      clearTimeout(timeout);
      if (!html || html.length < 10000) throw new Error("Het portaalbestand is onvolledig ontvangen.");
      document.open();
      document.write(html);
      document.close();
    })
    .catch(function (error) {
      clearTimeout(timeout);
      console.error("Muggle Ministry portal load failed:", error);
      var message = error && error.name === "AbortError"
        ? "Het laden duurde langer dan 20 seconden. Controleer de verbinding met GitHub en probeer opnieuw."
        : "Het portaal kon niet worden opgehaald: " + String(error);
      document.open();
      document.write('<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portaal laden mislukt</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#080f1a;color:#edf4fa;font:16px Arial"><main style="max-width:620px;margin:24px;padding:28px;border:1px solid #344963;border-radius:14px;background:#111e2e"><h2>Muggle Ministry</h2><p></p><button onclick="location.reload()" style="padding:10px 16px;border:0;border-radius:8px;background:#287f98;color:white">Opnieuw proberen</button></main></body></html>');
      document.close();
      document.querySelector("main p").textContent = message;
    });
})();