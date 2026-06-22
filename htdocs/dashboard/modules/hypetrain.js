(function(){
  'use strict';

  const MODULE = 'hypetrain';
  const panelId = 'hypetrainModule';
  const state = {
    loaded: false,
    loading: false,
    tab: 'overview',
    status: null,
    config: null,
    texts: null,
    stats: null,
    preview: null,
    lastEndActionResult: null,
    liveReadiness: null,
    activationProfiles: null,
    activationResult: null,
    lastError: '',
    lastSavedAt: '',
    lastTestAt: '',
    eventActions: null,
    eventActionsLoading: false,
    eventActionsError: '',
    eventActionsLastSavedAt: '',
    eventActionsLastTest: null
  };

  const tabs = [
    ['overview', 'Übersicht'],
    ['config', 'Config'],
    ['eventActions', 'Event-Actions'],
    ['texts', 'Texte'],
    ['stats', 'Statistik'],
    ['tests', 'Tests']
  ];

  function esc(value){
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function bool(value){
    return value === true || value === 1 || value === '1' || value === 'true' || value === 'on';
  }

  function api(path, options){
    if (window.CGN?.api) return window.CGN.api(path, options || {});
    return fetch(path, options || {}).then(r => r.json());
  }

  function panel(){
    return document.getElementById(panelId);
  }

  function statusBadge(ok, goodText, badText){
    return `<span class="ht-badge ${ok ? 'ok' : 'warn'}">${esc(ok ? goodText : badText)}</span>`;
  }

  function numberValue(value){
    const n = Number(value || 0);
    return Number.isFinite(n) ? n : 0;
  }

  function renderTabs(){
    return `<div class="ht-tabs">${tabs.map(([id, label]) => `<button type="button" class="ht-tab ${state.tab === id ? 'active' : ''}" data-ht-tab="${id}">${esc(label)}</button>`).join('')}</div>`;
  }

  function renderHero(){
    const s = state.status || {};
    const cfg = s.config || {};
    const runtime = s.runtime || {};
    const counters = runtime.counters || {};
    return `
      <div class="ht-hero glass">
        <div>
          <div class="ht-kicker">Community / HypeTrain</div>
          <h2>🚂 HypeTrain Control</h2>
          <p>DB-Status, Config, Texte, Statistik und Preview-Tests für das neue HypeTrain-Fachmodul.</p>
        </div>
        <div class="ht-hero-grid">
          <div class="ht-mini"><span>Version</span><strong>${esc(s.moduleVersion || '-')}</strong><small>${esc(s.moduleBuild || '-')}</small></div>
          <div class="ht-mini"><span>Datenbank</span><strong>${esc(s.database?.adapter || '-')}</strong><small>Schema ${esc(s.database?.schemaVersion ?? '-')}</small></div>
          <div class="ht-mini"><span>Bus</span><strong>${s.bus?.registered ? 'registriert' : 'nicht registriert'}</strong><small>${esc((s.bus?.subscriptions || []).length)} Subscriptions</small></div>
          <div class="ht-mini"><span>Previews</span><strong>${esc(counters.previewsGenerated || 0)}</strong><small>DB-Writes ${esc(counters.dbWrites || 0)}</small></div>
        </div>
      </div>
      <div class="ht-status-row">
        ${statusBadge(s.ok !== false, 'Status OK', 'Status prüfen')}
        ${statusBadge(cfg.enabled !== false, 'Modul aktiv', 'Modul inaktiv')}
        ${statusBadge(cfg.includeContributorNames !== true, 'Keine Namen', 'Namen aktiv')}
        ${statusBadge(cfg.includeTopContributors !== true, 'Keine Top-Unterstützer', 'Top-Unterstützer aktiv')}
        ${statusBadge(cfg.raidContextEnabled !== false, 'Raid-Kontext aktiv', 'Raid-Kontext aus')}
      </div>
    `;
  }

  function renderOverview(){
    const s = state.status || {};
    const cfg = s.config || {};
    const runtime = s.runtime || {};
    const stats = s.stats || state.stats?.totals || {};
    return `
      ${renderHero()}
      <div class="ht-grid two">
        <section class="ht-card glass">
          <h3>Aktuelle Konfiguration</h3>
          <dl class="ht-dl">
            <dt>Direkt-Discord</dt><dd>${cfg.discordEnabled ? 'aktiv' : 'aus / vorbereitet'}</dd>
            <dt>Tagebuch/Discord</dt><dd>${cfg.diaryEnabled ? 'aktiv' : 'aus / vorbereitet'}</dd>
            <dt>Rekord-Sound</dt><dd>${cfg.recordSoundEnabled ? 'aktiv' : 'aus / vorbereitet'}</dd>
            <dt>HypeTrain-Punkte</dt><dd>${cfg.includeHypeTrainPoints ? 'werden angezeigt' : 'ausgeblendet'}</dd>
            <dt>Namen</dt><dd>${cfg.includeContributorNames ? 'aktiv' : 'aus Datenschutzgründen aus'}</dd>
          </dl>
        </section>
        <section class="ht-card glass">
          <h3>Statistik kurz</h3>
          <div class="ht-stat-grid">
            ${miniStat('Runs', stats.runs)}
            ${miniStat('Rekorde', stats.records)}
            ${miniStat('Höchstes Level', stats.highestLevel)}
            ${miniStat('Höchste Punkte', stats.highestPoints)}
            ${miniStat('Bits', stats.bits)}
            ${miniStat('GiftSubs', stats.giftSubs)}
          </div>
        </section>
        ${renderEndActionSummary()}
        ${renderActivationProfiles()}
        <section class="ht-card glass wide">
          <h3>Runtime</h3>
          <dl class="ht-dl compact">
            <dt>Aktueller Train</dt><dd>${esc(runtime.currentTrainId || '-')}</dd>
            <dt>Letzter Fehler</dt><dd>${esc(runtime.lastError || '-')}</dd>
            <dt>Letzter Raid</dt><dd>${runtime.lastRaid ? `<pre>${esc(JSON.stringify(runtime.lastRaid, null, 2))}</pre>` : '-'}</dd>
            <dt>Letzte Preview</dt><dd>${runtime.lastPreview?.message ? `<pre>${esc(runtime.lastPreview.message)}</pre>` : '-'}</dd>
          </dl>
        </section>
      </div>
    `;
  }

  function miniStat(label, value){
    return `<div class="ht-stat"><span>${esc(label)}</span><strong>${esc(value ?? 0)}</strong></div>`;
  }

  function actionState(planAction){
    const a = planAction || {};
    if (a.enabled) return '<span class="ht-badge ok">würde ausführen</span>';
    return `<span class="ht-badge warn">aus: ${esc(a.reason || 'nicht aktiv')}</span>`;
  }

  function endActionPlan(){
    return state.status?.runtime?.lastEndActions?.plan || state.lastEndActionResult?.plan || null;
  }

  function endActionResult(){
    return state.lastEndActionResult || state.status?.runtime?.lastEndActions || null;
  }

  function renderEndActionSummary(){
    const result = endActionResult();
    const plan = endActionPlan();
    const actions = plan?.actions || {};
    const counters = state.status?.runtime?.counters || {};
    return `
      <section class="ht-card glass wide">
        <div class="ht-card-head">
          <div>
            <h3>Produktive End-Aktionen</h3>
            <p>Tagebuch/Discord ist der Standardweg. Direkt-Discord ist ein separater Zusatzweg und bleibt normalerweise aus.</p>
          </div>
          <button type="button" data-ht-action="end-actions-dry-run">End-Actions Dry-Run</button>
          <button type="button" data-ht-action="live-readiness">Live-Readiness prüfen</button>
        </div>
        <div class="ht-action-grid">
          <div class="ht-action-card"><span>Direkt-Discord am Ende</span><strong>${cfgText('discord')}</strong>${actionState(actions.discord)}</div>
          <div class="ht-action-card"><span>Tagebuch/Discord am Ende</span><strong>${cfgText('diary')}</strong>${actionState(actions.diary)}</div>
          <div class="ht-action-card"><span>Rekord-Sound</span><strong>${cfgText('recordSound')}</strong>${actionState(actions.recordSound)}</div>
        </div>
        <dl class="ht-dl compact">
          <dt>Letzter Test</dt><dd>${result ? esc(result.trigger || (result.dryRun ? 'dry-run' : 'produktiver Lauf')) : '-'}</dd>
          <dt>Dry-Run</dt><dd>${result ? (result.dryRun ? 'ja' : 'nein') : '-'}</dd>
          <dt>Planungen</dt><dd>${esc(counters.endActionsPlanned || 0)}</dd>
          <dt>Ausgeführt</dt><dd>Direkt-Discord ${esc(counters.discordPosted || 0)} · Tagebuch/Discord ${esc(counters.diaryPosted || 0)} · Rekord-Sound ${esc(counters.recordSoundRequested || 0)}</dd>
          <dt>Fehler</dt><dd>${esc(counters.endActionErrors || 0)}</dd>
        </dl>
        ${result ? `<details class="ht-details"><summary>Letztes End-Actions-Ergebnis anzeigen</summary><pre>${esc(JSON.stringify(result, null, 2))}</pre></details>` : ''}
      </section>
    `;
  }

  function cfgText(kind){
    const cfg = state.status?.config || {};
    if (kind === 'discord') return cfg.discordEnabled ? 'aktiv' : 'aus';
    if (kind === 'diary') return cfg.diaryEnabled ? 'aktiv' : 'aus';
    if (kind === 'recordSound') return cfg.recordSoundEnabled ? 'aktiv' : 'aus';
    return '-';
  }

  function settingInput(setting){
    const key = setting.key || '';
    const type = setting.type || setting.valueType || 'string';
    const value = setting.value;
    const data = `data-setting-key="${esc(key)}" data-setting-type="${esc(type)}"`;
    if (type === 'boolean') return `<input type="checkbox" ${data} ${bool(value) ? 'checked' : ''}>`;
    if (type === 'number' || type === 'integer') return `<input type="number" ${data} value="${esc(value ?? 0)}">`;
    return `<input type="text" ${data} value="${esc(value ?? '')}">`;
  }

  function renderConfig(){
    const cfg = state.config || {};
    const categories = Array.isArray(cfg.categories) ? cfg.categories : [];
    const settings = Array.isArray(cfg.settings) ? cfg.settings : [];
    const grouped = categories.length ? categories : buildCategories(settings);
    return `
      <div class="ht-card glass">
        <div class="ht-card-head">
          <div><h3>Config</h3><p>DB-basierte HypeTrain-Einstellungen. Medien-Uploads bleiben bewusst im Media-System.</p></div>
          <button type="button" class="primary" data-ht-action="save-config">Speichern</button>
        </div>
        <div class="ht-note ht-note-actions">
          <span>Sounds, Videos und Grafiken werden über das zentrale Media-System verwaltet. Keine eigene Upload-Insel im HypeTrain-Modul.</span>
          <button type="button" data-ht-action="open-media">Media-System im eigenen Fenster öffnen</button>
        </div>
        <div class="ht-safety-box">
          <strong>Aktivierungslogik:</strong> Tagebuch/Discord läuft über <code>diary.enabled=true</code> und <code>diary.writeOnEnd=true</code>. Direkt-Discord ist ein separater Zusatzweg über <code>discord.enabled=true</code> und <code>discord.writeOnEnd=true</code>. Rekord-Sound läuft nur bei <code>sound.recordSoundEnabled=true</code> und gültiger Media-ID/Sound-ID. Namen/Top-Unterstützer bleiben standardmäßig aus.
        </div>
        ${renderActivationProfiles()}
        <div class="ht-config-grid">
          ${grouped.map(cat => renderCategory(cat)).join('') || '<p>Keine Settings gefunden.</p>'}
        </div>
      </div>
    `;
  }

  function buildCategories(settings){
    const map = new Map();
    for (const setting of settings) {
      const category = setting.category || 'Allgemein';
      if (!map.has(category)) map.set(category, { name: category, settings: [] });
      map.get(category).settings.push(setting);
    }
    return [...map.values()];
  }

  function renderCategory(cat){
    const rows = Array.isArray(cat.settings) ? cat.settings : [];
    return `
      <section class="ht-config-cat">
        <h4>${esc(cat.name || cat.category || 'Allgemein')}</h4>
        ${rows.map(setting => `
          <label class="ht-setting">
            <span><strong>${esc(setting.label || setting.key)}</strong><small>${esc(setting.description || setting.key)}</small></span>
            ${settingInput(setting)}
          </label>
        `).join('')}
      </section>
    `;
  }

  function extractSettings(){
    const out = {};
    panel()?.querySelectorAll('[data-setting-key]').forEach(input => {
      const key = input.dataset.settingKey;
      const type = input.dataset.settingType || 'string';
      if (!key) return;
      if (type === 'boolean') out[key] = !!input.checked;
      else if (type === 'number' || type === 'integer') out[key] = Number(input.value || 0);
      else out[key] = input.value;
    });
    return out;
  }

  function renderActivationProfiles(){
    const data = state.activationProfiles || {};
    const profiles = Array.isArray(data.profiles) ? data.profiles : [];
    const current = data.current || {};
    return `
      <section class="ht-card glass wide ht-activation-card">
        <div class="ht-card-head">
          <div>
            <h3>Sichere Aktivierungsprofile</h3>
            <p>Für den Live-Test immer nur eine produktive Aktion aktivieren. Aktueller Standard: nur Tagebuch/Discord über das bestehende Tagebuch-System.</p>
          </div>
          <button type="button" data-ht-action="load-activation-profiles">Profile neu laden</button>
        </div>
        <div class="ht-action-grid">
          <div class="ht-action-card"><span>Aktuell Tagebuch/Discord</span><strong>${current.diaryEndEnabled ? 'aktiv' : 'aus'}</strong></div>
          <div class="ht-action-card"><span>Aktuell Direkt-Discord</span><strong>${(current.directDiscordEndEnabled ?? current.discordEndEnabled) ? 'aktiv' : 'aus'}</strong></div>
          <div class="ht-action-card"><span>Aktuell Rekord-Sound</span><strong>${current.recordSoundEnabled ? 'aktiv' : 'aus'}</strong><small>Media ${esc(current.mediaId || 0)} · ${esc(current.soundId || '-')}</small></div>
        </div>
        <div class="ht-profile-grid">
          ${profiles.map(profile => `
            <article class="ht-profile ${profile.readyToApply ? '' : 'not-ready'}">
              <h4>${esc(profile.label || profile.id)}</h4>
              <p>${esc(profile.description || '')}</p>
              ${profile.readyToApply ? '<span class="ht-badge ok">bereit</span>' : `<span class="ht-badge warn">fehlt: ${esc((profile.missing || []).join(', ') || 'Config')}</span>`}
              <button type="button" data-ht-action="apply-activation-profile" data-ht-profile="${esc(profile.id)}">Profil speichern</button>
            </article>
          `).join('') || '<p>Aktivierungsprofile noch nicht geladen.</p>'}
        </div>
        <div class="ht-note">Profile speichern nur Config-Schalter. Tagebuch/Discord nutzt das bestehende Tagebuch-System. Direkt-Discord ist ein separater Zusatzweg. Profilwechsel lösen keine produktive Aktion aus.</div>
        ${state.activationResult ? `<details class="ht-details" open><summary>Letztes Aktivierungsprofil-Ergebnis</summary><pre>${esc(JSON.stringify(state.activationResult, null, 2))}</pre></details>` : ''}
      </section>
    `;
  }


  const eventActionDefs = [
    { key: 'start', label: 'Start', api: 'start', hint: 'Beim Start eines HypeTrains.' },
    { key: 'levelUp', label: 'Stufenaufstieg', api: 'level_up', hint: 'Wenn der HypeTrain ein neues Level erreicht.' },
    { key: 'end', label: 'Ende', api: 'end', hint: 'Beim normalen Ende eines HypeTrains.' },
    { key: 'record', label: 'Rekord', api: 'record', hint: 'Wenn ein HypeTrain-Rekord erkannt wird.' }
  ];

  function apiJson(path, options){
    const opts = Object.assign({}, options || {});
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    return api(path, opts);
  }

  function eventActionConfig(key){
    return state.eventActions?.actions?.[key] || { sound: {}, overlay: {} };
  }

  function eventActionFieldId(action, part){
    return `ht3ea_${action}_${part}`.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  function eventActionOptionList(options, current){
    return options.map(opt => `<option value="${esc(opt)}" ${String(current) === opt ? 'selected' : ''}>${esc(opt)}</option>`).join('');
  }

  function eventActionFlag(key, label, checked){
    return `<label class="ht-ea-check small"><input type="checkbox" data-ht-ea-field="${esc(key)}" ${checked ? 'checked' : ''}> ${esc(label)}</label>`;
  }

  function renderEventActionCard(action){
    const cfg = eventActionConfig(action.key);
    const sound = cfg.sound || {};
    const overlay = cfg.overlay || {};
    const disabled = !sound.enabled;
    return `
      <article class="ht-ea-action" data-ht-ea-action-key="${esc(action.key)}">
        <div class="ht-ea-action-head">
          <div>
            <h4>${esc(action.label)}</h4>
            <p>${esc(action.hint)}</p>
          </div>
          <span class="ht-badge ${disabled ? 'warn' : 'ok'}">${disabled ? 'Sound aus' : 'Sound aktiv'}</span>
        </div>

        <div class="ht-ea-columns">
          <section class="ht-ea-subcard">
            <h5>SoundSystem</h5>
            <label class="ht-ea-check"><input type="checkbox" data-ht-ea-field="sound.enabled" ${bool(sound.enabled) ? 'checked' : ''}> Sound aktiv</label>
            <label>Media-ID<input id="${esc(eventActionFieldId(action.key, 'mediaId'))}" type="number" min="0" step="1" data-ht-ea-field="sound.mediaId" value="${esc(sound.mediaId || 0)}"></label>
            <div class="ht-ea-media" data-media-field data-module-key="hypetrain" data-category-key="hypetrain_${esc(action.key)}" data-allowed-types="audio" data-title="${esc(action.label)} Sound auswählen" data-value-input="#${esc(eventActionFieldId(action.key, 'mediaId'))}"></div>
            <label>Sound-ID<input type="text" data-ht-ea-field="sound.soundId" value="${esc(sound.soundId || '')}" placeholder="optional"></label>
            <label>Label<input type="text" data-ht-ea-field="sound.label" value="${esc(sound.label || action.label)}"></label>
            <div class="ht-ea-row two">
              <label>Priorität<input type="number" data-ht-ea-field="sound.priority" value="${esc(sound.priority ?? 500)}"></label>
              <label>Lautstärke<input type="number" min="0" max="100" data-ht-ea-field="sound.volume" value="${esc(sound.volume ?? 85)}"></label>
            </div>
            <div class="ht-ea-row two">
              <label>Ziel<select data-ht-ea-field="sound.target">${eventActionOptionList(['stream','discord','both'], sound.target || 'stream')}</select></label>
              <label>Output<select data-ht-ea-field="sound.outputTarget">${eventActionOptionList(['overlay','device','both'], sound.outputTarget || 'overlay')}</select></label>
            </div>
            <div class="ht-ea-flags">
              ${eventActionFlag('sound.queueIfBusy', 'Queue wenn busy', sound.queueIfBusy !== false)}
              ${eventActionFlag('sound.dropIfBusy', 'Verwerfen wenn busy', sound.dropIfBusy === true)}
              ${eventActionFlag('sound.canInterrupt', 'Darf unterbrechen', sound.canInterrupt === true)}
              ${eventActionFlag('sound.canBeInterrupted', 'Darf unterbrochen werden', sound.canBeInterrupted !== false)}
              ${eventActionFlag('sound.parallelAllowed', 'Parallel erlaubt', sound.parallelAllowed === true)}
            </div>
          </section>

          <section class="ht-ea-subcard">
            <h5>Overlay-Event</h5>
            <label class="ht-ea-check"><input type="checkbox" data-ht-ea-field="overlay.enabled" ${bool(overlay.enabled) ? 'checked' : ''}> Overlay-Event aktiv</label>
            <label>Event<input type="text" data-ht-ea-field="overlay.event" value="${esc(overlay.event || `hypetrain.overlay.${action.key}`)}"></label>
            <label>TTL ms<input type="number" min="1000" step="1000" data-ht-ea-field="overlay.ttlMs" value="${esc(overlay.ttlMs || 30000)}"></label>
            ${action.key === 'levelUp' ? `<label class="ht-ea-check"><input type="checkbox" data-ht-ea-field="onlyOncePerLevel" ${cfg.onlyOncePerLevel !== false ? 'checked' : ''}> Stufe nur einmal pro Level auslösen</label>` : ''}
            <button type="button" data-ht-ea-test="${esc(action.api)}">Dry-Run testen</button>
          </section>
        </div>
      </article>`;
  }

  function renderEventActions(){
    const soundSystem = state.eventActions?.soundSystem || {};
    return `
      <section class="ht-card glass wide ht-ea-card">
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
          <span class="ht-badge">HT3.4</span>
          <span class="ht-badge">Owner: ${esc(soundSystem.owner || 'sound_system')}</span>
          <span class="ht-badge">Endpoint: ${esc(soundSystem.endpoint || '/api/sound/play')}</span>
          <span class="ht-badge warn">Standard: alles aus</span>
        </div>
        ${state.eventActionsLoading && !state.eventActions ? '<p>Lade HypeTrain Event-Actions...</p>' : ''}
        ${state.eventActionsError ? `<div class="ht-error">${esc(state.eventActionsError)}</div>` : ''}
        ${state.eventActionsLastSavedAt ? `<div class="ht-success">Event-Actions gespeichert: ${esc(state.eventActionsLastSavedAt)}</div>` : ''}
        ${state.eventActionsLastTest ? `<details class="ht-details" open><summary>Letzter Dry-Run</summary><pre>${esc(JSON.stringify(state.eventActionsLastTest, null, 2))}</pre></details>` : ''}
        <div class="ht-ea-grid">${eventActionDefs.map(renderEventActionCard).join('')}</div>
        <div class="ht-note">Hinweis: Aktivieren löst noch nichts direkt aus. Es speichert nur die Config. Ein echter HypeTrain-Event oder ein Test ruft danach das Sound-System beziehungsweise das Overlay-Event auf.</div>
      </section>
    `;
  }

  function collectEventActionSettings(){
    const out = {};
    panel()?.querySelectorAll('[data-ht-ea-action-key]').forEach(card => {
      const action = card.dataset.htEaActionKey;
      if (!action) return;
      card.querySelectorAll('[data-ht-ea-field]').forEach(input => {
        const field = input.dataset.htEaField;
        if (!field) return;
        let value;
        if (input.type === 'checkbox') value = !!input.checked;
        else if (input.type === 'number') value = numberValue(input.value);
        else value = input.value;
        out[`eventActions.${action}.${field}`] = value;
      });
    });
    return out;
  }

  async function loadEventActions(force){
    if (state.eventActionsLoading && !force) return;
    state.eventActionsLoading = true;
    state.eventActionsError = '';
    try {
      state.eventActions = await api('/api/hypetrain/event-actions');
    } catch (err) {
      state.eventActionsError = err.message || String(err);
    } finally {
      state.eventActionsLoading = false;
      if (state.tab === 'eventActions') render();
    }
  }

  async function saveEventActions(){
    state.eventActionsError = '';
    try {
      const result = await apiJson('/api/hypetrain/event-actions', { method: 'POST', body: JSON.stringify({ settings: collectEventActionSettings() }) });
      state.eventActions = result.eventActions || result;
      state.eventActionsLastSavedAt = new Date().toLocaleTimeString('de-DE');
      await loadEventActions(true);
    } catch (err) {
      state.eventActionsError = err.message || String(err);
      render();
    }
  }

  async function testEventAction(actionType){
    state.eventActionsError = '';
    try {
      const result = await apiJson('/api/hypetrain/test/event-actions?confirm=1', {
        method: 'POST',
        body: JSON.stringify({ actionType, level: actionType === 'level_up' ? 2 : 1, points: actionType === 'level_up' ? 2400 : 1200 })
      });
      state.eventActionsLastTest = result.result || result;
      render();
    } catch (err) {
      state.eventActionsError = err.message || String(err);
      render();
    }
  }

  function bindEventActions(root){
    root.querySelectorAll('[data-ht-ea-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.htEaAction;
        if (action === 'reload') return loadEventActions(true);
        if (action === 'save') return saveEventActions();
      });
    });
    root.querySelectorAll('[data-ht-ea-test]').forEach(btn => {
      btn.addEventListener('click', () => testEventAction(btn.dataset.htEaTest || 'start'));
    });
    try { window.MediaField?.initAll(root); } catch (_) {}
  }

  function renderTexts(){
    const payload = state.texts?.texts || state.texts || {};
    const rows = Array.isArray(payload.rows) ? payload.rows : (Array.isArray(payload.items) ? payload.items : []);
    const categories = Array.isArray(payload.categories) ? payload.categories : [];
    return `
      <div class="ht-card glass">
        <h3>Texte</h3>
        <p>Textvarianten kommen aus dem DB-Textsystem. HT2.4 zeigt die vorhandenen Textdaten kontrolliert an; der volle Editor bleibt später beim zentralen Texteditor-Standard.</p>
        ${categories.length ? `<div class="ht-status-row">${categories.map(cat => `<span class="ht-badge">${esc(cat.label || cat.name || cat.key || cat)}</span>`).join('')}</div>` : ''}
        <div class="ht-table-wrap">
          <table class="ht-table">
            <thead><tr><th>Key</th><th>Kategorie</th><th>Text / Varianten</th></tr></thead>
            <tbody>
              ${rows.map(row => textRow(row)).join('') || '<tr><td colspan="3">Keine Textdaten gefunden.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function textRow(row){
    const key = row.key || row.textKey || row.text_key || row.name || '';
    const cat = row.category || row.categoryName || '';
    let text = row.text || row.value || row.defaultText || row.default_text || '';
    if (!text && Array.isArray(row.variants)) text = row.variants.map(v => v.text || v.value || v.body || '').filter(Boolean).join('\n---\n');
    if (!text) text = JSON.stringify(row, null, 2);
    return `<tr><td><code>${esc(key)}</code></td><td>${esc(cat)}</td><td><pre>${esc(text)}</pre></td></tr>`;
  }

  function renderStats(){
    const stats = state.stats || {};
    const totals = stats.totals || state.status?.stats || {};
    const recent = Array.isArray(stats.recentRuns) ? stats.recentRuns : (Array.isArray(stats.runs) ? stats.runs : []);
    return `
      <div class="ht-card glass">
        <h3>Statistik</h3>
        <div class="ht-stat-grid wide-stats">
          ${miniStat('Runs', totals.runs)}
          ${miniStat('Rekorde', totals.records)}
          ${miniStat('Level-Rekorde', totals.levelRecords)}
          ${miniStat('Punkte-Rekorde', totals.pointsRecords)}
          ${miniStat('Höchstes Level', totals.highestLevel)}
          ${miniStat('Höchste Punkte', totals.highestPoints)}
          ${miniStat('Bits', totals.bits)}
          ${miniStat('Subs', totals.subs)}
          ${miniStat('Resubs', totals.resubs)}
          ${miniStat('GiftSubs', totals.giftSubs)}
          ${miniStat('Raid-Runs', totals.raidRuns)}
        </div>
        <div class="ht-table-wrap">
          <table class="ht-table">
            <thead><tr><th>Train</th><th>Level</th><th>Punkte</th><th>Bits</th><th>Subs</th><th>GiftSubs</th><th>Rekord</th></tr></thead>
            <tbody>
              ${recent.map(run => `<tr><td>${esc(run.train_id || run.trainId || '-')}</td><td>${esc(run.level || 0)}</td><td>${esc(run.points_total || run.pointsTotal || 0)}</td><td>${esc(run.bits_total || run.bits || 0)}</td><td>${esc((run.subs_total || 0) + (run.resubs_total || 0))}</td><td>${esc(run.gift_subs_total || run.giftSubs || 0)}</td><td>${run.record_reached || run.recordReached ? '🏆' : '-'}</td></tr>`).join('') || '<tr><td colspan="7">Noch keine Runs gespeichert.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderTests(){
    const preview = state.preview || state.status?.runtime?.lastPreview || null;
    return `
      <div class="ht-card glass">
        <h3>Tests</h3>
        <p>Alle Dashboard-Tests sind Preview-/Dry-Run-Tests. Produktive Tagebuch-/Direkt-Discord-/Sound-Aktionen werden hier nicht ohne separaten Produktiv-Confirm ausgelöst.</p>
        <div class="ht-test-grid">
          <button type="button" data-ht-action="preview-normal">Normale Preview</button>
          <button type="button" data-ht-action="preview-raid-record">Raid + Rekord Preview</button>
          <button type="button" data-ht-action="end-actions-dry-run">End-Actions Dry-Run</button>
          <button type="button" data-ht-action="live-readiness">Live-Readiness prüfen</button>
          <button type="button" data-ht-action="load-activation-profiles">Aktivierungsprofile laden</button>
          <button type="button" data-ht-action="synthetic-test">Synthetischen DB-Test schreiben</button>
          <button type="button" data-ht-action="open-media">Media-System öffnen</button>
          <button type="button" data-ht-action="reload">Status neu laden</button>
        </div>
        <div class="ht-note">Produktive Tests bleiben absichtlich nicht als Ein-Klick-Button im Dashboard. Aktivierungsprofile ändern nur Config-Schalter; echte End-Actions brauchen weiterhin den zusätzlichen Confirm <code>HYPETRAIN_PRODUCTIVE_ACTIONS</code>. Standard bleibt: Tagebuch/Discord über Tagebuch.</div>
        <div class="ht-preview-box">
          <h4>Letzte Preview</h4>
          ${preview?.message ? `<pre>${esc(preview.message)}</pre>` : '<p>Noch keine Preview in diesem Dashboardlauf.</p>'}
        </div>
        ${endActionResult() ? `<div class="ht-preview-box"><h4>Letzter End-Actions Dry-Run</h4><pre>${esc(JSON.stringify(endActionResult(), null, 2))}</pre></div>` : ''}
        ${state.liveReadiness ? `<div class="ht-preview-box"><h4>Live-Readiness</h4>${renderReadinessSummary(state.liveReadiness)}<pre>${esc(JSON.stringify(state.liveReadiness, null, 2))}</pre></div>` : ''}
        ${renderActivationProfiles()}
      </div>
    `;
  }

  function renderReadinessSummary(data){
    const summary = data?.summary || {};
    const ready = summary.readyForProductiveTest === true;
    const checks = data?.checks || {};
    const rows = Object.entries(checks).map(([area, list]) => {
      const items = Array.isArray(list) ? list : [];
      const warnings = items.filter(item => item.severity === 'warning').length;
      const errors = items.filter(item => item.severity === 'error' || item.ok === false && item.severity !== 'info').length;
      const label = area === 'recordSound' ? 'Rekord-Sound' : (area === 'diary' ? 'Tagebuch/Discord' : 'Direkt-Discord');
      return `<div class="ht-mini"><span>${esc(label)}</span><strong>${errors ? 'Fehler' : (warnings ? 'Warnung' : 'OK')}</strong><small>${esc(errors)} Fehler · ${esc(warnings)} Warnungen</small></div>`;
    }).join('');
    return `<div class="ht-note ${ready ? 'ok' : 'warn'}">${ready ? 'Bereit für manuellen Produktiv-Test.' : 'Noch nicht ohne Warnungen bereit. Erst Hinweise prüfen.'}</div><div class="ht-hero-grid">${rows}</div>`;
  }

  function render(){
    const el = panel();
    if (!el) return;
    if (state.loading && !state.loaded) {
      el.innerHTML = '<div class="ht-card glass"><h2>🚂 HypeTrain</h2><p>Lade HypeTrain-Daten...</p></div>';
      return;
    }
    const body = state.tab === 'config' ? renderConfig()
      : state.tab === 'eventActions' ? renderEventActions()
      : state.tab === 'texts' ? renderTexts()
      : state.tab === 'stats' ? renderStats()
      : state.tab === 'tests' ? renderTests()
      : renderOverview();
    el.innerHTML = `
      <div class="hypetrain-shell">
        <div class="ht-topline">
          <div><h1>🚂 HypeTrain</h1><p>DB-basiertes HypeTrain-Fachmodul für Status, Config, Event-Actions, Texte, Statistik und Tests.</p></div>
          <button type="button" data-ht-action="reload">Aktualisieren</button>
        </div>
        ${renderTabs()}
        ${state.lastError ? `<div class="ht-error">${esc(state.lastError)}</div>` : ''}
        ${state.lastSavedAt ? `<div class="ht-success">Gespeichert: ${esc(state.lastSavedAt)}</div>` : ''}
        ${body}
      </div>
    `;
    bind();
  }

  function bind(){
    const el = panel();
    if (!el) return;
    el.querySelectorAll('[data-ht-tab]').forEach(btn => btn.addEventListener('click', () => {
      state.tab = btn.dataset.htTab || 'overview';
      state.lastSavedAt = '';
      render();
    }));
    el.querySelectorAll('[data-ht-action]').forEach(btn => btn.addEventListener('click', () => handleAction(btn.dataset.htAction || '', btn)));
    if (state.tab === 'eventActions') {
      if (!state.eventActions && !state.eventActionsLoading) loadEventActions(false);
      bindEventActions(el);
    }
  }

  async function loadAll(force){
    if (state.loading && !force) return;
    state.loading = true;
    state.lastError = '';
    render();
    try {
      const [status, config, texts, stats, activation, eventActions] = await Promise.all([
        api('/api/hypetrain/status'),
        api('/api/hypetrain/config'),
        api('/api/hypetrain/texts').catch(err => ({ ok:false, error: err.message })),
        api('/api/hypetrain/stats').catch(err => ({ ok:false, error: err.message })),
        api('/api/hypetrain/activation-profiles').catch(err => ({ ok:false, error: err.message })),
        api('/api/hypetrain/event-actions').catch(err => ({ ok:false, error: err.message }))
      ]);
      state.status = status;
      state.config = config;
      state.texts = texts;
      state.stats = stats;
      state.activationProfiles = activation;
      state.eventActions = eventActions;
      state.loaded = true;
    } catch (err) {
      state.lastError = err.message || String(err);
    } finally {
      state.loading = false;
      render();
    }
  }

  async function saveConfig(){
    const settings = extractSettings();
    state.lastError = '';
    try {
      await api('/api/hypetrain/config', { method: 'POST', body: JSON.stringify({ settings }) });
      state.lastSavedAt = new Date().toLocaleTimeString('de-DE');
      await loadAll(true);
      state.tab = 'config';
    } catch (err) {
      state.lastError = err.message || String(err);
      render();
    }
  }

  async function makePreview(params){
    state.lastError = '';
    try {
      const url = '/api/hypetrain/preview?' + new URLSearchParams(params).toString();
      const result = await api(url);
      state.preview = result.preview;
      state.tab = 'tests';
      render();
    } catch (err) {
      state.lastError = err.message || String(err);
      render();
    }
  }

  async function syntheticTest(){
    state.lastError = '';
    try {
      const body = { raid:true, record:true, level:5, points:9600, bits:3500, subs:3, giftSubs:4 };
      const result = await api('/api/hypetrain/test/synthetic?confirm=1', { method: 'POST', body: JSON.stringify(body) });
      state.preview = result.preview;
      state.status = result.status || state.status;
      await loadAll(true);
      state.tab = 'tests';
    } catch (err) {
      state.lastError = err.message || String(err);
      render();
    }
  }

  async function endActionsDryRun(){
    state.lastError = '';
    try {
      const body = { raid:true, record:true, level:5, points:9600, bits:3500, subs:3, giftSubs:4 };
      const result = await api('/api/hypetrain/test/end-actions?confirm=1', { method: 'POST', body: JSON.stringify(body) });
      state.preview = result.preview || state.preview;
      state.lastEndActionResult = result.result || result;
      state.status = result.status || state.status;
      state.tab = 'tests';
      render();
    } catch (err) {
      state.lastError = err.message || String(err);
      render();
    }
  }

  function openMediaWindow(){
    try {
      localStorage.setItem('cgn-dashboard-active-section', 'system');
      localStorage.setItem('cgn-dashboard-active-module', 'media');
    } catch (_) {}
    window.open('/dashboard', 'cgn-media-system', 'popup=yes,width=1400,height=900');
  }

  async function liveReadiness(){
    state.lastError = '';
    try {
      const body = { raid:true, record:true, level:5, points:9600, bits:3500, subs:3, resubs:1, giftSubs:4 };
      const result = await api('/api/hypetrain/live-readiness', { method: 'POST', body: JSON.stringify(body) });
      state.liveReadiness = result;
      state.preview = result.preview || state.preview;
      state.tab = 'tests';
      render();
    } catch (err) {
      state.lastError = err.message || String(err);
      render();
    }
  }

  async function loadActivationProfiles(){
    state.lastError = '';
    try {
      const result = await api('/api/hypetrain/activation-profiles');
      state.activationProfiles = result;
      state.tab = state.tab === 'overview' ? 'overview' : 'tests';
      render();
    } catch (err) {
      state.lastError = err.message || String(err);
      render();
    }
  }

  async function applyActivationProfile(profile){
    const clean = String(profile || '').trim();
    if (!clean) return;
    const labels = { all_off: 'Alles aus', diary_only: 'Nur Tagebuch/Discord', discord_only: 'Nur Direkt-Discord', record_sound_only: 'Nur Rekord-Sound' };
    const label = labels[clean] || clean;
    const ok = window.confirm(`Aktivierungsprofil speichern: ${label}?\n\nEs werden nur Config-Schalter geändert. Es wird keine produktive Aktion ausgelöst.`);
    if (!ok) return;
    state.lastError = '';
    try {
      const result = await api('/api/hypetrain/activation-profiles?confirm=1', {
        method: 'POST',
        body: JSON.stringify({ profile: clean, confirmApply: 'HYPETRAIN_ACTIVATION_PROFILE' })
      });
      state.activationResult = result;
      state.activationProfiles = result.activation || state.activationProfiles;
      state.status = result.status || state.status;
      await loadAll(true);
      state.tab = 'tests';
      render();
    } catch (err) {
      state.lastError = err.message || String(err);
      render();
    }
  }

  function handleAction(action, btn){
    if (action === 'reload') return loadAll(true);
    if (action === 'save-config') return saveConfig();
    if (action === 'open-media') return openMediaWindow();
    if (action === 'end-actions-dry-run') return endActionsDryRun();
    if (action === 'live-readiness') return liveReadiness();
    if (action === 'load-activation-profiles') return loadActivationProfiles();
    if (action === 'apply-activation-profile') return applyActivationProfile(btn?.dataset?.htProfile || '');
    if (action === 'preview-normal') return makePreview({ level:2, points:2500, bits:1500, subs:1, resubs:1, giftSubs:1 });
    if (action === 'preview-raid-record') return makePreview({ raid:1, record:1, level:5, points:9600, bits:3500, subs:3, giftSubs:4 });
    if (action === 'synthetic-test') return syntheticTest();
  }

  window.HypeTrainModule = { loadAll, render };
  window.addEventListener('cgn:module-show', event => {
    if (event.detail?.module === MODULE) loadAll(false);
  });
})();
