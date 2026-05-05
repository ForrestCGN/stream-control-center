window.TodoModule = (function(){
  'use strict';

  const api = {
    status: '/api/todo/status',
    settings: '/api/todo/admin/settings',
    texts: '/api/todo/admin/texts',
    statsTop: '/api/todo/stats',
    statsToday: '/api/todo/stats/today',
    reload: '/api/todo/reload'
  };

  let root = null;
  let state = { status:null, settings:null, texts:null, statsTop:null, statsToday:null, loading:false, error:'', tab:'overview', textCategory:'' };

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function rows(data){ return Array.isArray(data?.rows) ? data.rows : []; }
  function fmt(v){ return v ? esc(v) : '<span class="todo-muted">-</span>'; }
  function rowByKey(list, key){ return rows(list).find(r => r.key === key); }

  function getInputValue(row){
    const el = root?.querySelector(`[data-setting-input="${CSS.escape(row.key)}"]`);
    if (!el) return row.value;
    const raw = el.value;
    if (row.valueType === 'boolean') return raw === 'true';
    if (row.valueType === 'number') return Number(raw);
    if (row.valueType === 'json') {
      try { return JSON.parse(raw); } catch (err) { throw new Error(`JSON ungültig bei ${row.key}: ${err.message}`); }
    }
    return raw;
  }

  async function loadAll(force){
    root = document.getElementById('todoModule');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.settings && state.texts) { render(); return; }
    state.loading = true;
    state.error = '';
    render();
    try {
      const [status, settings, texts, statsTop, statsToday] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.settings),
        window.CGN.api(api.texts),
        window.CGN.api(api.statsTop).catch(err => ({ ok:false, error:err.message, rows:[] })),
        window.CGN.api(api.statsToday).catch(err => ({ ok:false, error:err.message, rows:[] }))
      ]);
      state = { ...state, status, settings, texts, statsTop, statsToday, loading:false, error:'' };
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }
    render();
  }

  async function reloadBackend(){
    await window.CGN.api(api.reload, { method:'POST', body:'{}' });
    await loadAll(true);
  }

  async function saveSetting(key){
    const row = rowByKey(state.settings?.settings, key);
    if (!row) return;
    const value = getInputValue(row);
    await window.CGN.api(api.settings, { method:'POST', body: JSON.stringify({ key, value }) });
    await loadAll(true);
  }

  function textData(){ return state.texts?.texts || state.texts || {}; }
  function textCategories(){ return Array.isArray(textData().categories) ? textData().categories : []; }
  function textKeys(){ return Array.isArray(textData().keys) ? textData().keys : []; }
  function selectedTextCategory(){
    const cats = textCategories();
    if (!cats.length) return '';
    if (!state.textCategory || !cats.some(c => c.id === state.textCategory)) state.textCategory = cats[0].id;
    return state.textCategory;
  }

  async function saveVariant(id, key){
    const safeId = String(id || 'new');
    const textEl = root?.querySelector(`[data-variant-text="${CSS.escape(safeId)}"][data-variant-key="${CSS.escape(key)}"]`);
    const enabledEl = root?.querySelector(`[data-variant-enabled="${CSS.escape(safeId)}"][data-variant-key="${CSS.escape(key)}"]`);
    const weightEl = root?.querySelector(`[data-variant-weight="${CSS.escape(safeId)}"][data-variant-key="${CSS.escape(key)}"]`);
    if (!textEl) return;
    await window.CGN.api(api.texts, { method:'POST', body: JSON.stringify({
      action: 'saveVariant',
      variant: {
        id: id && id !== 'new' ? Number(id) : undefined,
        key,
        category: selectedTextCategory() || 'general',
        value: textEl.value,
        enabled: enabledEl ? enabledEl.checked : true,
        weight: weightEl ? Number(weightEl.value || 1) : 1
      }
    }) });
    await loadAll(true);
  }

  async function addVariant(key){
    const el = root?.querySelector(`[data-new-variant="${CSS.escape(key)}"]`);
    const value = String(el?.value || '').trim();
    if (!value) throw new Error('Bitte zuerst einen neuen Text eintragen.');
    await window.CGN.api(api.texts, { method:'POST', body: JSON.stringify({
      action: 'saveVariant',
      variant: { key, category: selectedTextCategory() || 'general', value, enabled: true, weight: 1 }
    }) });
    await loadAll(true);
  }

  async function deleteVariant(id){
    if (!id) return;
    if (!window.confirm('Diese Textvariante wirklich löschen?')) return;
    await window.CGN.api(api.texts, { method:'POST', body: JSON.stringify({ action:'deleteVariant', id:Number(id) }) });
    await loadAll(true);
  }

  function renderSettingInput(row){
    if (row.valueType === 'boolean') {
      return `<select data-setting-input="${esc(row.key)}"><option value="true" ${row.value === true ? 'selected' : ''}>true</option><option value="false" ${row.value === false ? 'selected' : ''}>false</option></select>`;
    }
    if (row.valueType === 'json') {
      return `<textarea data-setting-input="${esc(row.key)}" spellcheck="false">${esc(JSON.stringify(row.value, null, 2))}</textarea>`;
    }
    const type = row.valueType === 'number' ? 'number' : 'text';
    return `<input data-setting-input="${esc(row.key)}" type="${type}" value="${esc(row.rawValue ?? row.value ?? '')}">`;
  }

  function renderOverview(){
    const status = state.status || {};
    const settings = status.settings || {};
    const targets = status.targets || {};
    const channels = status.channels || {};
    const targetEntries = Object.values(targets);
    return `
      <div class="todo-grid">
        <section class="todo-card todo-card-main">
          <h3>Status</h3>
          <div class="todo-kpis">
            <div><strong>${settings.enabled ? 'Aktiv' : 'Inaktiv'}</strong><span>Modul</span></div>
            <div><strong>${esc(status.schemaReady ? 'OK' : 'Fehler')}</strong><span>Schema</span></div>
            <div><strong>${targetEntries.length}</strong><span>Ziele</span></div>
            <div><strong>${esc(status.textsSource || '-')}</strong><span>Texte</span></div>
          </div>
          <div class="todo-rows">
            <div><span>Settings</span><strong>${fmt(settings.settingsSource)} / ${fmt(settings.settingsTable)}</strong></div>
            <div><span>Userinfo</span><strong>${fmt(status.userinfoBaseUrl)}</strong></div>
            <div><span>Letzter Load</span><strong>${fmt(status.loadedAt)}</strong></div>
            <div><span>Fehler</span><strong>${fmt(status.lastLoadError || status.schemaError || '')}</strong></div>
          </div>
        </section>
        <section class="todo-card">
          <h3>Ziele & Discord-Kanäle</h3>
          <div class="todo-target-list">${targetEntries.map(t => {
            const ch = channels[t.key] || {};
            return `<article><strong>${esc(t.label || t.key)}</strong><span>${esc(t.channelKey || '-')} · ${ch.configured ? 'konfiguriert' : 'fehlt'}</span><small>${esc(Array.isArray(t.aliases) ? t.aliases.join(', ') : '')}</small></article>`;
          }).join('')}</div>
        </section>
      </div>`;
  }

  function renderSettings(){
    const list = rows(state.settings?.settings);
    return `<section class="todo-card"><h3>Settings aus DB</h3><p class="todo-note">Die Ziele liegen als JSON-Setting in der DB. Vorsichtig bearbeiten, weil Aliase und Channel-Keys produktiv genutzt werden.</p><div class="todo-setting-list">${list.map(row => `
      <article class="todo-setting-row">
        <div><strong>${esc(row.key)}</strong><span>${esc(row.valueType || 'string')} · ${esc(row.source || '')}</span></div>
        <div class="todo-setting-input">${renderSettingInput(row)}</div>
        <button type="button" data-save-setting="${esc(row.key)}">Speichern</button>
      </article>`).join('')}</div></section>`;
  }

  function renderTexts(){
    const cats = textCategories();
    const selected = selectedTextCategory();
    const keys = textKeys().filter(item => !selected || item.category === selected);
    return `<section class="todo-card"><h3>Texte / Varianten</h3><p class="todo-note">Kategorien auswählen, dann pro Text-Key mehrere aktive Varianten verwalten. Das Backend wählt bei Ausgabe zufällig eine aktive Variante.</p>
      <div class="todo-text-toolbar">
        <label>Kategorie auswählen<select data-text-category>${cats.map(cat => `<option value="${esc(cat.id)}" ${cat.id === selected ? 'selected' : ''}>${esc(cat.label || cat.id)} (${esc(cat.keyCount ?? cat.count ?? 0)} Keys / ${esc(cat.variantCount ?? 0)} Varianten)</option>`).join('')}</select></label>
      </div>
      <div class="todo-text-list">${keys.map(item => `
        <article class="todo-text-row">
          <div class="todo-text-head"><strong>${esc(item.key)}</strong><span>${esc(item.activeCount || 0)} aktiv / ${esc(item.totalCount || item.variants?.length || 0)} Varianten</span></div>
          <div class="todo-variant-list">${(item.variants || []).map(variant => `
            <div class="todo-variant-row">
              <textarea data-variant-text="${esc(variant.id)}" data-variant-key="${esc(item.key)}" spellcheck="false">${esc(variant.value ?? variant.text ?? '')}</textarea>
              <div class="todo-variant-meta">
                <label><input type="checkbox" data-variant-enabled="${esc(variant.id)}" data-variant-key="${esc(item.key)}" ${variant.enabled ? 'checked' : ''}> Aktiv</label>
                <label>Gewicht <input type="number" min="1" max="99" data-variant-weight="${esc(variant.id)}" data-variant-key="${esc(item.key)}" value="${esc(variant.weight || 1)}"></label>
                <span>${esc(variant.source || '')}</span>
              </div>
              <div class="todo-row-actions"><button type="button" data-save-variant="${esc(variant.id)}" data-variant-key="${esc(item.key)}">Speichern</button><button type="button" class="danger" data-delete-variant="${esc(variant.id)}">Löschen</button></div>
            </div>`).join('')}</div>
          <div class="todo-new-variant"><textarea data-new-variant="${esc(item.key)}" placeholder="Neue Variante für ${esc(item.key)} hinzufügen..." spellcheck="false"></textarea><button type="button" data-add-variant="${esc(item.key)}">Variante hinzufügen</button></div>
        </article>`).join('')}</div>
      ${!keys.length ? '<div class="todo-empty">Keine Texte in dieser Kategorie.</div>' : ''}</section>`;
  }

  function renderStats(){
    const top = Array.isArray(state.statsTop?.rows) ? state.statsTop.rows : [];
    const today = Array.isArray(state.statsToday?.rows) ? state.statsToday.rows : [];
    const table = list => list.length ? `<div class="todo-table-wrap"><table><thead><tr><th>Autor</th><th>Ziel</th><th>Einträge</th><th>Letzter</th></tr></thead><tbody>${list.map(r => `<tr><td>${esc(r.author_display_name || r.author_login || '-')}</td><td>${esc(r.target_label || r.target_key || '-')}</td><td>${esc(r.entry_count ?? 0)}</td><td>${fmt(r.last_entry_at)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="todo-empty">Keine Daten.</div>';
    return `<div class="todo-grid"><section class="todo-card"><h3>Top gesamt</h3>${table(top)}</section><section class="todo-card"><h3>Heute</h3>${table(today)}</section></div>`;
  }

  function render(){
    root = document.getElementById('todoModule');
    if (!root) return;
    const tabs = [['overview','Übersicht'], ['settings','Settings'], ['texts','Texte'], ['stats','Statistik']];
    root.innerHTML = `
      <div class="todo-admin-wrap">
        <section class="todo-card todo-hero">
          <div><h2>✅ Todo</h2><p>Todo-System verwalten: Ziele, DB-Settings, DB-Texte und Statistiken.</p></div>
          <div class="todo-actions"><button type="button" data-todo-reload>Backend neu laden</button><button type="button" data-todo-refresh>Aktualisieren</button></div>
        </section>
        ${state.error ? `<div class="todo-error">${esc(state.error)}</div>` : ''}
        ${state.loading ? '<div class="todo-card">Lade Todo-Daten...</div>' : `
          <div class="todo-tabs">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-todo-tab="${id}">${label}</button>`).join('')}</div>
          ${state.tab === 'settings' ? renderSettings() : state.tab === 'texts' ? renderTexts() : state.tab === 'stats' ? renderStats() : renderOverview()}
        `}
      </div>`;
    bind();
  }

  function bind(){
    root?.querySelector('[data-todo-refresh]')?.addEventListener('click', () => loadAll(true));
    root?.querySelector('[data-todo-reload]')?.addEventListener('click', () => reloadBackend().catch(err => { state.error = err.message; render(); }));
    root?.querySelectorAll('[data-todo-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.todoTab || 'overview'; render(); }));
    root?.querySelectorAll('[data-save-setting]').forEach(btn => btn.addEventListener('click', () => saveSetting(btn.dataset.saveSetting).catch(err => { state.error = err.message; render(); })));
    root?.querySelector('[data-text-category]')?.addEventListener('change', ev => { state.textCategory = ev.target.value; render(); });
    root?.querySelectorAll('[data-save-variant]').forEach(btn => btn.addEventListener('click', () => saveVariant(btn.dataset.saveVariant, btn.dataset.variantKey).catch(err => { state.error = err.message; render(); })));
    root?.querySelectorAll('[data-add-variant]').forEach(btn => btn.addEventListener('click', () => addVariant(btn.dataset.addVariant).catch(err => { state.error = err.message; render(); })));
    root?.querySelectorAll('[data-delete-variant]').forEach(btn => btn.addEventListener('click', () => deleteVariant(btn.dataset.deleteVariant).catch(err => { state.error = err.message; render(); })));
  }

  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'todo') loadAll(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { root = document.getElementById('todoModule'); });
  else root = document.getElementById('todoModule');

  return { loadAll, render };
})();
