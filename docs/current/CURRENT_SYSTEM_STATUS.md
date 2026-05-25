# CURRENT_SYSTEM_STATUS – STEP413 Sound-System EventBus Version/Target Cleanup

Stand: STEP413 vorbereitet.

## Kurzfassung

Das Sound-System bleibt die zentrale Audio-/Medien-Schicht. Der alte produktive Flow bleibt erhalten:

```text
/api/sound/*
→ Sound-System
→ Queue/Prioritäten/Playback
→ alter sound_system WebSocket
```

Zusätzlich sendet das Sound-System weiterhin parallele EventBus-Events auf dem Channel `sound`.

## STEP413

`backend/modules/sound_system.js` wurde auf Version `0.1.14` vorbereitet.

Bereinigt wurden zwei Punkte aus dem STEP412-Test:

- EventBus-Status zeigt jetzt die feste Modulversion `0.1.14`.
- Die Runtime-/Config-Version wird separat als `configVersion` angezeigt.
- Sound-Events werden standardmäßig über die Capability `sound.event_output` ausgeliefert.
- Delivery-Klassifizierung: `capability_scoped_legacy_parallel_event_stream`.

## Neue/weiterhin vorhandene Sound EventBus-Routen

```text
/api/sound/eventbus/status
/api/sound/eventbus/test
/api/sound/eventbus/reset
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
