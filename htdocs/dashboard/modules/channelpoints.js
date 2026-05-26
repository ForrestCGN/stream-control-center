window.ChannelpointsModule = (function(){
  'use strict';

  const api = {
    status: '/api/channelpoints/status',
    categories: '/api/channelpoints/categories',
    rewards: '/api/channelpoints/rewards',
    model: '/api/channelpoints/model',
    mediaPlan: '/api/channelpoints/media-plan',
    dbStatus: '/api/channelpoints/db-status',
    busTest: '/api/channelpoints/bus-test'
  };

  const state = {
    loading: false,
    error: '',
    notice: '',
    status: null,
    categories: [],
    rewards: [],
    selectedKey: '',
    selected: null,
    busResult: null
  };

  let root = null;

  function esc(value) {
    return window.CGN?.esc ? window.CGN.esc(value) : String(value ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

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
      description: 'Twitch-Kanalpunkte lokal verwalten; Twitch-Sync folgt später.'
    };
    const communityItems = window.CGN.sections?.community?.items;
    if (Array.isArray(communityItems) && !communityItems.includes('channelpoints')) {
      const idx = communityItems.indexOf('commands');
      if (idx >= 0) communityItems.splice(idx, 0, 'channelpoints');
      else communityItems.push('channelpoints');
    }
    if (Array.isArray(window.CGN.favorites) && !window.CGN.favorites.includes('channelpoints')) {
      window.CGN.favorites.push('channelpoints');
    }
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function rewards() {
    return asArray(state.rewards);
  }

  function categories() {
    return asArray(state.categories);
  }

  function selectedReward() {
    const list = rewards();
    if (!list.length) return null;
    if (!state.selectedKey || !list.some(item => String(item.reward_key) === state.selectedKey || String(item.id) === state.selectedKey)) {
      state.selectedKey = String(list[0].reward_key || list[0].id || '');
    }
    return list.find(item => String(item.reward_key) === state.selectedKey || String(item.id) === state.selectedKey) || list[0];
  }

  function categoryOptions(selected) {
    const cats = categories();
    if (!cats.length) return '<option value="general">Allgemein</option>';
    return cats.map(cat => `<option value="${esc(cat.category_key)}" ${cat.category_key === selected ? 'selected' : ''}>${esc(cat.label || cat.category_key)}</option>`).join('');
  }

  function boolValue(value) {
    return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
  }

  function pill(label, mode) {
    return `<span class="cp-pill ${esc(mode || '')}">${esc(label)}</span>`;
  }

  function getField(name) {
    return root?.querySelector(`[data-cp-field="${name}"]`);
  }

  function readForm() {
    const payloadRaw = String(getField('action_payload_json')?.value || '').trim();
    let actionPayload = {};
    if (payloadRaw) {
      try { actionPayload = JSON.parse(payloadRaw); }
      catch (err) { throw new Error(`Action-Payload JSON ungültig: ${err.message}`); }
    }

    return {
      reward_key: String(getField('reward_key')?.value || '').trim(),
      title: String(getField('title')?.value || '').trim(),
      prompt: String(getField('prompt')?.value || '').trim(),
      cost: Number(getField('cost')?.value || 0),
      category_key: String(getField('category_key')?.value || 'general').trim(),
      sort_order: Number(getField('sort_order')?.value || 100),
      system_enabled: !!getField('system_enabled')?.checked,
      is_paused: !!getField('is_paused')?.checked,
      require_user_input: !!getField('require_user_input')?.checked,
      input_label: String(getField('input_label')?.value || '').trim(),
      action_type: String(getField('action_type')?.value || 'manual').trim(),
      action_key: String(getField('action_key')?.value || '').trim(),
      action_payload_json: JSON.stringify(actionPayload),
      media_asset_id: String(getField('media_asset_id')?.value || '').trim(),
      media_role: String(getField('media_role')?.value || 'none').trim(),
      queue_mode: String(getField('queue_mode')?.value || 'none').trim(),
      priority: Number(getField('priority')?.value || 0),
      cooldown_seconds: Number(getField('cooldown_seconds')?.value || 0),
      max_per_stream: Number(getField('max_per_stream')?.value || 0),
      max_per_user_per_stream: Number(getField('max_per_user_per_stream')?.value || 0),
      auto_fulfill: !!getField('auto_fulfill')?.checked,
      notes: String(getField('notes')?.value || '').trim()
    };
  }

  function blankReward() {
    return {
      reward_key: '',
      title: '',
      prompt: '',
      cost: 100,
      category_key: 'general',
      sort_order: 100,
      system_enabled: true,
      twitch_is_enabled: false,
      is_paused: false,
      require_user_input: false,
      input_label: '',
      action_type: 'manual',
      action_key: '',
      action_payload_json: '{}',
      media_asset_id: '',
      media_role: 'none',
      queue_mode: 'none',
      priority: 0,
      cooldown_seconds: 0,
      max_per_stream: 0,
      max_per_user_per_stream: 0,
      auto_fulfill: false,
      notes: ''
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
      const [status, cats, rewardsRes] = await Promise.all([
        window.CGN.api(api.status),
        window.CGN.api(api.categories),
        window.CGN.api(api.rewards)
      ]);
      state.status = status;
      state.categories = asArray(cats.categories);
      state.rewards = asArray(rewardsRes.rewards);
      if (state.selectedKey) {
        state.selected = state.rewards.find(item => item.reward_key === state.selectedKey) || null;
      }
      state.loading = false;
    } catch (err) {
      state.loading = false;
      state.error = err.message || String(err);
    }

    render();
  }

  async function saveReward() {
    const payload = readForm();
    if (!payload.reward_key) throw new Error('reward_key fehlt.');
    if (!payload.title) throw new Error('Titel fehlt.');
    if (!Number.isFinite(payload.cost) || payload.cost < 1) throw new Error('Kosten müssen mindestens 1 sein.');

    const selected = selectedReward();
    const exists = selected && String(selected.reward_key || '') === payload.reward_key;
    const url = exists ? `${api.rewards}/${encodeURIComponent(payload.reward_key)}` : api.rewards;
    const method = exists ? 'PUT' : 'POST';

    const result = await window.CGN.api(url, {
      method,
      body: JSON.stringify(payload)
    });

    state.notice = exists ? 'Reward lokal aktualisiert.' : 'Reward lokal erstellt.';
    state.selectedKey = result.reward?.reward_key || payload.reward_key;
    await loadAll(true);
  }

  async function disableReward(key) {
    await window.CGN.api(`${api.rewards}/${encodeURIComponent(key)}/disable`, { method: 'POST', body: '{}' });
    state.notice = 'Reward lokal deaktiviert. Twitch wird in STEP494 nicht verändert.';
    state.selectedKey = key;
    await loadAll(true);
  }

  async function enableReward(key) {
    await window.CGN.api(`${api.rewards}/${encodeURIComponent(key)}/enable`, { method: 'POST', body: '{}' });
    state.notice = 'Reward lokal aktiviert. Twitch wird in STEP494 nicht verändert.';
    state.selectedKey = key;
    await loadAll(true);
  }

  async function runBusTest() {
    const data = await window.CGN.api(`${api.busTest}?message=dashboard`);
    state.busResult = data;
    state.notice = 'Bus-Test ausgeführt.';
    await loadAll(true);
  }

  function renderOverview() {
    const status = state.status || {};
    const localState = status.localState || {};
    const bus = status.bus || {};
    return `
      <div class="cp-grid cp-stats">
        <div class="cp-card">
          <small>Backend</small>
          <strong>${esc(status.moduleVersion || '-')}</strong>
          <span>${esc(status.mode || '-')}</span>
        </div>
        <div class="cp-card">
          <small>Kategorien</small>
          <strong>${esc(localState.categoryCount ?? categories().length)}</strong>
          <span>lokal aus DB</span>
        </div>
        <div class="cp-card">
          <small>Rewards</small>
          <strong>${esc(localState.rewardCount ?? rewards().length)}</strong>
          <span>lokal, noch ohne Twitch-Sync</span>
        </div>
        <div class="cp-card">
          <small>Bus</small>
          <strong>${bus.registered ? 'OK' : 'Nein'}</strong>
          <span>${esc(bus.subscriptionCount ?? 0)} Subscription(s)</span>
        </div>
      </div>
      <div class="cp-note">
        <strong>STEP494:</strong> Dashboard-Basis für lokale Kanalpunkte-Rewards. Twitch-Schreibaktionen sind weiterhin deaktiviert.
        Medien werden über die bestehende Medienverwaltung und den Media-Picker ausgewählt.
      </div>
    `;
  }

  function renderCategories() {
    return `
      <section class="cp-panel">
        <div class="cp-panel-head">
          <h3>Kategorien</h3>
          <span>${categories().length} Einträge</span>
        </div>
        <div class="cp-category-list">
          ${categories().map(cat => `
            <div class="cp-category">
              <strong>${esc(cat.label || cat.category_key)}</strong>
              <small>${esc(cat.category_key)} · Sortierung ${esc(cat.sort_order)}</small>
              ${cat.enabled ? pill('aktiv', 'ok') : pill('inaktiv', 'off')}
            </div>
          `).join('') || '<div class="cp-empty">Keine Kategorien gefunden.</div>'}
        </div>
      </section>
    `;
  }

  function renderRewardList() {
    return `
      <section class="cp-panel">
        <div class="cp-panel-head">
          <h3>Rewards</h3>
          <button type="button" data-cp-action="new">Neu</button>
        </div>
        <div class="cp-reward-list">
          ${rewards().map(reward => `
            <button type="button" class="cp-reward ${state.selectedKey === reward.reward_key ? 'active' : ''}" data-cp-select="${esc(reward.reward_key)}">
              <span>
                <strong>${esc(reward.title || reward.reward_key)}</strong>
                <small>${esc(reward.reward_key)} · ${esc(reward.cost)} Punkte</small>
              </span>
              <span class="cp-reward-flags">
                ${reward.system_enabled ? pill('lokal an', 'ok') : pill('lokal aus', 'off')}
                ${reward.twitch_is_enabled ? pill('Twitch an', 'warn') : pill('Twitch aus', 'neutral')}
              </span>
            </button>
          `).join('') || '<div class="cp-empty">Noch keine Rewards vorhanden.</div>'}
        </div>
      </section>
    `;
  }

  function renderEditor() {
    const reward = state.selected || selectedReward() || blankReward();
    const isNew = !reward.id;
    const payload = typeof reward.action_payload === 'object' && reward.action_payload
      ? JSON.stringify(reward.action_payload, null, 2)
      : String(reward.action_payload_json || '{}');

    return `
      <section class="cp-panel cp-editor">
        <div class="cp-panel-head">
          <h3>${isNew ? 'Neuer Reward' : 'Reward bearbeiten'}</h3>
          <span>${isNew ? 'lokal erstellen' : `ID ${esc(reward.id)}`}</span>
        </div>

        <div class="cp-form-grid">
          <label>Key<input data-cp-field="reward_key" value="${esc(reward.reward_key)}" ${isNew ? '' : 'readonly'}></label>
          <label>Titel<input data-cp-field="title" value="${esc(reward.title)}"></label>
          <label>Kosten<input data-cp-field="cost" type="number" min="1" value="${esc(reward.cost || 100)}"></label>
          <label>Kategorie<select data-cp-field="category_key">${categoryOptions(reward.category_key || 'general')}</select></label>
          <label>Sortierung<input data-cp-field="sort_order" type="number" value="${esc(reward.sort_order ?? 100)}"></label>
          <label>Action-Typ
            <select data-cp-field="action_type">
              ${['manual','streamerbot_action','backend_route','bus_event','media','overlay','multi_action'].map(type => `<option value="${type}" ${reward.action_type === type ? 'selected' : ''}>${type}</option>`).join('')}
            </select>
          </label>
          <label>Action-Key<input data-cp-field="action_key" value="${esc(reward.action_key || '')}"></label>
          <label>Queue
            <select data-cp-field="queue_mode">
              ${['none','single','queue','replace'].map(type => `<option value="${type}" ${reward.queue_mode === type ? 'selected' : ''}>${type}</option>`).join('')}
            </select>
          </label>
          <label>Priorität<input data-cp-field="priority" type="number" value="${esc(reward.priority ?? 0)}"></label>
          <label>Cooldown Sekunden<input data-cp-field="cooldown_seconds" type="number" min="0" value="${esc(reward.cooldown_seconds ?? 0)}"></label>
          <label>Max pro Stream<input data-cp-field="max_per_stream" type="number" min="0" value="${esc(reward.max_per_stream ?? 0)}"></label>
          <label>Max pro User/Stream<input data-cp-field="max_per_user_per_stream" type="number" min="0" value="${esc(reward.max_per_user_per_stream ?? 0)}"></label>
          <label>Input-Label<input data-cp-field="input_label" value="${esc(reward.input_label || '')}"></label>
          <label>Media-Rolle
            <select data-cp-field="media_role">
              ${['none','sound','image','video','overlay','animation'].map(type => `<option value="${type}" ${reward.media_role === type ? 'selected' : ''}>${type}</option>`).join('')}
            </select>
          </label>
        </div>

        <label class="cp-wide">Prompt<textarea data-cp-field="prompt" rows="2">${esc(reward.prompt || '')}</textarea></label>

        <div class="cp-media-box">
          <input data-cp-field="media_asset_id" id="cpMediaAssetId" value="${esc(reward.media_asset_id || '')}" placeholder="media_asset_id" readonly>
          <div data-media-field data-module-key="channelpoints" data-allowed-types="audio,video,image,animation" data-title="Kanalpunkte-Medium auswählen" data-value-input="#cpMediaAssetId"></div>
          <button type="button" data-cp-action="open-media">Medienverwaltung öffnen</button>
        </div>

        <label class="cp-wide">Action-Payload JSON<textarea data-cp-field="action_payload_json" rows="5">${esc(payload)}</textarea></label>
        <label class="cp-wide">Notizen<textarea data-cp-field="notes" rows="2">${esc(reward.notes || '')}</textarea></label>

        <div class="cp-checks">
          <label><input data-cp-field="system_enabled" type="checkbox" ${boolValue(reward.system_enabled) ? 'checked' : ''}> lokal aktiv</label>
          <label><input data-cp-field="is_paused" type="checkbox" ${boolValue(reward.is_paused) ? 'checked' : ''}> pausiert</label>
          <label><input data-cp-field="require_user_input" type="checkbox" ${boolValue(reward.require_user_input) ? 'checked' : ''}> User-Eingabe</label>
          <label><input data-cp-field="auto_fulfill" type="checkbox" ${boolValue(reward.auto_fulfill) ? 'checked' : ''}> später auto-fulfill</label>
        </div>

        <div class="cp-actions">
          <button type="button" data-cp-action="save">${isNew ? 'Lokal erstellen' : 'Speichern'}</button>
          ${!isNew && reward.system_enabled ? `<button type="button" data-cp-action="disable" data-key="${esc(reward.reward_key)}">Lokal deaktivieren</button>` : ''}
          ${!isNew && !reward.system_enabled ? `<button type="button" data-cp-action="enable" data-key="${esc(reward.reward_key)}">Lokal aktivieren</button>` : ''}
          <button type="button" data-cp-action="bus-test">Bus-Test</button>
        </div>

        <div class="cp-note cp-warning">Twitch wird in STEP494 nicht verändert. Deaktivieren ist nur lokal.</div>
      </section>
    `;
  }

  function render() {
    if (!root) root = document.getElementById('channelpointsModule');
    if (!root) return;

    if (state.loading) {
      root.innerHTML = '<div class="cp-loading">Kanalpunkte werden geladen...</div>';
      return;
    }

    root.innerHTML = `
      <div class="cp-admin">
        <div class="cp-header">
          <div>
            <p class="cp-kicker">Kanalpunkte-System</p>
            <h2>Twitch-Kanalpunkte</h2>
            <p>Lokale Reward-Verwaltung als Basis. Twitch-Sync und produktive Reward-Aktionen folgen später.</p>
          </div>
          <div class="cp-header-actions">
            <button type="button" data-cp-action="reload">Neu laden</button>
          </div>
        </div>

        ${state.error ? `<div class="cp-alert error">${esc(state.error)}</div>` : ''}
        ${state.notice ? `<div class="cp-alert ok">${esc(state.notice)}</div>` : ''}

        ${renderOverview()}
        <div class="cp-layout">
          <div>
            ${renderCategories()}
            ${renderRewardList()}
          </div>
          ${renderEditor()}
        </div>
      </div>
    `;

    wireEvents();
    window.MediaField?.initAll?.(root);
  }

  function wireEvents() {
    root.querySelectorAll('[data-cp-select]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedKey = btn.dataset.cpSelect || '';
        state.selected = null;
        render();
      });
    });

    root.querySelector('[data-cp-action="reload"]')?.addEventListener('click', () => loadAll(true));
    root.querySelector('[data-cp-action="new"]')?.addEventListener('click', () => {
      state.selectedKey = '';
      state.selected = blankReward();
      render();
    });
    root.querySelector('[data-cp-action="open-media"]')?.addEventListener('click', () => {
      window.CGN?.setActiveModule?.('media');
    });
    root.querySelector('[data-cp-action="save"]')?.addEventListener('click', async () => {
      try { state.error = ''; await saveReward(); }
      catch (err) { state.error = err.message || String(err); render(); }
    });
    root.querySelector('[data-cp-action="bus-test"]')?.addEventListener('click', async () => {
      try { state.error = ''; await runBusTest(); }
      catch (err) { state.error = err.message || String(err); render(); }
    });
    root.querySelectorAll('[data-cp-action="disable"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try { state.error = ''; await disableReward(btn.dataset.key || state.selectedKey); }
        catch (err) { state.error = err.message || String(err); render(); }
      });
    });
    root.querySelectorAll('[data-cp-action="enable"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try { state.error = ''; await enableReward(btn.dataset.key || state.selectedKey); }
        catch (err) { state.error = err.message || String(err); render(); }
      });
    });
  }

  registerDashboardModule();

  window.addEventListener('cgn:module-show', event => {
    if (event?.detail?.module === 'channelpoints') loadAll(false);
  });

  return { loadAll, render, registerDashboardModule };
})();