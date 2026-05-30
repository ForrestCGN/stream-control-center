(function () {
  'use strict';

  const DEFAULTS = {
    clientId: '',
    clientType: 'overlay',
    mode: 'obs',
    module: '',
    name: '',
    version: '0.1.0',
    heartbeatIntervalMs: 5000,
    reconnectMinMs: 1000,
    reconnectMaxMs: 15000,
    debug: false,
    capabilities: ['overlay.heartbeat'],
    meta: {}
  };

  const state = {
    ws: null,
    config: null,
    connected: false,
    reconnectTimer: null,
    heartbeatTimer: null,
    reconnectAttempts: 0,
    lastHelloAckAt: '',
    lastHeartbeatAckAt: '',
    lastError: ''
  };

  function currentScript() {
    return document.currentScript || (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1] || null;
    })();
  }

  function attr(script, name, fallback) {
    if (!script) return fallback;
    const value = script.getAttribute(name);
    return value === null || value === undefined || value === '' ? fallback : value;
  }

  function bool(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    const raw = String(value).trim().toLowerCase();
    if (['1', 'true', 'yes', 'ja', 'on'].includes(raw)) return true;
    if (['0', 'false', 'no', 'nein', 'off'].includes(raw)) return false;
    return fallback;
  }

  function asInt(value, fallback) {
    const n = Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function log() {
    if (!state.config || !state.config.debug) return;
    console.log.apply(console, ['[overlay_bus_client]'].concat(Array.from(arguments)));
  }

  function warn() {
    if (!state.config || !state.config.debug) return;
    console.warn.apply(console, ['[overlay_bus_client]'].concat(Array.from(arguments)));
  }

  function buildWsUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return protocol + '//' + window.location.host;
  }

  function sanitizeId(value) {
    return String(value || '').trim().replace(/[^a-zA-Z0-9_.:-]/g, '_');
  }

  function readConfig(options) {
    const script = currentScript();
    const fromGlobal = window.CGN_OVERLAY_BUS || window.CGNOverlayBusConfig || {};
    const merged = Object.assign({}, DEFAULTS, fromGlobal || {}, options || {});

    merged.clientId = sanitizeId(attr(script, 'data-overlay-id', merged.clientId || merged.id || ''));
    merged.clientType = attr(script, 'data-client-type', merged.clientType || 'overlay');
    merged.mode = attr(script, 'data-mode', merged.mode || 'obs');
    merged.module = sanitizeId(attr(script, 'data-module', merged.module || merged.clientId || 'overlay'));
    merged.name = attr(script, 'data-name', merged.name || merged.module || merged.clientId || 'Overlay');
    merged.version = attr(script, 'data-version', merged.version || '0.1.0');
    merged.debug = bool(attr(script, 'data-debug', merged.debug ? '1' : ''), !!merged.debug || /[?&]debug=1\b/.test(window.location.search));
    merged.heartbeatIntervalMs = Math.max(1000, asInt(attr(script, 'data-heartbeat-ms', merged.heartbeatIntervalMs), DEFAULTS.heartbeatIntervalMs));
    merged.reconnectMinMs = Math.max(500, asInt(merged.reconnectMinMs, DEFAULTS.reconnectMinMs));
    merged.reconnectMaxMs = Math.max(merged.reconnectMinMs, asInt(merged.reconnectMaxMs, DEFAULTS.reconnectMaxMs));

    if (!merged.clientId) merged.clientId = 'overlay:' + (merged.module || 'unknown');
    if (!String(merged.clientId).startsWith('overlay:') && merged.clientType === 'overlay') {
      merged.clientId = 'overlay:' + merged.clientId;
    }

    merged.meta = Object.assign({}, merged.meta || {}, {
      url: window.location.pathname + window.location.search,
      path: window.location.pathname,
      title: document.title || '',
      userAgent: navigator.userAgent || '',
      loadedAt: nowIso()
    });

    return merged;
  }

  function send(payload) {
    if (!state.ws || state.ws.readyState !== WebSocket.OPEN) return false;
    try {
      state.ws.send(JSON.stringify(payload));
      return true;
    } catch (err) {
      state.lastError = err && err.message ? err.message : String(err);
      warn('send failed', state.lastError);
      return false;
    }
  }

  function hello() {
    const cfg = state.config;
    return send({
      type: 'bus_hello',
      clientId: cfg.clientId,
      clientType: cfg.clientType,
      mode: cfg.mode,
      module: cfg.module,
      name: cfg.name,
      version: cfg.version,
      capabilities: cfg.capabilities,
      meta: cfg.meta
    });
  }

  function heartbeat() {
    const cfg = state.config;
    return send({
      type: 'bus_heartbeat',
      clientId: cfg.clientId,
      clientType: cfg.clientType,
      mode: cfg.mode,
      module: cfg.module,
      name: cfg.name,
      version: cfg.version,
      capabilities: cfg.capabilities,
      state: document.hidden ? 'hidden' : 'visible',
      lastError: state.lastError || '',
      meta: {
        path: window.location.pathname,
        visible: !document.hidden,
        heartbeatAt: nowIso()
      }
    });
  }

  function startHeartbeat() {
    stopHeartbeat();
    heartbeat();
    state.heartbeatTimer = window.setInterval(heartbeat, state.config.heartbeatIntervalMs);
  }

  function stopHeartbeat() {
    if (state.heartbeatTimer) window.clearInterval(state.heartbeatTimer);
    state.heartbeatTimer = null;
  }

  function scheduleReconnect() {
    if (state.reconnectTimer) return;
    const delay = Math.min(state.config.reconnectMaxMs, state.config.reconnectMinMs * Math.max(1, state.reconnectAttempts));
    state.reconnectTimer = window.setTimeout(function () {
      state.reconnectTimer = null;
      connect();
    }, delay);
    log('reconnect scheduled', delay);
  }

  function handleMessage(event) {
    let data = null;
    try { data = JSON.parse(event.data); }
    catch (_) { return; }

    if (!data || typeof data !== 'object') return;

    if (data.type === 'hello_ack') {
      state.lastHelloAckAt = nowIso();
      log('hello ack', data);
      return;
    }

    if (data.type === 'heartbeat_ack') {
      state.lastHeartbeatAckAt = nowIso();
      return;
    }

    if (data.id && data.meta && data.meta.requireAck === true) {
      send({
        type: 'bus_ack',
        clientId: state.config.clientId,
        eventId: data.id,
        status: 'received',
        details: {
          clientType: state.config.clientType,
          module: state.config.module,
          at: nowIso()
        }
      });
    }

    window.dispatchEvent(new CustomEvent('cgn:overlay-bus-message', { detail: data }));
  }

  function connect() {
    if (state.ws && (state.ws.readyState === WebSocket.OPEN || state.ws.readyState === WebSocket.CONNECTING)) return;

    try {
      state.ws = new WebSocket(buildWsUrl());
    } catch (err) {
      state.lastError = err && err.message ? err.message : String(err);
      state.reconnectAttempts += 1;
      warn('websocket create failed', state.lastError);
      scheduleReconnect();
      return;
    }

    state.ws.addEventListener('open', function () {
      state.connected = true;
      state.reconnectAttempts = 0;
      state.lastError = '';
      hello();
      startHeartbeat();
      window.dispatchEvent(new CustomEvent('cgn:overlay-bus-open', { detail: publicStatus() }));
      log('connected', state.config.clientId);
    });

    state.ws.addEventListener('message', handleMessage);

    state.ws.addEventListener('close', function () {
      state.connected = false;
      state.reconnectAttempts += 1;
      stopHeartbeat();
      window.dispatchEvent(new CustomEvent('cgn:overlay-bus-close', { detail: publicStatus() }));
      scheduleReconnect();
    });

    state.ws.addEventListener('error', function () {
      state.lastError = 'websocket_error';
      try { state.ws.close(); } catch (_) {}
    });
  }

  function publicStatus() {
    return {
      clientId: state.config ? state.config.clientId : '',
      clientType: state.config ? state.config.clientType : '',
      module: state.config ? state.config.module : '',
      name: state.config ? state.config.name : '',
      connected: state.connected,
      reconnectAttempts: state.reconnectAttempts,
      lastHelloAckAt: state.lastHelloAckAt,
      lastHeartbeatAckAt: state.lastHeartbeatAckAt,
      lastError: state.lastError
    };
  }

  function start(options) {
    state.config = readConfig(options || {});
    connect();
    return publicStatus();
  }

  function stop() {
    stopHeartbeat();
    if (state.reconnectTimer) window.clearTimeout(state.reconnectTimer);
    state.reconnectTimer = null;
    if (state.ws) {
      try { state.ws.close(); } catch (_) {}
    }
    state.ws = null;
    state.connected = false;
    return publicStatus();
  }

  window.CGNOverlayBusClient = {
    start,
    stop,
    heartbeat,
    send,
    status: publicStatus
  };

  start();
})();
