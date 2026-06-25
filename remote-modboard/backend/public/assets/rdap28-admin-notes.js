'use strict';

(function () {
  const TARGET_USER_UID = 'tw:127709954';
  const NOTES_ENDPOINT = `/api/remote/admin/users/admin-notes/read?targetUserUid=${encodeURIComponent(TARGET_USER_UID)}`;

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    injectNavigation();
    injectPanel();
    bindAdminNotesActions();
    loadAdminNotes('initial');
  });

  function injectStyles() {
    if (document.getElementById('rdap28AdminNotesStyle')) return;
    const style = document.createElement('style');
    style.id = 'rdap28AdminNotesStyle';
    style.textContent = `
      .admin-note-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--gap);margin-bottom:var(--gap)}
      .admin-note-status-card{min-height:92px}
      .admin-note-list{display:grid;gap:10px}
      .admin-note-item{padding:12px;border-radius:16px;background:rgba(255,255,255,.052);border:1px solid rgba(255,255,255,.07)}
      .admin-note-item strong,.admin-note-item small{display:block}
      .admin-note-item strong{font-size:14px;color:#fff}
      .admin-note-item small{margin-top:4px;color:var(--muted);font-size:12px}
      .admin-note-text{margin-top:10px;white-space:pre-wrap;line-height:1.45;color:var(--text)}
      .admin-note-empty{padding:18px;border-radius:16px;background:rgba(255,255,255,.045);border:1px dashed rgba(27,216,255,.24);color:var(--muted)}
      .admin-note-actions{display:flex;gap:8px;flex-wrap:wrap}
      .admin-note-safety{display:grid;gap:8px}
      .admin-note-safety .kv-row strong{font-size:12px}
      .admin-note-error{padding:12px;border-radius:15px;background:rgba(255,84,112,.10);border:1px solid rgba(255,84,112,.24);color:#ffdce3}
      .admin-note-ok{padding:12px;border-radius:15px;background:rgba(69,245,167,.08);border:1px solid rgba(69,245,167,.20);color:#d9ffed}
      .admin-note-panel-lock{display:flex;gap:10px;align-items:flex-start;padding:12px;border-radius:16px;background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.24);color:var(--muted)}
      .admin-note-panel-lock i{width:28px;height:28px;display:grid;place-items:center;border-radius:999px;background:rgba(255,209,102,.18);color:var(--yellow);font-style:normal;font-weight:900}
      @media (max-width:1000px){.admin-note-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media (max-width:640px){.admin-note-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function injectNavigation() {
    const adminSub = document.getElementById('nav-admin');
    if (!adminSub || adminSub.querySelector('[data-page="admin-notes"]')) return;

    const button = document.createElement('button');
    button.className = 'nav-link';
    button.type = 'button';
    button.dataset.section = 'Admin';
    button.dataset.title = 'Admin-Notizen';
    button.dataset.tab = 'read-only';
    button.dataset.page = 'admin-notes';
    button.textContent = 'Admin-Notizen';
    button.addEventListener('click', () => {
      setRdap28Page('admin-notes', {
        section: 'Admin',
        title: 'Admin-Notizen',
        tab: 'read-only'
      });
      document.body.classList.remove('nav-collapsed');
      loadAdminNotes('nav');
    });

    adminSub.insertBefore(button, adminSub.firstChild || null);
  }

  function injectPanel() {
    const content = document.querySelector('.cgn-content');
    const footer = content ? content.querySelector('.footer') : null;
    if (!content || document.querySelector('[data-page-panel="admin-notes"]')) return;

    const section = document.createElement('section');
    section.className = 'rdap-view';
    section.dataset.pagePanel = 'admin-notes';
    section.innerHTML = `
      <section class="page-header module-page-header cgn-card">
        <p class="cgn-eyebrow">Admin / read-only</p>
        <h1>Admin-Notizen</h1>
        <p>Read-only Anzeige der Admin-Notizen. Texte werden nur mit gültiger Session, DashboardAccess und DB-Permission <strong>admin.users.note.read</strong> geladen.</p>
      </section>

      <section class="admin-note-grid">
        <article class="metric-card cgn-card admin-note-status-card"><span>Read</span><strong id="adminNotesCanRead">—</strong><small>admin.users.note.read</small><div class="cgn-progress"><i style="width:72%"></i></div></article>
        <article class="metric-card cgn-card admin-note-status-card"><span>Write</span><strong id="adminNotesCanWrite">—</strong><small>muss false bleiben</small><div class="cgn-progress cgn-progress--warn"><i style="width:8%"></i></div></article>
        <article class="metric-card cgn-card admin-note-status-card"><span>Notizen</span><strong id="adminNotesCount">—</strong><small>für Zieluser</small><div class="cgn-progress"><i style="width:45%"></i></div></article>
        <article class="metric-card cgn-card admin-note-status-card"><span>Tabelle</span><strong id="adminNotesSchema">—</strong><small>Schema</small><div class="cgn-progress"><i style="width:68%"></i></div></article>
      </section>

      <section class="page-grid">
        <article class="cgn-card span2">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Notizen</p><h2>ForrestCGN / tw:127709954</h2></div>
            <span class="cgn-chip" id="adminNotesPill">lädt</span>
          </div>
          <div id="adminNotesNotice" class="admin-note-empty">Noch nicht geladen.</div>
          <div class="admin-note-list" id="adminNotesList"></div>
        </article>

        <article class="cgn-card">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Aktionen</p><h2>Nur anzeigen</h2></div>
            <span class="cgn-chip cgn-chip--warn">keine Writes</span>
          </div>
          <div class="admin-note-actions">
            <button class="secondaryButton small" type="button" id="adminNotesReloadButton">Neu laden</button>
          </div>
          <div class="admin-note-panel-lock" style="margin-top:12px">
            <i>!</i>
            <div>
              <strong>Schreiben bleibt gesperrt</strong>
              <span>Notizen erstellen, ändern oder löschen kommt erst später mit eigener Permission, Confirm, Audit, Lock und separatem Go.</span>
            </div>
          </div>
        </article>

        <article class="cgn-card">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Sicherheit</p><h2>Serverseitige Prüfung</h2></div>
            <span class="cgn-chip cgn-chip--info">Option B</span>
          </div>
          <div class="kv-grid admin-note-safety">
            <div class="kv-row"><span>loggedIn</span><strong id="adminNotesLoggedIn">—</strong></div>
            <div class="kv-row"><span>dashboardAccess</span><strong id="adminNotesDashboardAccess">—</strong></div>
            <div class="kv-row"><span>readReason</span><strong id="adminNotesReadReason">—</strong></div>
            <div class="kv-row"><span>writeReason</span><strong id="adminNotesWriteReason">—</strong></div>
            <div class="kv-row"><span>Hinweis</span><strong>Allowlist-Owner allein reicht nicht.</strong></div>
          </div>
        </article>
      </section>
    `;

    if (footer) content.insertBefore(section, footer);
    else content.appendChild(section);
  }

  function bindAdminNotesActions() {
    const button = document.getElementById('adminNotesReloadButton');
    if (button) button.addEventListener('click', () => loadAdminNotes('manual'));
  }

  async function loadAdminNotes(reason) {
    const panel = document.querySelector('[data-page-panel="admin-notes"]');
    if (!panel) return;

    setChipSafe('adminNotesPill', false, 'lädt');
    setTextSafe('adminNotesNotice', 'Admin-Notizen werden geladen …');
    setClass('adminNotesNotice', 'admin-note-empty');

    const result = await getAdminNotesJson(NOTES_ENDPOINT);
    renderAdminNotes(result, reason);
  }

  async function getAdminNotesJson(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      const body = await response.json().catch(() => null);
      return {
        ok: response.ok && body && body.ok !== false,
        httpStatus: response.status,
        body,
        error: null
      };
    } catch (err) {
      return {
        ok: false,
        httpStatus: 0,
        body: null,
        error: err && err.message ? err.message : 'fetch_failed'
      };
    }
  }

  function renderAdminNotes(result) {
    const body = (result && result.body) || {};
    const permissions = body.permissions || {};
    const table = body.table || {};
    const targetSummary = body.targetSummary || {};
    const notes = Array.isArray(body.notes) ? body.notes : [];
    const canRead = permissions.effectiveReadPermissionWouldAllow === true || body.canReadAdminNotes === true;
    const canWrite = permissions.effectiveWritePermissionWouldAllow === true || permissions.canWriteAdminNotes === true;

    setValueSafe('adminNotesCanRead', canRead);
    setValueSafe('adminNotesCanWrite', canWrite);
    setTextSafe('adminNotesCount', String(targetSummary.totalCount ?? notes.length ?? 0));
    setValueSafe('adminNotesSchema', table.schemaReady === true);
    setValueSafe('adminNotesLoggedIn', body.loggedIn);
    setValueSafe('adminNotesDashboardAccess', body.dashboardAccess);
    setTextSafe('adminNotesReadReason', permissions.readReason || body.reason || '—');
    setTextSafe('adminNotesWriteReason', permissions.writeReason || '—');

    if (!result || !result.ok) {
      setChipSafe('adminNotesPill', false, `HTTP ${result ? result.httpStatus : 0}`);
      const reason = body.reason || body.error || (result && result.error) || 'admin_note_read_failed';
      setClass('adminNotesNotice', 'admin-note-error');
      setTextSafe('adminNotesNotice', `Nicht geladen: ${reason}`);
      setHtmlSafe('adminNotesList', '');
      return;
    }

    setChipSafe('adminNotesPill', true, `${notes.length} geladen`);

    if (!notes.length) {
      setClass('adminNotesNotice', 'admin-note-ok');
      setTextSafe('adminNotesNotice', 'Keine Admin-Notizen vorhanden. Das ist aktuell korrekt, solange noch keine Notiz erstellt wurde.');
      setHtmlSafe('adminNotesList', '');
      return;
    }

    setClass('adminNotesNotice', 'admin-note-ok');
    setTextSafe('adminNotesNotice', `${notes.length} Admin-Notiz(en) read-only geladen.`);
    setHtmlSafe('adminNotesList', notes.map(renderNote).join(''));
  }

  function renderNote(note) {
    const title = note.noteUid || 'admin-note';
    const status = note.status || '—';
    const updated = note.updatedAt || note.updated_at || note.createdAt || note.created_at || '—';
    const text = note.noteText || '';
    return `
      <div class="admin-note-item">
        <strong>${escapeHtmlLocal(title)}</strong>
        <small>Status: ${escapeHtmlLocal(status)} · Aktualisiert: ${escapeHtmlLocal(updated)}</small>
        <div class="admin-note-text">${escapeHtmlLocal(text || '—')}</div>
      </div>
    `;
  }

  function setRdap28Page(page, meta) {
    const safePage = cssEscapeLocal(page);
    const exists = document.querySelector(`[data-page-panel="${safePage}"]`);
    const current = exists ? page : 'overview';
    const section = meta && meta.section ? meta.section : 'Admin';
    const title = meta && meta.title ? meta.title : 'Admin-Notizen';
    const tab = meta && meta.tab ? meta.tab : 'read-only';

    document.querySelectorAll('.nav-link[data-page]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.page === current);
    });
    document.querySelectorAll('[data-page-panel]').forEach((panel) => {
      panel.classList.toggle('is-active-view', panel.dataset.pagePanel === current);
    });

    setTextSafe('sectionLabel', section);
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
      pageTitle.innerHTML = `${escapeHtmlLocal(title)}${tab ? ` <span class="tab-part">${escapeHtmlLocal(tab)}</span>` : ''}`;
    }
  }

  function setChipSafe(id, ok, text) {
    const node = document.getElementById(id);
    if (!node) return;
    node.textContent = text;
    node.className = ok ? 'cgn-chip cgn-chip--ok' : 'cgn-chip cgn-chip--warn';
  }

  function setValueSafe(id, value) {
    const node = document.getElementById(id);
    if (!node) return;
    node.textContent = value === true ? 'true' : value === false ? 'false' : (value == null || value === '' ? '—' : String(value));
    node.className = value === true ? 'valueTrue' : value === false ? 'valueFalse' : 'valueNeutral';
  }

  function setTextSafe(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value == null || value === '' ? '—' : String(value);
  }

  function setHtmlSafe(id, value) {
    const node = document.getElementById(id);
    if (node) node.innerHTML = value || '';
  }

  function setClass(id, className) {
    const node = document.getElementById(id);
    if (node) node.className = className || '';
  }

  function cssEscapeLocal(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value));
    return String(value).replace(/[^A-Za-z0-9_-]/g, '\\$&');
  }

  function escapeHtmlLocal(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
