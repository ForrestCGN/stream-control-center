'use strict';

(function registerMediaLibraryModule() {
  const MODULE_ID = 'media';
  const PAGE_ID = 'media-library';
  const STATUS_URL = '/api/remote/media/status';

  const state = {
    loaded: false,
    loading: false,
    error: '',
    data: null
  };

  function getContentRoot() {
    return document.getElementById('remoteModboardContent') || document.querySelector('.cgn-content');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function mountPanel(html) {
    const content = getContentRoot();
    if (!content) return null;
    let panel = document.querySelector(`[data-page-panel="${PAGE_ID}"]`);
    const holder = document.createElement('div');
    holder.innerHTML = html.trim();
    const nextPanel = holder.firstElementChild;
    if (!nextPanel) return panel;
    if (panel && panel.parentNode) panel.replaceWith(nextPanel);
    else {
      const footer = content.querySelector('.footer');
      if (footer) content.insertBefore(nextPanel, footer);
      else content.appendChild(nextPanel);
    }
    return nextPanel;
  }

  function registerModuleAndPage() {
    if (!window.RemoteModboardModules) return;
    if (typeof window.RemoteModboardModules.registerModule === 'function') {
      window.RemoteModboardModules.registerModule({
        id: MODULE_ID,
        label: 'Media',
        description: 'Medien, Sounds, Videos und Bilder fuer Stream-Module.',
        icon: '▣',
        order: 25,
        runtime: 'both',
        permission: 'media.read',
        navSubId: 'nav-media'
      });
    }
    if (typeof window.RemoteModboardModules.registerPage === 'function') {
      window.RemoteModboardModules.registerPage({
        moduleId: MODULE_ID,
        pageId: PAGE_ID,
        label: 'Medienuebersicht',
        title: 'Media-System',
        tab: 'read-only',
        section: 'Media',
        order: 10,
        permission: 'media.read',
        runtime: 'both',
        script: '/assets/modules/media/library.js'
      });
    }
  }

  function chip(label, kind) {
    return `<span class="cgn-chip ${kind ? `cgn-chip--${kind}` : ''}">${escapeHtml(label)}</span>`;
  }

  function renderRootRows(data) {
    const roots = Array.isArray(data && data.plannedRoots) ? data.plannedRoots : [];
    if (!roots.length) {
      return '<div class="module-row"><span class="module-icon purple">MED</span><div><b>Noch keine Bereiche gemeldet</b><small>Die read-only Grundlage ist vorbereitet.</small></div></div>';
    }
    return roots.map((root) => {
      const typeLabel = Array.isArray(root.types) ? root.types.join(', ') : '';
      return `<div class="module-row">
        <span class="module-icon cyan">${escapeHtml(String(root.key || 'med').slice(0, 3).toUpperCase())}</span>
        <div>
          <b>${escapeHtml(root.label || root.key || 'Media')}</b>
          <small>${escapeHtml(root.localPathHint || '')}</small>
          <small>Typen: ${escapeHtml(typeLabel || '—')}</small>
        </div>
      </div>`;
    }).join('');
  }

  function renderPermissionRows(data) {
    const permissions = data && data.permissions ? data.permissions : {};
    const rows = [
      ['Lesen', permissions.readPermission || 'media.read', true],
      ['Hochladen', permissions.uploadPermission || 'media.upload', false],
      ['Bearbeiten', permissions.editPermission || 'media.edit', false],
      ['Loeschen', permissions.deletePermission || 'media.delete', false]
    ];
    return rows.map(([label, permission, enabled]) => `<div class="kv-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(permission)} · ${enabled ? 'vorbereitet' : 'gesperrt'}</strong></div>`).join('');
  }

  function render() {
    const data = state.data || {};
    const mode = data.mode || {};
    const inventory = data.inventory || {};
    const statusText = state.error ? 'Fehler' : (state.loading ? 'Lade...' : (data.summary || 'Media-System read-only vorbereitet.'));
    const runtimeLabel = data.runtimeMode === 'local' || mode.local ? 'Lokal' : 'Online';
    const inventoryStatus = inventory.active ? 'Inventar aktiv' : 'Inventar folgt';
    const extensionList = Array.isArray(data.allowedExtensions) ? data.allowedExtensions.join(', ') : '';

    mountPanel(`
      <section class="rdap-view" data-page-panel="${PAGE_ID}">
        <section class="page-header module-page-header cgn-card">
          <div>
            <p class="cgn-eyebrow">Media-System</p>
            <h1>Media-System</h1>
            <p>${escapeHtml(statusText)}</p>
          </div>
        </section>

        <section class="metric-grid">
          <article class="metric-card cgn-card"><span>Modus</span><strong>${escapeHtml(runtimeLabel)}</strong><small>gleiche UI lokal und online</small><div class="cgn-progress"><i style="width:70%"></i></div></article>
          <article class="metric-card cgn-card"><span>Inventar</span><strong>${escapeHtml(inventoryStatus)}</strong><small>kein Dateiscan in diesem Step</small><div class="cgn-progress cgn-progress--warn"><i style="width:15%"></i></div></article>
          <article class="metric-card cgn-card"><span>Upload</span><strong>Aus</strong><small>separater Rechte-Step noetig</small><div class="cgn-progress cgn-progress--warn"><i style="width:0%"></i></div></article>
          <article class="metric-card cgn-card"><span>Loeschen</span><strong>Aus</strong><small>keine gefaehrlichen Aktionen</small><div class="cgn-progress cgn-progress--warn"><i style="width:0%"></i></div></article>
        </section>

        <section class="page-grid">
          <article class="cgn-card span2">
            <div class="card-head"><div><p class="cgn-eyebrow">Grundlage</p><h2>Media-Bereiche</h2></div>${chip('read-only', 'info')}</div>
            <div class="module-list">${renderRootRows(data)}</div>
          </article>

          <article class="cgn-card span2">
            <div class="card-head"><div><p class="cgn-eyebrow">Rechte</p><h2>Bedienung bleibt gesperrt</h2></div>${chip('sicher', 'warn')}</div>
            <div class="self-profile-grid self-profile-grid--compact">${renderPermissionRows(data)}</div>
            <div class="admin-lock-note"><i>!</i><div><strong>Upload, Bearbeiten und Loeschen sind absichtlich deaktiviert.</strong><span>Erst wenn serverseitige Media-Rechte, Audit und Sicherheitsabfragen fertig sind, werden Buttons aktiviert.</span></div></div>
          </article>

          <article class="cgn-card span2">
            <div class="card-head"><div><p class="cgn-eyebrow">Lokal / Online</p><h2>Wo liegen die Dateien?</h2></div>${chip(runtimeLabel, 'info')}</div>
            <div class="admin-lock-note"><i>i</i><div><strong>${escapeHtml(mode.local ? 'Lokal liegen die echten Stream-PC-Dateien.' : 'Online hat der Webserver keinen direkten Zugriff auf Stream-PC-Dateien.')}</strong><span>${escapeHtml(mode.local ? 'Das lokale Inventar wird als naechster read-only Step vorbereitet.' : 'Online kommt das Inventar spaeter nur ueber Agent-WSS, memory-only und ohne Upload/Delete.')}</span></div></div>
          </article>

          <article class="cgn-card span2">
            <div class="card-head"><div><p class="cgn-eyebrow">Dateitypen</p><h2>Geplante erlaubte Endungen</h2></div>${chip('Allowlist', 'ok')}</div>
            <div class="admin-lock-note"><i>✓</i><div><strong>${escapeHtml(extensionList || 'Noch nicht geladen')}</strong><span>Freie Pfade und absolute Pfade werden nicht als Bedienmodell genutzt.</span></div></div>
          </article>
        </section>
      </section>`);
  }

  async function loadStatus() {
    if (state.loading) return;
    state.loading = true;
    state.error = '';
    render();
    try {
      const res = await fetch(STATUS_URL, { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok || !body || body.ok !== true) throw new Error(body && body.error ? body.error : `HTTP ${res.status}`);
      state.data = body;
      state.loaded = true;
    } catch (err) {
      state.error = err && err.message ? err.message : String(err || 'media_status_failed');
      state.data = {
        runtimeMode: 'unknown',
        summary: `Media-Status konnte nicht geladen werden: ${state.error}`,
        mode: { local: false },
        inventory: { active: false },
        permissions: {},
        plannedRoots: [],
        allowedExtensions: []
      };
    } finally {
      state.loading = false;
      render();
    }
  }

  function install() {
    registerModuleAndPage();
    render();
    loadStatus();
  }

  install();
  document.addEventListener('DOMContentLoaded', install);
})();
