/* Admin CMS module — loaded by tool/index.html */
(()=> {
 const $=(s,r=document)=>r.querySelector(s);
 const client=()=>window.hpmwSupabase;
 const kinds={maintenance:"Onderhoud"};
 const perms=["view","edit","publish","delete"];
 const css=`
 #adminCmsView .cms-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0} #adminCmsView .cms-main-tabs{padding:8px;background:#0b1422;border:1px solid #26364c;border-radius:12px} #adminCmsView .cms-main-tabs button{flex:1;min-width:130px} #adminCmsView [data-main-panel][hidden]{display:none!important}
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
  const grid=$(".dash-grid");if(grid){const card=document.createElement("article");card.className="dash-card";card.hidden=true;card.innerHTML='<div class="dash-icon"><i class="fa-solid fa-screwdriver-wrench"></i></div><h2>Beheer</h2><p>Beheer portaalinhoud en toegangsrechten.</p><button class="btn primary" id="openAdminCms">Beheer openen</button>';grid.append(card);$("#openAdminCms").onclick=()=>{go("adminCmsView");load()};}
  /* CMS-onderdelen zijn uitsluitend bereikbaar via de aparte pagina Beheer. */
  const section=document.createElement("section");section.className="view";section.id="adminCmsView";
  section.innerHTML=`
   <div class="page-head translation-bluebar"><div class="translation-bluebar-copy"><div class="eyebrow">CENTRAAL BEHEER</div><h1>Beheer</h1><p class="subtitle">Beheer portaalinhoud en toegangsrechten.</p></div><div class="translation-bluebar-actions"><button class="btn" id="cmsBack">← Dashboard</button></div></div>
   <div class="cms-tabs cms-main-tabs" id="cmsMainTabs"><button type="button" class="active" data-main-tab="maintenance">Onderhoud</button><button type="button" data-main-tab="ticketRights">Ticketbeheerrechten</button><button type="button" data-main-tab="cmsRights">CMS-rechten</button></div><div data-main-panel="maintenance"><div class="cms-tabs" id="cmsTabs"></div><div class="cms-grid">
    <div class="cms-panel"><h2 id="cmsListTitle">Inhoud</h2><div id="cmsList"></div></div>
    <div class="cms-panel"><h2 id="cmsFormTitle">Nieuw item</h2><form id="cmsForm"><label>Titel<input id="cmsTitle" required maxlength="180"></label><label>Tekst / antwoord / omschrijving<textarea id="cmsBody" rows="7"></textarea></label><label>Bron (voor nieuws)<input id="cmsSource"></label><label>Auteur (voor nieuws)<input id="cmsAuthor"></label><label>Volgorde<input id="cmsOrder" type="number" value="0"></label><label id="cmsPinWrap"><input id="cmsPinned" type="checkbox" style="width:auto"> Vastpinnen bovenaan HP Nieuws</label><label><input id="cmsPublished" type="checkbox" style="width:auto"> Direct publiceren</label><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="cms-btn primary" type="submit">Opslaan</button><button class="cms-btn" type="button" id="cmsNew">Nieuw / wissen</button></div><p class="cms-status" id="cmsStatus" role="status"></p></form></div>
   </div></div><div data-main-panel="ticketRights" hidden><div class="cms-panel" id="ticketModeratorsPanel"><h2>Portaalrechten · Ticketbeheer</h2><p>Stel per Forumotion-gebruiker afzonderlijk in of die Ticketbeheer mag zien, tickets mag modereren of tickets mag verwijderen. Gebruik het Forumotion-gebruikersnummer.</p><div style="display:grid;grid-template-columns:minmax(120px,.5fr) minmax(160px,1fr) auto;gap:8px;align-items:end"><label>Forumotion gebruikersnummer<input id="ticketModId" type="number" min="1" step="1" placeholder="bijv. 3"></label><label>Naam / herkenning<input id="ticketModName" maxlength="80" placeholder="bijv. /u3"></label><button class="cms-btn primary" type="button" id="ticketModAdd">Gebruiker toevoegen</button></div><div id="ticketModList" style="margin-top:12px"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="cms-btn primary" type="button" id="saveTicketRights">Rechten opslaan</button><button class="cms-btn" type="button" id="syncPortal">Sync naar portaal</button></div><p class="cms-status" id="ticketModStatus" role="status"></p></div></div><div data-main-panel="cmsRights" hidden><div class="cms-panel"><h2>CMS-rechten</h2><p>Voeg een Supabase-gebruiker toe en vink per onderdeel de toegestane acties aan. Nieuwe profielen starten zonder rechten.</p><label>Supabase gebruikers-ID (UUID)<input id="permissionUserId" type="text" placeholder="00000000-0000-0000-0000-000000000000"></label><button class="cms-btn primary" type="button" id="permissionAdd">Gebruiker toevoegen</button><div id="cmsPermissions"></div><p class="cms-status" id="cmsPermStatus"></p></div></div>`;
  $("main.shell")?.append(section);
  $("#cmsBack").onclick=()=>go("newAdminDashboard");$("#cmsNew").onclick=reset;
  $("#ticketModAdd").onclick=addTicketModerator;$("#saveTicketRights").onclick=saveTicketModeratorRights;$("#syncPortal").onclick=syncTicketModerators;document.querySelectorAll("#cmsMainTabs [data-main-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll("#cmsMainTabs [data-main-tab]").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll("#adminCmsView [data-main-panel]").forEach(p=>p.hidden=p.dataset.mainPanel!==b.dataset.mainTab);});
  $("#permissionAdd").onclick=addPermissionProfile;
  $("#cmsForm").onsubmit=save;
  const tabs=$("#cmsTabs");Object.entries(kinds).forEach(([k,v])=>{const b=document.createElement("button");b.textContent=v;b.dataset.kind=k;b.onclick=()=>selectKind(k);tabs.append(b)});
  selectKind("maintenance");
 }
 let kind="maintenance",editing=null;
 function reset(){editing=null;$("#cmsForm").reset();$("#cmsOrder").value=0;$("#cmsPinned").checked=false;$("#cmsPinWrap").style.display=kind==="news"?"block":"none";$("#cmsFormTitle").textContent="Nieuw item";}
 function selectKind(k){kind=k;editing=null;document.querySelectorAll("#cmsTabs button").forEach(b=>b.classList.toggle("active",b.dataset.kind===k));$("#cmsListTitle").textContent=kinds[k];reset();load();}
 async function load(){
  const db=client();if(!db||!document.body.classList.contains("supabase-authenticated")||document.body.dataset.supabaseRole!=="admin"){if($("#cmsStatus"))$("#cmsStatus").textContent="Log in met een beheerderaccount om CMS-inhoud te beheren.";return;}
  $("#cmsStatus").textContent="Laden…";
  const {data,error}=await db.from("admin_content").select("*").eq("kind",kind).order("sort_order").order("updated_at",{ascending:false});
  if(error){$("#cmsList").textContent=error.message;$("#cmsStatus").textContent="Controleer of de Admin SQL-migratie is uitgevoerd.";return}
  $("#cmsList").innerHTML="";
  (data||[]).forEach(item=>{const el=document.createElement("div");el.className="cms-item";const info=document.createElement("div");const title=document.createElement("strong");title.textContent=item.title;const meta=document.createElement("small");meta.textContent=(item.published?"Gepubliceerd":"Concept")+" · "+new Date(item.updated_at).toLocaleString("nl-NL");info.append(title,meta);if(item.kind==="news"&&item.is_pinned){const pin=document.createElement("small");pin.className="cms-pin";pin.textContent="📌 Vastgepind";info.append(pin)}const actions=document.createElement("div");const edit=document.createElement("button");edit.className="cms-btn";edit.textContent="Bewerk";edit.onclick=()=>{editing=item;$("#cmsTitle").value=item.title;$("#cmsBody").value=item.body;$("#cmsSource").value=item.source||"";$("#cmsAuthor").value=item.author||"";$("#cmsOrder").value=item.sort_order||0;$("#cmsPinned").checked=!!item.is_pinned;$("#cmsPinWrap").style.display=kind==="news"?"block":"none";$("#cmsPublished").checked=item.published;$("#cmsFormTitle").textContent="Bewerk "+kinds[k]};const del=document.createElement("button");del.className="cms-btn";del.textContent="Verwijder";del.onclick=async()=>{if(!confirm("Dit item verwijderen?"))return;const {error}=await db.from("admin_content").delete().eq("id",item.id);$("#cmsStatus").textContent=error?.message||"Verwijderd.";load()};actions.append(edit,del);el.append(info,actions);$("#cmsList").append(el)});
  $("#cmsStatus").textContent=(data||[]).length+" item(s) geladen.";
  loadPermissions();loadTicketModerators();
 }
 async function save(e){e.preventDefault();const db=client(),user=(await db.auth.getUser()).data.user;if(!user)return;const payload={kind,title:$("#cmsTitle").value.trim(),body:$("#cmsBody").value,source:$("#cmsSource").value,author:$("#cmsAuthor").value,sort_order:Number($("#cmsOrder").value)||0,published:$("#cmsPublished").checked,is_pinned:kind==="news"&&$("#cmsPinned").checked,updated_by:user.id};let result;if(editing)result=await db.from("admin_content").update(payload).eq("id",editing.id);else result=await db.from("admin_content").insert({...payload,created_by:user.id});$("#cmsStatus").textContent=result.error?result.error.message:"Opgeslagen.";if(!result.error){reset();load()}}
 async function loadTicketModerators(){
  const db=client(),box=$("#ticketModList");if(!box)return;
  if(!db||!document.body.classList.contains("supabase-authenticated")||document.body.dataset.supabaseRole!=="admin"){box.textContent="Log in met een beheerderaccount om deze lijst te beheren.";return}
  const {data,error}=await db.from("ticket_moderators").select("*").order("forumotion_user_id");
  if(error){box.textContent="Ticketbeheerrechten niet beschikbaar: "+error.message+" (voer eerst de nieuwe SQL-migratie uit).";return}
  box.innerHTML="";
  (data||[]).forEach(row=>{
   const line=document.createElement("div");line.className="cms-item";
   const info=document.createElement("div"),title=document.createElement("strong"),meta=document.createElement("small");
   title.textContent=(row.display_name||"Forumotion gebruiker")+" · /u"+row.forumotion_user_id;meta.textContent="";info.append(title,meta);
   const actions=document.createElement("div");actions.style.cssText="display:flex;gap:7px;align-items:center;flex-wrap:wrap";
   const flags=[["Ticketbeheer zien","can_view_tickets"],["Tickets modereren","can_moderate_tickets"],["Tickets verwijderen","can_delete_tickets"]];flags.forEach(([label,key])=>{const wrap=document.createElement("label");wrap.style.cssText="display:inline-flex;gap:5px;align-items:center;margin:4px 10px 4px 0";const cb=document.createElement("input");cb.type="checkbox";cb.checked=!!row[key];cb.onchange=()=>{row[key]=cb.checked;row._dirty=true;$("#ticketModStatus").textContent="Niet-gesynchroniseerde wijzigingen.";};wrap.append(cb,document.createTextNode(label));actions.append(wrap)});
   const del=document.createElement("button");del.className="cms-btn";del.textContent="Verwijderen";del.onclick=async()=>{if(!confirm("Deze gebruiker uit Ticketbeheer verwijderen?"))return;const {error}=await db.from("ticket_moderators").delete().eq("forumotion_user_id",row.forumotion_user_id);$("#ticketModStatus").textContent=error?.message||"Gebruiker verwijderd.";loadTicketModerators()};
   actions.append(del);line.append(info,actions);box.append(line);
  });
  if(!(data||[]).length)box.textContent="Nog geen moderators ingesteld.";
 }
 async function collectTicketModeratorRights(){const lines=[...document.querySelectorAll("#ticketModList .cms-item")],payload=[];for(const line of lines){const title=line.querySelector("strong")?.textContent||"",id=Number(title.match(/\/u(\d+)/)?.[1]);if(!id)continue;const checks=[...line.querySelectorAll("label input[type=checkbox]")];payload.push({forumotion_user_id:id,display_name:title.split(" · ")[0],enabled:!!checks[0]?.checked,can_view_tickets:!!checks[0]?.checked,can_moderate_tickets:!!checks[1]?.checked,can_delete_tickets:!!checks[2]?.checked});}return payload;}
 async function saveTicketModeratorRights(){const db=client(),u=await db.auth.getUser();if(!u.data.user)return;const rows=await collectTicketModeratorRights();if(!rows.length){$("#ticketModStatus").textContent="Geen gebruikersrechten om op te slaan.";return}const payload=rows.map(x=>({...x,updated_by:u.data.user.id,updated_at:new Date().toISOString()}));const {error}=await db.from("ticket_moderators").upsert(payload,{onConflict:"forumotion_user_id"});$("#ticketModStatus").textContent=error?"Opslaan mislukt: "+error.message:"Ticketrechten opgeslagen. Gebruik daarna Sync naar portaal om de portaalrechten te vernieuwen.";if(!error)loadTicketModerators();}
 async function syncTicketModerators(){await saveTicketModeratorRights();if(!$("#ticketModStatus").textContent.startsWith("Ticketrechten opgeslagen."))return;$("#ticketModStatus").textContent="Ticketrechten opgeslagen en portaal gesynchroniseerd.";}
 async function addTicketModerator(){
  const id=Number($("#ticketModId").value),name=$("#ticketModName").value.trim(),db=client();
  if(!Number.isInteger(id)||id<1){$("#ticketModStatus").textContent="Vul een geldig Forumotion-gebruikersnummer in.";return}
  const u=await db.auth.getUser();if(!u.data.user){$("#ticketModStatus").textContent="Log opnieuw in.";return}
  const {error}=await db.from("ticket_moderators").upsert({forumotion_user_id:id,display_name:name||("Forumotion gebruiker #"+id),enabled:false,can_view_tickets:false,can_moderate_tickets:false,can_delete_tickets:false,updated_by:u.data.user.id,updated_at:new Date().toISOString()},{onConflict:"forumotion_user_id"});
  $("#ticketModStatus").textContent=error?.message||"Ticketbeheerrechten opgeslagen.";
  if(!error){$("#ticketModId").value="";$("#ticketModName").value="";loadTicketModerators()}
 }
 async function loadPermissions(){
 const db=client(),box=$("#cmsPermissions");if(!box)return;
 const {data,error}=await db.from("admin_permissions").select("*").order("updated_at",{ascending:false});
 if(error){box.textContent="Rechten niet beschikbaar: "+error.message;return}
 box.innerHTML="";
 (data||[]).forEach(row=>{
  const card=document.createElement("section");card.className="cms-user-rights";
  const head=document.createElement("div");head.className="cms-user-rights-head";
  const who=document.createElement("code");who.textContent=row.user_id;head.append(who);
  const del=document.createElement("button");del.className="cms-btn";del.textContent="Profiel verwijderen";del.onclick=async()=>{if(!confirm("CMS-rechten verwijderen?"))return;const {error}=await db.from("admin_permissions").delete().eq("user_id",row.user_id);$("#cmsPermStatus").textContent=error?.message||"Profiel verwijderd.";loadPermissions()};head.append(del);card.append(head);
  [["Onderhoud","maintenance"]].forEach(([name,slug])=>{
   const group=document.createElement("div");group.className="cms-right-group";const title=document.createElement("strong");title.textContent=name;group.append(title);
   [["Bekijken","view"],["Bewerken","edit"],["Publiceren","publish"],["Verwijderen","delete"]].forEach(([label,action])=>{
    if(slug!=="maintenance")return;const key="can_"+action+"_"+slug,wrap=document.createElement("label");wrap.className="cms-right-check";const cb=document.createElement("input");cb.type="checkbox";cb.checked=!!row[key];
    cb.onchange=async()=>{cb.disabled=true;const u=await db.auth.getUser();const {error}=await db.from("admin_permissions").update({[key]:cb.checked,updated_by:u.data.user.id,updated_at:new Date().toISOString()}).eq("user_id",row.user_id);$("#cmsPermStatus").textContent=error?.message||"Rechten opgeslagen.";cb.disabled=false};
    wrap.append(cb,document.createTextNode(label));group.append(wrap);
   });card.append(group);
  });box.append(card);
 });
 if(!(data||[]).length)box.textContent="Nog geen CMS-rechtenprofielen.";
}
async function addPermissionProfile(){
 const id=$("#permissionUserId").value.trim(),db=client();
 if(!/^[0-9a-f-]{36}$/i.test(id)){ $("#cmsPermStatus").textContent="Vul een geldige Supabase gebruikers-UUID in.";return; }
 const u=await db.auth.getUser();if(!u.data.user)return;
 const {error}=await db.from("admin_permissions").upsert({user_id:id,updated_by:u.data.user.id},{onConflict:"user_id"});
 $("#cmsPermStatus").textContent=error?.message||"Leeg profiel toegevoegd; alle rechten staan uit.";
 if(!error){$("#permissionUserId").value="";loadPermissions()}
}
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

 window.hpmwInitAdminCms=init;
 window.hpmwOpenAdminCms=()=>{if(!$("#adminCmsView"))init();go("adminCmsView");load();loadTicketModerators();};
 document.addEventListener("DOMContentLoaded",()=>{init();setTimeout(addTransferPanel,0)});if(document.readyState!=="loading"){init();setTimeout(addTransferPanel,0)};
 document.addEventListener("hpmw:supabase-role",e=>{const ok=e.detail?.role==="admin";document.querySelectorAll(".hpmw-nav-link").forEach(n=>n.hidden=!ok);if($("#adminCmsView")&&ok){load();loadTicketModerators()}});
})();