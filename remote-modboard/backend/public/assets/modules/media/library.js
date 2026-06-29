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

  let installed = false;

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

  function mountRenderError(err) {
    const message = err && err.message ? err.message : String(err || 'media_ui_render_failed');
    mountPanel(`
      <section class="rdap-view" data-page-panel="${PAGE_ID}">
        <section class="page-header module-page-header cgn-card">
          <div><p class="cgn-eyebrow">Media-System</p><h1>Media-System</h1><p>UI konnte nicht gerendert werden.</p></div>
        </section>
        <section class="page-grid">
          <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Runtime-Fix</p><h2>Media-UI Fehler</h2></div>${chip('sichtbar', 'warn')}</div><div class="admin-lock-note"><i>!</i><div><strong>${escapeHtml(message)}</strong><span>Die API bleibt read-only. Bitte diesen Fehler fuer den naechsten Fix kopieren.</span></div></div></article>
        </section>
      </section>`);
  }

  function safeRender() {
    try {
      render();
    } catch (err) {
      state.error = err && err.message ? err.message : String(err || 'media_ui_render_failed');
      mountRenderError(err);
      if (window.console && typeof window.console.error === 'function') window.console.error('media_ui_render_failed', err);
    }
  }

  function registerModuleAndPage() {
    if (!window.RemoteModboardModules) return;
    if (typeof window.RemoteModboardModules.registerModule === 'function') {
      window.RemoteModboardModules.registerModule({ id: MODULE_ID, labelKey: 'module.media.label', descriptionKey: 'module.media.description', label: 'Media', description: 'Medien, Sounds, Videos und Bilder fuer Stream-Module.', icon: '▣', order: 25, runtime: 'both', permission: 'media.read', navSubId: 'nav-media' });
    }
    if (typeof window.RemoteModboardModules.registerPage === 'function') {
      window.RemoteModboardModules.registerPage({ moduleId: MODULE_ID, pageId: PAGE_ID, labelKey: 'page.media.library.label', titleKey: 'page.media.library.title', descriptionKey: 'page.media.library.description', tabKey: 'page.media.library.tab', label: 'Medienuebersicht', title: 'Media-System', tab: 'read-only', section: 'Media', order: 10, permission: 'media.read', runtime: 'both', script: '/assets/modules/media/library.js' });
    }
  }

  function chip(label, kind, attrs) {
    return `<span class="cgn-chip ${kind ? `cgn-chip--${kind}` : ''}" ${attrs || ''}>${escapeHtml(label)}</span>`;
  }

  function yesNo(value) {
    if (value === true) return 'ja';
    if (value === false) return 'nein';
    return 'nicht geprueft';
  }

  function safeObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function inventoryItems() {
    const data = safeObject(state.data);
    const inventory = safeObject(data.inventory);
    const items = Array.isArray(inventory.items) ? inventory.items : [];
    if (state.filter === 'all') return items;
    if (state.filter === 'sounds' || state.filter === 'videos' || state.filter === 'images') return items.filter(item => item && item.rootKey === state.filter);
    return items.filter(item => item && item.kind === state.filter);
  }

  function renderSourceInfoRows(data) {
    const info = safeObject(data && data.sourceInfo);
    const rows = [
      ['Primaere Quelle', info.primary || 'agent_memory'],
      ['Quelle aktiv', yesNo(info.primaryActive)],
      ['DB-Index geprueft', yesNo(info.dbIndexChecked)],
      ['DB-Index verfuegbar', yesNo(info.dbIndexAvailable)],
      ['Fallback', info.fallbackEnabled ? 'an' : 'aus'],
      ['Writes', info.writesEnabled || info.mediaWritesEnabled || info.agentWritesEnabled || info.uploadEditDeleteEnabled ? 'an' : 'aus']
    ];
    return rows.map(([label, value]) => `<div class="kv-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
  }

  function buildSourceInfoNotice(data) {
    const info = safeObject(data && data.sourceInfo);
    if (info.dbIndexChecked === true) {
      return `DB-Index diagnostisch geprueft${Number.isFinite(Number(info.dbIndexItemCount)) ? ` · ${Number(info.dbIndexItemCount)} Eintraege` : ''}. Fallback und Writes bleiben aus.`;
    }
    return 'Normale UI-Abfrage ohne DB-Check. Der DB-Index wird nur per Diagnoseaufruf mit ?db=1 geprueft.';
  }

  function renderRootRows(data) {
    const inventory = safeObject(data && data.inventory);
    const groups = safeObject(inventory.groups);
    const roots = Array.isArray(data && data.plannedRoots) ? data.plannedRoots : [];
    if (!roots.length) return '<div class="module-row"><span class="module-icon purple">MED</span><div><b>Noch keine Bereiche gemeldet</b><small>Die read-only Grundlage ist vorbereitet.</small></div></div>';
    return roots.map((root) => {
      const safeRoot = safeObject(root);
      const group = safeObject(groups[safeRoot.key]);
      const typeLabel = Array.isArray(safeRoot.types) ? safeRoot.types.join(', ') : '';
      const count = Number(group.count || 0);
      const exists = group.exists !== false;
      return `<div class="module-row">
        <span class="module-icon cyan">${escapeHtml(String(safeRoot.key || 'med').slice(0, 3).toUpperCase())}</span>
        <div>
          <b>${escapeHtml(safeRoot.label || safeRoot.key || 'Media')} · ${count}</b>
          <small>${escapeHtml(safeRoot.localPathHint || '')}${exists ? '' : ' · Ordner fehlt lokal'}</small>
          <small>Typen: ${escapeHtml(typeLabel || '—')}</small>
        </div>
      </div>`;
    }).join('');
  }

  function renderPermissionRows(data) {
    const permissions = safeObject(data && data.permissions);
    const rows = [
      ['Lesen', permissions.readPermission || 'media.read', true],
      ['Hochladen', permissions.uploadPermission || 'media.upload', false],
      ['Bearbeiten', permissions.editPermission || 'media.edit', false],
      ['Loeschen', permissions.deletePermission || 'media.delete', false]
    ];
    return rows.map(([label, permission, enabled]) => `<div class="kv-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(permission)} · ${enabled ? 'vorbereitet' : 'gesperrt'}</strong></div>`).join('');
  }

  function renderInventoryTable() {
    const data = safeObject(state.data);
    const inventory = safeObject(data.inventory);
    const items = inventoryItems();
    if (!inventory.active) {
      return '<div class="admin-lock-note"><i>i</i><div><strong>Noch keine lokale Medienliste aktiv.</strong><span>Online wartet auf Agent-WSS-Slow-Sync. Lokal wird das Inventar nur angezeigt, wenn die lokalen Medienordner erreichbar sind.</span></div></div>';
    }
    if (!items.length) {
      return '<div class="admin-lock-note"><i>i</i><div><strong>Keine Medien fuer diesen Filter.</strong><span>Waehle einen anderen Filter oder pruefe die lokalen Ordner.</span></div></div>';
    }
    const rows = items.slice(0, 500).map((item) => {
      const safeItem = safeObject(item);
      return `<tr>
        <td><strong>${escapeHtml(safeItem.name || '')}</strong><small>${escapeHtml(safeItem.relativePath || '')}</small></td>
        <td>${escapeHtml(safeItem.rootLabel || safeItem.rootKey || '')}</td>
        <td>${escapeHtml(safeItem.kind || '')}</td>
        <td>${escapeHtml(safeItem.extension || '')}</td>
        <td>${escapeHtml(formatBytes(safeItem.sizeBytes))}</td>
        <td>${escapeHtml(safeItem.modifiedAt ? String(safeItem.modifiedAt).slice(0, 19).replace('T', ' ') : '—')}</td>
      </tr>`;
    }).join('');
    return `<div class="table-wrap"><table class="admin-table"><thead><tr><th>Datei</th><th>Bereich</th><th>Typ</th><th>Endung</th><th>Groesse</th><th>Geaendert</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function renderFilters(data) {
    const inventory = safeObject(data && data.inventory);
    const counts = safeObject(inventory.counts);
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
    const data = safeObject(state.data);
    const mode = safeObject(data.mode);
    const inventory = safeObject(data.inventory);
    const counts = safeObject(inventory.counts);
    const sourceInfo = safeObject(data.sourceInfo);
    const statusText = state.error ? 'Fehler' : (state.loading ? 'Lade...' : (data.summary || 'Media-System read-only vorbereitet.'));
    const runtimeLabel = data.runtimeMode === 'local' || mode.local ? 'Lokal' : 'Online';
    const syncInfo = safeObject(data.syncInfo);
    const inventoryStatus = inventory.active ? `${counts.returned || counts.total || 0} Medien${inventory.truncated ? ' · gekuerzt' : ''}` : 'Inventar folgt';
    const syncLabel = mode.local ? 'lokale Datei-Wahrheit' : (inventory.active ? 'Agent-Sync aktiv' : 'wartet auf Agent');
    const sourceLabel = sourceInfo.primaryActive === true ? 'Agent aktiv' : 'Quelle wartet';
    const dbLabel = sourceInfo.dbIndexChecked === true ? (sourceInfo.dbIndexAvailable === true ? 'DB bereit' : 'DB nicht bereit') : 'DB nicht geprueft';
    const extensionList = Array.isArray(data.allowedExtensions) ? data.allowedExtensions.join(', ') : '';
    const truncatedNotice = inventory.truncated ? `<div class="admin-lock-note"><i>!</i><div><strong>Kompakte Liste gekuerzt.</strong><span>Es werden ${escapeHtml(String(counts.returned || counts.total || inventory.limit || 0))} Medien angezeigt. Weitere lokale Medien sind vorhanden; Paging/Persistenz wird separat geplant.</span></div></div>` : '';
    const syncNotice = `<div class="admin-lock-note"><i>i</i><div><strong>${escapeHtml(syncLabel)}</strong><span>${escapeHtml(syncInfo.note || (mode.local ? 'Lokal bleibt die Datei-Wahrheit.' : 'Online zeigt nur den read-only Agent-Memory-Index, keine Server-Speicherung.'))}</span></div></div>`;
    const sourceNotice = `<div class="admin-lock-note"><i>i</i><div><strong>${escapeHtml(sourceLabel)}</strong><span>${escapeHtml(buildSourceInfoNotice(data))}</span></div></div>`;

    mountPanel(`
      <section class="rdap-view" data-page-panel="${PAGE_ID}">
        <section class="page-header module-page-header cgn-card">
          <div><p class="cgn-eyebrow">Media-System</p><h1>Media-System</h1><p>${escapeHtml(statusText)}</p></div>
        </section>

        <section class="metric-grid">
          <article class="metric-card cgn-card"><span>Modus</span><strong>${escapeHtml(runtimeLabel)}</strong><small>gleiche UI lokal und online</small><div class="cgn-progress"><i style="width:70%"></i></div></article>
          <article class="metric-card cgn-card"><span>Inventar</span><strong>${escapeHtml(inventoryStatus)}</strong><small>${escapeHtml(syncLabel)}</small><div class="cgn-progress ${inventory.active ? '' : 'cgn-progress--warn'}"><i style="width:${inventory.active ? '80' : '15'}%"></i></div></article>
          <article class="metric-card cgn-card"><span>Quelle</span><strong>${escapeHtml(sourceLabel)}</strong><small>${escapeHtml(dbLabel)} · Fallback aus</small><div class="cgn-progress ${sourceInfo.primaryActive ? '' : 'cgn-progress--warn'}"><i style="width:${sourceInfo.primaryActive ? '75' : '20'}%"></i></div></article>
          <article class="metric-card cgn-card"><span>Writes</span><strong>Aus</strong><small>Upload/Edit/Delete gesperrt</small><div class="cgn-progress cgn-progress--warn"><i style="width:0%"></i></div></article>
        </section>

        <section class="page-grid">
          <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Grundlage</p><h2>Media-Bereiche</h2></div>${chip('read-only', 'info')}</div><div class="module-list">${renderRootRows(data)}</div></article>
          <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Quelle</p><h2>Agent / DB / Fallback</h2></div>${chip('kompakt', 'info')}</div><div class="self-profile-grid self-profile-grid--compact">${renderSourceInfoRows(data)}</div>${sourceNotice}</article>
          <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Rechte</p><h2>Bedienung bleibt gesperrt</h2></div>${chip('sicher', 'warn')}</div><div class="self-profile-grid self-profile-grid--compact">${renderPermissionRows(data)}</div><div class="admin-lock-note"><i>!</i><div><strong>Upload, Bearbeiten und Loeschen sind absichtlich deaktiviert.</strong><span>Erst wenn serverseitige Media-Rechte, Audit und Sicherheitsabfragen fertig sind, werden Buttons aktiviert.</span></div></div></article>
          <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Lokal / Online</p><h2>Wo liegen die Dateien?</h2></div>${chip(runtimeLabel, 'info')}</div><div class="admin-lock-note"><i>i</i><div><strong>${escapeHtml(mode.local ? 'Lokal liegen die echten Stream-PC-Dateien.' : 'Online hat der Webserver keinen direkten Zugriff auf Stream-PC-Dateien.')}</strong><span>${escapeHtml(mode.local ? 'Das lokale Inventar wird read-only aus den lokalen Assets gelesen.' : 'Online kommt das Inventar per Agent-WSS-Slow-Sync als kompakter Memory-Index, ohne Server-Persistenz und ohne Upload/Delete.')}</span></div></div></article>
          <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Dateitypen</p><h2>Erlaubte Endungen</h2></div>${chip('Allowlist', 'ok')}</div><div class="admin-lock-note"><i>✓</i><div><strong>${escapeHtml(extensionList || 'Noch nicht geladen')}</strong><span>Freie Pfade und absolute Pfade werden nicht als Bedienmodell genutzt.</span></div></div></article>
          <article class="cgn-card span2"><div class="card-head"><div><p class="cgn-eyebrow">Inventar</p><h2>Medienliste</h2></div>${chip(inventory.active ? 'Inventar aktiv' : 'wartet', inventory.active ? 'ok' : 'warn')}</div><div class="login-actions" style="justify-content:flex-start;flex-wrap:wrap;margin-bottom:12px">${renderFilters(data)} <button class="secondaryButton small" type="button" data-media-refresh="1">Neu laden</button></div>${syncNotice}${truncatedNotice}${renderInventoryTable()}</article>
        </section>
      </section>`);
  }

  function bindPanelActions(panel) {
    panel.querySelectorAll('[data-media-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        state.filter = button.getAttribute('data-media-filter') || 'all';
        safeRender();
      });
    });
    const refresh = panel.querySelector('[data-media-refresh]');
    if (refresh) refresh.addEventListener('click', () => loadStatus());
  }

  async function loadStatus() {
    if (state.loading) return;
    state.loading = true;
    state.error = '';
    safeRender();
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
        inventory: { active: false, items: [], counts: {} },
        permissions: {},
        plannedRoots: [],
        allowedExtensions: [],
        sourceInfo: { primary: 'agent_memory', primaryActive: false, dbIndexChecked: false, dbIndexAvailable: null, fallbackEnabled: false, writesEnabled: false }
      };
    } finally {
      state.loading = false;
      safeRender();
    }
  }

  function install() {
    if (installed) return;
    installed = true;
    registerModuleAndPage();
    safeRender();
    loadStatus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
