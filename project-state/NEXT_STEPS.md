# NEXT_STEPS

## Naechster Schritt

```text
CAN-15.2 - Audit Boundary no-write Planning
```

## Ziel CAN-15.2

Audit-Struktur weiter planen, aber strikt ohne Speicherung und ohne API.

## CAN-15.2 darf nur klaeren

```text
welche Audit-Ereignisse spaeter benoetigt werden
welche Felder spaeter Pflicht waeren
welche Daten niemals gespeichert werden duerfen
welche Entscheidungs-/Abbruchfaelle spaeter auditierbar sein muessen
welche Grenzen fuer eine spaetere Write-Phase gelten
```

## CAN-15.2 darf NICHT enthalten

```text
CREATE TABLE
INSERT
UPDATE
DELETE
POST /audit
API-Route
Dashboard-Button
Recovery-Ausfuehrung
SafetyStop Clear
Confirm Trigger
Rechte-Mutation
```

## Weiterhin nicht direkt umsetzen

```text
Produktive Recovery
Alert Replay
Sound Replay
Queue Clear
Overlay Repair
SafetyStop Clear
Audit Write Route
Confirm API
Rollen-/Rechte-Mutation
Prepare/Execute Route
```
