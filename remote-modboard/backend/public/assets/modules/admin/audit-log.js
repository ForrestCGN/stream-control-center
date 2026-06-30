'use strict';

(function registerAdminAuditLogModule() {
  const PAGE_ID = 'audit-log';
  const AUDIT_LOG_ENDPOINT = '/api/remote/admin/audit/log';
  let loading = false;

  const LOG_SOURCES = {
    remote: { label: 'Remote-Modboard', hint: 'Webserver-Logs' },
    local: { label: 'Lokal / Stream-PC', hint: 'vorbereitet, API kommt später' }
  };

  const LOG_AREAS = {
    all: { label: 'Alle Logs', action: '', hint: 'Alle vorhandenen Remote-Logs.' },
    media: { label: 'Media-System', action: 'media', hint: 'Medienindex, Media-Schema, TTS/Legacy.' },
    adminNotes: { label: 'Admin-Notizen', action: 'note', hint: 'Erstellte oder geänderte Admin-Notizen.' },
    system: { label: 'System / RDAP', action: 'rdap', hint: 'System-, RDAP- und technische Wartungseinträge.' },
    locks: { label: 'Locks / Schutz', action: 'lock', hint: 'Schutz-/Lock-Aktionen.' },
    future: { label: 'Weitere Module später', action: '__none__', hint: 'Platzhalter für OBS, Sounds, Overlays, Agent, Auth.' }
  };

  function registerPage() {
    if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.registerPage !== 'function') return;
    window.RemoteModboardModules.registerPage({
      moduleId: 'admin',
      pageId: PAGE_ID,
      label: 'Logs',
      title: 'Logs',
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
      <section class="page-header module-page-header cgn-card rdap-logs-header">
        <div>
          <p class="cgn-eyebrow">Admin</p>
          <h1>Logs</h1>
        </div>
        <div class="rdap-logs-header-actions">
          <span class="cgn-chip cgn-chip--info" id="logsReadonlyPill">read-only</span>
          <button class="secondaryButton small" type="button" id="logsRefreshButton">Neu laden</button>
        </div>
      </section>

      <section class="cgn-card rdap-logs-card">
        <div class="rdap-logs-selectors">
          <label>Log-Quelle
            <select id="logsFilterSource">
              <option value="remote">Remote-Modboard</option>
              <option value="local" disabled>Lokal / Stream-PC später</option>
            </select>
          </label>
          <label>Log-Bereich
            <select id="logsFilterArea">
              <option value="all">Alle Logs</option>
              <option value="media">Media-System</option>
              <option value="adminNotes">Admin-Notizen</option>
              <option value="system">System / RDAP</option>
              <option value="locks">Locks / Schutz</option>
              <option value="future">Weitere Module später</option>
            </select>
          </label>
          <label>Status
            <select id="logsFilterStatus">
              <option value="">Alle</option>
              <option value="success">Erfolg</option>
              <option value="attempt">Versuch</option>
              <option value="failure">Fehler</option>
            </select>
          </label>
          <label>Suche
            <input id="logsFilterSearch" type="search" placeholder="z.B. Medien, Notiz">
          </label>
          <label>Wer
            <input id="logsFilterActor" type="search" placeholder="Name / Login">
          </label>
          <label>Anzahl
            <select id="logsFilterLimit">
              <option value="25" selected>25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>
        </div>

        <div class="card-head rdap-logs-list-head">
          <div><p class="cgn-eyebrow" id="logsAreaEyebrow">Remote-Modboard</p><h2 id="logsAreaTitle">Alle Logs</h2></div>
          <span class="cgn-chip" id="logsCountPill">lädt</span>
        </div>

        <div class="rdap-logs-list" id="logsList">Lade Logs …</div>
      </section>
    `;

    installStyle();
    bindActions();
    renderSelectedMeta();
    return panel;
  }

  function installStyle() {
    [
      'rdap116AuditLogUiStyle',
      'rdap116bAuditLogCompactStyle',
      'rdap116cAuditLogHumanLabelsStyle',
      'rdap116dLogsModuleDropdownStyle'
    ].forEach((id) => {
      const oldStyle = document.getElementById(id);
      if (oldStyle && oldStyle.parentNode) oldStyle.parentNode.removeChild(oldStyle);
    });
    if (document.getElementById('rdap116eLogsCleanSelectorStyle')) return;

    const style = document.createElement('style');
    style.id = 'rdap116eLogsCleanSelectorStyle';
    style.textContent = `
      #nav-admin .nav-link[data-page="admin-notes"]{display:none!important}
      [data-page-panel="audit-log"]{gap:12px!important}
      [data-page-panel="audit-log"] .rdap-logs-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px!important}
      [data-page-panel="audit-log"] .rdap-logs-header h1{font-size:26px!important;margin:0!important;line-height:1!important}
      [data-page-panel="audit-log"] .rdap-logs-header .cgn-eyebrow{margin-bottom:4px!important}
      [data-page-panel="audit-log"] .rdap-logs-header-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}
      [data-page-panel="audit-log"] .rdap-logs-card{padding:14px!important}
      [data-page-panel="audit-log"] .rdap-logs-selectors{display:grid;grid-template-columns:1.1fr 1.1fr .75fr 1fr 1fr .65fr;gap:8px;margin-bottom:12px}
      [data-page-panel="audit-log"] .rdap-logs-selectors label{display:grid;gap:4px;color:var(--muted);font-size:11px}
      [data-page-panel="audit-log"] .rdap-logs-selectors input,
      [data-page-panel="audit-log"] .rdap-logs-selectors select{min-height:32px;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:rgba(12,12,28,.72);color:var(--text);padding:6px 9px;outline:none;font-size:13px}
      [data-page-panel="audit-log"] .rdap-logs-selectors select:disabled{opacity:.55}
      [data-page-panel="audit-log"] .rdap-logs-list-head{margin:2px 0 10px!important}
      [data-page-panel="audit-log"] .rdap-logs-list{display:grid;gap:6px}
      [data-page-panel="audit-log"] .rdap-log-row{display:grid;grid-template-columns:112px 160px minmax(240px,1fr) 105px 82px;gap:10px;align-items:center;padding:8px 10px;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.026)}
      [data-page-panel="audit-log"] .rdap-log-row:hover{background:rgba(255,255,255,.04)}
      [data-page-panel="audit-log"] .rdap-log-row-main{display:grid;gap:2px;min-width:0}
      [data-page-panel="audit-log"] .rdap-log-row-main strong{font-size:13px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-page-panel="audit-log"] .rdap-log-row-main small{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-page-panel="audit-log"] .rdap-log-human-action{font-size:15px!important;font-weight:900!important;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-page-panel="audit-log"] .rdap-log-time{font-size:12px;line-height:1.25}
      [data-page-panel="audit-log"] .rdap-log-details-toggle{justify-self:end;min-height:28px!important;padding:5px 9px!important;border-radius:10px!important;font-size:12px!important}
      [data-page-panel="audit-log"] .rdap-log-detail{grid-column:1/-1;display:none;margin-top:2px;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.16);color:var(--muted);font-size:12px;line-height:1.35;word-break:break-word}
      [data-page-panel="audit-log"] .rdap-log-row.is-open .rdap-log-detail{display:block}
      [data-page-panel="audit-log"] .rdap-log-status-wrap{display:flex;justify-content:flex-end}
      @media (max-width:1260px){[data-page-panel="audit-log"] .rdap-logs-selectors{grid-template-columns:1fr 1fr 1fr}[data-page-panel="audit-log"] .rdap-log-row{grid-template-columns:100px 140px minmax(210px,1fr) 92px 78px}}
      @media (max-width:860px){[data-page-panel="audit-log"] .rdap-logs-selectors{grid-template-columns:1fr 1fr}[data-page-panel="audit-log"] .rdap-log-row{grid-template-columns:1fr;align-items:start}[data-page-panel="audit-log"] .rdap-log-status-wrap{justify-content:flex-start}[data-page-panel="audit-log"] .rdap-log-details-toggle{justify-self:start}}
      @media (max-width:640px){[data-page-panel="audit-log"] .rdap-logs-header{display:grid}[data-page-panel="audit-log"] .rdap-logs-selectors{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function bindActions() {
    const button = document.getElementById('logsRefreshButton');
    if (button && button.dataset.rdap116eBound !== '1') {
      button.dataset.rdap116eBound = '1';
      button.addEventListener('click', () => loadLogs('manual'));
    }

    ['logsFilterSource', 'logsFilterArea', 'logsFilterStatus', 'logsFilterSearch', 'logsFilterActor', 'logsFilterLimit'].forEach((id) => {
      const node = document.getElementById(id);
      if (!node || node.dataset.rdap116eBound === '1') return;
      node.dataset.rdap116eBound = '1';
      node.addEventListener(node.tagName === 'SELECT' ? 'change' : 'input', debounce(() => {
        renderSelectedMeta();
        loadLogs('filter');
      }, 250));
    });

    const list = document.getElementById('logsList');
    if (list && list.dataset.rdap116eBound !== '1') {
      list.dataset.rdap116eBound = '1';
      list.addEventListener('click', (event) => {
        const button = event.target && event.target.closest ? event.target.closest('[data-log-toggle]') : null;
        if (!button) return;
        const row = button.closest('.rdap-log-row');
        if (!row) return;
        const open = row.classList.toggle('is-open');
        button.textContent = open ? 'weniger' : 'Details';
      });
    }
  }

  function renderSelectedMeta() {
    const source = getSelectedSource();
    const area = getSelectedArea();
    setText('logsAreaEyebrow', source.label);
    setText('logsAreaTitle', area.label);
  }

  async function loadLogs(reason) {
    if (loading) return;
    loading = true;
    setButtonLoading(true);

    const sourceKey = getValue('logsFilterSource') || 'remote';
    if (sourceKey !== 'remote') {
      renderLogs({ ok: true, body: { items: [] } }, reason, 'Diese Log-Quelle ist vorbereitet. Lokale Logs kommen mit eigener API später.');
      setButtonLoading(false);
      loading = false;
      return;
    }

    const result = await getJson(buildLogUrl());
    renderLogs(result, reason);

    setButtonLoading(false);
    loading = false;
  }

  function buildLogUrl() {
    const params = new URLSearchParams();
    const status = getValue('logsFilterStatus');
    const search = getValue('logsFilterSearch');
    const actor = getValue('logsFilterActor');
    const limit = getValue('logsFilterLimit') || '25';
    const area = getSelectedArea();

    params.set('limit', limit);
    if (status) params.set('status', status);
    const actionFilter = area.action === '__none__' ? '__none__' : (search ? mapHumanSearchToAction(search) : area.action);
    if (actionFilter) params.set('action', actionFilter);
    if (actor) params.set('actor', actor);
    return `${AUDIT_LOG_ENDPOINT}?${params.toString()}`;
  }

  function getSelectedSource() {
    const key = getValue('logsFilterSource') || 'remote';
    return LOG_SOURCES[key] || LOG_SOURCES.remote;
  }

  function getSelectedArea() {
    const key = getValue('logsFilterArea') || 'all';
    return LOG_AREAS[key] || LOG_AREAS.all;
  }

  function mapHumanSearchToAction(value) {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return '';
    if (text.includes('medien') || text.includes('media')) return 'media';
    if (text.includes('notiz') || text.includes('note')) return 'note';
    if (text.includes('schema')) return 'schema';
    if (text.includes('tts')) return 'tts';
    if (text.includes('lock')) return 'lock';
    return value;
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

  function renderLogs(result, reason, emptyMessage) {
    const body = result && result.body ? result.body : {};
    let items = Array.isArray(body.items) ? body.items : [];
    const list = document.getElementById('logsList');
    if (!list) return;

    const areaKey = getValue('logsFilterArea') || 'all';
    if (areaKey === 'future') items = [];

    const ok = Boolean(result && result.ok);
    const pill = document.getElementById('logsCountPill');
    if (pill) {
      pill.textContent = ok ? `${items.length} Einträge` : 'Fehler';
      pill.className = ok ? 'cgn-chip cgn-chip--ok' : 'cgn-chip cgn-chip--warn';
    }

    if (!ok) {
      list.textContent = 'Logs konnten nicht geladen werden.';
      return;
    }

    if (!items.length) {
      list.textContent = emptyMessage || (areaKey === 'future'
        ? 'Dieser Log-Bereich ist vorbereitet. Einträge kommen später.'
        : 'Keine passenden Einträge gefunden.');
      return;
    }

    list.innerHTML = items.map((item, index) => {
      const human = humanizeLogItem(item);
      const actor = human.actor;
      return `
        <article class="rdap-log-row">
          <div class="rdap-log-time">${escapeHtml(formatDateCompact(item.createdAt))}</div>
          <div class="rdap-log-row-main"><strong>${escapeHtml(actor.title)}</strong><small>${escapeHtml(actor.sub)}</small></div>
          <div class="rdap-log-row-main"><span class="rdap-log-human-action">${escapeHtml(human.title)}</span><small>${escapeHtml(human.sub)}</small></div>
          <div class="rdap-log-status-wrap">${statusChip(item.status, item.errorCode)}</div>
          <button class="secondaryButton rdap-log-details-toggle" type="button" data-log-toggle="${index}">Details</button>
          <div class="rdap-log-detail">
            <strong>Log-Bereich:</strong> ${escapeHtml(resolveAreaLabelForItem(item))}<br>
            <strong>Technische Aktion:</strong> ${escapeHtml(item.action || '—')}<br>
            <strong>Ziel:</strong> ${escapeHtml([item.resourceType, item.resourceKey].filter(Boolean).join(': ') || '—')}<br>
            ${item.summary ? `<strong>Zusammenfassung:</strong> ${escapeHtml(item.summary)}<br>` : ''}
            ${item.oldValueSummary ? `<strong>Alt:</strong> ${escapeHtml(item.oldValueSummary)}<br>` : ''}
            ${item.newValueSummary ? `<strong>Neu:</strong> ${escapeHtml(item.newValueSummary)}<br>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  function resolveAreaLabelForItem(item) {
    const action = String(item.action || '').toLowerCase();
    const resourceType = String(item.resourceType || '').toLowerCase();
    if (action.includes('media') || resourceType.includes('media')) return 'Media-System';
    if (action.includes('note') || resourceType.includes('admin_user_note')) return 'Admin-Notizen';
    if (action.includes('lock')) return 'Locks / Schutz';
    return 'System / RDAP';
  }

  function humanizeLogItem(item) {
    const action = String(item.action || '').toLowerCase();
    const resourceType = String(item.resourceType || '').toLowerCase();
    const resourceKey = String(item.resourceKey || '').toLowerCase();
    const summary = String(item.summary || '').toLowerCase();

    if (action.includes('media_index.upsert')) return { title: 'Medienindex aktualisiert', sub: 'Medienbestand wurde neu eingelesen.', actor: systemActor(item) };
    if (action.includes('media_index.schema')) return { title: 'Media-System vorbereitet', sub: 'Datenmodell fuer Medien wurde erweitert.', actor: systemActor(item) };
    if (action.includes('media_index.tts') || action.includes('legacy.soft_delete') || resourceKey.includes('tts-generated-legacy')) return { title: 'Alte TTS-Einträge bereinigt', sub: 'Legacy-TTS wurde im Medienindex ausgeblendet.', actor: systemActor(item) };
    if (action.includes('admin.user_note.update') || action.includes('admin_note') || resourceType.includes('admin_user_note')) return { title: 'Admin-Notiz geändert', sub: 'Eine interne Admin-Notiz wurde aktualisiert.', actor: humanActor(item) };
    if (action.includes('admin.user_note.create')) return { title: 'Admin-Notiz erstellt', sub: 'Eine interne Admin-Notiz wurde angelegt.', actor: humanActor(item) };
    if (action.includes('lock')) return { title: 'Schutz-/Lock-Aktion', sub: 'Ein geschützter Vorgang wurde verwaltet.', actor: systemActor(item) };
    if (action.includes('test_insert')) return { title: 'Audit-Testeintrag geschrieben', sub: 'Lokaler Test zur Audit-Prüfung.', actor: systemActor(item) };
    if (summary.includes('media index')) return { title: 'Media-System Aktion', sub: 'Technische Medienverwaltung.', actor: systemActor(item) };

    return { title: readableFromAction(item.action || 'Aktion ausgeführt'), sub: readableTarget(item), actor: humanActor(item) };
  }

  function systemActor(item) {
    const raw = item.actorDisplayName || item.actorLogin || '';
    if (String(raw).toLowerCase().includes('rdap') || String(item.actorUserUid || '').toLowerCase().startsWith('system:')) {
      return { title: 'System', sub: trimActorSub(raw || item.actorLogin || 'Automatik') };
    }
    return humanActor(item);
  }

  function humanActor(item) {
    const title = item.actorDisplayName || item.actorLogin || 'Unbekannt';
    return { title, sub: trimActorSub(item.actorLogin || item.actorUserUid || '') };
  }

  function trimActorSub(value) {
    return String(value || '').replace(/^system:/, '').replace(/^rdap(\d+)/i, 'RDAP $1').slice(0, 42);
  }

  function readableFromAction(value) {
    const text = String(value || '').replace(/[_.:]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return 'Aktion ausgeführt';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function readableTarget(item) {
    return [item.resourceType, item.resourceKey].filter(Boolean).join(': ') || 'Technischer Eintrag';
  }

  function statusChip(status, errorCode) {
    const safeStatus = String(status || '—');
    const label = safeStatus === 'success' ? 'Erfolg' : (safeStatus === 'attempt' ? 'Versuch' : (safeStatus === 'failure' ? 'Fehler' : safeStatus));
    const cls = safeStatus === 'success' ? 'cgn-chip cgn-chip--ok' : (safeStatus === 'attempt' ? 'cgn-chip cgn-chip--info' : 'cgn-chip cgn-chip--warn');
    return `<span class="${cls}" title="${escapeHtml(errorCode || safeStatus)}">${escapeHtml(label)}</span>`;
  }

  function setButtonLoading(value) {
    const button = document.getElementById('logsRefreshButton');
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
    loadLogs('initial');
  }

  install();
  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('rdap:module-registry-ready', install);
  window.addEventListener('rdap:main-router-page-change', (event) => {
    if (event && event.detail && event.detail.page === PAGE_ID) loadLogs('page');
  });
})();
