'use strict';

const {
  buildTtsLegacyCleanupStatus,
  executeTtsLegacyCleanup
} = require('../services/media-index-tts-legacy-cleanup.service');

function registerMediaIndexCleanupRoutes(app, context) {
  app.get('/api/remote/media/index/cleanup/tts-generated-legacy/status', async (req, res) => {
    const result = await buildTtsLegacyCleanupStatus({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });

  app.post('/api/remote/media/index/cleanup/tts-generated-legacy', async (req, res) => {
    const result = await executeTtsLegacyCleanup({ context, req });
    res.status(result.status || 200).json(result.body || result);
  });
}

module.exports = { registerMediaIndexCleanupRoutes };
