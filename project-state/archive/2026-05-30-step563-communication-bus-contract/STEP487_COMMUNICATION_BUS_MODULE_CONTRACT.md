# STEP487_COMMUNICATION_BUS_MODULE_CONTRACT

Datum: 2026-05-26

## Ziel

Vorbereitung einer sauberen Backend-Modul-zu-Modul-Kommunikation über den vorhandenen Communication Bus.

Das Zielbild entspricht einer CAN-Bus-ähnlichen Architektur:

```text
Module können Events senden.
Module können relevante Events abonnieren.
Module melden sich an und ab.
Module liefern Heartbeat und Status.
Subscriber-Fehler werden sauber gemeldet.
Bestehende produktive Flows werden nicht ersetzt.
```

## Geändert

### Neu

```text
backend/modules/helpers/helper_communication_contract.js
docs/modules/helper-communication-contract.md
project-state/STEP487_COMMUNICATION_BUS_MODULE_CONTRACT.md
```

### Aktualisiert

```text
docs/modules/core-communication-bus.md
docs/modules/README.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

## Technische Umsetzung

Der neue Helper `helper_communication_contract.js` dekoriert eine vorhandene Bus-Instanz additiv:

```js
const { ensureModuleBus } = require('./helpers/helper_communication_contract');
const moduleBus = ensureModuleBus(communicationBus.getBus());
```

Ergänzte Methoden:

```text
registerModule
unregisterModule
heartbeatModule
updateModuleStatus
publishModuleStatus
subscribe
unsubscribe
createModuleClient
getModuleContractStatus
```

`bus.emit` wird additiv dekoriert:

```text
1. ursprünglicher Bus-Emit läuft weiter
2. danach werden Backend-Modul-Subscriber benachrichtigt
3. Subscriber-Fehler werden abgefangen
4. Fehler werden, falls verfügbar, über bus.trackIssue gemeldet
```

## Bewusst nicht geändert

```text
Keine Änderung an communication_bus.js.
Keine Änderung an helper_communication.js.
Keine produktiven Flows ersetzt.
Keine neuen HTTP-Routen.
Keine Datenbankänderung.
Kein Dashboard-Umbau.
Kein Sound-System-Umbau.
Kein Command-System-Umbau.
Kein Kanalpunkte-Fachmodul gebaut.
```

## Warum keine Änderung an `communication_bus.js`?

Der bestehende Bus ist bereits produktiv für Diagnose, WebSocket-Clients, Replay und ACK vorbereitet. Eine direkte Änderung an der großen Bus-Datei wäre für diesen STEP unnötig riskant.

Der neue Contract-Helper ist absichtlich opt-in:

```text
Nur Module, die ihn nutzen, aktivieren die neue Vertragsschicht.
```

Dadurch bleibt der bestehende Bus-Zustand stabil.

## Standard für kommende Module

Neue Module sollen künftig bevorzugt so starten:

```js
const communicationBus = require('./communication_bus');
const { ensureModuleBus } = require('./helpers/helper_communication_contract');

const bus = ensureModuleBus(communicationBus.getBus());
const client = bus.createModuleClient({
  id: 'channelpoints',
  module: 'channelpoints',
  version: '0.1.0',
  capabilities: [
    'channelpoints.reward.sync',
    'channelpoints.redemption.handle'
  ]
});
```

## Event-Konvention

Channels sollen fachlich gruppiert werden:

```text
module.status
channelpoints.reward
channelpoints.redemption
sound.playback
overlay.visual
dashboard.command
```

Actions sollen kurz und sprechend sein:

```text
created
updated
enabled
disabled
received
queued
started
finished
failed
fulfilled
canceled
update
```

## Tests durchgeführt

```bat
node --check backend\modules\helpers\helper_communication_contract.js
```

Zusätzlich wurde ein isolierter Node-Smoke-Test mit Fake-Bus ausgeführt:

```text
registerModule
subscribe
emit
Subscriber-Auslieferung
```

Ergebnis:

```text
contract smoke ok
```

## Nächster sinnvoller STEP

```text
STEP488_CHANNELPOINTS_BACKEND_SKELETON
```

Ziel:

```text
channelpoints.js als Grundmodul
moduleVersion 0.1.0
/api/channelpoints/status
Bus-Client über helper_communication_contract
Status/Heartbeat vorbereitet
noch keine Twitch-Schreibaktionen
noch keine riskante DB-Änderung
```
