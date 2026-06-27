'use strict';

const endpoints = {
  status: '/api/remote/status',
  routes: '/api/remote/routes',
  authMe: '/api/remote/auth/me',
  loginPlan: '/api/remote/auth/login/plan',
  authModel: '/api/remote/auth/model',
  permission: '/api/remote/auth/permissions/check?permission=remote.view',
  lockAudit: '/api/remote/lock-audit/status?db=1',
  schemaAdapter: '/api/remote/lock-audit/schema-adapter/status?db=1',
  syncTwitchProfile: '/api/remote/auth/me/sync-twitch'
};

const endpointLabels = {
  status: 'Serverstatus',
  routes: 'Routen',
  authMe: 'Mein Login',
  loginPlan: 'Login-System',
  authModel: 'Benutzer & Rollen',
  permission: 'Rechteprüfung',
  lockAudit: 'Schutzsystem',
  schemaAdapter: 'Datenmodell',
  syncTwitchProfile: 'Profil aktualisieren'
};

const AUTO_REFRESH_SECONDS = 30;
let refreshTimer = null;
let refreshCountdown = AUTO_REFRESH_SECONDS;
let isLoading = false;
let currentPage = 'overview';
let latestAuthBody = null;
let latestPermissionBody = null;
let latestDashboardResults = null;

const CURRENT_LOCALE = window.RemoteModboardLanguages && typeof window.RemoteModboardLanguages.getLocale === 'function' ? window.RemoteModboardLanguages.getLocale() : 'de';
const rdapModuleManifest = normalizeModuleManifest(window.RemoteModboardModuleManifest || {});
const rdapPageModuleScripts = createPageScriptMap(rdapModuleManifest);
const rdapLoadedModuleScripts = new Map();

const remoteModboardModules = createRemoteModboardModuleRegistry();
window.RemoteModboardModules = remoteModboardModules;

window.addEventListener('scroll', () => {
  document.body.classList.toggle('is-scrolled', window.scrollY > 6);
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  exposeMainRouterApi();
  initializeRemoteModboardModules();
  loadScriptOnce('/assets/modules/ui/refresh-behavior.js');
  injectAdminNotesPolishStyles();
  initAdminNotesHeaderActionsDedup();
  installAdminNotesHumanReadableList();
  bindNavigation();
  bindDelegatedNavigation();
  bindOptional('refreshButton', 'click', () => loadDashboard('manual'));
  bindOptional('clearErrorsButton', 'click', hideErrors);
  bindOptional('logoutButton', 'click', logout);
  bindOptional('deniedLogoutButton', 'click', logout);
  bindOptional('userMenuButton', 'click', toggleSelfProfilePanel);
  bindOptional('selfProfileCloseButton', 'click', closeSelfProfilePanel);
  bindOptional('selfProfileBackdrop', 'click', closeSelfProfilePanel);
  bindOptional('selfProfileLogoutButton', 'click', logout);
  bindOptional('selfProfileAccountButton', 'click', () => { setPage('account'); closeSelfProfilePanel(); });
  bindOptional('selfProfileAccessButton', 'click', () => { setPage('permissions', { section: 'Mein Konto', title: 'Meine Rechte', tab: 'Berechtigungen' }); closeSelfProfilePanel(); });
  bindOptional('selfProfileSyncButton', 'click', syncSelfTwitchProfile);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeSelfProfilePanel(); });
  bindOptional('navToggle', 'click', () => document.body.classList.toggle('nav-collapsed'));
  bindOptional('scrim', 'click', () => document.body.classList.remove('nav-collapsed'));
  startAutoRefresh();
  setPage('overview', { section: 'System', title: 'Übersicht', tab: 'Status' });
  loadDashboard('initial');
});




function normalizeModuleManifest(manifest) {
  const source = manifest && typeof manifest === 'object' ? manifest : {};
  return {
    locale: source.locale || CURRENT_LOCALE,
    version: source.version || '',
    modules: Array.isArray(source.modules) ? source.modules : [],
    pages: Array.isArray(source.pages) ? source.pages : []
  };
}

function createPageScriptMap(manifest) {
  const map = new Map([
    ['overview', '/assets/modules/system/overview.js'],
    ['diagnostics', '/assets/modules/system/diagnostics.js'],
    ['routes', '/assets/modules/admin/details.js'],
    ['modules', '/assets/modules/modules/catalog.js'],
    ['account', '/assets/modules/account/status.js'],
    ['permissions', '/assets/modules/account/permissions.js'],
    ['access', '/assets/modules/admin/access.js'],
    ['admin-users', '/assets/modules/admin/users.js'],
    ['connections', '/assets/modules/admin/connections.js'],
    ['admin-notes', '/assets/modules/admin/notes.js']
  ]);
  (manifest.pages || []).forEach((page) => {
    const pageId = normalizePageId(page.pageId || page.id || page.page);
    if (pageId && page.script) map.set(pageId, page.script);
  });
  return map;
}

function translate(key, fallback, params) {
  if (window.RemoteModboardLanguages && typeof window.RemoteModboardLanguages.t === 'function') {
    return window.RemoteModboardLanguages.t(key, fallback, params);
  }
  return fallback || key || '';
}

function localized(value, fallback) {
  if (window.RemoteModboardLanguages && typeof window.RemoteModboardLanguages.resolve === 'function') {
    return window.RemoteModboardLanguages.resolve(value, fallback);
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[CURRENT_LOCALE] || value.de || value.en || Object.values(value).find(Boolean) || fallback || '';
  }
  return value !== undefined && value !== null && String(value) !== '' ? String(value) : (fallback || '');
}

function localizedWithKey(key, value, fallback) {
  const translated = key ? translate(key, '') : '';
  if (translated) return translated;
  return localized(value, fallback);
}

function localizedPageConfig(page, moduleConfig) {
  const moduleLabel = moduleConfig ? localizedWithKey(moduleConfig.labelKey, moduleConfig.label, moduleConfig.id) : '';
  return {
    ...page,
    moduleId: page.moduleId || page.module || 'modules',
    pageId: page.pageId || page.id || page.page,
    label: localizedWithKey(page.labelKey, page.label, page.pageId || page.id || page.page),
    title: localizedWithKey(page.titleKey, page.title, localizedWithKey(page.labelKey, page.label, page.pageId || page.id || page.page)),
    tab: localizedWithKey(page.tabKey, page.tab, ''),
    section: localizedWithKey(page.sectionKey, page.section, moduleLabel),
    description: localizedWithKey(page.descriptionKey, page.description, ''),
    runtime: page.runtime || 'both',
    permission: page.permission || '',
    writePermission: page.writePermission || '',
    hiddenInMainNav: page.hiddenInMainNav === true
  };
}

function localizedModuleConfig(moduleConfig) {
  return {
    ...moduleConfig,
    label: localizedWithKey(moduleConfig.labelKey, moduleConfig.label, moduleConfig.id),
    description: localizedWithKey(moduleConfig.descriptionKey, moduleConfig.description, ''),
    runtime: moduleConfig.runtime || 'both',
    permission: moduleConfig.permission || '',
    hiddenInMainNav: moduleConfig.hiddenInMainNav === true
  };
}

function getManifestModuleById(moduleId) {
  const safeId = normalizePageId(moduleId);
  return (rdapModuleManifest.modules || []).find((item) => normalizePageId(item.id || item.moduleId) === safeId) || null;
}

function getManifestPageById(pageId) {
  const safeId = normalizePageId(pageId);
  return (rdapModuleManifest.pages || []).find((item) => normalizePageId(item.pageId || item.id || item.page) === safeId) || null;
}

function createRemoteModboardModuleRegistry() {
  const modules = new Map();
  const pages = new Map();

  function normalizeId(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function normalizeModule(input) {
    const source = input || {};
    const id = normalizeId(source.id || source.moduleId || source.key);
    if (!id) return null;
    const existing = modules.get(id) || {};
    return {
      ...existing,
      ...source,
      id,
      label: localizedWithKey(source.labelKey || existing.labelKey, source.label !== undefined ? source.label : existing.label, id),
      labelKey: source.labelKey || existing.labelKey || '',
      description: localizedWithKey(source.descriptionKey || existing.descriptionKey, source.description !== undefined ? source.description : existing.description, ''),
      descriptionKey: source.descriptionKey || existing.descriptionKey || '',
      icon: source.icon || existing.icon || '◇',
      order: Number.isFinite(Number(source.order)) ? Number(source.order) : (Number.isFinite(Number(existing.order)) ? Number(existing.order) : 100),
      navSubId: source.navSubId || existing.navSubId || `nav-${id}`,
      runtime: source.runtime || existing.runtime || 'both',
      permission: source.permission || existing.permission || '',
      hiddenInMainNav: source.hiddenInMainNav === true || existing.hiddenInMainNav === true
    };
  }

  function normalizePage(input) {
    const source = input || {};
    const pageId = normalizeId(source.pageId || source.id || source.page);
    const moduleId = normalizeId(source.moduleId || source.module || 'modules');
    if (!pageId || !moduleId) return null;
    const key = `${moduleId}:${pageId}`;
    const existing = pages.get(key) || {};
    return {
      ...existing,
      ...source,
      key,
      pageId,
      moduleId,
      label: localizedWithKey(source.labelKey || existing.labelKey, source.label !== undefined ? source.label : existing.label, localizedWithKey(source.titleKey || existing.titleKey, source.title !== undefined ? source.title : existing.title, pageId)),
      labelKey: source.labelKey || existing.labelKey || '',
      title: localizedWithKey(source.titleKey || existing.titleKey, source.title !== undefined ? source.title : existing.title, localizedWithKey(source.labelKey || existing.labelKey, source.label !== undefined ? source.label : existing.label, pageId)),
      titleKey: source.titleKey || existing.titleKey || '',
      tab: localizedWithKey(source.tabKey || existing.tabKey, source.tab !== undefined ? source.tab : (existing.tab !== undefined ? existing.tab : ''), ''),
      tabKey: source.tabKey || existing.tabKey || '',
      section: localizedWithKey(source.sectionKey || existing.sectionKey, source.section || existing.section || source.moduleLabel || existing.moduleLabel || '', ''),
      sectionKey: source.sectionKey || existing.sectionKey || '',
      order: Number.isFinite(Number(source.order)) ? Number(source.order) : (Number.isFinite(Number(existing.order)) ? Number(existing.order) : 100),
      status: source.status || existing.status || 'active',
      permission: source.permission || existing.permission || '',
      writePermission: source.writePermission || existing.writePermission || '',
      runtime: source.runtime || existing.runtime || 'both',
      description: localizedWithKey(source.descriptionKey || existing.descriptionKey, source.description !== undefined ? source.description : existing.description, ''),
      descriptionKey: source.descriptionKey || existing.descriptionKey || '',
      hiddenInMainNav: source.hiddenInMainNav === true || existing.hiddenInMainNav === true,
      script: source.script || existing.script || rdapPageModuleScripts.get(pageId) || ''
    };
  }

  function registerModule(input) {
    const moduleConfig = normalizeModule(input);
    if (!moduleConfig) return publicApi;
    modules.set(moduleConfig.id, moduleConfig);
    if (document.readyState !== 'loading') ensureModuleNavigation(moduleConfig);
    return publicApi;
  }

  function registerPage(input) {
    const pageConfig = normalizePage(input);
    if (!pageConfig) return publicApi;
    if (!modules.has(pageConfig.moduleId)) {
      const manifestModule = localizedModuleConfig(getManifestModuleById(pageConfig.moduleId) || { id: pageConfig.moduleId, label: pageConfig.section || pageConfig.moduleId });
      if (pageConfig.hiddenInMainNav === true || manifestModule.hiddenInMainNav === true) {
        modules.set(pageConfig.moduleId, normalizeModule(manifestModule));
      } else {
        registerModule(manifestModule);
      }
    }
    pages.set(pageConfig.key, pageConfig);
    if (document.readyState !== 'loading') ensurePageNavigation(pageConfig);
    return publicApi;
  }

  function registerDefaultShell() {
    if (rdapModuleManifest.modules.length || rdapModuleManifest.pages.length) {
      rdapModuleManifest.modules
        .map(localizedModuleConfig)
        .filter((moduleConfig) => !moduleConfig.hiddenInMainNav)
        .forEach(registerModule);

      rdapModuleManifest.pages
        .map((pageConfig) => localizedPageConfig(pageConfig, getManifestModuleById(pageConfig.moduleId || pageConfig.module)))
        .forEach(registerPage);
      return;
    }

    registerModule({ id: 'system', label: 'System', icon: '◆', order: 10, navSubId: 'nav-system', runtime: 'both', permission: 'remote.view' });
    registerPage({ moduleId: 'system', pageId: 'overview', label: 'Übersicht', title: 'Übersicht', tab: 'Status', section: 'System', order: 10, runtime: 'both', permission: 'remote.view', script: '/assets/modules/system/overview.js' });
    registerPage({ moduleId: 'system', pageId: 'diagnostics', label: 'Diagnose', title: 'Diagnose', tab: 'Status', section: 'System', order: 20, runtime: 'both', permission: 'remote.diagnostics.read', script: '/assets/modules/system/diagnostics.js' });

    registerModule({ id: 'modules', label: 'Module', icon: '◇', order: 20, navSubId: 'nav-modules', runtime: 'both', permission: 'remote.modules.read' });
    registerPage({ moduleId: 'modules', pageId: 'modules', label: 'Modulübersicht', title: 'Modulübersicht', tab: 'read-only', section: 'Module', order: 10, runtime: 'both', permission: 'remote.modules.read', script: '/assets/modules/modules/catalog.js' });

    registerModule({ id: 'admin', label: 'Admin', icon: '⚙', order: 30, navSubId: 'nav-admin', runtime: 'both', permission: 'admin.view' });
    registerPage({ moduleId: 'admin', pageId: 'admin-users', label: 'Benutzerverwaltung', title: 'Benutzerverwaltung', tab: 'read-only', section: 'Admin', order: 10, runtime: 'both', permission: 'admin.users.read', script: '/assets/modules/admin/users.js' });
    registerPage({ moduleId: 'admin', pageId: 'admin-notes', label: 'Admin-Notizen', title: 'Admin-Notizen', tab: 'read/create', section: 'Admin', order: 20, runtime: 'both', permission: 'admin.users.note.read', writePermission: 'admin.users.note.write', script: '/assets/modules/admin/notes.js' });
    registerPage({ moduleId: 'admin', pageId: 'connections', label: 'Verbindungen', title: 'Verbindungen', tab: 'read-only', section: 'Admin', order: 30, runtime: 'both', permission: 'admin.connections.read', script: '/assets/modules/admin/connections.js' });
    registerPage({ moduleId: 'admin', pageId: 'routes', label: 'Doku / Details', title: 'Doku / Details', tab: 'read-only', section: 'Admin', order: 90, runtime: 'both', permission: 'admin.details.read', script: '/assets/modules/admin/details.js' });
  }

  function initialize() {
    registerDefaultShell();
    ensureAllNavigation();
    try {
      window.dispatchEvent(new CustomEvent('rdap:module-registry-ready', { detail: getSnapshot() }));
    } catch (err) {}
    return publicApi;
  }

  function ensureAllNavigation() {
    [...modules.values()]
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .forEach(ensureModuleNavigation);
    [...pages.values()]
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .forEach(ensurePageNavigation);
  }

  function ensureModuleNavigation(moduleConfig) {
    const nav = document.querySelector('.cgn-nav');
    if (!nav || !moduleConfig) return null;

    let sub = byId(moduleConfig.navSubId);
    let group = sub ? document.querySelector(`.nav-group[data-target="${cssEscape(moduleConfig.navSubId)}"]`) : null;

    if (!sub || !group) {
      group = document.createElement('button');
      group.className = 'nav-group';
      group.type = 'button';
      group.dataset.target = moduleConfig.navSubId;
      group.dataset.moduleId = moduleConfig.id;
      group.dataset.order = String(moduleConfig.order || 100);
      group.innerHTML = `<span>${escapeHtml(moduleConfig.icon || '◇')}</span><b>${escapeHtml(moduleConfig.label)}</b><i>⌄</i>`;

      sub = document.createElement('div');
      sub.className = 'nav-sub';
      sub.id = moduleConfig.navSubId;
      sub.dataset.moduleId = moduleConfig.id;
      sub.dataset.order = String(moduleConfig.order || 100);

      insertModuleNavigation(nav, group, sub, moduleConfig.order || 100);
    } else {
      group.dataset.moduleId = moduleConfig.id;
      group.dataset.order = String(moduleConfig.order || 100);
      sub.dataset.moduleId = moduleConfig.id;
      sub.dataset.order = String(moduleConfig.order || 100);
    }

    bindNavigation();
    return sub;
  }

  function insertModuleNavigation(nav, group, sub, order) {
    const groups = [...nav.querySelectorAll('.nav-group[data-target]')];
    const nextGroup = groups.find((candidate) => Number(candidate.dataset.order || 100) > Number(order || 100));
    if (nextGroup) {
      nav.insertBefore(group, nextGroup);
      nav.insertBefore(sub, nextGroup);
      return;
    }
    nav.appendChild(group);
    nav.appendChild(sub);
  }

  function ensurePageNavigation(pageConfig) {
    if (!pageConfig) return null;
    if (pageConfig.hiddenInMainNav === true) return null;
    const moduleConfig = modules.get(pageConfig.moduleId) || registerModule({ id: pageConfig.moduleId });
    const sub = ensureModuleNavigation(modules.get(pageConfig.moduleId) || moduleConfig);
    if (!sub) return null;

    let button = sub.querySelector(`.nav-link[data-page="${cssEscape(pageConfig.pageId)}"]`);
    if (!button) {
      button = document.createElement('button');
      button.className = 'nav-link';
      button.type = 'button';
      button.dataset.page = pageConfig.pageId;
      insertPageNavigation(sub, button, pageConfig.order || 100);
    }

    button.dataset.moduleId = pageConfig.moduleId;
    button.dataset.order = String(pageConfig.order || 100);
    button.dataset.section = pageConfig.section || (modules.get(pageConfig.moduleId) && modules.get(pageConfig.moduleId).label) || 'Remote Modboard';
    button.dataset.title = pageConfig.title || pageConfig.label || pageConfig.pageId;
    button.dataset.tab = pageConfig.tab || '';
    if (pageConfig.permission) button.dataset.permission = pageConfig.permission;
    if (pageConfig.writePermission) button.dataset.writePermission = pageConfig.writePermission;
    if (pageConfig.runtime) button.dataset.runtime = pageConfig.runtime;
    if (pageConfig.description) button.dataset.description = pageConfig.description;
    button.title = [pageConfig.description, pageConfig.permission ? `Recht: ${pageConfig.permission}` : '', pageConfig.runtime ? `Modus: ${pageConfig.runtime}` : ''].filter(Boolean).join(' | ');
    button.textContent = pageConfig.label || pageConfig.title || pageConfig.pageId;

    bindNavLink(button);
    return button;
  }

  function insertPageNavigation(sub, button, order) {
    const links = [...sub.querySelectorAll('.nav-link[data-page]')];
    const nextLink = links.find((candidate) => Number(candidate.dataset.order || 100) > Number(order || 100));
    if (nextLink) sub.insertBefore(button, nextLink);
    else sub.appendChild(button);
  }

  function getPage(pageId, moduleId) {
    const safePageId = normalizeId(pageId);
    const safeModuleId = normalizeId(moduleId || '');
    if (safeModuleId) return pages.get(`${safeModuleId}:${safePageId}`) || null;
    return [...pages.values()].find(page => page.pageId === safePageId) || null;
  }

  function getSnapshot() {
    return {
      modules: [...modules.values()].map(item => ({ ...item })),
      pages: [...pages.values()].map(item => ({ ...item }))
    };
  }

  const publicApi = {
    registerModule,
    registerPage,
    initialize,
    ensureAllNavigation,
    getPage,
    getSnapshot,
    manifest: rdapModuleManifest
  };

  return publicApi;
}

function initializeRemoteModboardModules() {
  if (!window.RemoteModboardModules || typeof window.RemoteModboardModules.initialize !== 'function') return;
  window.RemoteModboardModules.initialize();
}

function injectAdminNotesPolishStyles() {
  if (document.getElementById('rdap74AdminNotesHeaderActionsDedupStyle')) return;
  ['rdap73AdminNotesHumanReadableListStyle', 'rdap72AdminNotesHideTechnicalStatusStyle', 'rdap71AdminNotesCleanLayoutStyle', 'rdap69AdminNotesCompactLayoutStyle', 'rdap67AdminNotesPolishStyle'].forEach((id) => {
    const oldStyle = document.getElementById(id);
    if (oldStyle && oldStyle.parentNode) oldStyle.parentNode.removeChild(oldStyle);
  });
  const style = document.createElement('style');
  style.id = 'rdap74AdminNotesHeaderActionsDedupStyle';
  style.textContent = `
    [data-page-panel][hidden]{display:none!important}
    .rdap-view:not(.is-active-view){display:none!important}
    [data-page-panel="admin-notes"].is-active-view{display:grid!important;gap:12px!important}
    [data-page-panel="admin-notes"]{gap:12px!important}
    [data-page-panel="admin-notes"] .module-page-header{padding:14px 16px!important;margin-bottom:0!important;border-radius:18px!important}
    [data-page-panel="admin-notes"] .module-page-header .cgn-eyebrow{font-size:10px!important;margin-bottom:4px!important}
    [data-page-panel="admin-notes"] .module-page-header h1{font-size:22px!important;margin:0!important;line-height:1.12!important}
    [data-page-panel="admin-notes"] .module-page-header p:not(.cgn-eyebrow){margin-top:6px!important;font-size:12px!important;line-height:1.35!important;color:var(--muted)!important;max-width:980px!important}

    .admin-note-target-card{order:1!important;display:grid!important;gap:8px!important;margin-bottom:0!important;padding:12px 14px!important;border-radius:18px!important}
    .admin-note-target-card .card-head{margin-bottom:0!important;display:flex!important;align-items:center!important;gap:10px!important}
    .admin-note-target-card .card-head h2{font-size:18px!important;line-height:1.14!important;margin:0!important}
    .admin-note-target-card .cgn-eyebrow{font-size:10px!important;margin-bottom:3px!important;letter-spacing:.14em!important}
    .admin-note-target-card .cgn-chip{padding:6px 9px!important;font-size:12px!important}
    .admin-note-target-tools{grid-template-columns:minmax(240px,1fr) auto!important;gap:8px!important}
    .admin-note-target-search{font-size:11px!important;gap:5px!important}
    .admin-note-target-row{grid-template-columns:minmax(240px,1fr) auto!important;gap:8px!important;align-items:end!important}
    .admin-note-target-row label{font-size:11px!important;gap:5px!important}
    .admin-note-target-row select,.admin-note-target-search input{min-height:34px!important;border-radius:12px!important;padding:7px 10px!important;font-size:13px!important}
    .admin-note-target-filter-meta{font-size:11px!important;gap:6px!important}
    .admin-note-target-summary{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}
    .admin-note-target-summary .kv-row{min-height:30px!important;padding:6px 9px!important;border-radius:11px!important}
    .admin-note-target-summary .kv-row span{font-size:10.5px!important}
    .admin-note-target-summary .kv-row strong{font-size:12px!important}

    .admin-note-grid{order:2!important;display:grid!important;grid-template-columns:1fr!important;gap:8px!important;margin-bottom:0!important}
    .admin-note-grid .admin-note-status-card{min-height:0!important;padding:0!important;border-radius:18px!important;background:transparent!important;border:0!important;box-shadow:none!important}
    .admin-note-grid .admin-note-status-card:nth-child(3){order:-10!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;padding:10px 12px!important;background:linear-gradient(145deg,rgba(27,216,255,.11),rgba(155,77,255,.06))!important;border:1px solid rgba(27,216,255,.20)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 10px 24px rgba(0,0,0,.14)!important}
    .admin-note-grid .admin-note-status-card:nth-child(3) .card-head{margin:0!important;display:flex!important;align-items:center!important;gap:10px!important;flex:1 1 auto!important}
    .admin-note-grid .admin-note-status-card:nth-child(3) .card-head h2{font-size:18px!important;margin:0!important;line-height:1.1!important}
    .admin-note-grid .admin-note-status-card:nth-child(3) .cgn-eyebrow{font-size:10px!important;margin-bottom:3px!important;letter-spacing:.14em!important}
    .admin-note-grid .admin-note-status-card:nth-child(3) .admin-note-actions{margin:0!important;padding:0!important;border:0!important;display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;flex:0 0 auto!important}
    .admin-note-grid .admin-note-status-card:nth-child(3) .cgn-button,.admin-note-grid .admin-note-status-card:nth-child(3) .secondaryButton{min-height:34px!important;padding:7px 13px!important;border-radius:13px!important;font-size:13px!important}
    .admin-note-grid .admin-note-status-card:not(:nth-child(3)){display:grid!important;grid-template-columns:auto 1fr!important;align-items:center!important;gap:8px!important;padding:8px 10px!important;background:rgba(255,255,255,.035)!important;border:1px solid rgba(255,255,255,.065)!important;box-shadow:none!important}
    .admin-note-grid .admin-note-status-card:not(:nth-child(3)) .card-head{margin:0!important;gap:6px!important;align-items:center!important}
    .admin-note-grid .admin-note-status-card:not(:nth-child(3)) .card-head h2{font-size:13px!important;margin:0!important;line-height:1.1!important;color:var(--muted)!important}
    .admin-note-grid .admin-note-status-card:not(:nth-child(3)) .cgn-eyebrow{font-size:9px!important;margin:0!important;letter-spacing:.13em!important}
    .admin-note-grid .admin-note-status-card:not(:nth-child(3)) .cgn-chip{padding:4px 7px!important;font-size:10.5px!important}
    .admin-note-grid .admin-note-status-card:nth-child(1) .kv-grid{display:flex!important;gap:6px!important;flex-wrap:wrap!important;align-items:center!important}
    .admin-note-grid .admin-note-status-card:nth-child(1) .kv-row{min-height:24px!important;padding:4px 7px!important;border-radius:999px!important;gap:5px!important;background:rgba(255,255,255,.04)!important}
    .admin-note-grid .admin-note-status-card:nth-child(1) .kv-row span,.admin-note-grid .admin-note-status-card:nth-child(1) .kv-row strong{font-size:10.5px!important;line-height:1!important}
    .admin-note-grid .admin-note-status-card:nth-child(2) .admin-note-panel-lock{display:flex!important;align-items:center!important;gap:7px!important;min-height:0!important;padding:6px 8px!important;border-radius:12px!important;font-size:11.5px!important;line-height:1.24!important;background:rgba(255,209,102,.055)!important;border-color:rgba(255,209,102,.16)!important}
    .admin-note-grid .admin-note-status-card:nth-child(2) .admin-note-panel-lock i{width:22px!important;height:22px!important;font-size:12px!important}
    .admin-note-grid .admin-note-status-card:nth-child(2) .admin-note-panel-lock strong{display:inline!important;margin-right:4px!important;font-size:12px!important}
    .admin-note-grid .admin-note-status-card:nth-child(4) .admin-note-danger-note{font-size:11.5px!important;line-height:1.25!important;color:var(--muted)!important}

    [data-page-panel="admin-notes"] > .page-grid{order:3!important;display:grid!important;grid-template-columns:1fr!important;gap:10px!important;align-items:start!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card{padding:13px 14px!important;border-radius:18px!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(1){order:1!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(2){order:0!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(3){display:none!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(2):not(:has(#adminNotesCreateForm:not([hidden]))){display:none!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(2) .card-head{margin-bottom:8px!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(2) .card-head h2{font-size:18px!important;margin:0!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(2) #adminNotesCreateResult{display:none!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(2) .admin-note-panel-lock{padding:8px 10px!important;border-radius:12px!important;font-size:11.5px!important;line-height:1.26!important}
    .admin-note-create-card{gap:8px!important;margin-top:0!important;padding:10px!important;border-radius:14px!important;background:rgba(27,216,255,.055)!important;border-color:rgba(27,216,255,.18)!important}
    .admin-note-create-card textarea{min-height:92px!important;border-radius:13px!important;padding:9px 10px!important;line-height:1.38!important}
    .admin-note-create-meta{align-items:center!important;gap:8px!important;font-size:11.5px!important}

    .admin-note-list-card,.admin-note-list{gap:9px!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(1) .card-head{margin-bottom:8px!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(1) .card-head h2{font-size:18px!important;margin:0!important;line-height:1.14!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(1) .cgn-eyebrow{font-size:10px!important;margin-bottom:3px!important}
    #adminNotesNotice{margin-bottom:9px!important;padding:8px 10px!important;border-radius:12px!important;font-size:12.5px!important;line-height:1.28!important}
    .admin-note-item{position:relative!important;display:grid!important;gap:7px!important;padding:12px 13px 12px 15px!important;border-radius:15px!important;background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(27,216,255,.025))!important;border:1px solid rgba(27,216,255,.15)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 8px 18px rgba(0,0,0,.12)!important}
    .admin-note-item:before{content:""!important;position:absolute!important;left:0!important;top:10px!important;bottom:10px!important;width:3px!important;border-radius:999px!important;background:linear-gradient(180deg,var(--cyan),var(--purple))!important;opacity:.76!important}
    .admin-note-item strong{font-size:14px!important;line-height:1.18!important;color:#fff!important}
    .admin-note-item small{display:flex!important;gap:6px!important;flex-wrap:wrap!important;align-items:center!important;margin-top:0!important;color:var(--muted)!important;font-size:10.5px!important;line-height:1.22!important}
    .admin-note-item small span,.admin-note-item small code{display:inline-flex!important;align-items:center!important;min-height:19px!important;padding:2px 7px!important;border-radius:999px!important;background:rgba(255,255,255,.05)!important;border:1px solid rgba(255,255,255,.06)!important;color:var(--muted)!important;font-family:inherit!important;font-size:10.5px!important}
    .admin-note-text{margin-top:0!important;padding:9px 10px!important;border-radius:12px!important;background:rgba(4,7,18,.42)!important;border:1px solid rgba(255,255,255,.07)!important;white-space:pre-wrap!important;line-height:1.38!important;color:var(--text)!important}
    .admin-note-actions{padding-top:0!important;margin-top:4px!important;border-top:1px solid rgba(255,255,255,.055)!important;gap:7px!important}
    .admin-note-actions .secondaryButton,.admin-note-actions .small{min-height:32px!important;padding:6px 11px!important;border-radius:12px!important;font-size:12.5px!important}
    .admin-note-update-editor{display:grid!important;gap:8px!important;margin-top:2px!important;padding:10px!important;border-radius:14px!important;background:rgba(27,216,255,.06)!important;border:1px solid rgba(27,216,255,.16)!important}
    .admin-note-update-editor textarea{min-height:98px!important;border-radius:13px!important;background:rgba(4,7,18,.64)!important;border:1px solid rgba(255,255,255,.11)!important;color:var(--text)!important;padding:9px 10px!important;line-height:1.38!important}
    .admin-note-ok,.admin-note-error,.admin-note-info{border-radius:12px!important;padding:8px 10px!important;line-height:1.28!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.045)!important}
    .admin-note-ok{background:rgba(69,245,167,.105)!important;border-color:rgba(69,245,167,.26)!important}
    .admin-note-error{background:rgba(255,84,112,.13)!important;border-color:rgba(255,84,112,.30)!important}
    .admin-note-info{background:rgba(27,216,255,.09)!important;border-color:rgba(27,216,255,.23)!important}

    @media (max-width:980px){.admin-note-target-tools,.admin-note-target-row{grid-template-columns:1fr!important}.admin-note-target-summary{grid-template-columns:1fr!important}.admin-note-grid .admin-note-status-card:nth-child(3){align-items:flex-start!important;flex-direction:column!important}.admin-note-grid .admin-note-status-card:nth-child(3) .admin-note-actions{justify-content:flex-start!important}.admin-note-grid .admin-note-status-card:not(:nth-child(3)){grid-template-columns:1fr!important}}
    @media (max-width:640px){[data-page-panel="admin-notes"] .module-page-header h1{font-size:20px!important}.admin-note-grid .admin-note-status-card:nth-child(3){padding:10px!important}.admin-note-grid .admin-note-status-card:nth-child(3) .admin-note-actions{width:100%!important}.admin-note-grid .admin-note-status-card:nth-child(3) .secondaryButton{flex:1 1 auto!important}.admin-note-item{padding:11px 12px 11px 14px!important}.admin-note-create-card textarea,.admin-note-update-editor textarea{min-height:108px!important}}

    /* RDAP72: Normalbetrieb enttechnisieren - Diagnose bleibt im DOM, aber nicht dominant sichtbar. */
    [data-page-panel="admin-notes"] .module-page-header .cgn-eyebrow{display:none!important}
    [data-page-panel="admin-notes"] .module-page-header p:not(.cgn-eyebrow){display:none!important}
    [data-page-panel="admin-notes"] .module-page-header{padding:12px 14px!important}
    [data-page-panel="admin-notes"] .module-page-header h1{font-size:23px!important}
    .admin-note-grid{order:2!important;display:block!important;margin:0!important}
    .admin-note-grid .admin-note-status-card:nth-child(1),
    .admin-note-grid .admin-note-status-card:nth-child(2),
    .admin-note-grid .admin-note-status-card:nth-child(4){display:none!important}
    .admin-note-grid .admin-note-status-card:nth-child(3){display:flex!important;margin:0 0 10px 0!important;padding:9px 12px!important;min-height:0!important;border-radius:16px!important}
    .admin-note-grid .admin-note-status-card:nth-child(3) .cgn-eyebrow{display:none!important}
    .admin-note-grid .admin-note-status-card:nth-child(3) .card-head h2{font-size:0!important}
    .admin-note-grid .admin-note-status-card:nth-child(3) .card-head h2:before{content:"Admin-Notizen";font-size:17px!important;line-height:1.1!important;color:var(--text)!important}
    .admin-note-grid .admin-note-status-card:nth-child(3) .cgn-chip{font-size:11.5px!important;padding:5px 8px!important;opacity:.82!important}
    [data-page-panel="admin-notes"] > .page-grid{gap:10px!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(1){margin-top:0!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(1) .card-head .cgn-chip{font-size:11.5px!important;opacity:.78!important}
    #adminNotesNotice{font-size:12px!important;padding:7px 9px!important}

    /* RDAP73: technische Labels aus der Hauptansicht nehmen und Liste lesbarer benennen. */
    .admin-note-grid .admin-note-status-card:nth-child(3) .cgn-chip{display:none!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(1) .card-head .cgn-chip{display:none!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(1) .card-head{align-items:flex-start!important}
    .admin-note-item > strong:first-child{font-size:16px!important;letter-spacing:0!important}
    .admin-note-item > small{font-size:11.5px!important;color:var(--muted)!important}

    /* RDAP74: Header-Aktionen deduplizieren - Buttons in oberen Header, separate Toolbar ausblenden. */
    [data-page-panel="admin-notes"] .module-page-header{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:14px!important;min-height:58px!important}
    [data-page-panel="admin-notes"] .module-page-header h1{flex:1 1 auto!important}
    [data-page-panel="admin-notes"] .module-page-header.admin-note-header-with-actions{background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(27,216,255,.035))!important}
    [data-page-panel="admin-notes"] .module-page-header .admin-note-header-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;margin:0!important;padding:0!important;border:0!important;flex:0 0 auto!important}
    [data-page-panel="admin-notes"] .module-page-header .admin-note-header-actions .secondaryButton{min-height:36px!important;padding:7px 14px!important;border-radius:14px!important;font-size:13px!important}
    .admin-note-grid .admin-note-status-card:nth-child(3),
    .admin-note-grid .admin-note-status-card.admin-note-action-card-moved{display:none!important}
    [data-page-panel="admin-notes"] > .page-grid > .cgn-card:nth-child(1) .card-head h2{font-size:20px!important}
    #adminNotesNotice{font-size:13px!important}
    @media (max-width:720px){[data-page-panel="admin-notes"] .module-page-header{align-items:flex-start!important;flex-direction:column!important}[data-page-panel="admin-notes"] .module-page-header .admin-note-header-actions{width:100%!important;justify-content:flex-start!important;flex-wrap:wrap!important}[data-page-panel="admin-notes"] .module-page-header .admin-note-header-actions .secondaryButton{flex:1 1 auto!important}}

  `;
  document.head.appendChild(style);
}

function initAdminNotesHeaderActionsDedup() {
  if (document.documentElement.dataset.rdap74HeaderActionsDedupBound === '1') return;
  document.documentElement.dataset.rdap74HeaderActionsDedupBound = '1';

  const relocate = () => {
    const panel = document.querySelector('[data-page-panel="admin-notes"]');
    const header = panel ? panel.querySelector('.module-page-header') : null;
    const actionCard = panel ? panel.querySelector('.admin-note-grid .admin-note-status-card:nth-child(3)') : null;
    const actions = actionCard ? actionCard.querySelector('.admin-note-actions') : null;
    if (!panel || !header || !actionCard || !actions) return false;

    if (actions.dataset.rdap74HeaderActionsMoved === '1') return true;
    actions.dataset.rdap74HeaderActionsMoved = '1';
    actions.classList.add('admin-note-header-actions');
    header.classList.add('admin-note-header-with-actions');
    actionCard.classList.add('admin-note-action-card-moved');
    header.appendChild(actions);
    return true;
  };

  relocate();
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (relocate() || attempts >= 50) window.clearInterval(timer);
  }, 100);

  const observer = new MutationObserver(() => { relocate(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

function installAdminNotesHumanReadableList() {
  if (document.documentElement.dataset.rdap73AdminNotesHumanReadableBound === '1') return;
  document.documentElement.dataset.rdap73AdminNotesHumanReadableBound = '1';

  const apply = () => {
    simplifyAdminNotesNotice();
    document.querySelectorAll('#adminNotesList .admin-note-item').forEach(humanizeAdminNoteItem);
  };

  window.setTimeout(apply, 0);
  window.setTimeout(apply, 100);
  const observer = new MutationObserver(() => window.setTimeout(apply, 0));
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
}

function simplifyAdminNotesNotice() {
  const notice = document.getElementById('adminNotesNotice');
  if (!notice) return;

  const currentText = notice.textContent || '';
  const normalizedCurrentText = currentText.trim();

  if (!normalizedCurrentText) {
    delete notice.dataset.rdap73OriginalText;
    return;
  }

  if (/keine\s+admin-notiz/i.test(normalizedCurrentText) || /keine\s+notiz/i.test(normalizedCurrentText)) {
    delete notice.dataset.rdap73OriginalText;
    return;
  }

  const countMatch = currentText.match(/(\d+)\s+Admin-Notiz/i) || currentText.match(/(\d+)\s+Notiz/i);
  if (!countMatch) {
    delete notice.dataset.rdap73OriginalText;
    return;
  }

  const count = Number(countMatch[1]);
  if (!Number.isFinite(count)) {
    delete notice.dataset.rdap73OriginalText;
    return;
  }

  const label = count === 1 ? '1 Notiz geladen' : `${count} Notizen geladen`;
  if (normalizedCurrentText !== label) {
    notice.dataset.rdap73OriginalText = currentText;
    notice.textContent = label;
  }
}

function humanizeAdminNoteItem(item) {
  if (!item || item.dataset.rdap73Humanized === '1') return;
  const title = item.querySelector('strong');
  if (title) {
    const raw = (title.textContent || '').trim();
    const readable = formatAdminNoteUidTitle(raw);
    if (readable) {
      title.dataset.rdap73OriginalNoteUid = raw;
      title.textContent = readable;
    }
  }

  const meta = item.querySelector('small');
  if (meta) {
    const rawMeta = (meta.textContent || '').trim();
    const readableMeta = formatAdminNoteMeta(rawMeta);
    if (readableMeta) {
      meta.dataset.rdap73OriginalMeta = rawMeta;
      meta.textContent = readableMeta;
    }
  }
  item.dataset.rdap73Humanized = '1';
}

function formatAdminNoteUidTitle(value) {
  const match = String(value || '').match(/^admin_note_(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})_/);
  if (!match) return '';
  const [, year, month, day, hour, minute] = match;
  return `Notiz vom ${day}.${month}.${year} um ${hour}:${minute} Uhr`;
}

function formatAdminNoteMeta(value) {
  const statusMatch = String(value || '').match(/Status:\s*([^·]+?)(?:\s*·|$)/i);
  const dateMatch = String(value || '').match(/Aktualisiert:\s*(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/i);
  const parts = [];
  if (dateMatch) {
    const [, year, month, day, hour, minute] = dateMatch;
    parts.push(`Aktualisiert: ${day}.${month}.${year}, ${hour}:${minute} Uhr`);
  }
  if (statusMatch) {
    const status = statusMatch[1].trim();
    parts.push(status === 'active' ? 'aktiv' : `Status: ${status}`);
  }
  return parts.join(' · ');
}

function bindNavigation() {
  document.querySelectorAll('.nav-group[data-target]').forEach((button) => {
    if (button.dataset.mainRouterGroupBound === '1') return;
    button.dataset.mainRouterGroupBound = '1';
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      const sub = target ? byId(target) : null;
      const open = button.classList.contains('is-open');

      document.querySelectorAll('.nav-group').forEach(node => node.classList.remove('is-open'));
      document.querySelectorAll('.nav-sub').forEach(node => node.classList.remove('is-open'));

      if (!open) {
        button.classList.add('is-open');
        if (sub) sub.classList.add('is-open');
      }
    });
  });

  document.querySelectorAll('.nav-link[data-page]').forEach(bindNavLink);
}

function bindNavLink(button) {
  if (!button || button.dataset.mainRouterPageBound === '1') return;
  button.dataset.mainRouterPageBound = '1';
  button.addEventListener('click', () => {
    setPage(button.dataset.page, readNavMeta(button));
    document.body.classList.remove('nav-collapsed');
  });
}

function bindDelegatedNavigation() {
  if (document.documentElement.dataset.mainRouterDelegationBound === '1') return;
  document.documentElement.dataset.mainRouterDelegationBound = '1';
  document.addEventListener('click', (event) => {
    const button = event.target && event.target.closest ? event.target.closest('.nav-link[data-page]') : null;
    if (!button) return;
    window.setTimeout(() => {
      setPage(button.dataset.page, readNavMeta(button));
      document.body.classList.remove('nav-collapsed');
    }, 0);
  });
}

function readNavMeta(button) {
  return {
    section: button.dataset.section || 'Remote Modboard',
    title: button.dataset.title || button.textContent.trim(),
    tab: button.dataset.tab || ''
  };
}

function setPage(page, meta) {
  const requestedPage = normalizePageId(page || 'overview') || 'overview';
  setModuleLoading(requestedPage, true);

  ensurePageModuleLoaded(requestedPage)
    .then(() => {
      const resolvedPage = document.querySelector(`[data-page-panel="${cssEscape(requestedPage)}"]`) ? requestedPage : 'overview';
      activatePage(resolvedPage, meta);
      if (latestDashboardResults) renderDashboardResults(latestDashboardResults);
    })
    .catch((err) => {
      showErrors(`Modul konnte nicht geladen werden: ${requestedPage} (${err && err.message ? err.message : err})`);
      activatePage('overview', { section: 'System', title: 'Übersicht', tab: 'Status' });
    })
    .finally(() => setModuleLoading(requestedPage, false));
}

function activatePage(page, meta) {
  currentPage = document.querySelector(`[data-page-panel="${cssEscape(page)}"]`) ? page : 'overview';
  const activeLink = document.querySelector(`.nav-link[data-page="${cssEscape(currentPage)}"]`);
  const section = meta && meta.section ? meta.section : (activeLink ? activeLink.dataset.section : 'System');
  const title = meta && meta.title ? meta.title : (activeLink ? activeLink.dataset.title : 'Übersicht');
  const tab = meta && meta.tab ? meta.tab : (activeLink ? activeLink.dataset.tab : 'Status');

  setText('sectionLabel', section);
  const pageTitle = byId('pageTitle');
  if (pageTitle) {
    pageTitle.innerHTML = `${escapeHtml(title)}${tab ? ` <span class="tab-part">${escapeHtml(tab)}</span>` : ''}`;
  }

  document.querySelectorAll('.nav-link[data-page]').forEach((button) => {
    const active = button.dataset.page === currentPage;
    button.classList.toggle('is-active', active);
    button.classList.toggle('active', active);
  });

  document.querySelectorAll('[data-page-panel]').forEach((panel) => {
    const active = panel.dataset.pagePanel === currentPage;
    panel.hidden = !active;
    panel.classList.toggle('is-active-view', active);
  });

  emitPageChange(currentPage, { section, title, tab });
}

function normalizePageId(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function getPageModuleScript(page) {
  const pageId = normalizePageId(page);
  if (!pageId) return '';
  if (window.RemoteModboardModules && typeof window.RemoteModboardModules.getPage === 'function') {
    const registered = window.RemoteModboardModules.getPage(pageId);
    if (registered && registered.script) return registered.script;
  }
  const manifestPage = getManifestPageById(pageId);
  if (manifestPage && manifestPage.script) return manifestPage.script;
  return rdapPageModuleScripts.get(pageId) || '';
}

function ensurePageModuleLoaded(page) {
  const pageId = normalizePageId(page);
  if (!pageId) return Promise.resolve(false);
  if (document.querySelector(`[data-page-panel="${cssEscape(pageId)}"]`) && !document.querySelector(`[data-module-placeholder="${cssEscape(pageId)}"]`)) return Promise.resolve(true);

  const src = getPageModuleScript(pageId);
  if (!src) return Promise.resolve(false);

  return loadScriptOnce(src).then(() => {
    const placeholder = document.querySelector(`[data-module-placeholder="${cssEscape(pageId)}"]`);
    if (placeholder && placeholder.parentNode && document.querySelectorAll(`[data-page-panel="${cssEscape(pageId)}"]`).length > 1) placeholder.remove();
    return true;
  });
}

function loadScriptOnce(src) {
  const cleanSrc = String(src || '').trim();
  if (!cleanSrc) return Promise.resolve(false);
  if (rdapLoadedModuleScripts.has(cleanSrc)) return rdapLoadedModuleScripts.get(cleanSrc);

  const existing = document.querySelector(`script[src="${cssEscape(cleanSrc)}"]`);
  if (existing && existing.dataset.rdapLoaded === '1') {
    const ready = Promise.resolve(true);
    rdapLoadedModuleScripts.set(cleanSrc, ready);
    return ready;
  }

  const promise = new Promise((resolve, reject) => {
    const script = existing || document.createElement('script');
    script.src = cleanSrc;
    script.defer = true;
    script.dataset.rdapModuleScript = '1';
    script.addEventListener('load', () => {
      script.dataset.rdapLoaded = '1';
      resolve(true);
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`script_load_failed:${cleanSrc}`)), { once: true });
    if (!existing) document.head.appendChild(script);
  });

  rdapLoadedModuleScripts.set(cleanSrc, promise);
  return promise;
}

function setModuleLoading(page, loading) {
  const button = document.querySelector(`.nav-link[data-page="${cssEscape(normalizePageId(page))}"]`);
  if (button) button.classList.toggle('is-loading', loading === true);
}

function emitPageChange(page, meta) {
  try {
    window.dispatchEvent(new CustomEvent('rdap:main-router-page-change', { detail: { page, meta } }));
  } catch (err) {}
}

function getCurrentPage() {
  return currentPage;
}

function exposeMainRouterApi() {
  window.RdapMainRouter = {
    setPage,
    loadDashboard,
    getCurrentPage,
    modules: window.RemoteModboardModules || null
  };
}

function startAutoRefresh() {
  stopAutoRefresh();
  refreshCountdown = AUTO_REFRESH_SECONDS;
  updateAutoRefreshText();

  refreshTimer = window.setInterval(() => {
    refreshCountdown -= 1;
    if (refreshCountdown <= 0) {
      loadDashboard('auto');
      refreshCountdown = AUTO_REFRESH_SECONDS;
    }
    updateAutoRefreshText();
  }, 1000);
}

function stopAutoRefresh() {
  if (refreshTimer) window.clearInterval(refreshTimer);
  refreshTimer = null;
}

async function loadDashboard(reason) {
  if (isLoading) return;
  isLoading = true;
  refreshCountdown = AUTO_REFRESH_SECONDS;
  updateAutoRefreshText('lädt…');
  const refreshButton = byId('refreshButton');
  if (refreshButton) refreshButton.disabled = true;

  const dashboardEndpoints = Object.entries(endpoints).filter(([key]) => key !== 'syncTwitchProfile');
  const entries = await Promise.all(dashboardEndpoints.map(async ([key, url]) => {
    const result = await getJson(url);
    return [key, result];
  }));

  const results = Object.fromEntries(entries);

  latestDashboardResults = results;
  renderDashboardResults(results);

  setText('lastUpdatedText', `Aktualisiert: ${new Date().toLocaleString('de-DE')}`);

  isLoading = false;
  if (refreshButton) refreshButton.disabled = false;
  updateAutoRefreshText(reason ? `Auto-Refresh in ${refreshCountdown}s · ${reason}` : undefined);
}


function renderDashboardResults(results) {
  if (!results) return;
  renderScenes(results.authMe, results.status, results.loginPlan);
  renderStatus(results.status);
  renderSecurity(results.status, results.lockAudit, results.loginPlan);
  renderRoutes(results.routes);
  renderAuth(results.authMe, results.permission, results.status);
  renderAccessModel(results.authMe, results.permission, results.authModel);
  renderAdminUsersModel(results.authModel);
  renderLockAudit(results.lockAudit, results.schemaAdapter);
  renderEndpoints(results);
  renderQuickStatus(results);
  renderErrors(results);
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

async function postJson(url) {
  try {
    const response = await fetch(url, {
      method: 'POST',
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

async function syncSelfTwitchProfile() {
  const button = byId('selfProfileSyncButton');
  if (button) button.disabled = true;

  showSelfProfileSyncNotice('loading', 'Profil wird aktualisiert', 'Twitch-Daten werden neu gelesen …');

  const result = await postJson(endpoints.syncTwitchProfile);

  if (result.ok) {
    showSelfProfileSyncNotice('success', 'Profil wurde synchronisiert', 'Avatar und Twitch-Name wurden neu gelesen.');
    await loadDashboard('profile-sync');
    window.setTimeout(() => hideSelfProfileSyncNotice(), 3600);
  } else {
    const detail = result.error || (result.body && (result.body.error || result.body.message)) || `HTTP ${result.httpStatus || 0}`;
    showSelfProfileSyncNotice('error', 'Profil konnte nicht aktualisiert werden', detail);
  }

  if (button) button.disabled = false;
}

function showSelfProfileSyncNotice(state, title, text) {
  const notice = byId('selfProfileSyncNotice');
  if (!notice) return;
  notice.className = `self-profile-sync self-profile-sync--${state || 'info'}`;
  setText('selfProfileSyncTitle', title || 'Profil aktualisieren');
  setText('selfProfileSyncText', text || '—');
  notice.hidden = false;
}

function hideSelfProfileSyncNotice() {
  setHidden('selfProfileSyncNotice', true);
}

async function logout() {
  try {
    await fetch('/api/remote/auth/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
  } catch (err) {}
  window.location.href = '/';
}

function renderScenes(authMe, status, loginPlan) {
  const authBody = (authMe && authMe.body) || {};
  const statusBody = (status && status.body) || {};
  const loginBody = (loginPlan && loginPlan.body) || {};
  const authEnabled = Boolean(statusBody.auth && statusBody.auth.loginEnabled);
  const loggedIn = Boolean(authBody.loggedIn);
  const allowed = Boolean(authBody.dashboardAccess);
  const user = authBody.user || null;
  const loginStartLink = byId('loginStartLink');

  if (loginStartLink) {
    loginStartLink.href = loginBody.centralAuth && loginBody.centralAuth.loginEntryPath
      ? loginBody.centralAuth.loginEntryPath
      : '/api/remote/auth/login/start';
  }

  setHidden('loginScene', authEnabled ? loggedIn : true);
  setHidden('deniedScene', !(authEnabled && loggedIn && !allowed));
  setHidden('dashboardScene', authEnabled ? !allowed : false);

  if (loggedIn && !allowed) {
    setText('deniedUserText', `${user ? (user.displayName || user.loginName || user.userUid) : 'Dieser Twitch-Account'} ist angemeldet, aber noch nicht freigeschaltet. Grund: ${authBody.accessReason || 'not_allowed'}.`);
  }
}

function renderStatus(result) {
  const body = (result && result.body) || {};
  const auth = body.auth || {};
  setText('statusOk', body.ok ? 'Online' : 'Problem');
  setText('statusAuthEnabled', auth.enabled ? 'Aktiv' : 'Problem');
  setText('statusLoginEnabled', auth.loginEnabled ? 'Bereit' : 'Problem');
  setText('statusWriteEnabled', body.writeEnabled ? 'Aktiv' : 'Geschützt');
  setText('statusModuleBuild', body.version ? `v${body.version} – ${body.buildName || 'Remote Modboard'}` : (body.buildName || body.moduleBuild || '—'));
}

function renderQuickStatus(results) {
  const statusBody = (results.status && results.status.body) || {};
  const authMe = (results.authMe && results.authMe.body) || {};
  const auth = statusBody.auth || {};
  const oauth = auth.twitchOAuth || {};
  const agent = statusBody.agent || {};

  setChip('quickService', results.status && results.status.ok, results.status && results.status.ok ? `v${statusBody.version || '0.2.2'} online` : 'Service prüfen');
  setChip('quickLogin', authMe.dashboardAccess === true, authMe.dashboardAccess ? 'Login freigegeben' : (authMe.loggedIn ? 'Login gesperrt' : 'Login nötig'));
  setChip('quickOAuth', oauth.effectiveEnabled === true, oauth.effectiveEnabled ? 'OAuth aktiv' : 'OAuth gated');
  setChip('quickAgent', agent.connected === true, agent.connected ? 'Stream-PC online' : 'Stream-PC offline');
}

function renderSecurity(status, lockAudit, loginPlan) {
  const statusBody = (status && status.body) || {};
  const lockBody = (lockAudit && lockAudit.body) || {};
  const loginBody = (loginPlan && loginPlan.body) || {};
  const agent = statusBody.agent || {};
  const items = [
    ['Login wird vom Server geprüft', Boolean(loginBody.centralAuth && loginBody.centralAuth.prepared)],
    ['Nur freigegebene Benutzer kommen ins Modboard', true],
    ['Änderungen werden serverseitig geprüft', statusBody.writeEnabled === false || lockBody.writeEnabled === false],
    ['Stream-PC-Aktionen sind noch nicht aktiv', agent.actionsEnabled === false || lockBody.agentActionsEnabled === false]
  ];

  const list = byId('securityList');
  if (!list) return;
  list.innerHTML = items.map(([label, ok]) => {
    const state = ok ? 'valueTrue' : 'valueFalse';
    const text = ok ? 'OK' : 'prüfen';
    return `<li><span>${escapeHtml(label)}</span><strong class="${state}">${text}</strong></li>`;
  }).join('');
}

function renderLockAudit(lockAudit, schemaAdapter) {
  const body = (lockAudit && lockAudit.body) || {};
  const schemaBody = (schemaAdapter && schemaAdapter.body) || body;
  const locks = body.locks || {};
  const audit = body.audit || {};
  setChip('lockAuditPill', lockAudit && lockAudit.ok, lockAudit && lockAudit.ok ? 'OK' : 'Problem');
  setText('schemaAdapterPrepared', schemaBody.schemaAdapterPrepared ? 'OK' : 'Problem');
  setText('locksRead', getNested(locks, ['adapter', 'compatibleForRead']) ? 'OK' : 'Problem');
  setText('locksWrite', getNested(locks, ['adapter', 'compatibleForWrite']) ? 'Bereit' : 'Geschützt');
  setText('locksMissing', formatList(getNested(locks, ['adapter', 'missingForWrite'])));
  setText('auditRead', getNested(audit, ['adapter', 'compatibleForRead']) ? 'OK' : 'Problem');
  setText('auditWrite', getNested(audit, ['adapter', 'compatibleForWrite']) ? 'Bereit' : 'Geschützt');
  setText('lockAcquireEnabled', body.lockAcquireEnabled ? 'Aktiv' : 'Nicht aktiv');
  setText('auditInsertEnabled', body.auditInsertEnabled ? 'Aktiv' : 'Nicht aktiv');
}

function renderRoutes(result) {
  const routes = (result && result.body && Array.isArray(result.body.routes)) ? result.body.routes : [];
  setChip('routesPill', result && result.ok, result && result.ok ? `${routes.length} Routen` : 'Fehler');
  const routesList = byId('routesList');
  if (!routesList) return;
  routesList.innerHTML = routes.map(route => `
    <div class="route">
      <span class="method">${escapeHtml(route.method || 'GET')}</span>
      <div>
        <div class="routePath">${escapeHtml(route.path || '')}</div>
        <div class="routeDescription">${escapeHtml(route.description || 'Diagnose-/Auth-Route')}</div>
      </div>
    </div>
  `).join('') || '<div class="route"><span class="method">GET</span><div><div class="routePath">Keine Routen geladen</div></div></div>';
}

function renderAuth(authMe, permission, status) {
  const authBody = (authMe && authMe.body) || {};
  const permissionBody = (permission && permission.body) || {};
  const user = authBody.user || null;
  latestAuthBody = authBody;
  latestPermissionBody = permissionBody;
  renderSelfProfile(authBody, permissionBody);

  setText('loginStateText', authBody.dashboardAccess ? `${user ? (user.displayName || user.loginName || user.userUid) : 'Twitch-User'}` : 'Nicht freigegeben');
  setValue('authLoggedIn', authBody.loggedIn);
  setValue('dashboardAccess', authBody.dashboardAccess);
  setText('accessReason', authBody.accessReason || '—');
  setText('authUser', user ? `${user.displayName || user.loginName || user.userUid} (${user.userUid})` : '—');
  setText('authRoles', formatList(authBody.roles));
  setText('authSessionReason', authBody.session ? authBody.session.reason : '—');
  setValue('permissionAllowed', permissionBody.allowed);
  setText('permissionReason', permissionBody.reason || authBody.reason || '—');
  void status;
}

function toggleSelfProfilePanel() {
  const panel = byId('selfProfilePanel');
  if (!panel || panel.hidden) openSelfProfilePanel();
  else closeSelfProfilePanel();
}

function openSelfProfilePanel() {
  renderSelfProfile(latestAuthBody || {}, latestPermissionBody || {});
  setHidden('selfProfilePanel', false);
  setHidden('selfProfileBackdrop', false);
  document.body.classList.add('self-profile-open');
  const button = byId('userMenuButton');
  if (button) button.setAttribute('aria-expanded', 'true');
}

function closeSelfProfilePanel() {
  setHidden('selfProfilePanel', true);
  setHidden('selfProfileBackdrop', true);
  document.body.classList.remove('self-profile-open');
  const button = byId('userMenuButton');
  if (button) button.setAttribute('aria-expanded', 'false');
}

function renderSelfProfile(authBody, permissionBody) {
  const body = authBody || {};
  const user = body.user || null;
  const displayName = user ? (user.displayName || user.loginName || user.userUid || 'Twitch-User') : 'Nicht angemeldet';
  const loginName = user && user.loginName ? `@${user.loginName}` : '—';
  const avatarUrl = findAvatarUrl(body, user);
  const initial = buildInitial(displayName);

  setText('selfPanelDisplayName', displayName);
  setText('selfPanelLoginName', loginName);
  setText('selfPanelRoles', formatList(body.roles));
  updateAvatar('topUserAvatar', 'topUserAvatarImage', 'topUserAvatarInitial', avatarUrl, initial);
  updateAvatar('selfPanelAvatar', 'selfPanelAvatarImage', 'selfPanelAvatarInitial', avatarUrl, initial);
  void permissionBody;
}

function updateAvatar(containerId, imageId, initialId, avatarUrl, initial) {
  const container = byId(containerId);
  const image = byId(imageId);
  const initialNode = byId(initialId);
  if (initialNode) initialNode.textContent = initial || 'F';

  if (!image || !initialNode) return;
  const safeUrl = typeof avatarUrl === 'string' && /^https:\/\//i.test(avatarUrl.trim()) ? avatarUrl.trim() : '';

  if (!safeUrl) {
    image.hidden = true;
    image.removeAttribute('src');
    initialNode.hidden = false;
    if (container) container.classList.remove('has-image');
    return;
  }

  image.onload = () => {
    image.hidden = false;
    initialNode.hidden = true;
    if (container) container.classList.add('has-image');
  };
  image.onerror = () => {
    image.hidden = true;
    image.removeAttribute('src');
    initialNode.hidden = false;
    if (container) container.classList.remove('has-image');
  };
  image.src = safeUrl;
}

function findAvatarUrl(authBody, user) {
  const candidates = [
    user && user.avatarUrl,
    user && user.avatar_url,
    user && user.profileImageUrl,
    user && user.profile_image_url,
    user && user.providerAvatarUrl,
    user && user.provider_avatar_url,
    authBody && authBody.avatarUrl,
    authBody && authBody.avatar_url,
    authBody && authBody.profileImageUrl,
    authBody && authBody.profile_image_url,
    authBody && authBody.identity && authBody.identity.avatarUrl,
    authBody && authBody.identity && authBody.identity.avatar_url,
    authBody && authBody.identity && authBody.identity.profileImageUrl,
    authBody && authBody.identity && authBody.identity.profile_image_url
  ];
  return candidates.find(value => typeof value === 'string' && value.trim()) || '';
}

function buildInitial(value) {
  const text = String(value || 'F').trim();
  if (!text || text === '—') return 'F';
  return text.replace(/^@+/, '').slice(0, 1).toUpperCase();
}

function renderAccessModel(authMe, permission, authModel) {
  const authBody = (authMe && authMe.body) || {};
  const permissionBody = (permission && permission.body) || {};
  const modelBody = (authModel && authModel.body) || {};
  const user = authBody.user || null;
  const counts = modelBody.counts || {};
  const model = modelBody.model || {};
  const validation = modelBody.validation || {};
  const groups = Array.isArray(authBody.groups) ? authBody.groups.map(group => group.groupKey || group.group_key || group).filter(Boolean) : [];

  setValue('accessLoggedIn', authBody.loggedIn);
  setValue('accessDashboardAllowed', authBody.dashboardAccess);
  setValue('accessPermissionRemoteView', permissionBody.allowed);
  setValue('accessSchemaReady', validation.schemaReady || (modelBody.schema && modelBody.schema.ready));
  setValue('accessSchemaReadyDetail', validation.schemaReady || (modelBody.schema && modelBody.schema.ready));
  setText('accessUser', user ? `${user.displayName || user.loginName || user.userUid} (${user.userUid})` : '—');
  setText('accessReasonDetail', authBody.accessReason || permissionBody.reason || '—');
  setText('accessRoles', formatList(authBody.roles));
  setText('accessGroups', formatList(groups));
  setText('accessSessionReason', authBody.session ? authBody.session.reason : '—');
  setText('accessCountUsers', formatCount(counts.dashboard_users));
  setText('accessCountSessions', formatCount(counts.dashboard_sessions));
  setText('accessCountAudit', formatCount(counts.dashboard_audit_log));
  setText('accessCountLocks', formatCount(counts.dashboard_locks));

  setChip('accessModelPill', authModel && authModel.ok, authModel && authModel.ok ? 'DB-Modell ok' : 'DB-Modell prüfen');
  renderModelList('accessRolesModel', model.roles, row => `${row.role_key || 'role'}${row.label ? ` · ${row.label}` : ''}`);
  renderModelList('accessGroupsModel', model.groups, row => `${row.group_key || 'group'}${row.label ? ` · ${row.label}` : ''}${row.group_type ? ` · ${row.group_type}` : ''}`);
  renderModelList('accessPermissionsModel', model.permissions, row => `${row.permission_key || 'permission'}${row.area ? ` · ${row.area}` : ''}`);
}

function renderAdminUsersModel(authModel) {
  const modelBody = (authModel && authModel.body) || {};
  const counts = modelBody.counts || {};
  const model = modelBody.model || {};
  const users = Array.isArray(model.users) ? model.users : [];

  setText('adminCountUsers', formatCount(counts.dashboard_users));
  setText('adminCountSessions', formatCount(counts.dashboard_sessions));
  setText('adminCountRoles', formatCount(counts.dashboard_roles));
  setText('adminCountPermissions', formatCount(counts.dashboard_permissions));
  setChip('adminUsersPill', authModel && authModel.ok, authModel && authModel.ok ? `${users.length} geladen` : 'prüfen');

  renderAdminUsersList('adminUsersList', users);
  renderModelList('adminRolesModel', model.roles, row => `${row.role_key || 'role'}${row.label ? ` · ${row.label}` : ''}`);
  renderModelList('adminGroupsModel', model.groups, row => `${row.group_key || 'group'}${row.label ? ` · ${row.label}` : ''}${row.group_type ? ` · ${row.group_type}` : ''}`);
}

function renderAdminUsersList(id, users) {
  const node = byId(id);
  if (!node) return;
  const rows = Array.isArray(users) ? users : [];
  if (!rows.length) {
    node.innerHTML = '<div class="admin-user-row admin-user-row--empty"><strong>—</strong><span>Keine User geladen oder Auth-DB-Modell nicht lesbar</span></div>';
    return;
  }

  node.innerHTML = rows.slice(0, 40).map((user) => {
    const displayName = user.display_name || user.displayName || user.login_name || user.loginName || user.user_uid || 'User';
    const loginName = user.login_name || user.loginName || '—';
    const status = user.status || '—';
    const lastLogin = user.last_login_at || user.lastLoginAt || '—';
    const roles = user.roles || '—';
    return `
      <div class="admin-user-row">
        <div><strong>${escapeHtml(displayName)}</strong><small>${escapeHtml(loginName)}</small></div>
        <span>${escapeHtml(status)}</span>
        <span>${escapeHtml(roles)}</span>
        <span>${escapeHtml(lastLogin)}</span>
      </div>
    `;
  }).join('') + (rows.length > 40 ? `<div class="admin-user-row admin-user-row--empty"><strong>+${rows.length - 40}</strong><span>weitere User später mit Suche/Pagination</span></div>` : '');
}

function renderModelList(id, rows, formatter) {
  const node = byId(id);
  if (!node) return;
  const values = Array.isArray(rows) ? rows : [];
  if (!values.length) {
    node.innerHTML = '<div class="model-row"><strong>—</strong><small>Keine Einträge oder DB nicht lesbar</small></div>';
    return;
  }
  node.innerHTML = values.slice(0, 12).map((row) => {
    const title = formatter(row);
    const description = row.description || row.protection_level || row.effect || row.status || '';
    return `<div class="model-row"><strong>${escapeHtml(title)}</strong>${description ? `<small>${escapeHtml(description)}</small>` : ''}</div>`;
  }).join('') + (values.length > 12 ? `<div class="model-row muted"><strong>+${values.length - 12}</strong><small>weitere Einträge über /api/remote/auth/model</small></div>` : '');
}

function formatCount(value) {
  if (value == null || value === '') return '—';
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : String(value);
}

function renderEndpoints(results) {
  const values = Object.entries(results || {});
  const okCount = values.filter(([, result]) => result.ok).length;
  setChip('endpointPill', okCount === values.length, okCount === values.length ? `${okCount}/${values.length} OK` : `${values.length - okCount} Problem(e)`);
  const endpointList = byId('endpointList');
  if (!endpointList) return;
  endpointList.innerHTML = values.map(([key, result]) => {
    const label = endpointLabels[key] || key;
    const cls = result.ok ? 'endpoint ok' : 'endpoint bad';
    const detail = result.ok
      ? `Details: HTTP ${result.httpStatus || 200}`
      : `Problem: ${result.error || (result.body && result.body.error) || `HTTP ${result.httpStatus || 0}`}`;
    return `<div class="${cls}"><span>${escapeHtml(label)}</span><strong>${result.ok ? 'OK' : 'Problem'}</strong><small>${escapeHtml(detail)}</small></div>`;
  }).join('');
}

function renderErrors(results) {
  const failed = Object.entries(results || {}).filter(([, result]) => !result.ok && result.httpStatus !== 403);
  if (!failed.length) {
    hideErrors();
    return;
  }
  setText('errorText', failed.map(([key, result]) => {
    const label = endpointLabels[key] || key;
    const detail = result.error || (result.body && result.body.error) || `HTTP ${result.httpStatus || 0}`;
    return `${label}: Problem seit letzter Prüfung. Details: ${detail}`;
  }).join(' · '));
  setHidden('errorBox', false);
}

function showErrors(message) {
  setText('errorText', message || 'Unbekannter Fehler');
  setHidden('errorBox', false);
}

function hideErrors() {
  setHidden('errorBox', true);
}

function updateAutoRefreshText(override) {
  const node = byId('autoRefreshText');
  if (node) node.textContent = override || `Auto-Refresh in ${refreshCountdown}s`;
}

function setChip(id, ok, text) {
  const node = byId(id);
  if (!node) return;
  node.textContent = text;
  node.className = ok ? 'cgn-chip cgn-chip--ok' : 'cgn-chip cgn-chip--warn';
}

function setValue(id, value) {
  const node = byId(id);
  if (!node) return;
  node.textContent = formatValue(value);
  node.className = value === true ? 'valueTrue' : value === false ? 'valueFalse' : 'valueNeutral';
}

function setText(id, value) {
  const node = byId(id);
  if (!node) return;
  node.textContent = value == null || value === '' ? '—' : String(value);
}

function setHidden(id, hidden) {
  const node = byId(id);
  if (node) node.hidden = Boolean(hidden);
}

function bindOptional(id, eventName, handler) {
  const node = byId(id);
  if (node) node.addEventListener(eventName, handler);
}

function formatValue(value) {
  if (value === true) return 'OK';
  if (value === false) return 'Nein';
  if (value == null || value === '') return '—';
  return String(value);
}

function formatList(value) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  if (value == null || value === '') return '—';
  return String(value);
}

function getNested(obj, keys) {
  let current = obj;
  for (const key of keys) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return current;
}

function byId(id) {
  return document.getElementById(id);
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value));
  return String(value).replace(/[^A-Za-z0-9_-]/g, '\\$&');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
