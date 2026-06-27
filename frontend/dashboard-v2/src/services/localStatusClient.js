import { apiRequest } from './apiClient.js';

const READ_ONLY_ROUTES = {
  server: '/api/_status',
  stream: '/api/stream-status/current',
  websocket: '/api/diag/ws'
};

export async function getLocalStreamPcStatus() {
  const [server, stream, websocket] = await Promise.allSettled([
    apiRequest(READ_ONLY_ROUTES.server),
    apiRequest(READ_ONLY_ROUTES.stream),
    apiRequest(READ_ONLY_ROUTES.websocket)
  ]);

  return {
    ok: server.status === 'fulfilled' || stream.status === 'fulfilled' || websocket.status === 'fulfilled',
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    routesUsed: Object.values(READ_ONLY_ROUTES),
    server: resultValue(server),
    stream: resultValue(stream),
    websocket: resultValue(websocket),
    errors: {
      server: resultError(server),
      stream: resultError(stream),
      websocket: resultError(websocket)
    }
  };
}

export function getLocalStreamPcStatusFallback() {
  return {
    ok: false,
    readOnly: true,
    writeEnabled: false,
    actionEnabled: false,
    routesUsed: Object.values(READ_ONLY_ROUTES),
    server: null,
    stream: null,
    websocket: null,
    errors: {
      server: '',
      stream: '',
      websocket: ''
    }
  };
}

function resultValue(result) {
  return result.status === 'fulfilled' ? result.value : null;
}

function resultError(result) {
  if (result.status === 'fulfilled') return '';
  return result.reason && result.reason.message ? result.reason.message : String(result.reason || 'unknown_error');
}
