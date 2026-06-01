# NEXT_STEPS

## Naechster Schritt

Empfohlener Start:

```text
CAN-13.2 - Rollen-/Rechte-Konzept fuer spaetere manuelle Recovery
```

## Ziel CAN-13.2

CAN-13.2 soll das Rollen-/Rechte-Konzept fuer spaetere manuelle Recovery-Aktionen planen.

Klaeren:

- Welche Rollen duerfen spaeter Recovery-Diagnose sehen?
- Welche Rollen duerfen spaeter Recovery vorbereiten?
- Welche Rollen duerfen spaeter Recovery ausfuehren, falls ueberhaupt?
- Welche Aktionen bleiben fuer alle Rollen hart blockiert?
- Wie muss das Backend Rechte serverseitig pruefen?
- Wie darf das Dashboard Aktionen sichtbar machen?
- Wie werden Denied-/Blocked-Entscheidungen spaeter auditiert?
- Wie wird verhindert, dass Dashboard-Sichtbarkeit allein als Berechtigung gilt?

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
- DB-Migration ohne separaten Plan
- Config-Schreibzugriffe

## CAN-13.x geplante Reihenfolge

```text
CAN-13.2 Rollen-/Rechte-Konzept fuer spaetere manuelle Recovery
CAN-13.3 Confirm-/Bestaetigungs-Konzept
CAN-13.4 SafetyStop-/Cancel-Konzept
CAN-13.5 Recovery-Kandidatenmatrix
CAN-13.6 Abschluss/Handoff, weiterhin ohne produktive Recovery
```
