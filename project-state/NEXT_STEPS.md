# NEXT_STEPS

Stand: RDAP87B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT  
Datum: 2026-06-26

## Naechster Step

```text
RDAP88_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN
```

## Ziel

```text
Plan fuer spaetere Runtime-Freigabe der Stream-PC Verbindung erstellen.
Noch keine Runtime aktivieren.
Noch keine Verbindung akzeptieren.
Keine produktiven Remote-Actions.
Keine Secret-Ausgabe.
```

## Ausgangspunkt RDAP87B

```text
- RDAP86 Access-Key-Compare ist live bestaetigt.
- RDAP87 hat sicheres Env-Setup dokumentiert.
- AGENT_ACCESS_KEY ist auf dem Webserver gesetzt.
- accessKeyConfigured true ist live bestaetigt.
- Falscher Bearer liefert invalid_connection_proof.
- Verbindung bleibt HTTP 503 / disabled.
- acceptsAgentConnections bleibt false.
- actionEnabled bleibt false.
- productiveAgentRuntime bleibt false.
- Kein Key/Bearer/Token-Hash/Token-Laenge sichtbar.
```

## RDAP88 planen

```text
- Bedingungen fuer spaeteren akzeptierten /agent-ws Handshake definieren.
- Zwei-Stufen-Freigabe beibehalten.
- AGENT_RUNTIME_ENABLED=true allein darf nicht reichen.
- Moeglichen zweiten Explicit-Enable-Schalter planen.
- Heartbeat-Receiver erst separat planen.
- Agent-online-Status erst separat planen.
- Agent-Actions strikt getrennt spaeter planen.
```

## Strikt nicht machen

```text
Keine akzeptierte Agent-Verbindung.
Keine Runtime-Aktivierung ohne separaten Code-Step.
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
