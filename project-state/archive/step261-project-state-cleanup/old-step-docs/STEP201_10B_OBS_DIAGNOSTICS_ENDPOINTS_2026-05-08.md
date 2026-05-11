# STEP201.10b – OBS Diagnose-Endpunkte

Datum: 2026-05-08

## Ziel

OBS wird als Infrastrukturmodul vorsichtig auf den STEP201-Diagnose-Standard gebracht.

Produktiver Prefix:

```text
/api/obs
```

Legacy-Prefix bleibt:

```text
/obs
```

## Betroffene Datei

```text
backend/modules/obs.js
```

## Ergänzte Endpunkte

```text
GET  /api/obs/config
GET  /api/obs/settings
GET  /api/obs/routes
GET  /api/obs/integration-check
POST /api/obs/reload
```

`GET /api/obs/status` existierte bereits und bleibt unverändert.

## Nicht geändert

```text
OBS-Verbindung
OBS Shared-Client
Szenenwechsel
Preview-Szene
Replay Start/Stop/Save
Audio Mute/Unmute/Volume
Filter-Steuerung
Media-Steuerung
Dashboard Frontend
StreamDesk
Scene-Control
```

## Reload-Verhalten

`POST /api/obs/reload` ist nicht-destruktiv:

```text
destructive: false
obsActionTriggered: false
replayActionTriggered: false
sceneSwitchTriggered: false
```

Der Reload lädt nur Dashboard-Config und versucht einen Status-Snapshot zu aktualisieren.

## Test

Nach Deploy:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\STEP201_10B_OBS_ENDPOINT_TEST_LOG.ps1
```

Erwartung:

```text
/api/obs = 6/6 grün
/obs/status bleibt verfügbar
```

OBS-Verbindungsprobleme können im Integration-Check als Warnung erscheinen, wenn OBS geschlossen ist oder WebSocket nicht erreichbar ist.
