# CURRENT_STATUS – STEP413 Sound-System EventBus Version/Target Cleanup

Aktueller Stand: STEP413 vorbereitet.

## Kurzfassung

Sound-System EventBus-Baseline ist aktiv und bleibt legacy-parallel.

STEP413 korrigiert die beim STEP412-Test sichtbaren Folgepunkte:

- Modulversion für EventBus-Status/Test/Meta: `0.1.14`
- `configVersion` wird separat ausgegeben, falls Runtime/DB/JSON noch eine ältere Config-Version liefert.
- Default-Target für `sound` ist capability-basiert: `sound.event_output`
- Delivery-Klassifizierung: `capability_scoped_legacy_parallel_event_stream`

## Alter Flow bleibt aktiv

```text
/api/sound/* → Sound-System → Queue/Playback → legacy sound_system WebSocket
```

## Neuer paralleler Flow

```text
Sound-System → Communication Bus → channel sound → capability sound.event_output
```

## Bewusst nicht geändert

- Queue
- Prioritäten
- Bundle-Locks
- Alert-System
- VIP-System
- DB-Schema
- Overlay-Designs
