# STEP201.8.1 – Deathcounter V2 Status-Fix

Datum: 2026-05-08

## Problem

Nach STEP201.8 waren fünf von sechs Diagnose-Endpunkten grün.
Nur dieser Endpunkt lieferte 500:

```text
GET /api/deathcounter/v2/status
```

## Ursache

Der neue Status-Endpunkt nutzte direkt:

```js
config.getProjectRoot()
```

Diese Helper-Funktion ist nicht in jeder Live-Konstellation verfügbar. Dadurch konnte nur `/status` mit 500 abbrechen, während `/config`, `/settings`, `/routes`, `/integration-check` und `/reload` korrekt liefen.

## Fix

Der Status-Endpunkt nutzt jetzt:

```js
getProjectRootSafe()
```

mit Fallback auf:

```js
config.resolveFromRoot()
path.resolve(__dirname, '..', '..')
```

## Nicht geändert

```text
Counter-Logik
Overlay-Logik
show/hide/toggle
rip/del/tode
session-reset
total-reset
overlay replace
WebSocket-Broadcasts
JSON-State-Datei
Overlay-Datei
```

## Test

Nach Deploy:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\STEP201_8_1_DEATHCOUNTER_STATUS_FIX_TEST.ps1
```

Erwartung:

```text
/api/deathcounter/v2 = 6/6 grün
```
