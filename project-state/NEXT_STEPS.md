# NEXT_STEPS

## Naechster Schritt

Empfohlener Start:

```text
CAN-14.3 - Dashboard Safety Status Anzeige planen
```

## CAN-14 Zielrichtung

CAN-14 soll nicht direkt produktive Recovery umsetzen.

Sinnvolle Richtung:

```text
Read-only Safety Status View
```

## CAN-14.3 Ziel

CAN-14.3 soll planen, wie eine spaetere Dashboard Safety Status Anzeige aussehen darf.

Dabei wird noch keine Dashboard-Datei umgesetzt.

Zu klaeren:

```text
welche Karten/Abschnitte sichtbar sein sollen
wie green/yellow/red/gray angezeigt werden
wie false/unknown/blocked erklaert wird
welche Buttons ausdruecklich nicht vorkommen
wie harte Blocker angezeigt werden
welche Tests fuer read-only Dashboard noetig sind
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
