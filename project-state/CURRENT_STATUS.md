# CURRENT_STATUS – Alert EventBus Debug Consumer

Aktueller Stand: STEP417 vorbereitet.

## Kurzfassung

Das Alert-System besitzt seit STEP416 eine EventBus-Baseline auf `alert.status` mit `alert.event_output`.

STEP417 ergänzt einen echten Debug-Consumer:

- Datei: `htdocs/public/tools/alert_eventbus_debug.html`
- Client-ID: `alert_eventbus_debug`
- Modul: `alert_system`
- Version: `1.0.0`
- Capability: `alert.event_output`

## Wichtig

Der Debug-Client ist nur ein Beobachter/Consumer. Er verändert keine Alert-Queue, startet keine Sounds, steuert keine Overlays und verändert keine Bundle-/TTS-Logik.

## Bestehende produktive Flows bleiben unverändert

- Alert-Queue bleibt im Alert-System.
- Alert-Sounds und Alert-TTS laufen weiter über das Sound-System.
- Bestehende Alert-Overlay-/WebSocket-Flows bleiben aktiv.
- Bestehende `/api/alerts/*` Routen bleiben aktiv.
