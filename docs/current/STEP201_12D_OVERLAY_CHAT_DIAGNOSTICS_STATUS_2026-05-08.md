# STEP201.12d – Overlay-Chat Diagnose-Status

Overlay-Chat nutzt produktiv `/api/overlay/chat`.

Ergänzte Diagnose-Endpunkte:

```text
GET  /api/overlay/chat/config
GET  /api/overlay/chat/settings
GET  /api/overlay/chat/routes
GET  /api/overlay/chat/integration-check
POST /api/overlay/chat/reload
```

Bestehende Runtime-Endpunkte bleiben unverändert.

`POST /api/overlay/chat/reload` ist nicht-destruktiv und löst keinen Start, Stop, Reconnect, Clear oder Emote-Reload aus.
