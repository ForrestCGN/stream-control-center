# NEXT_STEPS

## Naechster Schritt

Empfohlener Start:

```text
CAN-14.2 - Backend Status Shape read-only planen
```

## CAN-14 Zielrichtung

CAN-14 soll nicht direkt produktive Recovery umsetzen.

Sinnvolle Richtung:

```text
Read-only Safety Status View
```

## CAN-14.2 Ziel

CAN-14.2 soll planen, wie ein spaeterer Backend Status Shape read-only aussehen darf.

Dabei wird noch keine Route und kein Code umgesetzt.

Zu klaeren:

```text
welches bestehende Modul spaeter liefern duerfte
welche vorhandenen Datenquellen read-only genutzt werden duerfen
welche Felder statisch/hart gesetzt werden duerfen
welche Felder aus bestehendem Status kommen duerfen
welche Felder unknown bleiben muessen
welche Tests fuer read-only no-mutation noetig sind
```

## Moegliche CAN-14 Reihenfolge

```text
CAN-14.0 - Read-only Safety Status View Planning
CAN-14.1 - Safety Status Contract read-only
CAN-14.2 - Backend Status Shape read-only planen
CAN-14.3 - Dashboard Safety Status Anzeige planen
CAN-14.4 - Dashboard Safety Status Anzeige umsetzen, falls freigegeben
CAN-14.5 - Live-Test read-only
CAN-14.6 - Handoff
```

## Weiterhin nicht direkt umsetzen

- Alert Replay
- Sound Replay
- Queue Clear
- Overlay State Repair
- Execute Recovery
- Auto Recovery
- Auto Retry Overlay
- Streamer.bot Action Retry
- OBS Source Refresh
