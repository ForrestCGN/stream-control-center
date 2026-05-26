# CHANGELOG

## 2026-05-26 - STEP487_COMMUNICATION_BUS_MODULE_CONTRACT

- Neuen Helper `backend/modules/helpers/helper_communication_contract.js` ergänzt.
- Backend-Modul-zu-Modul-Contract für den bestehenden Communication Bus vorbereitet.
- Ergänzt: Modul-Registrierung, Abmeldung, Heartbeat, Status, Subscribe/Unsubscribe, Modul-Client und Contract-Status.
- `bus.emit` wird durch den Contract additiv dekoriert, wenn ein Modul `ensureModuleBus(bus)` nutzt.
- Bestehende Bus-/WebSocket-/Replay-/ACK-Flows bleiben unverändert.
- Keine Änderung an `communication_bus.js` oder `helper_communication.js`.
- Keine neuen Routen, keine DB-Migration, kein Dashboard-Umbau.
- Doku für Communication Bus und neuen Contract-Helper aktualisiert.

## 2026-05-26 - STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP

- Live-Test-/Decision-Prep im bestehenden `clip_shoutout.js` ergänzt.
- `clip_shoutout.js` auf Version `0.2.13` erhöht.
- Neue Routen:
  - `GET /api/clip-shoutout/live-test`
  - `GET /api/clip-shoutout/decision-prep`
- Dashboard-Tab `Live-Test` ergänzt.
- Testplan und sichere Entscheidungsausgabe ergänzt.
- Keine produktive `!so`-Umstellung.
- Keine neuen Parallelmodule.

## 2026-05-26 - STEP485_SHOUTOUT_PRODUCTION_CHECK

- Shoutout-Produktionscheck ergänzt.
- `twitch.js` liefert internen EventSub-Status inklusive Shoutout-Readiness.
- `clip_shoutout.js` auf Version `0.2.12` erhöht.
- Neue Route `GET /api/clip-shoutout/production-check`.
- Dashboard-Tab `Produktion` ergänzt.
- Keine produktive `!so`-Umstellung.
- Keine neuen Parallelmodule.

## 2026-05-26 - STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION

- Eingehende/ausgehende Twitch-Shoutout-EventSub-Events integriert.
- Keine neue Twitch-/EventSub-Struktur erstellt.
- Dashboard-Tab `Eingehend` ergänzt.

## 2026-05-26 - STEP483_SHOUTOUT_DASHBOARD_TABS

- Aktives Shoutout-Dashboard in Tabs aufgeteilt.
