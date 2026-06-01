# NEXT_STEPS

## Naechster Schritt

```text
CAN-16.1 - SafetyStop State Matrix read-only/no-api Planning
```

## Ziel CAN-16.1

SafetyStop-Zustaende und daraus folgende Blockierentscheidungen als Matrix planen.

## CAN-16.1 darf klaeren

```text
state inactive/active/unknown/degraded
known true/false
active true/false
blocksRecovery true/false
blocksHighRiskActions true/false
welche Kombinationen sicher/unsicher sind
welche Kombinationen blockieren muessen
```

## CAN-16.1 darf NICHT enthalten

```text
SafetyStop API
SafetyStop setzen
SafetyStop clearen
SafetyStop resetten
Dashboard-Button
DB-Tabelle
GET-/POST-Route
EventBus-Emit
Recovery-Ausfuehrung
Queue-/Sound-/Alert-/Overlay-Mutation
```
