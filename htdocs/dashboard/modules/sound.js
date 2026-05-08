window.SoundSystemModule = (function(){
  'use strict';

  const API = '/api/sound';
  let root = null;
  let status = null;
  let output = null;
  let settings = null;
  let integrationCheck = null;
  let routesInfo = null;
  let devices = [];
  let loading = false;
  let lastSaveInfo = null;
  let actionsBound = false;
  let activeSection = 'overview';

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? ''); }
  async function api(path, options){ return window.CGN.api(API + path, options || {}); }
  function button(label, action, extraClass){ return `<button type="button" class="${extraClass || ''}" data-sound-action="${esc(action)}">${esc(label)}</button>`; }

  function renderShell(){
    if (!root) return;
    root.innerHTML = `
      <div class="sound-card sound-hero">
        <div>
          <h2>Sound-System</h2>
          <div class="sound-note">Zentrale Steuerung für Stream-Sounds, Queue, Prioritäten, Ausgabeziele, Alert-Sync und spätere Discord-Ausgabe.</div>
        </div>
        <div class="sound-actions sound-hero-actions">
          ${button('Neu laden', 'reload')}
          ${button('Stop', 'stop')}
          ${button('Skip', 'skip')}
          ${button('Queue leeren', 'clear')}
          <a class="ghost-link" href="/overlays/sound_system_overlay.html?debug=1" target="_blank">Overlay öffnen</a>
        </div>
      </div>

      <div class="sound-tabs" role="tablist" aria-label="Sound-System Navigation">
        <button type="button" class="sound-tab active" data-sound-tab="overview">&Uuml;bersicht</button>
        <button type="button" class="sound-tab" data-sound-tab="output">Ausgabe</button>
        <button type="button" class="sound-tab" data-sound-tab="queue">Queue</button>
        <button type="button" class="sound-tab" data-sound-tab="settings">Einstellungen</button>
        <button type="button" class="sound-tab" data-sound-tab="sounds">Sounds</button>
        <button type="button" class="sound-tab" data-sound-tab="diagnose">Diagnose</button>
      </div>

      <div class="sound-grid">
        <div class="sound-card" id="soundStatusCard" data-sound-section="overview"></div>
        <div class="sound-card" id="soundCurrentCard" data-sound-section="overview"></div>
        <div class="sound-card" id="soundPolicyCard" data-sound-section="overview queue"></div>
        <div class="sound-card" id="soundOutputCard" data-sound-section="output"></div>
        <div class="sound-card" id="soundSettingsCard" data-sound-section="settings"></div>
        <div class="sound-card" data-sound-section="sounds">
          <h3>Sound-Liste</h3>
          <div id="soundList" class="sound-list"></div>
        </div>
        <div class="sound-card" data-sound-section="queue overview">
          <h3>Queue</h3>
          <div id="soundQueue" class="sound-queue"></div>
        </div>
        <div class="sound-card" id="soundIntegrationCard" data-sound-section="diagnose"></div>
      </div>
    `;
    applySoundSection();
  }
  function render(){
    if (!root) return;
    if (!status) {
      renderShell();
      bindActions();
    }
    renderStatus();
    renderOutput();
    renderCurrent();
    renderPolicy();
    renderSettings();
    renderSounds();
    renderQueue();
    renderIntegration();
    applySoundSection();
  }

  function renderStatus(){
    const el = document.getElementById('soundStatusCard');
    if (!el) return;
    const cfg = status?.config || {};
    el.innerHTML = `
      <h3>Status</h3>
      <div class="sound-status-row"><span>Modul</span><span class="sound-pill">${status?.enabled ? 'Aktiv' : 'Inaktiv'}</span></div>
      <div class="sound-status-row"><span>Pause</span><span>${status?.paused ? 'Ja' : 'Nein'}</span></div>
      <div class="sound-status-row"><span>Aktueller Sound</span><span>${status?.current ? esc(status.current.label || status.current.soundId) : 'Keiner'}</span></div>
      <div class="sound-status-row"><span>Queue</span><span>${Number(status?.queuedCount || 0)}</span></div>
      <div class="sound-status-row"><span>Parallel</span><span>${Number(status?.parallelCount || 0)}</span></div>
      <div class="sound-status-row"><span>Overlay</span><span>${status?.client?.connected ? 'Verbunden' : 'Nicht verbunden'}</span></div>
      <div class="sound-status-row"><span>Config</span><span>${cfg.ok ? 'OK' : 'Fehler'}</span></div>
      <div class="sound-note">Config: ${esc(cfg.path || '')}</div>
    `;
  }

  function getOutputState(){
    return status?.config?.output || output?.output || {};
  }

  function modeFlags(mode){
    if (mode === 'device') return { overlay: false, device: true, both: false };
    if (mode === 'both') return { overlay: true, device: true, both: true };
    return { overlay: true, device: false, both: false };
  }

  function renderOutput(){
    const el = document.getElementById('soundOutputCard');
    if (!el) return;
    const out = getOutputState();
    const targets = out.targets || {};
    const device = targets.device || {};
    const helperWarning = devices?.warning && devices.warning !== 'helper' ? `<div class="sound-note">Gerätequelle: ${esc(devices.warning)}${devices.error ? ' · ' + esc(devices.error) : ''}</div>` : '';
    const deviceList = Array.isArray(devices?.devices) ? devices.devices : [];
    const selectedId = device.selectedDeviceId || 'default';
    const selectedMissing = selectedId && !deviceList.some(d => String(d.id) === String(selectedId));
    const saveInfo = lastSaveInfo ? `
      <div class="sound-note">
        Letztes Speichern: gesendet <strong>${esc(lastSaveInfo.sentDefaultTarget)}</strong>, gespeichert <strong>${esc(lastSaveInfo.savedDefaultTarget)}</strong>
      </div>
    ` : '';

    el.innerHTML = `
      <h3>Ausgabe</h3>
      <label class="sound-field">
        <span>Ausgabemodus</span>
        <select id="soundDefaultTarget">
          <option value="overlay" ${out.defaultTarget === 'overlay' ? 'selected' : ''}>Overlay / OBS</option>
          <option value="device" ${out.defaultTarget === 'device' ? 'selected' : ''}>Audiogerät</option>
          <option value="both" ${out.defaultTarget === 'both' ? 'selected' : ''}>Beides</option>
        </select>
      </label>
      <label class="sound-field">
        <span>Ausgabegerät</span>
        <select id="soundDeviceSelect">
          ${selectedMissing ? `<option value="${esc(selectedId)}" data-name="${esc(device.selectedDeviceName || selectedId)}" selected>${esc(device.selectedDeviceName || selectedId)} (gespeichert)</option>` : ''}
          ${deviceList.map(d => `<option value="${esc(d.id)}" data-name="${esc(d.name)}" ${String(d.id) === String(selectedId) ? 'selected' : ''}>${esc(d.name)}${d.isDefault ? ' (Standard)' : ''}</option>`).join('')}
        </select>
      </label>
      <label class="sound-field">
        <span>Gerät-Lautstärke</span>
        <input id="soundDeviceVolume" type="number" min="0" max="100" value="${esc(device.defaultVolume ?? 80)}">
      </label>
      <div class="sound-actions">
        ${button('Ausgabe speichern', 'save-output')}
        ${button('Geräte neu laden', 'reload-devices')}
        ${button('Test Ausgabe', 'test-output')}
      </div>
      <div class="sound-note">Der Ausgabemodus setzt die passenden Ziele automatisch. Gerät und Lautstärke gelten für direkte Audiogerät-Ausgabe.</div>
      ${saveInfo}
      ${helperWarning}
    `;
  }

  function renderCurrent(){
    const el = document.getElementById('soundCurrentCard');
    if (!el) return;
    const cur = status?.current;
    if (!cur) { el.innerHTML = `<h3>Aktuell</h3><div class="sound-empty">Gerade läuft kein Sound.</div>`; return; }
    const flags = cur.flags || {};
    el.innerHTML = `
      <h3>Aktuell</h3>
      <div class="sound-current-row"><span>Name</span><strong>${esc(cur.label || cur.soundId)}</strong></div>
      <div class="sound-current-row"><span>Kategorie</span><span class="sound-pill">${esc(cur.category || '-')}</span></div>
      <div class="sound-current-row"><span>Quelle</span><span>${esc(cur.source || '-')}</span></div>
      <div class="sound-current-row"><span>Ziel</span><span class="sound-pill">${esc(cur.outputTarget || cur.target)}</span></div>
      <div class="sound-current-row"><span>Priorität</span><span>${esc(cur.priority)}</span></div>
      <div class="sound-current-row"><span>Lautstärke</span><span>${esc(cur.volume)}%</span></div>
      <div class="sound-current-row"><span>Unterbrechbar</span><span>${flags.canBeInterrupted ? 'Ja' : 'Nein'}</span></div>
      <div class="sound-current-row"><span>Datei</span><span class="sound-muted">${esc(cur.file)}</span></div>
    `;
  }

  function renderPolicy(){
    const el = document.getElementById('soundPolicyCard');
    if (!el) return;
    const queue = status?.config?.queue || {};
    const priorities = status?.config?.priorities || {};
    const interrupt = queue.interruptRules || {};
    const alertSync = queue.alertSync || {};
    el.innerHTML = `
      <h3>Policy</h3>
      <div class="sound-status-row"><span>Prioritäts-Queue</span><span>${queue.sortByPriority === false ? 'FIFO' : 'Aktiv'}</span></div>
      <div class="sound-status-row"><span>Max. Queue</span><span>${esc(queue.maxLength ?? 50)}</span></div>
      <div class="sound-status-row"><span>Max. Parallel</span><span>${esc(queue.maxParallel ?? 0)}</span></div>
      <div class="sound-status-row"><span>Alert-Priorität</span><span>${esc(priorities.alert ?? 80)}</span></div>
      <div class="sound-status-row"><span>Alert-Sync</span><span>${alertSync.enabled === false ? 'Aus' : 'Vorbereitet'}</span></div>
      <div class="sound-status-row"><span>Interrupt ab</span><span>${esc(interrupt.minPriority ?? 100)}</span></div>
      <div class="sound-note">Normale Alerts sollen laufende Sounds nicht unterbrechen. Sie werden nach Priorität einsortiert und später erst angezeigt, wenn ihr Sound-Item startet.</div>
    `;
  }

  function checked(value){ return value === false ? '' : 'checked'; }
  function numValue(value, fallback){ const n = Number(value); return Number.isFinite(n) ? n : fallback; }

  function renderSettings(){
    const el = document.getElementById('soundSettingsCard');
    if (!el) return;
    const cfg = status?.config || {};
    const out = cfg.output || {};
    const overlay = cfg.overlay || {};
    const queue = cfg.queue || {};
    const targets = out.targets || {};
    const overlayTarget = targets.overlay || {};
    const deviceTarget = targets.device || {};
    const bothTarget = targets.both || {};
    const alertSync = queue.alertSync || {};
    const interruptRules = queue.interruptRules || {};
    const dropRules = queue.dropRules || {};
    const cooldowns = queue.cooldowns || {};
    const dedupe = queue.dedupe || {};
    const priorities = cfg.priorities || {};
    const categoryDefaults = cfg.categoryDefaults || {};
    const cat = key => categoryDefaults[key] || {};
    el.innerHTML = `
      <h3>Einstellungen</h3>
      <div class="sound-note">Diese Werte werden über <code>/api/sound/settings</code> in SQLite gespeichert und beim Neustart wieder geladen.</div>
      <div class="sound-note">Quelle: <strong>${esc(settings?.table || 'sound_settings')}</strong> · Effektive Werte: DB vor JSON-Fallback.</div>

      <div class="sound-settings-grid">
        <div class="sound-settings-title">Ausgabe & Overlay</div>
        <label class="sound-field">
          <span>Overlay-Lautstärke</span>
          <input id="soundSettingsOverlayVolume" type="number" min="0" max="100" value="${esc(numValue(overlayTarget.defaultVolume, 85))}">
        </label>
        <label class="sound-field">
          <span>Device-Lautstärke</span>
          <input id="soundSettingsDeviceVolume" type="number" min="0" max="100" value="${esc(numValue(deviceTarget.defaultVolume, 80))}">
        </label>
        <label class="sound-field">
          <span>Both-Lautstärke</span>
          <input id="soundSettingsBothVolume" type="number" min="0" max="100" value="${esc(numValue(bothTarget.defaultVolume, 85))}">
        </label>
        <label class="sound-field">
          <span>Overlay Fallback-Ende ms</span>
          <input id="soundSettingsFallbackFinishMs" type="number" min="1000" max="120000" value="${esc(numValue(overlay.fallbackFinishMs, 12000))}">
        </label>
        <label class="sound-field">
          <span>Abstand zwischen Sounds ms</span>
          <input id="soundSettingsGapMs" type="number" min="0" max="10000" value="${esc(numValue(overlay.gapBetweenSoundsMs, 750))}">
        </label>

        <div class="sound-settings-title">Queue & Alert-Sync</div>
        <label class="sound-check">
          <input id="soundSettingsQueueEnabled" type="checkbox" ${checked(queue.enabled)}>
          <span>Queue aktiv</span>
        </label>
        <label class="sound-field">
          <span>Max Queue</span>
          <input id="soundSettingsQueueMax" type="number" min="1" max="500" value="${esc(numValue(queue.maxLength, 50))}">
        </label>
        <label class="sound-check">
          <input id="soundSettingsDropWhenFull" type="checkbox" ${checked(queue.dropWhenFull)}>
          <span>Bei voller Queue droppen</span>
        </label>
        <label class="sound-check">
          <input id="soundSettingsSortPriority" type="checkbox" ${checked(queue.sortByPriority)}>
          <span>Nach Priorität sortieren</span>
        </label>
        <label class="sound-check">
          <input id="soundSettingsAllowParallel" type="checkbox" ${checked(queue.allowParallel)}>
          <span>Parallel erlauben</span>
        </label>
        <label class="sound-field">
          <span>Max Parallel</span>
          <input id="soundSettingsMaxParallel" type="number" min="0" max="20" value="${esc(numValue(queue.maxParallel, 3))}">
        </label>
        <label class="sound-check">
          <input id="soundSettingsAlertSyncEnabled" type="checkbox" ${checked(alertSync.enabled)}>
          <span>Alert-Sync aktiv</span>
        </label>
        <label class="sound-field">
          <span>Visual Lead ms</span>
          <input id="soundSettingsVisualLeadMs" type="number" min="0" max="1000" value="${esc(numValue(alertSync.visualLeadMs, 150))}">
        </label>
        <label class="sound-field">
          <span>Max Visual Lead ms</span>
          <input id="soundSettingsMaxVisualLeadMs" type="number" min="0" max="1000" value="${esc(numValue(alertSync.maxVisualLeadMs, 500))}">
        </label>

        <div class="sound-settings-title">Interrupt-Regeln</div>
        <label class="sound-check">
          <input id="soundSettingsInterruptEnabled" type="checkbox" ${checked(interruptRules.enabled)}>
          <span>Interrupt-Regeln aktiv</span>
        </label>
        <label class="sound-field">
          <span>Interrupt ab Priorität</span>
          <input id="soundSettingsInterruptMinPriority" type="number" min="0" max="200" value="${esc(numValue(interruptRules.minPriority, 100))}">
        </label>
        <label class="sound-check">
          <input id="soundSettingsInterruptRequireHigher" type="checkbox" ${checked(interruptRules.requireHigherPriority)}>
          <span>Nur bei höherer Priorität</span>
        </label>
        <label class="sound-check">
          <input id="soundSettingsInterruptAllowForce" type="checkbox" ${checked(interruptRules.allowForce)}>
          <span>Force erlauben</span>
        </label>
        <label class="sound-check">
          <input id="soundSettingsInterruptAllowOverride" type="checkbox" ${checked(interruptRules.allowOverride)}>
          <span>Override erlauben</span>
        </label>

        <div class="sound-settings-title">Drop-Regeln</div>
        <label class="sound-check">
          <input id="soundSettingsDropRulesEnabled" type="checkbox" ${checked(dropRules.enabled)}>
          <span>Drop-Regeln aktiv</span>
        </label>
        <label class="sound-field">
          <span>Bei voller Queue droppen bis Priorität</span>
          <input id="soundSettingsDropQueueFullBelow" type="number" min="0" max="200" value="${esc(numValue(dropRules.dropIfQueueFullBelowPriority, 40))}">
        </label>
        <label class="sound-field">
          <span>Bei Busy droppen bis Priorität</span>
          <input id="soundSettingsDropBusyBelow" type="number" min="0" max="200" value="${esc(numValue(dropRules.dropIfBusyBelowPriority, 20))}">
        </label>

        <div class="sound-settings-title">Cooldowns & Dedupe</div>
        <label class="sound-check">
          <input id="soundSettingsCooldownsEnabled" type="checkbox" ${checked(cooldowns.enabled)}>
          <span>Cooldowns aktiv</span>
        </label>
        <label class="sound-field">
          <span>Default Cooldown ms</span>
          <input id="soundSettingsCooldownDefault" type="number" min="0" max="3600000" value="${esc(numValue(cooldowns.defaultMs, 0))}">
        </label>
        <label class="sound-field">
          <span>Gleicher Sound ms</span>
          <input id="soundSettingsCooldownSameSound" type="number" min="0" max="3600000" value="${esc(numValue(cooldowns.sameSoundMs, 3000))}">
        </label>
        <label class="sound-field">
          <span>Gleiche Kategorie ms</span>
          <input id="soundSettingsCooldownSameCategory" type="number" min="0" max="3600000" value="${esc(numValue(cooldowns.sameCategoryMs, 0))}">
        </label>
        <label class="sound-field">
          <span>Gleicher User ms</span>
          <input id="soundSettingsCooldownSameUser" type="number" min="0" max="3600000" value="${esc(numValue(cooldowns.sameUserMs, 0))}">
        </label>
        <label class="sound-check">
          <input id="soundSettingsDedupeEnabled" type="checkbox" ${checked(dedupe.enabled)}>
          <span>Dedupe aktiv</span>
        </label>
        <label class="sound-field">
          <span>Dedupe gleicher Sound ms</span>
          <input id="soundSettingsDedupeSameSound" type="number" min="0" max="3600000" value="${esc(numValue(dedupe.sameSoundWindowMs, 3000))}">
        </label>
        <label class="sound-field">
          <span>Dedupe User+Sound ms</span>
          <input id="soundSettingsDedupeSameUserSound" type="number" min="0" max="3600000" value="${esc(numValue(dedupe.sameUserSoundWindowMs, 5000))}">
        </label>

        <div class="sound-settings-title">Prioritäten</div>
        ${priorityField('Admin', 'soundPriorityAdmin', priorities.admin, 100)}
        ${priorityField('System', 'soundPrioritySystem', priorities.system, 100)}
        ${priorityField('Kritischer Alert', 'soundPriorityAlertCritical', priorities.alert_critical, 90)}
        ${priorityField('Alert', 'soundPriorityAlert', priorities.alert, 80)}
        ${priorityField('Channel Reward', 'soundPriorityChannelReward', priorities.channel_reward, 70)}
        ${priorityField('VIP', 'soundPriorityVip', priorities.vip, 60)}
        ${priorityField('Crew', 'soundPriorityCrew', priorities.crew, 60)}
        ${priorityField('Special', 'soundPrioritySpecial', priorities.special, 60)}
        ${priorityField('TTS', 'soundPriorityTts', priorities.tts, 50)}
        ${priorityField('Fun', 'soundPriorityFun', priorities.fun, 50)}
        ${priorityField('Background', 'soundPriorityBackground', priorities.background, 20)}
        ${priorityField('Decor', 'soundPriorityDecor', priorities.decor, 20)}

        <div class="sound-settings-title">Kategorie-Defaults</div>
        ${categoryRow('Alert', 'Alert', 'soundCatAlert', cat('alert'), 80)}
        ${categoryRow('Kritischer Alert', 'AlertCritical', 'soundCatAlertCritical', cat('alert_critical'), 90)}
        ${categoryRow('Admin', 'Admin', 'soundCatAdmin', cat('admin'), 100)}
        ${categoryRow('System', 'System', 'soundCatSystem', cat('system'), 100)}
        ${categoryRow('VIP', 'Vip', 'soundCatVip', cat('vip'), 60)}
        ${categoryRow('Fun', 'Fun', 'soundCatFun', cat('fun'), 50)}
        ${categoryRow('Background', 'Background', 'soundCatBackground', cat('background'), 20)}
      </div>

      <div class="sound-actions">
        ${button('Settings speichern', 'save-settings', 'success')}
        ${button('Settings neu laden', 'reload-settings')}
      </div>
      <div class="sound-note">Änderungen werden in SQLite gespeichert. Technische Pfade und Sound-Bibliothek kommen später in einen Expertenbereich.</div>
    `;
  }

  function priorityField(label, id, value, fallback){
    return `
      <label class="sound-field">
        <span>${esc(label)}</span>
        <input id="${esc(id)}" type="number" min="0" max="200" value="${esc(numValue(value, fallback))}">
      </label>
    `;
  }

  function categoryRow(label, suffix, prefix, data, fallbackPriority){
    const canInterrupt = data.canInterrupt === true;
    const canBeInterrupted = data.canBeInterrupted !== false;
    const queueIfBusy = data.queueIfBusy !== false;
    const dropIfBusy = data.dropIfBusy === true;
    const parallelAllowed = data.parallelAllowed === true;
    return `
      <div class="sound-category-row">
        <label class="sound-field">
          <span>${esc(label)} Priorität</span>
          <input id="${esc(prefix)}Priority" type="number" min="0" max="200" value="${esc(numValue(data.priority, fallbackPriority))}">
        </label>
        <label class="sound-check"><input id="${esc(prefix)}CanInterrupt" type="checkbox" ${canInterrupt ? 'checked' : ''}><span>Interrupt</span></label>
        <label class="sound-check"><input id="${esc(prefix)}CanBeInterrupted" type="checkbox" ${canBeInterrupted ? 'checked' : ''}><span>unterbrechbar</span></label>
        <label class="sound-check"><input id="${esc(prefix)}QueueIfBusy" type="checkbox" ${queueIfBusy ? 'checked' : ''}><span>Queue wenn busy</span></label>
        <label class="sound-check"><input id="${esc(prefix)}DropIfBusy" type="checkbox" ${dropIfBusy ? 'checked' : ''}><span>Drop wenn busy</span></label>
        <label class="sound-check"><input id="${esc(prefix)}ParallelAllowed" type="checkbox" ${parallelAllowed ? 'checked' : ''}><span>Parallel</span></label>
      </div>
    `;
  }
  function readNumber(id, fallback, min, max){
    const el = document.getElementById(id);
    const n = Number(el?.value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
  }

  function readBool(id, fallback){
    const el = document.getElementById(id);
    if (!el) return fallback;
    return !!el.checked;
  }

  async function saveRuntimeSettings(){
    const cfg = status?.config || {};
    const out = cfg.output || {};
    const targets = out.targets || {};
    const overlay = cfg.overlay || {};
    const queue = cfg.queue || {};
    const alertSync = queue.alertSync || {};
    const interruptRules = queue.interruptRules || {};
    const dropRules = queue.dropRules || {};
    const cooldowns = queue.cooldowns || {};
    const dedupe = queue.dedupe || {};
    const categoryDefaults = cfg.categoryDefaults || {};
    const cat = key => categoryDefaults[key] || {};

    function readCategory(prefix, data, fallbackPriority){
      return {
        ...(data || {}),
        priority: readNumber(`${prefix}Priority`, data?.priority ?? fallbackPriority, 0, 200),
        canInterrupt: readBool(`${prefix}CanInterrupt`, data?.canInterrupt === true),
        canBeInterrupted: readBool(`${prefix}CanBeInterrupted`, data?.canBeInterrupted !== false),
        queueIfBusy: readBool(`${prefix}QueueIfBusy`, data?.queueIfBusy !== false),
        dropIfBusy: readBool(`${prefix}DropIfBusy`, data?.dropIfBusy === true),
        parallelAllowed: readBool(`${prefix}ParallelAllowed`, data?.parallelAllowed === true)
      };
    }

    const payload = {
      output: {
        targets: {
          overlay: {
            defaultVolume: readNumber('soundSettingsOverlayVolume', targets.overlay?.defaultVolume ?? 85, 0, 100)
          },
          device: {
            defaultVolume: readNumber('soundSettingsDeviceVolume', targets.device?.defaultVolume ?? 80, 0, 100)
          },
          both: {
            defaultVolume: readNumber('soundSettingsBothVolume', targets.both?.defaultVolume ?? 85, 0, 100)
          }
        }
      },
      overlay: {
        fallbackFinishMs: readNumber('soundSettingsFallbackFinishMs', overlay.fallbackFinishMs ?? 12000, 1000, 120000),
        gapBetweenSoundsMs: readNumber('soundSettingsGapMs', overlay.gapBetweenSoundsMs ?? 750, 0, 10000)
      },
      queue: {
        enabled: readBool('soundSettingsQueueEnabled', queue.enabled !== false),
        maxLength: readNumber('soundSettingsQueueMax', queue.maxLength ?? 50, 1, 500),
        dropWhenFull: readBool('soundSettingsDropWhenFull', queue.dropWhenFull !== false),
        sortByPriority: readBool('soundSettingsSortPriority', queue.sortByPriority !== false),
        allowParallel: readBool('soundSettingsAllowParallel', queue.allowParallel !== false),
        maxParallel: readNumber('soundSettingsMaxParallel', queue.maxParallel ?? 3, 0, 20),
        alertSync: {
          ...(alertSync || {}),
          enabled: readBool('soundSettingsAlertSyncEnabled', alertSync.enabled !== false),
          visualLeadMs: readNumber('soundSettingsVisualLeadMs', alertSync.visualLeadMs ?? 150, 0, 1000),
          maxVisualLeadMs: readNumber('soundSettingsMaxVisualLeadMs', alertSync.maxVisualLeadMs ?? 500, 0, 1000)
        },
        interruptRules: {
          ...(interruptRules || {}),
          enabled: readBool('soundSettingsInterruptEnabled', interruptRules.enabled !== false),
          minPriority: readNumber('soundSettingsInterruptMinPriority', interruptRules.minPriority ?? 100, 0, 200),
          requireHigherPriority: readBool('soundSettingsInterruptRequireHigher', interruptRules.requireHigherPriority !== false),
          allowForce: readBool('soundSettingsInterruptAllowForce', interruptRules.allowForce !== false),
          allowOverride: readBool('soundSettingsInterruptAllowOverride', interruptRules.allowOverride === true)
        },
        dropRules: {
          ...(dropRules || {}),
          enabled: readBool('soundSettingsDropRulesEnabled', dropRules.enabled !== false),
          dropIfQueueFullBelowPriority: readNumber('soundSettingsDropQueueFullBelow', dropRules.dropIfQueueFullBelowPriority ?? 40, 0, 200),
          dropIfBusyBelowPriority: readNumber('soundSettingsDropBusyBelow', dropRules.dropIfBusyBelowPriority ?? 20, 0, 200)
        },
        cooldowns: {
          ...(cooldowns || {}),
          enabled: readBool('soundSettingsCooldownsEnabled', cooldowns.enabled !== false),
          defaultMs: readNumber('soundSettingsCooldownDefault', cooldowns.defaultMs ?? 0, 0, 3600000),
          sameSoundMs: readNumber('soundSettingsCooldownSameSound', cooldowns.sameSoundMs ?? 3000, 0, 3600000),
          sameCategoryMs: readNumber('soundSettingsCooldownSameCategory', cooldowns.sameCategoryMs ?? 0, 0, 3600000),
          sameUserMs: readNumber('soundSettingsCooldownSameUser', cooldowns.sameUserMs ?? 0, 0, 3600000)
        },
        dedupe: {
          ...(dedupe || {}),
          enabled: readBool('soundSettingsDedupeEnabled', dedupe.enabled !== false),
          sameSoundWindowMs: readNumber('soundSettingsDedupeSameSound', dedupe.sameSoundWindowMs ?? 3000, 0, 3600000),
          sameUserSoundWindowMs: readNumber('soundSettingsDedupeSameUserSound', dedupe.sameUserSoundWindowMs ?? 5000, 0, 3600000)
        }
      },
      priorities: {
        admin: readNumber('soundPriorityAdmin', cfg.priorities?.admin ?? 100, 0, 200),
        system: readNumber('soundPrioritySystem', cfg.priorities?.system ?? 100, 0, 200),
        alert_critical: readNumber('soundPriorityAlertCritical', cfg.priorities?.alert_critical ?? 90, 0, 200),
        alert: readNumber('soundPriorityAlert', cfg.priorities?.alert ?? 80, 0, 200),
        channel_reward: readNumber('soundPriorityChannelReward', cfg.priorities?.channel_reward ?? 70, 0, 200),
        vip: readNumber('soundPriorityVip', cfg.priorities?.vip ?? 60, 0, 200),
        crew: readNumber('soundPriorityCrew', cfg.priorities?.crew ?? 60, 0, 200),
        special: readNumber('soundPrioritySpecial', cfg.priorities?.special ?? 60, 0, 200),
        tts: readNumber('soundPriorityTts', cfg.priorities?.tts ?? 50, 0, 200),
        fun: readNumber('soundPriorityFun', cfg.priorities?.fun ?? 50, 0, 200),
        background: readNumber('soundPriorityBackground', cfg.priorities?.background ?? 20, 0, 200),
        decor: readNumber('soundPriorityDecor', cfg.priorities?.decor ?? 20, 0, 200)
      },
      categoryDefaults: {
        alert: readCategory('soundCatAlert', cat('alert'), 80),
        alert_critical: readCategory('soundCatAlertCritical', cat('alert_critical'), 90),
        admin: readCategory('soundCatAdmin', cat('admin'), 100),
        system: readCategory('soundCatSystem', cat('system'), 100),
        vip: readCategory('soundCatVip', cat('vip'), 60),
        fun: readCategory('soundCatFun', cat('fun'), 50),
        background: readCategory('soundCatBackground', cat('background'), 20)
      }
    };

    settings = await api('/settings', { method: 'POST', body: JSON.stringify(payload) });
    await api('/reload', { method: 'POST', body: '{}' });
    lastSaveInfo = {
      sentDefaultTarget: 'runtime-settings',
      savedDefaultTarget: settings?.effective?.output?.defaultTarget || status?.config?.output?.defaultTarget || ''
    };
  }
  function renderSounds(){
    const el = document.getElementById('soundList');
    if (!el) return;
    const sounds = Array.isArray(status?.sounds) ? status.sounds : [];
    if (!sounds.length) { el.innerHTML = `<div class="sound-empty">Keine Sounds in der Config eingetragen.</div>`; return; }
    el.innerHTML = sounds.map(sound => `
      <div class="sound-sound-row">
        <div class="sound-sound-main">
          <div class="sound-sound-title">${esc(sound.label || sound.id)}</div>
          <div class="sound-sound-meta">${esc(sound.id)} · ${esc(sound.category || 'ohne Kategorie')} · ${esc(sound.source || 'config')} · ${esc(sound.file || sound.type || '')}</div>
        </div>
        <div class="sound-mini-actions">
          <span class="sound-pill">${esc(sound.outputTarget || sound.target || '')}</span>
          <span class="sound-pill">Prio ${esc(sound.priority ?? '')}</span>
          <button type="button" data-sound-play="${esc(sound.id)}">Play</button>
        </div>
      </div>
    `).join('');
  }

  function renderQueue(){
    const el = document.getElementById('soundQueue');
    if (!el) return;
    const queue = Array.isArray(status?.queue) ? status.queue : [];
    if (!queue.length) { el.innerHTML = `<div class="sound-empty">Queue ist leer.</div>`; return; }
    el.innerHTML = queue.map((item, index) => `
      <div class="sound-queue-row">
        <div class="sound-queue-main">
          <div class="sound-queue-title">#${index + 1} ${esc(item.label || item.soundId)}</div>
          <div class="sound-queue-meta">${esc(item.category || '-')} · ${esc(item.source || 'manual')} · Priorität ${esc(item.priority)} · ${esc(item.file)}</div>
        </div>
        <div class="sound-mini-actions">
          <span class="sound-pill">${esc(item.outputTarget || item.target)}</span>
          <span class="sound-pill">${esc(item.volume)}%</span>
        </div>
      </div>
    `).join('');
  }

  function renderIntegration(){
    const el = document.getElementById('soundIntegrationCard');
    if (!el) return;
    const check = integrationCheck || {};
    const checks = check.checks || {};
    const sources = check.sources || {};
    const warnings = Array.isArray(check.warnings) ? check.warnings : [];
    const errors = Array.isArray(check.errors) ? check.errors : [];
    const routes = Array.isArray(routesInfo?.routes) ? routesInfo.routes : [];
    const routeCount = routes.length;
    const statusLabel = check.healthy === true ? 'Gesund' : (check.ok ? 'Auffällig' : 'Nicht geprüft');
    const statusClass = check.healthy === true ? 'success' : (errors.length ? 'danger' : '');

    el.innerHTML = `
      <h3>Diagnose</h3>
      <div class="sound-status-row"><span>Integration</span><span class="sound-pill ${statusClass}">${esc(statusLabel)}</span></div>
      <div class="sound-status-row"><span>Overlay-Client</span><span>${checks.clientConnected ? 'Verbunden' : 'Nicht verbunden'}</span></div>
      <div class="sound-status-row"><span>DB-Settings</span><span>${checks.dbSettingsOk ? 'OK' : 'Nicht OK'}${Number.isFinite(Number(checks.dbSettingsCount)) ? ' · ' + Number(checks.dbSettingsCount) + ' Blöcke' : ''}</span></div>
      <div class="sound-status-row"><span>JSON-Fallback</span><span>${checks.jsonConfigOk ? 'OK' : 'Fehler'}</span></div>
      <div class="sound-status-row"><span>AudioDeviceHelper</span><span>${checks.helperConfigured ? (checks.helperExists ? 'Vorhanden' : 'Fehlt') : 'Nicht konfiguriert'}</span></div>
      <div class="sound-status-row"><span>Sound-Ordner</span><span>${checks.soundsBaseDirExists ? 'Vorhanden' : 'Fehlt'}</span></div>
      <div class="sound-status-row"><span>Video-Formate</span><span>${checks.hasMp4 ? 'MP4' : '-'} / ${checks.hasWebm ? 'WebM' : '-'}</span></div>
      <div class="sound-status-row"><span>Routen</span><span>${routeCount || '-'}</span></div>
      <div class="sound-status-row"><span>Regel</span><span class="sound-muted">${esc(sources.rule || 'database_over_json_fallback_for_allowed_blocks')}</span></div>
      ${warnings.length ? `<div class="sound-diagnostic-list"><strong>Hinweise</strong>${warnings.map(w => `<div>⚠ ${esc(w)}</div>`).join('')}</div>` : ''}
      ${errors.length ? `<div class="sound-diagnostic-list danger"><strong>Fehler</strong>${errors.map(e => `<div>✖ ${esc(e)}</div>`).join('')}</div>` : ''}
      <div class="sound-note">Hinweis: <code>output.targets</code> ist das aktive Ausgabezielmodell. <code>targets</code> bleibt Legacy/Kompatibilität und wird nicht entfernt.</div>
      <div class="sound-actions">
        ${button('Diagnose neu laden', 'reload-diagnose')}
      </div>
    `;
  }

  async function saveOutput(){
    const select = document.getElementById('soundDeviceSelect');
    const option = select?.selectedOptions?.[0];
    const selectedDeviceId = select?.value || 'default';
    const selectedDeviceName = option?.dataset?.name || option?.textContent || 'Windows Standardgerät';
    const mode = document.getElementById('soundDefaultTarget')?.value || 'overlay';
    const flags = modeFlags(mode);

    const payload = {
      defaultTarget: mode,
      overlay: { enabled: flags.overlay },
      device: {
        enabled: flags.device,
        selectedDeviceId,
        selectedDeviceName,
        defaultVolume: Number(document.getElementById('soundDeviceVolume')?.value || 80)
      },
      both: { enabled: flags.both }
    };

    const saved = await api('/output', { method: 'POST', body: JSON.stringify(payload) });
    await api('/reload', { method: 'POST', body: '{}' });
    const fresh = await api('/status');
    const savedOut = fresh?.config?.output || saved?.output || {};
    lastSaveInfo = {
      sentDefaultTarget: payload.defaultTarget,
      savedDefaultTarget: savedOut.defaultTarget || ''
    };
  }


  function applySoundSection(){
    if (!root) return;

    root.querySelectorAll('[data-sound-tab]').forEach(btn => {
      const isActive = btn.dataset.soundTab === activeSection;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    root.querySelectorAll('[data-sound-section]').forEach(el => {
      const sections = String(el.dataset.soundSection || '').split(/\s+/).filter(Boolean);
      el.hidden = !sections.includes(activeSection);
    });
  }
  function bindActions(){
    if (!root || actionsBound) return;
    actionsBound = true;
    root.addEventListener('click', async (event) => {
      const tabBtn = event.target.closest('[data-sound-tab]');
      if (tabBtn) {
        activeSection = tabBtn.dataset.soundTab || 'overview';
        applySoundSection();
        return;
      }
      const actionBtn = event.target.closest('[data-sound-action]');
      const playBtn = event.target.closest('[data-sound-play]');
      if (!actionBtn && !playBtn) return;
      try {
        if (playBtn) {
          await api('/play', { method: 'POST', body: JSON.stringify({ soundId: playBtn.dataset.soundPlay, source: 'dashboard', override: true }) });
        } else {
          const action = actionBtn.dataset.soundAction;
          if (action === 'reload') await api('/reload', { method: 'POST', body: '{}' });
          if (action === 'stop') await api('/stop', { method: 'POST', body: '{}' });
          if (action === 'skip') await api('/skip', { method: 'POST', body: '{}' });
          if (action === 'clear') await api('/clear', { method: 'POST', body: '{}' });
          if (action === 'save-output') await saveOutput();
          if (action === 'reload-devices') devices = await api('/devices');
          if (action === 'reload-settings') settings = await api('/settings');
          if (action === 'reload-diagnose') { integrationCheck = await api('/integration-check'); routesInfo = await api('/routes'); }
          if (action === 'save-settings') await saveRuntimeSettings();
          if (action === 'test-output') await api('/play?file=opa01.mp3&outputTarget=device&volume=100', { method: 'GET' });
        }
        await loadAll(true);
      } catch (err) { alert(err.message || String(err)); }
    });
  }

  async function loadAll(force){
    if (loading && !force) return;
    loading = true;
    try {
      const state = await api('/status');
      const list = await api('/list');
      const dev = await api('/devices');
      const set = await api('/settings');
      let check = null;
      let routes = null;
      try { check = await api('/integration-check'); } catch (_) { check = { ok: false, healthy: false, warnings: ['integration_check_unavailable'], errors: [] }; }
      try { routes = await api('/routes'); } catch (_) { routes = { ok: false, routes: [] }; }
      status = { ...state, sounds: list.sounds || [] };
      output = { output: state?.config?.output || {} };
      devices = dev;
      settings = set;
      integrationCheck = check;
      routesInfo = routes;
      render();
    } catch (err) {
      if (root) root.innerHTML = `<div class="sound-card"><h2>Sound-System</h2><div class="sound-empty">${esc(err.message || err)}</div></div>`;
    } finally { loading = false; }
  }

  function mount(){
    root = document.getElementById('soundModule');
    if (!root) return;
    renderShell();
    bindActions();
    loadAll(true);
  }
  window.addEventListener('cgn:module-show', (event) => { if (event.detail?.module === 'sound_system') loadAll(true); });
  document.addEventListener('DOMContentLoaded', mount);
  if (document.readyState !== 'loading') mount();

  return { loadAll };
})();



