window.HugModule = (function(){
  'use strict';

  let root = null;
  let status = null;
  let textAdmin = { rows: [], kinds: [], types: [], allowedKinds: [] };
  let loading = false;
  let actionsBound = false;
  let activeTab = 'overview';
  let activeKind = 'hug';

  const tabs = [
    ['overview', 'Übersicht'],
    ['texts', 'Texte'],
    ['types', 'Typen'],
    ['config', 'Config'],
    ['stats', 'Statistiken'],
    ['diagnostics', 'Diagnose']
  ];

  const kindLabels = {
    hug: 'Hug-Texte',
    rehug: 'Rehug-Texte',
    hug_all: 'Hug-All',
    response: 'Systemtexte',
    top_title: 'Toplisten-Titel'
  };

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? ''); }
  function num(v){ return Number(v || 0).toLocaleString('de-DE'); }
  async function api(path, options){ return window.CGN.api(path, options || {}); }

  function registerModule(){
    if (!window.CGN) return;
    window.CGN.modules.hug = {
      title: 'Hug-System',
      panelId: 'hugModule',
      group: 'community',
      overlayLink: '',
      overlayLabel: '',
      reload(){ return window.HugModule?.loadAll?.(true); }
    };
  }

  function renderShell(){
    if (!root) return;
    root.innerHTML = `
      <div class="alert-tabs hug-tabs glass" role="tablist" aria-label="Hug-System Navigation">
        ${tabs.map(([id, label]) => `<button type="button" class="tab-btn ${id === activeTab ? 'active' : ''}" data-hug-tab="${esc(id)}">${esc(label)}</button>`).join('')}
      </div>

      <div class="hug-tab-panel" data-hug-panel="overview">
        <div class="hug-card hug-hero page-card">
          <div><h2>Hug-System</h2><div class="hug-note">Zentrale Übersicht für Hug/Rehug, DB-Texte, Statistiken und Diagnose.</div></div>
          <div class="hug-actions head-actions"><button type="button" data-hug-action="reload">Neu laden</button><button type="button" data-hug-action="reload-hug">Hug-Reload testen</button></div>
        </div>
        <div class="hug-grid"><div class="hug-card" id="hugStatusCard"></div><div class="hug-card" id="hugStatsCard"></div><div class="hug-card" id="hugOutputCard"></div><div class="hug-card" id="hugDbCard"></div></div>
      </div>

      <div class="hug-tab-panel" data-hug-panel="texts" hidden><div class="hug-card page-card" id="hugTextCard"></div></div>
      <div class="hug-tab-panel" data-hug-panel="types" hidden><div class="hug-card page-card" id="hugTypeCard"></div></div>
      <div class="hug-tab-panel" data-hug-panel="config" hidden><div class="hug-card page-card" id="hugConfigCard"></div></div>
      <div class="hug-tab-panel" data-hug-panel="stats" hidden><div class="hug-card page-card" id="hugTopCard"></div><div class="hug-card page-card" id="hugRecentCard"></div></div>
      <div class="hug-tab-panel" data-hug-panel="diagnostics" hidden><div class="hug-card page-card" id="hugDiagCard"></div></div>
    `;
    applyTab();
  }

  function applyTab(){
    if (!root) return;
    root.querySelectorAll('[data-hug-tab]').forEach(btn => {
      const active = btn.dataset.hugTab === activeTab;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    root.querySelectorAll('[data-hug-panel]').forEach(panel => { panel.hidden = panel.dataset.hugPanel !== activeTab; });
  }

  function render(){
    if (!root) return;
    if (!root.dataset.ready) { renderShell(); root.dataset.ready = '1'; bindActions(); }
    renderStatus(); renderStats(); renderOutput(); renderDatabase(); renderTop(); renderRecent(); renderTexts(); renderTypes(); renderConfig(); renderDiag(); applyTab();
  }

  function renderStatus(){
    const el = document.getElementById('hugStatusCard'); if (!el) return;
    el.innerHTML = `<h3>Status</h3>
      <div class="hug-row"><span>Modul</span><strong class="hug-pill ${status?.enabled ? 'ok' : 'warn'}">${status?.enabled ? 'Aktiv' : 'Inaktiv'}</strong></div>
      <div class="hug-row"><span>Quelle</span><span>${esc(status?.source || '-')}</span></div>
      <div class="hug-row"><span>Schema</span><span>${esc(status?.schemaVersion ?? '-')}</span></div>
      <div class="hug-row"><span>Cache</span><span>${esc(status?.cacheLoadedAt || '-')}</span></div>
      <div class="hug-row"><span>Rehug-Fenster</span><span>${esc(status?.rehugWindowSeconds ?? '-')}s</span></div>
      <div class="hug-row"><span>Top-Limit</span><span>${esc(status?.topLimit ?? '-')}</span></div>`;
  }

  function renderStats(){
    const el = document.getElementById('hugStatsCard'); if (!el) return; const c = status?.counts || {};
    el.innerHTML = `<h3>Statistik</h3><div class="hug-kpis">${kpi('User', c.users)}${kpi('Hugs vergeben', c.totalHugsGiven)}${kpi('Hugs erhalten', c.totalHugsReceived)}${kpi('Rehugs', c.totalRehugsGiven)}</div>
      <div class="hug-row"><span>Aktive User</span><span>${num(c.enabledUsers)}</span></div><div class="hug-row"><span>Inaktive User</span><span>${num(c.disabledUsers)}</span></div><div class="hug-row"><span>Pair-Stats</span><span>${num(c.pairStats)}</span></div><div class="hug-row"><span>Pending Rehugs</span><span>${num(c.pendingRehugs)}</span></div>`;
  }
  function kpi(label, value){ return `<div class="hug-kpi"><strong>${num(value)}</strong><span>${esc(label)}</span></div>`; }

  function renderOutput(){
    const el = document.getElementById('hugOutputCard'); if (!el) return; const out = status?.output || {};
    el.innerHTML = `<h3>Chat-Ausgabe</h3><div class="hug-row"><span>Modus</span><strong class="hug-pill ok">${esc(out.mode || '-')}</strong></div><div class="hug-row"><span>Prefer</span><span>${esc(out.prefer || '-')}</span></div><div class="hug-row"><span>Fallback Streamer</span><span>${out.fallbackToStreamer === false ? 'Nein' : 'Ja'}</span></div><div class="hug-row"><span>Fallback Streamer.bot</span><span>${out.fallbackToStreamerbot === false ? 'Nein' : 'Ja'}</span></div><div class="hug-note">Output-Config wird später separat bearbeitbar gemacht.</div>`;
  }

  function renderDatabase(){
    const el = document.getElementById('hugDbCard'); if (!el) return; const database = status?.database || {};
    el.innerHTML = `<h3>Datenbank</h3><div class="hug-row"><span>Adapter</span><span>${esc(database.adapter || '-')}</span></div><div class="hug-row"><span>Dialect</span><span>${esc(database.dialect || '-')}</span></div><div class="hug-row"><span>MariaDB</span><span>${esc(database.mariaDbReady || 'vorbereitet')}</span></div><div class="hug-note">Pfad: ${esc(database.path || '')}</div>`;
  }

  function renderTop(){
    const el = document.getElementById('hugTopCard'); if (!el) return; const top = status?.top || {};
    el.innerHTML = `<div class="card-head big-head"><h2>Statistiken</h2><div class="small-note">Toplisten aus den aktuellen Hug-Daten.</div></div><div class="hug-top-grid">${topList('Top Hugger', top.given, 'givenTotal')}${topList('Top Empfänger', top.received, 'receivedTotal')}${topList('Top Rehug', top.rehug, 'rehugGivenTotal')}</div>`;
  }
  function topList(title, rows, key){
    const list = Array.isArray(rows) && rows.length ? rows.map((r, i) => `<li><span>${i + 1}. ${esc(r.displayName || r.login || '-')}</span><strong>${num(r[key])}</strong></li>`).join('') : '<li><span>Keine Daten</span><strong>-</strong></li>';
    return `<div class="hug-top-list"><h4>${esc(title)}</h4><ol>${list}</ol></div>`;
  }

  function renderRecent(){
    const el = document.getElementById('hugRecentCard'); if (!el) return; const rows = Array.isArray(status?.recentPairs) ? status.recentPairs : [];
    el.innerHTML = `<h2>Letzte Hug-Aktionen</h2><div class="hug-table-wrap"><table class="hug-table table"><thead><tr><th>Von</th><th>An</th><th>Hugs</th><th>Rehugs</th><th>Letzter Hug</th><th>Letzter Rehug</th></tr></thead><tbody>${rows.length ? rows.map(row => `<tr><td>${esc(row.fromDisplayName || '-')}</td><td>${esc(row.toDisplayName || '-')}</td><td>${num(row.givenCount)}</td><td>${num(row.rehugCount)}</td><td>${esc(row.lastHugAt || '-')}</td><td>${esc(row.lastRehugAt || '-')}</td></tr>`).join('') : '<tr><td colspan="6">Keine Daten vorhanden.</td></tr>'}</tbody></table></div>`;
  }

  function renderTexts(){
    const el = document.getElementById('hugTextCard'); if (!el) return;
    const kinds = Array.isArray(textAdmin.kinds) && textAdmin.kinds.length ? textAdmin.kinds : (status?.textKinds || []);
    const rows = (textAdmin.rows || []).filter(r => r.kind === activeKind);
    const typeOptions = (textAdmin.types || []).map(t => `<option value="${esc(t.id)}">#${esc(t.id)} ${esc(t.name)}</option>`).join('');

    el.innerHTML = `
      <div class="card-head big-head">
        <div><h2>Texte bearbeiten</h2><div class="small-note">Texte werden direkt in der Datenbank gespeichert. Löschen ist absichtlich deaktiviert; Texte können inaktiv geschaltet werden.</div></div>
        <div class="head-actions"><button type="button" data-hug-action="reload-texts">Texte neu laden</button></div>
      </div>

      <div class="hug-text-kind-tabs">
        ${kinds.map(k => `<button type="button" class="filter-btn ${k.kind === activeKind ? 'active' : ''}" data-hug-kind="${esc(k.kind)}">${esc(kindLabels[k.kind] || k.kind)} <span>${num(k.count)}</span></button>`).join('')}
      </div>

      <form class="hug-new-text-form" data-hug-new-text>
        <h3>Neuen Text hinzufügen</h3>
        <div class="hug-editor-grid">
          <label><span>Art</span><select name="kind" data-new-kind>${Object.keys(kindLabels).map(k => `<option value="${esc(k)}" ${k === activeKind ? 'selected' : ''}>${esc(kindLabels[k])}</option>`).join('')}</select></label>
          <label data-new-type-wrap><span>Typ</span><select name="typeId"><option value="">-</option>${typeOptions}</select></label>
          <label><span>Key</span><input name="textKey" placeholder="z.B. hug_all / response-key"></label>
          <label><span>Gewicht</span><input name="weight" type="number" min="1" value="1"></label>
          <label class="wide-field"><span>Text</span><textarea name="text" placeholder="{from} umarmt {to} ..."></textarea></label>
          <div class="hug-editor-actions"><button type="submit" class="success">Text hinzufügen</button></div>
        </div>
      </form>

      <div class="hug-text-list">
        ${rows.length ? rows.map(renderTextRow).join('') : '<div class="hug-empty">Keine Texte in dieser Gruppe gefunden.</div>'}
      </div>
    `;
  }

  function renderTextRow(row){
    return `<form class="hug-text-row ${row.enabled ? '' : 'is-disabled'}" data-hug-text-id="${esc(row.id)}">
      <div class="hug-text-meta">
        <strong>#${esc(row.id)} · ${esc(kindLabels[row.kind] || row.kind)}</strong>
        <span>${row.typeName ? `Typ: ${esc(row.typeName)} · ` : ''}Key: ${esc(row.textKey || '-')} · Gewicht: ${esc(row.weight)} · Sort: ${esc(row.sortOrder)}</span>
      </div>
      <textarea name="text">${esc(row.text)}</textarea>
      <div class="hug-text-controls">
        <label><span>Key</span><input name="textKey" value="${esc(row.textKey || '')}"></label>
        <label><span>Gewicht</span><input name="weight" type="number" min="1" value="${esc(row.weight)}"></label>
        <label><span>Sort</span><input name="sortOrder" type="number" value="${esc(row.sortOrder)}"></label>
        <button type="submit" class="success">Speichern</button>
        <button type="button" class="${row.enabled ? 'danger' : ''}" data-hug-toggle="${row.enabled ? '0' : '1'}">${row.enabled ? 'Deaktivieren' : 'Aktivieren'}</button>
      </div>
    </form>`;
  }

  function renderTypes(){
    const el = document.getElementById('hugTypeCard'); if (!el) return; const types = Array.isArray(status?.types) ? status.types : [];
    el.innerHTML = `<div class="card-head big-head"><div><h2>Hug-Typen</h2><div class="small-note">Typen, Gewichtung und zugeordnete Hug-/Rehug-Texte.</div></div><div class="head-actions"><button type="button" disabled>Typen bearbeiten später</button></div></div><div class="hug-type-list">${types.length ? types.map(t => `<div class="hug-type"><strong>#${esc(t.id)} ${esc(t.name)}</strong><span>Gewicht ${esc(t.weight)} · ${t.enabled ? 'aktiv' : 'inaktiv'} · Hug-Texte ${esc(t.hugTexts ?? t.hugTextCount ?? '-')} · Rehug-Texte ${esc(t.rehugTexts ?? t.rehugTextCount ?? '-')}</span></div>`).join('') : '<div class="hug-empty">Keine Hug-Typen gefunden.</div>'}</div>`;
  }

  function renderConfig(){
    const el = document.getElementById('hugConfigCard'); if (!el) return; const out = status?.output || {};
    el.innerHTML = `<div class="card-head big-head"><div><h2>Config</h2><div class="small-note">Aktuelle Einstellungen. Schreiben folgt später mit Rollen/Rechte/Audit.</div></div><div class="head-actions"><button type="button" disabled>Config speichern später</button></div></div><div class="config-grid"><label><span>Aktiv</span><input value="${status?.enabled ? 'Aktiv' : 'Inaktiv'}" disabled></label><label><span>Top-Limit</span><input value="${esc(status?.topLimit ?? '')}" disabled></label><label><span>Rehug-Fenster Sekunden</span><input value="${esc(status?.rehugWindowSeconds ?? '')}" disabled></label><label><span>Output-Modus</span><input value="${esc(out.mode || '')}" disabled></label><label><span>Prefer</span><input value="${esc(out.prefer || '')}" disabled></label><label><span>Fallback Streamer</span><input value="${out.fallbackToStreamer === false ? 'Nein' : 'Ja'}" disabled></label><label><span>Fallback Streamer.bot</span><input value="${out.fallbackToStreamerbot === false ? 'Nein' : 'Ja'}" disabled></label></div>`;
  }

  function renderDiag(){
    const el = document.getElementById('hugDiagCard'); if (!el) return; const lastImport = status?.lastImport || {};
    el.innerHTML = `<div class="card-head big-head"><div><h2>Diagnose</h2><div class="small-note">Technischer Zustand der Hug-Integration.</div></div><div class="head-actions"><button type="button" data-hug-action="reload">Neu laden</button><button type="button" data-hug-action="reload-hug">Hug-Reload testen</button></div></div><div class="hug-row"><span>Config</span><span>${esc(status?.configPath || '-')}</span></div><div class="hug-row"><span>Messages</span><span>${esc(status?.messagesPath || '-')}</span></div><div class="hug-row"><span>Letzter Import</span><span>${lastImport.importedAt ? esc(lastImport.importedAt) : esc(lastImport.reason || '-')}</span></div><div class="hug-row"><span>Letzter Fehler</span><span>${esc(status?.lastError || '-')}</span></div><pre class="hug-json">${esc(JSON.stringify({ module: status?.module, counts: status?.counts, output: status?.output }, null, 2))}</pre>`;
  }

  function bindActions(){
    if (actionsBound || !root) return;
    actionsBound = true;
    root.addEventListener('click', async ev => {
      const tab = ev.target.closest('[data-hug-tab]');
      if (tab) { activeTab = tab.dataset.hugTab || 'overview'; applyTab(); if (activeTab === 'texts') await loadTexts(false); return; }
      const kind = ev.target.closest('[data-hug-kind]');
      if (kind) { activeKind = kind.dataset.hugKind || 'hug'; renderTexts(); return; }
      const toggle = ev.target.closest('[data-hug-toggle]');
      if (toggle) { await toggleText(toggle); return; }
      const btn = ev.target.closest('[data-hug-action]');
      if (!btn) return;
      const action = btn.dataset.hugAction;
      btn.disabled = true;
      try {
        if (action === 'reload') await loadAll(true);
        if (action === 'reload-texts') await loadTexts(true);
        if (action === 'reload-hug') { await api('/api/hug/reload'); await loadAll(true); }
      } catch (err) { alert(`Hug-Fehler: ${err.message}`); }
      finally { btn.disabled = false; }
    });

    root.addEventListener('submit', async ev => {
      const textRow = ev.target.closest('[data-hug-text-id]');
      if (textRow) { ev.preventDefault(); await saveTextRow(textRow); return; }
      const newForm = ev.target.closest('[data-hug-new-text]');
      if (newForm) { ev.preventDefault(); await createText(newForm); }
    });
  }

  async function loadTexts(force){
    if (!force && textAdmin.rows.length) { renderTexts(); return; }
    textAdmin = await api('/api/hug/admin/texts?includeDisabled=1');
    renderTexts();
  }

  async function saveTextRow(form){
    const id = form.dataset.hugTextId;
    const payload = Object.fromEntries(new FormData(form).entries());
    await api(`/api/hug/admin/texts/${encodeURIComponent(id)}`, { method: 'POST', body: JSON.stringify(payload) });
    await api('/api/hug/reload').catch(() => null);
    await loadTexts(true);
    await loadAll(true);
  }

  async function toggleText(btn){
    const form = btn.closest('[data-hug-text-id]');
    const id = form?.dataset?.hugTextId;
    if (!id) return;
    await api(`/api/hug/admin/texts/${encodeURIComponent(id)}/toggle`, { method: 'POST', body: JSON.stringify({ enabled: btn.dataset.hugToggle === '1' }) });
    await api('/api/hug/reload').catch(() => null);
    await loadTexts(true);
    await loadAll(true);
  }

  async function createText(form){
    const payload = Object.fromEntries(new FormData(form).entries());
    if (payload.typeId === '') payload.typeId = null;
    await api('/api/hug/admin/texts', { method: 'POST', body: JSON.stringify(payload) });
    form.reset();
    await api('/api/hug/reload').catch(() => null);
    await loadTexts(true);
    await loadAll(true);
  }

  async function loadAll(force){
    if (loading && !force) return;
    loading = true;
    try {
      status = await api('/api/dashboard/community/hug/status');
      if (activeTab === 'texts') await loadTexts(false);
      render();
    } catch (err) {
      if (root) root.innerHTML = `<div class="hug-card"><h2>Hug-System</h2><div class="hug-error">${esc(err.message)}</div></div>`;
    } finally { loading = false; }
  }

  function init(){ registerModule(); root = document.getElementById('hugModule'); if (!root) return; renderShell(); bindActions(); loadAll(false); }
  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'hug') loadAll(true); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  return { init, loadAll };
})();
