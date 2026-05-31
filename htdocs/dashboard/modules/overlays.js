(function () {
  'use strict';

  const state = {
    loading: false,
    data: null,
    error: '',
    filter: 'all',
    autoRefresh: true,
    timer: null,
    lastLoadedAt: ''
  };

  const API_STATUS = '/api/overlay-monitor/status?events=10';
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

  function statusClass(status) {
    const s = String(status || 'unknown').toLowerCase();
    if (s === 'online') return 'ok';
    if (s === 'stale') return 'warn';
    if (s === 'offline' || s === 'dead') return 'bad';
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

  function filteredOverlays() {
    const overlays = Array.isArray(state.data?.overlays) ? state.data.overlays : [];
    if (state.filter === 'all') return overlays;
    if (state.filter === 'problem') return overlays.filter(o => !['online'].includes(String(o.status || '').toLowerCase()));
    return overlays.filter(o => String(o.status || '').toLowerCase() === state.filter);
  }

  function renderSummary() {
    const s = state.data?.summary || {};
    const c = state.data?.communication || {};
    const rows = [
      ['Gesamt', s.total ?? 0, ''],
      ['Online', s.online ?? 0, 'ok'],
      ['Stale', s.stale ?? 0, 'warn'],
      ['Offline', s.offline ?? 0, 'bad'],
      ['Dead', s.dead ?? 0, 'bad'],
      ['Verbunden', s.connected ?? 0, '']
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
      </div>
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

  function renderIssues() {
    const issues = Array.isArray(state.data?.issues) ? state.data.issues : [];
    if (!issues.length) return '<div class="ovm-ok-note">Keine Overlay-Probleme gemeldet.</div>';
    return `
      <div class="ovm-issues">
        ${issues.slice(0, 8).map(issue => `
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
            <p>Read-only Übersicht echter Overlay-Clients aus dem Communication Bus. OBS-Aktionen kommen erst in einem späteren Step.</p>
          </div>
          <div class="ovm-head-meta">
            <span>Stand: ${esc(fmtDateTime(state.lastLoadedAt || state.data?.fetchedAt))}</span>
            ${state.error ? `<span class="ovm-warn-text">Letzter Fehler: ${esc(state.error)}</span>` : ''}
          </div>
        </div>
        ${renderSummary()}
        ${renderFilters()}
        ${renderOverlayRows()}
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
    render();
    try {
      const data = await api(API_STATUS);
      state.data = data;
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
