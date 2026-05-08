# STEP201.10c – Scene-Control Diagnose-Status

Scene-Control nutzt produktiv `/api/scene`.

Ergänzte Diagnose-Endpunkte:

```text
GET  /api/scene/status
GET  /api/scene/config
GET  /api/scene/settings
GET  /api/scene/routes
GET  /api/scene/integration-check
POST /api/scene/reload
```

Bestehende Runtime-Endpunkte bleiben unverändert:

```text
GET /api/scene/health
GET /api/scene/list
GET /api/scene/set
```

`POST /api/scene/reload` ist nicht-destruktiv und löst keinen Szenenwechsel aus.
