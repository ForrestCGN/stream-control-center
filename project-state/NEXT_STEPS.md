# NEXT_STEPS

Stand: RDAP102_STREAM_PC_CONNECTION_DASHBOARD_STATUS_VISIBLE_PLAN  
Datum: 2026-06-26

## Naechster Step

```text
RDAP103_STREAM_PC_CONNECTION_STATUS_UI_READONLY_CARD
```

## Ziel

RDAP103 soll die in RDAP102 geplante Read-only UI-Kachel fuer den Stream-PC Verbindungsstatus vorbereiten:

```text
- Bereich: Verbindungen.
- Kachel: Stream-PC Verbindung.
- Untertitel: Webserver <-> Stream-PC.
- Datenquelle: GET /api/remote/agent/status.
- Anzeigen: verbunden/getrennt/veraltet, letzter Heartbeat, heartbeatAge/stale, Actions disabled.
- Nutzerfreundliche Bezeichnungen verwenden.
- Keine Start/Stop Buttons.
- Keine Agent-Actions.
```

## Voraussetzung

```text
RDAP102 abgeschlossen:
- Plan fuer sichtbaren Stream-PC Verbindungsstatus dokumentiert.
- Public WSS Heartbeat ist seit RDAP101B live bestaetigt.
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
