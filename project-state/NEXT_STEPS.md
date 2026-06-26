# NEXT_STEPS

Stand: RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS  
Datum: 2026-06-26

## Naechster Step

```text
RDAP87B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT
```

## Ziel

```text
RDAP87 nach manuellem Env-Setup auf dem Webserver live bestaetigen und dokumentieren.
Nur sichere Statuswerte dokumentieren.
Keine Backend-Aenderung.
Keine Runtime-Aktivierung.
Keine akzeptierte Stream-PC Verbindung.
Keine produktiven Remote-Actions.
Keine Secret-Ausgabe.
```

## Ausgangspunkt RDAP87

```text
- RDAP86 Access-Key-Compare ist live bestaetigt.
- AGENT_ACCESS_KEY war bisher nicht gesetzt.
- RDAP87 dokumentiert sicheres Setzen in /etc/stream-control-center/remote-modboard.env.
- Der echte Key darf nicht in Chat, Doku, Git, Logs, Screenshots oder Status/UI erscheinen.
- Nach Setup darf nur accessKeyConfigured true sichtbar sein.
- Runtime bleibt disabled.
- acceptsAgentConnections bleibt false.
- Keine Agent-Actions.
- Keine DB-Migration.
```

## RDAP87B pruefen

```text
/api/remote/agent/status
/api/remote/status
/api/remote/routes
/agent-ws Reject-Test mit falschem Bearer nach gesetztem Key
optional /agent-ws Reject-Test mit korrektem Bearer nur lokal ohne Secret-Ausgabe
```

## Strikt nicht machen

```text
Keinen echten AGENT_ACCESS_KEY in Chat/Doku/Git kopieren.
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
