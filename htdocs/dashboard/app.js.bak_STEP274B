window.CGN = {
  activeModule: 'sectionhome',
  activeSection: 'live',
  auth: { authenticated: false, user: null, twitchLoginConfigured: false },
  modules: {
    sectionhome: {
      title: 'Dashboard',
      panelId: 'sectionhomeModule',
      group: 'home',
      overlayLink: '',
      reload() { return window.SectionHomeModule?.render?.(); }
    },
    streamdesk: {
      title: 'Stream-Desk',
      panelId: 'streamdeskModule',
      group: 'live',
      overlayLink: '',
      reload() { return window.StreamdeskModule?.loadAll?.(true); }
    },
    clips: {
      title: 'Clip-System',
      panelId: 'clipsModule',
      group: 'live',
      overlayLink: '',
      reload() { return window.ClipsModule?.loadAll?.(true); }
    },
    controlhome: {
      title: 'Control Übersicht',
      panelId: 'controlhomeModule',
      group: 'control',
      overlayLink: '',
      reload() { return window.ControlHomeModule?.loadAll?.(true); }
    },
    alerts: {
      title: 'Alert Control Center',
      panelId: 'alertsModule',
      group: 'control',
      overlayLink: '/overlays/_overlay-alerts-v2.html',
      overlayLabel: 'Alert-Overlay öffnen',
      reload() { return window.AlertsModule?.loadAll?.(true); }
    },
    twitch_events: {
      title: 'Twitch Event Simulator',
      panelId: 'twitchEventsModule',
      group: 'control',
      overlayLink: '',
      overlayLabel: '',
      reload() { return window.TwitchEventsModule?.loadAll?.(true); }
    },
    obs: {
      title: 'OBS Control Center',
      panelId: 'obsModule',
      group: 'control',
      overlayLink: '',
      overlayLabel: '',
      reload() { return window.OBSModule?.loadAll?.(); }
    },
    sound_system: {
      title: 'Sound-System',
      panelId: 'soundModule',
      group: 'system',
      overlayLink: '/overlays/sound_system_overlay.html?debug=1',
      overlayLabel: 'Sound-Overlay öffnen',
      reload() { return window.SoundSystemModule?.loadAll?.(true); }
    },
    message_rotator: {
      title: 'Message-Rotator',
      panelId: 'messageRotatorModule',
      group: 'system',
      overlayLink: '',
      reload() { return window.MessageRotatorModule?.loadAll?.(true); }
    },
    hug: {
      title: 'Hug-System',
      panelId: 'hugModule',
      group: 'community',
      overlayLink: '',
      reload() { return window.HugModule?.loadAll?.(true); }
    },
    tagebuch: {
      title: 'Tagebuch',
      panelId: 'tagebuchModule',
      group: 'community',
      overlayLink: '',
      reload() { return window.TagebuchModule?.loadAll?.(true); }
    },
    todo: {
      title: 'Todo',
      panelId: 'todoModule',
      group: 'community',
      overlayLink: '',
      reload() { return window.TodoModule?.loadAll?.(true); }
    },
    commands: {
      title: 'Commands',
      panelId: 'commandsModule',
      group: 'community',
      overlayLink: '',
      reload() { return window.CommandsModule?.loadAll?.(true); }
    },
    vip: {
      title: 'VIP-System',
      panelId: 'vipModule',
      group: 'community',
      overlayLink: '/overlays/vip_sound_overlay_v2.html',
      overlayLabel: 'VIP-Overlay öffnen',
      reload() { return window.VipModule?.loadAll?.(true); }
    },
    adminconfigs: {
      title: 'Admin Configs',
      panelId: 'adminconfigsModule',
      group: 'admin',
      overlayLink: '',
      reload() { return window.AdminConfigsModule?.loadAll?.(true); }
    }
  },

  sections: {
    live: {
      label: 'Live', icon: '📡', role: 'mod/supermod/streamer',
      description: 'Bedienoberfläche während des Streams.',
      items: ['streamdesk', 'chat', 'userinfo', 'clips', 'daily_notes']
    },
    control: {
      label: 'Control', icon: '🧭', role: 'streamer/local_admin/owner',
      description: 'Alerts, OBS, Overlays und Stream-Steuerung.',
      items: ['controlhome', 'alerts', 'twitch_events', 'obs', 'overlays', 'stream_control']
    },
    community: {
      label: 'Community', icon: '👥', role: 'mod/supermod/streamer',
      description: 'Chat-, Viewer- und Interaktionssysteme.',
      items: ['vip', 'hug', 'chat_overlay', 'deathcounter', 'challenges', 'tagebuch', 'todo', 'commands', 'community_stats']
    },
    system: {
      label: 'System', icon: '🧩', role: 'streamer/local_admin/owner',
      description: 'Technische Stream-Systeme, Sounds, TTS und Integrationen.',
      items: ['sound_system', 'tts', 'bot_systems', 'message_rotator', 'automations', 'integrations', 'module_status']
    },
    admin: {
      label: 'Admin', icon: '🔐', role: 'local_admin/owner',
      description: 'Sensible Verwaltung, Configs, Logs, Datenbank und Diagnose.',
      items: ['adminconfigs', 'users', 'roles', 'logs', 'database', 'backups', 'tokens', 'diagnostics']
    }
  },

  moduleCatalog: {
    streamdesk: { label: 'Stream-Desk', icon: '🎛', enabled: true, description: 'Zentrale Live-Bedienung und schnelle Stream-Aktionen.' },
    chat: { label: 'Chat', icon: '💬', enabled: false, description: 'Chat-Ansicht und spätere Chat-Moderation.' },
    userinfo: { label: 'Userinfo', icon: '🔎', enabled: false, description: 'Twitch-User schnell prüfen.' },
    clips: { label: 'Clips', icon: '✂️', enabled: true, description: 'Clip-Status, Settings, Textvarianten, Discord-Ziel und History.' },
    daily_notes: { label: 'Tagesnotizen', icon: '📝', enabled: false, description: 'Kurze Notizen während des Streams.' },
    controlhome: { label: 'Übersicht', icon: '🏠', enabled: true, description: 'Control-Center Übersicht.' },
    alerts: { label: 'Alerts V2', icon: '⚡', enabled: true, description: 'Alerts, Regeln, Texte, Sounds und Testcenter.' },
    twitch_events: { label: 'Twitch Events', icon: '🧪', enabled: true, description: 'Twitch-EventSub-Events lokal simulieren und Alert-Mapping prüfen.' },
    obs: { label: 'OBS Details', icon: '🎮', enabled: true, description: 'OBS-Szenen, Quellen und Statusdetails.' },
    overlays: { label: 'Overlays', icon: '🖼', enabled: false, description: 'Overlay-Verwaltung vorbereitet.' },
    stream_control: { label: 'Stream-Steuerung', icon: '📺', enabled: false, description: 'Stream-Aktionen und Schaltungen vorbereitet.' },
    vip: { label: 'VIP-System', icon: '💎', enabled: true, description: 'VIP-/Mod-Sounds, DB-Texte, Rollen, Daily-Usage und Events.' },
    hug: { label: 'Hug-System', icon: '🤗', enabled: true, description: 'Hug/Rehug-Statistiken, Texte, Typen und Diagnose.' },
    chat_overlay: { label: 'Chat-Overlay', icon: '💬', enabled: false, description: 'Chat-Overlay Steuerung vorbereitet.' },
    deathcounter: { label: 'Deathcounter', icon: '💀', enabled: false, description: 'Deathcounter V2 Verwaltung vorbereitet.' },
    challenges: { label: 'Challenges', icon: '🎯', enabled: false, description: 'Challenge-System Verwaltung vorbereitet.' },
    tagebuch: { label: 'Tagebuch', icon: '📖', enabled: true, description: 'Stream-Tagebuch, DB-Texte, Settings und Statistiken.' },
    todo: { label: 'Todo', icon: '✅', enabled: true, description: 'Todo-Ziele, DB-Texte, Settings und Statistiken.' },
    commands: { label: 'Commands', icon: '⌨️', enabled: true, description: 'Chat-Befehle zentral verwalten und testen.' },
    community_stats: { label: 'Community-Stats', icon: '📈', enabled: false, description: 'Community-Statistiken vorbereitet.' },
    sound_system: { label: 'Sound-System', icon: '🔊', enabled: true, description: 'Zentrale Soundausgabe, Queue und Prioritäten.' },
    tts: { label: 'TTS', icon: '🗣️', enabled: false, description: 'Text-to-Speech vorbereitet.' },
    bot_systems: { label: 'Bot-Systeme', icon: '🤖', enabled: false, description: 'Bot- und Automationssysteme vorbereitet.' },
    message_rotator: { label: 'Message-Rotator', icon: '🔁', enabled: true, description: 'Automatische Chat-Meldungen, DB-Textvarianten und Rotator-Settings verwalten.' },
    automations: { label: 'Automationen', icon: '⏱️', enabled: false, description: 'Zeit- und Event-Automationen vorbereitet.' },
    integrations: { label: 'Integrationen', icon: '🔌', enabled: false, description: 'Externe Dienste und APIs vorbereitet.' },
    module_status: { label: 'Modulstatus', icon: '📊', enabled: false, description: 'Modulstatus vorbereitet.' },
    adminconfigs: { label: 'Configs', icon: '⚙️', enabled: true, description: 'Admin-Konfigurationen einsehen.' },
    users: { label: 'Benutzer', icon: '👤', enabled: false, description: 'Benutzerverwaltung vorbereitet.' },
    roles: { label: 'Rollen & Rechte', icon: '🔑', enabled: false, description: 'Rechteverwaltung vorbereitet.' },
    logs: { label: 'Logs', icon: '📜', enabled: false, description: 'Audit-/Systemlogs vorbereitet.' },
    database: { label: 'Datenbank', icon: '🗄️', enabled: false, description: 'Datenbankstatus und Wartung vorbereitet.' },
    backups: { label: 'Backups', icon: '💾', enabled: false, description: 'Backup-System vorbereitet.' },
    tokens: { label: 'Tokens / Secrets', icon: '🔒', enabled: false, description: 'Sensible Werte vorbereitet.' },
    diagnostics: { label: 'Diagnose', icon: '🩺', enabled: false, description: 'Diagnosewerkzeuge vorbereitet.' }
  },

  favorites: ['clips', 'alerts', 'vip', 'hug', 'tagebuch', 'todo', 'commands', 'obs', 'sound_system', 'message_rotator'],

  async api(path, options = {}) {
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
    if (!res.ok || (data && typeof data === 'object' && data.ok === false)) {
      const err = data && typeof data === 'object' ? (data.message || data.error?.message || data.error?.code || data.error) : data;
      throw new Error(err || `HTTP ${res.status}`);
    }
    return data;
  },

  el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  },

  esc(v) { return String(v ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); },

  setActiveSection(sectionId, options = {}) {
    const section = this.sections[sectionId] ? sectionId : 'live';
    this.activeSection = section;
    this.setActiveModule('sectionhome', { ...options, section });
  },

  setActiveModule(name, options = {}) {
    const fallback = this.modules[name] ? name : 'sectionhome';
    const moduleName = this.modules[fallback] ? fallback : 'sectionhome';
    const meta = this.modules[moduleName] || this.modules.sectionhome;

    if (options.section && this.sections[options.section]) this.activeSection = options.section;
    else if (moduleName !== 'sectionhome' && meta.group) this.activeSection = meta.group;

    this.activeModule = moduleName;

    document.querySelectorAll('[data-module-panel]').forEach(panel => {
      const isActive = panel.dataset.modulePanel === moduleName;
      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
      panel.classList.toggle('is-hidden', !isActive);
      panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    document.querySelectorAll('.nav-item[data-module]').forEach(btn => {
      const isActive = btn.dataset.module === moduleName;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    document.querySelectorAll('.nav-main-item[data-section]').forEach(btn => {
      const isActive = btn.dataset.section === this.activeSection && moduleName === 'sectionhome';
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    const title = document.getElementById('pageTitle');
    if (title) {
      if (moduleName === 'sectionhome') title.textContent = this.sections[this.activeSection]?.label || 'Dashboard';
      else title.textContent = meta.title;
    }

    const crumb = document.getElementById('pageBreadcrumb');
    if (crumb) {
      const sectionLabel = this.sections[this.activeSection]?.label || '';
      const moduleLabel = moduleName === 'sectionhome' ? 'Übersicht' : (this.moduleCatalog[moduleName]?.label || meta.title || moduleName);
      crumb.textContent = sectionLabel ? `${sectionLabel} / ${moduleLabel}` : moduleLabel;
    }

    const overlayLink = document.getElementById('overlayOpenLink');
    if (overlayLink) {
      if (meta.overlayLink) {
        overlayLink.hidden = false;
        overlayLink.href = meta.overlayLink;
        overlayLink.textContent = meta.overlayLabel || 'Overlay öffnen';
      } else {
        overlayLink.hidden = true;
      }
    }

    localStorage.setItem('cgn-dashboard-active-module', moduleName);
    localStorage.setItem('cgn-dashboard-active-section', this.activeSection);
    window.dispatchEvent(new CustomEvent('cgn:module-show', { detail: { module: moduleName, section: this.activeSection, initial: !!options.initial } }));
  },

  reloadActiveModule() {
    const meta = this.modules[this.activeModule] || this.modules.sectionhome;
    return meta.reload?.();
  },

  async refreshAuth() {
    try {
      const [session, status] = await Promise.all([
        this.api('/api/auth/session'),
        this.api('/api/auth/status').catch(() => ({}))
      ]);
      this.auth = {
        authenticated: !!session.authenticated,
        user: session.user || null,
        twitchLoginConfigured: !!status.twitchLoginConfigured
      };
    } catch (err) {
      this.auth = { authenticated: false, user: null, twitchLoginConfigured: false, error: err.message };
    }
    renderAuthStatus();
    return this.auth;
  }
};

function injectAuthStyles(){
  if (document.getElementById('dashboardAuthStyles')) return;
  const style = document.createElement('style');
  style.id = 'dashboardAuthStyles';
  style.textContent = `
    .auth-status{display:flex;align-items:center;min-height:42px}
    .auth-user{display:flex;align-items:center;gap:9px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.055);border-radius:999px;padding:5px 7px 5px 6px;max-width:360px}
    .auth-user-logged-out{border-style:dashed}
    .auth-avatar{width:30px;height:30px;border-radius:999px;object-fit:cover;border:1px solid rgba(255,255,255,.16)}
    .auth-avatar-fallback{display:grid;place-items:center;background:rgba(255,255,255,.10);font-weight:900}
    .auth-text{display:grid;line-height:1.1;min-width:0}
    .auth-text strong{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px}
    .auth-text small{font-size:11px;color:var(--muted)}
    .auth-mini-btn{border-radius:999px;padding:7px 9px;font-size:12px;font-weight:800;text-decoration:none;white-space:nowrap}
    .auth-hint{font-size:11px;color:var(--muted);white-space:nowrap}
    html[data-theme=dark] .auth-user{background:#242424;border-color:#3a3a3a}
    @media(max-width:900px){.auth-status{order:10;width:100%}.auth-user{max-width:100%;width:100%;border-radius:18px}.auth-text strong{max-width:220px}}
  `;
  document.head.appendChild(style);
}

function ensureAuthBox(){
  let box = document.getElementById('authStatus');
  if (box) return box;
  const topActions = document.querySelector('.top-actions');
  box = document.createElement('div');
  box.id = 'authStatus';
  box.className = 'auth-status';
  box.setAttribute('aria-live', 'polite');
  if (topActions) topActions.insertBefore(box, topActions.firstChild);
  return box;
}

function renderAuthStatus(){
  const box = ensureAuthBox();
  if (!box) return;

  const auth = window.CGN.auth || {};
  const user = auth.user || null;

  if (auth.authenticated && user) {
    const avatar = user.avatarUrl ? `<img class="auth-avatar" src="${window.CGN.esc(user.avatarUrl)}" alt="">` : `<span class="auth-avatar auth-avatar-fallback">${window.CGN.esc((user.displayName || '?').slice(0, 1).toUpperCase())}</span>`;
    box.innerHTML = `
      <div class="auth-user">
        ${avatar}
        <span class="auth-text"><strong>${window.CGN.esc(user.displayName || 'Dashboard User')}</strong><small>${window.CGN.esc(user.role || 'user')}</small></span>
        <button id="authLogoutBtn" class="auth-mini-btn" type="button">Logout</button>
      </div>
    `;
    document.getElementById('authLogoutBtn')?.addEventListener('click', async () => {
      try { await window.CGN.api('/api/auth/logout', { method: 'POST', body: '{}' }); } catch (_) {}
      await window.CGN.refreshAuth();
    });
    return;
  }

  const twitchButton = auth.twitchLoginConfigured
    ? `<a class="auth-mini-btn" href="/api/auth/twitch/login">Twitch Login</a>`
    : `<span class="auth-hint">Twitch Login nicht konfiguriert</span>`;

  box.innerHTML = `
    <div class="auth-user auth-user-logged-out">
      <span class="auth-text"><strong>Nicht angemeldet</strong><small>Dashboard Auth</small></span>
      ${twitchButton}
      <button id="authLocalOwnerBtn" class="auth-mini-btn" type="button">Local Owner</button>
    </div>
  `;

  document.getElementById('authLocalOwnerBtn')?.addEventListener('click', async () => {
    await window.CGN.api('/api/auth/bootstrap-owner-local', { method: 'POST', body: JSON.stringify({ displayName: 'Local Owner' }) });
    await window.CGN.refreshAuth();
  });
}

document.getElementById('reloadBtn')?.addEventListener('click', () => window.CGN.reloadActiveModule());

document.querySelectorAll('.nav-item[data-module]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    window.CGN.setActiveModule(btn.dataset.module);
  });
});

document.querySelectorAll('.nav-main-item[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    window.CGN.setActiveSection(btn.dataset.section);
  });
});

(function(){
  const search = document.getElementById('globalSearch');
  if (!search) return;
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll('.nav-item[data-module]').forEach(btn => {
      const text = btn.textContent.toLowerCase();
      const hit = !q || text.includes(q) || String(btn.dataset.module || '').includes(q);
      btn.hidden = !hit;
    });
    document.querySelectorAll('.nav-section-block').forEach(block => {
      const anyVisible = Array.from(block.querySelectorAll('.nav-item')).some(item => !item.hidden);
      block.hidden = !!q && !anyVisible;
    });
  });
})();

(function(){
  const key = 'cgn-dashboard-theme';
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  function applyTheme(theme){
    const value = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = value;
    if (btn) btn.textContent = value === 'light' ? 'Hell' : 'Dunkel';
    localStorage.setItem(key, value);
  }
  applyTheme(localStorage.getItem(key) || root.dataset.theme || 'light');
  btn?.addEventListener('click', () => applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light'));
})();

(function(){
  const key = 'cgn-dashboard-nav-collapsed';
  const shell = document.querySelector('.app-shell');
  const btn = document.getElementById('navToggle');
  function applyNav(value){
    const collapsed = value === '1';
    shell?.classList.toggle('nav-collapsed', collapsed);
    if (btn) btn.title = collapsed ? 'Navigation ausklappen' : 'Navigation einklappen';
    localStorage.setItem(key, collapsed ? '1' : '0');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 80);
  }
  applyNav(localStorage.getItem(key) || '0');
  btn?.addEventListener('click', () => applyNav(shell?.classList.contains('nav-collapsed') ? '0' : '1'));
})();

(function(){
  injectAuthStyles();
  ensureAuthBox();
  window.CGN.refreshAuth();
})();

(function(){
  const wantedSection = localStorage.getItem('cgn-dashboard-active-section') || 'live';
  const wantedModule = localStorage.getItem('cgn-dashboard-active-module') || 'sectionhome';
  if (wantedModule && wantedModule !== 'sectionhome' && window.CGN.modules[wantedModule]) window.CGN.setActiveModule(wantedModule, { initial: true });
  else window.CGN.setActiveSection(wantedSection, { initial: true });
})();
