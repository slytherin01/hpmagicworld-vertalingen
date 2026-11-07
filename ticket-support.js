/* Ticket Support main application script extracted from the original Forumotion page. */
(function(){"use strict";const BASE=location.origin;const CATS=[{key:"forumfouten",name:"Forumfouten & Bugs",id:36,closed:48,openUrl:BASE+"/f36-forumfouten-bugs-support",closedUrl:BASE+"/f48-gesloten-tickets",icon:"bug",desc:"Fouten, bugs en technische problemen."},{key:"account",name:"Account",id:14,closed:50,openUrl:BASE+"/f14-account-support",closedUrl:BASE+"/f50-gesloten-tickets",icon:"user",desc:"Account-, profiel- en inlogproblemen."},{key:"autorisaties",name:"Autorisaties",id:11,closed:52,openUrl:BASE+"/f11-autorisaties-support",closedUrl:BASE+"/f52-gesloten-tickets",icon:"key",desc:"Rechten, toegang en autorisaties."},{key:"leerlingenkamer",name:"Leerlingenkamer",id:13,closed:54,openUrl:BASE+"/f13-leerlingenkamer-support",closedUrl:BASE+"/f54-gesloten-tickets",icon:"hat",desc:"Problemen rond de leerlingenkamers."},{key:"forumwinkel",name:"Forumwinkel & Galjoenen",id:17,closed:56,openUrl:BASE+"/f17-forumwinkel-galjoenen-support",closedUrl:BASE+"/f56-gesloten-tickets",icon:"coins",desc:"Forumwinkel, galjoenen en aankopen."},{key:"donatiesysteem",name:"Donatiesysteem",id:15,closed:58,openUrl:BASE+"/f15-donatiesysteem-support",closedUrl:BASE+"/f58-gesloten-tickets",icon:"heart",desc:"Donaties en het donatiesysteem."},{key:"klachten",name:"Klachten",id:18,closed:62,openUrl:BASE+"/f18-klachten-support",closedUrl:BASE+"/f62-gesloten-tickets",icon:"chat",desc:"Klachten en situaties die besproken moeten worden."},{key:"roepmodje",name:"Roep een modje",id:16,closed:60,openUrl:BASE+"/f16-roep-een-modje-support",closedUrl:BASE+"/f60-gesloten-tickets",icon:"bell",desc:"Vraag hulp van een moderator."},{key:"overige",name:"Overige Support",id:37,closed:64,openUrl:BASE+"/f37-overige-support",closedUrl:BASE+"/f64-gesloten-tickets",icon:"question",desc:"Alles wat niet in een andere categorie past."},{key:"sorteerhoed",name:"Sorteerhoed",id:27,closed:64,openUrl:BASE+"/f27-sorteerhoed",externalUrl:"https://testforumjoost.forumactie.com/h13-dev-sorting-hat",closedUrl:BASE+"/f64-gesloten-tickets",icon:"hat",desc:"Sorteerhoed- en afdelingsaanvragen."}];const INTERNAL_KEY="hm_ticket_internal_v2";const MEMBER_KEY="hm_ticket_seen_v1";const MODS=[{id:1,name:"Joost",username:"Joost"},{id:3,name:"Test Account 2",username:"Test Account 2"}];function internalData(){try{return JSON.parse(localStorage.getItem(INTERNAL_KEY)||"{}")}catch(e){return {}}}function saveInternal(t,patch){const d=internalData();d[t.id]=Object.assign(d[t.id]||{status:"pending",assignee:""},patch);localStorage.setItem(INTERNAL_KEY,JSON.stringify(d))}function getInternal(t){return internalData()[t.id]||{status:"pending",assignee:"",createdAt:t.createdAt||0,readAt:0}}function statusLabel(s){return {pending:"Wachten op antwoord",progress:"Inbehandeling",done:"Gesloten",refused:"Afgewezen"}[s]||"Wachten op antwoord"}function ticketAuthor(t){return t.userId||getInternal(t).userId||0}function markRead(t){saveInternal(t,{readAt:Date.now()})}let memberTab="open",memberSelected=null;function loadMyTickets(){const l=$("#myTicketsList");l.innerHTML='<div class="member-loading"><div class="member-loading-head">Eigen tickets worden direct ingelezen...</div></div>';all=[];renderMyTickets();updateMyCount();const me=+user.id||0,nm=(user.name||"").trim().toLowerCase(),seen=new Set(),add=async a=>{for(const t of a){const k=t.id+'|'+t.closed;if(seen.has(k))continue;seen.add(k);try{const i=await loadTopicAuthor(t);if(i.userId===me||(i.author||"").trim().toLowerCase()===nm){t.user=i.author||user.name;t.userId=i.userId||me;all.push(t);renderMyTickets();updateMyCount()}}catch(e){}}};CATS.forEach(c=>{readForum(c,false).then(add).catch(()=>{});readForum(c,true).then(add).catch(()=>{})})}function renderMyTickets(){const mine=all.filter(t=>memberTab==="open"?!t.closed&&["pending","progress"].includes(getInternal(t).status):t.closed),n=mine.length;document.querySelectorAll(".member-tab").forEach(b=>b.innerHTML=(b.dataset.memberTab==="open"?"Open":"Gesloten")+` <b class="tab-count">${mine.filter(t=>b.dataset.memberTab==="open"?!t.closed:t.closed).length}</b>`);$("#myTicketsList").innerHTML=n?`<div class="member-table-wrap"><table class="member-table"><thead><tr><th>ID</th><th>Onderwerp</th><th>Categorie</th><th>Afdeling</th><th>Status</th></tr></thead><tbody>${mine.map(t=>{const st=getInternal(t).status;return `<tr class="member-row" data-my="${esc(t.id)}"><td class="member-id">#${esc(t.num)}</td><td class="member-subject">${esc(t.title)}</td><td>${esc(t.cat||"—")}</td><td>${esc(getInternal(t).department||"Ongesorteerd")}</td><td><span class="member-status ${st}">${esc(statusLabel(st))}</span></td></tr>`}).join("")}</tbody></table></div>`:`<div class="empty">Geen eigen ${memberTab==="open"?"open":"gesloten"} tickets gevonden.</div>`}function showMyTickets(){if(!user.logged||!Number(user.id)){location.href="/login";return}show("myTicketsView");$("#memberDetail").classList.remove("active");$("#myTicketsList").style.display="block";loadMyTickets()}function updateMyCount(){const badge=$("#myTicketsCount");if(!badge)return;const me=+user.id||0;const count=all.filter(t=>+t.userId===me&&!t.closed&&["pending","progress"].includes(getInternal(t).status)).length;badge.textContent=count>99?"99+":String(count);badge.style.setProperty("display",count>0?"inline-grid":"none","important");badge.setAttribute("aria-label",count+" open eigen tickets")}async function openMemberTicket(t){memberSelected=t;$("#myTicketsList").style.display="none";$("#memberDetail").classList.add("active");$("#memberDetailTitle").textContent="#"+t.num+" — "+t.title;$("#memberFactId").textContent="#"+t.num;$("#memberFactSubject").textContent=t.title;$("#memberFactCategory").textContent=t.cat;$("#memberFactAuthor").textContent=t.user||user.name||"—";$("#memberDetailMeta").textContent=t.cat+" • "+(t.closed?"Gesloten":"Open");$("#memberReply").value="";$("#memberEditStatus").textContent="";$("#memberReplyStatus").textContent="";try{const posts=await loadTopicPosts(t);if(posts[0]){$("#memberFactAuthor").textContent=posts[0].author||t.user||user.name||"—";$("#memberFactDateTime").textContent=posts[0].time||""}$("#memberPosts").innerHTML=chatHtml(posts,t,"my-chat");const meta=getInternal(t),age=Date.now()-(meta.createdAt||0),editable=age<=300000&&!meta.readAt&&!t.closed;$("#memberEditBox").style.display=editable?"block":"none";$("#memberCloseRequest").style.display=t.closed?"none":"block";$("#memberEditNote").textContent=editable?"Je kunt je eerste bericht tot 5 minuten na aanmaken bewerken, zolang een supportmoderator het ticket nog niet heeft gelezen.":"Bewerken is niet meer beschikbaar.";if(editable)$("#memberEditMessage").value=posts[0]?.text||""}catch(e){$("#memberPosts").innerHTML="<div class='empty'>Ticketreacties konden niet worden geladen.</div>"}}const ADMINS=[1,3];let user={id:0,name:"",logged:false}, all=[], currentTab="open", selected=null, activeCat=null;const $=s=>document.querySelector(s);const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&","<":"<",">":">",'"':"&quot;","'":"&#39;"}[c]));function show(id){document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));$("#"+id).classList.add("active");const b=$("#ticketSupportLaunch");if(b)b.setAttribute("aria-expanded",String(id==="homeView"));scrollTo({top:0,behavior:"smooth"});}document.addEventListener("DOMContentLoaded",()=>{const b=$("#ticketSupportLaunch");if(b)b.addEventListener("click",()=>{show("homeView");b.setAttribute("aria-expanded","true");});});function isAdmin(){return user.logged&&ADMINS.includes(Number(user.id));}function notify(msg,type="error"){const n=$("#formNotice");n.textContent=msg;n.className="notice show "+type}const TICKET_FORUM_ROUTES={forumfouten:36,account:14,autorisaties:11,leerlingenkamer:13,forumwinkel:17,donatiesysteem:15,roepmodje:16,klachten:18,overige:37,sorteerhoed:27};const FORUM_MESSAGE_LIMIT=60000;const FORUM_MESSAGE_SAFETY_MARGIN=36;function ticketPrefixLength(){const category=activeCat?activeCat.name:"";const username=user.logged?user.name:"Gast";return (`[b]Ticket #000000[/b][b]Categorie:[/b] ${category}[b]Gebruiker:[/b] ${username}`).length}function updateTicketMessageCounter(){const field=$("#formMessage"),counter=$("#formMessageCounter");if(!field||!counter)return;const available=Math.max(0,FORUM_MESSAGE_LIMIT-ticketPrefixLength()-FORUM_MESSAGE_SAFETY_MARGIN);field.maxLength=available;if(field.value.length>available)field.value=field.value.slice(0,available);const remaining=Math.max(0,available-field.value.length);counter.textContent=`${remaining.toLocaleString("nl-NL")} resterende tekens`;counter.classList.toggle("near-limit",remaining<=500&&remaining>0);counter.classList.toggle("at-limit",remaining<=0)}const ICONS={
bug:`<i class="fa-solid fa-bug"></i>`,
user:`<i class="fa-solid fa-user"></i>`,
key:`<i class="fa-solid fa-key"></i>`,
hat:`<i class="fa-solid fa-graduation-cap"></i>`,
coins:`<i class="fa-solid fa-coins"></i>`,
heart:`<i class="fa-solid fa-heart"></i>`,
bell:`<i class="fa-solid fa-bell"></i>`,
chat:`<i class="fa-solid fa-comment-dots"></i>`,
question:`<i class="fa-solid fa-circle-question"></i>`
};function iconSvg(name){return ICONS[name]||ICONS.question;}function renderCats(){ $("#categories").innerHTML=CATS.map(c=>`<button class="cat" data-cat="${c.key}"><span class="round-icon">${iconSvg(c.icon)}</span><span><strong>${c.name}</strong><span>${c.desc}</span></span></button>`).join("");}function cat(k){return CATS.find(x=>x.key===k)}function readForumotionUserFromHtml(html){
const doc=new DOMParser().parseFromString(html,"text/html");
const readKey=(key)=>{
const patterns=[
new RegExp("_userdata\\s*(?:\\[\\s*['\"]"+key+"['\"]\\s*\\]|\\.\\s*"+key+")\\s*=\\s*['\"]?([^;'\"\\s]+)['\"]?","i"),
new RegExp("['\"]"+key+"['\"]\\s*:\\s*['\"]?([^,;'\"}\\s]+)","i")
];
for(const re of patterns){const m=html.match(re);if(m)return m[1];}
return "";
};
let id=Number(readKey("user_id"))||0;
let name=readKey("username");
const logged=Number(readKey("session_logged_in"))>0 || !!doc.querySelector('a[href*="logout"],a[href*="mode=logout"]');
if(!id){
const selectors=['#fa_welcome a[href^="/u"]','#fa_right a[href^="/u"]','.welcome a[href^="/u"]','#username a[href^="/u"]','#fa_welcome a[href*="/u"]'];
let link=null;for(const sel of selectors){link=doc.querySelector(sel);if(link)break;}
if(!link&&logged){link=[...doc.querySelectorAll('a[href^="/u"]')].find(a=>{const txt=(a.textContent||"").trim();return txt&&!/profiel|profile|ledenlijst|members/i.test(txt)&&/^\/u\d+/i.test(a.getAttribute("href")||"")})||null;}
const m=(link?.getAttribute("href")||"").match(/^\/u(\d+)/i);if(m)id=Number(m[1]);
if(!name&&link)name=(link.textContent||"").trim();
}
return id&&logged?{id,name:name||"Gebruiker",logged:true}:null;
}
async function resolveUser(){
try{
if(window._userdata&&Number(window._userdata.session_logged_in)>0){
const uid=Number(window._userdata.user_id)||0;user={id:uid,name:uid===3?"Test Account 2":String(window._userdata.username||"Gebruiker"),avatar:String(window._userdata.user_avatar||window._userdata.avatar||""),logged:true};paintUser();return;
}
for(const path of ["/","/forum"]){
try{
const response=await fetch(BASE+path,{credentials:"include",cache:"no-store"});
if(!response.ok)continue;
const html=await response.text(),found=readForumotionUserFromHtml(html);
if(found){
let avatar="";
try{const profile=await fetch(BASE+"/u"+found.id,{credentials:"include",cache:"no-store"});const profileHtml=await profile.text();const pd=new DOMParser().parseFromString(profileHtml,"text/html");const img=pd.querySelector(".avatar img,.profile-avatar img,.postprofile img,img[src*=avatar],meta[property=og:image]");avatar=img?.content||img?.src||"";}catch(e){}
user={...found,name:Number(found.id)===3?"Test Account 2":found.name,avatar};paintUser();return;
}
}catch(e){}
}
user={id:0,name:"",logged:false};paintUser();
}catch(e){user={id:0,name:"",logged:false};paintUser();}
}
let forumotionLoginLoaded=false;
function loadForumotionNativeLogin(){
 const host=document.getElementById("forumotionNativeLogin");
 if(!host||host.dataset.ready)return;
 host.dataset.ready="1";
 host.innerHTML=`<form action="/login" method="post" autocomplete="on">
 <div><label for="fm-login-user">Gebruikersnaam</label><input id="fm-login-user" type="text" name="username" autocomplete="username" required></div>
 <div><label for="fm-login-pass">Wachtwoord</label><input id="fm-login-pass" type="password" name="password" autocomplete="current-password" required></div>
 <label class="forumotion-remember"><input type="checkbox" name="autologin" value="1"> Automatisch inloggen</label>
 <input type="hidden" name="redirect" value="/forum">
 <div class="hpmw-login-actions"><button type="submit" name="login" value="Inloggen">Inloggen</button><a href="/register">Registreren</a></div>
 </form>`;
}
function paintUser(){
document.documentElement.classList.add("hpmw-user-ready");
const nameEl=$("#username"),account=$("#accountLink"),avatarSlot=account?.querySelector(".lux-nav-icon"),guestLogin=$("#forumotionGuestLogin");
document.documentElement.classList.toggle("member-login-ready",!!user.logged);document.documentElement.classList.toggle("guest-login-ready",!user.logged);if(guestLogin){guestLogin.style.display=user.logged?"none":"block";if(!user.logged)loadForumotionNativeLogin();}
if(nameEl)nameEl.textContent=user.logged?user.name:"Gast";
if(account)account.href=user.logged?"/u"+user.id:"/login";
if(avatarSlot){
if(user.avatar)avatarSlot.innerHTML='<img src="'+esc(user.avatar)+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">';
else avatarSlot.innerHTML='<i class="fa-solid fa-user"></i>';
}
const adminButton=$("#adminLaunch"),myButton=$("#myTicketsLaunch");
if(adminButton){if(user.logged&&isAdmin())adminButton.style.setProperty("display","inline-flex","important");else adminButton.style.setProperty("display","none","important");}
if(myButton){if(user.logged&&Number(user.id)>0)myButton.style.setProperty("display","inline-flex","important");else myButton.style.setProperty("display","none","important");}
const loginButton=$("#loginLaunch"),registerButton=$("#registerLaunch");
[loginButton,registerButton].forEach(btn=>{if(btn)btn.style.setProperty("display",user.logged&&Number(user.id)>0?"none":"inline-flex","important");});
}function openForm(k){activeCat=cat(k); if(!activeCat)return;$("#formTitle").textContent=activeCat.name;$("#formSubtitle").textContent=activeCat.desc;$("#formCategory").value=activeCat.name;$("#formUser").value=user.logged?user.name:"Gast";$("#formSubject").value="";$("#formMessage").value="";$("#formDepartment").value="";$("#formNotice").className="notice";updateTicketMessageCounter();show("formView");}async function postTicket(){if(!user.logged){notify("Je moet ingelogd zijn om een ticket te openen.");return}const sub=$("#formSubject").value.trim(),msg=$("#formMessage").value.trim(),department=$("#formDepartment").value,btn=$("#formSubmit");if(!department){notify("Kies eerst een afdeling.");return}if(!sub||!msg){notify("Vul onderwerp en beschrijving in.");return}btn.disabled=true;notify("Ticket wordt geplaatst...","ok");try{const no=String(Date.now()).slice(-6);const destinationForum=TICKET_FORUM_ROUTES[activeCat.key];if(!destinationForum||Number(destinationForum)!==Number(activeCat.id))throw Error("De gekozen supportcategorie heeft geen geldige Forumotion-bestemming.");const r=await fetch("/post?f="+destinationForum+"&mode=newtopic",{credentials:"include",cache:"no-store"});if(!r.ok)throw Error("Het Forumotion-formulier kon niet worden geladen.");const doc=new DOMParser().parseFromString(await r.text(),"text/html");const form=[...doc.forms].find(f=>f.querySelector('input[name="subject"],input[name="topic_name"]')&&f.querySelector('textarea[name="message"],textarea#text_editor_textarea'));if(!form)throw Error("Forumotion heeft het formulier voor een nieuw topic niet beschikbaar gemaakt.");const sf=form.querySelector('input[name="subject"],input[name="topic_name"]');const mf=form.querySelector('textarea[name="message"],textarea#text_editor_textarea');const fd=new FormData(form);fd.set(sf.name,`[Ticket #${no}] ${sub}`);fd.set(mf.name,`[b]Ticket #${no}[/b][b]Categorie:[/b] ${activeCat.name}[b]Gebruiker:[/b] ${user.name}${msg}`);if(form.querySelector('[name="post"]')) fd.set("post",form.querySelector('[name="post"]').value||"Verstuur");const action=new URL(form.getAttribute("action")||"/post",location.origin).href;const out=await fetch(action,{method:"POST",body:fd,credentials:"include",cache:"no-store",redirect:"follow"});if(!out.ok)throw Error("Forumotion kon het ticket niet plaatsen (HTTP "+out.status+").");const responseUrl=out.url||"";const topicMatch=responseUrl.match(/\/t(\d+)/i);if(topicMatch){all.unshift({id:topicMatch[1],num:no,title:sub,cat:activeCat.name,catKey:activeCat.key,forumId:destinationForum,openForumId:destinationForum,closedForumId:activeCat.closed,closed:false,url:responseUrl,user:user.name,userId:user.id,department,createdAt:Date.now(),meta:""}); saveInternal({id:topicMatch[1]}, {status:"pending",assignee:"",createdAt:Date.now(),department});}$("#formSubject").value="";$("#formMessage").value="";$("#formDepartment").value="";btn.disabled=false;notify("Ticket aangemaakt. Je blijft op Ticket Support.","ok");setTimeout(()=>show("homeView"),900);}catch(e){btn.disabled=false;notify(e.message||"Ticket plaatsen mislukt.")}}function fetchText(url,timeout=1800){const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeout),target=new URL(url,BASE);if(target.origin!==BASE){if(!/^\/(?:t\d+|f\d+)(?:[-/?#]|$)/i.test(target.pathname))throw Error("Externe forumlink geblokkeerd.");target.protocol=location.protocol;target.host=location.host;}return fetch(target.href,{credentials:"include",cache:"no-store",signal:ctl.signal,headers:{"Accept":"text/html,application/rss+xml,application/atom+xml,*/*"}}).then(r=>{if(!r.ok)throw Error("Forumotion antwoordde met HTTP "+r.status+".");return r.text()}).catch(e=>{if(e.name==="AbortError")throw Error("Forumotion reageert niet op tijd. Probeer het opnieuw.");if(e instanceof TypeError)throw Error("Verbinding met Forumotion mislukt (Failed to fetch). Controleer of je bent ingelogd en of deze pagina op hetzelfde forumdomein staat.");throw e}).finally(()=>clearTimeout(timer));}async function readForum(catObj,closed){const fid=closed?catObj.closed:catObj.id;const page=closed?catObj.closedUrl:catObj.openUrl;const found=[],seen=new Set();const html=await fetchText(page,1800);const doc=new DOMParser().parseFromString(html,"text/html");const add=(id,title,url,meta)=>{if(!id||seen.has(id))return; seen.add(id);const tm=String(title||"").match(/\[\s*ticket\s*#?\s*([0-9]+)\s*\]/i);const num=tm?tm[1]:id;const clean=String(title||"Topic #"+id).replace(/^\s*\[\s*ticket\s*#?\s*[0-9]+\s*\]\s*/i,"").trim();found.push({id:String(id),num,title:clean||"Topic #"+id,cat:catObj.name,catKey:catObj.key,forumId:fid,openForumId:catObj.id,closedForumId:catObj.closed,closed:!!closed,url:new URL(url,page).href,user:"",meta:meta||""});};doc.querySelectorAll("a[href*='/t']").forEach(a=>{const href=a.getAttribute("href")||"", m=href.match(/\/t(\d+)(?:-|$)/i); if(!m)return;const text=(a.textContent||"").replace(/\s+/g," ").trim(); if(!text)return;const row=a.closest("tr,li,.topic-row,.row,.forumline")?.textContent||text;add(m[1],text,href,row.replace(/\s+/g," ").trim());});return found;}function updateAdminTicketCount(){const badge=$("#adminTicketsCount");if(!badge)return;const count=all.filter(t=>!t.closed).length;badge.textContent=count>99?"99+":String(count);badge.style.setProperty("display",count>0?"inline-grid":"none","important");badge.setAttribute("aria-label",count+" open tickets");}
async function loadTickets(){const list=$("#ticketList"); all=[];updateAdminTicketCount();list.innerHTML='<div class="ticket-table-wrap"><table class="ticket-table"><thead><tr><th>Ticket ID</th><th>Onderwerp</th><th>Categorie</th><th>Status</th><th>Laatste poster</th><th>Toegewezen aan</th></tr></thead><tbody id="ticketRows"><tr><td colspan="6" class="loading-cell">Tickets worden direct ingelezen...</td></tr></tbody></table></div>';const seen=new Set();const addTickets=items=>{items.forEach(t=>{const k=t.id+"|"+t.closed;if(!seen.has(k)){seen.add(k);all.push(t)}});renderList()}
CATS.forEach(async c=>{try{addTickets(await readForum(c,false))}catch(e){}});
CATS.forEach(async c=>{try{addTickets(await readForum(c,true))}catch(e){}});}const latestPosterCache=new Map(),latestPosterQueue=[];let latestPosterActive=0;function queueLatestPoster(t){if(latestPosterCache.has(t.id)||latestPosterQueue.some(x=>x.id===t.id)||t._posterQueued)return;t._posterQueued=true;latestPosterQueue.push(t);runLatestPosterQueue()}function runLatestPosterQueue(){while(latestPosterActive<2&&latestPosterQueue.length){const t=latestPosterQueue.shift();latestPosterActive++;loadTopicPosts(t).then(posts=>{const latest=posts.length?posts[posts.length-1]:null;latestPosterCache.set(t.id,latest?{author:latest.author||"Onbekend",userId:latest.userId||0}:{author:"Geen reacties",userId:0})}).catch(()=>latestPosterCache.set(t.id,{author:"Niet beschikbaar",userId:0})).finally(()=>{latestPosterActive--;t._posterQueued=false;if(document.querySelector("#adminView.active")&&document.querySelector("#adminListView").style.display!=="none")renderList();runLatestPosterQueue()})}}function assignedModerator(t){const id=String(getInternal(t).assignee||"");if(!id)return "Niet toegewezen";const mod=MODS.find(m=>String(m.id)===id);return mod?mod.name:"Onbekend"}function renderList(){updateAdminTicketCount();const q=$("#ticketSearch").value.trim().toLowerCase();let list=currentTab==="open"?all.filter(t=>!t.closed):all.filter(t=>t.closed);const sf=$("#statusFilter")?.value||"all";if(sf!=="all")list=list.filter(t=>getInternal(t).status===sf);if(q)list=list.filter(t=>(t.num+" "+t.id+" "+t.title+" "+t.user+" "+t.cat).toLowerCase().includes(q));$("#statOpen").textContent=all.filter(x=>!x.closed).length;$("#statClosed").textContent=all.filter(x=>x.closed).length;$("#statTotal").textContent=all.length;$("#statResult").textContent=list.length;const counts={pending:0,progress:0,done:0,refused:0};all.forEach(x=>{const st=getInternal(x).status;counts[st]=(counts[st]||0)+1});["pending","progress","done","refused"].forEach(st=>{const el=$("#count"+st.charAt(0).toUpperCase()+st.slice(1));if(el)el.textContent=counts[st]||0});list.forEach(queueLatestPoster);$("#ticketList").innerHTML=list.length?`<div class="ticket-table-wrap"><table class="ticket-table"><thead><tr><th>Ticket ID</th><th>Onderwerp</th><th>Categorie</th><th>Status</th><th>Laatste poster</th><th>Toegewezen aan</th></tr></thead><tbody>${list.map(t=>{const poster=latestPosterCache.get(t.id);return `<tr data-ticket="${esc(t.id)}"><td class="ticket-id">#${esc(t.num)}</td><td class="ticket-subject">${esc(t.title)}</td><td class="ticket-category">${esc(t.cat)}</td><td><span class="ticket-state ${t.closed?"done":getInternal(t).status}">${t.closed?"Gesloten":statusLabel(getInternal(t).status)}</span></td><td class="ticket-last-poster"><i class="fa-solid fa-user-clock"></i> ${esc(poster?.author||"Laden...")}</td><td class="ticket-assignee"><i class="fa-solid fa-user-check"></i> ${esc(assignedModerator(t))}</td></tr>`}).join("")}</tbody></table></div>`:`<div class="empty"><span class="svg-icon"><i class="fa-solid fa-inbox hm-fa"></i></span><div>Geen tickets gevonden</div><small>Pas je zoekterm aan of vernieuw.</small></div>`;}function chatHtml(posts,t,extra){const me=+user.id||0,aid=+t.userId||0;return '<div class="chat-title">Helpdesk gesprek</div><div class="chat-thread '+(extra||'')+'">'+(posts.length?posts.slice().reverse().map(p=>{const n=p.author||"Gebruiker",mine=(p.userId&&+p.userId===me)||(!p.userId&&n===user.name),author=(aid&&+p.userId===aid)||n===t.user,role=author?"Ticket auteur":(ADMINS.includes(+p.userId)?"Support moderator":"Support"),av=p.avatar||(n===user.name?user.avatar:"");return '<div class="chat-msg '+(mine?'mine':'')+'"><div class="chat-avatar">'+(av?'<img src="'+esc(av)+'">':esc(n.slice(0,1).toUpperCase()))+'</div><div><div class="chat-meta">'+esc(n)+' <span class="chat-role">'+role+'</span></div><div class="chat-bubble">'+esc(p.text)+'</div>'+(p.time?'<span class="chat-time">'+esc(p.time)+'</span>':'')+'</div></div>'}).join(''):'<div class="chat-empty">Nog geen reacties in dit ticket.</div>')+'</div>'}async function loadTopicPosts(t){
const firstUrl=new URL(t.url,BASE).href;
const topicId=(new URL(firstUrl).pathname.match(/^\/t(\d+)/i)||[])[1];
if(!topicId) throw new Error("Ongeldige Forumotion-topiclink.");
const queue=[firstUrl],visited=new Set(),posts=[],seen=new Set();
const maxPages=40;
const textOf=(el)=>{if(!el)return "";const c=el.cloneNode(true);
c.querySelectorAll("script,style,form,button,.postprofile,.profile,.post-author,.author-info,.signature,.edit-info,.post-options,.post-buttons,.profile-icons,.ip,.post-footer,.post-actions,.topic-actions,.pagination,.like-button,.reaction-buttons,.moderation,.moderator-tools,.post-meta,.post-date,.post-time,.author-date,time,[class*='moder']").forEach(x=>x.remove());
return (c.innerText||c.textContent||"").replace(/\u00a0/g," ").replace(/\r/g,"").replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
};
const parse=(doc)=>{
let roots=[...doc.querySelectorAll(".post, article.post, .post-wrap, .topic-post, .post-entry")];
if(!roots.length) roots=[...doc.querySelectorAll(".postbody")].map(x=>x.closest("tr,article,li")||x);
if(!roots.length) roots=[...doc.querySelectorAll("article,li,tr")].filter(x=>x.querySelector(".postbody,.message-content,.post-content,.content"));
const unique=[...new Set(roots)];
for(const root of unique){
const profile=root.querySelector(".postprofile,.poster-profile,.profile");
const authorLink=[...(profile||root).querySelectorAll("a[href]")].find(a=>/\/u\d+(?:-|$)/i.test(a.getAttribute("href")||""));
const userId=Number(((authorLink?.getAttribute("href")||"").match(/\/u(\d+)/i)||[])[1]||0);
const author=(authorLink?.textContent||root.querySelector(".username,.author,.post-author,.name")?.textContent||t.user||"Gebruiker").replace(/\s+/g," ").trim();
const selectors=[".post-body .content",".post-body .message-content",".post-body .post-content",".post-body .message",".post-body",".postbody .content",".postbody .message-content",".postbody .post-content",".postbody .message",".postbody",".message-content",".entry-content",".content",".post-content"];
let body=null;
for(const sel of selectors){const el=root.querySelector(sel);if(el&&textOf(el)){body=el;break;}}
if(!body && root.matches(".postbody,.message-content,.post-content,.entry-content"))body=root;
let message=textOf(body);
if(!message)continue;
message=message.replace(/(?:Bewerken|Verwijderen|IP-adres|Vind ik leuk|Bedankt)\s*$/i,"").trim();
const dateNode=root.querySelector(".post-date,.post-time,.author-date,time,[class*='post-date'],[class*='date']");
const time=(dateNode?.getAttribute("datetime")||dateNode?.textContent||"").replace(/\s+/g," ").trim();
const avatar=profile?.querySelector("img")||root.querySelector("img.avatar");
const avatarUrl=avatar?.getAttribute("src")||avatar?.getAttribute("data-src")||"";
const postId=(root.id||"").match(/(?:p|post)(\d+)/i)?.[1]||root.getAttribute("data-post-id")||"";
const key=(postId||userId+"|"+author+"|"+message.slice(0,300));
if(seen.has(key))continue;seen.add(key);
posts.push({author,userId,avatar:avatarUrl?new URL(avatarUrl,firstUrl).href:"",text:message,time,postId});
}
};
while(queue.length&&visited.size<maxPages){
const url=queue.shift();if(visited.has(url))continue;visited.add(url);
const raw=await fetchText(url,10000),doc=new DOMParser().parseFromString(raw,"text/html");
parse(doc);
for(const a of doc.querySelectorAll("a[href]")){
let u;try{u=new URL(a.getAttribute("href"),url)}catch(e){continue;}
const id=(u.pathname.match(/^\/t(\d+)(?:p\d+)?(?:-|$)/i)||[])[1];
if(u.origin!==new URL(BASE).origin||id!==topicId)continue;
const isPage=/^\/t\d+p\d+/i.test(u.pathname)||u.searchParams.has("start")||u.searchParams.has("p");
if(!isPage)continue;
u.hash="";
if(!visited.has(u.href)&&!queue.includes(u.href))queue.push(u.href);
}
}
if(!posts.length)throw new Error("Forumotion heeft geen herkenbare berichten op deze topicpagina teruggestuurd. Controleer de toegangsrechten en de berichtopmaak.");
return posts;
}let adminDetailLoadToken=0;
async function detail(t){
selected=t;
const token=++adminDetailLoadToken;
markRead(t);
$("#adminListView").style.display="none";
$("#adminDetail").classList.add("active");
requestAnimationFrame(()=>{
const detailView=$("#adminDetail");
if(detailView){
const top=detailView.getBoundingClientRect().top+window.pageYOffset-85;
window.scrollTo({top:Math.max(0,top),behavior:"smooth"});
}
});
$("#detailTitle").textContent="#"+t.num+" — "+t.title;
$("#factId").textContent="#"+t.num;
$("#factSubject").textContent=t.title;
$("#factCategory").textContent=t.cat;
$("#factAuthor").textContent=t.user||"Onbekend";
$("#factDateTime").textContent="Laden...";
$("#detailMeta").textContent=t.cat+" • Ticket • "+(t.closed?"Gesloten":statusLabel(getInternal(t).status));
$("#replyMessage").value="";
$("#replyStatus").textContent="";
$("#replyStatus").className="reply-status";
$("#adminPosts").innerHTML='<div class="chat-empty">Ticketreacties laden...</div>';
$("#detailClose").style.display=t.closed?"none":"inline-flex";
$("#detailReopen").style.display=t.closed?"inline-flex":"none";
$("#detailForum").onclick=()=>window.open(t.url,"_blank","noopener");
$("#detailClose").onclick=()=>openAction(t,"close");
$("#detailReopen").onclick=()=>openAction(t,"reopen");
$("#detailMove").onclick=()=>openAction(t,"move");
$("#replySend").onclick=()=>sendTicketReply(t);
document.querySelectorAll(".status-pill[data-status]").forEach(b=>{
b.classList.toggle("active",b.dataset.status===getInternal(t).status);
b.onclick=()=>openAction(t,"status",b.dataset.status);
});
const moderatorSelect=$("#assignModerator");
moderatorSelect.value=getInternal(t).assignee||"";
moderatorSelect.onchange=(event)=>{
event.stopPropagation();
const moderatorId=moderatorSelect.value;
if(moderatorId)openAction(t,"assign",moderatorId);
};
try{
const posts=await loadTopicPosts(t);
if(token!==adminDetailLoadToken||selected?.id!==t.id)return;
if(posts[0]){
$("#factAuthor").textContent=posts[0].author||t.user||"Onbekend";
$("#factDateTime").textContent=posts[0].time||"";
}
$("#adminPosts").innerHTML=chatHtml(posts,t,"my-chat");
}catch(error){
if(token!==adminDetailLoadToken)return;
console.error("Ticketreacties laden mislukt:",error);
$("#adminPosts").innerHTML='<div class="chat-empty">Ticketreacties konden niet worden geladen: '+esc(error?.message||"onbekende fout")+'</div>';
}
try{
const info=await loadTopicAuthor(t);
if(token!==adminDetailLoadToken||selected?.id!==t.id)return;
if(info.author){
t.user=info.author;
if(info.userId)t.userId=info.userId;
const idx=all.findIndex(x=>x.id===t.id&&x.closed===t.closed);
if(idx>=0){all[idx].user=info.author;if(info.userId)all[idx].userId=info.userId;}
$("#factAuthor").textContent=info.author;
}
}catch(error){console.warn("Auteurgegevens konden niet worden bijgewerkt:",error);}
}
function openAction(t,type,value){const modal=$("#actionModal"),body=$("#actionModalBody"),title=$("#actionModalTitle"),pm=$("#actionPm"),status=$("#actionStatus"),btn=$("#actionConfirm");modal.dataset.type=type;modal.dataset.ticket=t.id;modal.dataset.value=value||"";modal.classList.add("show");modal.setAttribute("aria-hidden","false");pm.checked=type==="close";pm.disabled=type==="close";status.textContent="";status.className="reply-status";btn.disabled=false;const assigned=!!getInternal(t).assignee;if(type!=="assign" && !assigned){body.innerHTML='<div class="assign-required"><strong>Toewijzing verplicht</strong><p>Wijs dit ticket eerst toe aan een support moderator voordat je deze actie uitvoert.</p><p class="assign-hint">Kies een moderator in het blok <b>Toewijzen aan support moderator</b>.</p></div>';btn.disabled=true;title.textContent="Actie niet beschikbaar";return;}if(type==="assign"){const mod=MODS.find(m=>String(m.id)===String(value));if(!mod){closeAction();return}title.textContent="Toewijzing bevestigen";body.innerHTML='<div class="assign-confirm"><strong>Toewijzen aan '+esc(mod.name)+'</strong><p>Na bevestiging wordt de moderator toegewezen en wordt een PM verzonden.</p></div>';pm.checked=false;pm.disabled=true;}else if(type==="move"){title.textContent="verplaatsen";body.innerHTML='<p class="action-copy">Kies de nieuwe supportcategorie. Het Forumotion-topic wordt daarheen verplaatst.</p><select id="moveCategory">'+CATS.filter(c=>c.key!==t.catKey).map(c=>`<option value="${esc(c.key)}">${esc(c.name)}</option>`).join("")+'</select>';}else if(type==="status"){const labels={pending:"Wachten op antwoord",progress:"Inbehandeling",done:"Gesloten",refused:"Afgewezen"};title.textContent="Status wijzigen";body.innerHTML='<p class="action-copy">Bevestig de nieuwe interne status. Er wordt geen reactie geplaatst.</p><div class="status-index" style="margin:0 0 8px"><span class="status-pill '+esc(value)+' active"><span class="hm-icon ico-pending status-square"></span>'+labels[value]+'</span></div>'+(value==="refused"?'<div class="reason-box"><label for="refuseReason">Reden van afwijzing</label><textarea id="refuseReason" placeholder="Geef de reden waarom dit ticket wordt afgewezen..."></textarea></div>':"");}else{title.textContent=type==="close"?"Ticket sluiten":"Ticket heropenen";body.innerHTML=`<p class="action-copy">${type==="close"?"Het Forumotion-topic wordt gesloten, het ticket krijgt de status <strong>Gesloten</strong> en de auteur krijgt automatisch een PM.":"Het Forumotion-topic wordt heropend en de status wordt teruggezet naar <strong>Wachten op antwoord</strong>."}</p>`;}$("#actionConfirm").onclick=()=>confirmAction(t,type,value);}function closeAction(){const m=$("#actionModal");m.classList.remove("show");m.setAttribute("aria-hidden","true");$("#actionConfirm").disabled=false}async function confirmAction(t,type,value){const status=$("#actionStatus"),btn=$("#actionConfirm");btn.disabled=true;status.textContent="Bezig...";status.className="reply-status";try{if(type!=="assign" && !getInternal(t).assignee)throw Error("Wijs het ticket eerst toe aan een support moderator.");let target=null,reason="";if(type==="assign"){const mod=MODS.find(m=>String(m.id)===String(value));if(!mod)throw Error("Kies een support moderator.");saveInternal(t,{assignee:String(mod.id)});try{await sendModeratorPM(t,mod);status.textContent="Toegewezen aan "+mod.name+" en PM verzonden.";status.className="reply-status ok"}catch(e){status.textContent="Toegewezen aan "+mod.name+". PM kon niet worden verstuurd: "+e.message;status.className="reply-status err"}renderList();setTimeout(closeAction,900);return;}if(type==="move"){const key=$("#moveCategory").value;target=CATS.find(c=>c.key===key);if(!target)throw Error("Kies eerst een categorie.");}if(type==="status"&&value==="refused"){reason=$("#refuseReason")?.value.trim()||"";if(!reason)throw Error("Vul de reden van afwijzing in.");}if(type==="status"&&value!=="done"){saveInternal(t,{status:value,refusedReason:reason});renderList();status.textContent="Status gewijzigd naar "+statusLabel(value)+".";status.className="reply-status ok";setTimeout(closeAction,500);return;}if(type==="status"&&value==="done")type="close";let notificationText="",notificationSubject="[TICKET "+t.num+"] Update";if(type==="close"){await forumModerateTopic(t,"close",null);const dest=CATS.find(c=>c.key===t.catKey)||CATS[0];await forumModerateTopic(t,"move",dest);t.closed=true;t.forumId=dest.closed;saveInternal(t,{status:"done",readAt:0});notificationSubject="[TICKET "+t.num+"] Ticket gesloten";notificationText="Je ticket #"+t.num+" is gesloten.\n\nOnderwerp: "+t.title;}else if(type==="reopen"){await forumModerateTopic(t,"reopen",null);const dest=CATS.find(c=>c.key===t.catKey)||CATS[0];await forumModerateTopic(t,"move",dest);t.closed=false;t.forumId=dest.id;saveInternal(t,{status:"pending",readAt:0});if($("#actionPm").checked){notificationSubject="[TICKET "+t.num+"] Ticket heropend";notificationText="Je ticket #"+t.num+" is heropend.\n\nOnderwerp: "+t.title;}}else if(type==="move"){await forumModerateTopic(t,"move",target);t.cat=target.name;t.catKey=target.key;t.openForumId=target.id;t.closedForumId=target.closed;t.forumId=t.closed?target.closed:target.id;if($("#actionPm").checked){notificationSubject="[TICKET "+t.num+"] Ticket verplaatst";notificationText="Je ticket #"+t.num+" is verplaatst naar "+target.name+".\n\nOnderwerp: "+t.title;}}if(notificationText){try{await sendNotification(t,notificationSubject,notificationText);}catch(e){status.textContent="Actie uitgevoerd, maar PM kon niet worden verstuurd: "+e.message;status.className="reply-status err";renderList();setTimeout(closeAction,1400);return;}}renderList();status.textContent=type==="close"?"Ticket gesloten en auteur geïnformeerd.":"Actie uitgevoerd.";status.className="reply-status ok";setTimeout(closeAction,500);}catch(e){status.textContent=e.message||"Actie mislukt.";status.className="reply-status err";btn.disabled=false;return}btn.disabled=false;}async function forumModerateTopic(t,type,target){
const topicUrl=new URL(t.url,BASE);
if(topicUrl.origin!==BASE)throw Error("Ticketlink staat op een ander domein dan het ingelogde forum.");
const topicMatch=topicUrl.pathname.match(/^\/t(\d+)/i);
if(!topicMatch)throw Error("Het Forumotion-topicnummer ontbreekt in de ticketlink.");
const topicId=topicMatch[1];
const raw=await fetchText(topicUrl.href,7000);
const doc=new DOMParser().parseFromString(raw,"text/html");
let tid=(doc.querySelector('input[name="tid"]')||{}).value||"";
if(!tid){const tokenLink=[...doc.querySelectorAll('a[href*="tid="]')].map(a=>a.getAttribute("href")||"").find(h=>/[?&]tid=[a-f0-9]+/i.test(h));const m=tokenLink&&tokenLink.match(/[?&]tid=([a-f0-9]+)/i);if(m)tid=m[1];}
if(!tid)throw Error("Forumotion heeft geen actuele beveiligingstoken (tid) gevonden. Open het topic rechtstreeks op het forum en probeer opnieuw.");
const mode=type==="close"?"lock":type==="reopen"?"unlock":type==="move"?"move":"";
if(!mode)throw Error("Onbekende moderatieactie.");
const modUrl=new URL("/modcp?mode="+mode+"&t="+encodeURIComponent(topicId)+"&tid="+encodeURIComponent(tid),BASE);
const page=await fetch(modUrl.href,{credentials:"include",cache:"no-store",redirect:"follow"});
if(!page.ok)throw Error("Forumotion gaf HTTP "+page.status+" bij het openen van het moderatiepaneel.");
const html=await page.text();
const panel=new DOMParser().parseFromString(html,"text/html");
if(/login|inloggen|connexion|sign in/i.test(page.url)&&!/modcp/i.test(page.url))throw Error("Je Forumotion-sessie is verlopen. Log opnieuw in.");
if(panel.querySelector('form[name="login"],form[action*="login"]'))throw Error("Forumotion vraagt om opnieuw in te loggen.");
if(type==="close"||type==="reopen"){
const checkRaw=await fetchText(topicUrl.href,7000);
const checkDoc=new DOMParser().parseFromString(checkRaw,"text/html");
const locked=!!checkDoc.querySelector('img[src*="lock" i],img[alt*="gesloten" i],img[alt*="locked" i],.topic_locked,.locked');
if(type==="close"&&!locked&&!/unlock/i.test(html))throw Error("Forumotion heeft het topic niet aantoonbaar vergrendeld. Controleer het moderatiepaneel.");
if(type==="reopen"&&locked)throw Error("Forumotion heeft het topic nog niet heropend.");
return true;
}
const form=[...panel.forms].find(f=>f.querySelector('select[name="new_forum"]'));
if(!form)throw Error("Forumotion heeft de verplaats-pagina geladen, maar daarin ontbreekt het veld new_forum. Controleer of de moderatiepagina volledig is geladen.");
const select=form.querySelector('select[name="new_forum"]');
const wanted="f"+String(target.id);
const option=[...select.options].find(o=>String(o.value)===wanted||String(o.value)===String(target.id));
if(!option)throw Error("Doelforum '"+target.name+"' ("+wanted+") staat niet in Forumotions keuzelijst.");
const currentForum=Number(t.forumId||t.openForumId||0);
if(!currentForum)throw Error("Het huidige forum-ID van dit ticket ontbreekt.");
const postData=new URLSearchParams();
postData.set("new_forum",option.value);
postData.set("mode","move");
postData.set("tid",tid);
postData.set("f",String(currentForum));
postData.set("t",String(topicId));
postData.set("confirm","1");
const result=await fetch(new URL("/modcp?tid="+encodeURIComponent(tid),BASE).href,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},body:postData.toString(),credentials:"include",cache:"no-store",redirect:"follow"});
if(!result.ok)throw Error("Forumotion kon het topic niet verplaatsen (HTTP "+result.status+").");
const resultHtml=await result.text();
if(/no forum selected|aucun forum|geen forum geselecteerd|forum niet gevonden/i.test(resultHtml))throw Error("Forumotion heeft de verplaatsing afgewezen. Het gekozen doelforum is niet geaccepteerd.");
return true;
}
async function loadTopicAuthor(t){const raw=await fetchText(t.url,5000),d=new DOMParser().parseFromString(raw,"text/html");let author="",authorId=0;const firstPost=d.querySelector('.post, .postbody, .post-wrap, .topic-post, article');const a=(firstPost||d).querySelector('a[href^="/u"],a[href*="/u"]');if(a){const href=a.getAttribute("href")||"";const m=href.match(/\/u(\d+)/i);if(m)authorId=Number(m[1]);author=(a.textContent||"").replace(/\s+/g," ").trim();}if(!author){const m=raw.match(/href=["']\/u(\d+)["'][^>]*>([^<]{1,80})</i);if(m){authorId=Number(m[1]);author=m[2].trim();}}author=author&&!/profiel|profile/i.test(author)?author:"";return {author,userId:authorId};}async function ensureTicketAuthor(t){if(t.userId && t.user)return t;try{const info=await loadTopicAuthor(t);if(info.author)t.user=info.author;if(info.userId)t.userId=info.userId;}catch(e){}return t;}async function postForumReply(t,message){
const raw=await fetchText(t.url,10000),doc=new DOMParser().parseFromString(raw,"text/html");
const form=doc.querySelector("form#quick_reply")||[...doc.forms].find(f=>
f.querySelector('textarea[name="message"]')&&f.querySelector('input[name="mode"][value="reply"]')&&f.querySelector('input[name="t"]')
);
if(!form)throw Error("Forumotion heeft geen snel-reactieformulier teruggegeven. Controleer of je bent ingelogd en of het topic open is.");
const area=form.querySelector('textarea[name="message"]');
if(!area)throw Error("Het berichtveld van het reactieformulier ontbreekt.");
const fd=new FormData(form);
fd.set("message",message);
fd.delete("preview");
const postButton=form.querySelector('input[name="post"],button[name="post"]');
if(!postButton)throw Error("De knop Verzenden ontbreekt in het Forumotion-formulier.");
fd.set("post",postButton.value||postButton.textContent||"Verzenden");
const action=new URL(form.getAttribute("action")||"/post",t.url).href;
const response=await fetch(action,{method:"POST",body:fd,credentials:"include",cache:"no-store",redirect:"follow"});
const html=await response.text(),result=new DOMParser().parseFromString(html,"text/html");
if(!response.ok)throw Error("Forumotion kon de reactie niet plaatsen (HTTP "+response.status+").");
const bodyText=result.body?.innerText||"";
if(result.querySelector(".error,.errorbox,.msg-error,.message-error")||/vous devez entrer un message|you must enter a message|bericht is te kort|bericht is leeg|onderwerp is gesloten|topic is locked|topic fermé/i.test(bodyText))
throw Error("Forumotion heeft de reactie afgewezen. Controleer of het topic nog open is en probeer het opnieuw.");
if(!/\/t\d+/i.test(response.url||"")&&!result.querySelector(".post,.postbody"))
throw Error("Forumotion bevestigde niet dat de reactie is geplaatst. Controleer het topic voordat je opnieuw verzendt.");
return true;
}async function postPrivateMessage(recipient,subject,message){const recipientId=Number(recipient&&recipient.id)||0;const recipientName=typeof recipient==="string"?recipient:(recipient&&recipient.user)||"";const url=recipientId?"/privmsg?mode=post&u="+encodeURIComponent(recipientId):"/privmsg?mode=post";const raw=await fetchText(url,6000),d=new DOMParser().parseFromString(raw,"text/html");const form=[...d.forms].find(f=>f.querySelector('textarea[name="message"],textarea#text_editor_textarea')&&f.querySelector('input[name="subject"]'));if(!form)throw Error("PM-formulier niet gevonden.");const msgField=form.querySelector('textarea[name="message"],textarea#text_editor_textarea');const subjectField=form.querySelector('input[name="subject"]');const userFields=[...form.querySelectorAll('input[name="username"],input[name="usersearch"],input[name="to"],input[name="user"]')];const fd=new FormData(form);userFields.forEach(f=>{if(recipientName)fd.set(f.name,recipientName)});if(recipientId){fd.set("u",String(recipientId));fd.set("user_id",String(recipientId));}if(subjectField)fd.set(subjectField.name,subject);if(msgField)fd.set(msgField.name,message);if(form.querySelector('[name="post"]'))fd.set("post",form.querySelector('[name="post"]').value||"Verstuur");const action=new URL(form.getAttribute("action")||"/privmsg",BASE).href;const r=await fetch(action,{method:"POST",body:fd,credentials:"include",cache:"no-store",redirect:"follow"});if(!r.ok)throw Error("Het privébericht kon niet worden verstuurd (HTTP "+r.status+").");const out=await r.text(),od=new DOMParser().parseFromString(out,"text/html");if(od.querySelector(".error,.errorbox,.msg-error")||/geen ontvanger|no recipient|recipient is missing|destinataire/i.test(out))throw Error("Forumotion accepteerde de PM niet.");return true;}async function sendPrivateMessage(t,message){await ensureTicketAuthor(t);if(!t.userId)throw Error("De auteur-ID van dit ticket kon niet worden bepaald.");return postPrivateMessage({id:t.userId,user:t.user},"[TICKET "+t.num+" - REACTIE] "+t.title,message);}async function sendModeratorPM(t,mod){if(!mod||!mod.id)throw Error("Support moderator niet gevonden.");const subject="[TICKET "+t.num+"] Kijk naar ticket";const msg="Er is een supportticket aan jou toegewezen.\n\nTicket: #"+t.num+"\nOnderwerp: "+t.title+"\nCategorie: "+t.cat+"\n\nOpen Ticketbeheer om dit ticket te bekijken en te behandelen.";return postPrivateMessage({id:mod.id,user:mod.username},subject,msg);}async function sendNotification(t,subject,message){await ensureTicketAuthor(t);if(!t.userId)throw Error("De auteur-ID van dit ticket kon niet worden bepaald.");return postPrivateMessage({id:t.userId,user:t.user},subject,message);}async function sendTicketReply(t){
const box=$("#replyMessage"),btn=$("#replySend"),status=$("#replyStatus"),msg=box.value.trim();
if(!msg){status.textContent="Schrijf eerst een reactie.";status.className="reply-status err";return;}
btn.disabled=true;status.textContent="Reactie wordt geplaatst...";status.className="reply-status";
try{
await postForumReply(t,msg);
box.value="";
status.textContent="Reactie geplaatst. Gesprek wordt vernieuwd...";
status.className="reply-status ok";
const posts=await loadTopicPosts(t);
$("#adminPosts").innerHTML=chatHtml(posts,t,"my-chat");
status.textContent="Reactie geplaatst.";
}catch(e){status.textContent=e.message||"Reactie plaatsen mislukt.";status.className="reply-status err";}
finally{btn.disabled=false;}
}$("#categories").addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(!b)return;const selected=cat(b.dataset.cat);if(selected&&selected.externalUrl){window.location.href=selected.externalUrl;return}openForm(b.dataset.cat)});$("#formBack").onclick=$("#formCancel").onclick=()=>show("homeView");$("#formSubmit").onclick=postTicket;$("#adminLaunch").onclick=async()=>{if(!user.logged)await resolveUser();if(isAdmin()){show("adminView");loadTickets()}else{alert("Je Forumotion-account is niet herkend als beheerder. Log in met /u1 of /u3 en vernieuw de pagina.")}};$("#myTicketsLaunch").onclick=showMyTickets;$("#myTicketsBack").onclick=()=>show("homeView");$("#statusFilter").onchange=renderList;$("#adminBack").onclick=()=>show("homeView");$("#detailBack").onclick=()=>{$("#adminDetail").classList.remove("active");$("#adminListView").style.display="block"};$("#actionCancel").onclick=closeAction;$("#actionModalClose").onclick=closeAction;$("#actionModal").addEventListener("click",e=>{if(e.target.id==="actionModal")closeAction()});$("#adminRefresh").onclick=loadTickets;document.querySelectorAll(".nav-btn[data-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentTab=b.dataset.tab||"open";$("#ticketSearch").value="";renderList()});document.querySelectorAll("[data-dashboard-tab]").forEach(b=>b.addEventListener("click",()=>{currentTab=b.dataset.dashboardTab;document.querySelectorAll("[data-dashboard-tab]").forEach(x=>x.classList.toggle("active",x===b));$("#ticketSearch").value="";$("#statusFilter").value="all";renderList()}));$("#ticketSearch").addEventListener("input",renderList);$("#ticketSearch").addEventListener("keydown",e=>{if(e.key==="Enter")renderList()});$("#searchBtn").onclick=renderList;document.querySelectorAll("[data-index-status]").forEach(b=>b.onclick=()=>{$("#statusFilter").value=b.dataset.indexStatus;renderList()});$("#ticketList").addEventListener("click",e=>{const b=e.target.closest("[data-ticket]");if(b){const t=all.find(x=>x.id===b.dataset.ticket);if(t)detail(t)}});$("#myTicketsList").addEventListener("click",e=>{const b=e.target.closest("[data-my]");if(b){const t=all.find(x=>x.id===b.dataset.my);if(t)openMemberTicket(t)}});document.querySelectorAll("[data-member-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-member-tab]").forEach(x=>x.classList.remove("active"));b.classList.add("active");memberTab=b.dataset.memberTab;renderMyTickets()});$("#memberDetailBack").onclick=()=>{$("#memberDetail").classList.remove("active");$("#myTicketsList").style.display="block"};$("#memberReplySend").onclick=async()=>{const st=$("#memberReplyStatus"),m=$("#memberReply").value.trim();if(!m){st.textContent="Schrijf eerst een reactie.";st.className="reply-status err";return}try{await postForumReply(memberSelected,m);$("#memberReply").value="";st.textContent="Reactie geplaatst.";st.className="reply-status ok";openMemberTicket(memberSelected)}catch(e){st.textContent=e.message;st.className="reply-status err"}};$("#memberEditSend").onclick=async()=>{const st=$("#memberEditStatus"),m=$("#memberEditMessage").value.trim(),meta=getInternal(memberSelected);if(Date.now()-(meta.createdAt||0)>300000||meta.readAt||memberSelected.closed){st.textContent="Bewerken is niet meer beschikbaar.";st.className="reply-status err";return}try{await editMemberPost(memberSelected,m);st.textContent="Wijzigingen opgeslagen.";st.className="reply-status ok";setTimeout(()=>openMemberTicket(memberSelected),400)}catch(e){st.textContent=e.message;st.className="reply-status err"}};$("#memberCloseRequestBtn").onclick=()=>{$("#memberCloseConfirm").style.display="inline-flex";$("#memberCloseCancel").style.display="inline-flex";$("#memberCloseRequestBtn").style.display="none";$("#memberCloseStatus").textContent="Na bevestiging wordt een melding naar support gestuurd.";$("#memberCloseStatus").className="reply-status"};$("#memberCloseCancel").onclick=()=>{$("#memberCloseConfirm").style.display="none";$("#memberCloseCancel").style.display="none";$("#memberCloseRequestBtn").style.display="inline-flex";$("#memberCloseStatus").textContent=""};$("#memberCloseConfirm").onclick=async()=>{const st=$("#memberCloseStatus"),t=memberSelected;if(!t)return;try{const meta=getInternal(t),mid=meta.assignee?Number(meta.assignee):Number(MODS[0].id),mod=MODS.find(x=>Number(x.id)===mid)||MODS[0];await postPrivateMessage({id:mod.id,user:mod.username},"[TICKET "+t.num+"] Verzoek ticket sluiten","De ticket-auteur vraagt om ticket #"+t.num+" te sluiten. Onderwerp: "+t.title+". Open Ticketbeheer om dit verzoek te behandelen.");st.textContent="Je verzoek is verzonden naar support.";st.className="reply-status ok";$("#memberCloseConfirm").style.display="none";$("#memberCloseCancel").style.display="none";$("#memberCloseRequestBtn").style.display="inline-flex"}catch(e){st.textContent="Het verzoek kon niet worden verzonden: "+e.message;st.className="reply-status err"}};$("#formMessage").addEventListener("input",updateTicketMessageCounter);$("#formSubject").addEventListener("input",updateTicketMessageCounter);renderCats();resolveUser();})();