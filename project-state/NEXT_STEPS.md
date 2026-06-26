# NEXT_STEPS

Stand: RDAP96B_STREAM_PC_CONNECTION_AGENT_CLIENT_LOCAL_CHECK_DOCS  
Datum: 2026-06-26

## Naechster Step

```text
RDAP97_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PLAN
```

## Ziel

RDAP97 soll einen separaten manuellen Testplan fuer den RDAP96-Agent-Client vorbereiten:

```text
- Runtime auf dem Webserver nur temporaer aktivieren.
- Agent Client nur manuell starten.
- Lokales Secret nur lokal setzen, niemals in Chat/Git/Doku.
- /api/remote/agent/status pruefen.
- Gueltigen Heartbeat bestaetigen.
- Runtime final wieder deaktivieren.
- Finalen disabled Status pruefen.
- Keine Actions.
```

## Voraussetzung

```text
RDAP96B abgeschlossen:
- node --check fuer Agent-Dateien bestaetigt.
- npm --prefix remote-modboard/stream-pc-agent run check bestaetigt.
- git status sauber nach stepdone.cmd.
- Kein Webserver-Deploy noetig.
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
