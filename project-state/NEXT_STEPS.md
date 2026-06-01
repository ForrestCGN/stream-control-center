# NEXT_STEPS

## Naechster Schritt

```text
CAN-15.3 - Audit Event Catalog no-write Planning
```

## Ziel CAN-15.3

Audit-Ereignisse katalogisieren, aber weiterhin ohne Speicherung und ohne API.

## CAN-15.3 darf klaeren

```text
welche read-only Events spaeter auditierbar sein koennten
welche blocked Events spaeter auditierbar sein muessen
welche Event-Namen stabil sein sollten
welche Kategorie/Risiko-Stufe jedes Event hat
welche Events weiterhin hart blockiert bleiben
```

## CAN-15.3 darf NICHT enthalten

```text
CREATE TABLE
INSERT
UPDATE
DELETE
POST /audit
API-Route
Dashboard-Button
EventBus-Emit
Recovery-Ausfuehrung
SafetyStop Clear
Confirm Trigger
Rechte-Mutation
```
