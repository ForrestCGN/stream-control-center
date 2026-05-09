# Changelog

## 2026-05-09

### STEP203.2 - Twitch Presence Activity Collector

- `backend/modules/twitch_presence.js` um Activity Collector erweitert.
- Neue DB-Tabelle:
  - `twitch_presence_activity`
- Neue Routen:
  - `GET /api/twitch/presence/activity`
  - `GET /api/twitch/presence/activity/active`
  - `POST /api/twitch/presence/activity/clear`
  - `GET /api/twitch/presence/activity/test`
- IRC-Auswertung ergänzt für:
  - JOIN
  - PART
  - PRIVMSG
  - USERNOTICE
- Statuslogik ergänzt:
  - present
  - active
  - left
  - stale
  - unknown
- Subscriber-/Tier-Felder vorbereitet:
  - subscriber
  - subscriberTier
- Noch keine automatische Loyalty-Punktevergabe.
- Bestehende Twitch-Presence-Routen bleiben erhalten.

### STEP203.1 - Loyalty Watch Shadow Hook

- Loyalty Watch Heartbeat mit Intervall-Schutz ergänzt.
