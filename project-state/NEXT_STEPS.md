# NEXT_STEPS

## Naechster Schritt

Empfohlener Start:

```text
CAN-13.1 - Audit-Konzept fuer spaetere manuelle Recovery
```

## Ziel CAN-13.1

CAN-13.1 soll das Audit-Konzept fuer spaetere manuelle Recovery-Aktionen planen.

Klaeren:

- Welche Audit-Felder sind Pflicht?
- Wann wird spaeter geloggt?
- Wer ist der Actor?
- Welche Rolle/Berechtigung wird gespeichert?
- Welcher Recovery-Kandidat wurde angefragt?
- Welche Guards wurden geprueft?
- Welches Ergebnis wurde erreicht?
- Wie werden Abbrueche und Fehler dokumentiert?
- Wie wird spaeter verhindert, dass Recovery-Aktionen ohne Audit laufen?

## Weiterhin nicht direkt umsetzen

- Alert Replay
- Sound Replay
- Queue Clear
- Overlay State Repair
- Execute Recovery
- Auto-Recovery
- POST-/Command-/Prepare-/Execute-Route
- produktive Recovery-Buttons
- DB-Migration ohne separaten Plan
- Config-Schreibzugriffe

## CAN-13.x geplante Reihenfolge

```text
CAN-13.1 Audit-Konzept fuer spaetere manuelle Recovery
CAN-13.2 Rollen-/Rechte-Konzept
CAN-13.3 Confirm-/Bestaetigungs-Konzept
CAN-13.4 SafetyStop-/Cancel-Konzept
CAN-13.5 Recovery-Kandidatenmatrix
CAN-13.6 Abschluss/Handoff, weiterhin ohne produktive Recovery
```
