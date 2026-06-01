# NEXT_STEPS

## Naechster Schritt

Empfohlener Start:

```text
CAN-13.3 - Confirm-/Bestaetigungs-Konzept fuer spaetere manuelle Recovery
```

## Ziel CAN-13.3

CAN-13.3 soll das Confirm-/Bestaetigungs-Konzept fuer spaetere manuelle Recovery-Aktionen planen.

Klaeren:

- Welche Aktionen brauchen spaeter eine explizite Bestaetigung?
- Welche Confirm-Arten gibt es?
- Welche Aktionen bleiben trotz Confirm hart blockiert?
- Wie lange ist ein Confirm gueltig?
- Wie wird Confirm mit Audit Request / Decision / Result verknuepft?
- Wie wird verhindert, dass Confirm Backend-Rechte ersetzt?
- Wie wird verhindert, dass Confirm Guards oder SafetyStop ersetzt?
- Welche Confirm-Texte muessen eindeutig vor Risiko und Wirkung warnen?

## Weiterhin nicht direkt umsetzen

- Alert Replay
- Sound Replay
- Queue Clear
- Overlay State Repair
- Execute Recovery
- Auto-Recovery
- POST-/Command-/Prepare-/Execute-Route
- produktive Recovery-Buttons
- Rechte-API ohne separaten Plan
- Confirm-API ohne separaten Plan
- DB-Migration ohne separaten Plan
- Config-Schreibzugriffe

## CAN-13.x geplante Reihenfolge

```text
CAN-13.3 Confirm-/Bestaetigungs-Konzept fuer spaetere manuelle Recovery
CAN-13.4 SafetyStop-/Cancel-Konzept
CAN-13.5 Recovery-Kandidatenmatrix
CAN-13.6 Abschluss/Handoff, weiterhin ohne produktive Recovery
```
