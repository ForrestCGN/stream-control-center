# Module-Dokumentation

Stand: 2026-06-08

## Aktueller Loyalty-Stand

```text
STEP LWG-4F.1 – Loyalty Modules Use Existing Communication Bus
```

## Regel

Kein neuer Bus, keine Parallelstruktur.

Module nutzen direkt den vorhandenen Communication-/CanBus:

```text
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
```
