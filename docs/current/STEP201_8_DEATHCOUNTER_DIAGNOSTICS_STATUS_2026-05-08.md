# STEP201.8 – Deathcounter V2 Diagnose-Status

Deathcounter V2 nutzt produktiv `/api/deathcounter/v2`.

Der STEP ergänzt Diagnose- und Standard-Endpunkte nur auf diesem Prefix.

## Standard-Endpunkte

```text
GET  /api/deathcounter/v2/status
GET  /api/deathcounter/v2/config
GET  /api/deathcounter/v2/settings
GET  /api/deathcounter/v2/routes
GET  /api/deathcounter/v2/integration-check
POST /api/deathcounter/v2/reload
```

## Alias-Entscheidung

Keine neuen Alias-Prefixe.

```text
/api/deathcounter
/api/deathcounter-v2
/api/deathcounter_v2
/api/death-counter
```

bleiben bewusst unregistriert.

## Sicherheit

Keine Counterstände werden zurückgesetzt.
Kein Overlay-State wird gelöscht.
Keine WebSocket-Broadcast-Logik wurde geändert.
