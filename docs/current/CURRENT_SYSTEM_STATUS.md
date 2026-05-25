# CURRENT_SYSTEM_STATUS – Alert EventBus Debug Consumer

Stand: STEP417 vorbereitet.

## Aktueller Bus-Stand

Das Sound-System läuft parallel über den EventBus und hat mit `sound_eventbus_debug` bereits einen echten Consumer.

Das Alert-System hat seit STEP416 eine EventBus-Baseline:

```text
channel: alert.status
capability: alert.event_output
statusApiVersion: 1.0.0
busMode: legacy_parallel
deliveryClassification: capability_scoped_alert_event_stream
```

STEP417 ergänzt einen echten Alert-Debug-Consumer:

```text
htdocs/public/tools/alert_eventbus_debug.html
clientId: alert_eventbus_debug
module: alert_system
version: 1.0.0
capability: alert.event_output
```

## Wichtig

Der Debug-Consumer ist read-only aus Sicht der produktiven Systeme. Er registriert sich am Communication Bus und zeigt empfangene Alert-Events an.

## Unverändert

- Alert-Queue bleibt unverändert.
- Alert-Sounds und Alert-TTS laufen weiter über das Sound-System.
- Bundle-/Lock-Logik bleibt unverändert.
- Overlay-Designs und Legacy-Overlay-Flows bleiben unverändert.
- Bestehende `/api/alerts/*` Routen bleiben unverändert.
