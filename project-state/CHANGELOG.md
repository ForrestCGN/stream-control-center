# CHANGELOG

## STEP413 – Sound-System EventBus Version/Target Cleanup

- `backend/modules/sound_system.js` auf Modulversion `0.1.14` erhöht.
- Sound EventBus Status/Test/Meta nutzt jetzt die feste Modulversion statt Runtime-/Config-Version.
- Runtime-/Config-Version wird zusätzlich als `configVersion` ausgegeben.
- Default-Target für Sound-Bus-Events ist jetzt Capability-basiert: `sound.event_output`.
- Delivery-Klassifizierung auf `capability_scoped_legacy_parallel_event_stream` gesetzt.
- Legacy `/api/sound/*` Routen und alter `sound_system` WebSocket bleiben unverändert.
- Keine Änderung an Queue, Prioritäten, Bundle-Locks, Alert-, VIP-, DB- oder Overlay-Logik.

## STEP412 – Sound-System EventBus Baseline

- Sound-System sendet parallele `sound.*` Events an den Communication Bus.
- EventBus Status/Test/Reset-Routen ergänzt.
- Legacy-Flow bleibt unverändert.

## STEP415 – Sound EventBus Debug Consumer

- Neue Datei: `htdocs/public/tools/sound_eventbus_debug.html`.
- Debug-Client registriert sich am Communication Bus mit Capability `sound.event_output`.
- Client zeigt empfangene `sound.*` Events inkl. Action, Reason, Sound-ID, Label, Kategorie, Request-ID und Raw JSON.
- Keine Änderung an Sound-System-Backend, Queue, Playback, Alert, VIP oder Legacy-Routen.
