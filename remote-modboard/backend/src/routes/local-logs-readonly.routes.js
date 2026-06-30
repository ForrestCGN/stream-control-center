'use strict';

const {
  buildLocalLogsStatus,
  buildLocalLogsList,
  buildLocalLogsRoutesSummary
} = require('../services/local-logs-readonly.service');

function registerLocalLogsReadonlyRoutes(app, context) {
  app.get('/api/remote/local/logs/status', (req, res) => {
    void req;
    res.json(buildLocalLogsStatus(context));
  });

  app.get('/api/remote/local/logs/list', (req, res) => {
    res.json(buildLocalLogsList(context, req));
  });
}

module.exports = {
  registerLocalLogsReadonlyRoutes,
  buildLocalLogsRoutesSummary
};
