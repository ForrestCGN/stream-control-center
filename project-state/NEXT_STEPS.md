# NEXT_STEPS

Stand: RDAP94C_LIVE_DEFAULT_CONFIRMED_AND_NEXT_PROMPT  
Datum: 2026-06-26

## Naechster Step

```text
RDAP94B_STREAM_PC_CONNECTION_HEARTBEAT_LIVE_CONFIRM
```

## Ziel

```text
RDAP94/RDAP94_FIX1 sind live im sicheren Default bestaetigt.
Jetzt Heartbeat Live-Confirm testen:
- Runtime temporaer bewusst aktivieren.
- WebSocket 101 pruefen.
- Valid heartbeat pruefen.
- lastHeartbeatAt / heartbeatAgeMs / heartbeatSeq / heartbeatProtocolVersion / stale pruefen.
- Forbidden heartbeat pruefen.
- Actions/DB/Secrets false bestaetigen.
- Runtime final wieder deaktivieren.
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
Keine DB-Migration.
Keine neue Permission.
Keine produktive Agent-Action-Queue.
Keine Secret-Ausgabe.
Keine Rohpayload-Ausgabe.
```
