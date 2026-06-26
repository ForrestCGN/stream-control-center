'use strict';

const crypto = require('crypto');
const net = require('net');
const tls = require('tls');
const { loadConfig } = require('./config');
const logger = require('./logger');

const WEBSOCKET_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const HEARTBEAT_PROTOCOL_VERSION = 'rdap-agent-heartbeat.v1';
const HANDSHAKE_PROTOCOL_VERSION = 'rdap-agent-handshake.v1';

let socket = null;
let heartbeatTimer = null;
let reconnectTimer = null;
let reconnectAttempt = 0;
let heartbeatSeq = 0;
let shuttingDown = false;

const config = loadConfig();

function start() {
  logger.info('agent_starting', config.logSafeSummary);

  if (!config.ok) {
    logger.error('agent_config_invalid', { reasons: config.errors.join(',') });
    process.exitCode = 2;
    return;
  }

  connect();
}

function connect() {
  if (shuttingDown) return;
  clearReconnectTimer();
  clearHeartbeatTimer();

  logger.info('agent_connecting', {
    wsProtocol: config.protocol,
    wsHostConfigured: true,
    wsPath: config.path,
    agentId: config.agentId
  });

  const options = {
    host: config.hostname,
    port: config.port,
    servername: config.protocol === 'wss' ? config.hostname : undefined
  };

  socket = config.protocol === 'wss'
    ? tls.connect(options, onSocketConnected)
    : net.connect(options, onSocketConnected);

  socket.setNoDelay(true);
  socket.on('data', onSocketData);
  socket.on('close', onSocketClosed);
  socket.on('end', () => logger.info('agent_socket_end'));
  socket.on('error', err => logger.warn('agent_socket_error', { reason: safeReason(err && err.message ? err.message : 'socket_error') }));
}

let handshakeBuffer = Buffer.alloc(0);
let websocketReady = false;

function onSocketConnected() {
  handshakeBuffer = Buffer.alloc(0);
  websocketReady = false;

  const wsKey = crypto.randomBytes(16).toString('base64');
  const request = [
    `GET ${config.path || '/agent-ws'} HTTP/1.1`,
    `Host: ${config.hostname}:${config.port}`,
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Key: ${wsKey}`,
    'Sec-WebSocket-Version: 13',
    `X-SCC-Agent-Id: ${config.agentId}`,
    `X-SCC-Agent-Protocol: ${HANDSHAKE_PROTOCOL_VERSION}`,
    `X-SCC-Agent-Version: ${config.agentVersion}`,
    `Authorization: Bearer ${config.accessKey}`,
    '',
    ''
  ].join('\r\n');

  socket.write(request);
}

function onSocketData(chunk) {
  if (!websocketReady) {
    handshakeBuffer = Buffer.concat([handshakeBuffer, chunk]);
    const text = handshakeBuffer.toString('utf8');
    const headerEnd = text.indexOf('\r\n\r\n');
    if (headerEnd < 0) return;

    const header = text.slice(0, headerEnd);
    if (!header.startsWith('HTTP/1.1 101')) {
      logger.warn('agent_handshake_rejected', { reason: safeHandshakeReason(header) });
      safeSocketEnd();
      return;
    }

    websocketReady = true;
    reconnectAttempt = 0;
    logger.info('agent_connected', { heartbeatIntervalMs: config.heartbeatIntervalMs });
    sendHeartbeat();
    heartbeatTimer = setInterval(sendHeartbeat, config.heartbeatIntervalMs);
    return;
  }

  handleServerFrame(chunk);
}

function handleServerFrame(chunk) {
  if (!Buffer.isBuffer(chunk) || chunk.length < 2) return;
  const opcode = chunk[0] & 0x0f;

  if (opcode === 0x8) {
    logger.info('agent_server_close_frame');
    safeSocketEnd();
    return;
  }

  if (opcode === 0x9) {
    writePong();
  }
}

function sendHeartbeat() {
  if (!socket || socket.destroyed || !websocketReady || shuttingDown) return;

  heartbeatSeq += 1;
  const heartbeat = {
    type: 'heartbeat',
    protocolVersion: HEARTBEAT_PROTOCOL_VERSION,
    agentId: config.agentId,
    agentVersion: config.agentVersion,
    sentAt: new Date().toISOString(),
    seq: heartbeatSeq
  };

  socket.write(makeTextFrame(JSON.stringify(heartbeat)));
  logger.info('heartbeat_sent', { seq: heartbeatSeq, heartbeatIntervalMs: config.heartbeatIntervalMs });
}

function onSocketClosed() {
  clearHeartbeatTimer();
  websocketReady = false;
  handshakeBuffer = Buffer.alloc(0);

  if (shuttingDown) {
    logger.info('agent_stopped');
    return;
  }

  const delayMs = nextReconnectDelayMs();
  logger.warn('agent_disconnected_reconnect_scheduled', { reconnectDelayMs: delayMs });
  reconnectTimer = setTimeout(connect, delayMs);
}

function nextReconnectDelayMs() {
  const backoff = config.reconnectBackoffMs;
  const index = Math.min(reconnectAttempt, backoff.length - 1);
  reconnectAttempt += 1;
  return backoff[index];
}

function makeTextFrame(text) {
  const payload = Buffer.from(text, 'utf8');
  const mask = crypto.randomBytes(4);
  let header;

  if (payload.length < 126) {
    header = Buffer.from([0x81, 0x80 | payload.length]);
  } else {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  }

  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i += 1) masked[i] = payload[i] ^ mask[i % 4];
  return Buffer.concat([header, mask, masked]);
}

function makeCloseFrame() {
  const mask = crypto.randomBytes(4);
  return Buffer.from([0x88, 0x80, ...mask]);
}

function writePong() {
  if (!socket || socket.destroyed) return;
  socket.write(Buffer.from([0x8A, 0x00]));
}

function clearHeartbeatTimer() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

function clearReconnectTimer() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = null;
}

function stop(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info('agent_stopping', { signal: safeReason(signal || 'manual') });
  clearReconnectTimer();
  clearHeartbeatTimer();

  if (socket && !socket.destroyed) {
    try {
      if (websocketReady) socket.write(makeCloseFrame());
      socket.end();
    } catch (err) {
      // ignore shutdown errors; do not log socket details
    }
  }

  setTimeout(() => process.exit(0), 500).unref();
}

function safeSocketEnd() {
  try {
    if (socket && !socket.destroyed) socket.end();
  } catch (err) {
    // ignore
  }
}

function safeReason(value) {
  return String(value || 'unknown').replace(/[^a-zA-Z0-9._:-]/g, '_').slice(0, 80) || 'unknown';
}

function safeHandshakeReason(header) {
  const firstLine = String(header || '').split('\r\n')[0] || 'handshake_rejected';
  return safeReason(firstLine.replace(/^HTTP\/1\.1\s+/, 'http_'));
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));

start();
