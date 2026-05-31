(function () {
  'use strict';

  const state = {
    loading: false,
    data: null,
    obsStatus: null,
    obsSources: [],
    obsError: '',
    error: '',
    filter: 'all',
    tab: 'overview',
    autoRefresh: true,
    timer: null,
    lastLoadedAt: ''
  };

  const API_STATUS = '/api/overlay-monitor/status?events=10';
  const API_OBS_STATUS = '/api/obs/status';
  const API_OBS_BROWSER_SOURCES = '/api/obs/browser-sources';
  const AUTO_REFRESH_MS = 5000;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function panel() {
    return document.getElementById('overlaysModule');
  }

  function api(path, options) {
    if (window.CGN?.api) return window.CGN.api(path, options);
    return fetch(path, options).then(r => r.json());
  }

  function statusClass(status) {
    const s = String(status || 'unknown').toLowerCase();
    if (s === 'online' || s === 'ok' || s === 'connected') return 'ok';
    if (s === 'stale' || s === 'warning' || s === 'warn') return 'warn';
    if (s === 'offline' || s === 'dead' || s === 'error' || s === 'bad' || s === 'disconnected') return 'bad';
    return 'muted';
  }

  function fmtTime(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function fmtDateTime(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'medium' });
  }

  function fmtAge(seconds) {
    const n = Number(seconds);
    if (!Number.isFinite(n)) return '—';
    if (n < 60) return `${Math.max(0, Math.round(n))}s`;
    const min = Math.floor(n / 60);
    const sec = Math.round(n % 60);
    if (min < 60) return `${min}m ${sec}s`;
    const h = Math.floor(min / 60);
    return `${h}h ${min % 60}m`;
  }

  function shortText(value, max = 90) {
    const text = String(value || '').trim();
    if (!text) return '—';
    if (text.length <= max) return text;
    return `${text.slice(0, Math.max(1, max - 1))}…`;
  }

  function lastContact(overlay) {
    return overlay.lastHeartbeatAt || overlay.lastSeenAt || overlay.connectedAt || overlay.registeredAt || '';
  }

  function obsConnected() {
    const obs = state.obsStatus || {};
    return obs.connected === true || obs.ok === true && (obs.connected !== false && obs.obsConnected !== false);
  }

  function normalizeObsSources(raw) {
    if (!raw || typeof raw !== 'object') return [];
    const candidates = [
      raw.browserSources,
      raw.sources,
      raw.inputs,
      raw.data,
      raw.items
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }
    return [];
  }

  function filteredOverlays() {
    const overlays = Array.isArray(state.data?.overlays) ? state.data.overlays : [];
    if (state.filter === 'all') return overlays;
    if (state.filter === 'problem') return overlays.filter(o => !['online'].includes(String(o.status || '').toLowerCase()));
    return overlays.filter(o => String(o.status || '').toLowerCase() === state.filter);
  }

  function problemCount() {
    return Array.isArray(state.data?.issues) ? state.data.issues.length : 0;
  }

  function renderSummaryCards() {
    const s = state.data?.summary || {};
    const c = state.data?.communication || {};
    const obsOk = obsConnected();
    const rows = [
      ['Bus-Overlays', s.total ?? 0, ''],
      ['Bus online', s.online ?? 0, 'ok'],
      ['Stale', s.stale ?? 0, 'warn'],
      ['Offline/Dead', (s.offline ?? 0) + (s.dead ?? 0), 'bad'],
      ['OBS', obsOk ? 'verbunden' : 'offline', obsOk ? 'ok' : 'warn'],
      ['OBS Quellen', state.obsSources.length, '']
    ];

    return `
      <div class="ovm-summary-grid">
        ${rows.map(([label, value, cls]) => `
          <div class="ovm-summary-card ${cls ? `is-${cls}` : ''}">
            <span>${esc(label)}</span>
            <strong>${esc(value)}</strong>
          </div>
        `).join('')}
      </div>
      <div class="ovm-meta-line">
        <span>Communication Bus: <strong>${c.available ? 'verfügbar' : 'nicht verfügbar'}</strong></span>
        <span>Bus-Clients gesamt: <strong>${esc(c.clientCount ?? 0)}</strong></span>
        <span>Overlay-Monitor: <strong>${esc(state.data?.version || '—')}</strong></span>
        <span>Letzter Scan: <strong>${esc(fmtDateTime(state.data?.lastScanAt))}</strong></span>
        <span>Console-Logs unterdrückt: <strong>${esc(state.data?.stats?.consoleLogsSuppressed ?? 0)}</strong></span>
      </div>
    `;
  }

  function renderTabs() {
    const tabs = [
      ['overview', 'Übersicht'],
      ['bus', 'Bus-Clients'],
      ['obs', 'OBS-Quellen'],
      ['issues', `Probleme${problemCount() ? ` (${problemCount()})` : ''}`],
      ['raw', 'Rohdaten']
    ];
    return `
      <div class="ovm-tabs" role="tablist" aria-label="Overlay-Monitor Bereiche">
        ${tabs.map(([key, label]) => `<button type="button" class="ovm-tab ${state.tab === key ? 'active' : ''}" data-ovm-tab="${esc(key)}">${esc(label)}</button>`).join('')}
      </div>
    `;
  }

  function renderToolbar() {
    const filters = [
      ['all', 'Alle'],
      ['online', 'Online'],
      ['stale', 'Stale'],
      ['offline', 'Offline'],
      ['dead', 'Dead'],
      ['problem', 'Probleme']
    ];
    return `
      <div class="ovm-toolbar">
        <div class="ovm-filters" role="tablist" aria-label="Overlay-Filter">
          ${filters.map(([key, label]) => `<button type="button" class="ovm-filter ${state.filter === key ? 'active' : ''}" data-ovm-filter="${esc(key)}">${esc(label)}</button>`).join('')}
        </div>
        <div class="ovm-actions">
          <label class="ovm-toggle"><input type="checkbox" data-ovm-auto ${state.autoRefresh ? 'checked' : ''}> Auto-Refresh</label>
          <button type="button" class="ovm-btn" data-ovm-refresh>Aktualisieren</button>
        </div>
      </div>
    `;
  }

  function renderOverview() {
    const s = state.data?.summary || {};
    const issues = Array.isArray(state.data?.issues) ? state.data.issues : [];
    const obsOk = obsConnected();
    const busOnlineButObsOffline = !obsOk && Number(s.online || 0) > 0;
    return `
      <section class="ovm-card">
        <h3>Gesamtbewertung</h3>
        <div class="ovm-overview-grid">
          <div class="ovm-status-box is-${statusClass(state.data?.summary?.status)}">
            <span>Bus-Overlay-Status</span>
            <strong>${esc(state.data?.summary?.status || 'unbekannt')}</strong>
            <small>Aktuell basiert diese Seite auf Bus- und OBS-Read-only-Daten. Mapping folgt später.</small>
          </div>
          <div class="ovm-status-box is-${obsOk ? 'ok' : 'warn'}">
            <span>OBS-Verbindung</span>
            <strong>${obsOk ? 'verbunden' : 'offline / unbekannt'}</strong>
            <small>${esc(state.obsError || 'OBS-Status wird nur gelesen, nicht verändert.')}</small>
          </div>
          <div class="ovm-status-box is-${issues.length ? 'warn' : 'ok'}">
            <span>Hinweise</span>
            <strong>${esc(issues.length)}</strong>
            <small>${issues.length ? 'Details im Tab Probleme.' : 'Keine aktiven Overlay-Probleme gemeldet.'}</small>
          </div>
        </div>
        ${busOnlineButObsOffline ? `<div class="ovm-warning-line">Bus-Clients melden sich aktiv, obwohl OBS offline/unbekannt ist. Das ist aktuell kein Beweis für eine laufende OBS-Quelle.</div>` : ''}
      </section>
      <section class="ovm-card">
        <h3>Kritische nächste Baustellen</h3>
        <div class="ovm-next-grid">
          <div><strong>Hello ≠ Heartbeat</strong><span>Der Bus muss echte Heartbeats sauberer von bloßer Anmeldung trennen.</span></div>
          <div><strong>OBS ↔ Bus Mapping</strong><span>OBS-Quellen und Bus-Client-IDs brauchen später eine Zuordnung.</span></div>
          <div><strong>Wartende Overlays</strong><span>Alerts, Sound, VIP, Deathcounter usw. müssen als bereit statt sichtbar bewertet werden.</span></div>
        </div>
      </section>
    `;
  }

  function renderBusClients() {
    const overlays = filteredOverlays();
    if (!overlays.length) {
      return `
        <div class="ovm-empty">
          <strong>Keine passenden Overlay-Clients gefunden.</strong>
          <span>Ein Overlay erscheint hier, sobald es sich per Bus als Overlay-Client registriert.</span>
        </div>
      `;
    }

    return `
      ${renderToolbar()}
      <div class="ovm-table-wrap">
        <table class="ovm-table">
          <thead>
            <tr>
              <th>Overlay</th>
              <th>Status</th>
              <th>Verbunden</th>
              <th>Heartbeat</th>
              <th>Letzter Kontakt</th>
              <th>Modul / Version</th>
              <th>Capabilities</th>
              <th>Grund / Fehler</th>
            </tr>
          </thead>
          <tbody>
            ${overlays.map(overlay => {
              const status = String(overlay.status || 'unknown').toLowerCase();
              const caps = Array.isArray(overlay.capabilities) ? overlay.capabilities : [];
              const reason = overlay.disconnectReason || overlay.lastErrorAt || '';
              return `
                <tr>
                  <td>
                    <strong>${esc(overlay.name || overlay.id || 'Overlay')}</strong>
                    <small>${esc(overlay.id || '—')}</small>
                    <small>Mode: ${esc(overlay.mode || '—')}</small>
                  </td>
                  <td><span class="ovm-badge is-${statusClass(status)}">${esc(status)}</span></td>
                  <td>${overlay.connected ? '<span class="ovm-badge is-ok">ja</span>' : '<span class="ovm-badge is-muted">nein</span>'}</td>
                  <td><strong>${esc(fmtTime(overlay.lastHeartbeatAt))}</strong><small>${esc(fmtAge(overlay.ageSeconds))}</small></td>
                  <td>${esc(fmtDateTime(lastContact(overlay)))}</td>
                  <td><strong>${esc(overlay.module || '—')}</strong><small>${esc(overlay.version || '—')}</small></td>
                  <td>${caps.length ? caps.map(cap => `<span class="ovm-chip">${esc(cap)}</span>`).join('') : '<span class="ovm-muted">—</span>'}</td>
                  <td>${reason ? esc(reason) : '<span class="ovm-muted">—</span>'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderObsSources() {
    const obsOk = obsConnected();
    if (state.obsError && !state.obsSources.length) {
      return `<div class="ovm-error">OBS-Browserquellen konnten nicht gelesen werden: ${esc(state.obsError)}</div>`;
    }
    if (!state.obsSources.length) {
      return `
        <div class="ovm-empty">
          <strong>Keine OBS-Browserquellen gefunden.</strong>
          <span>${obsOk ? 'OBS ist erreichbar, liefert aber keine Browserquellen.' : 'OBS ist offline oder der OBS-Status ist unbekannt.'}</span>
        </div>
      `;
    }

    return `
      <section class="ovm-card">
        <h3>OBS-Browserquellen</h3>
        <p class="ovm-muted">Read-only: Diese Liste kommt aus /api/obs/browser-sources. Es wird nichts ein- oder ausgeblendet.</p>
      </section>
      <div class="ovm-table-wrap">
        <table class="ovm-table">
          <thead>
            <tr>
              <th>Quelle</th>
              <th>Typ</th>
              <th>URL / Datei</th>
              <th>Größe</th>
              <th>FPS</th>
            </tr>
          </thead>
          <tbody>
            ${state.obsSources.map(src => {
              const name = src.inputName || src.sourceName || src.name || 'OBS Browser Source';
              const kind = src.inputKind || src.unversionedInputKind || src.kind || 'browser_source';
              const url = src.url || src.local_file || src.file || src.path || '';
              const local = src.is_local_file === true || !!src.local_file;
              return `
                <tr>
                  <td><strong>${esc(name)}</strong></td>
                  <td><span class="ovm-badge is-muted">${esc(kind)}</span></td>
                  <td><span title="${esc(url)}">${esc(shortText(url, 120))}</span><small>${local ? 'lokale Datei' : 'URL'}</small></td>
                  <td>${esc(src.width || '—')} × ${esc(src.height || '—')}</td>
                  <td>${esc(src.fps || '—')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderIssues() {
    const issues = Array.isArray(state.data?.issues) ? state.data.issues : [];
    if (!issues.length) return '<div class="ovm-ok-note">Keine Overlay-Probleme gemeldet.</div>';
    return `
      <div class="ovm-issues">
        ${issues.map(issue => `
          <div class="ovm-issue is-${issue.level === 'warn' ? 'warn' : 'bad'}">
            <div>
              <strong>${esc(issue.overlayId || issue.key || 'Overlay')}</strong>
              <span>${esc(issue.message || issue.status || 'Problem')}</span>
            </div>
            <span class="ovm-badge is-${issue.level === 'warn' ? 'warn' : 'bad'}">${esc(issue.status || issue.level || 'problem')}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderRaw() {
    const raw = {
      overlayMonitor: state.data,
      obsStatus: state.obsStatus,
      obsSources: state.obsSources,
      obsError: state.obsError
    };
    return `
      <section class="ovm-card">
        <h3>Rohdaten</h3>
        <p class="ovm-muted">Nur zur Diagnose. Später kann das bei Bedarf weiter aufgeteilt werden.</p>
        <pre class="ovm-raw">${esc(JSON.stringify(raw, null, 2))}</pre>
      </section>
    `;
  }

  function renderTabContent() {
    if (state.tab === 'bus') return renderBusClients();
    if (state.tab === 'obs') return renderObsSources();
    if (state.tab === 'issues') return `<section class="ovm-card"><h3>Aktuelle Hinweise</h3>${renderIssues()}</section>`;
    if (state.tab === 'raw') return renderRaw();
    return renderOverview();
  }

  function render() {
    const root = panel();
    if (!root) return;

    if (state.loading && !state.data) {
      root.innerHTML = '<div class="ovm-shell"><div class="ovm-card">Overlay-Monitor wird geladen…</div></div>';
      return;
    }

    if (state.error && !state.data) {
      root.innerHTML = `
        <div class="ovm-shell">
          <div class="ovm-head"><div><span class="ovm-kicker">Control / Overlays</span><h2>Overlay-Monitor</h2></div><button class="ovm-btn" data-ovm-refresh>Erneut laden</button></div>
          <div class="ovm-error">${esc(state.error)}</div>
        </div>
      `;
      bind(root);
      return;
    }

    root.innerHTML = `
      <div class="ovm-shell">
        <div class="ovm-head">
          <div>
            <span class="ovm-kicker">Control / Overlays</span>
            <h2>Overlay-Monitor</h2>
            <p>Read-only Übersicht. Bus-Clients und OBS-Browserquellen werden getrennt angezeigt; Aktionen, Mapping und Automatik folgen später.</p>
          </div>
          <div class="ovm-head-meta">
            <span>Stand: ${esc(fmtDateTime(state.lastLoadedAt || state.data?.fetchedAt))}</span>
            ${state.error ? `<span class="ovm-warn-text">Monitor-Fehler: ${esc(state.error)}</span>` : ''}
            ${state.obsError ? `<span class="ovm-warn-text">OBS-Hinweis: ${esc(state.obsError)}</span>` : ''}
          </div>
        </div>
        ${renderSummaryCards()}
        ${renderTabs()}
        ${renderTabContent()}
      </div>
    `;
    bind(root);
  }

  function bind(root) {
    root.querySelectorAll('[data-ovm-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.tab = btn.dataset.ovmTab || 'overview';
        render();
      });
    });
    root.querySelectorAll('[data-ovm-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.filter = btn.dataset.ovmFilter || 'all';
        render();
      });
    });
    root.querySelector('[data-ovm-refresh]')?.addEventListener('click', () => loadAll(true));
    root.querySelector('[data-ovm-auto]')?.addEventListener('change', event => {
      state.autoRefresh = !!event.target.checked;
      setupTimer();
    });
  }

  async function loadAll(force = false) {
    if (state.loading && !force) return;
    state.loading = true;
    state.error = '';
    state.obsError = '';
    render();
    try {
      const [monitorResult, obsStatusResult, obsSourcesResult] = await Promise.allSettled([
        api(API_STATUS),
        api(API_OBS_STATUS),
        api(API_OBS_BROWSER_SOURCES)
      ]);

      if (monitorResult.status === 'fulfilled') {
        state.data = monitorResult.value;
      } else {
        state.error = monitorResult.reason?.message || String(monitorResult.reason || 'Overlay-Monitor konnte nicht geladen werden.');
      }

      if (obsStatusResult.status === 'fulfilled') {
        state.obsStatus = obsStatusResult.value;
      } else {
        state.obsStatus = null;
        state.obsError = obsStatusResult.reason?.message || String(obsStatusResult.reason || 'OBS-Status konnte nicht geladen werden.');
      }

      if (obsSourcesResult.status === 'fulfilled') {
        state.obsSources = normalizeObsSources(obsSourcesResult.value);
      } else {
        state.obsSources = [];
        state.obsError = state.obsError || obsSourcesResult.reason?.message || String(obsSourcesResult.reason || 'OBS-Browserquellen konnten nicht geladen werden.');
      }

      state.lastLoadedAt = new Date().toISOString();
    } catch (err) {
      state.error = err?.message || String(err || 'Overlay-Monitor konnte nicht geladen werden.');
    } finally {
      state.loading = false;
      render();
    }
  }

  function setupTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    if (!state.autoRefresh) return;
    state.timer = setInterval(() => {
      if (window.CGN?.activeModule === 'overlays') loadAll(false);
    }, AUTO_REFRESH_MS);
  }

  window.addEventListener('cgn:module-show', event => {
    if (event?.detail?.module === 'overlays') {
      loadAll(true);
      setupTimer();
    }
  });

  window.OverlaysModule = { loadAll, render };
  setupTimer();
})();
