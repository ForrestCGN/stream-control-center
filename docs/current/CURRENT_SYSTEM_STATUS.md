# CURRENT_SYSTEM_STATUS

Stand: 2026-05-26 / STEP488

## Stream-Control-Center

Aktueller Schwerpunkt: Communication Bus / Modul-zu-Modul-Contract als Vorbereitung für das kommende Kanalpunkte-System.

## Communication Bus

STEP488 integriert den Modul-Contract direkt in den bestehenden Bus-Core:

- `backend/modules/helpers/helper_communication.js` steht auf Version `0.4.0`.
- Neue Bus-Core-Funktionen:
  - `registerModule`
  - `unregisterModule`
  - `heartbeatModule`
  - `publishModuleStatus`
  - `subscribe`
  - `unsubscribe`
  - `getSubscriptions`
- Keine dauerhafte zweite Bus-Implementierung.
- Keine produktiven Flows automatisch ersetzt.
- Bestehende HTTP-/WS-/ACK-/Replay-/Issue-Funktionen bleiben erhalten.

## Wichtig

Falls STEP487 bereits lokal entpackt wurde, muss `backend/modules/helpers/helper_communication_contract.js` entfernt werden. STEP488 ersetzt diese Idee durch direkte Integration im vorhandenen Bus-Core.

## Shoutout

Der Stand aus STEP486 bleibt fachlich unverändert:

- `backend/modules/twitch.js`: OAuth, Helix, EventSub-WebSocket, Subscription-Status.
- `backend/modules/clip_shoutout.js`: Shoutout-Logik, Queues, Incoming-Shoutout-Speicherung, Produktionscheck, Live-Test-/Decision-Prep.
- `htdocs/dashboard/modules/shoutout.js/css`: Dashboard-Tabs inklusive `Eingehend`, `Produktion` und `Live-Test`.

## Nächster sinnvoller Schritt

`STEP489_CHANNELPOINTS_BACKEND_SKELETON`

Ziel: Neues Fachmodul `channelpoints.js` mit `moduleVersion`, Statusroute und Bus-Registrierung auf Basis des integrierten Bus-Contracts. Noch keine riskanten Twitch-Schreibaktionen.
