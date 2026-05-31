# CHANGELOG – STEP278 Vorbereitung

Stand: 2026-05-31 08:14 UTC

## Geändert

- `clip_system.json` für heutigen Test angepasst:
  - `clipShoutout.officialShoutout.enabled = true`
  - `clipShoutout.officialShoutout.liveGateEnabled = false`

## Nicht geändert

- Keine Script-Dateien geändert.
- Kein Overlay-Design geändert.
- Keine Datenbank geändert.
- Keine Queue gelöscht.
- Keine Funktionalität entfernt.

## Grund

Die Official-Queue blieb auf `waiting_stream_live_offline`, obwohl Shoutouts während des Streams beobachtet werden sollen. Für den heutigen Test wird die interne Live-Gate-Sperre deaktiviert. Twitch selbst kann weiterhin ablehnen, wenn ein offizieller Shoutout nicht erlaubt ist.

## Beobachtung

Nach der Änderung zeigte der Status:

- `officialQueue.liveGate.enabled = false`
- `officialQueue.pending = 10`
- `officialShoutout.globalCooldownMs = 120000`
- `officialShoutout.targetCooldownMs = 3600000`
- `state.officialShoutout.lastBusEvent.action = shoutout.official.waiting_cooldown`
