# Modul-Doku: `communication_bus`

Stand: 2026-05-26 / STEP488_COMMUNICATION_BUS_CORE_CONTRACT
Quelle: `backend/modules/communication_bus.js`, `backend/modules/helpers/helper_communication.js`, `backend/modules/helpers/helper_security_context.js`

## Zweck

`communication_bus` stellt die zentrale Event-, Diagnose-, ACK-, Replay- und Modul-Kommunikationsschicht bereit.

Ab STEP488 ist der Modul-zu-Modul-Contract direkt im bestehenden Bus-Core `helper_communication.js` integriert. Es gibt keine dauerhafte zweite Bus-Implementierung und keinen separaten Contract-Helper als Zielarchitektur.

Der Bus bleibt schrittweise und rückwärtskompatibel: Bestehende produktive Flows werden nicht automatisch ersetzt.

## Hauptdateien

```text
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
backend/modules/helpers/helper_security_context.js
config/communication_bus.json
```

## Version / Meta

```text
communication_bus moduleVersion: 0.8.1
helper_communication version: 0.4.0
communication_core coreVersion: 0.4.0
```

## Exporte

`communication_bus.js` exportiert:

```text
MODULE_META
init
handleWsMessage
getBus
```

`helper_communication.js` exportiert:

```text
MODULE_META
DEFAULT_CONFIG
createCommunicationBus
createEventId
normalizeClientInfo
normalizeTarget
normalizeSource
```

## Bus-Core Funktionen

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

Neu ab STEP488 direkt im Bus-Core:

```text
registerModule
unregisterModule
heartbeatModule
publishModuleStatus
subscribe
unsubscribe
getSubscriptions
```

## Modul-zu-Modul Contract

### Modul anmelden

```js
const result = bus.registerModule({
  name: 'channelpoints',
  version: '0.1.0',
  capabilities: ['channelpoints.redemption.received']
});
```

Das legt intern einen Backend-Client vom Typ `module` an und sendet ein Bus-Event:

```text
channel: module.lifecycle
action: registered
```

### Modul abmelden

```js
bus.unregisterModule('channelpoints', 'module_shutdown');
```

Das markiert den Modul-Client offline und sendet:

```text
channel: module.lifecycle
action: unregistered
```

### Modul-Heartbeat

```js
bus.heartbeatModule('channelpoints', {
  module: 'channelpoints',
  version: '0.1.0'
});
```

### Modul-Status veröffentlichen

```js
bus.publishModuleStatus('channelpoints', {
  module: 'channelpoints',
  moduleVersion: '0.1.0',
  enabled: true,
  health: 'ok'
});
```

Standard-Event:

```text
channel: module.status
action: updated
```

### Events abonnieren

```js
const sub = bus.subscribe({
  id: 'sound-system-channelpoints-redemption',
  module: 'sound_system',
  channel: 'channelpoints.redemption',
  action: 'received'
}, (event, context) => {
  // nur relevante Events auswerten
});
```

### Events senden

```js
bus.emit({
  channel: 'channelpoints.redemption',
  action: 'received',
  source: { type: 'module', id: 'module:channelpoints', module: 'channelpoints' },
  payload: { rewardId: '...', userName: '...' },
  meta: { replayable: true, requireAck: false }
});
```

## CAN-Bus-Regel

Der Bus ist die zentrale Leitung. Module dürfen senden und gezielt hören.

Regel:

```text
Alle können senden.
Alle können theoretisch hören.
Jedes Modul wertet nur Events aus, für die es einen passenden Subscriber registriert hat.
```

Nicht erlaubt als Zielbild:

```text
Modul A greift ungeprüft direkt in interne Funktionen von Modul B.
```

Bevorzugt:

```text
Modul A sendet Event.
Modul B hört gezielt zu.
Modul C hört gezielt zu.
Dashboard/Diagnose sieht Status.
```

## HTTP-Routen

Die bestehenden Routen bleiben unverändert:

| Methode | Route | Zweck |
|---|---|---|
| GET | `/api/communication/status` | Bus-Status, Clients, Subscriptions, Events, Issues, Config-Auszug |
| GET | `/api/communication/test` | generisches Test-Event erzeugen |
| GET | `/api/communication/test-alert` | Test-Alert als Bus-Event `visual.alert/play` erzeugen |
| GET | `/api/communication/mirror-alert` | Alert-Daten als Mirror-Event in den Bus geben |
| GET | `/api/communication/ack` | ACK für Event/Client registrieren |
| GET | `/api/communication/replay` | replayfähige Events für Client erneut senden |
| GET | `/api/communication/watchdog` | Bus-Zustand diagnostizieren, optional Issues tracken |
| GET | `/api/communication/issue` | manuelles Issue/Test-Issue tracken |
| GET | `/api/communication/client/forget` | bekannten Client entfernen; benötigt `confirm=1` |
| GET | `/api/communication/test-vip-overlay-preview` | VIP-Overlay-Preview-Event über `vip.overlay` |
| GET | `/api/communication/test-vip-overlay` | VIP-Overlay-Shadow-Test-Event |
| GET | `/api/communication/reset` | Events/Issues optional Clients zurücksetzen; benötigt `confirm=1` |

## Statusfelder

`getStatus()` enthält ab STEP488 zusätzlich:

```text
stats.subscriptions
stats.subscriberDeliveries
stats.subscriberErrors
subscriptions[]
```

## Datenbank

Keine eigenen SQLite-Tabellen.

Persistenz bleibt In-Memory im Bus-Core:

```text
clients
events
issues
subscriptions
stats
```

## Risiken / Regeln

- Bestehende produktive Flows nicht automatisch auf Bus-First umstellen.
- In-Prozess-Subscriber müssen klein, robust und defensiv sein.
- Subscriber-Fehler dürfen den eigentlichen `emit`-Flow nicht abbrechen.
- Fehler werden über `trackIssue` sichtbar gemacht.
- Keine Secrets oder großen Payloads loggen.
- Eventnamen sprechend und dokumentiert halten.

## Tests

Syntax:

```bat
node --check backend\modules\helpers\helper_communication.js
```

Runtime nach Einbau:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=hello"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/watchdog"
```

Alte Funktionen explizit prüfen:

```text
/api/communication/status
/api/communication/test
/api/communication/ack
/api/communication/replay
/api/communication/watchdog
```

## Offene Punkte

- Nach Serverstart prüfen, ob alte Bus-/Overlay-/VIP-Test-Routen unverändert funktionieren.
- Erst danach Kanalpunkte-Modul auf `registerModule`, `publishModuleStatus` und `subscribe` aufbauen.
- Falls STEP487-ZIP bereits entpackt wurde: `backend/modules/helpers/helper_communication_contract.js` wieder entfernen, weil der Contract jetzt im Bus-Core sitzt.
