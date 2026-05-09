# Changelog

## 2026-05-09

### STEP203.6 - Loyalty Real Event Bonuses Shadow

- `backend/modules/loyalty.js` auf Version `0.1.4` erhöht.
- Neue Tabelle `loyalty_events`.
- Neue Event-Bonus-Engine für echte/testbare Events.
- Neue Routen:
  - `GET /api/loyalty/events`
  - `POST /api/loyalty/events/ingest`
  - `GET /api/loyalty/events/test/:type`
- `backend/modules/twitch.js` leitet echte EventSub-Events zusätzlich an Loyalty weiter.
- Dashboard Events-Tab zeigt Loyalty Events und Runner Events.
