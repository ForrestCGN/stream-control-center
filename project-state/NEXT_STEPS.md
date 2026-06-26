# NEXT_STEPS

Stand: RDAP97_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PLAN  
Datum: 2026-06-26

## Naechster Step

```text
RDAP98_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_LIVE
```

## Ziel

RDAP98 soll den in RDAP97 geplanten manuellen Test des RDAP96-Agent-Clients durchfuehren:

```text
- Vorab disabled Status pruefen.
- Runtime auf dem Webserver nur temporaer aktivieren.
- Agent Client nur manuell starten.
- Lokales Secret nur lokal setzen, niemals in Chat/Git/Doku.
- /api/remote/agent/status pruefen.
- Gueltigen Heartbeat bestaetigen.
- Agent stoppen.
- Runtime final wieder deaktivieren.
- Finalen disabled Status pruefen.
- Keine Actions.
```

## Voraussetzung

```text
RDAP97 abgeschlossen:
- Manueller Testplan dokumentiert.
- Kein Agent-Code geaendert.
- Kein Backend-Code geaendert.
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
