'use strict';

const routes = require('./helpers/helper_routes');
const chatOutput = require('./helpers/helper_chat_output');
const messages = require('./helpers/helper_messages');

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

  return { name: 'chat_output', step: '001' };
}

module.exports = { init };
