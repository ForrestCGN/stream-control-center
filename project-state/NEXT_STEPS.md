# NEXT_STEPS

Stand: RDAP85B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT  
Datum: 2026-06-26

## Naechster Step

```text
RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED
```

## Ziel

```text
Access-Key-Vergleich gegen AGENT_ACCESS_KEY vorbereiten.
Verbindungen weiterhin ablehnen.
Keine Runtime-Aktivierung.
Keine akzeptierte Agent-Verbindung.
Keine produktiven Remote-Actions.
Keine Secret-Ausgabe.
```

## Ausgangspunkt RDAP85B

```text
- Runtime-disabled Skeleton ist live.
- /agent-ws Upgrade-Guard ist live.
- Handshake-Precheck ist live.
- Abgelehnte /agent-ws Versuche werden in-memory diagnostiziert.
- missing_agent_id, unknown_agent_id und missing_connection_proof wurden live getestet.
- rejectCount stieg nach drei Tests auf 3.
- Runtime bleibt effective false.
- WSS Runtime bleibt false.
- Heartbeat Receiver bleibt false.
- acceptsAgentConnections bleibt false.
- Access-Key wird nicht ausgegeben.
- Status bleibt offline/disabled.
- Keine Agent-Actions.
- Keine DB-Migration.
```

## RDAP86 vorbereitend pruefen

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

## RDAP86 klaeren

```text
- Wie wird AGENT_ACCESS_KEY sicher aus der bestehenden Config/Env gelesen?
- Wie wird Authorization: Bearer <wert> serverseitig verglichen, ohne den Wert zu speichern/loggen?
- Wie wird falscher Bearer-Wert als invalid_connection_proof diagnostiziert?
- Was passiert bei korrektem Bearer-Wert, solange Runtime disabled bleibt?
- Bleibt die Antwort weiterhin HTTP 503?
- Welche Boolean-/Hint-Felder duerfen sichtbar sein?
- Wie wird verhindert, dass ein korrektes Secret schon eine Verbindung akzeptiert?
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
