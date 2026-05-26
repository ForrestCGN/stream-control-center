# STEP417 – Alert EventBus Debug Consumer

## Ziel

Ein echter Debug-Consumer für `alert.event_output`, damit `alert.status` Events nicht nur erzeugt, sondern auch sichtbar ausgeliefert werden können.

## Neue Datei

- `htdocs/public/tools/alert_eventbus_debug.html`

## Client-Registrierung

```text
clientId: alert_eventbus_debug
clientType: debug_tool
module: alert_system
mode: debug
version: 1.0.0
capabilities:
- alert.event_output
- alert.status
- ack
```

## Nicht geändert

- Keine Alert-Queue-Logik
- Keine Alert-TTS-Logik
- Keine Sound-System-Bundle-Logik
- Keine Overlay-Designs
- Keine DB-Migration
- Keine Backend-Routenänderung
- Keine Entfernung alter Alert-/Overlay-/Sound-Flows

## Test

Siehe `project-state/NEXT_STEPS.md`.
