# CURRENT CHAT HANDOFF – Loyalty Bus LWG-4F.1

Stand: 2026-06-08

## Neuer Stand

```text
STEP LWG-4F.1 – Loyalty Modules Use Existing Communication Bus
```

## Korrektur

Der alte LWG-4F mit `helper_module_bus.js` ist verworfen und soll nicht verwendet werden.

## Geaendert

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_giveaways.js
```

## Nicht neu angelegt

```text
kein helper_module_bus.js
kein neues Modul
kein neuer EventBus
```

## Standard

Die Loyalty-Module nutzen direkt den vorhandenen Communication-/CanBus:

```text
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
```

Direkter Zugriff:

```text
require("./communication_bus").getBus()
```

Funktionen:

```text
registerModule
heartbeatModule
publishModuleStatus
```
