# NEXT_STEPS

Stand: RDAP86B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT  
Datum: 2026-06-26

## Naechster Step

```text
RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS
```

## Ziel

```text
Sicher dokumentieren, wie AGENT_ACCESS_KEY auf dem Webserver gesetzt wird.
Doku-only bevorzugt.
Kein Key im Repo.
Kein Key im Chat.
Kein Key in Logs.
Kein Key in Status/UI.
Nur sichere Pruefung: accessKeyConfigured true.
Noch keine akzeptierte Stream-PC Verbindung.
Noch keine Runtime-Aktivierung.
Keine produktiven Remote-Actions.
Keine DB-Migration.
Keine neue Permission.
```

## Ausgangspunkt RDAP86B

```text
- RDAP86 ist live bestaetigt.
- /agent-ws Upgrade-Guard ist aktiv und reject-only.
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

## RDAP87 pruefen

```text
/etc/stream-control-center/remote-modboard.env existiert auf Webserver.
AGENT_ACCESS_KEY darf nur dort gesetzt werden, nicht im Repo.
Secret-Wert niemals in Chat, Doku, Logs oder Status kopieren.
Status darf nur accessKeyConfigured true/false zeigen.
```

## Strikt nicht machen

```text
Keine akzeptierte Stream-PC Verbindung.
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
