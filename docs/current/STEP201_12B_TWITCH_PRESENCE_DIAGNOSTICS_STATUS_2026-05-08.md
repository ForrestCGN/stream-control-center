# STEP201.12b – Twitch-Presence Diagnose-Status

Twitch-Presence nutzt produktiv `/api/twitch/presence`.

Ergänzte Diagnose-Endpunkte:

```text
GET  /api/twitch/presence/config
GET  /api/twitch/presence/settings
GET  /api/twitch/presence/routes
GET  /api/twitch/presence/integration-check
POST /api/twitch/presence/reload
```

Bestehende Runtime-Endpunkte bleiben unverändert:

```text
GET /api/twitch/presence/start
GET /api/twitch/presence/stop
GET /api/twitch/presence/status
GET/POST /api/twitch/presence/send
```

`POST /api/twitch/presence/reload` ist nicht-destruktiv und löst keinen Start, Stop, Reconnect und keine Chatnachricht aus.
