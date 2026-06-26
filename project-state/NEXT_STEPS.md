# NEXT_STEPS

Stand: RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON  
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
```

## Ausgangspunkt RDAP82

```text
- Runtime-disabled Skeleton ist vorbereitet.
- /agent-ws Upgrade-Guard ist registriert.
- Runtime bleibt effective false.
- WSS Runtime bleibt false.
- Heartbeat Receiver bleibt false.
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
```

## Admin-Notes

```text
Admin-Notes eingefroren.
Nur bei echtem Fehler wieder anfassen.
```
