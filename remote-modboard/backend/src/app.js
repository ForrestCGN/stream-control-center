'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const { buildSafetyBlock } = require('./security/safety');
const { registerHealthRoutes } = require('./routes/health.routes');
const { registerStatusRoutes } = require('./routes/status.routes');
const { registerAuthModelRoutes } = require('./routes/auth-model.routes');
const { registerAuthStatusRoutes } = require('./routes/auth-status.routes');
const { registerAuthLoginRoutes } = require('./routes/auth-login.routes');
const { registerAuthTwitchRoutes } = require('./routes/auth-twitch.routes');
const { registerLockAuditDiagnosticRoutes } = require('./routes/lock-audit-diagnostic.routes');
const { registerAdminUsersRoutes } = require('./routes/admin-users.routes');
const { registerAdminMiniWriteFoundationRoutes } = require('./routes/admin-mini-write-foundation.routes');
const { registerRoutesRoutes } = require('./routes/routes.routes');

function createApp({ config, moduleBuild }) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '128kb' }));

  app.use((req, res, next) => {
    res.setHeader('X-Remote-Modboard-Build', moduleBuild);
    res.setHeader('X-Remote-Modboard-Mode', 'readonly');
    next();
  });

  const context = { config, moduleBuild, safety: buildSafetyBlock() };
  const publicDir = path.join(__dirname, '..', 'public');

  registerHealthRoutes(app, context);
  registerStatusRoutes(app, context);
  registerAuthModelRoutes(app, context);
  registerAuthStatusRoutes(app, context);
  registerAuthLoginRoutes(app, context);
  registerAuthTwitchRoutes(app, context);
  registerLockAuditDiagnosticRoutes(app, context);
  registerAdminUsersRoutes(app, context);
  registerAdminMiniWriteFoundationRoutes(app, context);
  registerRoutesRoutes(app, context);

  app.get(['/', '/remote', '/modboard'], (req, res) => {
    const indexPath = path.join(publicDir, 'index.html');
    fs.readFile(indexPath, 'utf8', (err, html) => {
      if (err) {
        res.sendFile(indexPath, {
          headers: {
            'X-Remote-Modboard-Ui': 'readonly',
            'Cache-Control': 'no-store'
          }
        });
        return;
      }

      res.setHeader('X-Remote-Modboard-Ui', 'readonly');
      res.setHeader('Cache-Control', 'no-store');
      res.type('html').send(injectRdap28AdminNotesUi(html));
    });
  });

  app.use(express.static(publicDir, {
    index: 'index.html',
    extensions: ['html'],
    fallthrough: true,
    maxAge: '5m',
    setHeaders(res) {
      res.setHeader('X-Remote-Modboard-Ui', 'readonly');
      res.setHeader('Cache-Control', 'public, max-age=300');
    }
  }));

  app.use((req, res) => {
    res.status(404).json({
      ok: false,
      service: 'remote-modboard',
      moduleBuild,
      error: 'not_found',
      path: req.path,
      readOnly: true,
      writeEnabled: false,
      authEnabled: false,
      sessionCreationEnabled: false
    });
  });

  app.use((err, req, res, next) => {
    void next;
    console.error('[remote-modboard] request_failed', err && err.message ? err.message : err);
    res.status(500).json({
      ok: false,
      service: 'remote-modboard',
      moduleBuild,
      error: 'internal_error',
      readOnly: true,
      writeEnabled: false,
      authEnabled: false,
      sessionCreationEnabled: false
    });
  });

  return app;
}

function injectRdap28AdminNotesUi(html) {
  const scriptTag = '<script src="/assets/rdap28-admin-notes.js" defer></script>';
  if (typeof html !== 'string') return html;
  if (html.includes('/assets/rdap28-admin-notes.js')) return html;
  if (html.includes('</body>')) return html.replace('</body>', `  ${scriptTag}\n</body>`);
  return `${html}\n${scriptTag}\n`;
}

module.exports = { createApp, injectRdap28AdminNotesUi };
