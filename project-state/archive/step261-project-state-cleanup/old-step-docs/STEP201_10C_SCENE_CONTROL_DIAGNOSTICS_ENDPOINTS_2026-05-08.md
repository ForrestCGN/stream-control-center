# STEP201.10c – Scene-Control Diagnose-Endpunkte

Datum: 2026-05-08

## Ziel

Scene-Control wird als kleines Infrastrukturmodul vorsichtig auf den STEP201-Diagnose-Standard gebracht.

Produktiver Prefix bleibt:

```text
/api/scene
```

Es werden keine neuen Alias-Prefixe erfunden.

## Betroffene Datei

```text
backend/modules/scene_control.js
```

## Ergänzte Endpunkte

```text
GET  /api/scene/status
GET  /api/scene/config
GET  /api/scene/settings
GET  /api/scene/routes
GET  /api/scene/integration-check
POST /api/scene/reload
```

## Bestehende Endpunkte bleiben unverändert

```text
GET /api/scene/health
GET /api/scene/list
GET /api/scene/set
```

## Nicht geändert

```text
OBS Shared-Client
Szenenwechsel-Logik
Allowlist-/Alias-Auflösung
Chat-Ausgabe für Szenenliste
StreamDesk
OBS Dashboard
```

## Reload-Verhalten

`POST /api/scene/reload` ist nicht-destruktiv:

```text
destructive: false
sceneSwitchTriggered: false
obsActionTriggered: false
```

Er aktualisiert nur die Scene-Metadaten über den bestehenden Shared-OBS-Weg.

## Test

Nach Deploy:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\STEP201_10C_SCENE_CONTROL_ENDPOINT_TEST_LOG.ps1
```

Erwartung:

```text
/api/scene = 6/6 grün
/api/scene/set ohne Input = 400 erwartet
/api/scene-control = expected_404
/api/scene_control = expected_404
/api/scenes = expected_404
```
