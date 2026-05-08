# STEP201.8 – Deathcounter V2 Diagnose-Endpunkte

Datum: 2026-05-08

## Ziel

Deathcounter V2 wird auf den STEP201-Diagnose-Standard gebracht.

Produktiver Prefix bleibt:

```text
/api/deathcounter/v2
```

Folgende Prefixe werden bewusst nicht als Alias ergänzt:

```text
/api/deathcounter
/api/deathcounter-v2
/api/deathcounter_v2
/api/death-counter
```

## Betroffene Datei

```text
backend/modules/deathcounter_v2.js
```

## Ergänzte Endpunkte

```text
GET  /api/deathcounter/v2/status
GET  /api/deathcounter/v2/config
GET  /api/deathcounter/v2/settings
GET  /api/deathcounter/v2/routes
GET  /api/deathcounter/v2/integration-check
POST /api/deathcounter/v2/reload
```

## Nicht geändert

```text
/api/deathcounter/v2/state
/api/deathcounter/v2/players
/api/deathcounter/v2/overlay
/api/deathcounter/v2/show
/api/deathcounter/v2/hide
/api/deathcounter/v2/game
/api/deathcounter/v2/sync/channelinfo
/api/deathcounter/v2/stream-online-sync
/api/deathcounter/v2/rip
/api/deathcounter/v2/del
/api/deathcounter/v2/tode
/api/deathcounter/v2/session-reset
/api/deathcounter/v2/total-reset
WebSocket-Broadcasts
JSON-State-Datei
Overlay-Datei
```

## Reload-Verhalten

`POST /api/deathcounter/v2/reload` ist nicht-destruktiv.

Er normalisiert nur die vorhandene State-Datei über die bestehenden Read/Write-Helfer und meldet:

```text
destructive: false
statePreserved: true
countersPreserved: true
overlayPreserved: true
```

## Test

Nach Deploy:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\STEP201_8_DEATHCOUNTER_ENDPOINT_TEST_LOG.ps1
```

Erwartung:

```text
/api/deathcounter/v2 = 6/6 grün
/api/deathcounter = expected_404
/api/deathcounter-v2 = expected_404
```
