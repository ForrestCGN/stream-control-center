window.CGN = {
  activeModule: 'streamdesk',
  auth: { authenticated: false, user: null, twitchLoginConfigured: false },
  modules: {
    streamdesk: {
      title: 'Stream-Desk',
      panelId: 'streamdeskModule',
      group: 'live',
      overlayLink: '',
      reload() { return window.StreamdeskModule?.loadAll?.(true); }
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
    hug: {
      title: 'Hug-System',
      panelId: 'hugModule',
      group: 'community',
      overlayLink: '',
      reload() { return window.HugModule?.loadAll?.(true); }
    },
    adminconfigs: {
      title: 'Admin Configs',
      panelId: 'adminconfigsModule',
      group: 'admin',
      overlayLink: '',
      reload() { return window.AdminConfigsModule?.loadAll?.(true); }
    }
  },

  navigation: {
    live: { label: 'Live', role: 'mod/supermod/streamer' },
    control: { label: 'Control', role: 'streamer/local_admin/owner' },
    system: { label: 'System', role: 'streamer/local_admin/owner' },
    community: { label: 'Community', role: 'mod/supermod/streamer' },
    admin: { label: 'Admin', role: 'local_admin/owner' }
  },

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

  setActiveModule(name, options = {}) {
    const fallback = this.modules[name] ? name : 'streamdesk';
    const moduleName = this.modules[fallback] ? fallback : 'alerts';
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

    const meta = this.modules[moduleName] || this.modules.streamdesk;
    const title = document.getElementById('pageTitle');
    if (title) title.textContent = meta.title;

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

    if (meta.group) openNavGroup(meta.group);
    localStorage.setItem('cgn-dashboard-active-module', moduleName);
    window.dispatchEvent(new CustomEvent('cgn:module-show', { detail: { module: moduleName, initial: !!options.initial } }));
  },

  reloadActiveModule() {
    const meta = this.modules[this.activeModule] || this.modules.streamdesk;
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

function openNavGroup(groupId){
  document.querySelectorAll('.nav-group').forEach(group => {
    const isOpen = group.dataset.navGroup === groupId;
    if (isOpen) group.classList.remove('is-collapsed');
  });
}

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

document.querySelectorAll('[data-nav-toggle]').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.nav-group');
    group?.classList.toggle('is-collapsed');
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
      btn.closest('.nav-group')?.classList.toggle('has-search-hit', !!q && hit);
      btn.hidden = !hit;
    });
    document.querySelectorAll('.nav-group').forEach(group => {
      const anyVisible = Array.from(group.querySelectorAll('.nav-item')).some(item => !item.hidden);
      group.hidden = !!q && !anyVisible;
      if (q && anyVisible) group.classList.remove('is-collapsed');
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
  const wanted = localStorage.getItem('cgn-dashboard-active-module') || 'streamdesk';
  window.CGN.setActiveModule(wanted, { initial: true });
})();
