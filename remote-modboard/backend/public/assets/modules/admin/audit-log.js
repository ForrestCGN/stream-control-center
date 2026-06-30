'use strict';

(function registerAdminAuditLogModule() {
  const PAGE_ID = 'audit-log';
  const AUDIT_LOG_ENDPOINT = '/api/remote/admin/audit/log';
  const RETENTION_ENDPOINT = '/api/remote/admin/audit/retention/status';
  let loading = false;
  let latestItems = [];

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
          <h1>Aktivitäts-Log</h1>
          <p>Read-only: wer, wann, was gemacht hat. Details nur bei Bedarf aufklappen.</p>
        </div>
        <div class="rdap-audit-header-actions">
          <span class="cgn-chip cgn-chip--info" id="auditLogReadonlyPill">read-only</span>
          <button class="secondaryButton small" type="button" id="auditLogRefreshButton">Neu laden</button>
        </div>
      </section>

      <section class="metric-grid rdap-audit-retention-grid rdap-audit-retention-grid--compact">
        <article class="metric-card cgn-card"><span>Einträge</span><strong id="auditMetricTotal">—</strong><small>gesamt</small></article>
        <article class="metric-card cgn-card"><span>Ältester</span><strong id="auditMetricOldest">—</strong><small>Start</small></article>
        <article class="metric-card cgn-card"><span>Neuester</span><strong id="auditMetricNewest">—</strong><small>letzter</small></article>
        <article class="metric-card cgn-card"><span>Bereinigung</span><strong id="auditMetricCleanup">—</strong><small id="auditMetricRetentionHint">Status</small></article>
      </section>

      <section class="cgn-card rdap-audit-retention-note">
        <span class="cgn-chip cgn-chip--warn" id="auditRetentionPill">unbegrenzt</span>
        <strong>Keine Selbstbereinigung aktiv</strong>
        <span id="auditRetentionText">Speicherung aktuell unbegrenzt.</span>
      </section>

      <section class="cgn-card rdap-audit-list-card">
        <div class="card-head rdap-audit-tools-head">
          <div><p class="cgn-eyebrow">Log</p><h2>Aktivitäten</h2></div>
          <span class="cgn-chip" id="auditLogPill">lädt</span>
        </div>

        <div class="rdap-audit-filters rdap-audit-filters--compact">
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
              <option value="25" selected>25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>
        </div>

        <div class="rdap-audit-list" id="auditLogList">Lade Audit-Log …</div>
      </section>
    `;

    installStyle();
    bindActions();
    return panel;
  }

  function installStyle() {
    const oldStyle = document.getElementById('rdap116AuditLogUiStyle');
    if (oldStyle && oldStyle.parentNode) oldStyle.parentNode.removeChild(oldStyle);
    if (document.getElementById('rdap116bAuditLogCompactStyle')) return;

    const style = document.createElement('style');
    style.id = 'rdap116bAuditLogCompactStyle';
    style.textContent = `
      #nav-admin .nav-link[data-page="admin-notes"]{display:none!important}
      [data-page-panel="audit-log"]{gap:12px!important}
      [data-page-panel="audit-log"] .rdap-audit-header{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:14px 16px!important}
      [data-page-panel="audit-log"] .rdap-audit-header h1{font-size:24px!important;margin:0!important}
      [data-page-panel="audit-log"] .rdap-audit-header p:not(.cgn-eyebrow){max-width:760px;margin-top:5px!important;font-size:13px!important}
      [data-page-panel="audit-log"] .rdap-audit-header-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}
      [data-page-panel="audit-log"] .rdap-audit-retention-grid--compact{gap:8px!important;margin:0!important}
      [data-page-panel="audit-log"] .rdap-audit-retention-grid--compact .metric-card{min-height:74px!important;padding:12px 14px!important}
      [data-page-panel="audit-log"] .rdap-audit-retention-grid--compact .metric-card strong{font-size:20px!important;line-height:1.05!important}
      [data-page-panel="audit-log"] .rdap-audit-retention-grid--compact .metric-card .cgn-progress{display:none!important}
      [data-page-panel="audit-log"] .rdap-audit-retention-note{display:flex!important;align-items:center!important;gap:10px!important;padding:10px 12px!important;border-radius:16px!important;background:rgba(255,209,102,.07)!important;border:1px solid rgba(255,209,102,.16)!important}
      [data-page-panel="audit-log"] .rdap-audit-retention-note strong{font-size:13px!important;white-space:nowrap}
      [data-page-panel="audit-log"] .rdap-audit-retention-note span:last-child{font-size:12px!important;color:var(--muted)!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      [data-page-panel="audit-log"] .rdap-audit-list-card{padding:14px!important}
      [data-page-panel="audit-log"] .rdap-audit-tools-head{margin-bottom:10px!important}
      [data-page-panel="audit-log"] .rdap-audit-filters--compact{display:grid;grid-template-columns:.8fr 1fr 1fr .65fr;gap:8px;margin:0 0 10px!important}
      [data-page-panel="audit-log"] .rdap-audit-filters--compact label{display:grid;gap:4px;color:var(--muted);font-size:11px}
      [data-page-panel="audit-log"] .rdap-audit-filters--compact input,
      [data-page-panel="audit-log"] .rdap-audit-filters--compact select{min-height:32px;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:rgba(12,12,28,.72);color:var(--text);padding:6px 9px;outline:none;font-size:13px}
      [data-page-panel="audit-log"] .rdap-audit-list{display:grid;gap:6px}
      [data-page-panel="audit-log"] .rdap-audit-row{display:grid;grid-template-columns:120px 170px minmax(220px,1fr) 110px;gap:10px;align-items:center;padding:9px 10px;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.026)}
      [data-page-panel="audit-log"] .rdap-audit-row:hover{background:rgba(255,255,255,.04)}
      [data-page-panel="audit-log"] .rdap-audit-row-main{display:grid;gap:2px;min-width:0}
      [data-page-panel="audit-log"] .rdap-audit-row-main strong{font-size:13px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-page-panel="audit-log"] .rdap-audit-row-main small{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-page-panel="audit-log"] .rdap-audit-action{font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-page-panel="audit-log"] .rdap-audit-time{font-size:12px;line-height:1.25}
      [data-page-panel="audit-log"] .rdap-audit-details-toggle{justify-self:end;min-height:28px!important;padding:5px 9px!important;border-radius:10px!important;font-size:12px!important}
      [data-page-panel="audit-log"] .rdap-audit-detail{grid-column:1/-1;display:none;margin-top:2px;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.16);color:var(--muted);font-size:12px;line-height:1.35;word-break:break-word}
      [data-page-panel="audit-log"] .rdap-audit-row.is-open .rdap-audit-detail{display:block}
      [data-page-panel="audit-log"] .rdap-audit-status-wrap{display:flex;justify-content:flex-end}
      @media (max-width:1100px){[data-page-panel="audit-log"] .rdap-audit-row{grid-template-columns:110px 150px minmax(180px,1fr) 94px}}
      @media (max-width:860px){[data-page-panel="audit-log"] .rdap-audit-filters--compact{grid-template-columns:1fr 1fr}[data-page-panel="audit-log"] .rdap-audit-row{grid-template-columns:1fr;align-items:start}[data-page-panel="audit-log"] .rdap-audit-status-wrap{justify-content:flex-start}[data-page-panel="audit-log"] .rdap-audit-details-toggle{justify-self:start}}
      @media (max-width:640px){[data-page-panel="audit-log"] .rdap-audit-header{display:grid}[data-page-panel="audit-log"] .rdap-audit-filters--compact{grid-template-columns:1fr}[data-page-panel="audit-log"] .rdap-audit-retention-note{display:grid!important}[data-page-panel="audit-log"] .rdap-audit-retention-note span:last-child{white-space:normal}}
    `;
    document.head.appendChild(style);
  }

  function bindActions() {
    const button = document.getElementById('auditLogRefreshButton');
    if (button && button.dataset.rdap116bBound !== '1') {
      button.dataset.rdap116bBound = '1';
      button.addEventListener('click', () => loadAuditLog('manual'));
    }

    ['auditFilterStatus', 'auditFilterAction', 'auditFilterActor', 'auditFilterLimit'].forEach((id) => {
      const node = document.getElementById(id);
      if (!node || node.dataset.rdap116bBound === '1') return;
      node.dataset.rdap116bBound = '1';
      node.addEventListener(node.tagName === 'SELECT' ? 'change' : 'input', debounce(() => loadAuditLog('filter'), 300));
    });

    const list = document.getElementById('auditLogList');
    if (list && list.dataset.rdap116bBound !== '1') {
      list.dataset.rdap116bBound = '1';
      list.addEventListener('click', (event) => {
        const button = event.target && event.target.closest ? event.target.closest('[data-audit-toggle]') : null;
        if (!button) return;
        const row = button.closest('.rdap-audit-row');
        if (!row) return;
        const open = row.classList.toggle('is-open');
        button.textContent = open ? 'weniger' : 'Details';
      });
    }
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
    const limit = getValue('auditFilterLimit') || '25';
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

    const retentionPill = document.getElementById('auditRetentionPill');
    if (retentionPill) {
      retentionPill.textContent = policy.autoCleanupEnabled ? 'aktiv' : 'unbegrenzt';
      retentionPill.className = policy.autoCleanupEnabled ? 'cgn-chip cgn-chip--ok' : 'cgn-chip cgn-chip--warn';
    }

    const recommendation = policy.recommendation || {};
    const spanDays = storage.spanDays === null || storage.spanDays === undefined ? '—' : `${storage.spanDays} Tage`;
    setText('auditRetentionText', policy.autoCleanupEnabled
      ? `Selbstbereinigung aktiv · Bestand: ${spanDays}`
      : `Keine Selbstbereinigung · ${totalRows.toLocaleString('de-DE')} Einträge · ${spanDays} · Vorschlag: ${recommendation.maxAgeDays || 180} Tage / ${(recommendation.maxRows || 10000).toLocaleString('de-DE')} Einträge`
    );
  }

  function renderLog(result, reason) {
    const body = result && result.body ? result.body : {};
    const items = Array.isArray(body.items) ? body.items : [];
    latestItems = items;

    const list = document.getElementById('auditLogList');
    if (!list) return;

    const ok = Boolean(result && result.ok);
    const pill = document.getElementById('auditLogPill');
    if (pill) {
      pill.textContent = ok ? `${items.length} Einträge` : 'Fehler';
      pill.className = ok ? 'cgn-chip cgn-chip--ok' : 'cgn-chip cgn-chip--warn';
    }

    if (!ok) {
      list.textContent = 'Audit-Log konnte nicht geladen werden.';
      return;
    }

    if (!items.length) {
      list.textContent = 'Keine passenden Einträge gefunden.';
      return;
    }

    list.innerHTML = items.map((item, index) => {
      const actorName = item.actorDisplayName || item.actorLogin || 'Unbekannt';
      const actorSub = item.actorLogin || item.actorUserUid || '';
      const target = [item.resourceType, item.resourceKey].filter(Boolean).join(': ');
      return `
        <article class="rdap-audit-row">
          <div class="rdap-audit-time">${escapeHtml(formatDateCompact(item.createdAt))}</div>
          <div class="rdap-audit-row-main"><strong>${escapeHtml(actorName)}</strong><small>${escapeHtml(actorSub)}</small></div>
          <div class="rdap-audit-row-main"><span class="rdap-audit-action">${escapeHtml(item.action || '—')}</span><small>${escapeHtml(target || '—')}</small></div>
          <div class="rdap-audit-status-wrap">${statusChip(item.status, item.errorCode)}</div>
          <button class="secondaryButton rdap-audit-details-toggle" type="button" data-audit-toggle="${index}">Details</button>
          <div class="rdap-audit-detail">
            ${escapeHtml(item.summary || '')}
            ${item.oldValueSummary ? `<br><strong>Alt:</strong> ${escapeHtml(item.oldValueSummary)}` : ''}
            ${item.newValueSummary ? `<br><strong>Neu:</strong> ${escapeHtml(item.newValueSummary)}` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  function statusChip(status, errorCode) {
    const safeStatus = String(status || '—');
    const cls = safeStatus === 'success' ? 'cgn-chip cgn-chip--ok' : (safeStatus === 'attempt' ? 'cgn-chip cgn-chip--info' : 'cgn-chip cgn-chip--warn');
    return `<span class="${cls}" title="${escapeHtml(errorCode || '')}">${escapeHtml(safeStatus)}</span>`;
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

  function formatDateCompact(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
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
