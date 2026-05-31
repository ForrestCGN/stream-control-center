(function () {
  'use strict';

  const state = {
    loading: false,
    data: null,
    obsStatus: null,
    browserSources: null,
    obsError: '',
    browserSourcesError: '',
    error: '',
    filter: 'all',
    autoRefresh: true,
    timer: null,
    lastLoadedAt: ''
  };

  const API_STATUS = '/api/overlay-monitor/status?events=10';
  const API_OBS_STATUS = '/api/obs/status';
  const API_OBS_BROWSER_SOURCES = '/api/obs/browser-sources';
  const AUTO_REFRESH_MS = 5000;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function panel() {
    return document.getElementById('overlaysModule');
  }

  function api(path, options) {
    if (window.CGN?.api) return window.CGN.api(path, options);
    return fetch(path, options).then(r => r.json());
  }

  function dataPayload(response) {
    if (!response || typeof response !== 'object') return response;
    return response.data && typeof response.data === 'object' ? response.data : response;
  }

  function statusClass(status) {
    const s = String(status || 'unknown').toLowerCase();
    if (s === 'online' || s === 'connected' || s === 'ok') return 'ok';
    if (s === 'stale' || s === 'warn' || s === 'warning') return 'warn';
    if (s === 'offline' || s === 'dead' || s === 'error' || s === 'bad') return 'bad';
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

  function lastContact(overlay) {
    return overlay.lastHeartbeatAt || overlay.lastSeenAt || overlay.connectedAt || overlay.registeredAt || '';
  }

  function obsConnected() {
    const status = state.obsStatus || {};
    return status.obsConnected === true || status.connected === true;
  }

  function obsDetected() {
    const status = state.obsStatus || {};
    return status.obsDetected === true || status.detected === true || obsConnected();
  }

  function browserSources() {
    const payload = state.browserSources || {};
    if (Array.isArray(payload.browserSources)) return payload.browserSources;
    if (Array.isArray(payload.sources)) return payload.sources;
    if (Array.isArray(payload.inputs)) return payload.inputs;
    return [];
  }

  function sourceUrl(source) {
    return source.url || source.local_file || source.localFile || source.inputSettings?.url || source.inputSettings?.local_file || '';
  }

  function sourceName(source) {
    return source.inputName || source.sourceName || source.name || 'Browserquelle';
  }

  function sourceKind(source) {
    return source.inputKind || source.unversionedInputKind || source.kind || 'browser_source';
  }

  function filteredOverlays() {
    const overlays = Array.isArray(state.data?.overlays) ? state.data.overlays : [];
    if (state.filter === 'all') return overlays;
    if (state.filter === 'problem') return overlays.filter(o => !['online'].includes(String(o.status || '').toLowerCase()));
    return overlays.filter(o => String(o.status || '').toLowerCase() === state.filter);
  }

  function renderSummary() {
    const s = state.data?.summary || {};
    const c = state.data?.communication || {};
    const obsLabel = state.obsError ? 'Fehler' : (obsConnected() ? 'verbunden' : (obsDetected() ? 'erkannt' : 'offline'));
    const obsClass = obsConnected() ? 'ok' : (obsDetected() ? 'warn' : 'bad');
    const browserCount = browserSources().length;
    const rows = [
      ['Bus-Overlays', s.total ?? 0, ''],
      ['Bus online', s.online ?? 0, 'ok'],
      ['Stale', s.stale ?? 0, 'warn'],
      ['Offline/Dead', Number(s.offline ?? 0) + Number(s.dead ?? 0), 'bad'],
      ['OBS', obsLabel, obsClass],
      ['OBS-Browserquellen', browserCount, browserCount ? 'ok' : 'muted']
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
        <span>OBS: <strong>${esc(obsLabel)}</strong></span>
        <span>Letzter Scan: <strong>${esc(fmtDateTime(state.data?.lastScanAt))}</strong></span>
      </div>
      ${!obsConnected() && (s.online || 0) > 0 ? `
        <div class="ovm-warning-box">
          <strong>OBS ist nicht verbunden, aber Bus-Overlay-Clients melden sich.</strong>
          <span>Das bedeutet: Diese Clients leben irgendwo am WebSocket/Bus, sind aber dadurch noch nicht als aktive OBS-Browserquellen bestätigt.</span>
        </div>
      ` : ''}
    `;
  }

  function renderFilters() {
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

  function renderObsStatus() {
    const status = state.obsStatus || {};
    const connected = obsConnected();
    const detected = obsDetected();
    const currentProgram = status.currentProgramSceneName || status.currentScene || '';
    const currentPreview = status.currentPreviewSceneName || '';

    return `
      <section class="ovm-card ovm-obs-card">
        <div class="ovm-section-head">
          <div>
            <h3>OBS Status</h3>
            <p>Read-only. Wird nur zur Einordnung der Overlay-Quellen genutzt.</p>
          </div>
          <span class="ovm-badge is-${connected ? 'ok' : (detected ? 'warn' : 'bad')}">${connected ? 'verbunden' : (detected ? 'erkannt' : 'offline')}</span>
        </div>
        ${state.obsError ? `<div class="ovm-error-inline">${esc(state.obsError)}</div>` : ''}
        <div class="ovm-info-grid">
          <div><span>Program Scene</span><strong>${esc(currentProgram || '—')}</strong></div>
          <div><span>Preview Scene</span><strong>${esc(currentPreview || '—')}</strong></div>
          <div><span>Stream</span><strong>${status.streamActive ? 'aktiv' : 'inaktiv/unklar'}</strong></div>
          <div><span>Aufnahme</span><strong>${status.recordActive ? 'aktiv' : 'inaktiv/unklar'}</strong></div>
        </div>
      </section>
    `;
  }

  function renderBrowserSources() {
    const sources = browserSources();
    if (state.browserSourcesError) {
      return `
        <section class="ovm-card">
          <div class="ovm-section-head"><div><h3>OBS Browserquellen</h3><p>Konnten nicht geladen werden.</p></div></div>
          <div class="ovm-error-inline">${esc(state.browserSourcesError)}</div>
        </section>
      `;
    }

    if (!sources.length) {
      return `
        <section class="ovm-card">
          <div class="ovm-section-head"><div><h3>OBS Browserquellen</h3><p>Noch keine Browserquellen aus OBS gelesen oder OBS ist offline.</p></div></div>
          <div class="ovm-empty compact"><strong>Keine OBS-Browserquellen gefunden.</strong><span>Das ist bei ausgeschaltetem OBS normal.</span></div>
        </section>
      `;
    }

    return `
      <section class="ovm-card">
        <div class="ovm-section-head">
          <div>
            <h3>OBS Browserquellen</h3>
            <p>Alle aktuell von OBS gemeldeten Browserquellen. Noch ohne feste Zuordnung zu Bus-Clients.</p>
          </div>
          <span class="ovm-badge is-ok">${esc(sources.length)} Quellen</span>
        </div>
        <div class="ovm-source-grid">
          ${sources.map(source => {
            const url = sourceUrl(source);
            return `
              <article class="ovm-source-card">
                <strong>${esc(sourceName(source))}</strong>
                <span>${esc(sourceKind(source))}</span>
                <small title="${esc(url)}">${esc(url || 'keine URL/Datei gemeldet')}</small>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderOverlayRows() {
    const overlays = filteredOverlays();
    if (!overlays.length) {
      return `
        <div class="ovm-empty">
          <strong>Keine passenden Overlay-Clients gefunden.</strong>
          <span>Ein Overlay erscheint hier, sobald es sich per Overlay-Bus-Client mit type=overlay, mode=overlay oder id=overlay:* registriert.</span>
        </div>
      `;
    }

    return `
      <div class="ovm-table-wrap">
        <table class="ovm-table">
          <thead>
            <tr>
              <th>Overlay / Bus-Client</th>
              <th>Bus-Status</th>
              <th>Verbunden</th>
              <th>Heartbeat</th>
              <th>Letzter Kontakt</th>
              <th>Modul / Version</th>
              <th>Mode</th>
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
                  </td>
                  <td><span class="ovm-badge is-${statusClass(status)}">${esc(status)}</span>${!obsConnected() && status === 'online' ? '<small class="ovm-warn-text">Bus online, OBS offline</small>' : ''}</td>
                  <td>${overlay.connected ? '<span class="ovm-badge is-ok">ja</span>' : '<span class="ovm-badge is-muted">nein</span>'}</td>
                  <td><strong>${esc(fmtTime(overlay.lastHeartbeatAt))}</strong><small>${esc(fmtAge(overlay.ageSeconds))}</small></td>
                  <td>${esc(fmtDateTime(lastContact(overlay)))}</td>
                  <td><strong>${esc(overlay.module || '—')}</strong><small>${esc(overlay.version || '—')}</small></td>
                  <td>${esc(overlay.mode || '—')}</td>
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

  function renderIssues() {
    const issues = Array.isArray(state.data?.issues) ? state.data.issues : [];
    const synthetic = [];
    const summary = state.data?.summary || {};
    if (!obsConnected() && Number(summary.online || 0) > 0) {
      synthetic.push({ level: 'warn', overlayId: 'OBS offline', message: 'Bus-Clients melden sich, obwohl OBS nicht verbunden ist. Das ist aktuell nur Bus-Status, keine OBS-Bestätigung.' });
    }
    const allIssues = synthetic.concat(issues);
    if (!allIssues.length) return '<div class="ovm-ok-note">Keine Overlay-Probleme gemeldet.</div>';
    return `
      <div class="ovm-issues">
        ${allIssues.slice(0, 10).map(issue => `
          <div class="ovm-issue is-${issue.level === 'warn' ? 'warn' : 'bad'}">
            <strong>${esc(issue.overlayId || issue.key || 'Overlay')}</strong>
            <span>${esc(issue.message || issue.status || 'Problem')}</span>
          </div>
        `).join('')}
      </div>
    `;
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
            <p>Read-only Übersicht: Bus-Overlay-Clients plus OBS-Browserquellen. Zuordnung, Aktionen und Automatik kommen erst in späteren Steps.</p>
          </div>
          <div class="ovm-head-meta">
            <span>Stand: ${esc(fmtDateTime(state.lastLoadedAt || state.data?.fetchedAt))}</span>
            ${state.error ? `<span class="ovm-warn-text">Letzter Fehler: ${esc(state.error)}</span>` : ''}
          </div>
        </div>
        ${renderSummary()}
        ${renderFilters()}
        ${renderObsStatus()}
        ${renderBrowserSources()}
        <section class="ovm-card">
          <div class="ovm-section-head"><div><h3>Bus-Overlay-Clients</h3><p>Diese Liste zeigt Clients, die sich am Communication-Bus melden. Das ist noch keine bestätigte OBS-Quelle.</p></div></div>
          ${renderOverlayRows()}
        </section>
        <section class="ovm-card">
          <h3>Aktuelle Hinweise</h3>
          ${renderIssues()}
        </section>
      </div>
    `;
    bind(root);
  }

  function bind(root) {
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
    state.browserSourcesError = '';
    render();

    const [monitorResult, obsResult, sourcesResult] = await Promise.allSettled([
      api(API_STATUS),
      api(API_OBS_STATUS),
      api(API_OBS_BROWSER_SOURCES)
    ]);

    if (monitorResult.status === 'fulfilled') {
      state.data = monitorResult.value;
      state.lastLoadedAt = new Date().toISOString();
    } else {
      state.error = monitorResult.reason?.message || String(monitorResult.reason || 'Overlay-Monitor konnte nicht geladen werden.');
    }

    if (obsResult.status === 'fulfilled') {
      state.obsStatus = dataPayload(obsResult.value) || {};
    } else {
      state.obsStatus = null;
      state.obsError = obsResult.reason?.message || String(obsResult.reason || 'OBS-Status konnte nicht geladen werden.');
    }

    if (sourcesResult.status === 'fulfilled') {
      state.browserSources = dataPayload(sourcesResult.value) || {};
    } else {
      state.browserSources = null;
      state.browserSourcesError = sourcesResult.reason?.message || String(sourcesResult.reason || 'OBS-Browserquellen konnten nicht geladen werden.');
    }

    state.loading = false;
    render();
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
