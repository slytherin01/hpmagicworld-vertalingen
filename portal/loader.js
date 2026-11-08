/* Forumotion bridge: load the GitHub-hosted portal into the current Forumotion page.
   The portal scripts execute on the Forumotion origin, preserving Forumotion cookies and _userdata. */
(async function () {
  if (window.__muggleMinistryPortalLoading) return;
  window.__muggleMinistryPortalLoading = true;
  const SOURCE = "https://slytherin01.github.io/muggle-ministry/portal/index.html?v=20261108-2";
  const fail = (error) => {
    console.error("Muggle Ministry portal could not be loaded:", error);
    document.body.innerHTML = '<div style="margin:20px;padding:18px;background:#101827;color:#fff;border:1px solid #9b8cff;border-radius:12px;font:14px Arial">Het portaal kon niet worden geladen. Vernieuw de pagina of probeer het later opnieuw.</div>';
  };
  try {
    const response = await fetch(SOURCE, { cache: "no-store", credentials: "omit" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const markup = await response.text();
    const parsed = new DOMParser().parseFromString(markup, "text/html");
    if (!parsed.body || !parsed.body.children.length) throw new Error("Portal HTML is leeg");

    document.documentElement.lang = parsed.documentElement.lang || "nl";
    document.title = parsed.title || "Muggle Ministry — Portaal & Ticket Support";

    // Copy portal styles and stylesheets, but keep this page on the Forumotion origin.
    for (const node of parsed.head.querySelectorAll('link[rel="stylesheet"], style, link[rel="icon"], meta[name="theme-color"]')) {
      document.head.appendChild(node.cloneNode(true));
    }

    // Keep Forumotion's window globals/cookies (_userdata) intact; only replace visible page markup.
    const bodyNodes = Array.from(parsed.body.childNodes).map(node => node.cloneNode(true));
    document.body.replaceChildren(...bodyNodes);

    // Recreate scripts in document order so the ticket app initializes normally.
    const scripts = Array.from(document.body.querySelectorAll("script"));
    for (const oldScript of scripts) {
      const script = document.createElement("script");
      for (const attr of oldScript.attributes) script.setAttribute(attr.name, attr.value);
      script.textContent = oldScript.textContent;
      oldScript.replaceWith(script);
      if (script.src) {
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error("Script kon niet laden: " + script.src));
        });
      }
    }
    window.__muggleMinistryPortalLoaded = true;
  } catch (error) {
    fail(error);
  } finally {
    window.__muggleMinistryPortalLoading = false;
  }
})();