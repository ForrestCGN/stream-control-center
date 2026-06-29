'use strict';

(function registerMediaLibraryModule() {
  const MODULE_ID = 'media';
  const PAGE_ID = 'media-library';
  const STATUS_URL = '/api/remote/media/status';

  const state = {
    loaded: false,
    loading: false,
    error: '',
    data: null,
    filter: 'all'
  };

  function getContentRoot() {
    return document.getElementById('remoteModboardContent') || document.querySelector('.cgn-content');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function formatBytes(value) {
    const size = Number(value || 0);
    if (!Number.isFinite(size) || size <= 0) return '0 B';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
    return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
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
    bindPanelActions(nextPanel);
    return nextPanel;
  }

  function registerModuleAndPage() {
    if (!window.RemoteModboardModules) return;
    if (typeof window.RemoteModboardModules.registerModule === 'function') {
      window.RemoteModboardModules.registerModule({ id: MODULE_ID, label: 'Media', description: 'Medien, Sounds, Videos und Bilder fuer Stream-Module.', icon: '▣', order: 25, runtime: 'both', permission: 'media.read', navSubId: 'nav-media' });
    }
    if (typeof window.RemoteModboardModules.registerPage === 'function') {
      window.RemoteModboardModules.registerPage({ moduleId: MODULE_ID, pageId: PAGE_ID, label: 'Medienuebersicht', title: 'Media-System', tab: 'read-only', section: 'Media', order: 10, permission: 'media.read', runtime: 'both', script: '/assets/modules/media/library.js' });
    }
  }

  function chip(label, kind, attrs) {
    return `<span class="cgn-chip ${kind ? `cgn-chip--${kind}` : ''}" ${attrs || ''}>${escapeHtml(label)}</span>`;
  }

  function inventoryItems() {
    const items = state.data && state.data.inventory && Array.isArray(state.data.inventory.items) ? state.data.inventory.items : [];
    if (state.filter === 'all') return items;
    if (state.filter === 'sounds' || state.filter === 'videos' || state.filter === 'images') return items.filter(item => item.rootKey === state.filter);
    return items.filter(item => item.kind === state.filter);
  }

  function renderRootRows(data) {
    const inventory = data && data.inventory ? data.inventory : {};
    const groups = inventory.groups || {};
    const roots = Array.isArray(data && data.plannedRoots) ? data.plannedRoots : [];
    if (!roots.length) return '<div class="module-row"><span class="module-icon purple">MED</span><div><b>Noch keine Bereiche gemeldet</b><small>Die read-only Grundlage ist vorbereitet.</small></div></div>';
    return roots.map((root) => {
      const group = groups[root.key] || {};
      const typeLabel = Array.isArray(root.types) ? root.types.join(', ') : '';
      const count = Number(group.count || 0);
      const exists = group.exists !== false;
      return `<div class="module-row">
        <span class="module-icon cyan">${escapeHtml(String(root.key || 'med').slice(0, 3).toUpperCase())}</span>
        <div>
          <b>${escapeHtml(root.label || root.key || 'Media')} · ${count}</b>
          <small>${escapeHtml(root.localPathHint || '')}${exists ? '' : ' · Ordner fehlt lokal'}</small>
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

  function renderInventoryTable() {
    const data = state.data || {};
    const inventory = data.inventory || {};
    const items = inventoryItems();
    if (!inventory.active) {
      return '<div class="admin-lock-note"><i>i</i><div><strong>Noch keine lokale Medienliste aktiv.</strong><span>Online wartet auf Agent-WSS-Slow-Sync. Lokal wird das Inventar nur angezeigt, wenn die lokalen Medienordner erreichbar sind.</span></div></div>';
    }
    if (!items.length) {
      return '<div class="admin-lock-note"><i>i</i><div><strong>Keine Medien fuer diesen Filter.</strong><span>Waehle einen anderen Filter oder pruefe die lokalen Ordner.</span></div></div>';
    }
    const rows = items.slice(0, 500).map((item) => `<tr>
      <td><strong>${escapeHtml(item.name || '')}</strong><small>${escapeHtml(item.relativePath || '')}</small></td>
      <td>${escapeHtml(item.rootLabel || item.rootKey || '')}</td>
      <td>${escapeHtml(item.kind || '')}</td>
      <td>${escapeHtml(item.extension || '')}</td>
      <td>${escapeHtml(formatBytes(item.sizeBytes))}</td>
      <td>${escapeHtml(item.modifiedAt ? String(item.modifiedAt).slice(0, 19).replace('T', ' ') : '—')}</td>
    </tr>`).join('');
    return `<div class="table-wrap"><table class="admin-table"><thead><tr><th>Datei</th><th>Bereich</th><th>Typ</th><th>Endung</th><th>Groesse</th><th>Geaendert</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function renderFilters(data) {
    const inventory = data && data.inventory ? data.inventory : {};
    const counts = inventory.counts || {};
    const filters = [
      ['all', `Alle (${counts.returned || counts.total || 0})`],
      ['sounds', `Sounds (${counts.sounds || 0})`],
      ['videos', `Videos (${counts.videos || 0})`],
      ['images', `Bilder (${counts.images || 0})`],
      ['audio', `Audio (${counts.audio || 0})`],
      ['video', `Video (${counts.video || 0})`],
      ['image', `Image (${counts.image || 0})`]
    ];
    return filters.map(([key, label]) => `<button class="secondaryButton small ${state.filter === key ? 'is-active' : ''}" type="button" data-media-filter="${escapeHtml(key)}">${escapeHtml(label)}</button>`).join(' ');
  }

  function render() {
    const data = state.data || {};
    const mode = data.mode || {};
    const inventory = data.inventory || {};
    const counts = inventory.counts || {};
    const statusText = state.error ? 'Fehler' : (state.loading ? 'Lade...' : (data.summary || 'Media-System read-only vorbereitet.'));
    const runtimeLabel = data.runtimeMode === 'local' || mode.local ? 'Lokal' : 'Online';
    const inventoryStatus = inventory.active ? `${counts.returned || counts.total || 0} Medien` : 'Inventar folgt';
    const extensionList = Array.isArray(data.allowedExtensions) ? data.allowedExtensions.join(', ') : '';
    const truncatedNotice = inventory.truncated ? `<div class="admin-lock-note"><i>!</i><div><strong>Liste gekuerzt.</strong><span>Es werden ${escapeHtml(String(inventory.limit || 0))} Medien angezeigt. Weitere Filter/Paging sind vorbereitet.</span></div></div>` : '';

    mountPanel(`
      <section class="rdap-view" data-page-panel="${PAGE_ID}">
        <section class="page-header module-page-header cgn-card">
          <div><p class="cgn-eyebrow">Media-System</p><h1>Media-System</h1><p>${escapeHtml(statusText)}</p></div>
        </section>

        <section class="metric-grid">
          <article class="metric-card cgn-card"><span>Modus</span><strong>${escapeHtml(runtimeLabel)}</strong><small>gleiche UI lokal und online</small><div class="cgn-progress"><i style="width:70%"></i></div></article>
          <article class="metric-card cgn-card"><span>Inventar</span><strong>${escapeHtml(inventoryStatus)}</strong><small>${escapeHtml(inventory.source || 'read-only')}</small><div class="cgn-progress ${inventory.active ? '' : 'cgn-progress--warn'}"><i style="width:${inventory.active ? '80' : '15'}%"></i></div></article>
          <article class="metric-card cgn-card"><span>Upload</span><strong>Aus</strong><small>separater Rechte-Step noetig</small><div class="cgn-progress cgn-progress--warn"><i style="width:0%"></i></div></article>
          <article class="metric-card cgn-card"><span>Loeschen</span><strong>Aus</strong><small>keine gefaehrlichen Aktionen</small><div class="cgn-progress cgn-progress--warn"><i style="width:0%"></i></div></article>
        </section>

        <section class="page-grid">
          <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Grundlage</p><h2>Media-Bereiche</h2></div>${chip('read-only', 'info')}</div><div class="module-list">${renderRootRows(data)}</div></article>
          <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Rechte</p><h2>Bedienung bleibt gesperrt</h2></div>${chip('sicher', 'warn')}</div><div class="self-profile-grid self-profile-grid--compact">${renderPermissionRows(data)}</div><div class="admin-lock-note"><i>!</i><div><strong>Upload, Bearbeiten und Loeschen sind absichtlich deaktiviert.</strong><span>Erst wenn serverseitige Media-Rechte, Audit und Sicherheitsabfragen fertig sind, werden Buttons aktiviert.</span></div></div></article>
          <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Lokal / Online</p><h2>Wo liegen die Dateien?</h2></div>${chip(runtimeLabel, 'info')}</div><div class="admin-lock-note"><i>i</i><div><strong>${escapeHtml(mode.local ? 'Lokal liegen die echten Stream-PC-Dateien.' : 'Online hat der Webserver keinen direkten Zugriff auf Stream-PC-Dateien.')}</strong><span>${escapeHtml(mode.local ? 'Das lokale Inventar wird read-only aus den lokalen Assets gelesen.' : 'Online kommt das Inventar per Agent-WSS-Slow-Sync, memory-only und ohne Upload/Delete.')}</span></div></div></article>
          <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Dateitypen</p><h2>Erlaubte Endungen</h2></div>${chip('Allowlist', 'ok')}</div><div class="admin-lock-note"><i>✓</i><div><strong>${escapeHtml(extensionList || 'Noch nicht geladen')}</strong><span>Freie Pfade und absolute Pfade werden nicht als Bedienmodell genutzt.</span></div></div></article>
          <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Inventar</p><h2>Medienliste</h2></div>${chip(inventory.active ? 'Inventar aktiv' : 'wartet', inventory.active ? 'ok' : 'warn')}</div><div class="login-actions" style="justify-content:flex-start;flex-wrap:wrap;margin-bottom:12px">${renderFilters(data)} <button class="secondaryButton small" type="button" data-media-refresh="1">Neu laden</button></div>${truncatedNotice}${renderInventoryTable()}</article>
        </section>
      </section>`);
  }

  function bindPanelActions(panel) {
    panel.querySelectorAll('[data-media-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        state.filter = button.getAttribute('data-media-filter') || 'all';
        render();
      });
    });
    const refresh = panel.querySelector('[data-media-refresh]');
    if (refresh) refresh.addEventListener('click', () => loadStatus());
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
      state.data = { runtimeMode: 'unknown', summary: `Media-Status konnte nicht geladen werden: ${state.error}`, mode: { local: false }, inventory: { active: false, items: [], counts: {} }, permissions: {}, plannedRoots: [], allowedExtensions: [] };
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
