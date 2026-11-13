/* Hpmagicworld portal effects — configured by query string */
(() => {
  "use strict";
  const p = new URLSearchParams(document.currentScript?.src.split("?")[1] || "");
  const on = k => p.get(k) === "1";
  if (!on("snow") && !on("fireworks") && !on("pumpkins")) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const style = document.createElement("style");
  style.textContent = `
    .hpmw-fx-layer{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:99999}
    .hpmw-snowflake{position:absolute;top:-12px;color:#fff;text-shadow:0 0 5px #8bd8ff;animation:hpmw-fall linear infinite}
    @keyframes hpmw-fall{to{transform:translate3d(var(--drift),110vh,0) rotate(360deg)}}
    .hpmw-pumpkin{position:absolute;bottom:-60px;animation:hpmw-float linear infinite}
    @keyframes hpmw-float{to{transform:translate3d(var(--drift),-120vh,0) rotate(25deg)}}
    .hpmw-firework{position:absolute;width:5px;height:5px;border-radius:50%;background:transparent;animation:hpmw-burst 1.15s ease-out forwards}
    @keyframes hpmw-burst{0%{box-shadow:0 0 transparent;opacity:1}100%{box-shadow:0 -55px #ffd166,39px -39px #ff6b6b,55px 0 #7bdff2,39px 39px #b2f7ef,0 55px #f7aef8,-39px 39px #f9f871,-55px 0 #a0c4ff,-39px -39px #ffadad;opacity:0}}
    @media(prefers-reduced-motion:reduce){.hpmw-fx-layer{display:none}}
  `;
  document.head.appendChild(style);
  const layer = document.createElement("div");
  layer.className = "hpmw-fx-layer";
  layer.setAttribute("aria-hidden","true");
  document.body.appendChild(layer);

  if (on("snow")) {
    for (let i=0;i<65;i++) {
      const f=document.createElement("span"); f.className="hpmw-snowflake"; f.textContent="❄";
      f.style.left=Math.random()*100+"%"; f.style.fontSize=(9+Math.random()*13)+"px";
      f.style.opacity=.35+Math.random()*.65; f.style.animationDuration=(7+Math.random()*12)+"s";
      f.style.animationDelay=(-Math.random()*18)+"s"; f.style.setProperty("--drift",(Math.random()*100-50)+"px");
      layer.appendChild(f);
    }
  }
  if (on("pumpkins")) {
    for (let i=0;i<9;i++) {
      const f=document.createElement("span"); f.className="hpmw-pumpkin"; f.textContent="🎃";
      f.style.left=Math.random()*100+"%"; f.style.fontSize=(22+Math.random()*22)+"px";
      f.style.animationDuration=(13+Math.random()*13)+"s"; f.style.animationDelay=(-Math.random()*24)+"s";
      f.style.setProperty("--drift",(Math.random()*160-80)+"px"); layer.appendChild(f);
    }
  }
  if (on("fireworks")) {
    const burst=()=>{if(!document.hidden){const f=document.createElement("i");f.className="hpmw-firework";f.style.left=(10+Math.random()*80)+"%";f.style.top=(12+Math.random()*48)+"%";f.style.color=["#ffd166","#ff6b6b","#7bdff2","#b2f7ef"][Math.floor(Math.random()*4)];layer.appendChild(f);setTimeout(()=>f.remove(),1200)}};
    burst(); setInterval(burst,1800);
  }
})();