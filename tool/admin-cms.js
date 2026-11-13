/* Admin CMS module — loaded by tool/index.html */
(()=> {
 const $=(s,r=document)=>r.querySelector(s);
 const client=()=>window.hpmwSupabase;
 const kinds={page:"Portaalteksten",faq:"FAQ",news:"HP Nieuws",job:"Vacatures",maintenance:"Onderhoud"};
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
 #adminCmsView .cms-item small{display:block;color:#91a0b5} #adminCmsView .cms-pin{color:#e5d88c;font-size:11px;font-weight:800}
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
    <div class="cms-panel"><h2 id="cmsFormTitle">Nieuw item</h2><form id="cmsForm"><label>Titel<input id="cmsTitle" required maxlength="180"></label><label>Tekst / antwoord / omschrijving<textarea id="cmsBody" rows="7"></textarea></label><label>Bron (voor nieuws)<input id="cmsSource"></label><label>Auteur (voor nieuws)<input id="cmsAuthor"></label><label>Volgorde<input id="cmsOrder" type="number" value="0"></label><label id="cmsPinWrap"><input id="cmsPinned" type="checkbox" style="width:auto"> Vastpinnen bovenaan HP Nieuws</label><label><input id="cmsPublished" type="checkbox" style="width:auto"> Direct publiceren</label><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="cms-btn primary" type="submit">Opslaan</button><button class="cms-btn" type="button" id="cmsNew">Nieuw / wissen</button></div><p class="cms-status" id="cmsStatus" role="status"></p></form></div>
   </div><div class="cms-panel" style="margin-top:16px"><h2>Gebruikersrechten</h2><p>Beheer rechten per Supabase-gebruiker. Gebruikers-ID's worden getoond; de beheerder koppelt deze aan de juiste medewerker.</p><div id="cmsPermissions"></div><p class="cms-status" id="cmsPermStatus"></p></div>`;
  $("main.shell")?.append(section);
  $("#cmsBack").onclick=()=>go("newAdminDashboard");$("#cmsNew").onclick=reset;
  $("#cmsForm").onsubmit=save;
  const tabs=$("#cmsTabs");Object.entries(kinds).forEach(([k,v])=>{const b=document.createElement("button");b.textContent=v;b.dataset.kind=k;b.onclick=()=>selectKind(k);tabs.append(b)});
  const p=document.createElement("button");p.textContent="Rechten";p.onclick=()=>{document.querySelectorAll("#cmsTabs button").forEach(x=>x.classList.remove("active"));$("#cmsListTitle").textContent="Gebruikersrechten";$("#cmsList").innerHTML="Selecteer een gebruiker in de rechtenlijst hieronder.";};tabs.append(p);
  selectKind("faq");
 }
 let kind="faq",editing=null;
 function reset(){editing=null;$("#cmsForm").reset();$("#cmsOrder").value=0;$("#cmsPinned").checked=false;$("#cmsPinWrap").style.display=kind==="news"?"block":"none";$("#cmsFormTitle").textContent="Nieuw item";}
 function selectKind(k){kind=k;editing=null;document.querySelectorAll("#cmsTabs button").forEach(b=>b.classList.toggle("active",b.dataset.kind===k));$("#cmsListTitle").textContent=kinds[k];reset();load();}
 async function load(){
  const db=client();if(!db||!document.body.classList.contains("supabase-authenticated"))return;
  $("#cmsStatus").textContent="Laden…";
  const {data,error}=await db.from("admin_content").select("*").eq("kind",kind).order("sort_order").order("updated_at",{ascending:false});
  if(error){$("#cmsList").textContent=error.message;$("#cmsStatus").textContent="Controleer of de Admin SQL-migratie is uitgevoerd.";return}
  $("#cmsList").innerHTML="";
  (data||[]).forEach(item=>{const el=document.createElement("div");el.className="cms-item";const info=document.createElement("div");const title=document.createElement("strong");title.textContent=item.title;const meta=document.createElement("small");meta.textContent=(item.published?"Gepubliceerd":"Concept")+" · "+new Date(item.updated_at).toLocaleString("nl-NL");info.append(title,meta);if(item.kind==="news"&&item.is_pinned){const pin=document.createElement("small");pin.className="cms-pin";pin.textContent="📌 Vastgepind";info.append(pin)}const actions=document.createElement("div");const edit=document.createElement("button");edit.className="cms-btn";edit.textContent="Bewerk";edit.onclick=()=>{editing=item;$("#cmsTitle").value=item.title;$("#cmsBody").value=item.body;$("#cmsSource").value=item.source||"";$("#cmsAuthor").value=item.author||"";$("#cmsOrder").value=item.sort_order||0;$("#cmsPinned").checked=!!item.is_pinned;$("#cmsPinWrap").style.display=kind==="news"?"block":"none";$("#cmsPublished").checked=item.published;$("#cmsFormTitle").textContent="Bewerk "+kinds[k]};const del=document.createElement("button");del.className="cms-btn";del.textContent="Verwijder";del.onclick=async()=>{if(!confirm("Dit item verwijderen?"))return;const {error}=await db.from("admin_content").delete().eq("id",item.id);$("#cmsStatus").textContent=error?.message||"Verwijderd.";load()};actions.append(edit,del);el.append(info,actions);$("#cmsList").append(el)});
  $("#cmsStatus").textContent=(data||[]).length+" item(s) geladen.";
  loadPermissions();
 }
 async function save(e){e.preventDefault();const db=client(),user=(await db.auth.getUser()).data.user;if(!user)return;const payload={kind,title:$("#cmsTitle").value.trim(),body:$("#cmsBody").value,source:$("#cmsSource").value,author:$("#cmsAuthor").value,sort_order:Number($("#cmsOrder").value)||0,published:$("#cmsPublished").checked,is_pinned:kind==="news"&&$("#cmsPinned").checked,updated_by:user.id};let result;if(editing)result=await db.from("admin_content").update(payload).eq("id",editing.id);else result=await db.from("admin_content").insert({...payload,created_by:user.id});$("#cmsStatus").textContent=result.error?result.error.message:"Opgeslagen.";if(!result.error){reset();load()}}
 async function loadPermissions(){const db=client();const box=$("#cmsPermissions");if(!box)return;const {data,error}=await db.from("admin_permissions").select("*").order("updated_at",{ascending:false});if(error){box.textContent="Rechten niet beschikbaar: "+error.message;return}box.innerHTML="";(data||[]).forEach(row=>{const line=document.createElement("div");line.className="cms-perm";const id=document.createElement("code");id.textContent=row.user_id;line.append(id);const labels={faq:"FAQ",news:"Nieuws",jobs:"Vacatures",maintenance:"Onderhoud"};Object.entries(labels).forEach(([slug,label])=>{const wrap=document.createElement("label");wrap.textContent=label;const cb=document.createElement("input");cb.type="checkbox";cb.checked=row["can_view_"+slug];cb.title="Mag bekijken: "+label;cb.onchange=async()=>{const {data:userData}=await db.auth.getUser();const patch={["can_view_"+slug]:cb.checked,updated_by:userData.user.id,updated_at:new Date().toISOString()};const {error}=await db.from("admin_permissions").update(patch).eq("user_id",row.user_id);$("#cmsPermStatus").textContent=error?.message||"Recht bijgewerkt."};wrap.append(cb);line.append(wrap)});box.append(line)});if(!(data||[]).length)box.textContent="Nog geen rechtenprofielen. Voeg eerst een profiel toe via Supabase SQL; daarna kun je de kijkrechten hier aanpassen."}

 // Import/export: the starter package contains the existing portal welcome copy and FAQ.
 const starter=[
  {kind:"page",title:"Welkomsttekst voor bezoekers",body:"Je hebt een account nodig. Deze kun je gratis aanmaken om door te gaan naar het Ministerie van Dreuzels, oftewel onze community. Registreer hier een account.\n\nGebruik ons portaal om onder andere support aan te vragen.",source:"Bestaand portaal: introView",author:""},
  {kind:"page",title:"Welkomsttekst voor leden",body:"Gebruik ons portaal om onder andere support aan te vragen en je account te voorzien van een afdeling door onze Sorteerhoed op te zetten.\nWie weet zit je wel bij Griffoendor, Zwadderich, Huffelpuf of Ravenklauw!",source:"Bestaand portaal: introView",author:""},
  {kind:"news",title:"Einde van Dreuzels.com",body:"Lieve Dreuzelsvrienden,\n\nNa vele jaren komt er een einde aan Dreuzels.com.\n\nDe techniek achter de website is inmiddels verouderd. Om de website weer helemaal up-to-date te maken, zou alles opnieuw opgebouwd moeten worden. Dat bleek helaas niet haalbaar.\n\nDaarom is besloten om Dreuzels.com per 1 september 2020 offline te halen.\n\nDreuzels.com heeft twintig jaar bestaan. Daarmee kwam een bijzonder hoofdstuk uit de geschiedenis van Harry Potter-fansites ten einde.\n\nBedankt aan iedereen die in al die jaren deel heeft uitgemaakt van Dreuzels.com. ❤️",source:"Dreuzels.com · oorspronkelijk geplaatst op 9 juli 2020",author:"Webmaster",is_pinned:false},
  {kind:"faq",title:"1. Hoe maak ik een nieuw ticket aan?",body:"Klik op Ticket Support, kies de categorie die het beste bij je vraag past en vul het formulier volledig in. Klik daarna op Ticket versturen."},
  {kind:"faq",title:"2. Welke categorie moet ik kiezen?",body:"Kies het onderwerp dat het meest aansluit bij je vraag. Twijfel je? Kies dan Overige Support. Het supportteam kan je ticket indien nodig verder helpen."},
  {kind:"faq",title:"3. Waar kan ik mijn tickets terugvinden?",body:"Klik op Mijn tickets in de navigatie. Daar kun je je eigen tickets en de reacties van het supportteam bekijken. Je moet hiervoor ingelogd zijn."},
  {kind:"faq",title:"4. Hoe reageer ik op een ticket?",body:"Open je ticket via Mijn tickets, typ je reactie in het reactieveld en verstuur deze. Je reactie wordt aan het gesprek toegevoegd."},
  {kind:"faq",title:"5. Hoe lang duurt het voordat ik antwoord krijg?",body:"Dat verschilt per vraag en drukte bij het supportteam. Houd je ticket in de gaten voor een reactie. Maak niet meerdere tickets aan voor hetzelfde probleem."},
  {kind:"faq",title:"6. Kan ik een ticket sluiten?",body:"Je kunt via het ticket een verzoek indienen om het te sluiten. Het supportteam ontvangt hiervan een melding."},
  {kind:"faq",title:"7. Ik kan geen ticket aanmaken of mijn tickets niet zien. Wat nu?",body:"Controleer of je bent ingelogd met het juiste Hpmagicworld-account. Werkt het nog steeds niet, kies dan de categorie Forumfouten & Bugs of vraag een moderator om hulp."},
  {kind:"faq",title:"8. Waarvoor gebruik ik De Sorteerhoed?",body:"Gebruik De Sorteerhoed voor de sorteer- en afdelingsaanvraag. Deze opent in een apart tabblad."}
 ];
 function addTransferPanel(){
  if($("#cmsTransfer"))return;
  const panel=document.createElement("div");panel.className="cms-panel";panel.id="cmsTransfer";panel.style.marginTop="16px";
  panel.innerHTML='<h2>Portaal importeren en exporteren</h2><p>Startpakket met de bestaande welkomstteksten en FAQ. Exporteer je inhoud als JSON-back-up of importeer een eerder opgeslagen JSON-bestand.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0"><button class="cms-btn primary" type="button" id="cmsImportStarter">Bestaande portaalinhoud importeren</button><button class="cms-btn" type="button" id="cmsExportAll">Alles exporteren (JSON)</button><label class="cms-btn" for="cmsImportFile">JSON-bestand importeren<input id="cmsImportFile" type="file" accept=".json,application/json" style="display:none"></label></div><p class="cms-status" id="cmsTransferStatus" role="status">Importeren voegt items toe; bestaande inhoud wordt niet verwijderd.</p>';
  $("#adminCmsView")?.append(panel);
  $("#cmsImportStarter").onclick=()=>importItems(starter);
  $("#cmsExportAll").onclick=exportAll;
  $("#cmsImportFile").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const parsed=JSON.parse(await f.text());await importItems(Array.isArray(parsed)?parsed:parsed.items)}catch(err){$("#cmsTransferStatus").textContent="Import mislukt: "+err.message}e.target.value=""};
 }
 async function importItems(items){
  const db=client(),u=await db.auth.getUser(),user=u.data.user;
  if(!Array.isArray(items)||!items.length){$("#cmsTransferStatus").textContent="Geen geldige items gevonden.";return}
  const rows=items.filter(x=>kinds[x.kind]&&x.title).map(x=>({kind:x.kind,title:String(x.title).slice(0,180),body:String(x.body||""),source:String(x.source||""),author:String(x.author||""),published:false,is_pinned:!!x.is_pinned,sort_order:Number(x.sort_order)||0,created_by:user.id,updated_by:user.id}));
  if(!rows.length){$("#cmsTransferStatus").textContent="Geen herkenbare inhoud gevonden.";return}
  const {error}=await db.from("admin_content").insert(rows);
  $("#cmsTransferStatus").textContent=error?("Importfout: "+error.message):(rows.length+" items geïmporteerd als concept. Controleer ze en publiceer ze daarna afzonderlijk.");
  if(!error)load();
 }
 async function exportAll(){
  const db=client();const {data,error}=await db.from("admin_content").select("kind,title,body,source,author,published,is_pinned,sort_order").order("kind").order("sort_order");
  if(error){$("#cmsTransferStatus").textContent=error.message;return}
  const items=(data||[]).length?(data||[]):starter;
  const blob=new Blob([JSON.stringify({exported_at:new Date().toISOString(),items},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="hpmagicworld-portaal-export.json";a.click();URL.revokeObjectURL(url);
  $("#cmsTransferStatus").textContent=items.length+" items geëxporteerd.";
 }

 document.addEventListener("DOMContentLoaded",()=>{init();setTimeout(addTransferPanel,0)});if(document.readyState!=="loading"){init();setTimeout(addTransferPanel,0)};
 document.addEventListener("hpmw:supabase-role",()=>{if($("#adminCmsView"))load()});
})();