# STEP201.11b – Discord Diagnose-Status

Discord nutzt produktiv `/api/discord`.

Ergänzte Diagnose-Endpunkte:

```text
GET  /api/discord/config
GET  /api/discord/settings
GET  /api/discord/routes
GET  /api/discord/integration-check
POST /api/discord/reload
```

Bestehende Runtime-/Legacy-Endpunkte bleiben unverändert.

`POST /api/discord/reload` ist nicht-destruktiv und löst keine Voice-, Queue-, Sound- oder Posting-Aktion aus.
