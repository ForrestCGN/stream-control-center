# NEXT_STEPS

Stand: RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED  
Datum: 2026-06-26

## Naechster Step

```text
RDAP85B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT
```

## Ziel

```text
RDAP85 nach Webserver-Deploy live bestaetigen und dokumentieren.
Handshake-Precheck-Reject-Tests dokumentieren.
Keine Backend-Aenderung.
Keine Runtime-Aktivierung.
Keine akzeptierte Agent-Verbindung.
Keine produktiven Remote-Actions.
Keine Secret-Ausgabe.
```

## Ausgangspunkt RDAP85

```text
- Runtime-disabled Skeleton ist vorbereitet.
- /agent-ws Upgrade-Guard ist vorbereitet.
- Handshake-Precheck im disabled Guard ist vorbereitet.
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

## RDAP85B vorbereitend pruefen

```text
curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.statusApiVersion, .runtime, .rejectDiagnostic'
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.agent'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.agentStatusFoundation'
/agent-ws Reject-Tests ohne Header, falscher Agent-ID und richtiger ID ohne Auth
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
