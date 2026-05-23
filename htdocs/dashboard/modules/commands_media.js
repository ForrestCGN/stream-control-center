window.CommandsMediaBridge = (function(){
  'use strict';

  const api = {
    audio: '/api/commands/media-options?type=audio&status=active&limit=500',
    video: '/api/commands/media-options?type=video,animation&status=active&limit=500',
    status: '/api/commands/media-bridge/status',
    soundBridgeStatus: '/api/sound/media-bridge/status'
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

  function optionLabel(item) {
    const bits = [];
    bits.push(item.label || item.fileName || item.relativePath || `#${item.id}`);
    if (item.category) bits.push(`[${item.category}]`);
    if (item.relativePath) bits.push(`– ${item.relativePath}`);
    if (item.soundSystemCompatible === false) bits.push('(Bridge)');
    return bits.join(' ');
  }

  function buildSelect(fieldName, currentValue, options, placeholder) {
    const current = String(currentValue || '').trim();
    const known = options.some(item => String(item.id) === current);
    const rows = [`<option value="">${esc(placeholder)}</option>`];
    if (current && !known) rows.push(`<option value="${esc(current)}" selected>Aktuell: #${esc(current)} (nicht in Medienliste)</option>`);
    for (const item of options) {
      const selected = String(item.id) === current ? 'selected' : '';
      rows.push(`<option value="${esc(item.id)}" ${selected} data-media-path="${esc(item.relativePath || '')}" data-media-web="${esc(item.webPath || '')}" data-media-sound-file="${esc(item.soundSystemFile || '')}" data-media-compatible="${item.soundSystemCompatible ? '1' : '0'}">${esc(optionLabel(item))}</option>`);
    }
    return `<select class="cmd-media-select" data-cmd-field="${esc(fieldName)}" data-commands-media-select="${esc(fieldName)}">${rows.join('')}</select>`;
  }

  function mediaHint(options, type) {
    const count = options.length;
    const extra = type === 'sound'
      ? 'Gespeichert wird die Media-ID aus der zentralen Medienverwaltung. Resolver-Daten kommen zentral aus /api/media/resolve; echte Sound-Ausführung kommt in einem eigenen Folge-Step.'
      : 'Gespeichert wird die Media-ID aus der zentralen Medienverwaltung. Resolver-Daten kommen zentral aus /api/media/resolve; Video/Animation wird ab STEP274E ebenfalls über /api/sound/play-media an den bestehenden Sound-/Overlay-Flow übergeben.';
    return `<small class="cmd-media-hint">${esc(count)} Medien gefunden. ${esc(extra)}</small>`;
  }

  function replaceMediaInput(root, fieldName, options, placeholder, type) {
    const field = root.querySelector(`[data-cmd-field="${fieldName}"]`);
    if (!field || field.dataset.commandsMediaSelect === fieldName) return false;
    const label = field.closest('label');
    if (!label) return false;
    const currentValue = field.value || '';
    const title = label.childNodes && label.childNodes[0] ? String(label.childNodes[0].textContent || '').trim() : 'Medium';
    label.innerHTML = `${esc(title)}${buildSelect(fieldName, currentValue, options, placeholder)}${mediaHint(options, type)}`;
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

  function selectedOption(select) {
    return select?.selectedOptions && select.selectedOptions.length ? select.selectedOptions[0] : null;
  }

  function applyRoutingForSelect(select) {
    const root = document.getElementById('commandsModule');
    if (!root || !select) return;
    const fieldName = select.dataset.commandsMediaSelect || '';
    const mediaId = String(select.value || '').trim();
    if (!mediaId) return;
    const type = fieldName === 'videoMediaId' ? 'video' : 'sound';
    setFieldValue(root, 'moduleKey', 'sound_media_bridge');
    setFieldValue(root, 'actionKey', type === 'video' ? 'play_video_media' : 'play_audio_media');
    setFieldValue(root, 'targetMethod', 'POST');
    setFieldValue(root, 'targetUrl', `/api/sound/play-media?mediaId=${encodeURIComponent(mediaId)}`);
    setFieldValue(root, 'responseMode', 'module');

    const actionBox = select.closest('.cmd-action-box');
    if (actionBox) {
      let info = actionBox.querySelector('[data-commands-media-route-info]');
      if (!info) {
        info = document.createElement('p');
        info.className = 'cmd-media-route-info';
        info.dataset.commandsMediaRouteInfo = '1';
        actionBox.appendChild(info);
      }
      const opt = selectedOption(select);
      const bridge = opt && opt.dataset.mediaCompatible === '0' ? 'Bridge/Kopie in _media_registry' : 'direkt kompatibel';
      info.textContent = `Route gesetzt: /api/sound/play-media?mediaId=${mediaId} (${bridge})`;
    }
  }

  function inject() {
    const root = document.getElementById('commandsModule');
    if (!root || root.hidden) return;
    if (!state.loaded && !state.loading) {
      loadOptions(false).then(scheduleInject).catch(() => scheduleInject());
      return;
    }
    replaceMediaInput(root, 'soundMediaId', state.audio, 'Sound aus Medienverwaltung auswählen...', 'sound');
    replaceMediaInput(root, 'videoMediaId', state.video, 'Video/Animation aus Medienverwaltung auswählen...', 'video');
    root.querySelectorAll('[data-commands-media-select]').forEach(select => {
      if (!select.dataset.commandsMediaBound) {
        select.dataset.commandsMediaBound = '1';
        select.addEventListener('change', () => applyRoutingForSelect(select));
      }
      if (select.value) applyRoutingForSelect(select);
    });
    const hero = root.querySelector('.cmd-hero p');
    if (hero && !hero.dataset.commandsMediaStep274d) {
      hero.dataset.commandsMediaStep274d = '1';
      hero.textContent = 'Zentrales Chat-Command-System. Sound-/Video-Aktionen sind mit der Medienverwaltung und /api/sound/play-media verbunden.';
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
