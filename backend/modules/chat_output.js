'use strict';

const routes = require('./helpers/helper_routes');
const chatOutput = require('./helpers/helper_chat_output');
const messages = require('./helpers/helper_messages');

const MODULE_NAME = 'chat_output';
const MODULE_VERSION = '0.1.0';
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  type: 'runtime',
  category: 'messages',
  description: 'Chat-Ausgabe-API ueber helper_chat_output.',
  routesPrefix: ['/api/chat-output'],
  bus: {
    registered: false,
    heartbeat: false,
    emits: [],
    listens: []
  },
  legacy: false
};

function init(ctx) {
  const app = ctx.app;
  chatOutput.loadConfig();

  routes.registerGet(app, ['/api/chat-output/status'], (req, res) => {
    res.json(chatOutput.getStatus());
  });

  routes.registerPost(app, ['/api/chat-output/send'], async (req, res) => {
    try {
      const body = req.body || {};
      const message = body.message || body.text || '';
      const result = await chatOutput.sendChatMessage(message, {
        source: body.source || 'api_chat_output',
        reason: body.reason || 'manual_send',
        prefer: body.prefer,
        fallbackToStreamer: body.fallbackToStreamer,
        fallbackToStreamerbot: body.fallbackToStreamerbot,
        directSendEnabled: body.directSendEnabled,
        maxLength: body.maxLength
      });
      res.json(result);
    } catch (err) {
      res.status(500).json(messages.buildErrorResponse('chat_output_exception', {
        extra: {
          module: 'chat_output',
          error: err.message || String(err)
        }
      }));
    }
  });

  routes.registerPost(app, ['/api/chat-output/reload'], (req, res) => {
    chatOutput.loadConfig();
    res.json({ ok: true, reloaded: true, status: chatOutput.getStatus() });
  });

  return { name: MODULE_NAME, version: MODULE_VERSION, step: '001' };
}

module.exports = { MODULE_META, MODULE_VERSION, version: MODULE_VERSION, init };
