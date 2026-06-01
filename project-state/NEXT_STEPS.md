# NEXT_STEPS

## Naechster Schritt

```text
CAN-15.4 - Audit Data Minimization Policy no-write Planning
```

## Ziel CAN-15.4

Festlegen, welche Daten spaeter in Audit-Kontexten erlaubt, maskiert, gehasht oder verboten sind.

## CAN-15.4 darf klaeren

```text
erlaubte Audit-Felder
verbotene Audit-Felder
Maskierungsregeln
Hash-/Pseudonymisierungsregeln
Retention-Grundsaetze als Planung
Secret-Erkennung als Konzept
```

## CAN-15.4 darf NICHT enthalten

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
