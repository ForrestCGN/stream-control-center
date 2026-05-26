# CHANGELOG

## 2026-05-26 - STEP488_COMMUNICATION_BUS_CORE_CONTRACT

- Modul-zu-Modul-Contract direkt in `backend/modules/helpers/helper_communication.js` integriert.
- `helper_communication.js` auf Version `0.4.0` erhöht.
- Neue Bus-Core-Funktionen:
  - `registerModule`
  - `unregisterModule`
  - `heartbeatModule`
  - `publishModuleStatus`
  - `subscribe`
  - `unsubscribe`
  - `getSubscriptions`
- `getStatus()` um `subscriptions[]` und Subscriber-Statistiken erweitert.
- Subscriber-Fehler werden über `trackIssue` sichtbar gemacht und brechen den `emit`-Flow nicht ab.
- Keine neue dauerhafte Contract-Helper-Datei als Zielarchitektur.
- Keine produktiven Flows automatisch auf Bus-First umgestellt.
- Doku und Projektstatus aktualisiert.

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
