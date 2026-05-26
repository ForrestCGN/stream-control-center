# STEP488_COMMUNICATION_BUS_CORE_CONTRACT

Stand: 2026-05-26

## Ziel

Den geplanten Modul-zu-Modul-Contract nicht als dauerhaften separaten Helper führen, sondern direkt in den bestehenden Communication-Bus-Core integrieren.

## Hintergrund

Forrest hat korrekt angemerkt, dass ein neuer Helper riskant ist und eine Parallelstruktur erzeugen kann. Deshalb wurde die STEP487-Idee korrigiert:

```text
Kein dauerhafter helper_communication_contract.js.
Contract-Funktionen direkt in helper_communication.js.
```

## Geänderte Dateien

```text
backend/modules/helpers/helper_communication.js
docs/modules/core-communication-bus.md
docs/modules/README.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/STEP488_COMMUNICATION_BUS_CORE_CONTRACT.md
```

## Nicht geändert

```text
backend/modules/communication_bus.js
backend/modules/twitch.js
backend/modules/clip_shoutout.js
htdocs/dashboard/*
config/*
SQLite-Datenbank
.env
Secrets/Tokens
```

## Neue Bus-Core-Funktionen

```text
registerModule
unregisterModule
heartbeatModule
publishModuleStatus
subscribe
unsubscribe
getSubscriptions
```

## Rückwärtskompatibilität

Bestehende Funktionen bleiben erhalten:

```text
registerClient
unregisterClient
forgetClient
markClientError
heartbeat
updateClientStatuses
getClients
emit
ack
replayForClient
trackIssue
getStatus
reset
createEventId
normalizeMessage
```

## Status-Erweiterung

`getStatus()` enthält zusätzlich:

```text
stats.subscriptions
stats.subscriberDeliveries
stats.subscriberErrors
subscriptions[]
```

## Tests

Ausgeführt:

```bat
node --check backend\modules\helpers\helper_communication.js
```

Isolierter Smoke-Test:

```text
createCommunicationBus
registerModule
subscribe
emit
subscriber delivery
ack
getStatus
```

Ergebnis:

```text
bus integrated contract smoke ok
```

## Offene Prüfung nach Einbau

Nach Entpacken und Serverstart lokal prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=hello"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/watchdog"
```

Alte ACK-/Replay-Funktion bei Bedarf zusätzlich prüfen.

## Korrekturhinweis zu STEP487

Falls STEP487 bereits lokal entpackt wurde:

```text
backend/modules/helpers/helper_communication_contract.js
```

wieder entfernen. Der Contract sitzt ab STEP488 im bestehenden Bus-Core.

## Nächster Schritt

```text
STEP489_CHANNELPOINTS_BACKEND_SKELETON
```

Ziel:

```text
channelpoints.js als neues Fachmodul
moduleVersion 0.1.0
/api/channelpoints/status
Bus-Registrierung über registerModule
Status/Heartbeat über publishModuleStatus/heartbeatModule
noch keine Twitch-Schreibaktionen
noch keine riskante DB-Migration
```
