# NEXT_STEPS

## Naechster Schritt

Empfohlener Start:

```text
CAN-14.1 - Safety Status Contract read-only
```

## CAN-14 Zielrichtung

CAN-14 soll nicht direkt produktive Recovery umsetzen.

Sinnvolle Richtung:

```text
Read-only Safety Status View
```

## CAN-14.1 Ziel

CAN-14.1 soll den read-only Safety Status Contract definieren.

Der Contract soll festlegen:

```text
Feldnamen
Bedeutung
Datentypen
Statusgruppen
Ampel-Logik
was false bedeutet
was blocked bedeutet
was read-only bedeutet
welche Aktionen weiterhin hart blockiert sind
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
