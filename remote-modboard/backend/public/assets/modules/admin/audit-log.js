'use strict';

(function registerAdminAuditLogModule() {
  const PAGE_ID = 'audit-log';
  const AUDIT_LOG_ENDPOINT = '/api/remote/admin/audit/log';
  const RETENTION_ENDPOINT = '/api/remote/admin/audit/retention/status';
  let loading = false;

  function registerPage() {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerPage !== 'function') return;
    window.RemoteModboardModules.registerPage({
      moduleId: 'admin',
      pageId: PAGE_ID,
      label: 'Aktivitäts-Log',
      title: 'Aktivitäts-Log',
      tab: 'read-only',
      section: 'Admin',
      order: 20,
      permission: 'admin.details.read',
      script: '/assets/modules/admin/audit-log.js'
    });
  }

  function createPanel() {
    const content = document.getElementById('remoteModboardContent') || document.querySelector('.cgn-content');
    if (!content) return null;

    let panel = document.querySelector('[data-page-panel="audit-log"]');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'rdap-view';
      panel.dataset.pagePanel = PAGE_ID;
      const footer = content.querySelector('.footer');
      if (footer) content.insertBefore(panel, footer);
      else content.appendChild(panel);
    }

    panel.innerHTML = `
      <section class="page-header module-page-header cgn-card rdap-audit-header">
        <div>
          <p class="cgn-eyebrow">Admin / Aktivitäts-Log</p>
          <h1>Wer hat was gemacht?</h1>
          <p>Read-only Übersicht über Admin- und Systemaktionen. Keine Bearbeitung, keine Löschung, keine Selbstbereinigung in dieser Ansicht.</p>
        </div>
        <div class="rdap-audit-header-actions">
          <span class="cgn-chip cgn-chip--info" id="auditLogReadonlyPill">read-only</span>
          <button class="secondaryButton small" type="button" id="auditLogRefreshButton">Neu laden</button>
        </div>
      </section>

      <section class="metric-grid rdap-audit-retention-grid">
        <article class="metric-card cgn-card"><span>Einträge</span><strong id="auditMetricTotal">—</strong><small>gesamt gespeichert</small><div class="cgn-progress"><i id="auditMetricTotalBar" style="width:10%"></i></div></article>
        <article class="metric-card cgn-card"><span>Ältester</span><strong id="auditMetricOldest">—</strong><small>erster Eintrag</small><div class="cgn-progress"><i style="width:42%"></i></div></article>
        <article class="metric-card cgn-card"><span>Neuester</span><strong id="auditMetricNewest">—</strong><small>letzter Eintrag</small><div class="cgn-progress"><i style="width:76%"></i></div></article>
        <article class="metric-card cgn-card"><span>Bereinigung</span><strong id="auditMetricCleanup">—</strong><small id="auditMetricRetentionHint">Status</small><div class="cgn-progress"><i style="width:0%"></i></div></article>
      </section>

      <section class="page-grid rdap-audit-grid">
        <article class="cgn-card span2">
          <div class="card-head rdap-audit-tools-head">
            <div><p class="cgn-eyebrow">Log</p><h2>Aktivitäten</h2></div>
            <span class="cgn-chip" id="auditLogPill">lädt</span>
          </div>

          <div class="rdap-audit-filters">
            <label>Status
              <select id="auditFilterStatus">
                <option value="">Alle</option>
                <option value="success">success</option>
                <option value="attempt">attempt</option>
                <option value="failure">failure</option>
              </select>
            </label>
            <label>Aktion
              <input id="auditFilterAction" type="search" placeholder="z.B. media_index">
            </label>
            <label>Wer
              <input id="auditFilterActor" type="search" placeholder="Login / Name">
            </label>
            <label>Anzahl
              <select id="auditFilterLimit">
                <option value="25">25</option>
                <option value="50" selected>50</option>
                <option value="100">100</option>
              </select>
            </label>
          </div>

          <div class="rdap-audit-table-wrap">
            <table class="rdap-audit-table">
              <thead><tr><th>Wann</th><th>Wer</th><th>Was</th><th>Ziel</th><th>Status</th></tr></thead>
              <tbody id="auditLogTableBody"><tr><td colspan="5">Lade Audit-Log …</td></tr></tbody>
            </table>
          </div>
        </article>

        <article class="cgn-card span2">
          <div class="card-head"><div><p class="cgn-eyebrow">Aufbewahrung</p><h2>Retention-Status</h2></div><span class="cgn-chip cgn-chip--warn" id="auditRetentionPill">unbegrenzt</span></div>
          <div class="admin-lock-note rdap-audit-note">
            <i>!</i>
            <div>
              <strong>Keine Selbstbereinigung aktiv</strong>
              <span id="auditRetentionText">Speicherung aktuell unbegrenzt. Vorschlag ist nur notiert, nicht aktiv.</span>
            </div>
          </div>
        </article>
      </section>
    `;

    installStyle();
    bindActions();
    return panel;
  }

  function installStyle() {
    if (document.getElementById('rdap116AuditLogUiStyle')) return;
    const style = document.createElement('style');
    style.id = 'rdap116AuditLogUiStyle';
    style.textContent = `
      #nav-admin .nav-link[data-page="admin-notes"]{display:none!important}
      [data-page-panel="audit-log"] .rdap-audit-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
      [data-page-panel="audit-log"] .rdap-audit-header p:not(.cgn-eyebrow){max-width:980px}
      [data-page-panel="audit-log"] .rdap-audit-header-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
      [data-page-panel="audit-log"] .rdap-audit-filters{display:grid;grid-template-columns:1fr 1.2fr 1.2fr .8fr;gap:10px;margin:12px 0 14px}
      [data-page-panel="audit-log"] .rdap-audit-filters label{display:grid;gap:5px;color:var(--muted);font-size:12px}
      [data-page-panel="audit-log"] .rdap-audit-filters input,
      [data-page-panel="audit-log"] .rdap-audit-filters select{min-height:36px;border-radius:13px;border:1px solid rgba(255,255,255,.12);background:rgba(12,12,28,.72);color:var(--text);padding:8px 10px;outline:none}
      [data-page-panel="audit-log"] .rdap-audit-table-wrap{overflow:auto;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.025)}
      [data-page-panel="audit-log"] .rdap-audit-table{width:100%;border-collapse:collapse;min-width:820px}
      [data-page-panel="audit-log"] .rdap-audit-table th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.08)}
      [data-page-panel="audit-log"] .rdap-audit-table td{padding:11px 12px;border-bottom:1px solid rgba(255,255,255,.055);font-size:13px;vertical-align:top}
      [data-page-panel="audit-log"] .rdap-audit-table tr:last-child td{border-bottom:0}
      [data-page-panel="audit-log"] .rdap-audit-table small{display:block;color:var(--muted);font-size:11px;margin-top:3px}
      [data-page-panel="audit-log"] .rdap-audit-action{font-weight:800;color:var(--text)}
      [data-page-panel="audit-log"] .rdap-audit-resource{color:var(--muted);word-break:break-word}
      [data-page-panel="audit-log"] .rdap-audit-note{background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.18)}
      @media (max-width: 980px){[data-page-panel="audit-log"] .rdap-audit-filters{grid-template-columns:1fr 1fr}}
      @media (max-width: 640px){[data-page-panel="audit-log"] .rdap-audit-header{display:grid}[data-page-panel="audit-log"] .rdap-audit-filters{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function bindActions() {
    const button = document.getElementById('auditLogRefreshButton');
    if (button && button.dataset.rdap116Bound !== '1') {
      button.dataset.rdap116Bound = '1';
      button.addEventListener('click', () => loadAuditLog('manual'));
    }

    ['auditFilterStatus', 'auditFilterAction', 'auditFilterActor', 'auditFilterLimit'].forEach((id) => {
      const node = document.getElementById(id);
      if (!node || node.dataset.rdap116Bound === '1') return;
      node.dataset.rdap116Bound = '1';
      node.addEventListener(node.tagName === 'SELECT' ? 'change' : 'input', debounce(() => loadAuditLog('filter'), 300));
    });
  }

  async function loadAuditLog(reason) {
    if (loading) return;
    loading = true;
    setButtonLoading(true);

    const [retention, log] = await Promise.all([
      getJson(RETENTION_ENDPOINT),
      getJson(buildLogUrl())
    ]);

    renderRetention(retention);
    renderLog(log, reason);

    setButtonLoading(false);
    loading = false;
  }

  function buildLogUrl() {
    const params = new URLSearchParams();
    const status = getValue('auditFilterStatus');
    const action = getValue('auditFilterAction');
    const actor = getValue('auditFilterActor');
    const limit = getValue('auditFilterLimit') || '50';
    params.set('limit', limit);
    if (status) params.set('status', status);
    if (action) params.set('action', action);
    if (actor) params.set('actor', actor);
    return `${AUDIT_LOG_ENDPOINT}?${params.toString()}`;
  }

  async function getJson(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      const body = await response.json().catch(() => null);
      return { ok: response.ok && body && body.ok !== false, status: response.status, body };
    } catch (err) {
      return { ok: false, status: 0, body: null, error: err && err.message ? err.message : 'fetch_failed' };
    }
  }

  function renderRetention(result) {
    const body = result && result.body ? result.body : {};
    const storage = body.storage || {};
    const policy = body.retentionPolicy || {};
    const totalRows = Number(storage.totalRows || 0);
    setText('auditMetricTotal', totalRows.toLocaleString('de-DE'));
    setText('auditMetricOldest', formatDateShort(storage.oldestCreatedAt));
    setText('auditMetricNewest', formatDateShort(storage.newestCreatedAt));
    setText('auditMetricCleanup', policy.autoCleanupEnabled ? 'Aktiv' : 'Aus');
    setText('auditMetricRetentionHint', policy.configured ? 'konfiguriert' : 'unbegrenzt');
    const bar = document.getElementById('auditMetricTotalBar');
    if (bar) bar.style.width = `${Math.max(8, Math.min(100, Math.round((totalRows / 10000) * 100)))}%`;

    const retentionPill = document.getElementById('auditRetentionPill');
    if (retentionPill) {
      retentionPill.textContent = policy.autoCleanupEnabled ? 'aktiv' : 'unbegrenzt';
      retentionPill.className = policy.autoCleanupEnabled ? 'cgn-chip cgn-chip--ok' : 'cgn-chip cgn-chip--warn';
    }

    const recommendation = policy.recommendation || {};
    const spanDays = storage.spanDays === null || storage.spanDays === undefined ? '—' : `${storage.spanDays} Tage`;
    setText('auditRetentionText', policy.autoCleanupEnabled
      ? `Selbstbereinigung ist aktiv. Zeitraum im Bestand: ${spanDays}.`
      : `Aktuell keine Selbstbereinigung. Bestand: ${totalRows.toLocaleString('de-DE')} Einträge über ${spanDays}. Vorschlag nur notiert: ${recommendation.maxAgeDays || 180} Tage oder ${(recommendation.maxRows || 10000).toLocaleString('de-DE')} Einträge.`
    );
  }

  function renderLog(result, reason) {
    const body = result && result.body ? result.body : {};
    const items = Array.isArray(body.items) ? body.items : [];
    const tbody = document.getElementById('auditLogTableBody');
    if (!tbody) return;

    const ok = Boolean(result && result.ok);
    const pill = document.getElementById('auditLogPill');
    if (pill) {
      pill.textContent = ok ? `${items.length} Einträge` : 'Fehler';
      pill.className = ok ? 'cgn-chip cgn-chip--ok' : 'cgn-chip cgn-chip--warn';
    }

    if (!ok) {
      tbody.innerHTML = `<tr><td colspan="5">Audit-Log konnte nicht geladen werden.</td></tr>`;
      return;
    }

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="5">Keine passenden Einträge gefunden.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map((item) => `
      <tr>
        <td>${escapeHtml(formatDate(item.createdAt))}</td>
        <td><strong>${escapeHtml(item.actorDisplayName || item.actorLogin || 'Unbekannt')}</strong><small>${escapeHtml(item.actorLogin || item.actorUserUid || '')}</small></td>
        <td><span class="rdap-audit-action">${escapeHtml(item.action || '—')}</span><small>${escapeHtml(item.summary || '')}</small></td>
        <td><span class="rdap-audit-resource">${escapeHtml([item.resourceType, item.resourceKey].filter(Boolean).join(': ') || '—')}</span></td>
        <td>${statusChip(item.status, item.errorCode)}</td>
      </tr>
    `).join('');
  }

  function statusChip(status, errorCode) {
    const safeStatus = String(status || '—');
    const cls = safeStatus === 'success' ? 'cgn-chip cgn-chip--ok' : (safeStatus === 'attempt' ? 'cgn-chip cgn-chip--info' : 'cgn-chip cgn-chip--warn');
    const error = errorCode ? `<small>${escapeHtml(errorCode)}</small>` : '';
    return `<span class="${cls}">${escapeHtml(safeStatus)}</span>${error}`;
  }

  function setButtonLoading(value) {
    const button = document.getElementById('auditLogRefreshButton');
    if (!button) return;
    button.disabled = Boolean(value);
    button.textContent = value ? 'lädt…' : 'Neu laden';
  }

  function getValue(id) {
    const node = document.getElementById(id);
    return node ? String(node.value || '').trim() : '';
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value === null || value === undefined || value === '' ? '—' : String(value);
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('de-DE');
  }

  function formatDateShort(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('de-DE');
  }

  function debounce(fn, delay) {
    let timer = null;
    return function debounced() {
      window.clearTimeout(timer);
      timer = window.setTimeout(fn, delay);
    };
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pageIsActive() {
    if (window.RdapMainRouter && typeof window.RdapMainRouter.getCurrentPage === 'function') return window.RdapMainRouter.getCurrentPage() === PAGE_ID;
    const panel = document.querySelector('[data-page-panel="audit-log"]');
    return Boolean(panel && panel.classList.contains('is-active-view'));
  }

  function install() {
    registerPage();
    createPanel();
    loadAuditLog('initial');
  }

  install();
  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('rdap:module-registry-ready', install);
  window.addEventListener('rdap:main-router-page-change', (event) => {
    if (event && event.detail && event.detail.page === PAGE_ID) loadAuditLog('page');
  });
})();
