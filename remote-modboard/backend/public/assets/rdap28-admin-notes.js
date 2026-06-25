'use strict';

(function () {
  const TARGET_USER_UID = 'tw:127709954';
  const MAX_NOTE_TEXT_LENGTH = 5000;
  const NOTES_ENDPOINT = `/api/remote/admin/users/admin-notes/read?targetUserUid=${encodeURIComponent(TARGET_USER_UID)}`;
  const CREATE_ENDPOINT = '/api/remote/admin/users/admin-notes/create';

  let latestAdminNotesResult = null;
  let latestCanWrite = false;
  let createDialogOpen = false;
  let createInFlight = false;

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    injectNavigation();
    injectPanel();
    bindAdminNotesActions();
    loadAdminNotes('initial');
  });

  function injectStyles() {
    if (document.getElementById('rdap40AdminNotesStyle')) return;
    const style = document.createElement('style');
    style.id = 'rdap40AdminNotesStyle';
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
      .admin-note-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
      .admin-note-safety{display:grid;gap:8px}
      .admin-note-safety .kv-row strong{font-size:12px}
      .admin-note-error{padding:12px;border-radius:15px;background:rgba(255,84,112,.10);border:1px solid rgba(255,84,112,.24);color:#ffdce3}
      .admin-note-ok{padding:12px;border-radius:15px;background:rgba(69,245,167,.08);border:1px solid rgba(69,245,167,.20);color:#d9ffed}
      .admin-note-info{padding:12px;border-radius:15px;background:rgba(27,216,255,.08);border:1px solid rgba(27,216,255,.20);color:#dff8ff}
      .admin-note-panel-lock{display:flex;gap:10px;align-items:flex-start;padding:12px;border-radius:16px;background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.24);color:var(--muted)}
      .admin-note-panel-lock i{width:28px;height:28px;display:grid;place-items:center;border-radius:999px;background:rgba(255,209,102,.18);color:var(--yellow);font-style:normal;font-weight:900;flex:0 0 auto}
      .admin-note-create-card{display:grid;gap:10px;margin-top:12px;padding:12px;border-radius:16px;background:rgba(255,255,255,.045);border:1px solid rgba(27,216,255,.18)}
      .admin-note-create-card[hidden]{display:none!important}
      .admin-note-create-card label{display:grid;gap:6px;color:var(--muted);font-size:12px}
      .admin-note-create-card textarea{width:100%;min-height:150px;resize:vertical;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(4,7,18,.62);color:var(--text);padding:11px 12px;line-height:1.45;font:inherit;box-sizing:border-box;outline:none}
      .admin-note-create-card textarea:focus{border-color:rgba(27,216,255,.48);box-shadow:0 0 0 3px rgba(27,216,255,.10)}
      .admin-note-create-meta{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:var(--muted);font-size:12px}
      .admin-note-create-meta strong{color:var(--text)}
      .admin-note-write-available{background:rgba(69,245,167,.08);border-color:rgba(69,245,167,.20)}
      .admin-note-write-locked{background:rgba(255,209,102,.08);border-color:rgba(255,209,102,.24)}
      .admin-note-danger-note{color:#ffdce3}
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
    button.dataset.tab = 'read/create';
    button.dataset.page = 'admin-notes';
    button.textContent = 'Admin-Notizen';
    button.addEventListener('click', () => {
      setRdap40Page('admin-notes', {
        section: 'Admin',
        title: 'Admin-Notizen',
        tab: 'read/create'
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
        <p class="cgn-eyebrow">Admin / kontrollierter Create</p>
        <h1>Admin-Notizen</h1>
        <p>Anzeige und kontrolliertes Erstellen interner Admin-Notizen. Lesen braucht <strong>admin.users.note.read</strong>, Erstellen braucht <strong>admin.users.note.write</strong> und serverseitiges <strong>confirmWrite</strong>.</p>
      </section>

      <section class="admin-note-grid">
        <article class="metric-card cgn-card admin-note-status-card"><span>Read</span><strong id="adminNotesCanRead">—</strong><small>admin.users.note.read</small><div class="cgn-progress"><i style="width:72%"></i></div></article>
        <article class="metric-card cgn-card admin-note-status-card"><span>Write</span><strong id="adminNotesCanWrite">—</strong><small>admin.users.note.write</small><div class="cgn-progress cgn-progress--warn"><i style="width:18%"></i></div></article>
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
            <div><p class="cgn-eyebrow">Aktionen</p><h2>Neue interne Notiz</h2></div>
            <span class="cgn-chip cgn-chip--warn" id="adminNotesWritePill">prüft</span>
          </div>
          <div class="admin-note-actions">
            <button class="secondaryButton small" type="button" id="adminNotesReloadButton">Neu laden</button>
            <button class="secondaryButton small" type="button" id="adminNotesCreateToggleButton" hidden>Neue Notiz</button>
          </div>
          <div class="admin-note-panel-lock admin-note-write-locked" id="adminNotesWriteLock" style="margin-top:12px">
            <i>!</i>
            <div>
              <strong id="adminNotesWriteLockTitle">Schreiben gesperrt</strong>
              <span id="adminNotesWriteLockText">Create wird erst sichtbar, wenn die serverseitige Schreibberechtigung erkannt wurde.</span>
            </div>
          </div>
          <form class="admin-note-create-card" id="adminNotesCreateForm" hidden>
            <label>
              Interne Admin-Notiz
              <textarea id="adminNotesCreateText" maxlength="5000" placeholder="Interne Notiz eingeben …"></textarea>
            </label>
            <div class="admin-note-create-meta">
              <span>Zieluser: <strong>tw:127709954</strong></span>
              <span><strong id="adminNotesCreateCount">0</strong> / 5000 Zeichen</span>
            </div>
            <div class="admin-note-actions">
              <button class="secondaryButton small" type="submit" id="adminNotesCreateSubmitButton">Notiz erstellen</button>
              <button class="secondaryButton small" type="button" id="adminNotesCreateCancelButton">Abbrechen</button>
            </div>
            <div class="admin-note-panel-lock">
              <i>✓</i>
              <div>
                <strong>Sicherheitsweg</strong>
                <span>Das Frontend sendet nur Create mit confirmWrite=true. Backend entscheidet weiterhin ueber Session, Permission, Audit, Lock und Readback.</span>
              </div>
            </div>
          </form>
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
            <div class="kv-row"><span>Hinweis</span><strong>Update/Deactivate/Delete bleiben aus.</strong></div>
          </div>
        </article>
      </section>
    `;

    if (footer) content.insertBefore(section, footer);
    else content.appendChild(section);
  }

  function bindAdminNotesActions() {
    bindClick('adminNotesReloadButton', () => loadAdminNotes('manual'));
    bindClick('adminNotesCreateToggleButton', () => openCreateDialog());
    bindClick('adminNotesCreateCancelButton', () => closeCreateDialog());

    const textarea = document.getElementById('adminNotesCreateText');
    if (textarea) {
      textarea.addEventListener('input', updateCreateCount);
    }

    const form = document.getElementById('adminNotesCreateForm');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        submitCreateNote();
      });
    }
  }

  async function loadAdminNotes(reason) {
    const panel = document.querySelector('[data-page-panel="admin-notes"]');
    if (!panel) return;

    setChipSafe('adminNotesPill', false, 'lädt');
    setTextSafe('adminNotesNotice', 'Admin-Notizen werden geladen …');
    setClass('adminNotesNotice', 'admin-note-empty');

    const result = await getAdminNotesJson(NOTES_ENDPOINT);
    latestAdminNotesResult = result;
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

  async function postAdminNoteJson(url, body) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body || {})
      });
      const resultBody = await response.json().catch(() => null);
      return {
        ok: response.ok && resultBody && resultBody.ok !== false,
        httpStatus: response.status,
        body: resultBody,
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
    const canWrite = permissions.effectiveWritePermissionWouldAllow === true || permissions.canWriteAdminNotes === true || body.canWriteAdminNotes === true;
    latestCanWrite = Boolean(canWrite);

    setValueSafe('adminNotesCanRead', canRead);
    setValueSafe('adminNotesCanWrite', canWrite);
    setTextSafe('adminNotesCount', String(valueOr(targetSummary.totalCount, notes.length, 0)));
    setValueSafe('adminNotesSchema', table.schemaReady === true);
    setValueSafe('adminNotesLoggedIn', body.loggedIn);
    setValueSafe('adminNotesDashboardAccess', body.dashboardAccess);
    setTextSafe('adminNotesReadReason', permissions.readReason || body.reason || '—');
    setTextSafe('adminNotesWriteReason', permissions.writeReason || '—');
    renderCreateAvailability(canWrite, result);

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
      setTextSafe('adminNotesNotice', 'Keine Admin-Notizen vorhanden. Mit Schreibrecht kann hier eine neue interne Admin-Notiz erstellt werden.');
      setHtmlSafe('adminNotesList', '');
      return;
    }

    setClass('adminNotesNotice', 'admin-note-ok');
    setTextSafe('adminNotesNotice', `${notes.length} Admin-Notiz(en) geladen. Create ist nur sichtbar, wenn admin.users.note.write erlaubt ist.`);
    setHtmlSafe('adminNotesList', notes.map(renderNote).join(''));
  }

  function renderCreateAvailability(canWrite, result) {
    const button = document.getElementById('adminNotesCreateToggleButton');
    const lock = document.getElementById('adminNotesWriteLock');
    const okRead = Boolean(result && result.ok);

    if (button) {
      button.hidden = !(okRead && canWrite);
      button.disabled = !(okRead && canWrite) || createInFlight;
    }

    if (canWrite && okRead) {
      setChipSafe('adminNotesWritePill', true, 'Create möglich');
      setTextSafe('adminNotesWriteLockTitle', 'Create freigeschaltet');
      setTextSafe('adminNotesWriteLockText', 'Schreibrecht wurde serverseitig erkannt. Backend verlangt trotzdem confirmWrite, Audit, Lock und Readback.');
      if (lock) lock.className = 'admin-note-panel-lock admin-note-write-available';
      return;
    }

    closeCreateDialog({ keepNotice: true });
    setChipSafe('adminNotesWritePill', false, okRead ? 'kein Write' : 'Read prüfen');
    setTextSafe('adminNotesWriteLockTitle', okRead ? 'Schreiben nicht sichtbar' : 'Read nicht verfügbar');
    setTextSafe('adminNotesWriteLockText', okRead
      ? 'Create-Button bleibt ausgeblendet, solange kein admin.users.note.write erkennbar ist.'
      : 'Create wird erst angeboten, wenn die Notiz-Readroute erfolgreich geladen wurde.');
    if (lock) lock.className = 'admin-note-panel-lock admin-note-write-locked';
  }

  function renderNote(note) {
    const title = note.noteUid || note.note_uid || 'admin-note';
    const status = note.status || '—';
    const updated = note.updatedAt || note.updated_at || note.createdAt || note.created_at || '—';
    const text = note.noteText || note.note_text || '';
    return `
      <div class="admin-note-item">
        <strong>${escapeHtmlLocal(title)}</strong>
        <small>Status: ${escapeHtmlLocal(status)} · Aktualisiert: ${escapeHtmlLocal(updated)}</small>
        <div class="admin-note-text">${escapeHtmlLocal(text || '—')}</div>
      </div>
    `;
  }

  function openCreateDialog() {
    if (!latestCanWrite || createInFlight) return;
    createDialogOpen = true;
    const form = document.getElementById('adminNotesCreateForm');
    if (form) form.hidden = false;
    setTextSafe('adminNotesCreateText', document.getElementById('adminNotesCreateText') ? document.getElementById('adminNotesCreateText').value : '');
    updateCreateCount();
    window.setTimeout(() => {
      const textarea = document.getElementById('adminNotesCreateText');
      if (textarea) textarea.focus();
    }, 0);
  }

  function closeCreateDialog(options) {
    createDialogOpen = false;
    const form = document.getElementById('adminNotesCreateForm');
    if (form) form.hidden = true;
    const textarea = document.getElementById('adminNotesCreateText');
    if (textarea && !(options && options.keepNotice)) textarea.value = '';
    updateCreateCount();
  }

  function updateCreateCount() {
    const textarea = document.getElementById('adminNotesCreateText');
    const count = textarea && typeof textarea.value === 'string' ? textarea.value.length : 0;
    setTextSafe('adminNotesCreateCount', String(count));
  }

  async function submitCreateNote() {
    if (createInFlight) return;
    if (!latestCanWrite) {
      showCreateResult(false, 'Create ist nicht freigeschaltet.');
      return;
    }

    const textarea = document.getElementById('adminNotesCreateText');
    const noteText = textarea && typeof textarea.value === 'string' ? textarea.value.trim() : '';

    if (!noteText) {
      showCreateResult(false, 'Bitte zuerst einen Notiztext eingeben.');
      if (textarea) textarea.focus();
      return;
    }

    if (noteText.length > MAX_NOTE_TEXT_LENGTH) {
      showCreateResult(false, `Notiz ist zu lang. Maximum: ${MAX_NOTE_TEXT_LENGTH} Zeichen.`);
      return;
    }

    createInFlight = true;
    setCreateBusy(true);
    showCreateResult(null, 'Notiz wird erstellt …');

    const result = await postAdminNoteJson(CREATE_ENDPOINT, {
      confirmWrite: true,
      targetUserUid: TARGET_USER_UID,
      noteText
    });

    createInFlight = false;
    setCreateBusy(false);

    if (!result.ok) {
      const body = (result && result.body) || {};
      const reason = body.reason || body.error || result.error || `HTTP ${result.httpStatus || 0}`;
      showCreateResult(false, `Create fehlgeschlagen: ${reason}`);
      return;
    }

    const body = result.body || {};
    const noteUid = body.noteUid || (body.note && (body.note.noteUid || body.note.note_uid)) || 'neue Notiz';
    showCreateResult(true, `Notiz erstellt: ${noteUid}. Liste wird aktualisiert …`);

    if (textarea) textarea.value = '';
    closeCreateDialog({ keepNotice: true });
    await loadAdminNotes('create-success');
  }

  function setCreateBusy(busy) {
    const submit = document.getElementById('adminNotesCreateSubmitButton');
    const cancel = document.getElementById('adminNotesCreateCancelButton');
    const toggle = document.getElementById('adminNotesCreateToggleButton');
    const reload = document.getElementById('adminNotesReloadButton');
    if (submit) submit.disabled = Boolean(busy);
    if (cancel) cancel.disabled = Boolean(busy);
    if (toggle) toggle.disabled = Boolean(busy) || !latestCanWrite;
    if (reload) reload.disabled = Boolean(busy);
  }

  function showCreateResult(ok, message) {
    if (ok === true) setClass('adminNotesNotice', 'admin-note-ok');
    else if (ok === false) setClass('adminNotesNotice', 'admin-note-error');
    else setClass('adminNotesNotice', 'admin-note-info');
    setTextSafe('adminNotesNotice', message || '—');
  }

  function setRdap40Page(page, meta) {
    const safePage = cssEscapeLocal(page);
    const exists = document.querySelector(`[data-page-panel="${safePage}"]`);
    const current = exists ? page : 'overview';
    const section = meta && meta.section ? meta.section : 'Admin';
    const title = meta && meta.title ? meta.title : 'Admin-Notizen';
    const tab = meta && meta.tab ? meta.tab : 'read/create';

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

  function bindClick(id, handler) {
    const node = document.getElementById(id);
    if (node) node.addEventListener('click', handler);
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

  function valueOr() {
    for (let i = 0; i < arguments.length; i += 1) {
      const value = arguments[i];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return null;
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
