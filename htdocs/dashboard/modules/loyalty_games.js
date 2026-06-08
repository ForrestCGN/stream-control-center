window.LoyaltyGamesModule = (function(){
  'use strict';

  const api = {
    status: '/api/loyalty/games/status',
    config: '/api/loyalty/games/config',
    routes: '/api/loyalty/games/routes',
    sessions: '/api/loyalty/games/sessions?gameKey=wheel&limit=50',
    wheelStatus: '/api/loyalty/games/wheel/status',
    wheelConfig: '/api/loyalty/games/wheel/config',
    overlay: '/overlays/loyalty/wheel_overlay.html'
  };

  let root = null;
  let state = {
    loading: false,
    error: '',
    status: null,
    config: null,
    routes: null,
    sessions: null,
    wheelStatus: null,
    wheelConfig: null
  };

  function esc(v){
    return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function rows(value){
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.rows)) return value.rows;
    if (Array.isArray(value?.data?.rows)) return value.data.rows;
    if (Array.isArray(value?.sessions)) return value.sessions;
    return [];
  }

  function fmtDate(value){
    if (!value) return '<span class="lg-muted">-</span>';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return esc(value);
    return esc(d.toLocaleString('de-DE'));
  }

  function fmtNumber(value){
    const n = Number(value || 0);
    return Number.isFinite(n) ? n.toLocaleString('de-DE') : '0';
  }

  function badge(value, okText = 'OK', failText = 'Aus'){
    return value
      ? `<span class="lg-badge lg-badge-ok">${esc(okText)}</span>`
      : `<span class="lg-badge lg-badge-off">${esc(failText)}</span>`;
  }

  function registerDashboardModule(){
    if (!window.CGN) return;

    window.CGN.modules.loyalty_games = {
      title: 'Loyalty Games',
      panelId: 'loyaltyGamesModule',
      group: 'community',
      overlayLink: api.overlay,
      overlayLabel: 'Glücksrad-Overlay öffnen',
      reload(){ return window.LoyaltyGamesModule?.loadAll?.(true); }
    };

    window.CGN.moduleCatalog.loyalty_games = {
      label: 'Loyalty Games',
      icon: '🎡',
      enabled: true,
      description: 'Spiele im Loyalty-System, aktuell Glücksrad.'
    };

    const community = window.CGN.sections?.community;
    if (community && Array.isArray(community.items) && !community.items.includes('loyalty_games')) {
      const loyaltyIdx = community.items.indexOf('loyalty');
      const commandsIdx = community.items.indexOf('commands');
      if (loyaltyIdx >= 0) community.items.splice(loyaltyIdx + 1, 0, 'loyalty_games');
      else if (commandsIdx >= 0) community.items.splice(commandsIdx, 0, 'loyalty_games');
      else community.items.push('loyalty_games');
    }

    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('loyalty_games')) {
      const loyaltyIdx = window.CGN.favorites.indexOf('loyalty');
      if (loyaltyIdx >= 0) window.CGN.favorites.splice(loyaltyIdx + 1, 0, 'loyalty_games');
    }

    window.SectionHomeModule?.render?.();
  }

  async function loadAll(force){
    root = document.getElementById('loyaltyGamesModule');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.wheelStatus) { render(); return; }

    state.loading = true;
    state.error = '';
    render();

    try {
      const [status, config, routes, sessions, wheelStatus, wheelConfig] = await Promise.all([
        window.CGN.api(api.status).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.config).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.routes).catch(err => ({ ok:false, error:err.message, routes:[] })),
        window.CGN.api(api.sessions).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.wheelStatus).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.wheelConfig).catch(err => ({ ok:false, error:err.message }))
      ]);

      state = { ...state, loading:false, error:'', status, config, routes, sessions, wheelStatus, wheelConfig };
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }

    render();
  }

  function renderOverview(){
    const status = state.status || {};
    const diag = status.diagnostics || {};
    const wheel = state.wheelStatus || status.games?.wheel || {};
    const db = diag.database || {};
    const counts = diag.counts || {};

    return `
      <div class="lg-grid lg-grid-4">
        <article class="lg-card">
          <span class="lg-card-label">Modul</span>
          <strong>${esc(status.module || 'loyalty_games')}</strong>
          <small>Version ${esc(status.moduleVersion || status.version || '-')}</small>
          ${badge(status.ok !== false && !status.lastError, 'OK', 'Fehler')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Glücksrad</span>
          <strong>${wheel.running ? 'Dreht gerade' : 'Bereit'}</strong>
          <small>${wheel.enabled === false ? 'deaktiviert' : 'aktiv'} · ${fmtNumber(wheel.fields || 0)} Felder</small>
          ${badge(wheel.enabled !== false, 'Aktiv', 'Aus')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Datenbank</span>
          <strong>${esc(db.adapter || 'sqlite')}</strong>
          <small>${esc(db.path || db.dialect || '-')}</small>
          ${badge(db.ok !== false, 'OK', 'Fehler')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Sessions</span>
          <strong>${fmtNumber(counts.total || rows(state.sessions).length)}</strong>
          <small>running ${fmtNumber(counts.running || 0)} · finished ${fmtNumber(counts.finished || 0)}</small>
          ${badge(true, 'History')}
        </article>
      </div>
      <div class="lg-panel">
        <h3>Status</h3>
        <div class="lg-kv">
          <span>Enabled</span><strong>${esc(String(status.enabled ?? '-'))}</strong>
          <span>RouteCount</span><strong>${fmtNumber(status.routeCount || 0)}</strong>
          <span>SchemaReady</span><strong>${esc(String(diag.schemaReady ?? '-'))}</strong>
          <span>LastError</span><strong>${status.lastError ? esc(status.lastError) : '<span class="lg-muted">leer</span>'}</strong>
        </div>
      </div>
    `;
  }

  function renderWheel(){
    const wheel = state.wheelStatus || {};
    const active = wheel.activeSession || null;
    const last = wheel.lastResult || null;
    return `
      <div class="lg-grid lg-grid-3">
        <article class="lg-card">
          <span class="lg-card-label">Wheel Status</span>
          <strong>${wheel.running ? 'Running' : 'Idle'}</strong>
          <small>${wheel.enabled === false ? 'deaktiviert' : 'aktiv'}</small>
          ${badge(wheel.enabled !== false, 'Aktiv', 'Aus')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Kosten</span>
          <strong>${wheel.costEnabled ? fmtNumber(wheel.costAmount) : '0'}</strong>
          <small>LWG-3 read-only · keine Abbuchung</small>
          ${badge(!wheel.costEnabled, 'Kosten aus', 'Kosten an')}
        </article>
        <article class="lg-card">
          <span class="lg-card-label">Overlay</span>
          <strong>Glücksrad</strong>
          <small><a href="${api.overlay}" target="_blank">Overlay öffnen</a></small>
          ${badge(true, 'WS')}
        </article>
      </div>
      <div class="lg-panel">
        <h3>Aktive Session</h3>
        ${active ? `
          <div class="lg-kv">
            <span>Session</span><strong>${esc(active.sessionUid || '-')}</strong>
            <span>Gewinn</span><strong>${esc(active.selectedFieldLabel || '-')}</strong>
            <span>Dauer</span><strong>${fmtNumber(active.durationMs)} ms</strong>
            <span>Ende</span><strong>${fmtDate(active.endsAt)}</strong>
          </div>
        ` : `<p class="lg-muted">Keine aktive Session.</p>`}
      </div>
      <div class="lg-panel">
        <h3>Letztes Ergebnis</h3>
        ${last ? `
          <div class="lg-kv">
            <span>Session</span><strong>${esc(last.sessionUid || '-')}</strong>
            <span>Field ID</span><strong>${esc(last.selectedFieldId || '-')}</strong>
            <span>Label</span><strong>${esc(last.selectedFieldLabel || '-')}</strong>
            <span>Beendet</span><strong>${fmtDate(last.finishedAt)}</strong>
          </div>
        ` : `<p class="lg-muted">Noch kein Ergebnis im Runtime-State vorhanden.</p>`}
      </div>
    `;
  }

  function renderFields(){
    const fields = rows(state.wheelConfig?.config?.fields || state.config?.config?.games?.wheel?.fields || []);
    const totalWeight = fields.reduce((sum, f) => sum + Number(f.weight || 0), 0);
    return `
      <div class="lg-panel">
        <h3>Felder <span class="lg-muted">(${fmtNumber(fields.length)} / Gewicht gesamt ${fmtNumber(totalWeight)})</span></h3>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>#</th><th>ID</th><th>Label</th><th>Sub</th><th>Gewicht</th><th>Reward</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${fields.map((field, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><code>${esc(field.id || '')}</code></td>
                  <td><strong>${esc(field.label || '')}</strong></td>
                  <td>${esc(field.sub || '')}</td>
                  <td>${fmtNumber(field.weight || 0)}</td>
                  <td>${esc(field.reward?.type || 'none')} ${field.reward?.amount ? `(${fmtNumber(field.reward.amount)})` : ''}</td>
                  <td>${field.enabled === false ? badge(false, 'Aktiv', 'Aus') : badge(true, 'Aktiv')}</td>
                </tr>
              `).join('') || `<tr><td colspan="7" class="lg-muted">Keine Felder gefunden.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSessions(){
    const list = rows(state.sessions);
    return `
      <div class="lg-panel">
        <h3>Letzte Sessions</h3>
        <div class="lg-table-wrap">
          <table class="lg-table">
            <thead>
              <tr>
                <th>Zeit</th><th>User</th><th>Status</th><th>Gewinn</th><th>Dauer</th><th>Source</th><th>Session</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(row => `
                <tr>
                  <td>${fmtDate(row.createdAt || row.startedAt)}</td>
                  <td>${esc(row.displayName || row.login || '-')}</td>
                  <td>${esc(row.status || '-')}</td>
                  <td><strong>${esc(row.selectedFieldLabel || '-')}</strong></td>
                  <td>${fmtNumber(row.durationMs || 0)} ms</td>
                  <td>${esc(row.source || '-')}</td>
                  <td><code title="${esc(row.sessionUid || '')}">${esc(String(row.sessionUid || '').slice(0, 24))}</code></td>
                </tr>
              `).join('') || `<tr><td colspan="7" class="lg-muted">Keine Sessions gefunden.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderNotes(){
    const routes = Array.isArray(state.routes?.routes) ? state.routes.routes : [];
    return `
      <div class="lg-panel">
        <h3>Hinweise</h3>
        <ul class="lg-notes">
          <li>LWG-3 ist read-only. Es wird keine Config geschrieben.</li>
          <li>Punktkosten sind vorbereitet, aber nicht produktiv aktiv.</li>
          <li>Rewards sind vorbereitet, aber werden noch nicht ausgeführt.</li>
          <li>Das Glücksrad entscheidet den Gewinn im Backend, nicht im Overlay.</li>
          <li>Das Dashboard wird später ohnehin größer umgebaut; dieser Stand bleibt bewusst schlank.</li>
        </ul>
      </div>
      <div class="lg-panel">
        <h3>Routen</h3>
        <div class="lg-route-list">
          ${routes.map(route => `<code>${esc(route)}</code>`).join('') || '<span class="lg-muted">Keine Routen geladen.</span>'}
        </div>
      </div>
    `;
  }

  function render(){
    root = document.getElementById('loyaltyGamesModule');
    if (!root) return;

    if (state.loading) {
      root.innerHTML = `<div class="lg-panel"><h2>Loyalty Games</h2><p class="lg-muted">Lade Daten...</p></div>`;
      return;
    }

    if (state.error) {
      root.innerHTML = `<div class="lg-panel lg-error"><h2>Loyalty Games</h2><p>${esc(state.error)}</p><button data-lg-reload>Neu laden</button></div>`;
      root.querySelector('[data-lg-reload]')?.addEventListener('click', () => loadAll(true));
      return;
    }

    root.innerHTML = `
      <div class="lg-head">
        <div>
          <p class="lg-eyebrow">Community / Loyalty</p>
          <h2>Loyalty Games</h2>
          <p class="lg-subline">Read-only Übersicht für Spiele im Loyalty-System. Aktuell: CGN Glücksrad.</p>
        </div>
        <div class="lg-actions">
          <a class="lg-btn lg-btn-secondary" href="${api.overlay}" target="_blank">Overlay öffnen</a>
          <button class="lg-btn" data-lg-reload>Reload</button>
        </div>
      </div>
      ${renderOverview()}
      ${renderWheel()}
      ${renderFields()}
      ${renderSessions()}
      ${renderNotes()}
    `;

    root.querySelector('[data-lg-reload]')?.addEventListener('click', () => loadAll(true));
  }

  window.addEventListener('cgn:module-show', event => {
    if (event.detail?.module === 'loyalty_games') loadAll();
  });

  registerDashboardModule();

  return {
    loadAll,
    render
  };
})();
