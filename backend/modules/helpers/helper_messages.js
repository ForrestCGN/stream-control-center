'use strict';

const core = require('./helper_core');

function sanitizeChatMessage(message, maxLength = 450) {
  let text = String(message ?? '').replace(/[\r\n]+/g, ' ').trim();
  const limit = Number.isFinite(Number(maxLength)) && Number(maxLength) > 0 ? Number(maxLength) : 450;
  if (text.length > limit) {
    text = text.slice(0, Math.max(1, limit - 1)).trim() + '…';
  }
  return text;
}

function isEmptyMessage(message) {
  return sanitizeChatMessage(message, 450).length === 0;
}

function streamerbotChatPayload(message, options = {}) {
  const text = sanitizeChatMessage(message, options.maxLength || 450);
  return {
    ok: true,
    type: 'chat_message',
    message: text,
    text,
    target: options.target || 'twitch_chat',
    ts: core.nowIso()
  };
}

function buildSendResponse(message, options = {}) {
  const text = sanitizeChatMessage(message, options.maxLength || 450);
  const reason = String(options.reason || '').trim();
  const target = options.target || 'twitch_chat';

  if (!text) return buildNoSendResponse(reason || 'empty_message', options);

  return {
    ok: options.ok !== false,
    send: true,
    message: text,
    reason,
    target,
    chatMessage: text,
    streamerbot_send: '1',
    streamerbot_message: text,
    streamerbot_reason: reason,
    ts: core.nowIso(),
    ...(options.extra && typeof options.extra === 'object' ? options.extra : {})
  };
}

function buildNoSendResponse(reason = 'no_send', options = {}) {
  const cleanReason = String(reason || 'no_send').trim();
  return {
    ok: options.ok !== false,
    send: false,
    message: '',
    reason: cleanReason,
    target: options.target || 'twitch_chat',
    chatMessage: '',
    streamerbot_send: '0',
    streamerbot_message: '',
    streamerbot_reason: cleanReason,
    ts: core.nowIso(),
    ...(options.extra && typeof options.extra === 'object' ? options.extra : {})
  };
}

function buildErrorResponse(reason = 'error', options = {}) {
  return buildNoSendResponse(reason || 'error', { ...options, ok: false });
}

function splitLongMessage(message, maxLength = 1800) {
  const text = String(message ?? '').trim();
  const limit = Number.isFinite(Number(maxLength)) && Number(maxLength) > 0 ? Number(maxLength) : 1800;
  if (!text) return [];

  const parts = [];
  let rest = text;

  while (rest.length > limit) {
    let cut = rest.lastIndexOf('\n', limit);
    if (cut < 400) cut = rest.lastIndexOf(' ', limit);
    if (cut < 400) cut = limit;

    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  if (rest) parts.push(rest);
  return parts;
}

function discordWebhookPayload(content, options = {}) {
  const parts = splitLongMessage(content, options.maxLength || 1900);

  return {
    ok: true,
    type: 'discord_webhook_payload',
    parts,
    payloads: parts.map(part => {
      const payload = { content: part };
      if (options.avatar_url) payload.avatar_url = options.avatar_url;
      if (options.avatarUrl) payload.avatar_url = options.avatarUrl;
      if (options.username) payload.username = options.username;
      return payload;
    }),
    ts: core.nowIso()
  };
}

function standardSystemMessage(text, options = {}) {
  const prefix = options.prefix || '';
  const suffix = options.suffix || '';
  return sanitizeChatMessage(`${prefix}${text}${suffix}`, options.maxLength || 450);
}

function escapeMentions(text) {
  return String(text ?? '').replace(/@/g, '@\u200B');
}

function replacePlaceholders(template, values = {}) {
  let text = String(template ?? '');
  const map = values && typeof values === 'object' ? values : {};
  for (const [key, value] of Object.entries(map)) {
    const token = new RegExp(`\\{${String(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`, 'g');
    text = text.replace(token, String(value ?? ''));
  }
  return text;
}

module.exports = {
  sanitizeChatMessage,
  isEmptyMessage,
  streamerbotChatPayload,
  buildSendResponse,
  buildNoSendResponse,
  buildErrorResponse,
  splitLongMessage,
  discordWebhookPayload,
  standardSystemMessage,
  escapeMentions,
  replacePlaceholders
};
