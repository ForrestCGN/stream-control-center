window.HugModule = (function(){
  'use strict';

  let root = null;
  let status = null;
  let textPairs = null;
  let textPairsError = '';
  let loading = false;
  let actionsBound = false;
  let activeTab = 'overview';
  let activeTextCategory = 'pairs';
  let pairFilterType = 'all';
  let pairSearch = '';

  const tabs = [
    ['overview', 'Übersicht'],
    ['texts', 'Texte'],
    ['config', 'Config'],
    ['stats', 'Statistiken'],
    ['diagnostics', 'Diagnose']
  ];

  const textCategories = [
    ['pairs', 'Hug/Rehug-Paare'],
    ['hug_all', 'Chatweite Hugs'],
    ['responses', 'Systemantworten'],
    ['top_titles', 'Toplisten']
  ];

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
          <div>
            <h2>Hug-System</h2>
            <div class="hug-note">Zentrale Übersicht für Hug/Rehug, DB-Texte, Statistiken und Diagnose.</div>
          </div>
          <div class="hug-actions head-actions">
            <button type="button" data-hug-action="reload">Neu laden</button>
            <button type="button" data-hug-action="reload-hug">Hug-Reload testen</button>
          </div>
        </div>
        <div class="hug-grid">
          <div class="hug-card" id="hugStatusCard"></div>
          <div class="hug-card" id="hugStatsCard"></div>
          <div class="hug-card" id="hugOutputCard"></div>
          <div class="hug-card" id="hugDbCard"></div>
        </div>
      </div>

      <div class="hug-tab-panel" data-hug-panel="texts" hidden>
        <div class="hug-card page-card" id="hugTextCard"></div>
      </div>

      <div class="hug-tab-panel" data-hug-panel="types" hidden>
        <div class="hug-card page-card" id="hugTypeCard"></div>
      </div>

      <div class="hug-tab-panel" data-hug-panel="config" hidden>
        <div class="hug-card page-card" id="hugConfigCard"></div>
      </div>

      <div class="hug-tab-panel" data-hug-panel="stats" hidden>
        <div class="hug-card page-card" id="hugTopCard"></div>
        <div class="hug-card page-card" id="hugRecentCard"></div>
      </div>

      <div class="hug-tab-panel" data-hug-panel="diagnostics" hidden>
        <div class="hug-card page-card" id="hugDiagCard"></div>
      </div>
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
    root.querySelectorAll('[data-hug-panel]').forEach(panel => {
      panel.hidden = panel.dataset.hugPanel !== activeTab;
    });
  }

  function render(){
    if (!root) return;
    if (!root.dataset.ready) {
      renderShell();
      root.dataset.ready = '1';
      bindActions();
    }
    renderStatus();
    renderStats();
    renderOutput();
    renderDatabase();
    renderTop();
    renderRecent();
    renderTexts();
    renderTypes();
    renderConfig();
    renderDiag();
    applyTab();
  }

  function renderStatus(){
    const el = document.getElementById('hugStatusCard');
    if (!el) return;
    const c = status?.counts || {};
    el.innerHTML = `
      <h3>Status</h3>
      <div class="hug-row"><span>Modul</span><strong class="hug-pill ${status?.enabled ? 'ok' : 'warn'}">${status?.enabled ? 'Aktiv' : 'Inaktiv'}</strong></div>
      <div class="hug-row"><span>Quelle</span><span>${esc(status?.source || '-')}</span></div>
      <div class="hug-row"><span>Schema</span><span>${esc(status?.schemaVersion ?? '-')}</span></div>
      <div class="hug-row"><span>Cache</span><span>${esc(status?.cacheLoadedAt || '-')}</span></div>
      <div class="hug-row"><span>Rehug-Fenster</span><span>${esc(status?.rehugWindowSeconds ?? '-')}s</span></div>
      <div class="hug-row"><span>Textpaare</span><span>${num(c.activeHugTextPairs ?? textPairs?.activeCount ?? 0)} / ${num(c.hugTextPairs ?? textPairs?.count ?? 0)}</span></div>
      <div class="hug-row"><span>Top-Limit</span><span>${esc(status?.topLimit ?? '-')}</span></div>
    `;
  }

  function renderStats(){
    const el = document.getElementById('hugStatsCard');
    if (!el) return;
    const c = status?.counts || {};
    el.innerHTML = `
      <h3>Statistik</h3>
      <div class="hug-kpis">
        ${kpi('User', c.users)}
        ${kpi('Hugs vergeben', c.totalHugsGiven)}
        ${kpi('Hugs erhalten', c.totalHugsReceived)}
        ${kpi('Rehugs', c.totalRehugsGiven)}
      </div>
      <div class="hug-row"><span>Aktive User</span><span>${num(c.enabledUsers)}</span></div>
      <div class="hug-row"><span>Inaktive User</span><span>${num(c.disabledUsers)}</span></div>
      <div class="hug-row"><span>Pair-Stats</span><span>${num(c.pairStats)}</span></div>
      <div class="hug-row"><span>Pending Rehugs</span><span>${num(c.pendingRehugs)}</span></div>
    `;
  }

  function kpi(label, value){
    return `<div class="hug-kpi"><strong>${num(value)}</strong><span>${esc(label)}</span></div>`;
  }

  function renderOutput(){
    const el = document.getElementById('hugOutputCard');
    if (!el) return;
    const out = status?.output || {};
    el.innerHTML = `
      <h3>Chat-Ausgabe</h3>
      <div class="hug-row"><span>Modus</span><strong class="hug-pill ok">${esc(out.mode || '-')}</strong></div>
      <div class="hug-row"><span>Prefer</span><span>${esc(out.prefer || '-')}</span></div>
      <div class="hug-row"><span>Fallback Streamer</span><span>${out.fallbackToStreamer === false ? 'Nein' : 'Ja'}</span></div>
      <div class="hug-row"><span>Fallback Streamer.bot</span><span>${out.fallbackToStreamerbot === false ? 'Nein' : 'Ja'}</span></div>
      <div class="hug-note">Schreiben der Ausgabe-Settings kommt später separat. Aktuell bleibt die vorhandene Logik erhalten.</div>
    `;
  }

  function renderDatabase(){
    const el = document.getElementById('hugDbCard');
    if (!el) return;
    const database = status?.database || {};
    el.innerHTML = `
      <h3>Datenbank</h3>
      <div class="hug-row"><span>Adapter</span><span>${esc(database.adapter || '-')}</span></div>
      <div class="hug-row"><span>Dialect</span><span>${esc(database.dialect || '-')}</span></div>
      <div class="hug-row"><span>MariaDB</span><span>${esc(database.mariaDbReady || 'vorbereitet')}</span></div>
      <div class="hug-note">Pfad: ${esc(database.path || '')}</div>
    `;
  }

  function renderTop(){
    const el = document.getElementById('hugTopCard');
    if (!el) return;
    const top = status?.top || {};
    el.innerHTML = `
      <div class="card-head big-head"><h2>Statistiken</h2><div class="small-note">Toplisten aus den aktuellen Hug-Daten.</div></div>
      <div class="hug-top-grid">
        ${topList('Top Hugger', top.given, 'givenTotal')}
        ${topList('Top Empfänger', top.received, 'receivedTotal')}
        ${topList('Top Rehug', top.rehug, 'rehugGivenTotal')}
      </div>
    `;
  }

  function topList(title, rows, key){
    const list = Array.isArray(rows) && rows.length ? rows.map((r, i) => `
      <li><span>${i + 1}. ${esc(r.displayName || r.login || '-')}</span><strong>${num(r[key])}</strong></li>
    `).join('') : '<li><span>Keine Daten</span><strong>-</strong></li>';
    return `<div class="hug-top-list"><h4>${esc(title)}</h4><ol>${list}</ol></div>`;
  }

  function renderRecent(){
    const el = document.getElementById('hugRecentCard');
    if (!el) return;
    const rows = Array.isArray(status?.recentPairs) ? status.recentPairs : [];
    el.innerHTML = `
      <h2>Letzte Hug-Aktionen</h2>
      <div class="hug-table-wrap">
        <table class="hug-table table">
          <thead><tr><th>Von</th><th>An</th><th>Hugs</th><th>Rehugs</th><th>Letzter Hug</th><th>Letzter Rehug</th></tr></thead>
          <tbody>
            ${rows.length ? rows.map(row => `
              <tr>
                <td>${esc(row.fromDisplayName || '-')}</td>
                <td>${esc(row.toDisplayName || '-')}</td>
                <td>${num(row.givenCount)}</td>
                <td>${num(row.rehugCount)}</td>
                <td>${esc(row.lastHugAt || '-')}</td>
                <td>${esc(row.lastRehugAt || '-')}</td>
              </tr>
            `).join('') : '<tr><td colspan="6">Keine Daten vorhanden.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderTexts(){
    const el = document.getElementById('hugTextCard');
    if (!el) return;
    const pairs = textPairs?.pairs || [];
    const kinds = Array.isArray(status?.textKinds) ? status.textKinds : [];
    el.innerHTML = `
      <div class="card-head big-head">
        <div>
          <h2>Texte</h2>
          <div class="small-note">Hug/Rehug wird als einfache Textpaar-Liste verwaltet: Text 1 passt zu Antwort 1, Text 2 passt zu Antwort 2.</div>
        </div>
        <div class="head-actions">
          <button type="button" data-hug-action="reload-text-pairs">Textpaare neu laden</button>
        </div>
      </div>

      <div class="hug-text-category-tabs">
        ${textCategories.map(([id, label]) => `<button type="button" class="${activeTextCategory === id ? 'active' : ''}" data-hug-text-category="${esc(id)}">${esc(label)}</button>`).join('')}
      </div>

      ${renderTextCategoryBody(pairs, kinds)}
    `;
  }

  function renderTextCategoryBody(pairs, kinds){
    if (activeTextCategory === 'pairs') return renderTextPairsEditor(pairs);
    if (activeTextCategory === 'hug_all') return renderTextCategoryPlaceholder('Chatweite Hugs', 'hug_all', kinds);
    if (activeTextCategory === 'responses') return renderTextCategoryPlaceholder('Systemantworten', 'response', kinds);
    if (activeTextCategory === 'top_titles') return renderTextCategoryPlaceholder('Toplisten', 'top_title', kinds);
    return '<div class="hug-empty">Unbekannte Textkategorie.</div>';
  }

  function renderTextCategoryPlaceholder(title, kind, kinds){
    const item = kinds.find(k => k.kind === kind);
    return `
      <div class="hug-sub-card">
        <h3>${esc(title)}</h3>
        <div class="hug-note">Diese Kategorie ist sichtbar, wird aber in diesem STEP noch nicht editiert. Zuerst werden die fachlich wichtigen Hug/Rehug-Paare sauber gekoppelt.</div>
        <div class="hug-kind-grid">
          <div class="hug-kind"><strong>${num(item?.count || 0)}</strong><span>${esc(kind)}</span></div>
        </div>
      </div>
    `;
  }

  function renderTextPairsEditor(pairs){
    if (textPairsError) {
      return `<div class="hug-error">Textpaare konnten nicht geladen werden: ${esc(textPairsError)}</div>`;
    }
    if (!textPairs) {
      return `<div class="hug-empty">Textpaare werden geladen oder Backend-STEP181.1 ist noch nicht deployed.</div>`;
    }

    const types = Array.isArray(textPairs.types) ? textPairs.types : [];
    const filtered = filterPairs(pairs);
    return `
      <div class="hug-pair-summary">
        <div class="hug-kind"><strong>${num(textPairs.activeCount)}</strong><span>aktive Paare</span></div>
        <div class="hug-kind"><strong>${num(textPairs.count)}</strong><span>Paare gesamt</span></div>
        <div class="hug-kind"><strong>${num(filtered.length)}</strong><span>angezeigt</span></div>
      </div>

      <div class="hug-pair-controls simple">
        <label>
          <span>Suche</span>
          <input data-hug-pair-search value="${esc(pairSearch)}" placeholder="Text oder Antwort suchen">
        </label>
      </div>

      ${renderNewPairForm(types)}

      <div class="hug-pair-list">
        ${filtered.length ? filtered.map(pair => renderPairCard(pair, types)).join('') : '<div class="hug-empty">Keine passenden Textpaare gefunden.</div>'}
      </div>
    `;
  }

  function filterPairs(pairs){
    const q = String(pairSearch || '').trim().toLowerCase();
    return (pairs || []).filter(pair => {
      if (!q) return true;
      return [pair.name, pair.hugText, pair.rehugText, pair.typeName].some(v => String(v || '').toLowerCase().includes(q));
    });
  }

  function renderNewPairForm(types){
    return `
      <details class="hug-pair-new">
        <summary>Neues Hug/Rehug-Paar anlegen</summary>
        <div class="hug-pair-form" data-hug-pair-form="new">
          <input type="hidden" data-pair-field="typeId" value="1">
          <input type="hidden" data-pair-field="name" value="">
          <label class="compact compact-aktiv"><span>Aktiv</span><select data-pair-field="enabled"><option value="true">Aktiv</option><option value="false">Inaktiv</option></select></label>
          <label class="compact compact-weight"><span>Gewichtung</span><input data-pair-field="weight" type="number" min="1" value="1"></label>
          <label class="compact compact-sort"><span>Sortierung</span><input data-pair-field="sortOrder" type="number" value="0"></label>
          <label class="wide pair-textarea"><span>Text</span><textarea data-pair-field="hugText" rows="3" placeholder="{from} umarmt {to} ..."></textarea></label>
          <label class="wide pair-textarea"><span>Antwort-Text</span><textarea data-pair-field="rehugText" rows="3" placeholder="{from} erwidert die Umarmung von {to} ..."></textarea></label>
          <div class="hug-pair-actions wide">
            <button type="button" data-hug-action="save-pair" data-pair-id="new">Textpaar speichern</button>
          </div>
        </div>
      </details>
    `;
  }

  function renderPairCard(pair, types){
    const typeOptions = types.map(t => `<option value="${esc(t.id)}"${String(t.id) === String(pair.typeId) ? ' selected' : ''}>#${esc(t.id)} ${esc(t.name)}</option>`).join('');
    return `
      <div class="hug-pair-card" data-hug-pair-form="${esc(pair.id)}">
        <div class="hug-pair-card-head">
          <div>
            <strong>Textpaar ${esc(pair.id)}</strong>
            <span>${pair.enabled ? 'aktiv' : 'inaktiv'} · Gewicht ${esc(pair.weight || 1)} · Quelle ${esc(pair.source || '-')} · Text und Antwort bleiben gekoppelt</span>
          </div>
          <div class="hug-pair-card-actions">
            <button type="button" data-hug-action="save-pair" data-pair-id="${esc(pair.id)}">Speichern</button>
            <button type="button" class="danger" data-hug-action="delete-pair" data-pair-id="${esc(pair.id)}">Löschen</button>
          </div>
        </div>
        <div class="hug-pair-form">
          <input type="hidden" data-pair-field="id" value="${esc(pair.id)}">
          <input type="hidden" data-pair-field="typeId" value="${esc(pair.typeId || 1)}">
          <input type="hidden" data-pair-field="name" value="${esc(pair.name || '')}">
          <label class="compact compact-aktiv"><span>Aktiv</span><select data-pair-field="enabled"><option value="true"${pair.enabled ? ' selected' : ''}>Aktiv</option><option value="false"${!pair.enabled ? ' selected' : ''}>Inaktiv</option></select></label>
          <label class="compact compact-weight"><span>Gewichtung</span><input data-pair-field="weight" type="number" min="1" value="${esc(pair.weight || 1)}"></label>
          <label class="compact compact-sort"><span>Sortierung</span><input data-pair-field="sortOrder" type="number" value="${esc(pair.sortOrder || 0)}"></label>
          <label class="wide pair-textarea"><span>Text</span><textarea data-pair-field="hugText" rows="3">${esc(pair.hugText || '')}</textarea></label>
          <label class="wide pair-textarea"><span>Antwort-Text</span><textarea data-pair-field="rehugText" rows="3">${esc(pair.rehugText || '')}</textarea></label>
        </div>
      </div>
    `;
  }

  function renderTypes(){
    const el = document.getElementById('hugTypeCard');
    if (!el) return;
    const types = Array.isArray(status?.types) ? status.types : [];
    el.innerHTML = `
      <div class="card-head big-head">
        <div>
          <h2>Hug-Typen</h2>
          <div class="small-note">Typen, Gewichtung und zugeordnete gekoppelte Hug-/Rehug-Texte.</div>
        </div>
        <div class="head-actions"><button type="button" disabled>Typen bearbeiten später</button></div>
      </div>
      <div class="hug-type-list">
        ${types.length ? types.map(t => `
          <div class="hug-type">
            <strong>#${esc(t.id)} ${esc(t.name)}</strong>
            <span>Gewicht ${esc(t.weight)} · ${t.enabled ? 'aktiv' : 'inaktiv'} · Hug-Texte ${esc(t.hugTexts ?? t.hugTextCount ?? '-')} · Rehug-Texte ${esc(t.rehugTexts ?? t.rehugTextCount ?? '-')} · Paare ${esc(t.activeTextPairs ?? t.activeTextPairCount ?? '-')}/${esc(t.textPairs ?? t.textPairCount ?? '-')}</span>
          </div>
        `).join('') : '<div class="hug-empty">Keine Hug-Typen gefunden.</div>'}
      </div>
    `;
  }

  function renderConfig(){
    const el = document.getElementById('hugConfigCard');
    if (!el) return;
    const out = status?.output || {};
    el.innerHTML = `
      <div class="card-head big-head">
        <div>
          <h2>Config</h2>
          <div class="small-note">Aktuelle Einstellungen. Schreiben folgt später mit Rollen/Rechte/Audit.</div>
        </div>
        <div class="head-actions"><button type="button" disabled>Config speichern später</button></div>
      </div>
      <div class="config-grid">
        <label><span>Aktiv</span><input value="${status?.enabled ? 'Aktiv' : 'Inaktiv'}" disabled></label>
        <label><span>Top-Limit</span><input value="${esc(status?.topLimit ?? '')}" disabled></label>
        <label><span>Rehug-Fenster Sekunden</span><input value="${esc(status?.rehugWindowSeconds ?? '')}" disabled></label>
        <label><span>Output-Modus</span><input value="${esc(out.mode || '')}" disabled></label>
        <label><span>Prefer</span><input value="${esc(out.prefer || '')}" disabled></label>
        <label><span>Fallback Streamer</span><input value="${out.fallbackToStreamer === false ? 'Nein' : 'Ja'}" disabled></label>
        <label><span>Fallback Streamer.bot</span><input value="${out.fallbackToStreamerbot === false ? 'Nein' : 'Ja'}" disabled></label>
      </div>
    `;
  }

  function renderDiag(){
    const el = document.getElementById('hugDiagCard');
    if (!el) return;
    const lastImport = status?.lastImport || {};
    el.innerHTML = `
      <div class="card-head big-head">
        <div><h2>Diagnose</h2><div class="small-note">Technischer Zustand der Hug-Integration.</div></div>
        <div class="head-actions"><button type="button" data-hug-action="reload">Neu laden</button><button type="button" data-hug-action="reload-hug">Hug-Reload testen</button></div>
      </div>
      <div class="hug-row"><span>Config</span><span>${esc(status?.configPath || '-')}</span></div>
      <div class="hug-row"><span>Messages</span><span>${esc(status?.messagesPath || '-')}</span></div>
      <div class="hug-row"><span>Textpaare</span><span>${num(textPairs?.activeCount || 0)} aktiv / ${num(textPairs?.count || 0)} gesamt</span></div>
      <div class="hug-row"><span>Letzter Import</span><span>${lastImport.importedAt ? esc(lastImport.importedAt) : esc(lastImport.reason || '-')}</span></div>
      <div class="hug-row"><span>Letzter Fehler</span><span>${esc(status?.lastError || textPairsError || '-')}</span></div>
      <pre class="hug-json">${esc(JSON.stringify({ module: status?.module, counts: status?.counts, output: status?.output, textPairs: { count: textPairs?.count, activeCount: textPairs?.activeCount } }, null, 2))}</pre>
    `;
  }

  function collectPairForm(pairId){
    const form = root?.querySelector(`[data-hug-pair-form="${CSS.escape(String(pairId))}"]`);
    if (!form) throw new Error('Formular nicht gefunden.');
    const data = {};
    form.querySelectorAll('[data-pair-field]').forEach(field => {
      const key = field.dataset.pairField;
      if (!key) return;
      data[key] = field.value;
    });
    if (pairId !== 'new') data.id = pairId;
    data.typeId = Number(data.typeId || 0);
    data.weight = Math.max(1, Number(data.weight || 1));
    data.sortOrder = Number(data.sortOrder || 0);
    data.enabled = data.enabled !== 'false';
    data.hugText = String(data.hugText || '').trim();
    data.rehugText = String(data.rehugText || '').trim();
    if (!data.typeId) throw new Error('Typ fehlt.');
    if (!data.hugText) throw new Error('Hug-Text fehlt.');
    if (!data.rehugText) throw new Error('Rehug-Antwort fehlt.');
    return data;
  }

  async function loadTextPairs(){
    textPairsError = '';
    try {
      textPairs = await api('/api/dashboard/community/hug/text-pairs');
    } catch (err) {
      textPairs = null;
      textPairsError = err.message || String(err);
    }
  }

  async function savePair(pairId){
    const pair = collectPairForm(pairId);
    await api('/api/dashboard/community/hug/text-pairs', {
      method: 'POST',
      body: JSON.stringify({ action: 'savePair', pair })
    });
    await loadAll(true);
  }

  async function deletePair(pairId){
    if (!pairId || pairId === 'new') return;
    if (!confirm('Dieses Hug/Rehug-Paar wirklich löschen?')) return;
    await api('/api/dashboard/community/hug/text-pairs', {
      method: 'POST',
      body: JSON.stringify({ action: 'deletePair', id: pairId })
    });
    await loadAll(true);
  }

  function bindActions(){
    if (actionsBound || !root) return;
    actionsBound = true;
    root.addEventListener('click', async ev => {
      const tab = ev.target.closest('[data-hug-tab]');
      if (tab) {
        activeTab = tab.dataset.hugTab || 'overview';
        applyTab();
        return;
      }

      const textCat = ev.target.closest('[data-hug-text-category]');
      if (textCat) {
        activeTextCategory = textCat.dataset.hugTextCategory || 'pairs';
        renderTexts();
        return;
      }

      const btn = ev.target.closest('[data-hug-action]');
      if (!btn) return;
      const action = btn.dataset.hugAction;
      btn.disabled = true;
      try {
        if (action === 'reload') await loadAll(true);
        if (action === 'reload-hug') {
          await api('/api/hug/reload');
          await loadAll(true);
        }
        if (action === 'reload-text-pairs') {
          await loadTextPairs();
          renderTexts();
          renderStatus();
          renderDiag();
        }
        if (action === 'save-pair') await savePair(btn.dataset.pairId || 'new');
        if (action === 'delete-pair') await deletePair(btn.dataset.pairId || '');
      } catch (err) {
        alert(`Hug-Fehler: ${err.message}`);
      } finally {
        btn.disabled = false;
      }
    });

    root.addEventListener('change', ev => {
      const typeSelect = ev.target.closest('[data-hug-pair-filter-type]');
      if (typeSelect) {
        pairFilterType = typeSelect.value || 'all';
        renderTexts();
      }
    });

    root.addEventListener('input', ev => {
      const search = ev.target.closest('[data-hug-pair-search]');
      if (search) {
        pairSearch = search.value || '';
        renderTexts();
      }
    });
  }

  async function loadAll(force){
    if (loading && !force) return;
    loading = true;
    try {
      status = await api('/api/dashboard/community/hug/status');
      await loadTextPairs();
      render();
    } catch (err) {
      if (root) root.innerHTML = `<div class="hug-card"><h2>Hug-System</h2><div class="hug-error">${esc(err.message)}</div></div>`;
    } finally {
      loading = false;
    }
  }

  function init(){
    registerModule();
    root = document.getElementById('hugModule');
    if (!root) return;
    renderShell();
    bindActions();
    loadAll(false);
  }

  window.addEventListener('cgn:module-show', ev => {
    if (ev.detail?.module === 'hug') loadAll(true);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { init, loadAll };
})();
