# STEP277A_FIX9 Clip-Shoutout Repeat Guard

## Ziel
- Clip-Shoutout bleibt zufällig.
- Die zuletzt gespielten Clips pro Zielkanal werden während der Node-Laufzeit gemerkt.
- Direkte Wiederholungen werden vermieden, sofern genug passende Clips vorhanden sind.
- Wenn nur ein Clip vorhanden ist oder alle Kandidaten durch die Recent-Liste blockiert wären, wird trotzdem ein passender Clip abgespielt.
- Direct Playback ohne MP4-Cache aus STEP277A_FIX7/FIX8 bleibt erhalten.

## Geänderte Dateien
- `backend/modules/clip_shoutout.js`
- `backend/modules/sound_system.js` bleibt als Direct-Playback-Basis aus FIX8 im ZIP enthalten.
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `NEXT_CHAT_START_STEP277A_FIX9_CLIP_REPEAT_GUARD.md`

## Technische Änderungen
- Neue Defaults im Clip-Shoutout:
  - `avoidRecentClips: true`
  - `recentClipMemoryPerChannel: 5`
  - `recentClipFallbackWhenAllBlocked: true`
- Neue In-Memory-Recent-Liste pro Zielkanal.
- `pickClip()` liefert jetzt neben dem Clip auch Debugdaten zur Auswahl.
- Status/Run-Antworten enthalten `clipSelection` und `state.recentClipGuard`.

## Verhalten
- Bei mehreren Clips wird zufällig aus Clips gewählt, die nicht in der Recent-Liste stehen.
- Wenn alle Kandidaten blockiert sind, wird als Fallback wieder aus allen Kandidaten gewählt.
- Bei nur einem Clip wird dieser eine Clip weiterhin abgespielt.

## Tests
- `node --check backend/modules/clip_shoutout.js`
- `node --check backend/modules/sound_system.js`

## Offene Punkte
- Optional später: persistente Recent-Historie über DB, wenn Wiederholungen auch nach Node-Neustart verhindert werden sollen.
