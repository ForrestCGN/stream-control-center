# NEXT_STEPS

## Naechster Schritt

Empfohlener Start:

```text
CAN-13.4 - SafetyStop-/Cancel-Konzept fuer spaetere manuelle Recovery
```

## Ziel CAN-13.4

CAN-13.4 soll das SafetyStop-/Cancel-Konzept fuer spaetere manuelle Recovery-Aktionen planen.

Klaeren:

- Was ist SafetyStop im Recovery-Kontext?
- Wer darf SafetyStop spaeter sehen?
- Wer darf SafetyStop spaeter setzen oder loesen?
- Welche Aktionen blockiert SafetyStop immer?
- Wie verhaelt sich SafetyStop zu Confirm?
- Wie verhaelt sich SafetyStop zu Audit Request / Decision / Result?
- Wie wird ein laufender oder geplanter Recovery-Vorgang spaeter abgebrochen?
- Welche Rollback-/Clear-Grenzen muessen schon planerisch festgelegt werden?
- Welche Aktionen bleiben trotz SafetyStop-Konzept hart blockiert?

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
- SafetyStop-API ohne separaten Plan
- Cancel-API ohne separaten Plan
- DB-Migration ohne separaten Plan
- Config-Schreibzugriffe

## CAN-13.x geplante Reihenfolge

```text
CAN-13.4 SafetyStop-/Cancel-Konzept fuer spaetere manuelle Recovery
CAN-13.5 Recovery-Kandidatenmatrix
CAN-13.6 Abschluss/Handoff, weiterhin ohne produktive Recovery
```
