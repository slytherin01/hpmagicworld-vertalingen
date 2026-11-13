/* Hpmagicworld portal effects — realistic CSS particle decorations, centrally configured from Supabase. */
(() => {
  "use strict";
  const SUPABASE_URL = "https://vuaajsjjluwgqmneinds.supabase.co";
  const SUPABASE_KEY = "sb_publishable_tto6sNxZPLv1VhUdMRlPHg_ptzg9odx";
  const CONFIG_URL = SUPABASE_URL + "/rest/v1/portal_effects_settings?id=eq.1&select=snow,fireworks,pumpkins,greeting,year,updated_at";
  const STYLE_ID = "hpmw-portal-effects-style";
  const LAYER_ID = "hpmw-portal-effects-layer";
  let lastConfig = "";
  let refreshTimer = null;
  let pollTimer = null;
  let fireworksInstance = null;
  let fireworksLoadPromise = null;
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const random = (min, max) => min + Math.random() * (max - min);

  const removeEffects = () => {
    document.getElementById(LAYER_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
    if (fireworksInstance) { try { fireworksInstance.stop(true); } catch (_) {} fireworksInstance = null; }
  };

  const addStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${LAYER_ID}{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:99990;contain:strict}
      #${LAYER_ID} .hpmw-newyear-message{position:fixed;top:clamp(18px,5vh,54px);left:50%;transform:translateX(-50%);width:max-content;max-width:92vw;padding:13px 22px;border:1px solid #f4d27a;border-radius:14px;background:linear-gradient(135deg,#17243beF,#33234beF);color:#fff8dc;text-align:center;font:800 clamp(16px,2.4vw,25px)/1.35 Georgia,serif;letter-spacing:.02em;text-shadow:0 2px 10px #000;box-shadow:0 8px 28px #0008,0 0 22px #f7d47744;backdrop-filter:blur(8px);z-index:2}
      #${LAYER_ID} .hpmw-fireworks-host{position:absolute;inset:0;z-index:0}
      #${LAYER_ID} .hpmw-fireworks-host canvas{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;opacity:.95}
      #${LAYER_ID} .hpmw-flake{position:absolute;top:-18px;border-radius:50%;background:#fff;box-shadow:0 0 4px 1px #ffffffaa;animation:hpmw-snow-fall linear infinite;will-change:transform}
      @keyframes hpmw-snow-fall{0%{transform:translate3d(0,-3vh,0)}50%{transform:translate3d(var(--sway),52vh,0)}100%{transform:translate3d(var(--drift),108vh,0)}}
      #${LAYER_ID} .hpmw-pumpkin{position:absolute;top:var(--top);left:var(--left);width:var(--size);height:calc(var(--size)*.82);border-radius:48% 48% 45% 45%;background:radial-gradient(ellipse at 32% 25%,#ffd27a 0 5%,#ffad35 18%,#ed7414 48%,#a83c08 88%,#632508 100%);box-shadow:inset 5px 0 8px #ffe0a088,inset -8px 0 12px #672506aa,0 8px 18px #0009;animation:hpmw-pumpkin-hover ease-in-out infinite alternate;will-change:transform}
      #${LAYER_ID} .hpmw-pumpkin:before{content:"";position:absolute;inset:2% 22%;border-radius:48%;border-left:3px solid #ffca6a88;border-right:3px solid #7d310b99;box-shadow:-7px 0 0 -4px #ffce7488,7px 0 0 -4px #7d310b88}
      #${LAYER_ID} .hpmw-pumpkin:after{content:"";position:absolute;width:12%;height:19%;left:44%;top:-13%;border-radius:45% 45% 20% 20%;background:linear-gradient(90deg,#3e5422,#8c9b42 45%,#35471b);transform:rotate(-9deg)}
      @keyframes hpmw-pumpkin-hover{0%{transform:translate3d(-8px,-10px,0) rotate(-7deg)}50%{transform:translate3d(10px,8px,0) rotate(4deg)}100%{transform:translate3d(var(--drift),-14px,0) rotate(9deg)}}
      #${LAYER_ID} .hpmw-firework{position:absolute;width:2px;height:2px}
      #${LAYER_ID} .hpmw-spark{position:absolute;left:0;top:0;width:4px;height:4px;border-radius:50%;background:var(--color);box-shadow:0 0 7px 3px var(--glow),0 0 15px 5px var(--glow);animation:hpmw-spark-flight var(--duration) cubic-bezier(.12,.55,.3,1) forwards;opacity:0}
      @keyframes hpmw-spark-flight{0%{transform:translate(0,0) scale(.25);opacity:1}12%{opacity:1}78%{opacity:.9}100%{transform:translate(var(--dx),var(--dy)) scale(.05);opacity:0}}
      @media(prefers-reduced-motion:reduce){#${LAYER_ID}{display:none!important}}
    `;
    document.head.appendChild(style);
  };

  const buildEffects = cfg => {
    removeEffects();
    if (reducedMotion || (!cfg.snow && !cfg.fireworks && !cfg.pumpkins && !cfg.greeting)) return;
    addStyle();
    const layer = document.createElement("div");
    layer.id = LAYER_ID;
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    if (cfg.snow) {
      for (let i = 0; i < 105; i++) {
        const flake = document.createElement("i");
        flake.className = "hpmw-flake";
        const size = random(2.5, 7);
        flake.style.left = random(0, 100) + "%";
        flake.style.width = size + "px";
        flake.style.height = size + "px";
        flake.style.opacity = random(.72, 1);
        flake.style.filter = size < 3 ? "blur(.25px)" : "none";
        flake.style.animationDuration = random(10, 25) + "s";
        flake.style.animationDelay = -random(0, 25) + "s";
        flake.style.setProperty("--sway", random(-35, 35) + "px");
        flake.style.setProperty("--drift", random(-65, 65) + "px");
        layer.appendChild(flake);
      }
    }

    if (cfg.pumpkins) {
      for (let i = 0; i < 9; i++) {
        const pumpkin = document.createElement("i");
        pumpkin.className = "hpmw-pumpkin";
        pumpkin.style.setProperty("--left", random(3, 93) + "%");
        pumpkin.style.setProperty("--top", random(12, 82) + "%");
        pumpkin.style.setProperty("--size", random(30, 56) + "px");
        pumpkin.style.opacity = random(.78, 1);
        pumpkin.style.animationDuration = random(5, 10) + "s";
        pumpkin.style.animationDelay = -random(0, 10) + "s";
        pumpkin.style.setProperty("--drift", random(-14, 14) + "px");
        layer.appendChild(pumpkin);
      }
    }

    if (cfg.greeting && cfg.year) {
      const message = document.createElement("div");
      message.className = "hpmw-newyear-message";
      message.textContent = "Namens het modteam een gelukkig en gezond " + cfg.year;
      layer.appendChild(message);
    }

    if (cfg.fireworks) {
      const host = document.createElement("div");
      host.className = "hpmw-fireworks-host";
      layer.appendChild(host);
      loadFireworks().then(FireworksCtor => {
        if (!FireworksCtor || !document.getElementById(LAYER_ID) || !cfg.fireworks) return;
        fireworksInstance = new FireworksCtor(host, {
          autoresize: true,
          opacity: 0.9,
          acceleration: 1.04,
          friction: 0.96,
          gravity: 1.35,
          particles: 90,
          traceLength: 4,
          traceSpeed: 10,
          explosion: 7,
          intensity: 35,
          flickering: 55,
          hue: { min: 0, max: 360 },
          delay: { min: 18, max: 38 },
          rocketsPoint: { min: 12, max: 88 },
          brightness: { min: 65, max: 90 },
          decay: { min: 0.012, max: 0.024 },
          lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
          mouse: { click: false, move: false, max: 1 },
          sound: { enabled: false }
        });
        fireworksInstance.start();
      }).catch(error => console.warn("[Hpmagicworld effects] Vuurwerkbibliotheek kon niet worden geladen.", error));
    }
  };

  function loadFireworks() {
    if (fireworksLoadPromise) return fireworksLoadPromise;
    fireworksLoadPromise = new Promise((resolve, reject) => {
      if (window.Fireworks && window.Fireworks.default) { resolve(window.Fireworks.default); return; }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/fireworks-js@2.10.7/dist/index.umd.js";
      script.async = true;
      script.onload = () => {
        const ctor = window.Fireworks && (window.Fireworks.default || window.Fireworks);
        if (ctor) resolve(ctor);
        else reject(new Error("Fireworks constructor ontbreekt"));
      };
      script.onerror = () => { fireworksLoadPromise = null; reject(new Error("CDN niet bereikbaar")); };
      document.head.appendChild(script);
    });
    return fireworksLoadPromise;
  }

  async function refresh() {
    try {
      const response = await fetch(CONFIG_URL, {
        headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
        cache: "no-store"
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const rows = await response.json();
      const row = rows && rows[0];
      const cfg = { snow: !!row?.snow, fireworks: !!row?.fireworks, pumpkins: !!row?.pumpkins, greeting: !!row?.greeting, year: String(row?.year || "").trim() };
      const signature = JSON.stringify(cfg);
      if (signature !== lastConfig) {
        lastConfig = signature;
        buildEffects(cfg);
      }
    } catch (error) {
      console.warn("[Hpmagicworld effects] Instellingen konden niet worden geladen.", error);
    }
  }

  const start = () => {
    refresh();
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(refresh, 60000);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();