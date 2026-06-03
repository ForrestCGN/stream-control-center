"use strict";
(function(){
  const V="0.1.0-can36-3", PANEL="messageRotatorModule", CARD="messageRotatorReadonlyDiagnosticsCard", TAB="messageRotatorReadonlyDiagnosticsTab", REFRESH=15000;
  const s={active:false,loading:false,last:0,payload:null,error:"",timers:[]};
  const RO=["GET /api/message-rotator/status","GET /api/message-rotator/config","GET /api/message-rotator/settings","GET /api/message-rotator/routes","GET /api/message-rotator/integration-check","GET /api/message-rotator/admin/settings","GET /api/message-rotator/admin/texts"];
  const BLOCK=["GET/POST /api/message-rotator/reload","GET/POST /api/message-rotator/start","GET/POST /api/message-rotator/stop","GET/POST /api/message-rotator/tick","GET/POST /api/message-rotator/next","GET/POST /api/message-rotator/manual","GET/POST /api/message-rotator/live-status","POST /api/message-rotator/admin/settings","POST /api/message-rotator/admin/texts","GET/POST /message-rotator/reload","GET/POST /message-rotator/start","GET/POST /message-rotator/stop","GET/POST /message-rotator/tick","GET/POST /message-rotator/next","GET/POST /message-rotator/manual","GET/POST /message-rotator/live-status","POST /message-rotator/admin/settings","POST /message-rotator/admin/texts"];
  function esc(v){return window.CGN?.esc?window.CGN.esc(v):String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
  function root(){return document.getElementById(PANEL);}
  function visible(){const r=root();return !!(r&&!r.hidden);}
  function later(fn,ms){const t=setTimeout(()=>{s.timers=s.timers.filter(x=>x!==t);fn();},ms);s.timers.push(t);}
  function clearTimers(){while(s.timers.length)clearTimeout(s.timers.pop());}
  async function api(p){if(window.CGN?.api)return window.CGN.api(p);const r=await fetch(p,{cache:"no-store"});if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);return r.json();}
  async function load(force=false){const n=Date.now();if(!force&&s.payload&&n-s.last<REFRESH)return s.payload;if(s.loading)return s.payload;s.loading=true;try{const [status,routes,integration]=await Promise.all([api("/api/message-rotator/status"),api("/api/message-rotator/routes"),api("/api/message-rotator/integration-check")]);s.payload={status,routes,integration};s.last=Date.now();s.error="";return s.payload;}catch(e){s.error=e?.message||String(e);return s.payload||null;}finally{s.loading=false;}}
  function yn(v){return v?"ja":"nein";}
  function count(o){return o&&typeof o==="object"&&!Array.isArray(o)?Object.keys(o).length:0;}
  function pill(routes,mode){return routes.map(r=>`<span class="mr-rodiag-route-pill ${mode}">${esc(r)}</span>`).join("");}
  function metric(label,value,note,mode="neutral"){return `<div class="mr-rodiag-metric ${esc(mode)}"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note?`<small>${esc(note)}</small>`:""}</div>`;}
  function row(label,value,mode="neutral"){return `<div class="mr-rodiag-row ${esc(mode)}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;}
  function samples(o){const e=o&&typeof o==="object"?Object.values(o):[];return {total:e.length,ok:e.filter(x=>x&&x.ok).length};}
  function html(p){
    const st=p?.status||{}, i=p?.integration||{}, c=i.checks||{}, cfg=st.config||{}, opts=cfg.messageOptions||{}, rt=cfg.runtime||{}, info=st.configInfo||cfg.configInfo||{}, conf=c.config||{}, text=c.texts||{}, live=c.liveStatusConfig||cfg.liveStatus||{}, sm=samples(c.samples||{});
    const items=Array.isArray(cfg.items)?cfg.items:[], activeItems=items.filter(x=>x&&x.enabled).length, manualItems=items.filter(x=>x&&x.manualEnabled).length;
    const ok=st.ok!==false, healthy=i.ok===true&&i.healthy!==false, errors=Array.isArray(i.errors)?i.errors:[], warnings=Array.isArray(i.warnings)?i.warnings:[], active=!!st.active, delivery=opts.deliveryMode||"backend";
    return `<section id="${CARD}" class="mr-rodiag-shell" data-version="${esc(V)}">
      <section class="mr-card mr-rodiag-card mr-rodiag-header"><div><h3>Message-Rotator Read-only Diagnose</h3><p>Kein Start/Stop, kein Tick, kein Next/Manual, keine Preview, kein Reload, kein Live-Status-Force.</p></div><div class="mr-rodiag-head-pills"><span class="mr-pill ${ok&&healthy&&!errors.length?"ok":"warn"}">${ok&&healthy&&!errors.length?"READ-ONLY OK":"PRÜFEN"}</span><span class="mr-pill ${active?"ok":"warn"}">${active?"läuft":"gestoppt"}</span><span class="mr-pill ${delivery==="backend"?"warn":"ok"}">${esc(delivery)}</span></div></section>
      <section class="mr-rodiag-section"><div class="mr-rodiag-section-title"><h4>Status & Runtime</h4><span>nur Anzeige</span></div><div class="mr-rodiag-grid">${metric("Status OK",yn(ok),"/status",ok?"ok":"warn")}${metric("Integration OK",yn(healthy),"/integration-check",healthy?"ok":"warn")}${metric("Rotator aktiv",yn(active),active?"läuft":"gestoppt",active?"ok":"neutral")}${metric("SendCount",st.sendCount??0,"Ausgaben","neutral")}${metric("Chat-Zähler",st.chatMessagesSinceLastSend??0,"seit letzter Ausgabe","neutral")}${metric("Ticks",st.totalTicks??0,`ignoriert ${st.ignoredTicks??0}`,"neutral")}${metric("Letztes Item",st.lastItemId||"-",st.lastMessageKey||"-","neutral")}${metric("Letzte Ausgabe",st.lastSentAt||"-","nur Anzeige","neutral")}</div></section>
      <section class="mr-rodiag-section"><div class="mr-rodiag-section-title"><h4>Konfiguration & Items</h4><span>keine Änderung</span></div><div class="mr-rodiag-split"><div class="mr-rodiag-list">${row("Config aktiviert",yn(cfg.enabled),cfg.enabled?"ok":"warn")}${row("Config-Quelle",info.settingsSource||conf.source||"-")}${row("Settings-Tabelle",info.settingsTable||conf.settingsTable||"-")}${row("Items gesamt",items.length||conf.itemCount||0)}${row("Items aktiv",activeItems||conf.enabledItems||0,activeItems?"ok":"warn")}${row("Manual-Items",manualItems)}</div><div class="mr-rodiag-list">${row("Output-Modus",opts.outputMode||"chat")}${row("Delivery-Modus",delivery,delivery==="backend"?"warn":"ok")}${row("Announcement-Farbe",opts.announcementColor||"-")}${row("Only when live",yn(rt.onlyWhenLive))}${row("Min. Chat",rt.minChatMessagesBetweenRotations??"-")}${row("Global Cooldown",`${rt.globalCooldownMinutes??"-"} min`)}</div></div></section>
      <section class="mr-rodiag-section"><div class="mr-rodiag-section-title"><h4>Textsystem & Samples</h4><span>aus Integration-Check, keine Ausgabe</span></div><div class="mr-rodiag-grid">${metric("Texthelper OK",yn(text.ok!==false),text.error||"helper status",text.ok===false?"warn":"ok")}${metric("Samples",`${sm.ok}/${sm.total}`,"renderbare Beispieltexte",sm.ok===sm.total?"ok":"warn")}${metric("Message-Files",count(c.messageFiles||{}),"geprüfte Dateien")}${metric("Config-Datei",c.files?.config?.ok?"ok":"prüfen",c.files?.config?.path||"-",c.files?.config?.ok?"ok":"warn")}</div></section>
      <section class="mr-rodiag-section"><div class="mr-rodiag-section-title"><h4>Live-Status-Konfiguration</h4><span>keine /live-status Force-Abfrage</span></div><div class="mr-rodiag-split"><div class="mr-rodiag-list">${row("Live-Status aktiv",yn(live.enabled),live.enabled?"ok":"neutral")}${row("Modus",live.mode||"-")}${row("Fail closed",yn(live.failClosed),live.failClosed?"warn":"neutral")}${row("Cache Sekunden",live.cacheSeconds??"-")}</div><div class="mr-rodiag-list">${row("Runtime online",st.liveStatus?.online==null?"-":yn(st.liveStatus.online),st.liveStatus?.online?"ok":"neutral")}${row("Runtime Grund",st.liveStatus?.reason||"-")}${row("Runtime Cache-Alter",st.liveStatus?.ageSeconds==null?"-":`${st.liveStatus.ageSeconds}s`)}${row("Warnungen / Fehler",`${warnings.length} / ${errors.length}`,errors.length||warnings.length?"warn":"ok")}</div></div></section>
      <section class="mr-rodiag-section"><div class="mr-rodiag-section-title"><h4>Routen-Sicherheit</h4><span>klar getrennt</span></div><div class="mr-rodiag-routes"><details open><summary>Read-only erlaubt (${RO.length})</summary><div class="mr-rodiag-route-list">${pill(RO,"ok")}</div></details><details><summary>Produktiv gesperrt (${BLOCK.length})</summary><div class="mr-rodiag-route-list">${pill(BLOCK,"blocked")}</div></details></div></section>
      <section class="mr-card mr-rodiag-card"><p class="mr-muted">CAN-36.3: nutzt nur GET /status, /routes und /integration-check. Kein Start/Stop, kein Tick, kein Next/Manual, keine Preview, kein Reload, keine Live-Status-Force-Abfrage.</p></section>
    </section>`;
  }
  function tabs(){return root()?.querySelector(".mr-tabs")||null;}
  function remove(){document.getElementById(CARD)?.remove();}
  function restore(){root()?.querySelectorAll("[data-mr-readonly-hidden='1']").forEach(n=>{delete n.dataset.mrReadonlyHidden;n.style.display="";});}
  function ensureTab(){const t=tabs();if(!t||document.getElementById(TAB))return;const b=document.createElement("button");b.type="button";b.id=TAB;b.dataset.mrReadonlyTab="diagnostics";b.textContent="Read-only";t.appendChild(b);}
  function setActive(){const t=tabs();if(!t)return;t.querySelectorAll("button").forEach(b=>b.classList.remove("active"));document.getElementById(TAB)?.classList.add("active");}
  function hideNative(){const t=tabs();if(!t)return;let n=t.nextElementSibling;while(n){const next=n.nextElementSibling;if(n.id!==CARD){n.dataset.mrReadonlyHidden="1";n.style.display="none";}n=next;}}
  async function render(force=false){if(!visible())return;ensureTab();const t=tabs();if(!t)return;s.active=true;setActive();hideNative();const p=await load(force);if(!p)return;const old=document.getElementById(CARD);if(old)old.outerHTML=html(p);else t.insertAdjacentHTML("afterend",html(p));setActive();hideNative();}
  function showNative(){s.active=false;restore();remove();ensureTab();}
  function scheduleEnsure(){later(()=>{if(visible()){ensureTab();if(s.active)render(false);}},120);later(()=>{if(visible()){ensureTab();if(s.active)render(false);}},600);}
  function boot(){
    document.addEventListener("click",e=>{
      if(e.target.closest?.(`#${TAB}`)){e.preventDefault();e.stopPropagation();clearTimers();render(true);return;}
      if(e.target.closest?.("#messageRotatorModule [data-mr-tab]")){showNative();scheduleEnsure();return;}
      if(e.target.closest?.("#messageRotatorModule [data-mr-refresh]"))scheduleEnsure();
    },true);
    window.addEventListener("cgn:module-show",e=>{if(e.detail?.module!=="message_rotator")return;showNative();scheduleEnsure();});
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)scheduleEnsure();});
    scheduleEnsure();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
  window.CGNMessageRotatorReadonlyDiagnostics={version:V,refresh:()=>render(true),activate:()=>render(true),deactivate:showNative};
})();
