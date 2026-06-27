(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const state = { page: 'overview', server: null, stream: null, ws: null, errors: [] };
  const routes = {
    overview: { section: 'System', title: 'Übersicht', tab: 'Status' },
    streamPc: { section: 'System', title: 'Stream-PC', tab: 'read-only' },
    modules: { section: 'Module', title: 'Modulübersicht', tab: 'später' },
    admin: { section: 'Admin', title: 'Admin', tab: 'später' }
  };

  function html(strings, ...values) {
    return strings.map((part, index) => part + (values[index] ?? '')).join('');
  }

  function esc(value) {
    return String(value ?? '—').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  }

  async function getJson(path) {
    const response = await fetch(path, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return data;
  }

  async function loadReadOnlyStatus() {
    state.errors = [];
    const results = await Promise.allSettled([
      getJson('/api/_status'),
      getJson('/api/stream-status/current'),
      getJson('/api/diag/ws')
    ]);
    const keys = ['server', 'stream', 'ws'];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') state[keys[index]] = result.value;
      else state.errors.push(result.reason?.message || String(result.reason));
    });
    renderPage();
    renderTopbarStatus();
  }

  function chip(text, tone='') {
    return `<span class="cgn-chip ${tone ? `cgn-chip--${tone}` : ''}">${esc(text)}</span>`;
  }

  function metric(label, value, sub, width = 92, warn = false) {
    return html`<article class="metric-card cgn-card"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(sub)}</small><div class="cgn-progress ${warn ? 'cgn-progress--warn' : ''}"><i style="width:${width}%"></i></div></article>`;
  }

  function renderShell() {
    const root = $('#root');
    root.innerHTML = html`
      <div class="cgn-galaxy" aria-hidden="true"><div class="bg-wash bg-wash-a"></div><div class="bg-wash bg-wash-b"></div><div class="bg-core"></div><div class="stars"></div><div class="dot-grid"></div></div>
      <header class="cgn-topbar" id="topbar">
        <div class="top-left">
          <button class="cgn-icon-button" id="navToggle" title="Navigation ein-/ausklappen" aria-label="Navigation ein-/ausklappen"><span class="hamburger"><i></i><i></i><i></i></span></button>
          <div class="cgn-breadcrumb"><span id="sectionLabel">System</span><strong><span id="pageTitle">Übersicht</span> <span class="tab-part">• <span id="tabLabel">Status</span></span></strong></div>
        </div>
        <div class="top-search disabled"><span>⌕</span><input type="search" placeholder="Suche später: Module, Sounds, Overlays …" disabled></div>
        <div class="top-center" id="quickChips"></div>
        <div class="top-right">
          <button class="secondaryButton" type="button" disabled>Neu laden</button>
          <button class="cgn-icon-button cgn-lang" type="button" disabled>DE</button>
          <button class="cgn-icon-button cgn-bell" type="button" disabled>🔒<em>0</em></button>
          <button class="cgn-avatar-button" type="button" disabled><span class="cgn-avatar cgn-avatar-local">F</span><span class="cgn-avatar-copy"><strong>ForrestCGN</strong><small id="lastUpdatedText">Lokal</small></span></button>
        </div>
      </header>
      <div class="cgn-layout">
        <aside class="cgn-sidebar">
          <div class="sidebar-head"><strong>Navigation</strong><span>Remote Modboard</span></div>
          <nav class="cgn-nav">
            <button class="nav-group is-open" type="button" data-target="nav-system"><span>◆</span><b>System</b><i>⌄</i></button>
            <div class="nav-sub is-open" id="nav-system">
              <button class="nav-link is-active" type="button" data-page="overview">Übersicht</button>
              <button class="nav-link" type="button" data-page="streamPc">Stream-PC</button>
              <button class="nav-link" type="button" disabled>Diagnose</button>
            </div>
            <button class="nav-group" type="button" data-target="nav-modules"><span>◇</span><b>Module</b><i>⌄</i></button>
            <div class="nav-sub" id="nav-modules"><button class="nav-link" type="button" disabled>Modulübersicht</button></div>
            <button class="nav-group" type="button" data-target="nav-admin"><span>⚙</span><b>Admin</b><i>⌄</i></button>
            <div class="nav-sub" id="nav-admin"><button class="nav-link" type="button" disabled>Benutzerverwaltung</button><button class="nav-link" type="button" disabled>Admin-Notizen</button><button class="nav-link" type="button" disabled>Verbindungen</button></div>
          </nav>
          <div class="sidebar-foot"><span>ForrestCGN</span><strong>Modboard</strong></div>
        </aside>
        <div class="cgn-scrim"></div>
        <main class="cgn-content" id="content"></main>
      </div>`;
    $('#navToggle').addEventListener('click', () => document.body.classList.toggle('nav-collapsed'));
    document.querySelectorAll('.nav-group').forEach(btn => btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      const isOpen = btn.classList.toggle('is-open');
      if (target) target.classList.toggle('is-open', isOpen);
    }));
    document.querySelectorAll('.nav-link[data-page]').forEach(btn => btn.addEventListener('click', () => setPage(btn.dataset.page)));
    window.addEventListener('scroll', updateScrolledState, { passive: true });
    updateScrolledState();
    renderTopbarStatus();
  }

  function updateScrolledState() {
    document.body.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  function setPage(page) {
    state.page = page;
    const meta = routes[page] || routes.overview;
    $('#sectionLabel').textContent = meta.section;
    $('#pageTitle').textContent = meta.title;
    $('#tabLabel').textContent = meta.tab;
    document.querySelectorAll('.nav-link[data-page]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.page === page));
    renderPage();
  }

  function renderTopbarStatus() {
    const serverOk = state.server?.ok === true;
    const streamLive = state.stream?.live === true;
    const wsClients = Number(state.ws?.clients ?? state.server?.wsClients ?? 0);
    $('#quickChips').innerHTML = [
      chip(serverOk ? 'v0.2.10C lokal' : 'lokal lädt', serverOk ? 'ok' : 'warn'),
      chip('Port 8080', 'info'),
      chip('Read-only', 'ok'),
      chip(streamLive ? 'Stream live' : 'Streamstatus Cache', streamLive ? 'ok' : 'info'),
      chip(`${wsClients} WS-Clients`, 'info')
    ].join('');
    $('#lastUpdatedText').textContent = `Aktualisiert: ${new Date().toLocaleString('de-DE')}`;
  }

  function renderPage() {
    if (state.page === 'streamPc') return renderStreamPc();
    return renderOverview();
  }

  function renderOverview() {
    const serverOk = state.server?.ok === true;
    const login = 'Lokal';
    const session = 'Read-only';
    const editing = 'Geschützt';
    $('#content').innerHTML = html`
      <section class="page-header module-page-header cgn-card"><p class="cgn-eyebrow">Remote Modboard</p><h1>Übersicht</h1><p>Alles Wichtige auf einen Blick: lokaler Server, Stream-PC Status und sichere Read-only-Grenzen.</p></section>
      <section class="metric-grid">
        ${metric('Server', serverOk ? 'Online' : 'Unbekannt', serverOk ? 'Lokaler Node/Express' : 'Status lädt oder API nicht erreichbar', serverOk ? 92 : 45)}
        ${metric('Login', login, 'Lokaler Zugriff geplant', 72)}
        ${metric('Session', session, 'keine Schreibrechte in dieser Ansicht', 84)}
        ${metric('Bearbeiten', editing, 'keine Actions / keine Writes', 8, true)}
      </section>
      <section class="page-grid">
        <article class="cgn-card activity-card"><div class="card-head"><div><p class="cgn-eyebrow">Aktivitäten</p><h2>Letzte Änderungen</h2></div>${chip('bald','info')}</div><div class="activity-row"><div class="activity-icon">📋</div><div><b>Verlauf wird hier sichtbar</b><small>Produktive Historie bleibt später an Rechte, Audit und sichere Reads gebunden.</small></div></div></article>
        <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Schnellzugriff</p><h2>Wichtige Bereiche</h2></div>${chip('bereit','ok')}</div><div class="quick-list"><div class="quick-row"><div class="quick-icon cyan">🖥</div><div><b>Stream-PC</b><small>Status lesen, keine Steuerung auslösen.</small></div></div><div class="quick-row"><div class="quick-icon purple">🧩</div><div><b>Module</b><small>Modulübersicht ist der nächste geplante Read-only Schritt.</small></div></div><div class="quick-row"><div class="quick-icon green">🛡</div><div><b>Sicherheit</b><small>Keine OBS-, Sound-, Overlay-, Command- oder Prozessaktionen.</small></div></div></div></article>
      </section>
      ${state.errors.length ? `<section class="error-note">${state.errors.map(esc).join('<br>')}</section>` : ''}
      <footer class="footer"><span>Auto-Refresh: aus</span><span>0.2.10C · lokal/read-only</span></footer>`;
  }

  function renderStreamPc() {
    const server = state.server || {};
    const stream = state.stream || {};
    const ws = state.ws || {};
    const loadedModules = Array.isArray(server.loadedModules) ? server.loadedModules : [];
    $('#content').innerHTML = html`
      <section class="page-header module-page-header cgn-card"><p class="cgn-eyebrow">System</p><h1>Stream-PC</h1><p>Lokaler Status aus bestehenden sicheren GET-Routen. Diese Seite liest nur und löst keine Aktionen aus.</p></section>
      <section class="metric-grid">
        ${metric('Server', server.ok ? 'Online' : 'Unbekannt', `Port ${server.port ?? 8080}`, server.ok ? 92 : 45)}
        ${metric('Module', String(loadedModules.length || '—'), 'geladene lokale Module', loadedModules.length ? 78 : 34)}
        ${metric('WebSocket', `${ws.clients ?? server.wsClients ?? 0} Clients`, 'nur Anzeige', 64)}
        ${metric('Stream', stream.live ? 'Live' : stream.statusKnown === false ? 'Unbekannt' : 'Offline/Cache', stream.stale ? 'Cache veraltet' : 'gecacheter Status', stream.live ? 94 : 50, Boolean(stream.stale))}
      </section>
      <section class="status-grid">
        <article class="cgn-card"><p class="cgn-eyebrow">Server</p><h2>Lokaler Node/Express</h2><div class="kv-list"><div class="kv-row"><span>Host</span><strong>${esc(server.host)}</strong></div><div class="kv-row"><span>Port</span><strong>${esc(server.port ?? 8080)}</strong></div><div class="kv-row"><span>Version</span><strong>${esc(server.serverVersion)}</strong></div><div class="kv-row"><span>Module</span><strong>${esc(loadedModules.join(', ') || '—')}</strong></div></div></article>
        <article class="cgn-card"><p class="cgn-eyebrow">Streamstatus</p><h2>Cache</h2><div class="kv-list"><div class="kv-row"><span>Live</span><strong>${stream.live === true ? 'ja' : stream.live === false ? 'nein' : 'unbekannt'}</strong></div><div class="kv-row"><span>Titel</span><strong>${esc(stream.title)}</strong></div><div class="kv-row"><span>Game</span><strong>${esc(stream.gameName)}</strong></div><div class="kv-row"><span>Quelle</span><strong>${esc(stream.source)}</strong></div><div class="kv-row"><span>Geprüft</span><strong>${esc(stream.lastCheckedAt)}</strong></div></div></article>
        <article class="cgn-card"><p class="cgn-eyebrow">WebSocket</p><h2>Verbindungen</h2><div class="kv-list"><div class="kv-row"><span>Clients</span><strong>${esc(ws.clients ?? server.wsClients ?? 0)}</strong></div><div class="kv-row"><span>Zeit</span><strong>${esc(ws.isoTs || ws.ts)}</strong></div><div class="kv-row"><span>Status</span><strong>nur Anzeige</strong></div></div></article>
        <article class="cgn-card"><p class="cgn-eyebrow">Sicherheitsgrenze</p><h2>Nicht freigegeben</h2><ul class="plain-list"><li><span>○</span>keine OBS- oder Overlay-Steuerung</li><li><span>○</span>keine Sound- oder Media-Aktionen</li><li><span>○</span>keine Commands oder Prozessaktionen</li><li><span>○</span>keine Refresh-, Test-, Log-, Session- oder Schreibroute</li></ul></article>
      </section>
      ${state.errors.length ? `<section class="error-note">${state.errors.map(esc).join('<br>')}</section>` : ''}
      <footer class="footer"><span>Gelesen: /api/_status · /api/stream-status/current · /api/diag/ws</span><span>keine Actions</span></footer>`;
  }

  renderShell();
  setPage('overview');
  loadReadOnlyStatus();
})();
