# NEXT_STEPS

Stand: RDAP96_STREAM_PC_CONNECTION_AGENT_CLIENT_HEARTBEAT_ONLY_CODE  
Datum: 2026-06-26

## Naechster Step

```text
RDAP96B_STREAM_PC_CONNECTION_AGENT_CLIENT_LOCAL_CHECK_DOCS
```

## Ziel

RDAP96B soll den RDAP96-Agent-Client lokal pruefen und dokumentieren:

```text
- node --check fuer Agent-Dateien bestaetigen.
- npm --prefix remote-modboard/stream-pc-agent run check bestaetigen.
- git status pruefen.
- Kein Webserver-Deploy, wenn nur Agent-Client und Doku betroffen sind.
- Noch kein Webserver-Live-Test ohne separaten Plan.
```

## Danach moeglich

```text
RDAP97_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PLAN
```

Nur als separater Plan:

```text
- Runtime temporaer aktivieren.
- Agent manuell mit lokal gesetztem Secret starten.
- /api/remote/agent/status pruefen.
- Runtime final wieder deaktivieren.
- Keine Secret-Ausgabe.
- Keine Actions.
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
Keine Prozessliste.
Keine Dateiliste.
Keine Env-Dumps.
Keine Pfad-Dumps.
Keine produktiven Writes.
Keine DB-Migration.
Keine neue Permission.
Keine produktive Agent-Action-Queue.
Keine Secret-Ausgabe.
Keine Rohpayload-Ausgabe.
Keine Runtime dauerhaft aktivieren.
```
