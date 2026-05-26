# CHANGELOG

## 2026-05-26 - STEP489_CHANNELPOINTS_BACKEND_SKELETON

- Neues Fachmodul `backend/modules/channelpoints.js` erstellt.
- `channelpoints.js` startet mit Modulversion `0.1.0`.
- Neue Routen:
  - `GET /api/channelpoints/status`
  - `GET /api/channelpoints/bus-test`
- Modul registriert sich am bestehenden Communication Bus ueber `registerModule`.
- Modul sendet Heartbeat ueber `heartbeatModule`.
- Modul veroeffentlicht Status ueber `publishModuleStatus`.
- Harmloser Bus-Selftest `channelpoints.test/ping` ergaenzt.
- Keine Twitch-Schreibaktionen ergaenzt.
- Keine Datenbank-Migration ergaenzt.
- Kein Dashboard-Modul ergaenzt.
- Doku und Projektstatus aktualisiert.

## 2026-05-26 - STEP488_COMMUNICATION_BUS_CORE_CONTRACT

- Modul-zu-Modul-Contract direkt in `backend/modules/helpers/helper_communication.js` integriert.
- `helper_communication.js` auf Version `0.4.0` erhoeht.
- Neue Bus-Core-Funktionen:
  - `registerModule`
  - `unregisterModule`
  - `heartbeatModule`
  - `publishModuleStatus`
  - `subscribe`
  - `unsubscribe`
  - `getSubscriptions`
- `getStatus()` um `subscriptions[]` und Subscriber-Statistiken erweitert.
- Subscriber-Fehler werden ueber `trackIssue` sichtbar gemacht und brechen den `emit`-Flow nicht ab.
- Keine neue dauerhafte Contract-Helper-Datei als Zielarchitektur.
- Keine produktiven Flows automatisch auf Bus-First umgestellt.
- Doku und Projektstatus aktualisiert.

## 2026-05-26 - STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP

- Live-Test-/Decision-Prep im bestehenden `clip_shoutout.js` ergaenzt.
- `clip_shoutout.js` auf Version `0.2.13` erhoeht.
- Neue Routen:
  - `GET /api/clip-shoutout/live-test`
  - `GET /api/clip-shoutout/decision-prep`
- Dashboard-Tab `Live-Test` ergaenzt.
- Testplan und sichere Entscheidungsausgabe ergaenzt.
- Keine produktive `!so`-Umstellung.
- Keine neuen Parallelmodule.

## 2026-05-26 - STEP485_SHOUTOUT_PRODUCTION_CHECK

- Shoutout-Produktionscheck ergaenzt.
- `twitch.js` liefert internen EventSub-Status inklusive Shoutout-Readiness.
- `clip_shoutout.js` auf Version `0.2.12` erhoeht.
- Neue Route `GET /api/clip-shoutout/production-check`.
- Dashboard-Tab `Produktion` ergaenzt.
- Keine produktive `!so`-Umstellung.
- Keine neuen Parallelmodule.

## 2026-05-26 - STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION

- Eingehende/ausgehende Twitch-Shoutout-EventSub-Events integriert.
- Keine neue Twitch-/EventSub-Struktur erstellt.
- Dashboard-Tab `Eingehend` ergaenzt.

## 2026-05-26 - STEP483_SHOUTOUT_DASHBOARD_TABS

- Aktives Shoutout-Dashboard in Tabs aufgeteilt.
