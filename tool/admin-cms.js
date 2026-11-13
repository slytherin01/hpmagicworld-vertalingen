/* Admin CMS module — loaded by tool/index.html */
(()=> {
 const $=(s,r=document)=>r.querySelector(s);
 const client=()=>window.hpmwSupabase;
 const kinds={faq:"FAQ",news:"HP Nieuws",job:"Vacatures",maintenance:"Onderhoud"};
 const perms=["view","edit","publish","delete"];
 const css=`
 #adminCmsView .cms-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}
 #adminCmsView .cms-tabs button,#adminCmsView .cms-btn{border:1px solid #34465d;background:#152238;color:#edf2fa;border-radius:9px;padding:9px 13px;cursor:pointer}
 #adminCmsView .cms-tabs button.active,#adminCmsView .cms-btn.primary{background:#7865ee;border-color:#7865ee}
 #adminCmsView .cms-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.8fr);gap:16px}
 #adminCmsView .cms-panel{background:#101827;border:1px solid #26364c;border-radius:14px;padding:18px;min-width:0}
 #adminCmsView input,#adminCmsView textarea,#adminCmsView select{width:100%;padding:10px;border:1px solid #35465b;border-radius:8px;background:#080e19;color:#edf2fa;margin:5px 0 12px}
 #adminCmsView label{display:block;color:#c9d8ed;font-size:12px;font-weight:700}
 #adminCmsView .cms-item{padding:12px;border:1px solid #26364c;border-radius:10px;margin:8px 0;display:flex;gap:10px;align-items:center;justify-content:space-between}
 #adminCmsView .cms-item small{display:block;color:#91a0b5}
 #adminCmsView .cms-perm{display:grid;grid-template-columns:1fr repeat(4,70px);gap:8px;align-items:center;padding:9px;border-bottom:1px solid #26364c}
 #adminCmsView .cms-status{color:#91a0b5;min-height:24px}
 @media(max-width:760px){#adminCmsView .cms-grid{grid-template-columns:1fr}#adminCmsView .cms-perm{grid-template-columns:1fr repeat(4,42px);font-size:11px}}
 `;
 function go(id){document.querySelectorAll(".view").forEach(v=>{v.classList.remove("active");v.style.setProperty("display","none","important")});const v=$("#"+id);if(v){v.classList.add("active");v.style.setProperty("display","block","important");v.style.setProperty("visibility","visible","important")}window.scrollTo(0,0)}
 function init(){
  if($("#adminCmsView"))return;
  const style=document.createElement("style");style.textContent=css;document.head.append(style);
  const grid=$(".dash-grid");if(grid){const card=document.createElement("article");card.className="dash-card";card.innerHTML='<div class="dash-icon"><i class="fa-solid fa-screwdriver-wrench"></i></div><h2>Admin</h2><p>Beheer FAQ, nieuws, vacatures, onderhoud en toegangsrechten vanuit één omgeving.</p><button class="btn primary" id="openAdminCms">Admin openen</button>';grid.append(card);$("#openAdminCms").onclick=()=>{go("adminCmsView");load()};}
  const nav=$(".top-actions");if(nav){const b=document.createElement("button");b.type="button";b.className="lux-nav-item hpmw-nav-link";b.innerHTML='<span class="lux-nav-icon"><i class="fa-solid fa-shield-halved"></i></span><span>Admin</span>';b.onclick=()=>{go("adminCmsView");load()};nav.insertBefore(b,nav.querySelector("#adminSignedIn"));}
  const section=document.createElement("section");section.className="view";section.id="adminCmsView";
  section.innerHTML=`
   <div class="page-head translation-bluebar"><div class="translation-bluebar-copy"><div class="eyebrow">CENTRAAL BEHEER</div><h1>Admin</h1><p class="subtitle">Beheer de inhoud van het portaal en de toegangsrechten.</p></div><div class="translation-bluebar-actions"><button class="btn" id="cmsBack">← Dashboard</button></div></div>
   <div class="cms-tabs" id="cmsTabs"></div><div class="cms-grid">
    <div class="cms-panel"><h2 id="cmsListTitle">Inhoud</h2><div id="cmsList"></div></div>
    <div class="cms-panel"><h2 id="cmsFormTitle">Nieuw item</h2><form id="cmsForm"><label>Titel<input id="cmsTitle" required maxlength="180"></label><label>Tekst / antwoord / omschrijving<textarea id="cmsBody" rows="7"></textarea></label><label>Bron (voor nieuws)<input id="cmsSource"></label><label>Auteur (voor nieuws)<input id="cmsAuthor"></label><label>Volgorde<input id="cmsOrder" type="number" value="0"></label><label><input id="cmsPublished" type="checkbox" style="width:auto"> Direct publiceren</label><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="cms-btn primary" type="submit">Opslaan</button><button class="cms-btn" type="button" id="cmsNew">Nieuw / wissen</button></div><p class="cms-status" id="cmsStatus" role="status"></p></form></div>
   </div><div class="cms-panel" style="margin-top:16px"><h2>Gebruikersrechten</h2><p>Beheer rechten per Supabase-gebruiker. Gebruikers-ID's worden getoond; de beheerder koppelt deze aan de juiste medewerker.</p><div id="cmsPermissions"></div><p class="cms-status" id="cmsPermStatus"></p></div>`;
  $("main.shell")?.append(section);
  $("#cmsBack").onclick=()=>go("newAdminDashboard");$("#cmsNew").onclick=reset;
  $("#cmsForm").onsubmit=save;
  const tabs=$("#cmsTabs");Object.entries(kinds).forEach(([k,v])=>{const b=document.createElement("button");b.textContent=v;b.dataset.kind=k;b.onclick=()=>selectKind(k);tabs.append(b)});
  const p=document.createElement("button");p.textContent="Rechten";p.onclick=()=>{document.querySelectorAll("#cmsTabs button").forEach(x=>x.classList.remove("active"));$("#cmsListTitle").textContent="Gebruikersrechten";$("#cmsList").innerHTML="Selecteer een gebruiker in de rechtenlijst hieronder.";};tabs.append(p);
  selectKind("faq");
 }
 let kind="faq",editing=null;
 function reset(){editing=null;$("#cmsForm").reset();$("#cmsOrder").value=0;$("#cmsFormTitle").textContent="Nieuw item";}
 function selectKind(k){kind=k;editing=null;document.querySelectorAll("#cmsTabs button").forEach(b=>b.classList.toggle("active",b.dataset.kind===k));$("#cmsListTitle").textContent=kinds[k];reset();load();}
 async function load(){
  const db=client();if(!db||!document.body.classList.contains("supabase-authenticated"))return;
  $("#cmsStatus").textContent="Laden…";
  const {data,error}=await db.from("admin_content").select("*").eq("kind",kind).order("sort_order").order("updated_at",{ascending:false});
  if(error){$("#cmsList").textContent=error.message;$("#cmsStatus").textContent="Controleer of de Admin SQL-migratie is uitgevoerd.";return}
  $("#cmsList").innerHTML="";
  (data||[]).forEach(item=>{const el=document.createElement("div");el.className="cms-item";const info=document.createElement("div");const title=document.createElement("strong");title.textContent=item.title;const meta=document.createElement("small");meta.textContent=(item.published?"Gepubliceerd":"Concept")+" · "+new Date(item.updated_at).toLocaleString("nl-NL");info.append(title,meta);const actions=document.createElement("div");const edit=document.createElement("button");edit.className="cms-btn";edit.textContent="Bewerk";edit.onclick=()=>{editing=item;$("#cmsTitle").value=item.title;$("#cmsBody").value=item.body;$("#cmsSource").value=item.source||"";$("#cmsAuthor").value=item.author||"";$("#cmsOrder").value=item.sort_order||0;$("#cmsPublished").checked=item.published;$("#cmsFormTitle").textContent="Bewerk "+kinds[k]};const del=document.createElement("button");del.className="cms-btn";del.textContent="Verwijder";del.onclick=async()=>{if(!confirm("Dit item verwijderen?"))return;const {error}=await db.from("admin_content").delete().eq("id",item.id);$("#cmsStatus").textContent=error?.message||"Verwijderd.";load()};actions.append(edit,del);el.append(info,actions);$("#cmsList").append(el)});
  $("#cmsStatus").textContent=(data||[]).length+" item(s) geladen.";
  loadPermissions();
 }
 async function save(e){e.preventDefault();const db=client(),user=(await db.auth.getUser()).data.user;if(!user)return;const payload={kind,title:$("#cmsTitle").value.trim(),body:$("#cmsBody").value,source:$("#cmsSource").value,author:$("#cmsAuthor").value,sort_order:Number($("#cmsOrder").value)||0,published:$("#cmsPublished").checked,updated_by:user.id};let result;if(editing)result=await db.from("admin_content").update(payload).eq("id",editing.id);else result=await db.from("admin_content").insert({...payload,created_by:user.id});$("#cmsStatus").textContent=result.error?result.error.message:"Opgeslagen.";if(!result.error){reset();load()}}
 async function loadPermissions(){const db=client();const box=$("#cmsPermissions");if(!box)return;const {data,error}=await db.from("admin_permissions").select("*").order("updated_at",{ascending:false});if(error){box.textContent="Rechten niet beschikbaar: "+error.message;return}box.innerHTML="";(data||[]).forEach(row=>{const line=document.createElement("div");line.className="cms-perm";const id=document.createElement("code");id.textContent=row.user_id;line.append(id);const labels={faq:"FAQ",news:"Nieuws",jobs:"Vacatures",maintenance:"Onderhoud"};Object.entries(labels).forEach(([slug,label])=>{const wrap=document.createElement("label");wrap.textContent=label;const cb=document.createElement("input");cb.type="checkbox";cb.checked=row["can_view_"+slug];cb.title="Mag bekijken: "+label;cb.onchange=async()=>{const {data:userData}=await db.auth.getUser();const patch={["can_view_"+slug]:cb.checked,updated_by:userData.user.id,updated_at:new Date().toISOString()};const {error}=await db.from("admin_permissions").update(patch).eq("user_id",row.user_id);$("#cmsPermStatus").textContent=error?.message||"Recht bijgewerkt."};wrap.append(cb);line.append(wrap)});box.append(line)});if(!(data||[]).length)box.textContent="Nog geen rechtenprofielen. Voeg eerst een profiel toe via Supabase SQL; daarna kun je de kijkrechten hier aanpassen."}
 document.addEventListener("DOMContentLoaded",init);if(document.readyState!=="loading")init();
 document.addEventListener("hpmw:supabase-role",()=>{if($("#adminCmsView"))load()});
})();