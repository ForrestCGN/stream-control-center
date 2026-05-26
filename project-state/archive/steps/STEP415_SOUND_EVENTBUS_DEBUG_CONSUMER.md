# STEP415 – Sound EventBus Debug Consumer

## Ziel

Ein echter Debug-/Consumer-Client für den Sound-EventBus wird ergänzt.

Der Client registriert sich am Communication Bus mit Capability `sound.event_output` und zeigt empfangene `sound.*` Events sichtbar an.

## Neue Datei

- `htdocs/public/tools/sound_eventbus_debug.html`

## Client-Registrierung

```json
{
  "type": "bus_hello",
  "clientId": "sound_eventbus_debug",
  "clientType": "debug_tool",
  "module": "sound_system",
  "mode": "debug",
  "version": "1.0.0",
  "capabilities": ["sound.event_output", "sound.status", "ack"]
}
```

## Bewusst nicht geändert

- Kein Sound-System-Backend
- Keine Queue-Logik
- Keine Prioritäten
- Keine Bundle-/Lock-Logik
- Keine Alert-Logik
- Keine VIP-Logik
- Keine DB-Migration
- Kein Overlay-Design
- Keine alten `/api/sound/*` Routen
- Keine alte `sound_system` WebSocket-Ausgabe

## Test

```text
http://127.0.0.1:8080/public/tools/sound_eventbus_debug.html
```

Danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/test?message=STEP415" | ConvertTo-Json -Depth 10
```

Erwartung:

- `deliveredTo` enthält `sound_eventbus_debug`.
- Der Browser zeigt das `sound.test` Event.
- `stats.errors` bleibt `0`.
