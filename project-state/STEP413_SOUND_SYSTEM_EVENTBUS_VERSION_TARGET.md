# STEP413 – Sound-System EventBus Version/Target Cleanup

## Ziel

STEP413 bereinigt die Folgepunkte aus dem STEP412-Test:

- EventBus-Version darf nicht von alter Runtime-/Config-Version überschrieben werden.
- Sound-Bus-Events sollen nicht pauschal an alle Bus-Clients gehen.

## Umsetzung

- Modulversion: `0.1.14`
- EventBus Capability: `sound.event_output`
- Status-API-Version: `1.0.0`
- Bus-Modus: `legacy_parallel`
- Delivery: `capability_scoped_legacy_parallel_event_stream`
- Default Target Capability: `sound.event_output`

## Alter Flow bleibt unverändert

```text
/api/sound/* → Sound-System → Queue/Playback → legacy sound_system WebSocket
```

## Neuer paralleler Bus-Flow

```text
Sound-System → Communication Bus → channel sound → target.capability sound.event_output
```

## Nicht geändert

- Keine Queue-Logik.
- Keine Prioritäten.
- Keine Bundle-/Lock-Logik.
- Keine Alert-Logik.
- Keine VIP-Logik.
- Keine DB-Migration.
- Keine Overlay-Designs.
- Keine Entfernung alter `/api/sound/*` Routen.
- Keine Entfernung alter `sound_system` WebSocket-Ausgabe.

## Test

```cmd
cd D:\Git\stream-control-center
node --check backend\modules\sound_system.js
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/test?message=STEP413" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status" | ConvertTo-Json -Depth 10
```
