# CURRENT_STATUS

Stand: 2026-05-26 / STEP488_COMMUNICATION_BUS_CORE_CONTRACT

## Aktueller Arbeitsstand

STEP488 korrigiert die vorherige Contract-Idee: Der Modul-zu-Modul-Contract wird direkt im bestehenden Communication-Bus-Core `helper_communication.js` integriert, statt dauerhaft als separater Helper daneben zu liegen.

## Communication Bus

- `backend/modules/helpers/helper_communication.js` steht jetzt auf Version `0.4.0`.
- Neue Bus-Core-Funktionen:
  - `registerModule`
  - `unregisterModule`
  - `heartbeatModule`
  - `publishModuleStatus`
  - `subscribe`
  - `unsubscribe`
  - `getSubscriptions`
- `getStatus()` zeigt zusätzlich `subscriptions[]` und Subscriber-Statistiken.
- Bestehende Funktionen wie `emit`, `ack`, `replayForClient`, `trackIssue`, `registerClient` und WebSocket-Client-Flows bleiben erhalten.

## Korrektur zu STEP487

Falls `backend/modules/helpers/helper_communication_contract.js` aus STEP487 bereits entpackt wurde, soll diese Datei entfernt werden. Sie ist nicht mehr Zielarchitektur.

## Shoutout-System

Der Stand aus STEP486 bleibt unverändert.

## Nächster sinnvoller Schritt

`STEP489_CHANNELPOINTS_BACKEND_SKELETON`

Dabei soll `channelpoints.js` als neues Fachmodul auf dem integrierten Bus-Contract aufbauen.
