# CHANGELOG – Loyalty Giveaways / Glücksrad

## LWG-4M.4 – Giveaway-bound Wheel Foundation
Datum: 2026-06-09 08:21:19 UTC

### Added
- Backend-Grundlage für giveaway-gebundene Wheels.
- Neue Bound-Wheel-Struktur/Tabelle.
- Automatische Erstellung eines Bound-Wheels bei Wheel-Giveaway.
- `GET /api/loyalty/giveaways/:giveawayUid/wheel/bound`
- `PUT /api/loyalty/giveaways/:giveawayUid/wheel/bound`

### Confirmed
- Bound Wheel wird mit `scope=giveaway` erzeugt.
- Bound Wheel speichert `sourcePresetUid`.
- Giveaway speichert `wheelSnapshotUid`.
- Bound-Wheel-Name wird aus Giveaway-Titel gebildet.
- Bearbeitung im Giveaway-Kontext funktioniert.
- Nach `open` bleibt Bound Wheel stabil.

### Notes
- Bound-Wheel-Claim/Spin ist noch nicht final abgeschlossen.
- Bound-Wheel-Status ist aktuell noch `draft`.

## LWG-4M.3 – Close Chat Dispatch

### Added
- `/close` versucht, `giveaway.closed` über `twitch_presence.sendChatMessage()` zu senden.
- Chatfehler blockieren den Statuswechsel nicht.

### Confirmed
- Nicht verbundene Twitch Presence liefert `twitch_chat_not_connected`.
- Giveaway wird trotzdem geschlossen.

## LWG-4M.2 – Close + Draw Guard

### Added
- `/close` Alias für `/close-entries`.
- Draw aus `open` wird blockiert.
- Draw erst nach `closed_for_entries`.

### Confirmed
- Draw aus `open` blockiert.
- Close funktioniert.
- Draw nach Close funktioniert.
