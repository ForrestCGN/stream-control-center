(function(){
  'use strict';

  const MODULE = 'hypetrain';
  const PANEL_ID = 'hypetrainModule';
  const EXT_ID = 'hypetrainEventActionsExt';
  const TAB_ID = 'eventActions';
  const VERSION = 'HT3.3.3';
  const ACTIONS = [
    { key: 'start', label: 'Start', api: 'start', hint: 'Beim Start eines HypeTrains.' },
    { key: 'levelUp', label: 'Stufenaufstieg', api: 'level_up', hint: 'Wenn der HypeTrain ein neues Level erreicht.' },
    { key: 'end', label: 'Ende', api: 'end', hint: 'Beim normalen Ende eines HypeTrains.' },
    { key: 'record', label: 'Rekord', api: 'record', hint: 'Wenn ein HypeTrain-Rekord erkannt wird.' }
  ];

  const state = {
    loaded: false,
    loading: false,
    saving: false,
    payload: null,
    lastError: '',
    lastSavedAt: '',
    lastTest: null,
    tabActive: false,
    renderQueued: false,
    observer: null
  };

  function esc(value){
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function bool(value){ return value === true || value === 1 || value === '1' || value === 'true' || value === 'on'; }
  function num(value, fallback = 0){ const n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function clean(value){ return String(value ?? '').trim(); }
  function panel(){ return document.getElementById(PANEL_ID); }

  function shell(){ return panel()?.querySelector('.hypetrain-shell') || null; }

  function tabsRoot(){ return panel()?.querySelector('.ht-tabs') || null; }

  function setTabActive(active){
    state.tabActive = !!active;
    const sh = shell();
    if (sh) sh.classList.toggle('ht-ea-tab-active', state.tabActive);
    if (state.tabActive) load(false);
    render();
  }

  function isEventActionsTabActive(){
    const active = tabsRoot()?.querySelector('[data-ht-tab].active');
    return active?.dataset?.htTab === TAB_ID || state.tabActive === true;
  }

  function setTabButtonState(){
    const tabs = tabsRoot();
    if (!tabs) return;
    tabs.querySelectorAll('[data-ht-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.htTab === TAB_ID && state.tabActive);
      if (btn.dataset.htTab !== TAB_ID && state.tabActive) btn.classList.remove('active');
    });
  }

  function activateTab(){
    state.tabActive = true;
    const sh = shell();
    if (sh) sh.classList.add('ht-ea-tab-active');
    ensureTab();
    setTabButtonState();
    load(false);
    window.setTimeout(() => {
      const sh2 = shell();
      if (sh2) sh2.classList.add('ht-ea-tab-active');
      render();
    }, 0);
    render();
  }

  function deactivateTab(){
    state.tabActive = false;
    const sh = shell();
    if (sh) sh.classList.remove('ht-ea-tab-active');
    const ext = document.getElementById(EXT_ID);
    if (ext) ext.remove();
  }

  function ensureTab(){
    const tabs = tabsRoot();
    if (!tabs) return;
    let btn = tabs.querySelector(`[data-ht-tab="${TAB_ID}"]`);
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ht-tab';
      btn.dataset.htTab = TAB_ID;
      btn.textContent = 'Event-Actions';
      tabs.insertBefore(btn, tabs.querySelector('[data-ht-tab="texts"]') || null);
    }
    btn.classList.toggle('active', state.tabActive);
  }

  function ensureContainer(){
    const sh = shell();
    if (!sh) return null;
    let ext = document.getElementById(EXT_ID);
    if (!ext) {
      ext = document.createElement('section');
      ext.id = EXT_ID;
      ext.className = 'ht-card glass wide ht-ea-card ht-ea-tab-card';
      sh.appendChild(ext);
    }
    return ext;
  }

  function applyTabVisibility(){
    const sh = shell();
    const ext = document.getElementById(EXT_ID);
    if (!sh) return;
    sh.classList.toggle('ht-ea-tab-active', state.tabActive);
    Array.from(sh.children).forEach(child => {
      if (child.id === EXT_ID) {
        child.hidden = !state.tabActive;
        return;
      }
      if (child.classList.contains('ht-topline') || child.classList.contains('ht-tabs') || child.classList.contains('ht-error') || child.classList.contains('ht-success')) return;
      child.hidden = !!state.tabActive;
    });
    if (ext) ext.hidden = !state.tabActive;
    setTabButtonState();
  }

  function handleTabClick(event){
    const btn = event.target?.closest?.('[data-ht-tab]');
    if (!btn || !panel()?.contains(btn)) return;
    const tab = btn.dataset.htTab || '';
    if (tab === TAB_ID) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      activateTab();
      return;
    }
    deactivateTab();
  }

  function api(path, options){
    if (window.CGN?.api) return window.CGN.api(path, options || {});
    const opts = options || {};
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    return fetch(path, opts).then(async r => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data.ok === false) throw new Error(data.error || data.message || `HTTP ${r.status}`);
      return data;
    });
  }

  function scheduleRender(){
    if (state.renderQueued) return;
    state.renderQueued = true;
    window.setTimeout(() => { state.renderQueued = false; render(); }, 60);
  }

  async function load(force){
    if (state.loading && !force) return;
    state.loading = true;
    state.lastError = '';
    try {
      state.payload = await api('/api/hypetrain/event-actions');
      state.loaded = true;
    } catch (err) {
      state.lastError = err.message || String(err);
    } finally {
      state.loading = false;
      render();
    }
  }

  function actionConfig(key){
    return state.payload?.actions?.[key] || { sound: {}, overlay: {} };
  }

  function fieldId(action, part){ return `ht3ea_${action}_${part}`.replace(/[^a-zA-Z0-9_]/g, '_'); }

  function soundCard(action){
    const cfg = actionConfig(action.key);
    const sound = cfg.sound || {};
    const disabled = !sound.enabled;
    return `
      <article class="ht-ea-action" data-ht-ea-action-key="${esc(action.key)}">
        <div class="ht-ea-action-head">
          <div>
            <h4>${esc(action.label)}</h4>
            <p>${esc(action.hint)}</p>
          </div>
          <span class="ht-badge ${disabled ? 'warn' : 'ok'}">${disabled ? 'aus' : 'aktiv'}</span>
        </div>

        <div class="ht-ea-columns">
          <section class="ht-ea-subcard">
            <h5>SoundSystem</h5>
            <label class="ht-ea-check"><input type="checkbox" data-ht-ea-field="sound.enabled" ${bool(sound.enabled) ? 'checked' : ''}> Sound aktiv</label>
            <label>Media-ID<input id="${esc(fieldId(action.key, 'mediaId'))}" type="number" min="0" step="1" data-ht-ea-field="sound.mediaId" value="${esc(sound.mediaId || 0)}"></label>
            <div class="ht-ea-media" data-media-field data-module-key="hypetrain" data-category-key="hypetrain_${esc(action.key)}" data-allowed-types="audio" data-title="${esc(action.label)} Sound auswählen" data-value-input="#${esc(fieldId(action.key, 'mediaId'))}"></div>
            <label>Sound-ID<input type="text" data-ht-ea-field="sound.soundId" value="${esc(sound.soundId || '')}" placeholder="optional"></label>
            <label>Label<input type="text" data-ht-ea-field="sound.label" value="${esc(sound.label || action.label)}"></label>
            <div class="ht-ea-row two">
              <label>Priorität<input type="number" data-ht-ea-field="sound.priority" value="${esc(sound.priority ?? 500)}"></label>
              <label>Lautstärke<input type="number" min="0" max="100" data-ht-ea-field="sound.volume" value="${esc(sound.volume ?? 85)}"></label>
            </div>
            <div class="ht-ea-row two">
              <label>Ziel<select data-ht-ea-field="sound.target">${optionList(['stream','discord','both'], sound.target || 'stream')}</select></label>
              <label>Output<select data-ht-ea-field="sound.outputTarget">${optionList(['overlay','device','both'], sound.outputTarget || 'overlay')}</select></label>
            </div>
            <div class="ht-ea-flags">
              ${flag('sound.queueIfBusy', 'Queue wenn busy', sound.queueIfBusy !== false)}
              ${flag('sound.dropIfBusy', 'Verwerfen wenn busy', sound.dropIfBusy === true)}
              ${flag('sound.canInterrupt', 'Darf unterbrechen', sound.canInterrupt === true)}
              ${flag('sound.canBeInterrupted', 'Darf unterbrochen werden', sound.canBeInterrupted !== false)}
              ${flag('sound.parallelAllowed', 'Parallel erlaubt', sound.parallelAllowed === true)}
            </div>
          </section>

          <section class="ht-ea-subcard">
            <h5>Overlay-Event</h5>
            <label class="ht-ea-check"><input type="checkbox" data-ht-ea-field="overlay.enabled" ${bool(cfg.overlay?.enabled) ? 'checked' : ''}> Overlay-Event aktiv</label>
            <label>Event<input type="text" data-ht-ea-field="overlay.event" value="${esc(cfg.overlay?.event || `hypetrain.overlay.${action.key}`)}"></label>
            <label>TTL ms<input type="number" min="1000" step="1000" data-ht-ea-field="overlay.ttlMs" value="${esc(cfg.overlay?.ttlMs || 30000)}"></label>
            ${action.key === 'levelUp' ? `<label class="ht-ea-check"><input type="checkbox" data-ht-ea-field="onlyOncePerLevel" ${cfg.onlyOncePerLevel !== false ? 'checked' : ''}> Stufe nur einmal pro Level auslösen</label>` : ''}
            <button type="button" data-ht-ea-test="${esc(action.api)}">Dry-Run testen</button>
          </section>
        </div>
      </article>`;
  }

  function optionList(options, current){
    return options.map(opt => `<option value="${esc(opt)}" ${String(current) === opt ? 'selected' : ''}>${esc(opt)}</option>`).join('');
  }

  function flag(key, label, checked){
    return `<label class="ht-ea-check small"><input type="checkbox" data-ht-ea-field="${esc(key)}" ${checked ? 'checked' : ''}> ${esc(label)}</label>`;
  }

  function render(){
    const p = panel();
    if (!p || p.hidden) return;
    ensureTab();
    const activeBtn = tabsRoot()?.querySelector('[data-ht-tab].active');
    if (activeBtn?.dataset?.htTab === TAB_ID) state.tabActive = true;
    if (activeBtn?.dataset?.htTab !== TAB_ID && !state.tabActive) {
      const ext = document.getElementById(EXT_ID);
      const sh = shell();
      if (sh) sh.classList.remove('ht-ea-tab-active');
      if (ext) ext.remove();
      return;
    }
    if (!state.tabActive) {
      const ext = document.getElementById(EXT_ID);
      const sh = shell();
      if (sh) sh.classList.remove('ht-ea-tab-active');
      if (ext) ext.remove();
      return;
    }
    const ext = ensureContainer();
    if (!ext) return;
    applyTabVisibility();

    if (state.loading && !state.loaded) {
      ext.innerHTML = '<h3>Event-Aktionen</h3><p>Lade HypeTrain Event-Actions...</p>';
      return;
    }

    const soundSystem = state.payload?.soundSystem || {};
    ext.innerHTML = `
      <div class="ht-card-head">
        <div>
          <h3>Event-Aktionen: Sound & Overlay</h3>
          <p>Start, Stufenaufstieg, Ende und Rekord können vorbereitet werden. Sounds laufen ausschließlich über das bestehende <strong>sound_system</strong>; Medien kommen aus dem Media-System.</p>
        </div>
        <div class="ht-ea-actions">
          <button type="button" data-ht-ea-action="reload">Neu laden</button>
          <button type="button" class="primary" data-ht-ea-action="save">Speichern</button>
        </div>
      </div>
      <div class="ht-status-row ht-ea-status">
        <span class="ht-badge">${esc(VERSION)}</span>
        <span class="ht-badge">Owner: ${esc(soundSystem.owner || 'sound_system')}</span>
        <span class="ht-badge">Endpoint: ${esc(soundSystem.endpoint || '/api/sound/play')}</span>
        <span class="ht-badge warn">Standard: alles aus</span>
      </div>
      ${state.lastError ? `<div class="ht-error">${esc(state.lastError)}</div>` : ''}
      ${state.lastSavedAt ? `<div class="ht-success">Gespeichert: ${esc(state.lastSavedAt)}</div>` : ''}
      ${state.lastTest ? `<details class="ht-details" open><summary>Letzter Dry-Run</summary><pre>${esc(JSON.stringify(state.lastTest, null, 2))}</pre></details>` : ''}
      <div class="ht-ea-grid">${ACTIONS.map(soundCard).join('')}</div>
      <div class="ht-note">Hinweis: Aktivieren löst noch nichts direkt aus. Es speichert nur die Config. Ein echter HypeTrain-Event oder ein Test ruft danach das Sound-System beziehungsweise das Overlay-Event auf.</div>
    `;

    bind(ext);
    try { window.MediaField?.initAll(ext); } catch (_) {}
  }

  function bind(root){
    root.querySelectorAll('[data-ht-ea-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.htEaAction;
        if (action === 'reload') return load(true);
        if (action === 'save') return save();
      });
    });
    root.querySelectorAll('[data-ht-ea-test]').forEach(btn => {
      btn.addEventListener('click', () => testAction(btn.dataset.htEaTest || 'start'));
    });
  }

  function collectSettings(){
    const p = panel();
    const out = {};
    p?.querySelectorAll('[data-ht-ea-action-key]').forEach(card => {
      const action = card.dataset.htEaActionKey;
      if (!action) return;
      card.querySelectorAll('[data-ht-ea-field]').forEach(input => {
        const field = input.dataset.htEaField;
        if (!field) return;
        let value;
        if (input.type === 'checkbox') value = !!input.checked;
        else if (input.type === 'number') value = num(input.value, 0);
        else value = input.value;
        out[`eventActions.${action}.${field}`] = value;
      });
    });
    return out;
  }

  async function save(){
    state.saving = true;
    state.lastError = '';
    try {
      const result = await api('/api/hypetrain/event-actions', { method: 'POST', body: JSON.stringify({ settings: collectSettings() }) });
      state.payload = result.eventActions || result;
      state.lastSavedAt = new Date().toLocaleTimeString('de-DE');
      await load(true);
    } catch (err) {
      state.lastError = err.message || String(err);
      render();
    } finally {
      state.saving = false;
    }
  }

  async function testAction(actionType){
    state.lastError = '';
    try {
      const result = await api('/api/hypetrain/test/event-actions?confirm=1', {
        method: 'POST',
        body: JSON.stringify({ actionType, level: actionType === 'level_up' ? 2 : 1, points: actionType === 'level_up' ? 2400 : 1200 })
      });
      state.lastTest = result.result || result;
      render();
    } catch (err) {
      state.lastError = err.message || String(err);
      render();
    }
  }

  function setupObserver(){
    const p = panel();
    if (!p || state.observer) return;
    state.observer = new MutationObserver(() => scheduleRender());
    state.observer.observe(p, { childList: true, subtree: true });
  }

  function bindGlobalTabHandler(){
    if (document.__htEventActionsTabHandlerBound) return;
    document.__htEventActionsTabHandlerBound = true;
    document.addEventListener('click', handleTabClick, true);
  }

  window.HypeTrainEventActionsDashboard = { load, render, save, testAction, activateTab, deactivateTab };
  window.addEventListener('cgn:module-show', event => {
    if (event.detail?.module === MODULE) {
      setupObserver();
      bindGlobalTabHandler();
      load(false);
      render();
    } else {
      deactivateTab();
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    setupObserver();
    bindGlobalTabHandler();
    if (!panel()?.hidden) { load(false); render(); }
  });
})();
