# NEXT_STEPS

Stand: RDAP92C_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT  
Datum: 2026-06-26

## Naechster Step

```text
RDAP93_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_PLAN
```

## Ziel

```text
Heartbeat-Modell read-only planen.
Noch keine Actions.
Kein OBS/Sound/Overlay/Command.
Keine freie Shell/Datei/Prozess/URL.
Keine DB-Migration im ersten Heartbeat-Plan.
In-Memory Heartbeat/Stale/Offline sauber definieren.
Payload minimal und sicher definieren.
Secret-Safety fortsetzen.
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
Keine Secret-Ausgabe.
```
