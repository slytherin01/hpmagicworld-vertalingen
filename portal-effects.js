/* Hpmagicworld portal effects — realistic CSS particle decorations, centrally configured from Supabase. */
(() => {
  "use strict";
  const SUPABASE_URL = "https://vuaajsjjluwgqmneinds.supabase.co";
  const SUPABASE_KEY = "sb_publishable_tto6sNxZPLv1VhUdMRlPHg_ptzg9odx";
  const CONFIG_URL = SUPABASE_URL + "/rest/v1/portal_effects_settings?id=eq.1&select=snow,fireworks,pumpkins,updated_at";
  const STYLE_ID = "hpmw-portal-effects-style";
  const LAYER_ID = "hpmw-portal-effects-layer";
  let lastConfig = "";
  let refreshTimer = null;
  let pollTimer = null;
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const random = (min, max) => min + Math.random() * (max - min);

  const removeEffects = () => {
    document.getElementById(LAYER_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  };

  const addStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${LAYER_ID}{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:99990;contain:strict}
      #${LAYER_ID} .hpmw-flake{position:absolute;top:-18px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 24%,#e8f5ff 48%,#b9d8ed 100%);box-shadow:0 0 5px 1px #d8f1ff88;animation:hpmw-snow-fall linear infinite;will-change:transform}
      @keyframes hpmw-snow-fall{0%{transform:translate3d(0,-3vh,0)}50%{transform:translate3d(var(--sway),52vh,0)}100%{transform:translate3d(var(--drift),108vh,0)}}
      #${LAYER_ID} .hpmw-pumpkin{position:absolute;bottom:-100px;width:var(--size);height:calc(var(--size)*.82);border-radius:48% 48% 45% 45%;background:radial-gradient(ellipse at 34% 28%,#ffbf55 0 8%,#f58a1c 25%,#c94e08 72%,#78300d 100%);box-shadow:inset 7px 0 9px #ffd17a88,inset -8px 0 10px #67250688,0 5px 12px #0008;animation:hpmw-pumpkin-rise linear infinite;will-change:transform}
      #${LAYER_ID} .hpmw-pumpkin:before{content:"";position:absolute;inset:2% 22%;border-radius:48%;border-left:3px solid #ffca6a88;border-right:3px solid #7d310b99;box-shadow:-7px 0 0 -4px #ffce7488,7px 0 0 -4px #7d310b88}
      #${LAYER_ID} .hpmw-pumpkin:after{content:"";position:absolute;width:12%;height:19%;left:44%;top:-13%;border-radius:45% 45% 20% 20%;background:linear-gradient(90deg,#3e5422,#8c9b42 45%,#35471b);transform:rotate(-9deg)}
      @keyframes hpmw-pumpkin-rise{0%{transform:translate3d(0,0,0) rotate(-8deg)}50%{transform:translate3d(var(--sway),-55vh,0) rotate(8deg)}100%{transform:translate3d(var(--drift),-120vh,0) rotate(22deg)}}
      #${LAYER_ID} .hpmw-firework{position:absolute;width:2px;height:2px}
      #${LAYER_ID} .hpmw-spark{position:absolute;left:0;top:0;width:3px;height:3px;border-radius:50%;background:var(--color);box-shadow:0 0 5px 2px var(--glow);animation:hpmw-spark-flight var(--duration) cubic-bezier(.12,.55,.3,1) forwards;opacity:0}
      @keyframes hpmw-spark-flight{0%{transform:translate(0,0) scale(.25);opacity:1}12%{opacity:1}78%{opacity:.9}100%{transform:translate(var(--dx),var(--dy)) scale(.05);opacity:0}}
      @media(prefers-reduced-motion:reduce){#${LAYER_ID}{display:none!important}}
    `;
    document.head.appendChild(style);
  };

  const buildEffects = cfg => {
    removeEffects();
    if (reducedMotion || (!cfg.snow && !cfg.fireworks && !cfg.pumpkins)) return;
    addStyle();
    const layer = document.createElement("div");
    layer.id = LAYER_ID;
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    if (cfg.snow) {
      for (let i = 0; i < 105; i++) {
        const flake = document.createElement("i");
        flake.className = "hpmw-flake";
        const size = random(2, 6.5);
        flake.style.left = random(0, 100) + "%";
        flake.style.width = size + "px";
        flake.style.height = size + "px";
        flake.style.opacity = random(.28, .88);
        flake.style.filter = size < 3 ? "blur(.6px)" : "none";
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
        pumpkin.style.left = random(2, 96) + "%";
        pumpkin.style.setProperty("--size", random(25, 48) + "px");
        pumpkin.style.opacity = random(.72, .98);
        pumpkin.style.animationDuration = random(22, 38) + "s";
        pumpkin.style.animationDelay = -random(0, 38) + "s";
        pumpkin.style.setProperty("--sway", random(-55, 55) + "px");
        pumpkin.style.setProperty("--drift", random(-85, 85) + "px");
        layer.appendChild(pumpkin);
      }
    }

    if (cfg.fireworks) {
      const colors = [
        ["#fff0a6", "#ffb52e"], ["#ffb5d2", "#ff438a"],
        ["#a8f0ff", "#28a9ff"], ["#d8b7ff", "#9b59ff"],
        ["#c8ffb0", "#65d94a"]
      ];
      const burst = () => {
        if (document.hidden || !document.getElementById(LAYER_ID)) return;
        const firework = document.createElement("span");
        firework.className = "hpmw-firework";
        firework.style.left = random(10, 90) + "%";
        firework.style.top = random(12, 55) + "%";
        const palette = colors[Math.floor(Math.random() * colors.length)];
        const count = 30;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i / count) + random(-.07, .07);
          const distance = random(38, 82);
          const spark = document.createElement("i");
          spark.className = "hpmw-spark";
          spark.style.setProperty("--dx", Math.cos(angle) * distance + "px");
          spark.style.setProperty("--dy", Math.sin(angle) * distance + "px");
          spark.style.setProperty("--color", palette[0]);
          spark.style.setProperty("--glow", palette[1]);
          spark.style.setProperty("--duration", random(850, 1450) + "ms");
          spark.style.animationDelay = random(0, 90) + "ms";
          firework.appendChild(spark);
        }
        layer.appendChild(firework);
        setTimeout(() => firework.remove(), 1750);
      };
      burst();
      refreshTimer = setInterval(burst, 2100);
    }
  };

  async function refresh() {
    try {
      const response = await fetch(CONFIG_URL, {
        headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
        cache: "no-store"
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const rows = await response.json();
      const row = rows && rows[0];
      const cfg = { snow: !!row?.snow, fireworks: !!row?.fireworks, pumpkins: !!row?.pumpkins };
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