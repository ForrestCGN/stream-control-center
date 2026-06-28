'use strict';

const localEndpoints = {
  server: '/api/_status',
  stream: '/api/stream-status/current',
  ws: '/api/diag/ws'
};

const state = {
  activePage: 'overview',
  data: { server: null, stream: null, ws: null },
  errors: [],
  lastUpdated: null
};

function byId(id){ return document.getElementById(id); }
function escapeHtml(value){ return String(value ?? '').replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function safe(value, fallback='—'){ return value === null || value === undefined || value === '' ? fallback : String(value); }
function boolText(value){ return value === true ? 'OK' : value === false ? 'Nein' : '—'; }
function numberOrDash(value){ return Number.isFinite(Number(value)) ? String(Number(value)) : '—'; }

function init(){
  bindShell();
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive:true });
  loadLocalStatus('initial');
}

function bindShell(){
  const navToggle = byId('navToggle');
  if (navToggle) navToggle.addEventListener('click', () => document.body.classList.toggle('nav-collapsed'));
  const scrim = byId('scrim');
  if (scrim) scrim.addEventListener('click', () => document.body.classList.add('nav-collapsed'));

  document.querySelectorAll('.nav-group[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = byId(button.dataset.target || '');
      button.classList.toggle('is-open');
      if (target) target.classList.toggle('is-open');
    });
  });

  document.querySelectorAll('.nav-link[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      setPage(button.dataset.page || 'overview', {
        section: button.dataset.section || 'System',
        title: button.dataset.title || 'Übersicht',
        tab: button.dataset.tab || 'Status'
      });
    });
  });

  ['refreshButton','footerRefreshButton'].forEach((id) => {
    const button = byId(id);
    if (button) button.addEventListener('click', () => loadLocalStatus('manual'));
  });
  const clear = byId('clearErrorsButton');
  if (clear) clear.addEventListener('click', hideError);
}

function updateScrollState(){
  document.body.classList.toggle('is-scrolled', window.scrollY > 6);
}

function setPage(page, meta){
  state.activePage = page;
  document.querySelectorAll('.rdap-view').forEach((panel) => {
    panel.classList.toggle('is-active-view', panel.dataset.pagePanel === page);
  });
  document.querySelectorAll('.nav-link').forEach((button) => button.classList.toggle('is-active', button.dataset.page === page));
  const sectionLabel = byId('sectionLabel');
  const pageTitle = byId('pageTitle');
  if (sectionLabel) sectionLabel.textContent = meta.section;
  if (pageTitle) pageTitle.innerHTML = `${escapeHtml(meta.title)} <span class="tab-part">${escapeHtml(meta.tab)}</span>`;
  renderCurrentPage();
}

async function loadLocalStatus(reason){
  state.errors = [];
  const entries = await Promise.allSettled([
    fetchJson(localEndpoints.server),
    fetchJson(localEndpoints.stream),
    fetchJson(localEndpoints.ws)
  ]);
  ['server','stream','ws'].forEach((key, index) => {
    const result = entries[index];
    if (result.status === 'fulfilled') state.data[key] = result.value;
    else state.errors.push(`${key}: ${result.reason && result.reason.message ? result.reason.message : 'Fehler'}`);
  });
  state.lastUpdated = new Date();
  updateTopbar(reason);
  renderCurrentPage();
}

async function fetchJson(url){
  const response = await fetch(url, { cache:'no-store' });
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
  return response.json();
}

function updateTopbar(){
  const serverOk = state.data.server && state.data.server.ok === true;
  const stream = state.data.stream || {};
  const isLive = stream.isLive ?? stream.live ?? stream.online;
  setChip('quickService', serverOk ? 'Service OK' : 'Service lokal', serverOk ? 'cgn-chip--ok' : 'cgn-chip--warn');
  setChip('quickRuntimeMode', 'Lokalmodus', 'cgn-chip--info');
  setChip('quickLogin', 'Read-only', 'cgn-chip--ok');
  setChip('quickOAuth', 'Port 8080', 'cgn-chip--ok');
  setChip('quickAgent', isLive === true ? 'Stream live' : 'Stream-PC lokal', isLive === true ? 'cgn-chip--ok' : 'cgn-chip--info');
  const text = byId('lastUpdatedText');
  if (text && state.lastUpdated) text.textContent = `Aktualisiert: ${state.lastUpdated.toLocaleString('de-DE')}`;
}

function setChip(id, text, statusClass){
  const el = byId(id);
  if (!el) return;
  el.className = `cgn-chip ${statusClass || ''}`.trim();
  el.textContent = text;
}

function renderCurrentPage(){
  if (state.activePage === 'stream-pc') renderStreamPc();
  else renderOverview();
  if (state.errors.length) showError(state.errors.join(' | '));
  else hideError();
}

function showError(message){
  const box = byId('errorBox');
  const text = byId('errorText');
  if (text) text.textContent = message;
  if (box) box.hidden = false;
}
function hideError(){ const box = byId('errorBox'); if (box) box.hidden = true; }

function renderOverview(){
  const panel = document.querySelector('[data-page-panel="overview"]');
  if (!panel) return;
  const server = state.data.server || {};
  const stream = state.data.stream || {};
  const ws = state.data.ws || {};
  const modules = server.modules && typeof server.modules === 'object' ? Object.keys(server.modules).length : '—';
  const wsClients = ws.clients ?? ws.wsClients ?? server.wsClients ?? '—';
  const isLive = stream.isLive ?? stream.live ?? stream.online;
  panel.innerHTML = `
    <section class="page-header module-page-header cgn-card"><p class="cgn-eyebrow">Remote Modboard</p><h1>Übersicht</h1><p>Lokale Remote-Modboard-Kopie auf Port 8080. Optik/Shell wie online, Daten read-only lokal.</p></section>
    <section class="metric-grid">
      ${metricCard('Server', boolText(server.ok), 'GET /api/_status', server.ok ? 92 : 35, !server.ok)}
      ${metricCard('Module', safe(modules), 'geladene Modulübersicht', modules === '—' ? 20 : 78)}
      ${metricCard('Stream', isLive === true ? 'Live' : isLive === false ? 'Offline' : 'Unklar', 'GET /api/stream-status/current', isLive === true ? 100 : 35, isLive !== true)}
      ${metricCard('WebSocket', safe(wsClients), 'GET /api/diag/ws', wsClients === '—' ? 20 : 82)}
    </section>
    <section class="page-grid">
      <article class="cgn-card activity-card"><div class="card-head"><div><p class="cgn-eyebrow">Aktivitäten</p><h2>Letzte Änderungen</h2></div><span class="cgn-chip cgn-chip--info">lokal</span></div>
        ${activityRow('◆','Remote-Shell aktiv','/dashboard-v2 nutzt die Remote-Modboard-Shell als lokale Kopie. Keine eigene Dashboard-Optik.')}
        ${activityRow('◇','Read-only Grenze','Es werden nur lokale GET-Routen gelesen. Keine Writes, keine Agent-Action, keine OBS-/Sound-/Overlay-Steuerung.')}
        ${activityRow('⚙','Legacy bleibt stabil','/dashboard bleibt unverändert. Dashboard-v2 ist separat.')}
        <div class="local-shell-note">Design-Wahrheit ist das Online-Modboard. Lokale Abweichungen sind nur Datenquelle, Texte und Sicherheitsgrenzen.</div>
      </article>
      <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Schnellzugriff</p><h2>Wichtige Bereiche</h2></div><span class="cgn-chip cgn-chip--ok">bereit</span></div><div class="quick-list">
        ${quickRow('S','System','Übersicht aktiv','overview')}
        ${quickRow('P','Stream-PC','Status read-only','stream-pc')}
        ${quickRow('M','Module','später vorbereitet','modules', true)}
      </div></article>
    </section>`;
}

function renderStreamPc(){
  const panel = document.querySelector('[data-page-panel="stream-pc"]');
  if (!panel) return;
  const server = state.data.server || {};
  const stream = state.data.stream || {};
  const ws = state.data.ws || {};
  const isLive = stream.isLive ?? stream.live ?? stream.online;
  panel.innerHTML = `
    <section class="page-header module-page-header cgn-card"><p class="cgn-eyebrow">System / read-only</p><h1>Stream-PC</h1><p>Lokaler Stream-PC-Lesestand aus bestehenden GET-Routen. Keine Aktionen, keine Steuerung.</p></section>
    <section class="status-grid">
      <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Server</p><h2>Lokaler Node</h2></div><span class="cgn-chip ${server.ok ? 'cgn-chip--ok' : 'cgn-chip--warn'}">${escapeHtml(boolText(server.ok))}</span></div>${kvList([['Route','/api/_status'],['Module', server.modules && typeof server.modules === 'object' ? Object.keys(server.modules).length : '—'],['Version', server.version || server.build || 'lokal']])}</article>
      <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Stream</p><h2>Status</h2></div><span class="cgn-chip ${isLive ? 'cgn-chip--ok' : 'cgn-chip--warn'}">${isLive ? 'live' : 'offline'}</span></div>${kvList([['Route','/api/stream-status/current'],['Status', isLive === true ? 'Live' : isLive === false ? 'Offline' : 'Unklar'],['Titel', stream.title || stream.streamTitle || '—'],['Kategorie', stream.gameName || stream.category || '—']])}</article>
      <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">WebSocket</p><h2>Diagnose</h2></div><span class="cgn-chip cgn-chip--info">read-only</span></div>${kvList([['Route','/api/diag/ws'],['Clients', ws.clients ?? ws.wsClients ?? '—'],['Status', ws.ok === false ? 'Fehler' : 'Lesbar']])}</article>
      <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Grenzen</p><h2>Sicherheit</h2></div><span class="cgn-chip cgn-chip--ok">geschützt</span></div><ul class="check-list"><li><span>✓</span>Keine Backend-Änderung</li><li><span>✓</span>Keine DB-Migration</li><li><span>✓</span>Keine produktiven Writes</li><li><span>✓</span>Keine OBS-/Sound-/Overlay-Aktion</li></ul></article>
    </section>`;
}

function metricCard(label, value, detail, pct, warn){
  return `<article class="cgn-card metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(detail)}</small><div class="cgn-progress ${warn ? 'cgn-progress--warn' : ''}"><i style="width:${Math.max(0, Math.min(100, Number(pct)||0))}%"></i></div></article>`;
}
function activityRow(icon, title, text){ return `<div class="activity-row"><span class="activity-icon">${escapeHtml(icon)}</span><div><b>${escapeHtml(title)}</b><small>${escapeHtml(text)}</small></div></div>`; }
function quickRow(icon, title, text, page, disabled){ return `<button class="quick-row" type="button" data-quick-page="${escapeHtml(page)}" ${disabled ? 'disabled' : ''}><span class="quick-icon purple">${escapeHtml(icon)}</span><div><b>${escapeHtml(title)}</b><small>${escapeHtml(text)}</small></div></button>`; }
function kvList(rows){ return `<div class="kv-list">${rows.map(([k,v]) => `<div class="kv-row"><span>${escapeHtml(k)}</span><strong>${escapeHtml(safe(v))}</strong></div>`).join('')}</div>`; }

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-quick-page]');
  if (!button || button.disabled) return;
  const page = button.dataset.quickPage;
  const nav = document.querySelector(`.nav-link[data-page="${CSS.escape(page)}"]`);
  if (nav) nav.click();
});

document.addEventListener('DOMContentLoaded', init);
