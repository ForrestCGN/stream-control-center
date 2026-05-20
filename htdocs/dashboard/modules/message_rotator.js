window.MessageRotatorModule = (function(){
  'use strict';

  const api = {
    status: '/api/message-rotator/status',
    settings: '/api/message-rotator/admin/settings',
    texts: '/api/message-rotator/admin/texts',
    integration: '/api/message-rotator/integration-check',
    reload: '/api/message-rotator/reload',
    start: '/api/message-rotator/start',
    stop: '/api/message-rotator/stop',
    next: '/api/message-rotator/next',
    manual: '/api/message-rotator/manual'
  };

  let root = null;
  let state = { status:null, settings:null, texts:null, integration:null, loading:false, error:'', notice:'', tab:'overview', textCategory:'' };

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function fmt(v){ return v === undefined || v === null || v === '' ? '<span class="mr-muted">-</span>' : esc(v); }
  function rows(data){ return Array.isArray(data?.rows) ? data.rows : []; }
  function settingRows(){ return rows(state.settings?.settings); }
  function textData(){ return state.texts?.texts || state.texts || {}; }
  function textCategories(){ return Array.isArray(textData().categories) ? textData().categories : []; }
  function textKeys(){ return Array.isArray(textData().keys) ? textData().keys : []; }
  function config(){ return state.status?.config || state.status?.status?.config || {}; }
  function status(){ return state.status || {}; }
  function boolLabel(v){ return v ? 'Aktiv' : 'Inaktiv'; }
  function pill(v, good){ return `<span class="mr-pill ${good ? 'ok' : 'warn'}">${esc(v)}</span>`; }

  function selectedTextCategory(){
    const cats = textCategories();
    if (!cats.length) return '';
    if (!state.textCategory || !cats.some(c => c.id === state.textCategory)) state.textCategory = cats[0].id;
    return state.textCategory;
  }

  async function loadAll(force){
    root = document.getElementById('messageRotatorModule');
    if (!root || !window.CGN) return;
    if (!force && state.status && state.settings && state.texts) { render(); return; }
    state.loading = true;
    state.error = '';
    render();
    try {
      const [statusRes, settingsRes, textsRes, integrationRes] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.settings),
        window.CGN.api(api.texts),
        window.CGN.api(api.integration).catch(err => ({ ok:false, healthy:false, error:err.message, checks:{} }))
      ]);
      state = { ...state, status:statusRes, settings:settingsRes, texts:textsRes, integration:integrationRes, loading:false, error:'' };
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }
    render();
  }

  async function callControl(url, label){
    const result = await window.CGN.api(url, { method:'POST', body:'{}' });
    state.notice = result.message || label || 'Aktion ausgeführt.';
    await loadAll(true);
  }

  async function previewNext(){
    const result = await window.CGN.api(`${api.next}?commit=0`);
    state.notice = result.send ? `Vorschau (${result.outputMode || 'chat'}${result.isAnnouncement ? '/' + (result.announcementColor || 'primary') : ''}): ${result.message || result.text || ''}` : `Blockiert: ${result.reason || 'unknown'}`;
    render();
  }

  async function previewManual(id){
    if (!id) return;
    const result = await window.CGN.api(`${api.manual}?id=${encodeURIComponent(id)}&commit=0&ignoreCooldown=1`);
    state.notice = result.send ? `Manuell ${id} (${result.outputMode || 'chat'}${result.isAnnouncement ? '/' + (result.announcementColor || 'primary') : ''}): ${result.message || result.text || ''}` : `Blockiert: ${result.reason || 'unknown'}`;
    render();
  }

  function parseInputValue(row){
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

  async function saveSetting(key){
    const row = settingRows().find(r => r.key === key);
    if (!row) return;
    const value = parseInputValue(row);
    await window.CGN.api(api.settings, { method:'POST', body: JSON.stringify({ key, value }) });
    state.notice = `${key} gespeichert.`;
    await loadAll(true);
  }

  function itemValue(index, field, fallback){
    const el = root?.querySelector(`[data-item-index="${index}"][data-item-field="${field}"]`);
    if (!el) return fallback;
    if (el.type === 'checkbox') return el.checked;
    if (field === 'cooldownMinutes' || field === 'weight' || field === 'manualCooldownSeconds') return Number(el.value || 0);
    if (field === 'commands') return String(el.value || '').split(',').map(v => v.trim()).filter(Boolean);
    return String(el.value || '').trim();
  }

  async function saveItems(){
    const items = (config().items || []).map((item, index) => ({
      id: itemValue(index, 'id', item.id),
      category: itemValue(index, 'category', item.category),
      messageFile: itemValue(index, 'messageFile', item.messageFile),
      enabled: itemValue(index, 'enabled', item.enabled),
      messageKey: itemValue(index, 'messageKey', item.messageKey),
      cooldownMinutes: itemValue(index, 'cooldownMinutes', item.cooldownMinutes),
      weight: itemValue(index, 'weight', item.weight),
      manualEnabled: itemValue(index, 'manualEnabled', item.manualEnabled),
      manualCooldownSeconds: itemValue(index, 'manualCooldownSeconds', item.manualCooldownSeconds),
      commands: itemValue(index, 'commands', item.commands || []),
      outputMode: itemValue(index, 'outputMode', item.outputMode || 'default'),
      announcementColor: itemValue(index, 'announcementColor', item.announcementColor || 'default')
    })).filter(item => item.id && item.messageKey);
    await window.CGN.api(api.settings, { method:'POST', body: JSON.stringify({ key:'items', value: items }) });
    state.notice = 'Rotator-Items gespeichert.';
    await loadAll(true);
  }

  async function addItem(){
    const items = Array.isArray(config().items) ? [...config().items] : [];
    const id = `item_${items.length + 1}`;
    items.push({ id, category:id, messageFile:'community.json', enabled:true, messageKey:'rules_reminder', cooldownMinutes:45, weight:1, manualEnabled:true, manualCooldownSeconds:30, commands:[`!${id}`], outputMode:'default', announcementColor:'default' });
    await window.CGN.api(api.settings, { method:'POST', body: JSON.stringify({ key:'items', value: items }) });
    state.notice = 'Neues Item angelegt. Bitte prüfen und speichern.';
    await loadAll(true);
    state.tab = 'items';
    render();
  }

  async function deleteItem(index){
    const items = Array.isArray(config().items) ? [...config().items] : [];
    const item = items[index];
    if (!item) return;
    if (!window.confirm(`Item ${item.id || index} wirklich löschen?`)) return;
    items.splice(index, 1);
    await window.CGN.api(api.settings, { method:'POST', body: JSON.stringify({ key:'items', value: items }) });
    state.notice = 'Item gelöscht.';
    await loadAll(true);
  }

  async function saveVariant(id, key){
    const safeId = String(id || 'new');
    const textEl = root?.querySelector(`[data-variant-text="${CSS.escape(safeId)}"][data-variant-key="${CSS.escape(key)}"]`);
    const enabledEl = root?.querySelector(`[data-variant-enabled="${CSS.escape(safeId)}"][data-variant-key="${CSS.escape(key)}"]`);
    const weightEl = root?.querySelector(`[data-variant-weight="${CSS.escape(safeId)}"][data-variant-key="${CSS.escape(key)}"]`);
    if (!textEl) return;
    await window.CGN.api(api.texts, { method:'POST', body: JSON.stringify({
      action:'saveVariant',
      variant:{ id: id && id !== 'new' ? Number(id) : undefined, key, category:selectedTextCategory() || 'rotator', value:textEl.value, enabled:enabledEl ? enabledEl.checked : true, weight:weightEl ? Number(weightEl.value || 1) : 1 }
    }) });
    state.notice = 'Textvariante gespeichert.';
    await loadAll(true);
  }

  async function addVariant(key){
    const el = root?.querySelector(`[data-new-variant="${CSS.escape(key)}"]`);
    const value = String(el?.value || '').trim();
    if (!value) throw new Error('Bitte zuerst einen Text eintragen.');
    await window.CGN.api(api.texts, { method:'POST', body: JSON.stringify({ action:'saveVariant', variant:{ key, category:selectedTextCategory() || 'rotator', value, enabled:true, weight:1 } }) });
    state.notice = 'Textvariante hinzugefügt.';
    await loadAll(true);
  }

  async function deleteVariant(id){
    if (!id) return;
    if (!window.confirm('Diese Textvariante wirklich löschen?')) return;
    await window.CGN.api(api.texts, { method:'POST', body: JSON.stringify({ action:'deleteVariant', id:Number(id) }) });
    state.notice = 'Textvariante gelöscht.';
    await loadAll(true);
  }

  function renderSettingInput(row){
    if (row.key === 'messageOptions.deliveryMode') {
      const value = String(row.value || 'backend');
      return `<select data-setting-input="${esc(row.key)}"><option value="backend" ${value === 'backend' ? 'selected' : ''}>Backend sendet direkt</option><option value="streamerbot" ${value === 'streamerbot' ? 'selected' : ''}>Streamer.bot soll senden</option><option value="response_only" ${value === 'response_only' ? 'selected' : ''}>Nur API-Antwort / Test</option></select>`;
    }
    if (row.key === 'messageOptions.outputMode') {
      const value = String(row.value || 'chat');
      return `<select data-setting-input="${esc(row.key)}"><option value="chat" ${value === 'chat' ? 'selected' : ''}>Normale Chatnachricht</option><option value="announcement" ${value === 'announcement' ? 'selected' : ''}>Twitch-Ankündigung</option></select>`;
    }
    if (row.key === 'messageOptions.announcementColor') {
      const value = String(row.value || 'primary');
      const colors = ['primary','blue','green','orange','purple'];
      return `<select data-setting-input="${esc(row.key)}">${colors.map(color => `<option value="${esc(color)}" ${value === color ? 'selected' : ''}>${esc(color)}</option>`).join('')}</select>`;
    }
    if (row.valueType === 'boolean') return `<select data-setting-input="${esc(row.key)}"><option value="true" ${row.value === true ? 'selected' : ''}>true</option><option value="false" ${row.value === false ? 'selected' : ''}>false</option></select>`;
    if (row.valueType === 'json') return `<textarea data-setting-input="${esc(row.key)}" spellcheck="false">${esc(JSON.stringify(row.value, null, 2))}</textarea>`;
    const type = row.valueType === 'number' ? 'number' : 'text';
    return `<input data-setting-input="${esc(row.key)}" type="${type}" value="${esc(row.rawValue ?? row.value ?? '')}">`;
  }

  function renderOverview(){
    const st = status();
    const cfg = config();
    const integration = state.integration || {};
    const samples = integration.checks?.samples || {};
    const sampleKeys = Object.keys(samples);
    return `
      <div class="mr-grid">
        <section class="mr-card mr-main-card">
          <div class="mr-headline"><div><h3>Status</h3><p>Runtime, Chat-Zähler und letzte Ausgabe.</p></div>${pill(st.active ? 'läuft' : 'gestoppt', !!st.active)}</div>
          <div class="mr-kpis">
            <div><strong>${esc(st.chatMessagesSinceLastSend ?? 0)}</strong><span>Chat seit letzter Ausgabe</span></div>
            <div><strong>${esc(st.sendCount ?? 0)}</strong><span>Ausgaben</span></div>
            <div><strong>${esc(cfg.items?.length ?? 0)}</strong><span>Items</span></div>
            <div><strong>${integration.healthy ? 'OK' : 'WARN'}</strong><span>Integration</span></div>
          </div>
          <div class="mr-info-list">
            <div><span>Letztes Item</span><strong>${fmt(st.lastItemId)}</strong></div>
            <div><span>Letzte Nachricht</span><strong>${fmt(st.lastMessage)}</strong></div>
            <div><span>Settings</span><strong>${fmt(st.configInfo?.settingsSource)} / ${fmt(st.configInfo?.settingsTable)}</strong></div>
            <div><span>Ausgabe</span><strong>${fmt(cfg.messageOptions?.outputMode || 'chat')}${cfg.messageOptions?.outputMode === 'announcement' ? ` / ${fmt(cfg.messageOptions?.announcementColor || 'primary')}` : ''}</strong></div>
            <div><span>Senden über</span><strong>${fmt(cfg.messageOptions?.deliveryMode || 'backend')}</strong></div>
            <div><span>Textquelle</span><strong>DB-Varianten mit JSON-Fallback</strong></div>
          </div>
          <div class="mr-actions"><button type="button" data-mr-start>Start</button><button type="button" data-mr-stop>Stop</button><button type="button" data-mr-reload>Backend neu laden</button><button type="button" data-mr-preview-next>Nächste Vorschau</button></div>
        </section>
        <section class="mr-card">
          <h3>Samples</h3>
          ${sampleKeys.length ? `<div class="mr-sample-list">${sampleKeys.map(key => { const value = samples[key]?.value || {}; return `<article><strong>${esc(key)}</strong><small>${esc(value.source || '')} · ${esc(value.outputMode || 'chat')}${value.isAnnouncement ? `/${esc(value.announcementColor || 'primary')}` : ''}</small><p>${esc(value.message || value.text || '')}</p></article>`; }).join('')}</div>` : '<div class="mr-empty">Noch keine Samples geladen.</div>'}
        </section>
      </div>`;
  }

  function renderSettings(){
    const list = settingRows().filter(row => row.key !== 'items');
    return `<section class="mr-card"><div class="mr-headline"><div><h3>Settings</h3><p>DB-Settings. JSON bleibt Fallback, Dashboard schreibt über Backend-API.</p></div><button type="button" data-mr-refresh>Aktualisieren</button></div><div class="mr-setting-list">${list.map(row => `
      <article class="mr-setting-row">
        <div><strong>${esc(row.key)}</strong><span>${esc(row.valueType || 'string')} · ${esc(row.source || '')}</span></div>
        <div class="mr-setting-input">${renderSettingInput(row)}</div>
        <button type="button" data-save-setting="${esc(row.key)}">Speichern</button>
      </article>`).join('')}</div></section>`;
  }

  function itemInput(index, field, value, type='text'){
    if (type === 'checkbox') return `<input type="checkbox" data-item-index="${index}" data-item-field="${field}" ${value ? 'checked' : ''}>`;
    if (field === 'outputMode') {
      const current = String(value || 'default');
      const modes = [['default','Standard'], ['chat','Chat'], ['announcement','Ankündigung']];
      return `<select data-item-index="${index}" data-item-field="${field}">${modes.map(([id,label]) => `<option value="${esc(id)}" ${current === id ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>`;
    }
    if (field === 'announcementColor') {
      const current = String(value || 'default');
      const colors = [['default','Standard'], ['primary','primary'], ['blue','blue'], ['green','green'], ['orange','orange'], ['purple','purple']];
      return `<select data-item-index="${index}" data-item-field="${field}">${colors.map(([id,label]) => `<option value="${esc(id)}" ${current === id ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>`;
    }
    if (field === 'commands') value = Array.isArray(value) ? value.join(', ') : String(value || '');
    return `<input type="${type}" data-item-index="${index}" data-item-field="${field}" value="${esc(value ?? '')}">`;
  }

  function renderItems(){
    const items = Array.isArray(config().items) ? config().items : [];
    return `<section class="mr-card"><div class="mr-headline"><div><h3>Rotator-Items</h3><p>Steuert Auswahl, Cooldowns, Gewichtung und manuelle Chatbefehle.</p></div><div class="mr-actions"><button type="button" data-add-item>Item hinzufügen</button><button type="button" data-save-items>Alle Items speichern</button></div></div>
      <div class="mr-item-list">${items.map((item, index) => `
        <article class="mr-item-card">
          <div class="mr-item-title"><strong>${esc(item.id || `Item ${index + 1}`)}</strong><label>${itemInput(index, 'enabled', item.enabled, 'checkbox')} Aktiv</label></div>
          <div class="mr-item-grid">
            <label>ID ${itemInput(index, 'id', item.id)}</label>
            <label>Kategorie ${itemInput(index, 'category', item.category)}</label>
            <label>Message-Key ${itemInput(index, 'messageKey', item.messageKey)}</label>
            <label>Message-Datei ${itemInput(index, 'messageFile', item.messageFile)}</label>
            <label>Cooldown Minuten ${itemInput(index, 'cooldownMinutes', item.cooldownMinutes, 'number')}</label>
            <label>Gewicht ${itemInput(index, 'weight', item.weight, 'number')}</label>
            <label>Manual Cooldown Sek. ${itemInput(index, 'manualCooldownSeconds', item.manualCooldownSeconds, 'number')}</label>
            <label>Ausgabe ${itemInput(index, 'outputMode', item.outputMode || 'default')}</label>
            <label>Ankündigungsfarbe ${itemInput(index, 'announcementColor', item.announcementColor || 'default')}</label>
            <label>Commands ${itemInput(index, 'commands', item.commands || [])}</label>
          </div>
          <div class="mr-actions"><label class="mr-check-label">${itemInput(index, 'manualEnabled', item.manualEnabled, 'checkbox')} Manuell erlaubt</label><button type="button" data-preview-manual="${esc(item.id)}">Vorschau</button><button type="button" class="danger" data-delete-item="${index}">Löschen</button></div>
        </article>`).join('')}</div>
      ${!items.length ? '<div class="mr-empty">Keine Items konfiguriert.</div>' : ''}</section>`;
  }

  function renderTexts(){
    const cats = textCategories();
    const selected = selectedTextCategory();
    const keys = textKeys().filter(item => !selected || item.category === selected);
    return `<section class="mr-card"><div class="mr-headline"><div><h3>Nachrichten / Zufallsvarianten</h3><p>Diese DB-Varianten nutzt der Rotator zur Laufzeit. Mehrere aktive Varianten werden zufällig nach Gewicht ausgewählt.</p></div><button type="button" data-mr-refresh>Aktualisieren</button></div>
      <div class="mr-text-toolbar"><label>Kategorie<select data-text-category>${cats.map(cat => `<option value="${esc(cat.id)}" ${cat.id === selected ? 'selected' : ''}>${esc(cat.label || cat.id)} (${esc(cat.variantCount ?? 0)} Varianten)</option>`).join('')}</select></label></div>
      <div class="mr-text-list">${keys.map(item => `
        <article class="mr-text-card">
          <div class="mr-text-head"><div><strong>${esc(item.key)}</strong><small>${esc(item.activeCount || 0)} aktiv / ${esc(item.totalCount || item.variants?.length || 0)} Varianten</small></div></div>
          <div class="mr-variant-list">${(item.variants || []).map(variant => `
            <div class="mr-variant-row">
              <textarea data-variant-text="${esc(variant.id)}" data-variant-key="${esc(item.key)}" spellcheck="false">${esc(variant.value ?? variant.text ?? '')}</textarea>
              <div class="mr-variant-meta"><label><input type="checkbox" data-variant-enabled="${esc(variant.id)}" data-variant-key="${esc(item.key)}" ${variant.enabled ? 'checked' : ''}> Aktiv</label><label>Gewicht <input type="number" min="1" max="99" data-variant-weight="${esc(variant.id)}" data-variant-key="${esc(item.key)}" value="${esc(variant.weight || 1)}"></label><span>${esc(variant.source || '')}</span></div>
              <div class="mr-actions"><button type="button" data-save-variant="${esc(variant.id)}" data-variant-key="${esc(item.key)}">Speichern</button><button type="button" class="danger" data-delete-variant="${esc(variant.id)}">Löschen</button></div>
            </div>`).join('')}</div>
          <div class="mr-new-variant"><textarea data-new-variant="${esc(item.key)}" placeholder="Neue Zufallsvariante für ${esc(item.key)}..." spellcheck="false"></textarea><button type="button" data-add-variant="${esc(item.key)}">Variante hinzufügen</button></div>
        </article>`).join('')}</div>
      ${!keys.length ? '<div class="mr-empty">Keine Texte in dieser Kategorie.</div>' : ''}</section>`;
  }

  function renderIntegration(){
    const check = state.integration || {};
    const warnings = Array.isArray(check.warnings) ? check.warnings : [];
    const errors = Array.isArray(check.errors) ? check.errors : [];
    return `<section class="mr-card"><div class="mr-headline"><div><h3>Diagnose</h3><p>Read-only Check für Dateien, Textsystem, Runtime und Sicherheit.</p></div>${pill(check.healthy ? 'healthy' : 'prüfen', !!check.healthy)}</div>
      <div class="mr-diag-grid"><div><strong>Warnings</strong><pre>${esc(warnings.length ? warnings.join('\n') : 'Keine')}</pre></div><div><strong>Errors</strong><pre>${esc(errors.length ? errors.join('\n') : 'Keine')}</pre></div></div>
      <details><summary>Rohdaten anzeigen</summary><pre class="mr-json">${esc(JSON.stringify(check, null, 2))}</pre></details></section>`;
  }

  function render(){
    root = document.getElementById('messageRotatorModule');
    if (!root) return;
    const tabs = [['overview','Übersicht'], ['settings','Settings'], ['items','Items'], ['texts','Nachrichten'], ['diagnostics','Diagnose']];
    root.innerHTML = `
      <div class="mr-wrap">
        <section class="mr-card mr-hero"><div><h2>🔁 Message-Rotator</h2><p>Automatische Chat-Hinweise mit DB-Settings und bearbeitbaren Zufallsvarianten.</p></div><div class="mr-actions"><button type="button" data-mr-refresh>Aktualisieren</button><button type="button" data-mr-reload>Backend neu laden</button></div></section>
        ${state.error ? `<div class="mr-error">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="mr-notice">${esc(state.notice)}</div>` : ''}
        ${state.loading ? '<div class="mr-card">Lade Message-Rotator...</div>' : `<div class="mr-tabs">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-mr-tab="${id}">${label}</button>`).join('')}</div>${state.tab === 'settings' ? renderSettings() : state.tab === 'items' ? renderItems() : state.tab === 'texts' ? renderTexts() : state.tab === 'diagnostics' ? renderIntegration() : renderOverview()}`}
      </div>`;
    bind();
  }

  function bind(){
    root?.querySelectorAll('[data-mr-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.mrTab || 'overview'; state.notice = ''; render(); }));
    root?.querySelectorAll('[data-mr-refresh]').forEach(btn => btn.addEventListener('click', () => loadAll(true)));
    root?.querySelectorAll('[data-mr-reload]').forEach(btn => btn.addEventListener('click', () => callControl(api.reload, 'Backend neu geladen.').catch(showError)));
    root?.querySelector('[data-mr-start]')?.addEventListener('click', () => callControl(api.start, 'Message-Rotator gestartet.').catch(showError));
    root?.querySelector('[data-mr-stop]')?.addEventListener('click', () => callControl(api.stop, 'Message-Rotator gestoppt.').catch(showError));
    root?.querySelector('[data-mr-preview-next]')?.addEventListener('click', () => previewNext().catch(showError));
    root?.querySelectorAll('[data-save-setting]').forEach(btn => btn.addEventListener('click', () => saveSetting(btn.dataset.saveSetting).catch(showError)));
    root?.querySelector('[data-save-items]')?.addEventListener('click', () => saveItems().catch(showError));
    root?.querySelector('[data-add-item]')?.addEventListener('click', () => addItem().catch(showError));
    root?.querySelectorAll('[data-delete-item]').forEach(btn => btn.addEventListener('click', () => deleteItem(Number(btn.dataset.deleteItem)).catch(showError)));
    root?.querySelectorAll('[data-preview-manual]').forEach(btn => btn.addEventListener('click', () => previewManual(btn.dataset.previewManual).catch(showError)));
    root?.querySelector('[data-text-category]')?.addEventListener('change', ev => { state.textCategory = ev.target.value; render(); });
    root?.querySelectorAll('[data-save-variant]').forEach(btn => btn.addEventListener('click', () => saveVariant(btn.dataset.saveVariant, btn.dataset.variantKey).catch(showError)));
    root?.querySelectorAll('[data-add-variant]').forEach(btn => btn.addEventListener('click', () => addVariant(btn.dataset.addVariant).catch(showError)));
    root?.querySelectorAll('[data-delete-variant]').forEach(btn => btn.addEventListener('click', () => deleteVariant(btn.dataset.deleteVariant).catch(showError)));
  }

  function showError(err){ state.error = err.message || String(err); render(); }

  window.addEventListener('cgn:module-show', ev => { if (ev.detail?.module === 'message_rotator') loadAll(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { root = document.getElementById('messageRotatorModule'); });
  else root = document.getElementById('messageRotatorModule');

  return { loadAll, render };
})();
