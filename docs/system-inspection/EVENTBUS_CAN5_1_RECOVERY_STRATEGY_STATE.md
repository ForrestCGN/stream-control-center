# EVENTBUS CAN-5.1 RECOVERY STRATEGY STATE

Stand: 2026-06-01
Status: read-only Diagnose

## Ergebnis

CAN-5.1 ergänzt den Bus-Diagnostics-Status um einen rein lesenden Recovery-Strategy-Block.

## Betroffene Datei

- backend/modules/bus_diagnostics.js

## Neue Ausgabe

```text
recoveryStrategyState
summary.recoveryStrategyMode
summary.recoveryStrategyState
summary.recoveryAllowedActions
summary.recoveryBlockedActions
```

## Prinzip

```text
mode: read_only
automationEnabled: false
flowTouched: false
blockedActions: auto_replay_alert, auto_replay_sound, auto_retry_overlay, auto_recovery
```

## Mögliche States

```text
idle
ok_no_recovery_needed
observe_waiting_for_ack
blocked_missing_visual_ack
blocked_no_overlay_client
blocked_unmatched_alert_sound
correlation_status_unavailable
observe_warning
observe
```

## Nicht geändert

```text
Keine Queue-Logik geändert
Keine Sound-Playback-Logik geändert
Keine Overlay-Ausgabe geändert
Keine TTS-Logik geändert
Keine Recovery-Automatik aktiviert
Keine DB-/Config-Migration
```

## Prüfbefehle

```powershell
node -c backend\modules\bus_diagnostics.js
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check" | ConvertTo-Json -Depth 12
```