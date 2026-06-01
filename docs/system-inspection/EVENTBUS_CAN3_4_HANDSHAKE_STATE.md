# EVENTBUS CAN-3.4 HANDSHAKE STATE DIAGNOSE

Stand: 2026-06-01
Status: Repo-Patch / additive Diagnose

## Ziel

Die bestehende Alert/Sound-Correlation bekommt einen kompakten read-only `handshakeState`.

## Betroffene Datei

```text
backend/modules/alert_system.js
```

## Änderung

- `alert_system` Version `3.1.7` -> `3.1.8`
- `/api/alerts/eventbus/correlation/status` liefert zusätzlich `handshakeState`.
- `traceCorrelationVersion` wird auf `CAN-3.4` gesetzt.

## Nicht geändert

```text
Keine Queue-Logik geändert
Keine Sound-Playback-Logik geändert
Keine Overlay-Logik geändert
Keine TTS-Logik geändert
Keine DB-/Config-Änderung
Keine Recovery-Automatik
```

## Test

```powershell
node -c backend\modules\alert_system.js
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/status" | ConvertTo-Json -Depth 10
```
