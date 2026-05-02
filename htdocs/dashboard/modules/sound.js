window.SoundSystemModule = (function(){
  'use strict';

  const API = '/api/sound';
  let root = null;
  let status = null;
  let output = null;
  let devices = [];
  let loading = false;
  let lastSaveInfo = null;
  let actionsBound = false;

  function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? ''); }
  async function api(path, options){ return window.CGN.api(API + path, options || {}); }
  function button(label, action, extraClass){ return `<button type="button" class="${extraClass || ''}" data-sound-action="${esc(action)}">${esc(label)}</button>`; }
  function activeLabel(value){ return value ? 'Aktiv' : 'Inaktiv'; }

  function renderShell(){
    if (!root) return;
    root.innerHTML = `
      <div class="sound-card">
        <h2>Sound-System</h2>
        <div class="sound-note">Zentrale Grundlage für Stream-Sounds, Queue, Prioritäten, Ausgabeziele und spätere Discord-Ausgabe. Bestehende Systeme werden später einzeln angebunden.</div>
        <div class="sound-actions">
          ${button('Neu laden', 'reload')}
          ${button('Stop', 'stop')}
          ${button('Skip', 'skip')}
          ${button('Queue leeren', 'clear')}
          <a class="ghost-link" href="/overlays/sound_system_overlay.html?debug=1" target="_blank">Overlay öffnen</a>
        </div>
      </div>
      <div class="sound-grid">
        <div class="sound-card" id="soundStatusCard"></div>
        <div class="sound-card" id="soundOutputCard"></div>
        <div class="sound-card" id="soundCurrentCard"></div>
        <div class="sound-card">
          <h3>Sound-Liste</h3>
          <div id="soundList" class="sound-list"></div>
        </div>
        <div class="sound-card">
          <h3>Queue</h3>
          <div id="soundQueue" class="sound-queue"></div>
        </div>
      </div>
    `;
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
    renderSounds();
    renderQueue();
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
      <div class="sound-status-row"><span>Overlay</span><span>${status?.client?.connected ? 'Verbunden' : 'Nicht verbunden'}</span></div>
      <div class="sound-status-row"><span>Config</span><span>${cfg.ok ? 'OK' : 'Fehler'}</span></div>
      <div class="sound-note">Config: ${esc(cfg.path || '')}</div>
    `;
  }

  function getOutputState(){
    return status?.config?.output || output?.output || {};
  }

  function renderOutput(){
    const el = document.getElementById('soundOutputCard');
    if (!el) return;
    const out = getOutputState();
    const targets = out.targets || {};
    const overlay = targets.overlay || {};
    const device = targets.device || {};
    const both = targets.both || {};
    const helperWarning = devices?.warning && devices.warning !== 'helper' ? `<div class="sound-note">Gerätequelle: ${esc(devices.warning)}${devices.error ? ' · ' + esc(devices.error) : ''}</div>` : '';
    const deviceList = Array.isArray(devices?.devices) ? devices.devices : [];
    const selectedId = device.selectedDeviceId || 'default';
    const selectedMissing = selectedId && !deviceList.some(d => String(d.id) === String(selectedId));
    const saveInfo = lastSaveInfo ? `
      <div class="sound-note">
        Letztes Speichern: gesendet <strong>${esc(lastSaveInfo.sentDefaultTarget)}</strong>, gespeichert <strong>${esc(lastSaveInfo.savedDefaultTarget)}</strong> ·
        Overlay ${esc(activeLabel(lastSaveInfo.savedOverlay))} · Audiogerät ${esc(activeLabel(lastSaveInfo.savedDevice))} · Beides ${esc(activeLabel(lastSaveInfo.savedBoth))}
      </div>
    ` : '';

    el.innerHTML = `
      <h3>Ausgabe</h3>
      <label class="sound-field">
        <span>Standard-Ausgabe</span>
        <select id="soundDefaultTarget">
          <option value="overlay" ${out.defaultTarget === 'overlay' ? 'selected' : ''}>Overlay / OBS</option>
          <option value="device" ${out.defaultTarget === 'device' ? 'selected' : ''}>Audiogerät</option>
          <option value="both" ${out.defaultTarget === 'both' ? 'selected' : ''}>Beides</option>
        </select>
      </label>
      <div class="sound-status-row"><span>Overlay</span><label><input id="soundOverlayEnabled" type="checkbox" ${overlay.enabled !== false ? 'checked' : ''}> ${esc(activeLabel(overlay.enabled !== false))}</label></div>
      <div class="sound-status-row"><span>Audiogerät</span><label><input id="soundDeviceEnabled" type="checkbox" ${device.enabled === true ? 'checked' : ''}> ${esc(activeLabel(device.enabled === true))}</label></div>
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
      <div class="sound-status-row"><span>Beides</span><label><input id="soundBothEnabled" type="checkbox" ${both.enabled === true ? 'checked' : ''}> ${esc(activeLabel(both.enabled === true))}</label></div>
      <div class="sound-actions">
        ${button('Ausgabe speichern', 'save-output')}
        ${button('Geräte neu laden', 'reload-devices')}
        ${button('Test Ausgabe', 'test-output')}
      </div>
      <div class="sound-note">Direkte Audiogerät-Ausgabe läuft über den lokalen AudioDeviceHelper. Anzeige kommt aus /api/sound/status → config.output.</div>
      ${saveInfo}
      ${helperWarning}
    `;
  }

  function renderCurrent(){
    const el = document.getElementById('soundCurrentCard');
    if (!el) return;
    const cur = status?.current;
    if (!cur) { el.innerHTML = `<h3>Aktuell</h3><div class="sound-empty">Gerade läuft kein Sound.</div>`; return; }
    el.innerHTML = `
      <h3>Aktuell</h3>
      <div class="sound-current-row"><span>Name</span><strong>${esc(cur.label || cur.soundId)}</strong></div>
      <div class="sound-current-row"><span>Ziel</span><span class="sound-pill">${esc(cur.target)}</span></div>
      <div class="sound-current-row"><span>Priorität</span><span>${esc(cur.priority)}</span></div>
      <div class="sound-current-row"><span>Lautstärke</span><span>${esc(cur.volume)}%</span></div>
      <div class="sound-current-row"><span>Datei</span><span class="sound-muted">${esc(cur.file)}</span></div>
    `;
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
          <div class="sound-sound-meta">${esc(sound.id)} · ${esc(sound.category || 'ohne Kategorie')} · ${esc(sound.file || sound.type || '')}</div>
        </div>
        <div class="sound-mini-actions">
          <span class="sound-pill">${esc(sound.outputTarget || sound.target || '')}</span>
          <span class="sound-pill">${esc(sound.priority ?? '')}</span>
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
          <div class="sound-queue-meta">${esc(item.target)} · Priorität ${esc(item.priority)} · ${esc(item.file)}</div>
        </div>
        <span class="sound-pill">${esc(item.volume)}%</span>
      </div>
    `).join('');
  }

  async function saveOutput(){
    const select = document.getElementById('soundDeviceSelect');
    const option = select?.selectedOptions?.[0];
    const selectedDeviceId = select?.value || 'default';
    const selectedDeviceName = option?.dataset?.name || option?.textContent || 'Windows Standardgerät';

    const payload = {
      defaultTarget: document.getElementById('soundDefaultTarget')?.value || 'overlay',
      overlay: { enabled: !!document.getElementById('soundOverlayEnabled')?.checked },
      device: {
        enabled: !!document.getElementById('soundDeviceEnabled')?.checked,
        selectedDeviceId,
        selectedDeviceName,
        defaultVolume: Number(document.getElementById('soundDeviceVolume')?.value || 80)
      },
      both: { enabled: !!document.getElementById('soundBothEnabled')?.checked }
    };

    const saved = await api('/output', { method: 'POST', body: JSON.stringify(payload) });
    await api('/reload', { method: 'POST', body: '{}' });
    const fresh = await api('/status');
    const savedOut = fresh?.config?.output || saved?.output || {};
    lastSaveInfo = {
      sentDefaultTarget: payload.defaultTarget,
      savedDefaultTarget: savedOut.defaultTarget || '',
      savedOverlay: savedOut.targets?.overlay?.enabled !== false,
      savedDevice: savedOut.targets?.device?.enabled === true,
      savedBoth: savedOut.targets?.both?.enabled === true
    };
  }

  function bindActions(){
    if (!root || actionsBound) return;
    actionsBound = true;
    root.addEventListener('click', async (event) => {
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
      status = { ...state, sounds: list.sounds || [] };
      output = { output: state?.config?.output || {} };
      devices = dev;
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
