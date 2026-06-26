# NEXT_STEPS

Stand: RDAP82B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT  
Datum: 2026-06-26

## Naechster Step

```text
RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC
```

## Ziel

```text
Nur Diagnose fuer abgelehnte /agent-ws Verbindungsversuche planen.
Keine akzeptierte Agent-Verbindung.
Keine produktiven Remote-Actions.
Keine Secret-Ausgabe.
```

## Ausgangspunkt RDAP82B

```text
- Runtime-disabled Skeleton ist live bestaetigt.
- /agent-ws Upgrade-Guard ist vorbereitet.
- Runtime bleibt effective false.
- WSS Runtime bleibt false.
- Heartbeat Receiver bleibt false.
- acceptsAgentConnections bleibt false.
- Access-Key wird nicht ausgegeben.
- Status bleibt offline/disabled.
- Keine Agent-Actions.
- Keine DB-Migration.
```

## RDAP83 vorbereitend pruefen

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/services/agent-runtime-disabled.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
docs/current/*
project-state/*
```

## RDAP83 klaeren

```text
- Sollen abgelehnte /agent-ws Versuche nur in-memory gezaehlt werden?
- Welche Ablehnungsgruende duerfen sichtbar sein?
- Welche Daten duerfen niemals geloggt werden?
- Soll /api/remote/agent/status die letzte Reject-Diagnose anzeigen?
- Wie bleibt die Diagnose ohne DB-Migration sicher?
- Wie wird verhindert, dass Header/Secrets/IP-Details unnötig offenliegen?
```

## Strikt nicht machen

```text
Keine akzeptierte Agent-Verbindung.
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

## Admin-Notes

```text
Admin-Notes eingefroren.
Nur bei echtem Fehler wieder anfassen.
```
