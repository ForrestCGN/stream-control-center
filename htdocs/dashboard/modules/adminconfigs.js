(function(){
  const root = document.getElementById('adminconfigsModule');
  if (!root) return;

  const fallbackRegistry = {
    ok: true,
    preparedOnly: true,
    configs: [
      { id:'streamdesk', label:'Stream-Desk', path:'config/streamdesk.json', category:'Live', writablePrepared:false, description:'OBS-QuickScenes, sichtbare Widgets und Stream-Desk-Verhalten.' },
      { id:'dashboard_navigation', label:'Navigation', path:'config/dashboard_navigation.json', category:'Dashboard', writablePrepared:false, description:'Hauptbereiche Live, Control, System, Community, Admin und sichtbare Module.' },
      { id:'dashboard_logging', label:'Audit-Logging', path:'config/dashboard_logging.json', category:'System', writablePrepared:false, description:'Retention, eigene SQLite-Datei und Logging-Verhalten.' },
      { id:'twitch_dashboard_auth', label:'Twitch Login', path:'config/twitch_dashboard_auth.json', category:'Auth', writablePrepared:false, description:'OAuth-/Scope-Vorbereitung für Dashboard-Login und Mod-Rechte.' },
      { id:'backend_general', label:'Backend Allgemein', path:'config/dashboard_backend_general.json', category:'Backend', writablePrepared:false, description:'Vorbereitung für zentrale Backend-Optionen.' },
      { id:'sound_system_expert', label:'Sound-System Experten', path:'SQLite sound_settings + config/sound_system.json', category:'Sound-System', writablePrepared:true, description:'Technische Sound-System-Werte: Helper, Pfade, Extensions, Overlay URL und Parallel-Kategorien.' },
      { id:'env_strategy', label:'ENV / Secrets Strategie', path:'config/dashboard_env_strategy.json', category:'Secrets', writablePrepared:false, description:'Geplante Trennung von normalen Configs und Secrets.' }
    ],
    secrets: [
      { id:'twitch_client_secret', label:'Twitch Client Secret', storage:'config/secrets/.env', masked:'************', status:'prepared_only' },
      { id:'discord_webhooks', label:'Discord Webhooks', storage:'config/secrets/.env', masked:'************', status:'prepared_only' },
      { id:'dashboard_session_secret', label:'Dashboard Session Secret', storage:'config/secrets/.env', masked:'************', status:'prepared_only' }
    ]
  };

  const state = { registry:null, selectedId:'streamdesk', selectedConfig:null, loading:false, error:'', note:'' };
  const SOUND_EXPERT_ITEM = { id:'sound_system_expert', label:'Sound-System Experten', path:'SQLite sound_settings + config/sound_system.json', category:'Sound-System', writablePrepared:true, description:'Technische Sound-System-Werte: Helper, Pfade, Extensions, Overlay URL und Parallel-Kategorien.' };

  function ensureSoundExpertConfig(registry){
    if (!registry || !Array.isArray(registry.configs)) return registry;
    if (!registry.configs.some(c => c.id === 'sound_system_expert')) {
      registry.configs.push(SOUND_EXPERT_ITEM);
    }
    return registry;
  }

  function esc(value){ return window.CGN.esc(value ?? ''); }
  function num(value, fallback){ const n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function csv(value, fallback){ return Array.isArray(value) ? value.join(', ') : (Array.isArray(fallback) ? fallback.join(', ') : ''); }
  function readText(id, fallback){
    const el = root.querySelector('#' + id);
    const value = String(el?.value ?? '').trim();
    return value || fallback;
  }
  function readNumber(id, fallback, min, max){
    const el = root.querySelector('#' + id);
    const n = Number(el?.value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
  }
  function readCsv(id, fallback){
    const el = root.querySelector('#' + id);
    const raw = String(el?.value ?? '').trim();
    if (!raw) return Array.isArray(fallback) ? fallback.slice() : [];
    return raw.split(',').map(v => v.trim()).filter(Boolean);
  }
  function option(value, current, label){
    return `<option value="${esc(value)}" ${String(value) === String(current) ? 'selected' : ''}>${esc(label || value)}</option>`;
  }

  async function loadRegistry(){ try { state.registry = ensureSoundExpertConfig(await window.CGN.api('/api/dashboard/controlcenter/admin-configs')); } catch (_) { state.registry = ensureSoundExpertConfig(fallbackRegistry); } }
  async function loadConfig(id){
    state.loading = true;
    state.error = '';
    state.note = '';
    state.selectedConfig = null;
    render();
    try {
      if (id === 'sound_system_expert') {
        const soundSettings = await window.CGN.api('/api/sound/settings');
        state.selectedConfig = { ok:true, id, config:soundSettings, writable:true, writeEnabled:true, item:SOUND_EXPERT_ITEM };
      } else {
        state.selectedConfig = await window.CGN.api('/api/dashboard/controlcenter/config/' + encodeURIComponent(id));
      }
    } catch (err) {
      const item = getConfigs().find(c => c.id === id);
      state.selectedConfig = { ok:false, preparedOnly:true, id, config:null, message:'Backend-Route noch nicht aktiv. Diese Seite ist vorbereitet.', item };
      state.error = err.message;
    }
    state.loading = false;
    render();
  }
  function getConfigs(){ return Array.isArray(state.registry?.configs) ? state.registry.configs : fallbackRegistry.configs; }
  function getSecrets(){ return Array.isArray(state.registry?.secrets) ? state.registry.secrets : fallbackRegistry.secrets; }
  function selectedItem(){ return getConfigs().find(c => c.id === state.selectedId) || getConfigs()[0]; }
  function pretty(value){ try { return JSON.stringify(value ?? {}, null, 2); } catch (_) { return '{}'; } }
  function select(id){ state.selectedId = id; loadConfig(id); }

  function renderSoundExpertConfig(payload){
    const effective = payload?.effective || {};
    const settings = payload?.settings || {};
    const output = effective.output || {};
    const targets = output.targets || {};
    const overlayTarget = targets.overlay || {};
    const deviceTarget = targets.device || {};
    const helper = deviceTarget.helper || {};
    const queue = effective.queue || {};

    return `
      <div class="adminconfig-sound-expert">
        <h3>Sound-System Expertenwerte</h3>
        <p class="muted">Diese Werte sind technische Systemwerte. Sie gehören nicht auf die normale Sound-Seite. Speicherung läuft über <code>/api/sound/settings</code> nach SQLite.</p>

        <div class="adminconfig-sound-grid">
          <label>
            <span>Overlay URL</span>
            <input id="adminSoundOverlayUrl" type="text" value="${esc(overlayTarget.overlayUrl || '/overlays/sound_system_overlay.html')}">
          </label>
          <label>
            <span>Sounds Base Dir</span>
            <input id="adminSoundSoundsBaseDir" type="text" value="${esc(effective.soundsBaseDir || 'htdocs/assets/sounds')}">
          </label>
          <label>
            <span>Helper-Pfad</span>
            <input id="adminSoundHelperPath" type="text" value="${esc(helper.path || 'tools/audio-device-helper/dist/AudioDeviceHelper.exe')}">
          </label>
          <label>
            <span>Helper Timeout ms</span>
            <input id="adminSoundHelperTimeout" type="number" min="1000" max="600000" value="${esc(num(helper.timeoutMs, 8000))}">
          </label>
          <label>
            <span>Playback Mode</span>
            <select id="adminSoundPlaybackMode">
              ${option('auto', helper.playbackMode || 'auto', 'auto')}
              ${option('wasapi', helper.playbackMode || 'auto', 'wasapi')}
              ${option('waveout', helper.playbackMode || 'auto', 'waveout')}
              ${option('default', helper.playbackMode || 'auto', 'default')}
            </select>
          </label>
          <label>
            <span>Allowed Extensions</span>
            <input id="adminSoundAllowedExtensions" type="text" value="${esc(csv(effective.allowedExtensions, ['.mp3','.wav','.ogg','.webm','.m4a']))}">
          </label>
          <label>
            <span>Parallel-Kategorien</span>
            <input id="adminSoundParallelCategories" type="text" value="${esc(csv(queue.parallelCategories, ['system','admin','ui','test']))}">
          </label>
        </div>

        <div class="adminconfig-actions">
          <button type="button" data-sound-expert-save>Sound-Expertenwerte speichern</button>
          <button type="button" data-reload-config="sound_system_expert">Neu laden</button>
        </div>

        <div class="placeholder-note">
          <strong>Hinweis:</strong> Secrets/Tokens werden hier nicht angezeigt. Änderungen sollten später mit Rollen/Rechten und Audit-Logging abgesichert werden.
        </div>

        <details class="adminconfig-raw">
          <summary>Aktive SQLite-Overrides anzeigen</summary>
          <pre>${esc(JSON.stringify(settings || {}, null, 2))}</pre>
        </details>
      </div>
    `;
  }

  async function saveSoundExpertConfig(){
    const current = state.selectedConfig?.config || {};
    const effective = current.effective || {};
    const output = effective.output || {};
    const targets = output.targets || {};
    const device = targets.device || {};
    const helper = device.helper || {};
    const queue = effective.queue || {};

    const payload = {
      output: {
        targets: {
          overlay: {
            ...(targets.overlay || {}),
            overlayUrl: readText('adminSoundOverlayUrl', targets.overlay?.overlayUrl || '/overlays/sound_system_overlay.html')
          },
          device: {
            ...(device || {}),
            helper: {
              ...(helper || {}),
              path: readText('adminSoundHelperPath', helper.path || 'tools/audio-device-helper/dist/AudioDeviceHelper.exe'),
              timeoutMs: readNumber('adminSoundHelperTimeout', helper.timeoutMs ?? 8000, 1000, 600000),
              playbackMode: readText('adminSoundPlaybackMode', helper.playbackMode || 'auto')
            }
          }
        }
      },
      queue: {
        ...(queue || {}),
        parallelCategories: readCsv('adminSoundParallelCategories', queue.parallelCategories || ['system','admin','ui','test'])
      },
      soundsBaseDir: readText('adminSoundSoundsBaseDir', effective.soundsBaseDir || 'htdocs/assets/sounds'),
      allowedExtensions: readCsv('adminSoundAllowedExtensions', effective.allowedExtensions || ['.mp3','.wav','.ogg','.webm','.m4a'])
    };

    await window.CGN.api('/api/sound/settings', { method:'POST', body: JSON.stringify(payload) });
    state.note = 'Sound-System Expertenwerte gespeichert.';
    await loadConfig('sound_system_expert');
  }
  function renderPreview(id, payload){
    if (id === 'sound_system_expert') return renderSoundExpertConfig(payload);
    const config = payload || {};
    if (id === 'streamdesk') {
      const scenes = Array.isArray(config.obsQuickScenes) ? config.obsQuickScenes : [];
      const widgets = config.widgets || {};
      return `<div class="adminconfig-preview"><h3>Stream-Desk Vorschau</h3><div class="adminconfig-chip-row"><span>${scenes.length} QuickScenes</span><span>${Object.values(widgets).filter(Boolean).length} aktive Widgets</span><span>${config.twitchLogin?.enabled ? 'Twitch-Login aktiv' : 'Twitch-Login vorbereitet'}</span></div><div class="adminconfig-scene-preview">${scenes.map(s => `<div><strong>${window.CGN.esc(s.label || s.sceneName)}</strong><small>${window.CGN.esc(s.sceneName || '')}${s.confirm ? ' · Bestätigung' : ''}</small></div>`).join('') || '<p class="muted">Keine Szenen im geladenen Payload.</p>'}</div><p class="muted">Diese Szenen bestimmen später die OBS-Buttons im Stream-Desk. Nur wichtige sichtbare Szenen eintragen, keine _Hilfsszenen.</p></div>`;
    }
    if (id === 'dashboard_logging') {
      return `<div class="adminconfig-preview"><h3>Audit-Logging</h3><div class="adminconfig-chip-row"><span>Retention: ${window.CGN.esc(config.retentionDays ?? '—')} Tage</span><span>${config.logToDatabase ? 'SQLite aktiv geplant' : 'SQLite vorbereitet'}</span><span>${window.CGN.esc(config.databasePath || 'data/sqlite/dashboard_audit.sqlite')}</span></div><p class="muted">Logs werden kompakt und separat geplant. Keine Tokens, keine kompletten API-Antworten.</p></div>`;
    }
    if (id === 'env_strategy') {
      return `<div class="adminconfig-preview"><h3>ENV / Secrets Strategie</h3><p>Bestehende <code>backend/.env</code> bleibt vorerst. Langfristig: normale Einstellungen in JSON, Secrets maskiert unter <code>config/secrets/.env</code>.</p></div>`;
    }
    return `<div class="adminconfig-preview"><h3>Hinweis</h3><p>Diese Config ist vorbereitet. Lesen funktioniert erst vollständig, wenn <code>dashboard_controlcenter.js</code> im Backend registriert ist.</p></div>`;
  }

  function render(){
    const configs = getConfigs();
    const item = selectedItem() || {};
    const payload = state.selectedConfig?.config ?? state.selectedConfig?.data ?? null;
    const canEdit = !!(state.selectedConfig?.writable && state.selectedConfig?.writeEnabled);
    root.innerHTML = `
      <div class="module-grid adminconfigs-grid">
        <section class="card glass span-12 adminconfigs-hero"><span class="role-badge">Admin / vorbereitet</span><h2>Admin Configs</h2><p>Zentrale Konfigurationsseite für Stream-Desk, Navigation, Logging, Twitch-Login, Backend-Optionen und Secrets. Rechte sind weiterhin nicht live scharf geschaltet.</p><div class="placeholder-note adminconfigs-warning"><strong>Wichtig:</strong> Schreiben, Secret-Ersetzen und echte Rechteprüfung bleiben gesperrt, bis Auth + Audit-Log aktiv sind.</div></section>
        <section class="card glass span-12"><div class="adminconfigs-layout"><aside><h2>Config-Bereiche</h2><div class="adminconfigs-list">${configs.map(c => `<button class="adminconfig-item ${c.id === state.selectedId ? 'active' : ''}" data-config-id="${window.CGN.esc(c.id)}"><strong>${window.CGN.esc(c.label)}</strong><span>${window.CGN.esc(c.category || 'Config')} · ${window.CGN.esc(c.displayPath || c.path || '')}</span></button>`).join('')}</div></aside><section class="adminconfig-detail"><span class="role-badge">${window.CGN.esc(item.category || 'Config')}</span><h2>${window.CGN.esc(item.label || 'Config')}</h2><p>${window.CGN.esc(item.description || '')}</p><div class="adminconfig-meta"><div class="quick-card"><h3>Pfad</h3><p><code>${window.CGN.esc(item.displayPath || item.path || '—')}</code></p></div><div class="quick-card"><h3>Status</h3><p>${state.loading ? 'lädt...' : (payload ? 'lesbar' : 'vorbereitet')}</p></div><div class="quick-card"><h3>Schreiben</h3><p>${canEdit ? 'aktiv' : 'noch gesperrt'}</p></div></div>${state.error ? `<div class="placeholder-note bad">${window.CGN.esc(state.error)}</div>` : ''}${renderPreview(state.selectedId, payload)}<textarea class="adminconfig-editor" spellcheck="false" readonly>${window.CGN.esc(payload ? pretty(payload) : pretty({ preparedOnly:true, note:'Backend-Endpunkt oder Datei noch nicht aktiv. Struktur ist vorbereitet.' }))}</textarea><div class="adminconfig-actions"><button type="button" data-reload-config="${window.CGN.esc(state.selectedId)}">Neu laden</button><button type="button" disabled title="Schreiben wird erst mit Auth/Rechteprüfung aktiviert">Speichern vorbereitet</button><button type="button" disabled title="Änderungen werden später ins Audit-Log geschrieben">Audit-Vorschau vorbereitet</button></div>${state.note ? `<p class="muted">${window.CGN.esc(state.note)}</p>` : ''}</section></div></section>
        <section class="card glass span-12"><h2>Secrets / ENV</h2><div class="placeholder-note">Bestehende <code>backend/.env</code> vorerst nicht blind verschieben. Langfristig Secrets zentral unter <code>config/secrets/.env</code> oder <code>config/secrets/*.env</code>. Normale Einstellungen bleiben in JSON-Configs.</div>${getSecrets().map(s => `<div class="adminconfig-secret-row"><div><strong>${window.CGN.esc(s.label)}</strong><br><code>${window.CGN.esc(s.storage || 'config/secrets/.env')}</code></div><div><code>${window.CGN.esc(s.masked || '********')}</code> <button disabled>Ersetzen vorbereitet</button></div></div>`).join('')}</section>
      </div>`;
    root.querySelectorAll('[data-config-id]').forEach(btn => btn.addEventListener('click', () => select(btn.dataset.configId)));
    root.querySelector('[data-reload-config]')?.addEventListener('click', () => loadConfig(state.selectedId));
    root.querySelector('[data-sound-expert-save]')?.addEventListener('click', () => saveSoundExpertConfig());
  }
  async function loadAll(){ await loadRegistry(); if (!state.selectedConfig) await loadConfig(state.selectedId); else render(); }
  window.addEventListener('cgn:module-show', event => { if (event.detail?.module === 'adminconfigs') loadAll(); });
  window.AdminConfigsModule = { loadAll };
})();

