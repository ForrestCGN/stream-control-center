# STEP412 – Sound-System EventBus Baseline

## Ziel

Das Sound-System soll als zentrale Audio-/Medien-Schicht parallel zum bestehenden Legacy-Flow Bus-Events senden.

## Betroffene Datei

- `backend/modules/sound_system.js`

## Änderung

- Modulversion auf `0.1.13` erhöht.
- `soundBus` standardmäßig als paralleler Event-Ausgang aktiviert.
- Runtime-Status von STEP-Feldern auf Version/Capability umgestellt.
- Neue EventBus-Routen ergänzt:
  - `/api/sound/eventbus/status`
  - `/api/sound/eventbus/test`
  - `/api/sound/eventbus/reset`
- Test-Event `sound.test` ergänzt.
- Bus-Meta nutzt `moduleVersion`, `capability`, `statusApiVersion`, `busMode` und `soundSystemRole`.

## Nicht geändert

- Keine Queue-Logik
- Keine Prioritäten
- Keine Bundle-/Lock-Logik
- Keine Alert-Logik
- Keine VIP-Logik
- Keine DB-Migration
- Kein Overlay-Design
- Keine Entfernung alter Routen oder alter WebSocket-Ausgabe

## Test

```cmd
node --check backend\modules\sound_system.js
```

Zusätzlicher Live-Test nach Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/test?message=STEP412" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status" | ConvertTo-Json -Depth 10
```

## Erwartung

- `version: 0.1.13`
- `capability: sound.event_output`
- `statusApiVersion: 1.0.0`
- `busMode: legacy_parallel`
- `legacyWebSocketFlow: unchanged`
- `legacyApiFlow: unchanged`
- `stats.errors: 0`
