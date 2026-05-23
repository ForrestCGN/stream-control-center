window.CommandsMediaBridge = (function(){
  'use strict';

  const api = {
    audio: '/api/commands/media-options?type=audio&status=active&limit=500',
    video: '/api/commands/media-options?type=video,animation&status=active&limit=500',
    status: '/api/commands/media-bridge/status'
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
    return bits.join(' ');
  }

  function buildSelect(fieldName, currentValue, options, placeholder) {
    const current = String(currentValue || '').trim();
    const known = options.some(item => String(item.id) === current);
    const rows = [`<option value="">${esc(placeholder)}</option>`];
    if (current && !known) rows.push(`<option value="${esc(current)}" selected>Aktuell: #${esc(current)} (nicht in Medienliste)</option>`);
    for (const item of options) {
      const selected = String(item.id) === current ? 'selected' : '';
      rows.push(`<option value="${esc(item.id)}" ${selected} data-media-path="${esc(item.relativePath || '')}" data-media-web="${esc(item.webPath || '')}">${esc(optionLabel(item))}</option>`);
    }
    return `<select class="cmd-media-select" data-cmd-field="${esc(fieldName)}" data-commands-media-select="${esc(fieldName)}">${rows.join('')}</select>`;
  }

  function mediaHint(options, type) {
    const count = options.length;
    const extra = type === 'sound'
      ? 'Gespeichert wird die Media-ID aus der zentralen Medienverwaltung. Direkte Sound-Ausführung kommt in einem eigenen Folge-Step.'
      : 'Gespeichert wird die Media-ID aus der zentralen Medienverwaltung. Overlay-/Video-Ausführung kommt in einem eigenen Folge-Step.';
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

  function inject() {
    const root = document.getElementById('commandsModule');
    if (!root || root.hidden) return;
    if (!state.loaded && !state.loading) {
      loadOptions(false).then(scheduleInject).catch(() => scheduleInject());
      return;
    }
    replaceMediaInput(root, 'soundMediaId', state.audio, 'Sound aus Medienverwaltung auswählen...', 'sound');
    replaceMediaInput(root, 'videoMediaId', state.video, 'Video/Animation aus Medienverwaltung auswählen...', 'video');
    const hero = root.querySelector('.cmd-hero p');
    if (hero && !hero.dataset.commandsMediaStep274c) {
      hero.dataset.commandsMediaStep274c = '1';
      hero.textContent = 'Zentrales Chat-Command-System. Sound-/Video-Aktionen sind mit der Medienverwaltung verbunden.';
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
