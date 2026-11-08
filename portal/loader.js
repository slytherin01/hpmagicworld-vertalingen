/* Forumotion loader: render the hosted portal as the document on the Forumotion URL.
   No iframe: the page keeps the Forumotion origin, cookies and _userdata session. */
(async function () {
  if (window.__muggleMinistryPortalLoading) return;
  window.__muggleMinistryPortalLoading = true;
  const source = "https://raw.githubusercontent.com/slytherin01/muggle-ministry/main/portal/index.html?cachebust=20261108-9";
  try {
    const response = await fetch(source, { cache: "no-store", credentials: "omit" });
    if (!response.ok) throw new Error("Portalbestand niet bereikbaar (HTTP " + response.status + ")");
    const html = await response.text();
    if (!html || html.length < 10000) throw new Error("GitHub gaf geen volledig portaalbestand terug (lengte: " + html.length + ")");
    // document.write parses markup and scripts in their normal order; the visible URL
    // remains the Forumotion URL, so Forumotion cookies and window._userdata remain available.
    document.open();
    document.write(html);
    document.close();
  } catch (error) {
    console.error("Muggle Ministry portal load failed:", error);
    document.open();
    document.write('<!doctype html><html lang="nl"><meta charset="utf-8"><title>Portaal laden mislukt</title><body style="margin:0;padding:28px;background:#090d16;color:#fff;font:16px Arial"><h2>Het portaal kon niet worden geladen</h2><p>Ververs de pagina. Als dit blijft gebeuren, controleer dan of GitHub Pages bereikbaar is.</p><pre style="white-space:pre-wrap;color:#ffb7c2"></pre></body></html>');
    document.close();
    document.querySelector("pre").textContent = String(error);
  }
})();