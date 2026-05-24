'use strict';

/**
 * STEP278G - Communication Bus Status API.
 *
 * This module exposes the prepared communication bus as test/status API.
 * It does not migrate alert/sound/TTS/VIP traffic and does not replace
 * server.js broadcastWS.
 */

const helperConfig = require('./helpers/helper_config');
const { createCommunicationBus } = require('./helpers/helper_communication');
const security = require('./helpers/helper_security_context');

const DEFAULT_CONFIG = {
  enabled: true,
  testEndpointEnabled: true,
  ackEndpointEnabled: true,
  issueEndpointEnabled: true,
  resetEndpointEnabled: true,
  maxMessageLength: 500
};

let loadedConfig = null;
let bus = null;

function cleanString(value, fallback = '') {
  const clean = String(value ?? '').trim();
  return clean || fallback;
}

function asInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function boolParam(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'ja', 'on', 'y'].includes(v)) return true;
  if (['0', 'false', 'no', 'nein', 'off', 'n'].includes(v)) return false;
  return fallback;
}

function loadCommunicationConfig() {
  const loaded = helperConfig.loadConfig('communication_bus.json', {}, { createIfMissing: false });
  loadedConfig = {
    ...DEFAULT_CONFIG,
    ...(loaded && loaded.data && typeof loaded.data === 'object' ? loaded.data : {})
  };
  return loadedConfig;
}

function getBus() {
  if (!bus) {
    const config = loadCommunicationConfig();
    bus = createCommunicationBus({
      config,
      security
    });
  }
  return bus;
}

function limitedMessage(value, fallback = 'Communication bus test event') {
  const max = Math.max(1, asInt(loadedConfig && loadedConfig.maxMessageLength, 500));
  return cleanString(value, fallback).slice(0, max);
}

function init({ app }) {
  if (!app) throw new Error('communication_bus.init: app fehlt.');

  loadCommunicationConfig();
  getBus();

  app.get('/api/communication/status', (req, res) => {
    const currentBus = getBus();
    res.json({
      ok: true,
      module: 'communication_bus',
      step: 'STEP278G',
      status: currentBus.getStatus()
    });
  });

  app.get('/api/communication/test', (req, res) => {
    if (loadedConfig.testEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'communication_test_endpoint_disabled' });
    }

    const currentBus = getBus();
    const channel = cleanString(req.query.channel, 'test');
    const action = cleanString(req.query.action, 'ping');
    const message = limitedMessage(req.query.message, 'Communication bus test event');
    const requireAck = boolParam(req.query.requireAck, true);
    const replayable = boolParam(req.query.replayable, true);
    const ttlMs = Math.max(0, asInt(req.query.ttlMs, loadedConfig.defaultTtlMs || 15000));

    const result = currentBus.emit({
      type: 'event',
      channel,
      action,
      source: {
        type: 'api',
        id: 'communication_bus_api',
        module: 'communication_bus'
      },
      target: {
        type: cleanString(req.query.targetType, 'all'),
        id: cleanString(req.query.targetId, '*'),
        module: cleanString(req.query.targetModule, ''),
        capability: cleanString(req.query.targetCapability, '')
      },
      payload: {
        message,
        test: true,
        query: {
          channel,
          action,
          requireAck,
          replayable,
          ttlMs
        }
      },
      meta: {
        requireAck,
        replayable,
        ttlMs,
        preview: true,
        productionTarget: false
      }
    });

    res.json({
      ok: result.ok === true,
      module: 'communication_bus',
      test: true,
      result
    });
  });

  app.get('/api/communication/ack', (req, res) => {
    if (loadedConfig.ackEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'communication_ack_endpoint_disabled' });
    }

    const eventId = cleanString(req.query.eventId || req.query.id);
    const clientId = cleanString(req.query.clientId, 'test_client');
    const status = cleanString(req.query.status, 'received');

    if (!eventId) {
      return res.status(400).json({
        ok: false,
        error: 'eventId_required'
      });
    }

    const currentBus = getBus();
    const result = currentBus.ack(eventId, clientId, status, {
      test: true,
      via: 'api',
      message: limitedMessage(req.query.message, 'Ack test')
    });

    res.json({
      ok: result.ok === true,
      module: 'communication_bus',
      ack: true,
      result
    });
  });

  app.get('/api/communication/issue', (req, res) => {
    if (loadedConfig.issueEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'communication_issue_endpoint_disabled' });
    }

    const key = cleanString(req.query.key, 'test_issue');
    const message = limitedMessage(req.query.message, 'Communication bus test issue');
    const level = cleanString(req.query.level, 'warn');
    const throttleMs = Math.max(0, asInt(req.query.throttleMs, loadedConfig.issueThrottleMs || 60000));

    const currentBus = getBus();
    const result = currentBus.trackIssue(key, message, {
      level,
      throttleMs,
      details: {
        test: true,
        via: 'api'
      }
    });

    res.json({
      ok: result.ok === true,
      module: 'communication_bus',
      issue: true,
      result
    });
  });

  app.get('/api/communication/reset', (req, res) => {
    if (loadedConfig.resetEndpointEnabled === false) {
      return res.status(403).json({ ok: false, error: 'communication_reset_endpoint_disabled' });
    }

    if (String(req.query.confirm || '') !== '1') {
      return res.status(400).json({
        ok: false,
        error: 'confirm_required',
        hint: 'Use /api/communication/reset?confirm=1'
      });
    }

    const currentBus = getBus();
    const result = currentBus.reset({
      clients: boolParam(req.query.clients, false),
      events: true,
      issues: true
    });

    res.json({
      ok: true,
      module: 'communication_bus',
      reset: true,
      result
    });
  });

  console.log('[communication_bus] STEP278G API routes registered');
}

module.exports = {
  init
};
