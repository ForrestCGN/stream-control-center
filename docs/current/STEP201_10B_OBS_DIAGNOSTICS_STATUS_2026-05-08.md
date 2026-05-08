# STEP201.10b – OBS Diagnose-Status

OBS nutzt produktiv `/api/obs`.

Ergänzte Diagnose-Endpunkte:

```text
GET  /api/obs/config
GET  /api/obs/settings
GET  /api/obs/routes
GET  /api/obs/integration-check
POST /api/obs/reload
```

Bestehende Runtime-Endpunkte bleiben unverändert.

`POST /api/obs/reload` ist nicht-destruktiv und löst keine OBS-Aktion aus.
