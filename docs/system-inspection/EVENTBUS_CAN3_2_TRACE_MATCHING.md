# EVENTBUS CAN-3.2 TRACE MATCHING

Stand: 2026-06-01
Status: Repo-Patch / additive Diagnose

## Ziel

Die Alert-Sound-Korrelation vergleicht jetzt nicht mehr nur `eventUid` und `bundleId`, sondern alle CAN-3.1 Trace-Felder:

```text
eventUid
requestId
correlationId
bundleId
```

## Betroffene Datei

```text
backend/modules/alert_system.js
```

## Änderung

- `alert_system` Version `3.1.6` -> `3.1.7`
- `/api/alerts/eventbus/correlation/status` liefert `traceCorrelationVersion: CAN-3.2`
- `comparison.matchingKeys` zeigt die verwendeten Matching-Felder
- Alert- und Sound-Korrelationszeilen enthalten `requestId`, `correlationId` und `traceIds`
- Matching-Reihenfolge: `eventUid`, danach `requestId`, danach `correlationId`, danach `bundleId`

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
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/status" | ConvertTo-Json -Depth 10
```
