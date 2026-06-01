# EVENTBUS CAN-3.1 TRACE IDS

Stand: 2026-06-01
Status: Repo-Patch / additive Diagnose

## Ziel

Alert- und Sound-Events sollen fuer die kommende Handshake-Haertung dieselben Trace-Felder sichtbar machen:

```text
eventUid
requestId
correlationId
bundleId
traceIds
```

## Betroffene Dateien

```text
backend/modules/alert_system.js
backend/modules/sound_system.js
```

## Änderung

- `alert_system` Version `3.1.5` -> `3.1.6`
- `sound_system` Version `0.1.19` -> `0.1.20`
- Alert-EventBus-Kontext enthaelt jetzt `requestId`, `correlationId` und `traceIds`.
- Alert/Sound-Korrelationseintraege enthalten jetzt dieselben Trace-Felder.
- Sound-Bus-Kontext enthaelt jetzt `traceIds` mit `requestId`, `correlationId`, `alertEventUid`, `bundleId`.

## Nicht geändert

```text
Keine Queue-Logik geändert
Keine Sound-Playback-Logik geändert
Keine Overlay-Logik geändert
Keine TTS-Logik geändert
Keine DB-/Config-Änderung
Keine Recovery-Automatik
```

## Tests

```powershell
node -c backend\modules\alert_system.js
node -c backend\modules\sound_system.js
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/status" | ConvertTo-Json -Depth 8
```
