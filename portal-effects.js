/* Hpmagicworld portal effects — centrally configured from Supabase.
   Embed once on Forumactie. Changes saved in the admin tool are picked up automatically. */
(() => {
  "use strict";
  const SUPABASE_URL = "https://vuaajsjjluwgqmneinds.supabase.co";
  const SUPABASE_KEY = "sb_publishable_tto6sNxZPLv1VhUdMRlPHg_ptzg9odx";
  const CONFIG_URL = SUPABASE_URL + "/rest/v1/portal_effects_settings?id=eq.1&select=snow,fireworks,pumpkins,updated_at";
  const STYLE_ID = "hpmw-portal-effects-style";
  const LAYER_ID = "hpmw-portal-effects-layer";
  let lastConfig = "";
  let refreshTimer = null;

  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const random = (min,max) => min + Math.random() * (max-min);
  const removeEffects = () => {
    document.getElementById(LAYER_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer=null; }
  };
  const addStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style=document.createElement("style");style.id=STYLE_ID;
    style.textContent=`
      #${LAYER_ID}{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:99990}
      #${LAYER_ID} .hpmw-snowflake{position:absolute;top:-24px;color:#fff;text-shadow:0 0 5px #8bd8ff;animation:hpmw-snow-fall linear infinite;will-change:transform}
      @keyframes hpmw-snow-fall{to{transform:translate3d(var(--drift),110vh,0) rotate(360deg)}}
      #${LAYER_ID} .hpmw-pumpkin{position:absolute;bottom:-70px;animation:hpmw-pumpkin-float linear infinite;will-change:transform;filter:drop-shadow(0 3px 5px #0008)}
      @keyframes hpmw-pumpkin-float{to{transform:translate3d(var(--drift),-120vh,0) rotate(28deg)}}
      #${LAYER_ID} .hpmw-firework{position:absolute;width:4px;height:4px;border-radius:50%;background:transparent;animation:hpmw-firework-burst 1.25s ease-out forwards}
      @keyframes hpmw-firework-burst{0%{box-shadow:0 0 0 0 var(--spark);opacity:1}100%{box-shadow:0 -58px 0 1px #ffd166,41px -41px 0 1px #ff6b6b,58px 0 0 1px #7bdff2,41px 41px 0 1px #b2f7ef,0 58px 0 1px #f7aef8,-41px 41px 0 1px #f9f871,-58px 0 0 1px #a0c4ff,-41px -41px 0 1px #ffadad;opacity:0}}
      @media(prefers-reduced-motion:reduce){#${LAYER_ID}{display:none!important}}
    `;
    document.head.appendChild(style);
  };
  const buildEffects = cfg => {
    removeEffects();
    if (reducedMotion || (!cfg.snow && !cfg.fireworks && !cfg.pumpkins)) return;
    addStyle();
    const layer=document.createElement("div");layer.id=LAYER_ID;layer.setAttribute("aria-hidden","true");document.body.appendChild(layer);
    if(cfg.snow) for(let i=0;i<75;i++){
      const f=document.createElement("span");f.className="hpmw-snowflake";f.textContent="❄";
      f.style.left=random(0,100)+"%";f.style.fontSize=random(10,22)+"px";f.style.opacity=random(.35,.95);
      f.style.animationDuration=random(7,18)+"s";f.style.animationDelay=-random(0,18)+"s";f.style.setProperty("--drift",random(-55,55)+"px");layer.appendChild(f);
    }
    if(cfg.pumpkins) for(let i=0;i<10;i++){
      const f=document.createElement("span");f.className="hpmw-pumpkin";f.textContent="🎃";
      f.style.left=random(0,100)+"%";f.style.fontSize=random(24,46)+"px";
      f.style.animationDuration=random(14,27)+"s";f.style.animationDelay=-random(0,25)+"s";f.style.setProperty("--drift",random(-90,90)+"px");layer.appendChild(f);
    }
    if(cfg.fireworks){
      const burst=()=>{if(document.hidden||!document.getElementById(LAYER_ID))return;
        const f=document.createElement("i");f.className="hpmw-firework";f.style.left=random(8,92)+"%";f.style.top=random(12,58)+"%";f.style.setProperty("--spark",["#ffd166","#ff6b6b","#7bdff2","#b2f7ef"][Math.floor(Math.random()*4)]);layer.appendChild(f);setTimeout(()=>f.remove(),1300);
      };
      burst();refreshTimer=setInterval(burst,1900);
    }
  };
  async function refresh(){
    try{
      const response=await fetch(CONFIG_URL,{headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY},cache:"no-store"});
      if(!response.ok)throw new Error("HTTP "+response.status);
      const rows=await response.json();const row=rows&&rows[0];
      const cfg={snow:!!row?.snow,fireworks:!!row?.fireworks,pumpkins:!!row?.pumpkins};
      const signature=JSON.stringify(cfg);
      if(signature!==lastConfig){lastConfig=signature;buildEffects(cfg);}
    }catch(error){console.warn("[Hpmagicworld effects] Instellingen konden niet worden geladen.",error);}
  }
  const start=()=>{refresh();setInterval(refresh,60000);};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();