window.CommandsMediaBridge = (function(){
  'use strict';

  const api = {
    audio: '/api/commands/media-options?type=audio&status=active&limit=500',
    video: '/api/commands/media-options?type=video,animation&status=active&limit=500',
    status: '/api/commands/media-bridge/status',
    soundBridgeStatus: '/api/sound/media-bridge/status',
    commandCheck: '/api/commands/media-command-check'
  };

  const state = {
    loaded: false,
    loading: false,
    audio: [],
    video: [],
    error: ''
  };

  let observer = null;
  let injectTimer = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }


  // STEP274L-FIX2:
  // Sicherheitsnetz direkt vor /api/commands/upsert.
  // Grund: Die eigentliche Commands-Speicherlogik liegt in commands.js und ist gekapselt.
  // Die Media-Picker-UI darf sich nicht darauf verlassen, dass nachtraeglich gesetzte
  // Router-Felder im DOM immer rechtzeitig gespeichert werden.
  // Deshalb normalisieren wir jeden gespeicherten sound_play/video_play Command hier
  // unmittelbar vor dem API-Request.
  function installCommandUpsertGuard() {
    if (window.__cgnCommandsMediaUpsertGuardInstalled) return;
    if (typeof window.fetch !== 'function') return;
    window.__cgnCommandsMediaUpsertGuardInstalled = true;

    const originalFetch = window.fetch.bind(window);
    window.fetch = function guardedFetch(input, init) {
      try {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        const method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
        if (method === 'POST' && String(url).includes('/api/commands/upsert') && init && typeof init.body === 'string') {
          const payload = JSON.parse(init.body);
          const cfg = payload && payload.config && typeof payload.config === 'object' ? payload.config : {};
          const actionType = String(cfg.actionType || '').trim();
          const mediaId = String(cfg.mediaId || '').trim();
          if ((actionType === 'sound_play' || actionType === 'video_play') && mediaId) {
            payload.moduleKey = 'sound_media_bridge';
            payload.actionKey = actionType === 'video_play' ? 'play_video_media' : 'play_audio_media';
            payload.targetMethod = 'POST';
            payload.targetUrl = `/api/sound/play-media?mediaId=${encodeURIComponent(mediaId)}`;
            payload.responseMode = 'module';
            if (actionType === 'sound_play' && cfg.queue !== false) cfg.queue = true;
            payload.config = cfg;
            init = { ...init, body: JSON.stringify(payload) };
          }
        }
      } catch (_) {}
      return originalFetch(input, init);
    };
  }

  async function loadOptions(force) {
    if (state.loading) return;
    if (state.loaded && !force) return;
    if (!window.CGN) return;
    state.loading = true;
    state.error = '';
    try {
      const [audio, video] = await Promise.all([
        window.CGN.api(api.audio),
        window.CGN.api(api.video)
      ]);
      state.audio = Array.isArray(audio.options) ? audio.options : [];
      state.video = Array.isArray(video.options) ? video.options : [];
      state.loaded = true;
    } catch (err) {
      state.error = err.message || String(err);
    } finally {
      state.loading = false;
    }
  }

  function mediaById(id, type) {
    const list = type === 'video' ? state.video : state.audio;
    const cleanId = String(id || '').trim();
    return list.find(item => String(item.id) === cleanId) || null;
  }

  function optionLabel(item) {
    if (!item) return '';
    const bits = [];
    bits.push(item.label || item.fileName || item.relativePath || `#${item.id}`);
    if (item.moduleKey || item.categoryKey || item.category) bits.push(`[${item.moduleKey || 'general'}/${item.categoryKey || item.category || 'general'}]`);
    if (item.relativePath) bits.push(`– ${item.relativePath}`);
    return bits.join(' ');
  }

  function selectedLabel(currentValue, type) {
    const item = mediaById(currentValue, type);
    if (item) return optionLabel(item);
    return currentValue ? `Aktuell: #${currentValue}` : 'Noch kein Medium ausgewählt.';
  }

  function buildPickerField(fieldName, currentValue, type) {
    const isVideo = type === 'video';
    const allowedTypes = isVideo ? ['video', 'animation'] : ['audio'];
    const title = isVideo ? 'Video/Animation' : 'Sound';
    return `
      <input type="hidden" data-cmd-field="${esc(fieldName)}" data-commands-media-input="${esc(fieldName)}" value="${esc(currentValue || '')}">
      <div class="cmd-media-picker-row" data-commands-media-picker="${esc(fieldName)}" data-commands-media-type="${esc(type)}">
        <button type="button" class="cmd-media-picker-btn" data-commands-media-pick="${esc(fieldName)}" data-commands-media-type="${esc(type)}" data-commands-media-allowed="${esc(allowedTypes.join(','))}">Medium auswählen</button>
        <span class="cmd-media-current" data-commands-media-current="${esc(fieldName)}">${esc(selectedLabel(currentValue, type))}</span>
      </div>
      <small class="cmd-media-hint">${esc(title)} wird über die zentrale Medienverwaltung gewählt. Gespeichert wird die Media-ID; beim Speichern setzt STEP274L automatisch /api/sound/play-media?mediaId=<id>.</small>`;
  }

  function replaceMediaInput(root, fieldName, type) {
    const field = root.querySelector(`[data-cmd-field="${fieldName}"]`);
    if (!field || field.dataset.commandsMediaInput === fieldName) return false;
    const label = field.closest('label');
    if (!label) return false;
    const currentValue = field.value || '';
    const title = label.childNodes && label.childNodes[0] ? String(label.childNodes[0].textContent || '').trim() : 'Medium-ID';
    label.classList.add('cmd-media-picker-label');
    label.innerHTML = `${esc(title)}${buildPickerField(fieldName, currentValue, type)}`;
    return true;
  }

  function setFieldValue(root, name, value) {
    const field = root?.querySelector(`[data-cmd-field="${name}"]`);
    if (!field) return false;
    field.value = String(value ?? '');
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function actionKeyForAsset(asset, type) {
    const mediaType = String(asset?.type || '').toLowerCase();
    if (type === 'video' || mediaType === 'video' || mediaType === 'animation') return 'play_video_media';
    return 'play_audio_media';
  }

  function applyRouting(root, fieldName, asset, type) {
    const mediaId = String(asset?.id || asset?.mediaId || '').trim();
    if (!mediaId) return;
    const normalizedAsset = asset || { id: mediaId, type: type === 'video' ? 'video' : 'audio' };
    const targetUrl = `/api/sound/play-media?mediaId=${encodeURIComponent(mediaId)}`;
    const actionKey = actionKeyForAsset(normalizedAsset, type);
    setFieldValue(root, fieldName, mediaId);
    setFieldValue(root, 'moduleKey', 'sound_media_bridge');
    setFieldValue(root, 'actionKey', actionKey);
    setFieldValue(root, 'targetMethod', 'POST');
    setFieldValue(root, 'targetUrl', targetUrl);
    setFieldValue(root, 'responseMode', 'module');

    const current = root.querySelector(`[data-commands-media-current="${fieldName}"]`);
    if (current) current.textContent = optionLabel(normalizedAsset) || `#${mediaId}`;

    const pickerRow = root.querySelector(`[data-commands-media-picker="${fieldName}"]`);
    const actionBox = pickerRow?.closest('.cmd-action-box');
    if (actionBox) {
      let info = actionBox.querySelector('[data-commands-media-route-info]');
      if (!info) {
        info = document.createElement('p');
        info.className = 'cmd-media-route-info';
        info.dataset.commandsMediaRouteInfo = '1';
        actionBox.appendChild(info);
      }
      const trigger = root.querySelector('[data-cmd-field="trigger"]')?.value || '';
      const checkHint = trigger ? ` · Check: /api/commands/media-command-check?trigger=${encodeURIComponent(trigger)}` : ' · Nach dem Speichern: /api/commands/media-command-check?trigger=<trigger>';
      info.textContent = `Route gesetzt: ${targetUrl} · ${actionKey}${checkHint}`;
    }
  }

  function openPicker(button) {
    const root = document.getElementById('commandsModule');
    if (!root || !button) return;
    const fieldName = button.dataset.commandsMediaPick || '';
    const type = button.dataset.commandsMediaType || 'sound';
    const allowedTypes = String(button.dataset.commandsMediaAllowed || 'audio').split(',').map(item => item.trim()).filter(Boolean);
    if (!window.MediaPicker?.open) {
      const current = root.querySelector(`[data-commands-media-current="${fieldName}"]`);
      if (current) current.textContent = 'MediaPicker ist nicht geladen.';
      return;
    }
    window.MediaPicker.open({
      moduleKey: 'commands',
      allowedTypes,
      title: type === 'video' ? 'Command-Medium auswählen: Video/Animation' : 'Command-Medium auswählen: Sound',
      onSelect(asset) {
        applyRouting(root, fieldName, asset, type);
      }
    });
  }

  function bindPickerButtons(root) {
    root.querySelectorAll('[data-commands-media-pick]').forEach(button => {
      if (button.dataset.commandsMediaBound) return;
      button.dataset.commandsMediaBound = '1';
      button.addEventListener('click', () => openPicker(button));
    });
  }

  function inject() {
    const root = document.getElementById('commandsModule');
    if (!root || root.hidden) return;
    if (!state.loaded && !state.loading) {
      loadOptions(false).then(scheduleInject).catch(() => scheduleInject());
      return;
    }
    replaceMediaInput(root, 'soundMediaId', 'sound');
    replaceMediaInput(root, 'videoMediaId', 'video');
    bindPickerButtons(root);

    const soundValue = root.querySelector('[data-commands-media-input="soundMediaId"]')?.value || '';
    const videoValue = root.querySelector('[data-commands-media-input="videoMediaId"]')?.value || '';
    const soundCurrent = root.querySelector('[data-commands-media-current="soundMediaId"]');
    const videoCurrent = root.querySelector('[data-commands-media-current="videoMediaId"]');
    if (soundCurrent && soundValue) soundCurrent.textContent = selectedLabel(soundValue, 'sound');
    if (videoCurrent && videoValue) videoCurrent.textContent = selectedLabel(videoValue, 'video');

    // STEP274L-FIX1:
    // Bestehende Commands mit gespeicherter mediaId muessen beim Oeffnen/Rendern
    // wieder auf den offiziellen Sound-System-Hub geroutet werden.
    // Sonst kann ein Speichern ohne erneute Picker-Auswahl moduleKey/actionKey/targetUrl leer
    // oder veraltet lassen und der Command spielt nichts mehr ab.
    if (soundValue) {
      const asset = mediaById(soundValue, 'sound') || { id: soundValue, type: 'audio' };
      applyRouting(root, 'soundMediaId', asset, 'sound');
    }
    if (videoValue) {
      const asset = mediaById(videoValue, 'video') || { id: videoValue, type: 'video' };
      applyRouting(root, 'videoMediaId', asset, 'video');
    }

    const hero = root.querySelector('.cmd-hero p');
    if (hero && !hero.dataset.commandsMediaStep274l) {
      hero.dataset.commandsMediaStep274l = '1';
      hero.textContent = 'Zentrales Chat-Command-System. STEP274L: Medien werden über den zentralen Media-Picker gewählt; abgespielt wird weiterhin zentral über das Sound-System.';
    }
  }

  function scheduleInject() {
    if (injectTimer) window.clearTimeout(injectTimer);
    injectTimer = window.setTimeout(inject, 60);
  }

  function observe() {
    const root = document.getElementById('commandsModule');
    if (!root || observer) return;
    observer = new MutationObserver(() => scheduleInject());
    observer.observe(root, { childList: true, subtree: true });
  }

  async function activate(force) {
    observe();
    await loadOptions(force);
    scheduleInject();
  }

  installCommandUpsertGuard();

  window.addEventListener('cgn:module-show', ev => {
    if (ev.detail?.module === 'commands') activate(false).catch(() => scheduleInject());
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observe);
  } else {
    observe();
  }

  return { activate, loadOptions, inject };
})();
