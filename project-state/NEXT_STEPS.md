# NEXT_STEPS

## Naechster Schritt

```text
CAN-19.3 - Safety Architecture Contracts Consolidation Planning
```

## Ziel CAN-19.3

Die bisherigen Display-/Status-Contracts fuer Audit, SafetyStop, Roles/Rights, Confirm und Hard Blocker zu einem gemeinsamen Contract-Konzept zusammenfuehren.

## CAN-19.3 darf klaeren

```text
gemeinsame Contract-Felder
gemeinsame Status-Level
gemeinsame readOnly/hasApi/hasMutation-Regeln
gemeinsame Hard-Blocker-Struktur
gemeinsame Notes/Warnings-Struktur
```

## CAN-19.3 darf NICHT enthalten

```text
API
Route
DB
Middleware
Dashboard-Aenderung
EventBus-Emit
Recovery-Ausfuehrung
SafetyStop Clear
Confirm Trigger
Rollen-/Rechte-Mutation
Queue-/Sound-/Alert-/Overlay-Mutation
```
