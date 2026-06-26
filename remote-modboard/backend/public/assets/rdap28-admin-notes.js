"use strict";

(function () {
  const DEFAULT_TARGET_USER = Object.freeze({
    userUid: "tw:127709954",
    displayName: "ForrestCGN",
    loginName: "forrestcgn",
    status: "default"
  });
  const MAX_NOTE_TEXT_LENGTH = 5000;
  const AUTH_MODEL_ENDPOINT = "/api/remote/auth/model";
  const READ_ENDPOINT_BASE = "/api/remote/admin/users/admin-notes/read";
  const CREATE_ENDPOINT = "/api/remote/admin/users/admin-notes/create";
  const UPDATE_ENDPOINT = "/api/remote/admin/users/admin-notes/update";

  let latestAdminNotesResult = null;
  let latestCanWrite = false;
  let latestReadOk = false;
  let createDialogOpen = false;
  let createInFlight = false;
  let updateState = {
    noteUid: null,
    inFlight: false,
    noticeNoteUid: null,
    noticeOk: null,
    noticeText: ""
  };
  let targetUsersLoaded = false;
  let targetUsers = [DEFAULT_TARGET_USER];
  let filteredTargetUsers = [DEFAULT_TARGET_USER];
  let selectedTargetUser = { ...DEFAULT_TARGET_USER };
  let targetUserSearchTerm = "";
  let latestAuthModelResult = null;
  let adminDetailSearchTerm = "";
  let selectedAdminDetailUser = { ...DEFAULT_TARGET_USER };
  let notesBridgeContext = null;

  document.addEventListener("DOMContentLoaded", () => {
    injectStyles();
    injectNavigation();
    injectPanel();
    injectAdminUserDetailPanel();
    bindAdminNotesActions();
    bindAdminUserDetailActions();
    exposeTargetSelectionApi();
    restoreInjectedAdminPanelVisibility();
    scheduleRdap40RestoreStateRepair();
    void loadTargetUsers("initial");
    loadAdminNotes("initial");
  });

  window.addEventListener("rdap44:select-admin-note-target", (event) => {
    const detail = event && event.detail ? event.detail : {};
    selectTargetUser(detail.user || detail, { source: "event" });
  });

  function injectStyles() {
    if (document.getElementById("rdap40AdminNotesStyle")) return;
    const style = document.createElement("style");
    style.id = "rdap40AdminNotesStyle";
    style.textContent = `
      [data-page-panel][hidden]{display:none!important}
      .rdap-view:not(.is-active-view){display:none!important}
      [data-page-panel="admin-notes"].is-active-view{display:grid!important}
      .admin-note-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--gap);margin-bottom:var(--gap)}
      .admin-note-status-card{min-height:92px}
      .admin-note-target-card{display:grid;gap:12px;margin-bottom:var(--gap)}
      .admin-note-target-row{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:10px;align-items:end}
      .admin-note-target-row label{display:grid;gap:6px;color:var(--muted);font-size:12px}
      .admin-note-target-row select,.admin-note-target-search input{width:100%;min-height:38px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(4,7,18,.76);color:var(--text);padding:8px 10px;font:inherit;outline:none;box-sizing:border-box}
      .admin-note-target-row select:focus,.admin-note-target-search input:focus{border-color:rgba(27,216,255,.48);box-shadow:0 0 0 3px rgba(27,216,255,.10)}
      .admin-note-target-tools{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:10px;align-items:end}
      .admin-note-target-search{display:grid;gap:6px;color:var(--muted);font-size:12px}
      .admin-note-target-filter-meta{display:flex;gap:8px;flex-wrap:wrap;align-items:center;color:var(--muted);font-size:12px}
      .admin-note-target-filter-meta strong{color:var(--text)}
      .admin-note-target-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
      .admin-note-target-summary .kv-row strong{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .admin-note-list{display:grid;gap:10px}
      .admin-note-item{padding:12px;border-radius:16px;background:rgba(255,255,255,.052);border:1px solid rgba(255,255,255,.07)}
      .admin-note-item strong,.admin-note-item small{display:block}
      .admin-note-item strong{font-size:14px;color:#fff}
      .admin-note-item small{margin-top:4px;color:var(--muted);font-size:12px}
      .admin-note-text{margin-top:10px;white-space:pre-wrap;line-height:1.45;color:var(--text)}
      .admin-note-empty{padding:18px;border-radius:16px;background:rgba(255,255,255,.045);border:1px dashed rgba(27,216,255,.24);color:var(--muted)}
      .admin-note-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}
      .admin-note-safety{display:grid;gap:8px}
      .admin-note-safety .kv-row strong{font-size:12px}
      .admin-note-error{padding:12px;border-radius:15px;background:rgba(255,84,112,.10);border:1px solid rgba(255,84,112,.24);color:#ffdce3}
      .admin-note-ok{padding:12px;border-radius:15px;background:rgba(69,245,167,.08);border:1px solid rgba(69,245,167,.20);color:#d9ffed}
      .admin-note-info{padding:12px;border-radius:15px;background:rgba(27,216,255,.08);border:1px solid rgba(27,216,255,.20);color:#dff8ff}
      .admin-note-bridge-context{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px;border-radius:16px;background:rgba(27,216,255,.08);border:1px solid rgba(27,216,255,.22);color:#dff8ff}
      .admin-note-bridge-context[hidden]{display:none!important}
      .admin-note-bridge-context strong,.admin-note-bridge-context span{display:block}
      .admin-note-bridge-context span{color:var(--muted);font-size:12px;margin-top:3px}
      .admin-note-bridge-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:flex-end}
      .admin-note-panel-lock{display:flex;gap:10px;align-items:flex-start;padding:12px;border-radius:16px;background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.24);color:var(--muted)}
      .admin-note-panel-lock i{width:28px;height:28px;display:grid;place-items:center;border-radius:999px;background:rgba(255,209,102,.18);color:var(--yellow);font-style:normal;font-weight:900;flex:0 0 auto}
      .admin-note-create-card,.admin-note-update-card{display:grid;gap:10px;margin-top:12px;padding:12px;border-radius:16px;background:rgba(255,255,255,.045);border:1px solid rgba(27,216,255,.18)}
      .admin-note-create-card[hidden],.admin-note-update-card[hidden]{display:none!important}
      .admin-note-create-card label,.admin-note-update-card label{display:grid;gap:6px;color:var(--muted);font-size:12px}
      .admin-note-create-card textarea,.admin-note-update-card textarea{width:100%;min-height:150px;resize:vertical;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(4,7,18,.62);color:var(--text);padding:11px 12px;line-height:1.45;font:inherit;box-sizing:border-box;outline:none}
      .admin-note-create-card textarea:focus,.admin-note-update-card textarea:focus{border-color:rgba(27,216,255,.48);box-shadow:0 0 0 3px rgba(27,216,255,.10)}
      .admin-note-create-meta,.admin-note-update-meta{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:var(--muted);font-size:12px}
      .admin-note-create-meta strong,.admin-note-update-meta strong{color:var(--text)}
      .admin-note-update-card{border-color:rgba(69,245,167,.20);background:rgba(69,245,167,.055)}
      .admin-note-update-notice{margin-top:10px}
      .admin-note-write-available{background:rgba(69,245,167,.08);border-color:rgba(69,245,167,.20)}
      .admin-note-write-locked{background:rgba(255,209,102,.08);border-color:rgba(255,209,102,.24)}
      .admin-note-danger-note{color:#ffdce3}
      .admin-user-detail-card{display:grid;gap:12px;margin-bottom:var(--gap)}
      .admin-user-detail-tools{display:grid;grid-template-columns:minmax(220px,1fr) minmax(220px,1fr) auto;gap:10px;align-items:end}
      .admin-user-detail-tools label{display:grid;gap:6px;color:var(--muted);font-size:12px}
      .admin-user-detail-tools input,.admin-user-detail-tools select{width:100%;min-height:38px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(4,7,18,.76);color:var(--text);padding:8px 10px;font:inherit;outline:none;box-sizing:border-box}
      .admin-user-detail-tools input:focus,.admin-user-detail-tools select:focus{border-color:rgba(27,216,255,.48);box-shadow:0 0 0 3px rgba(27,216,255,.10)}
      .admin-user-detail-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
      .admin-user-detail-summary .kv-row strong{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .admin-user-detail-list{display:grid;gap:8px}
      .admin-user-detail-row{padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07)}
      .admin-user-detail-row strong,.admin-user-detail-row small{display:block}
      .admin-user-detail-row strong{color:#fff;font-size:13px}
      .admin-user-detail-row small{color:var(--muted);font-size:12px;margin-top:3px}
      .admin-user-detail-note{padding:12px;border-radius:16px;background:rgba(27,216,255,.08);border:1px solid rgba(27,216,255,.20);color:#dff8ff}
      @media (max-width:1000px){.admin-user-detail-tools{grid-template-columns:1fr}.admin-user-detail-summary{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media (max-width:1000px){.admin-note-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.admin-note-target-summary{grid-template-columns:1fr}}
      @media (max-width:640px){.admin-note-grid{grid-template-columns:1fr}.admin-note-target-row,.admin-note-target-tools{grid-template-columns:1fr}.admin-user-detail-summary{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function injectNavigation() {
    registerAdminPagesWithShell();
    ensureAdminNavigationFallback();
    bindExistingAdminNavigationButtons();
  }

  function registerAdminPagesWithShell() {
    const registry = window.RemoteModboardModules;
    if (!registry || typeof registry.registerModule !== "function" || typeof registry.registerPage !== "function") return false;

    registry.registerModule({ id: "admin", label: "Admin", icon: "⚙", order: 30, navSubId: "nav-admin" });
    registry.registerPage({ moduleId: "admin", pageId: "admin-user-detail", label: "User-Detail", title: "User-Detail", tab: "read-only", section: "Admin", order: 20 });
    registry.registerPage({ moduleId: "admin", pageId: "admin-notes", label: "Admin-Notizen", title: "Admin-Notizen", tab: "read/create", section: "Admin", order: 30, permission: "admin.users.note.read" });
    if (typeof registry.ensureAllNavigation === "function") registry.ensureAllNavigation();
    return true;
  }

  function ensureAdminNavigationFallback() {
    if (window.RemoteModboardModules && typeof window.RemoteModboardModules.registerPage === "function") return;

    const adminSub = document.getElementById("nav-admin");

    if (adminSub && !adminSub.querySelector('[data-page="admin-user-detail"]')) {
      const detailButton = document.createElement("button");
      detailButton.className = "nav-link";
      detailButton.type = "button";
      detailButton.dataset.section = "Admin";
      detailButton.dataset.title = "User-Detail";
      detailButton.dataset.tab = "read-only";
      detailButton.dataset.page = "admin-user-detail";
      detailButton.textContent = "User-Detail";
      adminSub.insertBefore(detailButton, adminSub.firstChild || null);
    }

    if (adminSub && !adminSub.querySelector('[data-page="admin-notes"]')) {
      const button = document.createElement("button");
      button.className = "nav-link";
      button.type = "button";
      button.dataset.section = "Admin";
      button.dataset.title = "Admin-Notizen";
      button.dataset.tab = "read/create";
      button.dataset.page = "admin-notes";
      button.textContent = "Admin-Notizen";
      adminSub.insertBefore(button, adminSub.firstChild || null);
    }
  }

  function bindExistingAdminNavigationButtons() {
    document.querySelectorAll('[data-page="admin-notes"]').forEach((button) => {
      if (button.dataset.rdapAdminNotesBound === "1") return;
      button.dataset.rdapAdminNotesBound = "1";
      button.addEventListener("click", () => {
        showAdminNotesPanelFromNavigation();
      });
    });

    document.querySelectorAll('[data-page="admin-user-detail"]').forEach((button) => {
      if (button.dataset.rdapAdminUserDetailBound === "1") return;
      button.dataset.rdapAdminUserDetailBound = "1";
      button.addEventListener("click", () => {
        showAdminUserDetailPanelFromNavigation();
      });
    });
  }

  function showAdminNotesPanelFromNavigation() {
    setRdap40Page("admin-notes", { section: "Admin", title: "Admin-Notizen", tab: "read/create" });
    clearNotesBridgeContext();
    document.body.classList.remove("nav-collapsed");
    if (!targetUsersLoaded) void loadTargetUsers("nav");
    loadAdminNotes("nav");
    window.setTimeout(() => setRdap40Page("admin-notes", { section: "Admin", title: "Admin-Notizen", tab: "read/create" }), 0);
    window.setTimeout(() => setRdap40Page("admin-notes", { section: "Admin", title: "Admin-Notizen", tab: "read/create" }), 50);
  }

  function showAdminUserDetailPanelFromNavigation() {
    setRdap40Page("admin-user-detail", { section: "Admin", title: "User-Detail", tab: "read-only" });
    document.body.classList.remove("nav-collapsed");
    if (!targetUsersLoaded) void loadTargetUsers("detail-nav");
    renderAdminUserDetail(latestAuthModelResult);
    window.setTimeout(() => setRdap40Page("admin-user-detail", { section: "Admin", title: "User-Detail", tab: "read-only" }), 0);
    window.setTimeout(() => setRdap40Page("admin-user-detail", { section: "Admin", title: "User-Detail", tab: "read-only" }), 50);
  }

  function injectPanel() {
    const content = document.querySelector(".cgn-content");
    const footer = content ? content.querySelector(".footer") : null;
    if (!content || document.querySelector('[data-page-panel="admin-notes"]')) return;

    const section = document.createElement("section");
    section.className = "rdap-view";
    section.dataset.pagePanel = "admin-notes";
    section.hidden = true;
    section.innerHTML = `
      <section class="page-header module-page-header cgn-card">
        <p class="cgn-eyebrow">Admin / kontrollierter Read, Create und Update</p>
        <h1>Admin-Notizen</h1>
        <p>Anzeige, kontrolliertes Erstellen und kontrolliertes Bearbeiten interner Admin-Notizen. Lesen braucht <strong>admin.users.note.read</strong>, Create/Update brauchen <strong>admin.users.note.write</strong> und serverseitiges <strong>confirmWrite</strong>.</p>
      </section>

      <section class="admin-note-bridge-context cgn-card" id="adminNotesBridgeContext" hidden>
        <div>
          <strong id="adminNotesBridgeTitle">Aus User-Detail geöffnet</strong>
          <span id="adminNotesBridgeText">—</span>
        </div>
        <div class="admin-note-bridge-actions">
          <button class="secondaryButton small" type="button" id="adminNotesBridgeBackButton">Zurück zum User-Detail</button>
          <button class="secondaryButton small" type="button" id="adminNotesBridgeClearButton">Hinweis ausblenden</button>
        </div>
      </section>

      <section class="admin-note-target-card cgn-card">
        <div class="card-head">
          <div><p class="cgn-eyebrow">Zieluser</p><h2>Admin-Notizen für ausgewählten User</h2></div>
          <span class="cgn-chip cgn-chip--info" id="adminNotesTargetPill">Default</span>
        </div>
        <div class="admin-note-target-tools">
          <label class="admin-note-target-search">
            User suchen nach Name, Login oder UID
            <input id="adminNotesTargetSearch" type="search" autocomplete="off" spellcheck="false" placeholder="z. B. Forrest, forrestcgn oder tw:127709954">
          </label>
          <button class="secondaryButton small" type="button" id="adminNotesTargetClearSearchButton">Suche löschen</button>
        </div>
        <div class="admin-note-target-filter-meta" id="adminNotesTargetFilterMeta">—</div>
        <div class="admin-note-target-row">
          <label>
            Zieluser
            <select id="adminNotesTargetSelect" aria-label="Admin-Notiz Zieluser auswählen"></select>
          </label>
          <button class="secondaryButton small" type="button" id="adminNotesTargetReloadButton">User neu laden</button>
        </div>
        <div class="kv-grid admin-note-target-summary">
          <div class="kv-row"><span>Name</span><strong id="adminNotesTargetDisplayName">—</strong></div>
          <div class="kv-row"><span>Login</span><strong id="adminNotesTargetLoginName">—</strong></div>
          <div class="kv-row"><span>UID</span><strong id="adminNotesTargetUserUid">—</strong></div>
        </div>
      </section>

      <section class="admin-note-grid">
        <article class="cgn-card admin-note-status-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Read</p><h2>Status</h2></div><span class="cgn-chip cgn-chip--info" id="adminNotesPill">bereit</span></div>
          <div class="kv-grid">
            <div class="kv-row"><span>canRead</span><strong id="adminNotesCanRead">—</strong></div>
            <div class="kv-row"><span>canWrite</span><strong id="adminNotesCanWrite">—</strong></div>
            <div class="kv-row"><span>Notizen</span><strong id="adminNotesCount">—</strong></div>
            <div class="kv-row"><span>Schema</span><strong id="adminNotesSchema">—</strong></div>
          </div>
        </article>
        <article class="cgn-card admin-note-status-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Write</p><h2>Create/Update</h2></div><span class="cgn-chip cgn-chip--warn" id="adminNotesWritePill">prüfen</span></div>
          <div class="admin-note-panel-lock" id="adminNotesWriteLock">
            <i>!</i>
            <div><strong id="adminNotesWriteLockTitle">Schreibrecht prüfen</strong><span id="adminNotesWriteLockText">Create/Update werden erst nach erfolgreicher Readroute und serverseitigem Schreibrecht angeboten.</span></div>
          </div>
        </article>
        <article class="cgn-card admin-note-status-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Aktion</p><h2>Neu laden</h2></div><span class="cgn-chip cgn-chip--info">Admin-only</span></div>
          <div class="admin-note-actions">
            <button class="secondaryButton small" type="button" id="adminNotesReloadButton">Notizen neu laden</button>
            <button class="secondaryButton small" type="button" id="adminNotesCreateToggleButton" hidden>Neue Notiz</button>
          </div>
        </article>
        <article class="cgn-card admin-note-status-card">
          <div class="card-head"><div><p class="cgn-eyebrow">Grenzen</p><h2>Weiterhin aus</h2></div><span class="cgn-chip cgn-chip--warn">gesperrt</span></div>
          <div class="admin-note-danger-note">Deactivate, Delete und Community-Read bleiben deaktiviert.</div>
        </article>
      </section>

      <section class="page-grid">
        <article class="cgn-card">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Liste</p><h2 id="adminNotesListTitle">Admin-Notizen</h2></div>
            <span class="cgn-chip cgn-chip--info">Read/Create/Update</span>
          </div>
          <div class="admin-note-info" id="adminNotesNotice">Noch nicht geladen.</div>
          <div class="admin-note-list" id="adminNotesList"></div>
        </article>

        <article class="cgn-card">
          <div class="card-head">
            <div><p class="cgn-eyebrow">Create</p><h2>Neue Admin-Notiz</h2></div>
            <span class="cgn-chip cgn-chip--info">confirmWrite</span>
          </div>
          <form class="admin-note-create-card" id="adminNotesCreateForm" hidden>
            <label>
              Notiztext
              <textarea id="adminNotesCreateText" maxlength="5000" spellcheck="true" placeholder="Interne Admin-Notiz eingeben"></textarea>
            </label>
            <div class="admin-note-create-meta">
              <span>Zieluser: <strong id="adminNotesCreateTargetUid">—</strong></span>
              <span><strong id="adminNotesCreateCount">0</strong> / 5000 Zeichen</span>
            </div>
            <div class="admin-note-actions">
              <button class="secondaryButton small" type="submit" id="adminNotesCreateSubmitButton">Notiz erstellen</button>
              <button class="secondaryButton small" type="button" id="adminNotesCreateCancelButton">Abbrechen</button>
            </div>
            <div class="admin-note-panel-lock">
              <i>✓</i>
              <div><strong>Sicherheitsweg</strong><span>Das Frontend sendet nur Create mit confirmWrite=true. Backend entscheidet weiterhin über Session, Permission, Audit, Lock und Readback.</span></div>
            </div>
          </form>
          <div class="admin-note-info" id="adminNotesCreateResult">Create wird nur bei Schreibrecht angezeigt.</div>
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
            <div class="kv-row"><span>Hinweis</span><strong>Update nur aktiv; Deactivate/Delete bleiben aus.</strong></div>
          </div>
        </article>
      </section>
    `;

    if (footer) content.insertBefore(section, footer);
    else content.appendChild(section);

    renderSelectedTargetUser();
    renderTargetSelect();
  }

  function injectAdminUserDetailPanel() {
    const content = document.querySelector(".cgn-content");
    const footer = content ? content.querySelector(".footer") : null;
    if (!content || document.querySelector('[data-page-panel="admin-user-detail"]')) return;

    const section = document.createElement("section");
    section.className = "rdap-view";
    section.dataset.pagePanel = "admin-user-detail";
    section.hidden = true;
    section.innerHTML = `
      <section class="page-header module-page-header cgn-card">
        <p class="cgn-eyebrow">Admin / User-Detail / read-only</p>
        <h1>Admin-User-Detail</h1>
        <p>Einzelansicht fuer Dashboard-User aus dem vorhandenen Auth-Modell. Diese Ansicht zeigt nur Daten an und schreibt keine Rollen, Gruppen, Permissions oder Notizen.</p>
      </section>

      <section class="admin-user-detail-card cgn-card">
        <div class="card-head"><div><p class="cgn-eyebrow">Auswahl</p><h2>User ansehen</h2></div><span class="cgn-chip cgn-chip--info" id="adminUserDetailPill">read-only</span></div>
        <div class="admin-user-detail-tools">
          <label>User suchen<input id="adminUserDetailSearch" type="search" autocomplete="off" spellcheck="false" placeholder="Name, Login oder UID"></label>
          <label>User<select id="adminUserDetailSelect" aria-label="Admin-User-Detail User auswählen"></select></label>
          <button class="secondaryButton small" type="button" id="adminUserDetailOpenNotesButton">Admin-Notizen öffnen</button>
        </div>
        <div class="kv-grid admin-user-detail-summary">
          <div class="kv-row"><span>Name</span><strong id="adminUserDetailName">—</strong></div>
          <div class="kv-row"><span>Login</span><strong id="adminUserDetailLogin">—</strong></div>
          <div class="kv-row"><span>UID</span><strong id="adminUserDetailUid">—</strong></div>
          <div class="kv-row"><span>Status</span><strong id="adminUserDetailStatus">—</strong></div>
          <div class="kv-row"><span>Letzter Login</span><strong id="adminUserDetailLastLogin">—</strong></div>
          <div class="kv-row"><span>Rollen</span><strong id="adminUserDetailRoleCount">—</strong></div>
          <div class="kv-row"><span>Gruppen</span><strong id="adminUserDetailGroupCount">—</strong></div>
          <div class="kv-row"><span>Sessions</span><strong id="adminUserDetailSessionCount">—</strong></div>
        </div>
      </section>

      <section class="page-grid">
        <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Rollen</p><h2>Aktive Rollen</h2></div><span class="cgn-chip cgn-chip--info">read-only</span></div><div class="admin-user-detail-list" id="adminUserDetailRoles">—</div></article>
        <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Gruppen</p><h2>Aktive Gruppen</h2></div><span class="cgn-chip cgn-chip--info">read-only</span></div><div class="admin-user-detail-list" id="adminUserDetailGroups">—</div></article>
        <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Sessions</p><h2>Session-Auszug</h2></div><span class="cgn-chip cgn-chip--info">read-only</span></div><div class="admin-user-detail-list" id="adminUserDetailSessions">—</div></article>
        <article class="cgn-card"><div class="card-head"><div><p class="cgn-eyebrow">Sicherheit</p><h2>Keine Schreibverwaltung</h2></div><span class="cgn-chip cgn-chip--warn">gesperrt</span></div><div class="admin-user-detail-note">Diese Ansicht nutzt nur <strong>/api/remote/auth/model</strong>. Rollen/Gruppen/Permissions werden nicht vergeben oder entzogen. Admin-Notizen werden ueber die bestehende Auswahl geoeffnet.</div></article>
      </section>
    `;

    if (footer) content.insertBefore(section, footer);
    else content.appendChild(section);
    renderAdminUserDetail(null);
  }

  function bindAdminNotesActions() {
    bindClick("adminNotesReloadButton", () => loadAdminNotes("manual"));
    bindClick("adminNotesCreateToggleButton", () => openCreateDialog());
    bindClick("adminNotesCreateCancelButton", () => closeCreateDialog());
    bindClick("adminNotesTargetReloadButton", () => loadTargetUsers("manual"));
    bindClick("adminNotesTargetClearSearchButton", () => clearTargetSearch());
    bindClick("adminNotesBridgeBackButton", () => returnToAdminUserDetailFromNotes());
    bindClick("adminNotesBridgeClearButton", () => clearNotesBridgeContext());

    const search = document.getElementById("adminNotesTargetSearch");
    if (search) {
      search.addEventListener("input", () => {
        targetUserSearchTerm = search.value || "";
        renderTargetSelect();
      });
    }

    const select = document.getElementById("adminNotesTargetSelect");
    if (select) {
      select.addEventListener("change", () => {
        const user = findTargetUser(select.value) || { userUid: select.value };
        selectTargetUser(user, { source: "select" });
      });
    }

    const textarea = document.getElementById("adminNotesCreateText");
    if (textarea) textarea.addEventListener("input", updateCreateCount);

    const form = document.getElementById("adminNotesCreateForm");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        submitCreateNote();
      });
    }
  }

  function bindAdminUserDetailActions() {
    const search = document.getElementById("adminUserDetailSearch");
    if (search) {
      search.addEventListener("input", () => {
        adminDetailSearchTerm = search.value || "";
        renderAdminUserDetail(latestAuthModelResult);
      });
    }

    const select = document.getElementById("adminUserDetailSelect");
    if (select) {
      select.addEventListener("change", () => {
        const user = findTargetUser(select.value) || { userUid: select.value };
        selectAdminDetailUser(user);
      });
    }

    bindClick("adminUserDetailOpenNotesButton", () => openAdminNotesForDetailUser());
  }

  function exposeTargetSelectionApi() {
    window.RdapAdminNotes = window.RdapAdminNotes || {};
    window.RdapAdminNotes.selectTargetUser = (user) => selectTargetUser(user, { source: "api" });
    window.RdapAdminNotes.getSelectedTargetUser = () => ({ ...selectedTargetUser });
    window.RdapAdminNotes.reload = () => loadAdminNotes("api");
    window.RdapAdminNotes.setTargetSearch = (term) => setTargetSearch(term || "");
    window.RdapAdminNotes.openUserDetail = (user) => {
      selectAdminDetailUser(user);
      setRdap40Page("admin-user-detail", { section: "Admin", title: "User-Detail", tab: "read-only" });
    };
    window.RdapAdminNotes.openNotesForUser = (user) => openAdminNotesForUser(user || selectedAdminDetailUser, { source: "api" });
  }

  async function loadTargetUsers(reason) {
    setChipSafe("adminNotesTargetPill", null, reason === "manual" ? "lädt neu" : "lädt");
    const result = await getAdminNotesJson(AUTH_MODEL_ENDPOINT);
    latestAuthModelResult = result;
    const users = extractUsersFromAuthModel(result);
    targetUsers = mergeTargetUsers([DEFAULT_TARGET_USER].concat(users));
    targetUsersLoaded = true;

    if (!findTargetUser(selectedTargetUser.userUid)) {
      targetUsers.unshift(selectedTargetUser);
      targetUsers = mergeTargetUsers(targetUsers);
    }

    renderTargetSelect();
    renderSelectedTargetUser();
    if (!findTargetUser(selectedAdminDetailUser.userUid)) selectedAdminDetailUser = selectedTargetUser || DEFAULT_TARGET_USER;
    renderAdminUserDetail(result);
    setChipSafe("adminNotesTargetPill", result && result.ok, `${targetUsers.length} User`);
  }

  function extractUsersFromAuthModel(result) {
    const body = (result && result.body) || {};
    const model = body.model || {};
    const users = Array.isArray(model.users) ? model.users : [];
    return users.map(normalizeUser).filter(user => user && user.userUid);
  }

  function normalizeUser(user) {
    if (!user || typeof user !== "object") return null;
    const userUid = safeString(user.userUid || user.user_uid || user.uid || "");
    if (!isValidUserUid(userUid)) return null;
    const displayName = safeString(user.displayName || user.display_name || user.loginName || user.login_name || userUid);
    const loginName = safeString(user.loginName || user.login_name || "");
    const status = safeString(user.status || "");
    const roles = safeString(user.roles || "");
    const groups = safeString(user.groups || "");
    const lastLoginAt = safeString(user.lastLoginAt || user.last_login_at || "");
    return { userUid, displayName, loginName, status, roles, groups, lastLoginAt };
  }

  function mergeTargetUsers(users) {
    const map = new Map();
    users.forEach((user) => {
      const normalized = normalizeUser(user);
      if (normalized && !map.has(normalized.userUid)) map.set(normalized.userUid, normalized);
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.userUid === DEFAULT_TARGET_USER.userUid) return -1;
      if (b.userUid === DEFAULT_TARGET_USER.userUid) return 1;
      return String(a.displayName || a.userUid).localeCompare(String(b.displayName || b.userUid), "de");
    });
  }

  function renderTargetSelect() {
    const select = document.getElementById("adminNotesTargetSelect");
    if (!select) return;
    const selectedUid = selectedTargetUser.userUid || DEFAULT_TARGET_USER.userUid;
    filteredTargetUsers = filterTargetUsers(targetUsers, targetUserSearchTerm);

    if (!filteredTargetUsers.some(user => user.userUid === selectedUid)) {
      const selected = findTargetUser(selectedUid) || selectedTargetUser || DEFAULT_TARGET_USER;
      filteredTargetUsers = mergeTargetUsers([selected].concat(filteredTargetUsers));
    }

    select.innerHTML = filteredTargetUsers.map((user) => {
      const label = formatTargetUserLabel(user);
      const selected = user.userUid === selectedUid ? " selected" : "";
      return `<option value="${escapeHtmlLocal(user.userUid)}"${selected}>${escapeHtmlLocal(label)}</option>`;
    }).join("");
    renderTargetFilterMeta();
  }

  function renderSelectedTargetUser() {
    const user = selectedTargetUser || DEFAULT_TARGET_USER;
    setTextSafe("adminNotesTargetDisplayName", user.displayName || user.userUid || "—");
    setTextSafe("adminNotesTargetLoginName", user.loginName ? `@${user.loginName}` : "—");
    setTextSafe("adminNotesTargetUserUid", user.userUid || "—");
    setTextSafe("adminNotesCreateTargetUid", user.userUid || "—");
    setTextSafe("adminNotesListTitle", formatTargetUserTitle(user));
    renderNotesBridgeContext();
    renderTargetSelect();
  }

  function selectTargetUser(user, options) {
    const normalized = normalizeUser(user);
    if (!normalized || !normalized.userUid) return false;
    if (!findTargetUser(normalized.userUid)) targetUsers = mergeTargetUsers(targetUsers.concat([normalized]));
    selectedTargetUser = normalized;
    closeCreateDialog({ keepNotice: true });
    closeUpdateEditor({ keepNotice: false });
    renderSelectedTargetUser();
    if (!(options && options.skipLoad)) loadAdminNotes(options && options.source ? options.source : "select");
    return true;
  }

  function setTargetSearch(term) {
    targetUserSearchTerm = String(term || "");
    const input = document.getElementById("adminNotesTargetSearch");
    if (input) input.value = targetUserSearchTerm;
    renderTargetSelect();
  }

  function clearTargetSearch() {
    setTargetSearch("");
  }

  function renderTargetFilterMeta() {
    const el = document.getElementById("adminNotesTargetFilterMeta");
    if (!el) return;
    const total = targetUsers.length;
    const shown = filteredTargetUsers.length;
    const term = String(targetUserSearchTerm || "").trim();
    el.innerHTML = term
      ? `Filter: <strong>${escapeHtmlLocal(term)}</strong> · ${shown} / ${total} User`
      : `Kein Filter · <strong>${total}</strong> User`;
  }

  function filterTargetUsers(users, term) {
    const needle = String(term || "").trim().toLowerCase();
    if (!needle) return users.slice();
    return users.filter((user) => [user.userUid, user.displayName, user.loginName, user.status]
      .some(value => String(value || "").toLowerCase().includes(needle)));
  }

  function findTargetUser(userUid) {
    const uid = safeString(userUid);
    return targetUsers.find(user => user.userUid === uid) || null;
  }

  async function loadAdminNotes(reason) {
    const targetUserUid = selectedTargetUser && selectedTargetUser.userUid ? selectedTargetUser.userUid : "";
    latestReadOk = false;
    latestCanWrite = false;
    setChipSafe("adminNotesPill", null, reason === "manual" ? "lädt neu" : "lädt");
    setClass("adminNotesNotice", "admin-note-info");
    setTextSafe("adminNotesNotice", "Admin-Notizen werden geladen …");
    setHtmlSafe("adminNotesList", "");

    if (!isValidUserUid(targetUserUid)) {
      const result = { ok: false, httpStatus: 400, body: { reason: "invalid_target_user_uid" } };
      latestAdminNotesResult = result;
      renderAdminNotesResult(result);
      return result;
    }

    const url = `${READ_ENDPOINT_BASE}?targetUserUid=${encodeURIComponent(targetUserUid)}`;
    const result = await getAdminNotesJson(url);
    latestAdminNotesResult = result;
    renderAdminNotesResult(result);
    return result;
  }

  function renderAdminNotesResult(result) {
    const body = (result && result.body) || {};
    const permissions = body.permissions || {};
    const table = body.table || {};
    const targetSummary = body.targetSummary || {};
    const notes = Array.isArray(body.notes) ? body.notes : [];
    const canRead = permissions.effectiveReadPermissionWouldAllow === true || body.canReadAdminNotes === true;
    const canWrite = permissions.effectiveWritePermissionWouldAllow === true || permissions.canWriteAdminNotes === true || body.canWriteAdminNotes === true;
    latestCanWrite = Boolean(canWrite);
    latestReadOk = Boolean(result && result.ok);

    setValueSafe("adminNotesCanRead", canRead);
    setValueSafe("adminNotesCanWrite", canWrite);
    setTextSafe("adminNotesCount", String(valueOr(targetSummary.totalCount, notes.length, 0)));
    setValueSafe("adminNotesSchema", table.schemaReady === true);
    setValueSafe("adminNotesLoggedIn", body.loggedIn);
    setValueSafe("adminNotesDashboardAccess", body.dashboardAccess);
    setTextSafe("adminNotesReadReason", permissions.readReason || body.reason || "—");
    setTextSafe("adminNotesWriteReason", permissions.writeReason || "—");
    renderCreateAvailability(canWrite, result);

    if (!result || !result.ok) {
      setChipSafe("adminNotesPill", false, `HTTP ${result ? result.httpStatus : 0}`);
      const reason = body.reason || body.error || (result && result.error) || "admin_note_read_failed";
      setClass("adminNotesNotice", "admin-note-error");
      setTextSafe("adminNotesNotice", `Nicht geladen: ${reason}`);
      setHtmlSafe("adminNotesList", "");
      return;
    }

    setChipSafe("adminNotesPill", true, `${notes.length} geladen`);

    if (!notes.length) {
      setClass("adminNotesNotice", "admin-note-ok");
      setTextSafe("adminNotesNotice", "Keine Admin-Notizen vorhanden. Mit Schreibrecht kann hier eine neue interne Admin-Notiz erstellt werden.");
      setHtmlSafe("adminNotesList", "");
      return;
    }

    setClass("adminNotesNotice", "admin-note-ok");
    setTextSafe("adminNotesNotice", `${notes.length} Admin-Notiz(en) geladen. Create/Update sind nur sichtbar, wenn admin.users.note.write erlaubt ist.`);
    setHtmlSafe("adminNotesList", notes.map(renderNote).join(""));
    bindUpdateButtons();
  }

  function renderCreateAvailability(canWrite, result) {
    const button = document.getElementById("adminNotesCreateToggleButton");
    const lock = document.getElementById("adminNotesWriteLock");
    const okRead = Boolean(result && result.ok);

    if (button) {
      button.hidden = !(okRead && canWrite);
      button.disabled = !(okRead && canWrite) || createInFlight || updateState.inFlight;
    }

    if (canWrite && okRead) {
      setChipSafe("adminNotesWritePill", true, "Create/Update möglich");
      setTextSafe("adminNotesWriteLockTitle", "Write freigeschaltet");
      setTextSafe("adminNotesWriteLockText", "Schreibrecht wurde serverseitig erkannt. Backend verlangt trotzdem confirmWrite, Audit, Lock und Readback.");
      if (lock) lock.className = "admin-note-panel-lock admin-note-write-available";
      return;
    }

    closeCreateDialog({ keepNotice: true });
    closeUpdateEditor({ keepNotice: true });
    setChipSafe("adminNotesWritePill", false, okRead ? "kein Write" : "Read prüfen");
    setTextSafe("adminNotesWriteLockTitle", okRead ? "Schreiben nicht sichtbar" : "Read nicht verfügbar");
    setTextSafe("adminNotesWriteLockText", okRead
      ? "Create-/Update-Buttons bleiben ausgeblendet, solange kein admin.users.note.write erkennbar ist."
      : "Create/Update werden erst angeboten, wenn die Notiz-Readroute erfolgreich geladen wurde.");
    if (lock) lock.className = "admin-note-panel-lock admin-note-write-locked";
  }

  function renderAdminUserDetail(result) {
    const body = (result && result.body) || (latestAuthModelResult && latestAuthModelResult.body) || {};
    const model = body.model || {};
    const users = mergeTargetUsers([DEFAULT_TARGET_USER].concat(Array.isArray(model.users) ? model.users : targetUsers));
    const filtered = filterTargetUsers(users, adminDetailSearchTerm);
    const currentUid = selectedAdminDetailUser.userUid || selectedTargetUser.userUid || DEFAULT_TARGET_USER.userUid;

    let current = users.find(user => user.userUid === currentUid) || selectedAdminDetailUser || DEFAULT_TARGET_USER;
    if (!filtered.some(user => user.userUid === current.userUid)) filtered.unshift(current);

    const select = document.getElementById("adminUserDetailSelect");
    if (select) {
      select.innerHTML = mergeTargetUsers(filtered).map((user) => {
        const selected = user.userUid === current.userUid ? " selected" : "";
        return `<option value="${escapeHtmlLocal(user.userUid)}"${selected}>${escapeHtmlLocal(formatTargetUserLabel(user))}</option>`;
      }).join("");
    }

    selectedAdminDetailUser = current;
    const roles = findUserRows(model.userRoles, current.userUid, "role_key");
    const groups = findUserRows(model.userGroups, current.userUid, "group_key");
    const sessions = findUserRows(model.sessions, current.userUid, "status");

    setChipSafe("adminUserDetailPill", result && result.ok, result && result.ok ? `${filtered.length} / ${users.length} User` : "read-only");
    setTextSafe("adminUserDetailName", current.displayName || current.userUid || "—");
    setTextSafe("adminUserDetailLogin", current.loginName ? `@${current.loginName}` : "—");
    setTextSafe("adminUserDetailUid", current.userUid || "—");
    setTextSafe("adminUserDetailStatus", current.status || "—");
    setTextSafe("adminUserDetailLastLogin", current.lastLoginAt || current.last_login_at || "—");
    setTextSafe("adminUserDetailRoleCount", String(roles.length));
    setTextSafe("adminUserDetailGroupCount", String(groups.length));
    setTextSafe("adminUserDetailSessionCount", String(sessions.length));
    setHtmlSafe("adminUserDetailRoles", renderAdminUserDetailRows(roles, row => row.role_key || row.roleKey || "role"));
    setHtmlSafe("adminUserDetailGroups", renderAdminUserDetailRows(groups, row => row.group_key || row.groupKey || "group"));
    setHtmlSafe("adminUserDetailSessions", renderAdminUserDetailRows(sessions, row => row.status || "session", row => `created: ${row.created_at || row.createdAt || "—"} · expires: ${row.expires_at || row.expiresAt || "—"} · lastSeen: ${row.last_seen_at || row.lastSeenAt || "—"}`));
  }

  function selectAdminDetailUser(user) {
    const normalized = normalizeUser(user);
    if (!normalized || !normalized.userUid) return false;
    if (!findTargetUser(normalized.userUid)) targetUsers = mergeTargetUsers(targetUsers.concat([normalized]));
    selectedAdminDetailUser = normalized;
    renderAdminUserDetail(latestAuthModelResult);
    return true;
  }

  function openAdminNotesForDetailUser() {
    openAdminNotesForUser(selectedAdminDetailUser || DEFAULT_TARGET_USER, { source: "user-detail" });
  }

  function openAdminNotesForUser(user, options) {
    const normalized = normalizeUser(user || DEFAULT_TARGET_USER);
    if (!normalized || !normalized.userUid) return false;
    notesBridgeContext = {
      userUid: normalized.userUid,
      displayName: normalized.displayName || normalized.userUid,
      loginName: normalized.loginName || "",
      source: options && options.source ? options.source : "user-detail"
    };
    if (!selectTargetUser(normalized, { source: "user-detail", skipLoad: true })) return false;
    setRdap40Page("admin-notes", { section: "Admin", title: "Admin-Notizen", tab: "read/create" });
    renderNotesBridgeContext();
    loadAdminNotes("user-detail");
    return true;
  }

  function renderNotesBridgeContext() {
    const context = notesBridgeContext;
    const box = document.getElementById("adminNotesBridgeContext");
    if (!box) return;
    if (!context || context.userUid !== (selectedTargetUser && selectedTargetUser.userUid)) {
      box.hidden = true;
      return;
    }
    const label = formatTargetUserLabel(context);
    setTextSafe("adminNotesBridgeTitle", "Aus User-Detail geöffnet");
    setTextSafe("adminNotesBridgeText", `${label} wurde aus Admin -> User-Detail übernommen. Read/Create/Update verwenden weiterhin exakt diesen Zieluser.`);
    box.hidden = false;
  }

  function clearNotesBridgeContext() {
    notesBridgeContext = null;
    renderNotesBridgeContext();
  }

  function returnToAdminUserDetailFromNotes() {
    const user = notesBridgeContext ? (findTargetUser(notesBridgeContext.userUid) || notesBridgeContext) : selectedTargetUser;
    selectAdminDetailUser(user || DEFAULT_TARGET_USER);
    setRdap40Page("admin-user-detail", { section: "Admin", title: "User-Detail", tab: "read-only" });
  }

  function findUserRows(rows, userUid, keyField) {
    return (Array.isArray(rows) ? rows : [])
      .filter(row => row && (row.user_uid || row.userUid) === userUid)
      .filter(row => !row.revoked_at && !row.revokedAt && (keyField ? (row[keyField] || row[toCamelKey(keyField)]) : true));
  }

  function renderAdminUserDetailRows(rows, titleFormatter, detailFormatter) {
    const values = Array.isArray(rows) ? rows : [];
    if (!values.length) return '<div class="admin-user-detail-row"><strong>—</strong><small>Keine aktiven Einträge gefunden</small></div>';
    return values.slice(0, 12).map((row) => {
      const title = titleFormatter(row);
      const detail = detailFormatter ? detailFormatter(row) : `granted: ${row.granted_at || row.grantedAt || "—"} · by: ${row.granted_by || row.grantedBy || "—"}`;
      return `<div class="admin-user-detail-row"><strong>${escapeHtmlLocal(title)}</strong><small>${escapeHtmlLocal(detail)}</small></div>`;
    }).join("") + (values.length > 12 ? `<div class="admin-user-detail-row"><strong>+${values.length - 12}</strong><small>weitere Einträge nicht angezeigt</small></div>` : "");
  }

  function renderNote(note) {
    const noteUid = note.noteUid || note.note_uid || "";
    const title = noteUid || "admin-note";
    const status = note.status || "—";
    const updated = note.updatedAt || note.updated_at || note.createdAt || note.created_at || "—";
    const text = note.noteText || note.note_text || "";
    const canUpdate = canShowUpdateForNote(note);
    const isEditing = updateState.noteUid === noteUid;
    const notice = updateState.noticeNoteUid === noteUid && updateState.noticeText
      ? `<div class="admin-note-update-notice ${updateState.noticeOk === false ? "admin-note-error" : "admin-note-ok"}">${escapeHtmlLocal(updateState.noticeText)}</div>`
      : "";
    const actions = canUpdate
      ? `<div class="admin-note-actions"><button class="secondaryButton small admin-note-update-open" type="button" data-note-uid="${escapeHtmlLocal(noteUid)}" ${updateState.inFlight ? "disabled" : ""}>Bearbeiten</button></div>`
      : "";
    return `
      <div class="admin-note-item" data-note-uid="${escapeHtmlLocal(noteUid)}">
        <strong>${escapeHtmlLocal(title)}</strong>
        <small>Status: ${escapeHtmlLocal(status)} · Aktualisiert: ${escapeHtmlLocal(updated)}</small>
        <div class="admin-note-text">${escapeHtmlLocal(text || "—")}</div>
        ${actions}
        ${isEditing ? renderUpdateEditor(note, text) : ""}
        ${notice}
      </div>
    `;
  }

  function canShowUpdateForNote(note) {
    const noteUid = note && (note.noteUid || note.note_uid);
    const status = String((note && note.status) || "").toLowerCase();
    const targetUserUid = selectedTargetUser && selectedTargetUser.userUid ? selectedTargetUser.userUid : "";
    return Boolean(latestReadOk && latestCanWrite && noteUid && isValidUserUid(targetUserUid) && status === "active");
  }

  function renderUpdateEditor(note, text) {
    const noteUid = note.noteUid || note.note_uid || "";
    return `
      <form class="admin-note-update-card" data-update-form="${escapeHtmlLocal(noteUid)}">
        <label>
          Notiz bearbeiten
          <textarea data-update-text="${escapeHtmlLocal(noteUid)}" maxlength="5000" spellcheck="true">${escapeHtmlLocal(text || "")}</textarea>
        </label>
        <div class="admin-note-update-meta">
          <span>Notiz: <strong>${escapeHtmlLocal(noteUid)}</strong></span>
          <span><strong data-update-count="${escapeHtmlLocal(noteUid)}">${String(text || "").length}</strong> / 5000 Zeichen</span>
        </div>
        <div class="admin-note-actions">
          <button class="secondaryButton small admin-note-update-submit" type="submit" data-note-uid="${escapeHtmlLocal(noteUid)}" ${updateState.inFlight ? "disabled" : ""}>Speichern</button>
          <button class="secondaryButton small admin-note-update-cancel" type="button" data-note-uid="${escapeHtmlLocal(noteUid)}" ${updateState.inFlight ? "disabled" : ""}>Abbrechen</button>
        </div>
        <div class="admin-note-panel-lock">
          <i>✓</i>
          <div><strong>Sicherheitsweg</strong><span>Das Frontend sendet nur Update mit confirmWrite=true. Backend entscheidet weiter ueber Session, Permission, Audit, Lock und Readback.</span></div>
        </div>
      </form>
    `;
  }

  function bindUpdateButtons() {
    document.querySelectorAll(".admin-note-update-open").forEach((button) => {
      button.addEventListener("click", () => openUpdateEditor(button.dataset.noteUid || ""));
    });
    document.querySelectorAll(".admin-note-update-cancel").forEach((button) => {
      button.addEventListener("click", () => closeUpdateEditor({ keepNotice: false }));
    });
    document.querySelectorAll(".admin-note-update-card").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const button = form.querySelector(".admin-note-update-submit");
        submitUpdateNote(button ? button.dataset.noteUid : "");
      });
    });
    document.querySelectorAll("[data-update-text]").forEach((textarea) => {
      textarea.addEventListener("input", () => updateUpdateCount(textarea.dataset.updateText || ""));
    });
  }

  function openUpdateEditor(noteUid) {
    if (updateState.inFlight || !latestCanWrite || !latestReadOk || !noteUid) return;
    closeCreateDialog({ keepNotice: true });
    updateState = { noteUid, inFlight: false, noticeNoteUid: null, noticeOk: null, noticeText: "" };
    renderAdminNotesResult(latestAdminNotesResult);
    window.setTimeout(() => {
      const textarea = document.querySelector(`[data-update-text="${cssEscapeLocal(noteUid)}"]`);
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 0);
  }

  function closeUpdateEditor(options) {
    if (updateState.inFlight) return;
    const keepNotice = Boolean(options && options.keepNotice);
    updateState = {
      noteUid: null,
      inFlight: false,
      noticeNoteUid: keepNotice ? updateState.noticeNoteUid : null,
      noticeOk: keepNotice ? updateState.noticeOk : null,
      noticeText: keepNotice ? updateState.noticeText : ""
    };
    if (latestAdminNotesResult) renderAdminNotesResult(latestAdminNotesResult);
  }

  function updateUpdateCount(noteUid) {
    const textarea = document.querySelector(`[data-update-text="${cssEscapeLocal(noteUid)}"]`);
    const counter = document.querySelector(`[data-update-count="${cssEscapeLocal(noteUid)}"]`);
    if (counter) counter.textContent = textarea && typeof textarea.value === "string" ? String(textarea.value.length) : "0";
  }

  async function submitUpdateNote(noteUid) {
    if (updateState.inFlight) return;
    const targetUserUid = selectedTargetUser && selectedTargetUser.userUid ? selectedTargetUser.userUid : "";
    const textarea = document.querySelector(`[data-update-text="${cssEscapeLocal(noteUid)}"]`);
    const noteText = textarea && typeof textarea.value === "string" ? textarea.value.trim() : "";

    if (!latestReadOk || !latestCanWrite) {
      showUpdateResult(noteUid, false, "Update ist nicht freigeschaltet.");
      return;
    }
    if (!isValidUserUid(targetUserUid)) {
      showUpdateResult(noteUid, false, "Zieluser ist ungültig.");
      return;
    }
    if (!noteUid) {
      showUpdateResult(noteUid, false, "Notiz-ID fehlt.");
      return;
    }
    if (!noteText) {
      showUpdateResult(noteUid, false, "Bitte zuerst einen Notiztext eingeben.");
      if (textarea) textarea.focus();
      return;
    }
    if (noteText.length > MAX_NOTE_TEXT_LENGTH) {
      showUpdateResult(noteUid, false, `Notiz ist zu lang. Maximum: ${MAX_NOTE_TEXT_LENGTH} Zeichen.`);
      return;
    }

    updateState = { ...updateState, noteUid, inFlight: true, noticeNoteUid: noteUid, noticeOk: null, noticeText: "Notiz wird gespeichert …" };
    renderAdminNotesResult(latestAdminNotesResult);

    const result = await postAdminNoteJson(UPDATE_ENDPOINT, {
      confirmWrite: true,
      targetUserUid,
      noteUid,
      noteText
    });

    if (!result.ok) {
      const body = (result && result.body) || {};
      const reason = body.reason || body.error || result.error || `HTTP ${result.httpStatus || 0}`;
      updateState = { noteUid, inFlight: false, noticeNoteUid: noteUid, noticeOk: false, noticeText: `Update fehlgeschlagen: ${reason}` };
      renderAdminNotesResult(latestAdminNotesResult);
      return;
    }

    updateState = { noteUid: null, inFlight: false, noticeNoteUid: noteUid, noticeOk: true, noticeText: "Notiz gespeichert. Liste wird aktualisiert …" };
    await loadAdminNotes("update-success");
  }

  function showUpdateResult(noteUid, ok, message) {
    updateState = { ...updateState, noteUid: updateState.noteUid || noteUid, noticeNoteUid: noteUid, noticeOk: ok, noticeText: message };
    if (latestAdminNotesResult) renderAdminNotesResult(latestAdminNotesResult);
  }

  function openCreateDialog() {
    if (!latestCanWrite || createInFlight || updateState.inFlight) return;
    closeUpdateEditor({ keepNotice: true });
    createDialogOpen = true;
    const form = document.getElementById("adminNotesCreateForm");
    if (form) form.hidden = false;
    updateCreateCount();
    window.setTimeout(() => {
      const textarea = document.getElementById("adminNotesCreateText");
      if (textarea) textarea.focus();
    }, 0);
  }

  function closeCreateDialog(options) {
    createDialogOpen = false;
    const form = document.getElementById("adminNotesCreateForm");
    if (form) form.hidden = true;
    const textarea = document.getElementById("adminNotesCreateText");
    if (textarea && !(options && options.keepNotice)) textarea.value = "";
    updateCreateCount();
  }

  function updateCreateCount() {
    const textarea = document.getElementById("adminNotesCreateText");
    const count = textarea && typeof textarea.value === "string" ? textarea.value.length : 0;
    setTextSafe("adminNotesCreateCount", String(count));
  }

  async function submitCreateNote() {
    if (createInFlight) return;
    if (!latestCanWrite) {
      showCreateResult(false, "Create ist nicht freigeschaltet.");
      return;
    }

    const targetUserUid = selectedTargetUser && selectedTargetUser.userUid ? selectedTargetUser.userUid : "";
    if (!isValidUserUid(targetUserUid)) {
      showCreateResult(false, "Zieluser ist ungültig.");
      return;
    }

    const textarea = document.getElementById("adminNotesCreateText");
    const noteText = textarea && typeof textarea.value === "string" ? textarea.value.trim() : "";

    if (!noteText) {
      showCreateResult(false, "Bitte zuerst einen Notiztext eingeben.");
      if (textarea) textarea.focus();
      return;
    }

    if (noteText.length > MAX_NOTE_TEXT_LENGTH) {
      showCreateResult(false, `Notiz ist zu lang. Maximum: ${MAX_NOTE_TEXT_LENGTH} Zeichen.`);
      return;
    }

    createInFlight = true;
    setCreateBusy(true);
    showCreateResult(null, "Notiz wird erstellt …");

    const result = await postAdminNoteJson(CREATE_ENDPOINT, {
      confirmWrite: true,
      targetUserUid,
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
    const noteUid = body.noteUid || (body.note && (body.note.noteUid || body.note.note_uid)) || "neue Notiz";
    showCreateResult(true, `Notiz erstellt: ${noteUid}. Liste wird aktualisiert …`);

    if (textarea) textarea.value = "";
    closeCreateDialog({ keepNotice: true });
    await loadAdminNotes("create-success");
  }

  function setCreateBusy(busy) {
    const submit = document.getElementById("adminNotesCreateSubmitButton");
    const cancel = document.getElementById("adminNotesCreateCancelButton");
    const toggle = document.getElementById("adminNotesCreateToggleButton");
    [submit, cancel, toggle].forEach((button) => {
      if (button) button.disabled = Boolean(busy);
    });
  }

  function showCreateResult(ok, message) {
    const el = document.getElementById("adminNotesCreateResult");
    if (!el) return;
    setClass("adminNotesCreateResult", ok === false ? "admin-note-error" : (ok === true ? "admin-note-ok" : "admin-note-info"));
    el.textContent = message || "";
  }

  async function getAdminNotesJson(url) {
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
        headers: { "Accept": "application/json" }
      });
      const body = await readJsonBody(response);
      return { ok: response.ok && Boolean(body && body.ok !== false), httpStatus: response.status, body };
    } catch (err) {
      return { ok: false, httpStatus: 0, error: err && err.message ? err.message : "request_failed", body: null };
    }
  }

  async function postAdminNoteJson(url, payload) {
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await readJsonBody(response);
      return { ok: response.ok && Boolean(body && body.ok !== false), httpStatus: response.status, body };
    } catch (err) {
      return { ok: false, httpStatus: 0, error: err && err.message ? err.message : "request_failed", body: null };
    }
  }

  async function readJsonBody(response) {
    try {
      return await response.json();
    } catch (err) {
      return { ok: false, reason: "invalid_json_response" };
    }
  }

  function bindClick(id, handler) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", handler);
  }

  function restoreInjectedAdminPanelVisibility() {
    const visibleInjectedPage = getRdap40VisibleInjectedPage();
    const activePage = getRdap40ActiveNavigationPage();
    const title = getRdap40HeaderTitle();

    if (visibleInjectedPage === 'admin-notes' || activePage === 'admin-notes' || title === 'admin-notizen') {
      setRdap40Page('admin-notes', { section: 'Admin', title: 'Admin-Notizen', tab: 'read/create' });
      return;
    }

    if (visibleInjectedPage === 'admin-user-detail' || activePage === 'admin-user-detail' || title === 'user-detail' || title === 'admin-user-detail') {
      setRdap40Page('admin-user-detail', { section: 'Admin', title: 'User-Detail', tab: 'read-only' });
      return;
    }

    const adminNotesPanel = document.querySelector('[data-page-panel="admin-notes"]');
    const adminUserDetailPanel = document.querySelector('[data-page-panel="admin-user-detail"]');
    if (adminNotesPanel) adminNotesPanel.hidden = true;
    if (adminUserDetailPanel) adminUserDetailPanel.hidden = true;
  }

  function scheduleRdap40RestoreStateRepair() {
    [0, 80, 250].forEach((delay) => {
      window.setTimeout(repairRdap40VisibleRouterState, delay);
    });
  }

  function repairRdap40VisibleRouterState() {
    const visibleInjectedPage = getRdap40VisibleInjectedPage();
    if (visibleInjectedPage === 'admin-notes') {
      enforceRdap40PageIfSplit('admin-notes', { section: 'Admin', title: 'Admin-Notizen', tab: 'read/create' });
      return;
    }
    if (visibleInjectedPage === 'admin-user-detail') {
      enforceRdap40PageIfSplit('admin-user-detail', { section: 'Admin', title: 'User-Detail', tab: 'read-only' });
    }
  }

  function enforceRdap40PageIfSplit(page, meta) {
    const activePage = getRdap40ActiveNavigationPage();
    const headerTitle = getRdap40HeaderTitle();
    const routerPage = getRdap40MainRouterPage();
    const expectedTitle = page === 'admin-user-detail' ? 'user-detail' : 'admin-notizen';

    if (activePage !== page || routerPage !== page || headerTitle !== expectedTitle) {
      setRdap40Page(page, meta);
    }
  }

  function getRdap40VisibleInjectedPage() {
    const pages = ['admin-notes', 'admin-user-detail'];
    for (const page of pages) {
      const panel = document.querySelector(`[data-page-panel="${page}"]`);
      if (isRdap40PanelVisible(panel)) return page;
    }
    return '';
  }

  function isRdap40PanelVisible(panel) {
    if (!panel || panel.hidden) return false;
    try {
      const style = window.getComputedStyle(panel);
      if (!style || style.display === 'none' || style.visibility === 'hidden') return false;
      const rect = panel.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    } catch (err) {
      return !panel.hidden;
    }
  }

  function getRdap40ActiveNavigationPage() {
    const active = document.querySelector('.nav-link[data-page].is-active, .nav-link[data-page].active, [data-page].is-active, [data-page].active');
    return active && active.dataset ? (active.dataset.page || '') : '';
  }

  function getRdap40HeaderTitle() {
    const titleEl = document.querySelector('[data-rdap-page-title]') || document.getElementById('pageTitle');
    if (!titleEl) return '';
    const clone = titleEl.cloneNode(true);
    clone.querySelectorAll('.tab-part').forEach((node) => node.remove());
    return String(clone.textContent || '').trim().toLowerCase();
  }

  function getRdap40MainRouterPage() {
    const router = window.RdapMainRouter;
    if (!router || typeof router.getCurrentPage !== 'function') return '';
    try {
      return router.getCurrentPage() || '';
    } catch (err) {
      return '';
    }
  }

  function setRdap40Page(page, meta) {
    const safePage = page === "admin-user-detail" ? "admin-user-detail" : "admin-notes";
    const safeMeta = normalizeRdap40PageMeta(safePage, meta);
    const routed = routeThroughMainRouter(safePage, safeMeta);

    syncRdap40InjectedPanels(safePage);
    syncRdap40NavigationState(safePage);

    if (!routed) {
      syncRdap40HeaderFallback(safeMeta);
    }
  }

  function normalizeRdap40PageMeta(page, meta) {
    const defaults = page === "admin-user-detail"
      ? { section: "Admin", title: "User-Detail", tab: "read-only" }
      : { section: "Admin", title: "Admin-Notizen", tab: "read/create" };

    return {
      section: meta && meta.section ? meta.section : defaults.section,
      title: meta && meta.title ? meta.title : defaults.title,
      tab: meta && meta.tab ? meta.tab : defaults.tab
    };
  }

  function routeThroughMainRouter(page, meta) {
    const router = window.RdapMainRouter;
    if (!router || typeof router.setPage !== "function") return false;

    try {
      router.setPage(page, meta);
      return true;
    } catch (err) {
      return false;
    }
  }

  function syncRdap40InjectedPanels(page) {
    document.querySelectorAll("[data-page-panel]").forEach((panel) => {
      const active = panel.dataset.pagePanel === page;
      panel.hidden = !active;
      panel.classList.toggle("is-active-view", active);
    });
  }

  function syncRdap40NavigationState(page) {
    document.querySelectorAll(".nav-link[data-page], [data-page]").forEach((button) => {
      if (!button.dataset || !button.dataset.page) return;
      const active = button.dataset.page === page;
      button.classList.toggle("active", active);
      button.classList.toggle("is-active", active);
    });
  }

  function syncRdap40HeaderFallback(meta) {
    setTextSafe("sectionLabel", meta.section || "Admin");

    const title = document.querySelector("[data-rdap-page-title]") || document.getElementById("pageTitle");
    if (!title || !meta.title) return;

    const tab = meta.tab ? ` <span class="tab-part">${escapeHtmlLocal(meta.tab)}</span>` : "";
    title.innerHTML = `${escapeHtmlLocal(meta.title)}${tab}`;
  }

  function setTextSafe(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value == null || value === "" ? "—" : String(value);
  }

  function setHtmlSafe(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html || "";
  }

  function setValueSafe(id, value) {
    setTextSafe(id, value === true ? "ja" : (value === false ? "nein" : "—"));
  }

  function setClass(id, className) {
    const el = document.getElementById(id);
    if (el) el.className = className || "";
  }

  function setChipSafe(id, ok, label) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = label || "—";
    el.className = "cgn-chip " + (ok === true ? "cgn-chip--ok" : (ok === false ? "cgn-chip--warn" : "cgn-chip--info"));
  }

  function formatTargetUserLabel(user) {
    const display = safeString(user.displayName || user.display_name || user.userUid || user.user_uid || "User");
    const login = safeString(user.loginName || user.login_name || "");
    const uid = safeString(user.userUid || user.user_uid || "");
    const loginPart = login ? ` @${login}` : "";
    const uidPart = uid ? ` (${uid})` : "";
    return `${display}${loginPart}${uidPart}`;
  }

  function formatTargetUserTitle(user) {
    const display = safeString(user.displayName || user.userUid || "Admin-Notizen");
    return `Admin-Notizen für ${display}`;
  }

  function toCamelKey(value) {
    return String(value || "").replace(/_([a-z])/g, (_, chr) => chr.toUpperCase());
  }

  function valueOr() {
    for (let i = 0; i < arguments.length; i += 1) {
      const value = arguments[i];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return null;
  }

  function isValidUserUid(value) {
    return typeof value === "string" && /^[a-zA-Z0-9:_-]{1,128}$/.test(value.trim());
  }

  function safeString(value) {
    return String(value == null ? "" : value).trim();
  }

  function escapeHtmlLocal(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cssEscapeLocal(value) {
    const text = String(value == null ? "" : value);
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(text);
    return text.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }
}());
