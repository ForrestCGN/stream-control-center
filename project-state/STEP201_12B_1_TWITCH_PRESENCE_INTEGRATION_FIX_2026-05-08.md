# STEP201.12b.1 – Twitch-Presence Integration-Check Fix

Datum: 2026-05-08

## Problem

`GET /api/twitch/presence/integration-check` antwortete mit HTTP 500, obwohl die geprüften Werte vorhanden waren.

Ursache:

```text
buildCheck() übernahm den Fail-Level auch bei erfolgreichen Checks.
```

Dadurch konnten erfolgreiche Pflichtprüfungen `level: "error"` tragen und die Summary zählte Errors.

## Fix

`buildCheck()` setzt nun:

```text
ok=true  -> level=ok
ok=false -> level=failLevel oder error
```

## Betroffene Datei

```text
backend/modules/twitch_presence.js
```

## Nicht geändert

```text
Start/Stop
Reconnect
Chat-Send
Token Refresh
Legacy-Routen
Twitch-Hauptmodul
Overlay-Chat
```

## Test

Nach Deploy:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\STEP201_12B_1_TWITCH_PRESENCE_INTEGRATION_FIX_TEST_LOG.ps1
```

Erwartung:

```text
/api/twitch/presence = 6/6 grün
integration-check summary errors = 0
```
