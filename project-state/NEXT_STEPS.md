# NEXT_STEPS

Stand: RDAP79_DOCS_CURRENT_STATE_AND_NEXT_STREAMPC_CONNECTION_PROMPT  
Datum: 2026-06-26

## Naechster Step

```text
RDAP80_AGENT_CONNECTION_ARCHITECTURE_AND_STATUS_FOUNDATION
```

## Ziel

```text
Webserver <-> Stream-PC Verbindung vorbereiten.
Remote-Modboard soll zuerst nur Agent-Status/Heartbeat sauber anzeigen.
Keine produktiven Remote-Actions.
```

## Vorgehen RDAP80

```text
1. Startdateien aus GitHub/dev lesen.
2. Vorhandene Agent-/Remote-Dateien suchen und pruefen.
3. Bestehende Module bevorzugen.
4. Architekturplan nennen.
5. Auf go warten.
6. Erst dann Frontend-/Backend-Status-Foundation bauen, falls sinnvoll.
```

## Zu pruefen

```text
backend/modules/remote_agent.js
remote-modboard/backend/src/routes/*
remote-modboard/backend/src/services/*
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/remote-modboard.css
tools/*
docs/current/*
project-state/*
```

## Erstes sichtbares Ziel

```text
Remote-Modboard zeigt Agent-Status:
- disabled/offline/online
- letzter Heartbeat
- Agent-ID / Stream-PC Name
- Agent-Version
- keine Actions
```

## Strikt nicht machen

```text
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration ohne separaten Plan.
Keine neue Permission ohne separaten Plan.
```

## Admin-Notes

```text
Admin-Notes eingefroren.
Nur bei echtem Fehler wieder anfassen.
```
