/* Wizarding World embed loader */
(function () {
  if (window.__muggleMinistryWizardingLoading) return;
  window.__muggleMinistryWizardingLoading = true;
  var version = "20261114-2";
  var sources = [
    "https://raw.githubusercontent.com/slytherin01/muggle-ministry/main/wizarding-world/index.html?cachebust=" + version,
    "https://slytherin01.github.io/muggle-ministry/wizarding-world/index.html?v=" + version
  ];
  function fetchPage(url) {
    var controller = new AbortController();
    var timer = setTimeout(function(){controller.abort();},10000);
    return fetch(url,{cache:"no-cache",credentials:"omit",mode:"cors",signal:controller.signal})
      .then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.text();})
      .finally(function(){clearTimeout(timer);});
  }
  function fail(error) {
    console.error("Wizarding World load failed",error);
    document.open();
    document.write('<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Encyclopedie laden mislukt</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#090d16;color:#edf2fa;font:14px Arial"><main style="max-width:620px;margin:24px;padding:28px;border:1px solid #34445b;border-radius:14px;background:#101827"><h2 style="color:#e4e0ff">Wizarding World Encyclopedie</h2><p id="load-error">Laden mislukt.</p><button onclick="location.reload()" style="padding:10px 16px;border:1px solid #4b467c;border-radius:9px;background:#252448;color:white">Opnieuw proberen</button><p><a style="color:#b7aaff" href="https://slytherin01.github.io/muggle-ministry/wizarding-world/">Open de encyclopedie rechtstreeks</a></p></main></body></html>');
    document.close();
    var node=document.getElementById("load-error");
    if(node)node.textContent="De encyclopedie kon niet worden geladen: "+String(error&&error.message||error);
  }
  Promise.any(sources.map(function(url){return fetchPage(url).then(function(html){if(!html||html.length<5000||html.indexOf("<html")<0||html.indexOf("<body")<0)throw new Error("Ongeldige HTML-bron");return html;});}))
    .then(function(html){document.open();document.write(html);document.close();})
    .catch(fail);
})();