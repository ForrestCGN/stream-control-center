# Modul-Doku: `helper_communication_contract`

Stand: 2026-05-26 / STEP487_COMMUNICATION_BUS_MODULE_CONTRACT

## Zweck

`helper_communication_contract` ergänzt den bestehenden Communication Bus um eine Backend-Modul-zu-Modul-Vertragsschicht.

Das Ziel ist ein CAN-Bus-ähnliches Muster:

```text
Module melden sich am Bus an.
Module melden Heartbeats und Status.
Module senden Events.
Andere Module können gezielt relevante Events abonnieren.
Module können Events auswerten, ohne direkt voneinander abhängig zu werden.
```

Wichtig: Der Helper ersetzt keine produktiven Flows. Er dekoriert einen vorhandenen Bus nur dann, wenn ein Modul ihn ausdrücklich mit `ensureModuleBus(bus)` aktiviert.

## Datei

```text
backend/modules/helpers/helper_communication_contract.js
```

## Version / Meta

```text
helper: helper_communication_contract
helperVersion: 0.1.0
```

## Exporte

```text
MODULE_META
ensureModuleBus
normalizeModuleInfo
normalizeSubscription
publicModule
publicSubscription
```

## Hauptfunktionen

### `ensureModuleBus(bus, options)`

Dekoriert eine vorhandene Bus-Instanz additiv mit Modul-Contract-Methoden.

Ergänzte Methoden auf dem Bus:

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

Zusätzlich wird `bus.emit` dekoriert: WebSocket-/Replay-/ACK-Verhalten des ursprünglichen Bus bleibt erhalten, danach werden Backend-Modul-Subscriber synchron benachrichtigt.

### `registerModule(moduleInfo)`

Registriert ein Backend-Modul im Contract.

Typische Felder:

```text
id
module
name
version
capabilities
enabled
health
status
lastError
dependencies
meta
```

Wenn der bestehende Bus `registerClient` unterstützt, wird zusätzlich ein Bus-Client vom Typ `backend_module` registriert. Dadurch erscheint das Modul im bestehenden Bus-Status.

### `unregisterModule(moduleId, reason)`

Markiert ein Modul als offline und ruft, falls vorhanden, `bus.unregisterClient` auf.

### `heartbeatModule(moduleId, payload)`

Aktualisiert `lastHeartbeatAt`, `status`, `health`, Version und Capabilities. Falls der Bus `heartbeat` unterstützt, wird dieser ebenfalls genutzt.

### `updateModuleStatus(moduleId, status)`

Aktualisiert Statusdaten im Contract, ohne automatisch ein Event zu senden.

### `publishModuleStatus(moduleId, status)`

Aktualisiert Statusdaten und sendet zusätzlich ein Bus-Event:

```text
channel: module.status
action: update
```

### `subscribe(filter, handler)`

Registriert einen Backend-Subscriber.

Filterfelder:

```text
channel
action
type/eventType
moduleId
once
description
```

`channel`, `action` und `eventType` unterstützen `*` als Wildcard.

### `unsubscribe(subscriptionId)`

Entfernt einen Subscriber.

### `createModuleClient(moduleInfo)`

Erzeugt einen kleinen Modul-Client mit Methoden:

```text
register
unregister
heartbeat
status
subscribe
unsubscribe
emit
```

Das ist das bevorzugte Muster für neue Module wie `channelpoints`.

## Standard-Eventmodell

Neue Module sollen sprechende Channels und Actions verwenden:

```text
channelpoints.reward
action: created|updated|enabled|disabled|removed

channelpoints.redemption
action: received|queued|started|finished|failed|fulfilled|canceled

module.status
action: update
```

Payloads sollen nur benötigte Daten enthalten. Keine Secrets, Tokens, `.env`-Werte oder vollständigen Config-Dumps über den Bus senden.

## Beispiel: Modul-Client

```js
const communicationBus = require('./communication_bus');
const { ensureModuleBus } = require('./helpers/helper_communication_contract');

const moduleBus = ensureModuleBus(communicationBus.getBus());
const client = moduleBus.createModuleClient({
  id: 'channelpoints',
  module: 'channelpoints',
  version: '0.1.0',
  capabilities: [
    'channelpoints.reward.sync',
    'channelpoints.redemption.handle'
  ]
});

client.status({
  health: 'ok',
  status: 'ready',
  enabled: true
});
```

## Beispiel: Event senden

```js
client.emit({
  channel: 'channelpoints.reward',
  action: 'disabled',
  payload: {
    rewardId: 'abc',
    title: 'Test Reward',
    twitchIsEnabled: false
  },
  meta: {
    requireAck: false,
    replayable: true,
    ttlMs: 30000
  }
});
```

## Beispiel: Event empfangen

```js
client.subscribe({
  channel: 'channelpoints.redemption',
  action: 'started'
}, event => {
  // Nur auswerten, wenn die Payload für dieses Modul relevant ist.
});
```

## Abhängigkeiten

```text
bestehender Communication Bus aus backend/modules/communication_bus.js
helper_communication.js Bus-Core
```

Der Contract hat bewusst keine eigene DB- oder Config-Abhängigkeit.

## Datenbank

Keine neuen Tabellen in STEP487.

## Dashboard / Overlay

Keine direkten Dashboard- oder Overlay-Dateien in STEP487.

Der Contract ist Vorbereitung für spätere Module und Diagnoseanzeigen.

## EventBus / Monitoring

Der Helper ist selbst die neue Vertragsschicht für:

```text
Modul-Anmeldung
Modul-Abmeldung
Heartbeat
Status
Event senden
Event empfangen
Subscriber-Fehler als Bus-Issue melden
```

`getModuleContractStatus()` liefert:

```text
helper/helperVersion
stats
modules
subscriptions
```

## Tests

Syntax:

```bat
node --check backend\modules\helpers\helper_communication_contract.js
```

Smoke-Test nach Einbau kann später über ein Modul erfolgen, das `ensureModuleBus(getBus())` nutzt und ein Test-Event abonniert/sendet.

## Offene Punkte

- `communication_bus.js` kann später optional `ensureModuleBus(getBus())` direkt aktivieren, wenn wir die Vertragsschicht global im Status sehen wollen.
- Für jedes neue Modul müssen die genutzten Channels, Actions und Payload-Felder in der jeweiligen Modul-Doku dokumentiert werden.
- Kanalpunkte-System soll als erstes neues Fachmodul auf diesem Contract aufbauen.
