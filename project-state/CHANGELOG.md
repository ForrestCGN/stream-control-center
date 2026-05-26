# CHANGELOG

## 2026-05-26 - STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN

- `channelpoints.js` von Version `0.1.0` auf `0.2.0` erhöht.
- Statusmodus auf `backend_model_plan` erweitert.
- Neue Route `GET /api/channelpoints/model`.
- Neue Route `GET /api/channelpoints/media-plan`.
- Geplantes Datenmodell für Kategorien, Rewards und Redemptions beschrieben.
- Media-Integration verbindlich auf bestehendes `media.js`/Dashboard-Media-Picker-System ausgerichtet.
- Keine DB-Migration.
- Keine Twitch-Schreibaktionen.
- Keine produktive Redemption-Verarbeitung.
- Keine neue Upload-Maske.

## 2026-05-26 - STEP489_CHANNELPOINTS_BACKEND_SKELETON

- Neues Fachmodul `backend/modules/channelpoints.js` erstellt.
- `channelpoints.js` Version `0.1.0`.
- Neue Routen:
  - `GET /api/channelpoints/status`
  - `GET /api/channelpoints/bus-test`
- Bus-Registrierung über `registerModule`.
- Heartbeat/Status über `heartbeatModule`/`publishModuleStatus`.
- Harmloser Bus-Selftest über `channelpoints.test/ping`.
- Keine Twitch-Schreibaktionen.
- Keine DB-Migration.
- Kein Dashboard-Umbau.

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
