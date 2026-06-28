'use strict';

const navigationSections = [
  { id: 'system', title: 'System', icon: '◆', modules: [
    { route: 'system.overview', title: 'Übersicht', subtitle: 'Status' },
    { route: 'system.streamPc', title: 'Stream-PC', subtitle: 'read-only' },
    { route: 'system.diagnostics', title: 'Diagnose', subtitle: 'später', disabled: true }
  ]},
  { id: 'modules', title: 'Module', icon: '◇', modules: [
    { route: 'modules.catalog', title: 'Modulübersicht', subtitle: 'später', disabled: true }
  ]},
  { id: 'admin', title: 'Admin', icon: '⚙', modules: [
    { route: 'admin.users', title: 'Benutzerverwaltung', subtitle: 'später', disabled: true },
    { route: 'admin.notes', title: 'Admin-Notizen', subtitle: 'später', disabled: true },
    { route: 'admin.connections', title: 'Verbindungen', subtitle: 'später', disabled: true }
  ]}
];

const moduleRegistry = {
  'system.overview': { sectionTitle: 'System', moduleTitle: 'Übersicht', activeTabTitle: 'Status', tabs: [], render: renderOverviewPage },
  'system.streamPc': { sectionTitle: 'System', moduleTitle: 'Stream-PC', activeTabTitle: 'read-only', tabs: [], render: renderStreamPcPage },
  'system.diagnostics': placeholder('System', 'Diagnose'),
  'modules.catalog': placeholder('Module', 'Modulübersicht'),
  'admin.users': placeholder('Admin', 'Benutzerverwaltung'),
  'admin.notes': placeholder('Admin', 'Admin-Notizen'),
  'admin.connections': placeholder('Admin', 'Verbindungen')
};

let activeRoute = 'system.overview';
let statusCache = { server: null, stream: null, ws: null, errors: [] };

function placeholder(sectionTitle, moduleTitle) {
  return {
    sectionTitle,
    moduleTitle,
    activeTabTitle: 'Geplant',
    tabs: [],
    render: () => `<section class="page-header module-page-header cgn-card"><p class="cgn-eyebrow">${escapeHtml(sectionTitle)} / geplant</p><h1>${escapeHtml(moduleTitle)}</h1><p>Dieser Bereich ist als Navigation vorbereitet, aber lokal noch nicht fachlich aktiviert.</p></section>`
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function safeText(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function normalizeOk(value) {
  if (value === true) return 'OK';
  if (value === false) return 'Nein';
  return '—';
}

function renderApp() {
  const root = document.getElementById('root');
  const activeModule = moduleRegistry[activeRoute] || moduleRegistry['system.overview'];
  root.innerHTML = `
    <div class="cgn-galaxy" aria-hidden="true"><div class="bg-wash bg-wash-a"></div><div class="bg-wash bg-wash-b"></div><div class="bg-core"></div><div class="stars"></div><div class="dot-grid"></div></div>
    ${renderTopbar(activeModule)}
    <div class="cgn-layout">
      ${renderSidebar()}
      <div class="cgn-scrim" id="scrim"></div>
      <main class="cgn-content">
        ${renderTabs(activeModule.tabs)}
        <div id="pageRoot">${activeModule.render()}</div>
      </main>
    </div>
  `;
  bindUi();
}

function renderTopbar(activeModule) {
  return `
    <header class="cgn-topbar" id="topbar">
      <div class="top-left">
        <button class="cgn-icon-button" type="button" title="Navigation ein-/ausklappen" aria-label="Navigation ein-/ausklappen" id="navToggle"><span class="hamburger"><i></i><i></i><i></i></span></button>
        <div class="cgn-breadcrumb"><span>${escapeHtml(activeModule.sectionTitle)}</span><strong>${escapeHtml(activeModule.moduleTitle)}<span class="tab-part">${escapeHtml(activeModule.activeTabTitle)}</span></strong></div>
      </div>
      <div class="top-search disabled" aria-label="Suche später verfügbar"><span>⌕</span><input type="search" placeholder="Suche später: Module, User, Logs …" disabled></div>
      <div class="top-center" aria-label="Lokale Status-Chips"><span class="cgn-chip cgn-chip--ok">v0.2.10E lokal</span><span class="cgn-chip cgn-chip--info">Lokalmodus</span><span class="cgn-chip cgn-chip--ok">Read-only</span><span class="cgn-chip cgn-chip--ok">Stream-PC lokal</span></div>
      <div class="top-right"><button class="secondaryButton" type="button" disabled>Neu laden</button><button class="cgn-icon-button cgn-lang" type="button" disabled>DE</button><button class="cgn-icon-button cgn-bell" type="button" title="Read-only gesperrt" aria-label="Read-only gesperrt" disabled>🔒<em>0</em></button><button class="cgn-avatar-button" type="button" disabled title="Lokales Dashboard v2"><span class="cgn-avatar"><span>F</span></span><span class="cgn-avatar-copy"><strong>ForrestCGN</strong><small>Aktualisiert: lokal</small></span></button></div>
    </header>`;
}

function renderSidebar() {
  return `<aside class="cgn-sidebar"><div class="sidebar-head"><strong>Navigation</strong><span>Lokales Dashboard</span></div><nav class="cgn-nav">${navigationSections.map(renderNavSection).join('')}</nav><div class="sidebar-foot"><span>ForrestCGN</span><strong>Dashboard v2</strong></div></aside>`;
}

function renderNavSection(section) {
  const isOpen = section.modules.some((item) => item.route === activeRoute);
  return `<button class="nav-group ${isOpen ? 'is-open' : ''}" type="button" data-nav-group="${escapeHtml(section.id)}"><span>${escapeHtml(section.icon)}</span><b>${escapeHtml(section.title)}</b><i>⌄</i></button><div class="nav-sub ${isOpen ? 'is-open' : ''}" id="nav-${escapeHtml(section.id)}">${section.modules.map((item) => renderNavLink(section, item)).join('')}</div>`;
}

function renderNavLink(section, item) {
  return `<button class="nav-link ${item.route === activeRoute ? 'is-active' : ''}" type="button" data-route="${escapeHtml(item.route)}" data-section="${escapeHtml(section.id)}" ${item.disabled ? 'disabled' : ''}>${escapeHtml(item.title)}</button>`;
}

function renderTabs(tabs) {
  if (!Array.isArray(tabs) || tabs.length === 0) return '';
  return `<nav class="module-tabs" aria-label="Modulnavigation">${tabs.map((tab, index) => `<button class="module-tab ${index === 0 ? 'is-active' : ''}" type="button">${escapeHtml(tab)}</button>`).join('')}</nav>`;
}

function bindUi() {
  document.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      activeRoute = button.dataset.route || 'system.overview';
      renderApp();
    });
  });
  document.querySelectorAll('[data-nav-group]').forEach((button) => {
    button.addEventListener('click', () => {
      const sub = button.nextElementSibling;
      if (!sub) return;
      button.classList.toggle('is-open');
      sub.classList.toggle('is-open');
    });
  });
  const toggle = document.getElementById('navToggle');
  if (toggle) toggle.addEventListener('click', () => document.body.classList.toggle('nav-collapsed'));
  const scrim = document.getElementById('scrim');
  if (scrim) scrim.addEventListener('click', () => document.body.classList.add('nav-collapsed'));
}

function metricCard(label, value, detail, pct, warn = false) {
  return `<article class="cgn-card metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(detail)}</small><div class="cgn-progress ${warn ? 'cgn-progress--warn' : ''}"><i style="width:${Math.max(0, Math.min(100, Number(pct) || 0))}%"></i></div></article>`;
}

function renderOverviewPage() {
  const server = statusCache.server || {};
  const stream = statusCache.stream || {};
  const ws = statusCache.ws || {};
  const modules = server.modules && typeof server.modules === 'object' ? Object.keys(server.modules).length : '—';
  const wsClients = ws.clients ?? ws.wsClients ?? server.wsClients ?? '—';
  const liveState = stream.isLive ?? stream.live ?? stream.online;
  const errors = statusCache.errors.length;

  return `
    <section class="page-header module-page-header cgn-card"><p class="cgn-eyebrow">Lokales Dashboard v2 / read-only</p><h1>Übersicht</h1><p>Lokale Oberfläche auf Port 8080. V13-Topbar nachgezogen, ohne Backend-, DB- oder Action-Änderungen.</p></section>
    <section class="metric-grid">
      ${metricCard('Server', normalizeOk(server.ok), 'GET /api/_status', server.ok ? 100 : 25, !server.ok)}
      ${metricCard('Module', safeText(modules), 'geladene Modulübersicht', modules === '—' ? 20 : 75)}
      ${metricCard('Stream', liveState === true ? 'Live' : liveState === false ? 'Offline' : 'Unklar', 'GET /api/stream-status/current', liveState === true ? 100 : 35, liveState !== true)}
      ${metricCard('WebSocket', safeText(wsClients), 'GET /api/diag/ws', wsClients === '—' ? 20 : 80)}
    </section>
    <section class="page-grid">
      <article class="cgn-card activity-card"><div class="card-head"><div><p class="cgn-eyebrow">Status</p><h2>Lokaler Lesestand</h2></div><span class="cgn-chip cgn-chip--ok">read-only</span></div>
        ${activityRow('◆','Dashboard-v2','Topbar V13-Struktur aktiv: Breadcrumb, Suche, Chips, Refresh, DE, Lock und Avatar.')}
        ${activityRow('◇','Sicherheit','Keine Schreibroute, keine Agent-Action, keine OBS-/Sound-/Overlay-Steuerung.')}
        ${activityRow('⚙','Kompatibilität','/dashboard bleibt unverändert. Dashboard-v2 läuft separat unter /dashboard-v2/.')}
        ${errors ? `<div class="error-note">${escapeHtml(errors)} lokale Statusabfrage(n) konnten nicht gelesen werden. Die Oberfläche bleibt trotzdem read-only sichtbar.</div>` : ''}
      </article>
      <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Schnellzugriff</p><h2>Bereiche</h2></div></div><div class="quick-list">
        ${quickRow('S','System','Übersicht aktiv','system.overview')}
        ${quickRow('P','Stream-PC','Status read-only','system.streamPc')}
        ${quickRow('M','Module','später vorbereitet','modules.catalog', true)}
      </div></article>
    </section>`;
}

function renderStreamPcPage() {
  const server = statusCache.server || {};
  const stream = statusCache.stream || {};
  const ws = statusCache.ws || {};
  return `
    <section class="page-header module-page-header cgn-card"><p class="cgn-eyebrow">System / Stream-PC</p><h1>Stream-PC Status</h1><p>Read-only Diagnose aus bestehenden lokalen GET-Routen. Keine Steuerung, keine neuen Actions.</p></section>
    <section class="status-grid">
      ${kvCard('Lokaler Server', [['OK', normalizeOk(server.ok)], ['Port', '8080'], ['Module', safeText(server.modules && typeof server.modules === 'object' ? Object.keys(server.modules).length : '—')], ['Route', '/api/_status']])}
      ${kvCard('Streamstatus', [['Live', stream.isLive === true || stream.live === true ? 'Ja' : stream.isLive === false || stream.live === false ? 'Nein' : '—'], ['Titel', safeText(stream.title || stream.streamTitle)], ['Spiel', safeText(stream.game || stream.gameName)], ['Route', '/api/stream-status/current']])}
      ${kvCard('WebSocket', [['Clients', safeText(ws.clients ?? ws.wsClients)], ['OK', normalizeOk(ws.ok)], ['Route', '/api/diag/ws'], ['Status', statusCache.errors.length ? 'mit Hinweis' : 'bereit']])}
      <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Grenzen</p><h2>Read-only bleibt read-only</h2></div></div><ul class="check-list"><li><span>✓</span>Keine OBS-Steuerung</li><li><span>✓</span>Keine Sound-Auslösung</li><li><span>✓</span>Keine DB-Migration</li><li><span>✓</span>Keine Shell-/Datei-/Prozess-Actions</li></ul></article>
    </section>`;
}

function activityRow(icon, title, text) {
  return `<div class="activity-row"><span class="activity-icon">${escapeHtml(icon)}</span><div><b>${escapeHtml(title)}</b><small>${escapeHtml(text)}</small></div></div>`;
}

function quickRow(icon, title, text, route, disabled = false) {
  return `<button class="quick-row" type="button" data-route="${escapeHtml(route)}" ${disabled ? 'disabled' : ''}><span class="quick-icon purple">${escapeHtml(icon)}</span><div><b>${escapeHtml(title)}</b><small>${escapeHtml(text)}</small></div></button>`;
}

function kvCard(title, rows) {
  return `<article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Read-only</p><h2>${escapeHtml(title)}</h2></div></div><div class="kv-list">${rows.map(([key, value]) => `<div class="kv-row"><span>${escapeHtml(key)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div></article>`;
}

async function readJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

async function loadReadOnlyStatus() {
  const errors = [];
  const [server, stream, ws] = await Promise.all([
    readJson('/api/_status').catch((error) => { errors.push(error.message); return null; }),
    readJson('/api/stream-status/current').catch((error) => { errors.push(error.message); return null; }),
    readJson('/api/diag/ws').catch((error) => { errors.push(error.message); return null; })
  ]);
  statusCache = { server, stream, ws, errors };
  renderApp();
}

function updateScrolledState() {
  document.body.classList.toggle('is-scrolled', window.scrollY > 8);
}

window.addEventListener('scroll', updateScrolledState, { passive: true });
window.addEventListener('DOMContentLoaded', () => {
  updateScrolledState();
  renderApp();
  loadReadOnlyStatus();
});
