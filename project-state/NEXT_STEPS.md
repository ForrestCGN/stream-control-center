# NEXT_STEPS

Stand: RDAP94D_STREAM_PC_CONNECTION_HEARTBEAT_LIVE_CONFIRM_DOCS  
Datum: 2026-06-26

## Naechster Step

```text
RDAP95_STREAM_PC_CONNECTION_AGENT_CLIENT_PLAN
```

## Ziel

```text
RDAP94B/RDAP94D haben bestaetigt:
- WebSocket /agent-ws funktioniert temporaer aktiviert.
- Gueltiger Heartbeat wird read-only/in-memory verarbeitet.
- Forbidden Heartbeat wird abgelehnt.
- Actions bleiben false.
- Productive Agent Runtime bleibt false.
- Runtime ist final wieder disabled.
```

RDAP95 soll den naechsten sicheren Schritt planen:

```text
- Minimalen Stream-PC Agent Client planen.
- Zunaechst nur Verbindung + Heartbeat.
- Keine OBS-/Sound-/Overlay-/Command-Actions.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine produktiven Writes.
- Keine DB-Migration.
- Keine neue Permission ohne separaten Plan.
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
