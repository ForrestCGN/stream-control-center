# NEXT_STEPS

Stand: RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED  
Datum: 2026-06-26

## Naechster Step

```text
RDAP86B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT
```

## Ziel

```text
RDAP86 nach Webserver-Deploy live bestaetigen und dokumentieren.
Access-Key-Compare-Reject-Tests dokumentieren.
Keine Backend-Aenderung.
Keine Runtime-Aktivierung.
Keine akzeptierte Agent-Verbindung.
Keine produktiven Remote-Actions.
Keine Secret-Ausgabe.
```

## Ausgangspunkt RDAP86

```text
- Runtime-disabled Skeleton ist vorbereitet.
- /agent-ws Upgrade-Guard ist vorbereitet.
- Handshake-Precheck ist vorbereitet.
- Access-Key-Compare ist vorbereitet.
- Runtime bleibt effective false.
- WSS Runtime bleibt false.
- Heartbeat Receiver bleibt false.
- acceptsAgentConnections bleibt false.
- Access-Key wird nicht ausgegeben.
- Bearer-Token wird nicht ausgegeben.
- Status bleibt offline/disabled.
- Keine Agent-Actions.
- Keine DB-Migration.
```

## RDAP86B pruefen

```text
/api/remote/agent/status
/api/remote/status
/api/remote/routes
/agent-ws Reject-Test mit falschem Auth-Schema
/agent-ws Reject-Test mit falschem Bearer-Wert
optional /agent-ws Reject-Test mit korrekt gesetztem AGENT_ACCESS_KEY nur ohne Secret-Ausgabe
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
