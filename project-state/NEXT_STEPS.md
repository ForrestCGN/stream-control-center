# NEXT_STEPS

Stand: RDAP101B_STREAM_PC_CONNECTION_AGENT_PUBLIC_WSS_HEARTBEAT_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Naechster Step

```text
RDAP102_STREAM_PC_CONNECTION_DASHBOARD_STATUS_VISIBLE_PLAN
```

## Ziel

RDAP102 soll planen, wie der jetzt live bestaetigte Stream-PC Verbindungsstatus sichtbar im Remote-Modboard/Dashboard angezeigt wird:

```text
- Bestehende Status-/Routes-/UI-Struktur pruefen.
- Sichtbaren Status fuer Webserver <-> Stream-PC planen.
- Anzeigen: verbunden/getrennt, letzter Heartbeat, heartbeatAge/stale, Actions disabled.
- Nutzerfreundliche Bezeichnungen verwenden: Stream-PC Verbindung, Verbindungen, Webserver <-> Stream-PC.
- Erst Plan/Doku, keine direkte Action-Funktion.
- Keine Agent-Actions.
```

## Voraussetzung

```text
RDAP101B abgeschlossen:
- Public WSS Heartbeat live bestaetigt.
- Agent connected und heartbeatSeq=4 bestaetigt.
- Runtime final disabled.
- Keine Secrets.
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
