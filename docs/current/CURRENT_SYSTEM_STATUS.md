# CURRENT_SYSTEM_STATUS – STEP416 Alert EventBus Baseline

Stand: STEP416 vorbereitet.

## Kurzfassung

Das Alert-System hat eine kontrollierte EventBus-Baseline bekommen.

- Alert-System bleibt zuständig für Regeln, Queue, Visual-Output und Sound-/TTS-Koordination.
- Bestehender Legacy-Overlay-Flow bleibt unverändert.
- Alert-Sounds und Alert-TTS laufen weiterhin über das bestehende Sound-System-/Bundle-System.
- Der neue Alert-EventBus ist zunächst Status-/Diagnose-/Test-Schicht.

## Neue Alert EventBus-Routen

```text
/api/alerts/eventbus/status
/api/alerts/eventbus/test
/api/alerts/eventbus/reset
```

## Runtime-Status

```text
module: alert_system
version: 3.1.0
capability: alert.event_output
statusApiVersion: 1.0.0
busMode: legacy_parallel
deliveryClassification: capability_scoped_alert_event_stream
```

## Wichtig

Der Test-Endpoint verändert keine Queue, startet keine Sounds und steuert kein Overlay.

## Unverändert

- Alert-Queue
- Alert-Regeln
- Sound-System-Bundle-Flow
- Alert-TTS
- Legacy Overlay WebSocket
- DB-Schema
- Asset-Handling
- Dashboard-Routen
