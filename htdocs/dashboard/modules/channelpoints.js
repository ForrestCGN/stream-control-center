window.ChannelpointsModule = (function(){
  'use strict';

  const UI_VERSION = '0.8.6';
  const UI_BUILD = 'imported-reward-setup-flow';

  const api = {
    status: '/api/channelpoints/status',
    categories: '/api/channelpoints/categories',
    rewards: '/api/channelpoints/rewards',
    busTest: '/api/channelpoints/bus-test',
    mediaExecutionCheck: '/api/channelpoints/media-execution-check',
    redemptions: '/api/channelpoints/redemptions',
    redemptionTest: '/api/channelpoints/redemptions/test',
    twitchStatus: '/api/channelpoints/twitch-status',
    twitchAuthCheck: '/api/channelpoints/twitch/auth-check',
    twitchReadonlyStatus: '/api/channelpoints/twitch/rewards-readonly/status',
    twitchReadonlyPreview: '/api/channelpoints/twitch/rewards-readonly/preview',
    twitchReadonlySync: '/api/channelpoints/twitch/sync'
  };

  const ACTIONS = [
    { id:'sound_play', label:'🔊 Sound abspielen', short:'Sound', needsMedia:true, mediaRole:'sound', mediaType:'audio', allowedTypes:'audio', actionType:'media', actionKey:'play_audio_media', hint:'Spielt ein Audio-Medium über das Sound-System ab.' },
    { id:'video_play', label:'🎬 Video anzeigen', short:'Video', needsMedia:true, mediaRole:'video', mediaType:'video', allowedTypes:'video,animation', actionType:'media', actionKey:'play_video_media', hint:'Zeigt ein Video oder eine Animation im Overlay an.' },
    { id:'text_only', label:'💬 Text anzeigen', short:'Text', needsMedia:false, mediaRole:'none', mediaType:'', allowedTypes:'', actionType:'chat_message', actionKey:'send_text', hint:'Gibt einen Chat-Text aus. Textgruppen kommen später über die zentrale Textverwaltung.' },
    { id:'manual', label:'📝 Nur verwalten', short:'Manuell', needsMedia:false, mediaRole:'none', mediaType:'', allowedTypes:'audio,video,image,animation', actionType:'manual', actionKey:'', hint:'Reward lokal verwalten, ohne automatische Ausführung.' },
    { id:'custom', label:'⚙️ Benutzerdefinierte Aktion', short:'Custom', needsMedia:false, mediaRole:'', mediaType:'', allowedTypes:'audio,video,image,animation', actionType:'manual', actionKey:'', hint:'Technische Aktion mit eigenen Feldern und JSON.' }
  ];

  const state = {
    loading:false,
    error:'',
    notice:'',
    query:'',
    categoryFilter:'all',
    statusFilter:'all',
    selectedKey:'',
    tab:'manage',
    status:null,
    categories:[],
    rewards:[],
    redemptions:[],
    redemptionCounts:null,
    twitchStatus:null,
    twitchAuthCheck:null,
    twitchReadonlyStatus:null,
    twitchReadonlyPreview:null,
    twitchReadonlySync:null,
    busResult:null,
    modal:null
  };

  let root = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function boolValue(value) { return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true'; }
  function cleanKey(value) { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, ''); }
  function rewards() { return asArray(state.rewards); }
  function categories() { return asArray(state.categories); }
  function pill(label, mode) { return `<span class="cp-pill ${esc(mode || '')}">${esc(label)}</span>`; }
  function getField(name) { return root?.querySelector(`[data-cp-field="${name}"]`); }
  function parseJson(value, fallback) { try { const parsed = typeof value === 'object' ? value : JSON.parse(String(value || '')); return parsed && typeof parsed === 'object' ? parsed : fallback; } catch (_) { return fallback; } }
  function actionById(id) { return ACTIONS.find(item => item.id === id) || ACTIONS[0]; }

  function registerDashboardModule() {
    if (!window.CGN) return;
    window.CGN.modules.channelpoints = {
      title: 'Kanalpunkte',
      panelId: 'channelpointsModule',
      group: 'community',
      overlayLink: '',
      reload() { return window.ChannelpointsModule?.loadAll?.(true); }
    };
    window.CGN.moduleCatalog.channelpoints = {
      label: 'Kanalpunkte',
      icon: '🟣',
      enabled: true,
      description: `Kanalpunkte verwalten · UI v${UI_VERSION}`
    };
    const communityItems = window.CGN.sections?.community?.items;
    if (Array.isArray(communityItems) && !communityItems.includes('channelpoints')) {
      const idx = communityItems.indexOf('commands');
      if (idx >= 0) communityItems.splice(idx, 0, 'channelpoints');
      else communityItems.push('channelpoints');
    }
  }

  function categoryByKey(key) { return categories().find(cat => String(cat.category_key) === String(key)) || null; }
  function categoryLabel(key) { const cat = categoryByKey(key); return cat ? (cat.label || cat.category_key) : (key || 'Allgemein'); }
  function selectedReward() {
    if (!state.selectedKey) return null;
    return rewards().find(item => String(item.reward_key) === state.selectedKey || String(item.id) === state.selectedKey) || null;
  }

  function actionForReward(reward) {
    const actionType = String(reward?.action_type || 'manual');
    const actionKey = String(reward?.action_key || '');
    const mediaRole = String(reward?.media_role || '');
    const payload = parseJson(reward?.action_payload || reward?.action_payload_json || '{}', {});
    const mediaType = String(payload.mediaType || payload.type || '').toLowerCase();
    if (actionType === 'media' && (actionKey.includes('video') || mediaRole === 'video' || mediaRole === 'animation' || mediaType === 'video')) return 'video_play';
    if (actionType === 'media' && (actionKey.includes('audio') || actionKey.includes('sound') || mediaRole === 'sound' || mediaRole === 'audio' || mediaType === 'audio')) return 'sound_play';
    if (actionType === 'chat_message' || actionKey === 'send_text') return 'text_only';
    if (actionType === 'manual' && !actionKey && !mediaRole) return 'manual';
    return 'custom';
  }

  function isImportedReward(reward) {
    return !!String(reward?.twitch_reward_id || '').trim();
  }

  function rewardHasExecutableAction(reward) {
    const actionType = String(reward?.action_type || 'manual');
    const actionKey = String(reward?.action_key || '');
    const mediaAssetId = String(reward?.media_asset_id || '').trim();
    const payload = parseJson(reward?.action_payload || reward?.action_payload_json || '{}', {});

    if (actionType === 'media') return !!mediaAssetId && !!actionKey;
    if (actionType === 'chat_message' || actionKey === 'send_text') return !!String(payload.text || payload.textKey || '').trim();
    if (actionType === 'manual') return false;
    return !!actionKey || !!mediaAssetId;
  }

  function rewardNeedsSetup(reward) {
    return isImportedReward(reward) && !rewardHasExecutableAction(reward);
  }

  function rewardSetupHint(reward) {
    if (!rewardNeedsSetup(reward)) return '';
    return 'Importierter Twitch-Reward ohne lokale Aktion. Erst Sound, Video, Text oder Custom-Aktion zuweisen und danach bewusst aktivieren.';
  }

  function statusPills(reward) {
    const list = [
      reward.system_enabled ? pill('aktiv', 'ok') : pill('aus', 'off'),
      reward.is_paused ? pill('pausiert', 'warn') : pill('bereit', 'neutral'),
      reward.twitch_is_enabled ? pill('Twitch aktiv', 'warn') : pill('Twitch aus', 'neutral')
    ];
    if (isImportedReward(reward)) list.push(pill('importiert', 'neutral'));
    if (rewardNeedsSetup(reward)) list.push(pill('Aktion fehlt', 'warn'));
    return list.join('');
  }

  function filteredRewards() {
    const q = String(state.query || '').trim().toLowerCase();
    return rewards().filter(reward => {
      if (state.categoryFilter !== 'all' && String(reward.category_key) !== state.categoryFilter) return false;
      if (state.statusFilter === 'enabled' && !boolValue(reward.system_enabled)) return false;
      if (state.statusFilter === 'disabled' && boolValue(reward.system_enabled)) return false;
      if (state.statusFilter === 'paused' && !boolValue(reward.is_paused)) return false;
      if (state.statusFilter === 'imported' && !isImportedReward(reward)) return false;
      if (state.statusFilter === 'missing_action' && !rewardNeedsSetup(reward)) return false;
      if (!q) return true;
      const haystack = [reward.reward_key, reward.title, reward.prompt, reward.category_key, reward.action_type, reward.action_key, reward.notes].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }

  function groupedRewards() {
    const groups = new Map();
    for (const reward of filteredRewards()) {
      const key = reward.category_key || 'general';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(reward);
    }
    return [...groups.entries()].sort((a, b) => String(categoryLabel(a[0])).localeCompare(String(categoryLabel(b[0]))));
  }

  function categoryOptions(selected, includeAll) {
    const opts = includeAll ? [`<option value="all" ${selected === 'all' ? 'selected' : ''}>Alle Kategorien</option>`] : [];
    const cats = categories().length ? categories() : [{ category_key:'general', label:'Allgemein' }];
    return opts.concat(cats.map(cat => `<option value="${esc(cat.category_key)}" ${String(selected) === String(cat.category_key) ? 'selected' : ''}>${esc(cat.label || cat.category_key)}</option>`)).join('');
  }

  function actionOptions(selected) {
    const selectedAction = actionById(selected);
    const normal = ACTIONS.map(item => `<option value="${esc(item.id)}" ${item.id === selected ? 'selected' : ''}>${esc(item.label)}</option>`).join('');
    if (!ACTIONS.some(item => item.id === selected)) return `<option value="${esc(selected)}" selected>${esc(selectedAction.label)}</option>${normal}`;
    return normal;
  }

  function blankReward() {
    return {
      reward_key:'', title:'', prompt:'', cost:100, category_key:'general', sort_order:100,
      system_enabled:true, twitch_is_enabled:false, is_paused:false, require_user_input:false, input_label:'',
      action_type:'media', action_key:'play_audio_media', action_payload_json:'{}', media_asset_id:'', media_role:'sound',
      queue_mode:'none', priority:0, cooldown_seconds:0, max_per_stream:0, max_per_user_per_stream:0,
      auto_fulfill:false, notes:'', _action:'sound_play'
    };
  }

  function cloneReward(reward) {
    const copy = JSON.parse(JSON.stringify(reward || blankReward()));
    copy._action = actionForReward(copy);
    return copy;
  }

  function openModal(mode, reward) {
    const source = reward ? cloneReward(reward) : blankReward();
    if (mode === 'copy') {
      source.id = 0;
      source.reward_key = `${source.reward_key || 'reward'}_kopie`;
      source.title = `${source.title || 'Reward'} Kopie`;
    }
    state.modal = {
      mode: mode === 'edit' ? 'edit' : 'create',
      originalKey: reward?.reward_key || '',
      originalId: reward?.id || 0,
      draft: source
    };
    render();
  }

  function closeModal() { state.modal = null; render(); }

  function syncDraftFromForm() {
    if (!state.modal) return null;
    const d = state.modal.draft;
    const payloadRaw = String(getField('action_payload_json')?.value || d.action_payload_json || '{}').trim();
    const currentPayload = parseJson(payloadRaw || '{}', {});

    d.reward_key = cleanKey(getField('reward_key')?.value || d.reward_key || '');
    d.title = String(getField('title')?.value || d.title || '').trim();
    d.prompt = String(getField('prompt')?.value || d.prompt || '').trim();
    d.cost = Number(getField('cost')?.value || d.cost || 100);
    d.category_key = String(getField('category_key')?.value || d.category_key || 'general');
    d.sort_order = Number(getField('sort_order')?.value || d.sort_order || 100);
    d.system_enabled = getField('system_enabled') ? !!getField('system_enabled')?.checked : boolValue(d.system_enabled);
    d.is_paused = getField('is_paused') ? !!getField('is_paused')?.checked : boolValue(d.is_paused);
    d.require_user_input = getField('require_user_input') ? !!getField('require_user_input')?.checked : boolValue(d.require_user_input);
    d.input_label = String(getField('input_label')?.value || d.input_label || '').trim();
    d.cooldown_seconds = Number(getField('cooldown_seconds')?.value || d.cooldown_seconds || 0);
    d.max_per_stream = Number(getField('max_per_stream')?.value || d.max_per_stream || 0);
    d.max_per_user_per_stream = Number(getField('max_per_user_per_stream')?.value || d.max_per_user_per_stream || 0);
    d.auto_fulfill = getField('auto_fulfill') ? !!getField('auto_fulfill')?.checked : boolValue(d.auto_fulfill);
    d.notes = String(getField('notes')?.value || d.notes || '').trim();
    d._action = String(getField('action_choice')?.value || d._action || 'sound_play');
    d.media_asset_id = String(getField('media_asset_id')?.value || d.media_asset_id || '').trim();
    d.media_role = String(getField('media_role')?.value || d.media_role || 'none');
    d.action_type = String(getField('action_type')?.value || d.action_type || 'manual');
    d.action_key = String(getField('action_key')?.value || d.action_key || '');
    d.queue_mode = String(getField('queue_mode')?.value || d.queue_mode || 'none');
    d.priority = Number(getField('priority')?.value || d.priority || 0);

    if (d._action === 'sound_play' || d._action === 'video_play') {
      const action = actionById(d._action);
      d.media_role = action.mediaRole;
      d.action_type = 'media';
      d.action_key = action.actionKey;
      d.action_payload_json = JSON.stringify({
        ...currentPayload,
        mediaType: action.mediaType,
        type: action.mediaType,
        volume: Number(getField('media_volume')?.value || currentPayload.volume || 80),
        target: String(getField('media_target')?.value || currentPayload.target || 'stream'),
        outputTarget: String(getField('media_output_target')?.value || currentPayload.outputTarget || 'overlay'),
        playBehavior: String(getField('play_behavior')?.value || currentPayload.playBehavior || 'immediate'),
        queueIfBusy: String(getField('play_behavior')?.value || currentPayload.playBehavior || 'immediate') === 'queue'
      });
    } else if (d._action === 'text_only') {
      d.media_asset_id = '';
      d.media_role = 'none';
      d.action_type = 'chat_message';
      d.action_key = 'send_text';
      d.action_payload_json = JSON.stringify({
        ...currentPayload,
        textMode: String(getField('text_mode')?.value || currentPayload.textMode || 'single'),
        text: String(getField('text_value')?.value || currentPayload.text || ''),
        textKey: String(getField('text_key')?.value || currentPayload.textKey || ''),
        selection: String(getField('text_selection')?.value || currentPayload.selection || 'random')
      });
    } else if (d._action === 'manual') {
      d.media_asset_id = '';
      d.media_role = 'none';
      d.action_type = 'manual';
      d.action_key = '';
      d.action_payload_json = '{}';
    } else {
      d.action_payload_json = payloadRaw || '{}';
    }

    return d;
  }

  function buildPayloadForSave() {
    const d = syncDraftFromForm();
    if (!d) throw new Error('Kein Reward geöffnet.');
    if (!d.reward_key) throw new Error('Reward-Key fehlt.');
    if (!d.title) throw new Error('Titel fehlt.');
    if (!Number.isFinite(d.cost) || d.cost < 1) throw new Error('Kosten müssen mindestens 1 sein.');

    const action = actionById(d._action);
    let payload = parseJson(d.action_payload_json, {});
    let actionType = d.action_type;
    let actionKey = d.action_key;
    let mediaRole = d.media_role;

    if (d._action === 'sound_play' || d._action === 'video_play') {
      if (!d.media_asset_id) throw new Error('Bitte zuerst ein Medium auswählen.');
      actionType = 'media';
      actionKey = action.actionKey;
      mediaRole = action.mediaRole;
      payload = {
        ...payload,
        mediaType: action.mediaType,
        type: action.mediaType,
        volume: Number(getField('media_volume')?.value || payload.volume || 80),
        target: String(getField('media_target')?.value || payload.target || 'stream'),
        outputTarget: String(getField('media_output_target')?.value || payload.outputTarget || 'overlay'),
        playBehavior: String(getField('play_behavior')?.value || payload.playBehavior || 'immediate'),
        queueIfBusy: String(getField('play_behavior')?.value || payload.playBehavior || 'immediate') === 'queue'
      };
    } else if (d._action === 'text_only') {
      actionType = 'chat_message';
      actionKey = 'send_text';
      mediaRole = 'none';
      payload = {
        textMode: String(getField('text_mode')?.value || payload.textMode || 'single'),
        text: String(getField('text_value')?.value || payload.text || ''),
        textKey: String(getField('text_key')?.value || payload.textKey || ''),
        selection: String(getField('text_selection')?.value || payload.selection || 'random')
      };
      if (payload.textMode === 'single' && !payload.text) throw new Error('Bitte einen Text eintragen.');
    } else if (d._action === 'manual') {
      actionType = 'manual';
      actionKey = '';
      mediaRole = 'none';
      payload = {};
    }

    return {
      reward_key:d.reward_key,
      title:d.title,
      prompt:d.prompt,
      cost:d.cost,
      category_key:d.category_key,
      sort_order:d.sort_order,
      system_enabled:d.system_enabled,
      is_paused:d.is_paused,
      require_user_input:d.require_user_input,
      input_label:d.input_label,
      action_type:actionType,
      action_key:actionKey,
      action_payload_json:JSON.stringify(payload),
      media_asset_id:d._action === 'manual' || d._action === 'text_only' ? '' : d.media_asset_id,
      media_role:mediaRole,
      queue_mode:d.queue_mode,
      priority:d.priority,
      cooldown_seconds:d.cooldown_seconds,
      max_per_stream:d.max_per_stream,
      max_per_user_per_stream:d.max_per_user_per_stream,
      auto_fulfill:d.auto_fulfill,
      notes:d.notes
    };
  }

  async function loadAll(force) {
    root = document.getElementById('channelpointsModule');
    if (!root || !window.CGN) return;
    if (!force && state.status) { render(); return; }
    state.loading = true;
    state.error = '';
    render();
    try {
      const [status, cats, rewardsRes, redemptionsRes, twitchRes, twitchAuthRes, twitchReadonlyRes] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.categories),
        window.CGN.api(api.rewards),
        window.CGN.api(`${api.redemptions}?limit=25`).catch(err => ({ ok:false, redemptions:[], counts:null, error:err.message })),
        window.CGN.api(api.twitchStatus).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.twitchAuthCheck).catch(err => ({ ok:false, error:err.message })),
        window.CGN.api(api.twitchReadonlyStatus).catch(err => ({ ok:false, error:err.message, enabled:false }))
      ]);
      state.status = status;
      state.categories = asArray(cats.categories);
      state.rewards = asArray(rewardsRes.rewards);
      state.redemptions = asArray(redemptionsRes.redemptions);
      state.redemptionCounts = redemptionsRes.counts || null;
      state.twitchStatus = twitchRes || null;
      state.twitchAuthCheck = twitchAuthRes || null;
      state.twitchReadonlyStatus = twitchReadonlyRes || null;
      state.loading = false;
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }
    render();
  }

  async function saveReward() {
    const payload = buildPayloadForSave();
    const isEdit = state.modal?.mode === 'edit';
    const target = isEdit ? (state.modal.originalId || state.modal.originalKey || payload.reward_key) : '';
    const url = isEdit ? `${api.rewards}/${encodeURIComponent(target)}` : api.rewards;
    const method = isEdit ? 'PUT' : 'POST';
    const result = await window.CGN.api(url, { method, body: JSON.stringify(payload) });
    state.notice = isEdit ? `Reward ${payload.reward_key} aktualisiert.` : `Reward ${payload.reward_key} erstellt.`;
    state.selectedKey = result.reward?.reward_key || payload.reward_key;
    state.modal = null;
    await loadAll(true);
  }

  async function deleteReward(key) {
    const reward = rewards().find(item => String(item.reward_key) === String(key) || String(item.id) === String(key));
    const label = reward ? `${reward.title || reward.reward_key} (${reward.reward_key})` : key;
    if (!window.confirm(`Reward wirklich lokal löschen?\n\n${label}\n\nTwitch wird dadurch nicht verändert.`)) return;
    await window.CGN.api(`${api.rewards}/${encodeURIComponent(key)}/delete`, { method:'POST', body:'{}' });
    state.notice = `Reward ${label} lokal gelöscht.`;
    if (state.selectedKey === key) state.selectedKey = '';
    state.modal = null;
    await loadAll(true);
  }

  async function toggleReward(key, enabled) {
    await window.CGN.api(`${api.rewards}/${encodeURIComponent(key)}/${enabled ? 'enable' : 'disable'}`, { method:'POST', body:'{}' });
    state.notice = enabled ? 'Reward lokal aktiviert.' : 'Reward lokal deaktiviert.';
    await loadAll(true);
  }

  async function runBusTest() {
    const data = await window.CGN.api(`${api.busTest}?message=dashboard`);
    state.busResult = data;
    state.notice = 'Bus-Test ausgeführt.';
    await loadAll(true);
  }

  async function refreshTwitchReadonlyStatus() {
    const data = await window.CGN.api(api.twitchReadonlyStatus);
    state.twitchReadonlyStatus = data;
    state.notice = data.ok ? 'Twitch-ReadOnly-Status aktualisiert.' : 'Twitch-ReadOnly-Status konnte nicht geladen werden.';
    state.tab = 'twitch-sync';
    render();
  }

  async function previewTwitchRewards() {
    const data = await window.CGN.api(api.twitchReadonlyPreview);
    state.twitchReadonlyPreview = data;
    state.notice = data.ok ? `Twitch-Preview gelesen: ${data.rewardCount ?? asArray(data.rewards).length} Rewards.` : 'Twitch-Preview konnte nicht gelesen werden.';
    state.tab = 'twitch-sync';
    render();
  }

  async function syncTwitchRewards() {
    if (!window.confirm('Twitch-Rewards jetzt lokal synchronisieren?\n\nTwitch selbst wird NICHT verändert. Es werden nur lokale Daten im Kanalpunkte-System aktualisiert.')) return;
    const data = await window.CGN.api(api.twitchReadonlySync, { method:'POST', body:JSON.stringify({ dryRun:false }) });
    state.twitchReadonlySync = data;
    state.notice = data.ok ? `Lokaler Twitch-Reward-Sync abgeschlossen: ${data.rewardCount ?? asArray(data.rewards).length} Rewards.` : 'Lokaler Twitch-Reward-Sync konnte nicht abgeschlossen werden.';
    state.tab = 'twitch-sync';
    await loadAll(true);
  }

  async function checkReward(key) {
    const data = await window.CGN.api(`${api.mediaExecutionCheck}?reward=${encodeURIComponent(key)}`);
    state.busResult = data;
    state.notice = data.executable ? `Ausführung geprüft: ${data.executionType === 'text' ? 'Text-Reward kann lokal gespeichert werden.' : 'Reward kann über /api/sound/play ausgeführt werden.'}` : 'Ausführung geprüft: Reward ist noch nicht ausführbar.';
    render();
  }

  async function executeReward(key) {
    const data = await window.CGN.api(api.redemptionTest, { method:'POST', body:JSON.stringify({ reward:key, userLogin:'dashboard', userDisplayName:'Dashboard' }) });
    state.busResult = data;
    state.notice = data.ok ? 'Reward-Test ausgeführt.' : 'Reward-Test konnte nicht ausgeführt werden.';
    await loadAll(true);
  }

  function redemptionStatusPill(status) {
    const clean = String(status || 'pending');
    const mode = clean === 'executed' ? 'ok' : (clean === 'failed' ? 'off' : (clean === 'skipped' ? 'warn' : 'neutral'));
    return pill(clean, mode);
  }

  function redemptionResultPreview(item) {
    const result = item && item.result && typeof item.result === 'object' ? item.result : {};
    if (result.type === 'text' || result.text || result.message) return result.message || result.text || '';
    if (result.item && (result.item.label || result.item.mediaUrl || result.item.videoUrl)) return [result.item.label, result.item.mediaUrl || result.item.videoUrl].filter(Boolean).join(' · ');
    if (result.message) return result.message;
    if (result.error) return result.error;
    return '';
  }

  function renderRedemptionsPanel() {
    const list = asArray(state.redemptions).slice(0, 25);
    const counts = state.redemptionCounts || {};
    return `<section class="cp-panel cp-redemptions-panel"><div class="cp-panel-head"><h3>Einlösungen / Testverlauf</h3><span>${esc(counts.total ?? list.length)} gesamt · ${esc(counts.executed ?? 0)} ausgeführt · ${esc(counts.failed ?? 0)} Fehler</span></div>
      <div class="cp-redemption-list">${list.map(item => { const preview = redemptionResultPreview(item); return `<div class="cp-redemption-row"><div><strong>${esc(item.reward_key || '-')}</strong><small>${esc(item.user_display_name || item.user_login || '-')} · ${esc(item.redeemed_at || item.created_at || '')}${preview ? ` · ${esc(preview).slice(0, 140)}` : ''}</small></div><div>${redemptionStatusPill(item.status)}</div></div>`; }).join('') || '<div class="cp-empty">Noch keine Einlösungen gespeichert.</div>'}</div>
      <small class="cp-muted-line">Text-Rewards speichern den vorbereiteten Chattext aktuell lokal im Ergebnis. Zentrale Textverwaltung und echtes Senden folgen separat.</small>
    </section>`;
  }


  function twitchReadonlyRewardsFrom(data) {
    if (!data || typeof data !== 'object') return [];
    if (Array.isArray(data.rewards)) return data.rewards;
    if (Array.isArray(data.data)) return data.data;
    if (data.preview && Array.isArray(data.preview.rewards)) return data.preview.rewards;
    if (data.result && Array.isArray(data.result.rewards)) return data.result.rewards;
    return syncChangesAsTwitchRewards(data);
  }

  function syncChangesAsTwitchRewards(data) {
    const changes = Array.isArray(data?.changes) ? data.changes : (Array.isArray(data?.result?.changes) ? data.result.changes : []);
    return changes.map(change => ({
      ...change,
      id: change.twitchRewardId || change.twitch_reward_id || change.id || '',
      title: change.title || change.rewardTitle || change.reward_title || change.rewardKey || change.reward_key || '-',
      cost: change.cost ?? change.twitchCost ?? change.twitch_cost ?? change.rewardCost ?? change.reward_cost ?? '-',
      reward_key: change.rewardKey || change.reward_key || '',
      _syncAction: change.action || '',
      _syncChanged: change.changed === true
    }));
  }

  function normalizeComparable(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function twitchRewardId(reward) {
    return String(reward?.id || reward?.twitch_reward_id || reward?.twitchRewardId || reward?.reward_id || '').trim();
  }

  function twitchRewardTitle(reward) {
    return String(reward?.title || reward?.name || reward?.reward_title || reward?.rewardTitle || '-');
  }

  function twitchRewardCostRaw(reward) {
    return reward?.cost ?? reward?.points ?? reward?.reward_cost ?? reward?.rewardCost ?? reward?.twitchCost ?? reward?.twitch_cost ?? reward?.defaultCost ?? reward?.default_cost;
  }

  function hasKnownCost(value) {
    return value !== undefined && value !== null && value !== '' && value !== '-';
  }

  function normalizeCost(value) {
    if (!hasKnownCost(value)) return '';
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? String(numberValue) : String(value).trim();
  }

  function twitchRewardCost(reward, localFallback) {
    const raw = twitchRewardCostRaw(reward);
    if (hasKnownCost(raw)) return raw;
    if (localFallback) return localRewardCost(localFallback);
    return '-';
  }

  function twitchRewardEnabled(reward) {
    const value = reward?.is_enabled ?? reward?.enabled ?? reward?.twitch_is_enabled;
    return value !== false;
  }

  function localRewardTwitchId(reward) {
    return String(reward?.twitch_reward_id || reward?.twitchRewardId || reward?.twitch_id || reward?.external_id || '').trim();
  }

  function localRewardTitle(reward) {
    return String(reward?.title || reward?.reward_title || reward?.reward_key || '-');
  }

  function localRewardCost(reward) {
    return reward?.cost ?? reward?.reward_cost ?? '-';
  }

  function localRewardKey(reward) {
    return String(reward?.reward_key || reward?.key || reward?.id || '-');
  }

  function localRewardForTwitchReward(twitchReward) {
    const twitchId = twitchRewardId(twitchReward);
    const twitchTitle = normalizeComparable(twitchRewardTitle(twitchReward));
    const changeRewardKey = String(twitchReward?.rewardKey || twitchReward?.reward_key || '').trim();
    const all = rewards();
    if (twitchId) {
      const byId = all.find(item => localRewardTwitchId(item) === twitchId);
      if (byId) return { reward: byId, mode: 'id' };
    }
    if (changeRewardKey) {
      const byKey = all.find(item => String(item.reward_key || '') === changeRewardKey);
      if (byKey) return { reward: byKey, mode: 'key' };
    }
    if (twitchTitle) {
      const byTitle = all.find(item => normalizeComparable(localRewardTitle(item)) === twitchTitle || normalizeComparable(item.reward_key) === twitchTitle);
      if (byTitle) return { reward: byTitle, mode: 'title' };
    }
    return { reward: null, mode: 'none' };
  }

  function mappingRowsFromPreview() {
    return twitchReadonlyRewardsFrom(state.twitchReadonlyPreview).map(twitchReward => {
      const mapped = localRewardForTwitchReward(twitchReward);
      const local = mapped.reward;
      const twitchId = twitchRewardId(twitchReward);
      const localId = local ? localRewardTwitchId(local) : '';
      const twitchCostRaw = twitchRewardCostRaw(twitchReward);
      const hasTwitchCost = hasKnownCost(twitchCostRaw);
      const costChanged = local && hasTwitchCost ? normalizeCost(localRewardCost(local)) !== normalizeCost(twitchCostRaw) : false;
      const titleChanged = local ? normalizeComparable(localRewardTitle(local)) !== normalizeComparable(twitchRewardTitle(twitchReward)) : false;
      let status = 'missing';
      if (mapped.mode === 'id' || mapped.mode === 'key') status = costChanged || titleChanged ? 'update' : 'mapped';
      else if (mapped.mode === 'title') status = localId ? (costChanged ? 'update' : 'mapped') : 'title-match';
      if (!local) status = 'missing';
      const effectiveSyncAction = local && String(twitchReward?._syncAction || '').toLowerCase() === 'insert' ? '' : String(twitchReward?._syncAction || '');
      return { twitchReward, local, mode: mapped.mode, status, twitchId, localId, costChanged, titleChanged, hasTwitchCost, effectiveSyncAction };
    });
  }

  function mappingSummary(rows) {
    const summary = { total: rows.length, mapped: 0, titleMatch: 0, update: 0, missing: 0 };
    for (const row of rows) {
      if (row.status === 'mapped') summary.mapped += 1;
      else if (row.status === 'title-match') summary.titleMatch += 1;
      else if (row.status === 'update') summary.update += 1;
      else summary.missing += 1;
    }
    return summary;
  }

  function resultSummary(data) {
    const summary = data?.summary || data?.result?.summary || {};
    return {
      insert: summary.insert ?? summary.created ?? data?.created ?? '-',
      update: summary.update ?? summary.updated ?? data?.updated ?? '-',
      unchanged: summary.unchanged ?? data?.unchanged ?? '-'
    };
  }

  function renderMappingStatus(row) {
    if (row.status === 'mapped') return pill('gemappt', 'ok');
    if (row.status === 'update') return pill('Update möglich', 'warn');
    if (row.status === 'title-match') return pill('Titel-Match', 'neutral');
    return pill('neu / fehlt lokal', 'off');
  }

  function renderMappingRow(row) {
    const twitch = row.twitchReward;
    const local = row.local;
    const twitchEnabled = twitchRewardEnabled(twitch);
    const twitchInfo = `<strong>${esc(twitchRewardTitle(twitch))}</strong><small>${esc(twitchRewardId(twitch) || '-')}</small>`;
    const localInfo = local
      ? `<strong>${esc(localRewardTitle(local))}</strong><small>${esc(localRewardKey(local))}${localRewardTwitchId(local) ? ` · ${esc(localRewardTwitchId(local))}` : ''}</small>`
      : '<strong>-</strong><small>wird beim Sync lokal angelegt</small>';
    const flags = [
      twitchEnabled ? pill('Twitch aktiv', 'ok') : pill('Twitch aus', 'warn'),
      local?.system_enabled === false ? pill('lokal aus', 'off') : (local ? pill('lokal aktiv/bereit', 'ok') : pill('lokal fehlt', 'neutral')),
      row.effectiveSyncAction ? pill(`Sync: ${row.effectiveSyncAction}`, row.effectiveSyncAction === 'insert' ? 'off' : (row.effectiveSyncAction === 'update' ? 'warn' : 'neutral')) : '',
      !row.hasTwitchCost && local ? pill('Kosten aus lokalem Sync', 'neutral') : '',
      row.costChanged ? pill('Kosten diff', 'warn') : '',
      row.titleChanged ? pill('Titel diff', 'warn') : ''
    ].filter(Boolean).join(' ');
    return `<tr class="cp-map-row cp-map-${esc(row.status)}"><td>${twitchInfo}</td><td>${esc(twitchRewardCost(twitch, local))}</td><td>${localInfo}</td><td>${esc(local ? localRewardCost(local) : '-')}</td><td>${renderMappingStatus(row)}<div class="cp-map-flags">${flags}</div></td></tr>`;
  }

  function renderTwitchReadonlySyncPanel() {
    const status = state.twitchReadonlyStatus || {};
    const preview = state.twitchReadonlyPreview || {};
    const sync = state.twitchReadonlySync || {};
    const previewRewards = twitchReadonlyRewardsFrom(preview);
    const rows = mappingRowsFromPreview();
    const summary = mappingSummary(rows);
    const previewSummary = resultSummary(preview);
    const syncSummary = resultSummary(sync);
    const statusMode = status.ok ? pill('ReadOnly-Modul bereit', 'ok') : pill('ReadOnly-Modul prüfen', 'warn');
    const writeMode = (status.twitchWrite || preview.twitchWrite || sync.twitchWrite) ? pill('WARNUNG: Twitch-Write', 'off') : pill('kein Twitch-Write', 'ok');
    const localMode = preview.localDbWrite ? pill('Preview schreibt lokal', 'warn') : pill('Preview ohne lokalen Write', 'ok');
    const mappingRows = rows.slice(0, 80);
    return `<section class="cp-panel cp-twitch-sync-panel"><div class="cp-panel-head"><h3>Twitch Rewards Read-Only Sync</h3><span>${statusMode} ${writeMode}</span></div>
      <div class="cp-twitch-grid cp-twitch-sync-grid">
        <div><strong>Status</strong><span>Modul: ${esc(status.module || '-')} · v${esc(status.moduleVersion || '-')} · ${esc(status.moduleBuild || '-')}</span></div>
        <div><strong>Preview</strong><span>${esc(preview.rewardCount ?? previewRewards.length ?? '-')} gelesen · Backend: Insert ${esc(previewSummary.insert)} · Update ${esc(previewSummary.update)} · Unverändert ${esc(previewSummary.unchanged)}</span></div>
        <div><strong>Mapping</strong><span>${esc(summary.total)} Twitch · ${esc(summary.mapped)} gemappt · ${esc(summary.update)} Update · ${esc(summary.titleMatch)} Titel-Match · ${esc(summary.missing)} fehlt lokal</span></div>
        <div><strong>Letzter Sync</strong><span>${esc(sync.syncedAt || sync.readAt || sync.updatedAt || '-')} · Insert ${esc(syncSummary.insert)} · Update ${esc(syncSummary.update)} · Unverändert ${esc(syncSummary.unchanged)}</span></div>
      </div>
      <div class="cp-actions cp-sync-actions"><button type="button" data-cp-action="twitch-readonly-status">Status prüfen</button><button type="button" data-cp-action="twitch-readonly-preview">Preview lesen</button><button type="button" data-cp-action="twitch-readonly-sync">Lokal synchronisieren</button></div>
      <div class="cp-note cp-twitch-note"><strong>Wichtig:</strong> Dieser Bereich liest Twitch-Rewards nur read-only. Der Sync schreibt ausschließlich lokal in das Kanalpunkte-System. Twitch-Rewards werden hier nicht erstellt, geändert oder deaktiviert.</div>
      ${preview.error ? `<div class="cp-alert error">Preview: ${esc(preview.error)}</div>` : ''}
      ${sync.error ? `<div class="cp-alert error">Sync: ${esc(sync.error)}</div>` : ''}
      <div class="cp-mapping-legend">${pill('gemappt','ok')} ${pill('Update möglich','warn')} ${pill('Titel-Match','neutral')} ${pill('neu / fehlt lokal','off')}</div>
      <div class="cp-table-wrap"><table class="cp-sync-table cp-mapping-table"><thead><tr><th>Twitch-Reward</th><th>Twitch-Kosten</th><th>Lokaler Reward</th><th>Lokale Kosten</th><th>Mapping</th></tr></thead><tbody>${mappingRows.map(renderMappingRow).join('') || '<tr><td colspan="5">Noch keine Preview geladen. Bitte „Preview lesen“ klicken.</td></tr>'}</tbody></table></div>
      ${rows.length > mappingRows.length ? `<div class="cp-muted-line">Anzeige gekürzt: ${esc(mappingRows.length)} von ${esc(rows.length)} Rewards sichtbar.</div>` : ''}
      ${state.twitchReadonlyPreview ? `<details class="cp-advanced-box"><summary>Letzte Preview-Antwort / Rohdaten</summary><pre>${esc(JSON.stringify(state.twitchReadonlyPreview, null, 2))}</pre></details>` : ''}
      ${state.twitchReadonlySync ? `<details class="cp-advanced-box"><summary>Letzte Sync-Antwort / Rohdaten</summary><pre>${esc(JSON.stringify(state.twitchReadonlySync, null, 2))}</pre></details>` : ''}
    </section>`;
  }

  function renderDiagnosticsPanel() {
    return `<section class="cp-panel cp-diagnostics-panel"><div class="cp-panel-head"><h3>Diagnose</h3><span>EventBus / Ausführung</span></div>
      <div class="cp-actions"><button type="button" data-cp-action="bus-test">EventBus-Test</button><button type="button" data-cp-action="reload">Neu laden</button></div>
      <div class="cp-note">Hier bleiben Diagnose-Ausgaben und technische Ergebnisse gesammelt, statt die Hauptseite zu überladen.</div>
      ${state.busResult ? `<details class="cp-advanced-box" open><summary>Letztes Ergebnis</summary><pre>${esc(JSON.stringify(state.busResult, null, 2))}</pre></details>` : '<div class="cp-empty">Noch kein Diagnose-Ergebnis.</div>'}
    </section>`;
  }


  function renderImportedSetupPanel() {
    const imported = rewards().filter(isImportedReward);
    const missing = imported.filter(rewardNeedsSetup);
    if (!imported.length) return '';
    return `<section class="cp-panel cp-imported-setup-panel"><div class="cp-panel-head"><h3>Importierte Twitch-Rewards einrichten</h3><span>${pill(`${missing.length} Aktion fehlt`, missing.length ? 'warn' : 'ok')} ${pill(`${imported.length} importiert`, 'neutral')}</span></div>
      <div class="cp-note"><strong>Sicherer Ablauf:</strong> Importierte Twitch-Rewards bleiben lokal aus, bis du sie bewusst konfigurierst. Öffne einen Reward über „Bearbeiten“, wähle Sound, Video, Text oder Custom-Aktion, speichere und aktiviere ihn danach manuell.</div>
      <div class="cp-actions cp-setup-actions"><button type="button" data-cp-action="filter-missing-action">Nur „Aktion fehlt“ anzeigen</button><button type="button" data-cp-action="filter-imported">Alle importierten anzeigen</button><button type="button" data-cp-action="filter-reset">Filter zurücksetzen</button></div>
    </section>`;
  }

  function renderActiveTab() {
    if (state.tab === 'overview') return `${renderOverview()}${renderTwitchReadinessPanel()}`;
    if (state.tab === 'redemptions') return renderRedemptionsPanel();
    if (state.tab === 'twitch-sync') return renderTwitchReadonlySyncPanel();
    if (state.tab === 'diagnostics') return renderDiagnosticsPanel();
    return `${renderImportedSetupPanel()}${renderToolbar()}${renderRewardGroups()}`;
  }


  function renderTwitchReadinessPanel() {
    const tw = state.twitchStatus || (state.status && state.status.twitch) || {};
    const auth = state.twitchAuthCheck || {};
    const readiness = tw.readiness || tw || {};
    const counts = tw.counts || {};
    const scopes = asArray(tw.requiredScopes || auth.requiredScopes);
    const scopeCheck = auth.scopeCheck || {};
    const checks = scopeCheck.checks || {};
    const authInfo = auth.auth || {};
    const writeMode = readiness.writeActionsEnabled ? pill('Twitch-Schreiben aktiv', 'warn') : pill('nur lokal / kein Twitch-Schreiben', 'ok');
    const authMode = checks.readyForReadOnlySync ? pill('Token/Read-Scope bereit', 'ok') : pill('Token/Scopes prüfen', 'warn');
    const manageMode = checks.readyForFutureWriteActions ? pill('Manage-Scope vorhanden', 'ok') : pill('Manage-Scope fehlt/optional', 'neutral');
    return `<section class="cp-panel cp-twitch-panel"><div class="cp-panel-head"><h3>Twitch-Sync Vorbereitung</h3><span>${writeMode}</span></div>
      <div class="cp-twitch-grid">
        <div><strong>Lokale Rewards</strong><span>${esc(counts.rewards ?? rewards().length)} gesamt · ${esc(counts.mappedRewards ?? 0)} mit Twitch-ID · ${esc(counts.unmappedRewards ?? Math.max(0, rewards().length - (counts.mappedRewards || 0)))} lokal/offen</span></div>
        <div><strong>Einlösungen</strong><span>${esc(counts.redemptions ?? state.redemptions.length)} lokal gespeichert</span></div>
        <div><strong>Auth/Scopes</strong><span>${authMode} ${manageMode}</span></div>
        <div><strong>Token-User</strong><span>${esc(authInfo.login || scopeCheck.login || '-')} · ${esc(authInfo.userId || scopeCheck.userId || '-')}</span></div>
        <div><strong>Broadcaster-Match</strong><span>${scopeCheck.broadcasterMatchRelevant ? (scopeCheck.tokenUserMatchesBroadcaster ? 'passt' : 'passt NICHT') : 'nicht geprüft / Broadcaster-ID fehlt'}</span></div>
        <div><strong>EventSub</strong><span>${readiness.eventSubImplemented ? 'angebunden' : 'noch nicht angebunden'}</span></div>
      </div>
      <div class="cp-note cp-twitch-note"><strong>Sicher:</strong> Dieser Check validiert nur Token/Scopes über Twitch-Auth. Es werden keine Twitch-Rewards erstellt, geändert oder deaktiviert.</div>
      ${authInfo.error ? `<div class="cp-alert error">Auth-Check: ${esc(typeof authInfo.error === 'string' ? authInfo.error : JSON.stringify(authInfo.error))}</div>` : ''}
      <details class="cp-advanced-box" open><summary>Benötigte Scopes und nächster Ablauf</summary>
        <ul class="cp-scope-list">${scopes.map(item => `<li><code>${esc(item.scope || item)}</code><span>${esc(item.purpose || '')}${item.alternative ? ` · Alternative: ${esc(item.alternative)}` : ''}</span></li>`).join('') || '<li><code>channel:read:redemptions</code><span>Rewards/Einlösungen lesen</span></li><li><code>channel:manage:redemptions</code><span>später erfüllen/abbrechen/verwalten</span></li>'}</ul>
        <div class="cp-scope-summary"><strong>Vorhandene Scopes:</strong> ${asArray(scopeCheck.scopes).map(scope => `<code>${esc(scope)}</code>`).join(' ') || '<span>keine / nicht geladen</span>'}</div>
        <ol class="cp-next-flow">${asArray(tw.plannedFlow).map(item => `<li>${esc(item)}</li>`).join('') || '<li>Read-only Sync vorbereiten</li><li>EventSub anbinden</li><li>Schreibaktionen später gezielt freischalten</li>'}</ol>
      </details>
    </section>`;
  }

  function renderHeader() {
    const status = state.status || {};
    return `<div class="cp-header"><div><p class="cp-kicker">Kanalpunkte-System</p><h2>Twitch-Kanalpunkte</h2><p>Analog zum Commands-Bereich: Tabs, Rewards, Übersicht, Einlösungen, Twitch-Sync und Mapping getrennt verwalten. UI v${UI_VERSION} · ${UI_BUILD}</p></div><div class="cp-header-actions"><span class="cp-version">Backend: ${esc(status.moduleVersion || '-')} · ${esc(status.moduleBuild || '-')}</span><button type="button" data-cp-action="reload">Neu laden</button></div></div>`;
  }

  function renderToolbar() {
    const direct = ['<option value="">Reward direkt wählen</option>'].concat(rewards().map(r => `<option value="${esc(r.reward_key)}" ${state.selectedKey === r.reward_key ? 'selected' : ''}>${esc(r.title || r.reward_key)} — ${esc(actionById(actionForReward(r)).short)}</option>`)).join('');
    return `<section class="cp-toolbar cp-commandlike-toolbar">
      <label>Reward suchen <span class="cp-help" title="Sucht in Key, Titel, Prompt, Kategorie, Aktion und Notizen.">?</span><input data-cp-control="query" type="search" placeholder="z. B. sound, video, vip, test..." value="${esc(state.query)}"></label>
      <label>Kategorie <span class="cp-help" title="Filtert die Liste nach lokaler Kategorie.">?</span><select data-cp-control="categoryFilter">${categoryOptions(state.categoryFilter, true)}</select></label>
      <label>Status <span class="cp-help" title="Filtert nach lokal aktiv, aus, pausiert, importiert oder fehlender Aktion.">?</span><select data-cp-control="statusFilter"><option value="all" ${state.statusFilter === 'all' ? 'selected' : ''}>Alle Status</option><option value="enabled" ${state.statusFilter === 'enabled' ? 'selected' : ''}>Lokal aktiv</option><option value="disabled" ${state.statusFilter === 'disabled' ? 'selected' : ''}>Lokal aus</option><option value="paused" ${state.statusFilter === 'paused' ? 'selected' : ''}>Pausiert</option><option value="imported" ${state.statusFilter === 'imported' ? 'selected' : ''}>Importiert</option><option value="missing_action" ${state.statusFilter === 'missing_action' ? 'selected' : ''}>Aktion fehlt</option></select></label>
      <label>Reward direkt wählen <span class="cp-help" title="Springt direkt zum Reward in der Liste.">?</span><select data-cp-control="directSelect">${direct}</select></label>
      <button type="button" data-cp-action="new">+ Neuer Reward</button>
    </section>`;
  }

  function renderOverview() {
    const status = state.status || {};
    const active = rewards().filter(r => r.system_enabled).length;
    const paused = rewards().filter(r => r.is_paused).length;
    const imported = rewards().filter(isImportedReward).length;
    const missingAction = rewards().filter(rewardNeedsSetup).length;
    const executable = rewards().filter(rewardHasExecutableAction).length;
    return `<div class="cp-grid cp-stats"><div class="cp-card"><small>Backend</small><strong>${esc(status.moduleVersion || '-')}</strong><span>${esc(status.moduleBuild || '-')}</span></div><div class="cp-card"><small>Rewards</small><strong>${rewards().length}</strong><span>${active} aktiv · ${paused} pausiert</span></div><div class="cp-card"><small>Ausführbar</small><strong>${executable}</strong><span>${missingAction} Aktion fehlt</span></div><div class="cp-card"><small>Importiert</small><strong>${imported}</strong><span>aus Twitch / lokal prüfbar</span></div><div class="cp-card"><small>Kategorien</small><strong>${categories().length}</strong><span>lokal</span></div><div class="cp-card"><small>Einlösungen</small><strong>${esc((state.redemptionCounts && state.redemptionCounts.total) || state.redemptions.length || 0)}</strong><span>lokaler Verlauf</span></div></div>`;
  }

  function renderRewardCard(reward) {
    const action = actionById(actionForReward(reward));
    const setupHint = rewardSetupHint(reward);
    const cardClasses = ['cp-reward-card'];
    if (state.selectedKey === reward.reward_key) cardClasses.push('active');
    if (rewardNeedsSetup(reward)) cardClasses.push('needs-setup');
    return `<article class="${cardClasses.join(' ')}" data-cp-card="${esc(reward.reward_key)}">
      <div class="cp-reward-main"><strong>${esc(reward.title || reward.reward_key)}</strong><small>${esc(reward.reward_key)} · ${esc(reward.cost)} Punkte · ${esc(categoryLabel(reward.category_key))}</small>${setupHint ? `<small class="cp-setup-hint">${esc(setupHint)}</small>` : ''}</div>
      <div class="cp-reward-badges">${pill(action.label.replace(/^..\s*/, ''), 'neutral')} ${statusPills(reward)}</div>
      <div class="cp-reward-actions">
        <button type="button" data-cp-action="edit" data-key="${esc(reward.reward_key)}">Bearbeiten</button>
        <button type="button" data-cp-action="check" data-key="${esc(reward.reward_key)}">Prüfen</button>
        <button type="button" data-cp-action="execute" data-key="${esc(reward.reward_key)}">Testen</button>
        <button type="button" data-cp-action="copy" data-key="${esc(reward.reward_key)}">Kopieren</button>
        ${reward.system_enabled ? `<button type="button" data-cp-action="disable" data-key="${esc(reward.reward_key)}">Deaktivieren</button>` : `<button type="button" data-cp-action="enable" data-key="${esc(reward.reward_key)}">Aktivieren</button>`}
        <button type="button" class="danger" data-cp-action="delete" data-key="${esc(reward.reward_key)}">Löschen</button>
      </div>
    </article>`;
  }

  function renderRewardGroups() {
    const groups = groupedRewards();
    const total = filteredRewards().length;
    return `<section class="cp-panel"><div class="cp-panel-head"><h3>Rewards nach Kategorien</h3><span>${total}/${rewards().length} Rewards</span></div>
      <div class="cp-group-list">${groups.map(([key, list]) => `<div class="cp-group"><h4>${esc(categoryLabel(key))}</h4>${list.map(renderRewardCard).join('')}</div>`).join('') || '<div class="cp-empty">Keine Rewards für diesen Filter.</div>'}</div>
    </section>`;
  }

  function renderPayloadValue(name, fallback) {
    const d = state.modal?.draft || {};
    const payload = parseJson(d.action_payload || d.action_payload_json || '{}', {});
    return payload[name] !== undefined && payload[name] !== null ? payload[name] : fallback;
  }

  function renderModal() {
    if (!state.modal) return '';
    const d = state.modal.draft || blankReward();
    const actionId = d._action || actionForReward(d);
    const action = actionById(actionId);
    const isEdit = state.modal.mode === 'edit';
    const payload = parseJson(d.action_payload || d.action_payload_json || '{}', {});
    return `<div class="cp-modal-backdrop" role="dialog" aria-modal="true"><div class="cp-modal">
      <div class="cp-modal-head"><div><p class="cp-kicker">${isEdit ? 'Reward bearbeiten' : 'Neuer Reward'}</p><h3>${esc(isEdit ? (d.title || d.reward_key) : 'Reward erstellen')}</h3></div><button type="button" class="cp-modal-close" data-cp-action="modal-close">×</button></div>

      <section class="cp-editor-section"><h4>Basis</h4><div class="cp-form-grid">
        <label>Reward-Key <span class="cp-help" title="Interner eindeutiger Schlüssel, z. B. sound_hype oder video_party.">?</span><input data-cp-field="reward_key" value="${esc(d.reward_key || '')}" placeholder="z. B. sound_hype"></label>
        <label>Titel <span class="cp-help" title="Name, der im Dashboard und später bei Twitch sichtbar ist.">?</span><input data-cp-field="title" value="${esc(d.title || '')}" placeholder="z. B. Hype-Sound"></label>
        <label>Kosten <span class="cp-help" title="Kanalpunkte-Kosten. Twitch-Sync kommt später.">?</span><input type="number" min="1" data-cp-field="cost" value="${esc(d.cost || 100)}"></label>
        <label>Kategorie <span class="cp-help" title="Gruppiert Rewards im Dashboard.">?</span><select data-cp-field="category_key">${categoryOptions(d.category_key || 'general', false)}</select></label>
        <label>Sortierung <span class="cp-help" title="Kleinere Zahl steht weiter oben.">?</span><input type="number" data-cp-field="sort_order" value="${esc(d.sort_order ?? 100)}"></label>
        <label>Input-Label <span class="cp-help" title="Optionaler Hinweis, wenn User eine Eingabe machen sollen.">?</span><input data-cp-field="input_label" value="${esc(d.input_label || '')}"></label>
      </div><label class="cp-wide">Prompt <span class="cp-help" title="Beschreibung/Hinweistext für den Reward.">?</span><textarea rows="2" data-cp-field="prompt">${esc(d.prompt || '')}</textarea></label></section>

      <section class="cp-editor-section"><h4>Aktion</h4><div class="cp-form-grid">
        <label>Was soll passieren? <span class="cp-help" title="Wähle die Hauptaktion. Die passende Maske erscheint direkt darunter.">?</span><select data-cp-field="action_choice">${actionOptions(actionId)}</select></label>
      </div>${renderActionMask(action, d, payload)}</section>

      <section class="cp-editor-section"><h4>Regeln</h4><div class="cp-form-grid">
        <label>Cooldown Sekunden <span class="cp-help" title="Lokale Sperre nach Einlösung. 0 = aus.">?</span><input type="number" min="0" data-cp-field="cooldown_seconds" value="${esc(d.cooldown_seconds ?? 0)}"></label>
        <label>Max pro Stream <span class="cp-help" title="0 = keine lokale Grenze.">?</span><input type="number" min="0" data-cp-field="max_per_stream" value="${esc(d.max_per_stream ?? 0)}"></label>
        <label>Max pro User/Stream <span class="cp-help" title="0 = keine lokale Grenze.">?</span><input type="number" min="0" data-cp-field="max_per_user_per_stream" value="${esc(d.max_per_user_per_stream ?? 0)}"></label>
      </div><div class="cp-checks"><label><input type="checkbox" data-cp-field="system_enabled" ${boolValue(d.system_enabled) ? 'checked' : ''}> lokal aktiv</label><label><input type="checkbox" data-cp-field="is_paused" ${boolValue(d.is_paused) ? 'checked' : ''}> pausiert</label><label><input type="checkbox" data-cp-field="require_user_input" ${boolValue(d.require_user_input) ? 'checked' : ''}> User-Eingabe</label><label><input type="checkbox" data-cp-field="auto_fulfill" ${boolValue(d.auto_fulfill) ? 'checked' : ''}> später auto-fulfill</label></div></section>

      <label class="cp-wide cp-notes-label">Notizen<textarea rows="2" data-cp-field="notes">${esc(d.notes || '')}</textarea></label>

      <div class="cp-modal-actions"><button type="button" data-cp-action="save">${isEdit ? 'Speichern' : 'Erstellen'}</button>${isEdit ? `<button type="button" data-cp-action="delete" data-key="${esc(d.reward_key)}" class="danger">Löschen</button>` : ''}<button type="button" data-cp-action="modal-close">Abbrechen</button></div>
    </div></div>`;
  }

  function renderActionMask(action, d, payload) {
    if (action.id === 'sound_play' || action.id === 'video_play') {
      return `<div class="cp-action-mask"><h5>${esc(action.label)}</h5><p>${esc(action.hint)}</p><div class="cp-form-grid">
        <label>Medium <span class="cp-help" title="Wähle ein bestehendes Medium aus der zentralen Medienverwaltung.">?</span><input data-cp-field="media_asset_id" id="cpMediaAssetId" value="${esc(d.media_asset_id || '')}" placeholder="Noch kein Medium gewählt" readonly></label>
        <label>Lautstärke <span class="cp-help" title="0-100 Prozent.">?</span><input type="number" min="0" max="100" data-cp-field="media_volume" value="${esc(payload.volume ?? 80)}"></label>
        <label>Ziel <span class="cp-help" title="Wo soll das Medium ausgegeben werden?">?</span><select data-cp-field="media_target"><option value="stream" ${payload.target !== 'discord' && payload.target !== 'both' ? 'selected' : ''}>Stream</option><option value="discord" ${payload.target === 'discord' ? 'selected' : ''}>Discord</option><option value="both" ${payload.target === 'both' ? 'selected' : ''}>Stream + Discord</option></select></label>
        <label>Verhalten <span class="cp-help" title="Sofort starten oder in Warteschlange einordnen.">?</span><select data-cp-field="play_behavior"><option value="immediate" ${payload.playBehavior !== 'queue' && payload.playBehavior !== 'busy_only' ? 'selected' : ''}>Sofort starten</option><option value="queue" ${payload.playBehavior === 'queue' ? 'selected' : ''}>In Warteschlange</option><option value="busy_only" ${payload.playBehavior === 'busy_only' ? 'selected' : ''}>Nur wenn frei</option></select></label>
        <input type="hidden" data-cp-field="media_output_target" value="${esc(payload.outputTarget || 'overlay')}"><input type="hidden" data-cp-field="media_role" value="${esc(action.mediaRole)}">
      </div><div class="cp-media-box"><div data-media-field data-module-key="channelpoints" data-allowed-types="${esc(action.allowedTypes)}" data-title="Kanalpunkte-Medium auswählen" data-value-input="#cpMediaAssetId"></div><button type="button" data-cp-action="open-media">Medienverwaltung öffnen</button><button type="button" data-cp-action="clear-media">Medium entfernen</button></div><small>Ausführung später: mediaId → /api/sound/play.</small>${renderAdvancedFields(d, payload)}</div>`;
    }
    if (action.id === 'text_only') {
      return `<div class="cp-action-mask"><h5>${esc(action.label)}</h5><p>Einzeltext wird beim Test als Einlösungs-Ergebnis gespeichert. Textgruppen sind vorbereitet und werden später an die zentrale Textverwaltung angebunden.</p><div class="cp-form-grid"><label>Textmodus <select data-cp-field="text_mode"><option value="single" ${payload.textMode !== 'textKey' ? 'selected' : ''}>Einzeltext</option><option value="textKey" ${payload.textMode === 'textKey' ? 'selected' : ''}>Text-Key / Textgruppe vorbereitet</option></select></label><label>Auswahl <select data-cp-field="text_selection"><option value="random" ${payload.selection !== 'first' && payload.selection !== 'rotation' ? 'selected' : ''}>Zufällig</option><option value="first" ${payload.selection === 'first' ? 'selected' : ''}>Erste Variante</option><option value="rotation" ${payload.selection === 'rotation' ? 'selected' : ''}>Rotation später</option></select></label></div><label class="cp-wide">Einzeltext<textarea rows="3" data-cp-field="text_value" placeholder="Text, der im Chat erscheinen soll...">${esc(payload.text || '')}</textarea></label><label class="cp-wide">Text-Key / Textgruppe<input data-cp-field="text_key" value="${esc(payload.textKey || 'channelpoints.mein_text')}"></label><input type="hidden" data-cp-field="media_asset_id" value=""><input type="hidden" data-cp-field="media_role" value="none">${renderAdvancedFields(d, payload)}</div>`;
    }
    if (action.id === 'manual') {
      return `<div class="cp-action-mask"><h5>${esc(action.label)}</h5><p>Der Reward wird nur lokal verwaltet. Keine automatische Ausführung.</p><input type="hidden" data-cp-field="media_asset_id" value=""><input type="hidden" data-cp-field="media_role" value="none">${renderAdvancedFields(d, payload)}</div>`;
    }
    return `<div class="cp-action-mask"><h5>${esc(action.label)}</h5><p>Technische Felder werden exakt gespeichert. Nur nutzen, wenn die Aktion bewusst manuell konfiguriert wird.</p>${renderAdvancedFields(d, payload, true)}</div>`;
  }

  function renderAdvancedFields(d, payload, open) {
    return `<details class="cp-advanced-box" ${open ? 'open' : ''}><summary>Erweitert / technische Details</summary><div class="cp-form-grid"><label>Action-Typ<input data-cp-field="action_type" value="${esc(d.action_type || '')}"></label><label>Action-Key<input data-cp-field="action_key" value="${esc(d.action_key || '')}"></label><label>Queue<input data-cp-field="queue_mode" value="${esc(d.queue_mode || 'none')}"></label><label>Priorität<input type="number" data-cp-field="priority" value="${esc(d.priority || 0)}"></label></div><label class="cp-wide">Action-Payload JSON<textarea rows="5" data-cp-field="action_payload_json">${esc(JSON.stringify(payload || parseJson(d.action_payload_json || '{}', {}), null, 2))}</textarea></label></details>`;
  }

  function render() {
    if (!root) root = document.getElementById('channelpointsModule');
    if (!root) return;
    const tabs = [
      ['manage', 'Rewards'],
      ['overview', 'Übersicht'],
      ['redemptions', 'Einlösungen'],
      ['twitch-sync', 'Twitch Sync'],
      ['diagnostics', 'Diagnose']
    ];
    if (state.loading) { root.innerHTML = `<div class="cp-admin">${renderHeader()}<section class="cp-panel cp-loading">Kanalpunkte werden geladen...</section></div>`; return; }
    root.innerHTML = `<div class="cp-admin cp-dashboard-tabs">${renderHeader()}${state.error ? `<div class="cp-alert error">${esc(state.error)}</div>` : ''}${state.notice ? `<div class="cp-alert ok">${esc(state.notice)}</div>` : ''}<div class="cp-tabs">${tabs.map(([id,label]) => `<button type="button" class="${state.tab === id ? 'active' : ''}" data-cp-tab="${id}">${esc(label)}</button>`).join('')}</div>${renderActiveTab()}${renderModal()}</div>`;
    wireEvents();
    if (state.modal) {
      window.MediaField?.initAll?.(root);
      window.setTimeout(() => { if (state.modal) syncDraftFromForm(); }, 80);
    }
  }

  function wireEvents() {
    root.querySelectorAll('[data-cp-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.cpTab || 'manage'; state.error = ''; render(); }));
    root.querySelectorAll('[data-cp-action="reload"]').forEach(btn => btn.addEventListener('click', () => loadAll(true)));
    root.querySelector('[data-cp-action="new"]')?.addEventListener('click', () => openModal('create'));
    root.querySelector('[data-cp-action="filter-missing-action"]')?.addEventListener('click', () => { state.statusFilter = 'missing_action'; render(); });
    root.querySelector('[data-cp-action="filter-imported"]')?.addEventListener('click', () => { state.statusFilter = 'imported'; render(); });
    root.querySelector('[data-cp-action="filter-reset"]')?.addEventListener('click', () => { state.statusFilter = 'all'; state.query = ''; render(); });
    root.querySelector('[data-cp-action="bus-test"]')?.addEventListener('click', () => runBusTest().catch(showError));
    root.querySelector('[data-cp-action="twitch-readonly-status"]')?.addEventListener('click', () => refreshTwitchReadonlyStatus().catch(showError));
    root.querySelector('[data-cp-action="twitch-readonly-preview"]')?.addEventListener('click', () => previewTwitchRewards().catch(showError));
    root.querySelector('[data-cp-action="twitch-readonly-sync"]')?.addEventListener('click', () => syncTwitchRewards().catch(showError));
    root.querySelectorAll('[data-cp-action="edit"]').forEach(btn => btn.addEventListener('click', () => { const r = rewards().find(item => item.reward_key === btn.dataset.key); if (r) openModal('edit', r); }));
    root.querySelectorAll('[data-cp-action="check"]').forEach(btn => btn.addEventListener('click', ev => { ev.stopPropagation(); checkReward(btn.dataset.key).catch(showError); }));
    root.querySelectorAll('[data-cp-action="execute"]').forEach(btn => btn.addEventListener('click', ev => { ev.stopPropagation(); executeReward(btn.dataset.key).catch(showError); }));
    root.querySelectorAll('[data-cp-action="copy"]').forEach(btn => btn.addEventListener('click', () => { const r = rewards().find(item => item.reward_key === btn.dataset.key); if (r) openModal('copy', r); }));
    root.querySelectorAll('[data-cp-action="delete"]').forEach(btn => btn.addEventListener('click', () => deleteReward(btn.dataset.key || state.modal?.draft?.reward_key).catch(showError)));
    root.querySelectorAll('[data-cp-action="disable"]').forEach(btn => btn.addEventListener('click', () => toggleReward(btn.dataset.key, false).catch(showError)));
    root.querySelectorAll('[data-cp-action="enable"]').forEach(btn => btn.addEventListener('click', () => toggleReward(btn.dataset.key, true).catch(showError)));
    root.querySelector('[data-cp-action="save"]')?.addEventListener('click', () => saveReward().catch(showError));
    root.querySelectorAll('[data-cp-action="modal-close"]').forEach(btn => btn.addEventListener('click', closeModal));
    root.querySelectorAll('[data-cp-action="open-media"]').forEach(btn => btn.addEventListener('click', () => window.CGN?.setActiveModule?.('media')));
    root.querySelector('[data-cp-action="clear-media"]')?.addEventListener('click', () => { const f = getField('media_asset_id'); if (f) f.value = ''; syncDraftFromForm(); render(); });
    root.querySelectorAll('[data-cp-field]').forEach(field => {
      if (field.dataset.cpDraftBound) return;
      field.dataset.cpDraftBound = '1';
      const eventName = field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input';
      field.addEventListener(eventName, () => {
        if (state.modal) syncDraftFromForm();
      });
    });
    root.querySelector('[data-cp-field="action_choice"]')?.addEventListener('change', () => { syncDraftFromForm(); render(); });
    root.querySelector('[data-cp-control="query"]')?.addEventListener('input', ev => { if (state.modal) syncDraftFromForm(); state.query = ev.target.value || ''; render(); });
    root.querySelector('[data-cp-control="categoryFilter"]')?.addEventListener('change', ev => { if (state.modal) syncDraftFromForm(); state.categoryFilter = ev.target.value || 'all'; render(); });
    root.querySelector('[data-cp-control="statusFilter"]')?.addEventListener('change', ev => { if (state.modal) syncDraftFromForm(); state.statusFilter = ev.target.value || 'all'; render(); });
    root.querySelector('[data-cp-control="directSelect"]')?.addEventListener('change', ev => { if (state.modal) syncDraftFromForm(); state.selectedKey = ev.target.value || ''; const card = root.querySelector(`[data-cp-card="${CSS.escape(state.selectedKey)}"]`); card?.scrollIntoView?.({ behavior:'smooth', block:'center' }); render(); });
    root.querySelectorAll('[data-cp-card]').forEach(card => card.addEventListener('click', ev => { if (ev.target.closest('button')) return; state.selectedKey = card.dataset.cpCard || ''; render(); }));
  }

  function showError(err) { state.error = err.message || String(err); render(); }

  registerDashboardModule();
  window.addEventListener('cgn:module-show', event => { if (event?.detail?.module === 'channelpoints') loadAll(false); });
  return { loadAll, render, registerDashboardModule, uiVersion:UI_VERSION, uiBuild:UI_BUILD };
})();
