# NEXT_STEPS

Stand: RDAP93_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_PLAN  
Datum: 2026-06-26

## Naechster Step

```text
RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
```

## Ziel

```text
Heartbeat read-only in-memory umsetzen.
Bestehende Runtime-/Status-Services erweitern.
Keine neue parallele /agent-ws Struktur.
Nur minimalen Heartbeat-Payload akzeptieren.
lastHeartbeatAt setzen.
heartbeatAgeMs berechnen.
stale/offline ableiten.
Keine Actions.
Keine DB.
Keine Secrets.
```

## Ausgangspunkt

```text
RDAP92/RDAP92B:
- Minimaler /agent-ws Transport-Accept live bestaetigt.
- Zwei-Stufen-Gate funktioniert.
- Correct Bearer allein reicht nicht.
- HTTP 101 Switching Protocols mit beiden Gates bestaetigt.
- Connected/Close Status bestaetigt.
- Actions false.
- Heartbeat false.
- Runtime final wieder deaktiviert.

RDAP93:
- Heartbeat-Modell read-only geplant.
- Payload minimal definiert.
- In-Memory-only.
- Keine Actions.
- Keine DB.
- Keine Secrets.
```

## Strikt nicht machen

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration ohne separaten Plan.
Keine neue Permission ohne separaten Plan.
Keine produktive Agent-Action-Queue.
Keine Capabilities-Freigabe.
Keine Secret-Ausgabe.
Keine Rohpayload-Ausgabe.
```
