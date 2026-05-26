# CHANGELOG

## 2026-05-26 - STEP483_SHOUTOUT_DASHBOARD_TABS

- Shoutout-Dashboard in Tabs/Unterbereiche aufgeteilt.
- Keine Backend-Logik geändert.

## 2026-05-26 - STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION

### Added

- `clip_shoutout` Version `0.2.11`.
- SQLite-Tabelle `clip_shoutout_inbound_events`.
- `GET /api/clip-shoutout/inbound`.
- `GET /api/clip-shoutout/inbound/stats`.
- `POST /api/clip-shoutout/inbound/debug`.
- Dashboard-Tab `Eingehend`.
- EventBus-Actions `shoutout.inbound.received` und `shoutout.outbound.created`.

### Changed

- `twitch.js` leitet vorhandene EventSub-Notifications `channel.shoutout.receive` und `channel.shoutout.create` an `clip_shoutout.js` weiter.
- `clip_shoutout.js` speichert und aggregiert diese Events.
- `shoutout.js/css` im Dashboard zeigen die neuen Daten.
- Doku-/Projektstand-Dateien auf STEP484 aktualisiert.

### Not changed

- Kein neues Twitch-Modul.
- Kein neues EventSub-System.
- Keine Änderung an Alert-/Loyalty-/Deathcounter-Weiterleitungen.
- Keine produktive `!so`-Umstellung.
- Keine Datenbank ersetzt.
