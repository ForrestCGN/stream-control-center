# NEXT_STEPS

Stand: RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC  
Datum: 2026-06-26

## Naechster Step

```text
RDAP84_STREAM_PC_CONNECTION_ACCESS_KEY_HANDSHAKE_PLAN
```

## Ziel

```text
Nur planen, wie spaeter ein Zugangsschluessel-Handshake sicher geprueft wird.
Keine Runtime-Aktivierung.
Keine akzeptierte Agent-Verbindung.
Keine produktiven Remote-Actions.
Keine Secret-Ausgabe.
```

## Ausgangspunkt RDAP83

```text
- Runtime-disabled Skeleton ist vorbereitet.
- /agent-ws Upgrade-Guard ist vorbereitet.
- Abgelehnte /agent-ws Versuche werden in-memory diagnostiziert.
- Runtime bleibt effective false.
- WSS Runtime bleibt false.
- Heartbeat Receiver bleibt false.
- acceptsAgentConnections bleibt false.
- Access-Key wird nicht ausgegeben.
- Status bleibt offline/disabled.
- Keine Agent-Actions.
- Keine DB-Migration.
```

## RDAP84 vorbereitend pruefen

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

## RDAP84 klaeren

```text
- Wie wird der Zugangsschluessel serverseitig gelesen, ohne ihn auszugeben?
- Welche Header sind fuer den spaeteren Handshake erlaubt?
- Wie wird invalid_connection_proof sicher diagnostiziert, ohne Secret-Werte zu loggen?
- Bleibt die erste echte Runtime weiter in-memory only?
- Wie wird verhindert, dass AGENT_RUNTIME_ENABLED=true allein eine produktive Verbindung freischaltet?
- Welche Statuswerte duerfen sichtbar sein?
```

## Strikt nicht machen

```text
Keine akzeptierte Agent-Verbindung.
Keine Runtime-Aktivierung ohne separaten Plan.
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
