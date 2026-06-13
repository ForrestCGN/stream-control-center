# CURRENT CHAT HANDOFF – EVS-19e Text Options Regression Fix

Stand: 2026-06-13

## Zweck

EVS-19e repariert einen Regressionsfehler aus EVS-19d. In `processTextChatMessage(chat, options)` wurde versehentlich `context.eventUid` verwendet. Diese Funktion besitzt aber nur `options`. Dadurch brach der Parallel-Test mit `context is not defined` ab.

## Änderung

- `MODULE_VERSION = 0.5.11`
- `MODULE_BUILD = STEP_EVS_19E_TEXT_OPTIONS_REGRESSION_FIX`
- `processTextChatMessage(...)` nutzt wieder `options.eventUid`.
- `processParallelChatMessage(...)` nutzt weiterhin korrekt `context.eventUid`.

## Nicht geändert

- Keine direkte Twitch-Ausgabe.
- Kein Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Keine DB-Migration.
- Keine Dashboard-Änderung.
- Sound/Text-UND-Regel bleibt erhalten.

## Pflichtprüfung

```powershell
node -c .\backend\modules\stream_events.js
.\stepdone.cmd "EVS-19e Text Options Regression Fix"
```

Danach Status prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object ok,moduleVersion,moduleBuild,lastError
```

Erwartung:

```text
moduleVersion = 0.5.11
moduleBuild = STEP_EVS_19E_TEXT_OPTIONS_REGRESSION_FIX
lastError leer
```
