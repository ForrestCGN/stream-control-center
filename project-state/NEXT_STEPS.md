# NEXT_STEPS

Stand: RDAP81_STREAM_PC_CONNECTION_HANDSHAKE_AND_ACCESS_KEY_PLAN  
Datum: 2026-06-26

## Naechster Step

```text
RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON
```

## Ziel

```text
Einen technischen Skeleton fuer die spaetere Stream-PC Verbindung planen bzw. vorbereiten, aber Runtime default disabled lassen.
Keine produktiven Remote-Actions.
```

## Ausgangspunkt RDAP81

```text
- GET /api/remote/agent/status vorhanden.
- UI-Page ist Admin -> Verbindungen / Stream-PC Verbindung.
- Kein eigenes Hauptmodul Agent in der Navigation.
- Status ist disabled/offline.
- Heartbeat-Modell ist read-only vorbereitet.
- WSS-Pfad /agent-ws ist geplant.
- Agent-ID bleibt stream-pc-main.
- Agent-Name bleibt Forrest Stream-PC.
- Zugangsschluessel-Konzept ist dokumentiert.
- Erste Runtime-Stufe soll In-Memory bleiben.
- Keine DB-Migration in RDAP81.
```

## RDAP82 vorbereitend pruefen

```text
remote-modboard/backend/server.js
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/routes/agent-status.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/public/assets/rdap80-agent-status.js
backend/modules/remote_agent.js
tools/*
docs/current/*
project-state/*
```

## RDAP82 klaeren

```text
- Gibt es bereits eine passende Server-Andockstelle fuer WSS?
- Muss package.json spaeter um eine Dependency erweitert werden?
- Bleibt Runtime per Config/Env default disabled?
- Wie wird der Verbindungsnachweis serverseitig aus der Umgebung gelesen?
- Wie wird verhindert, dass geheime Werte in Status/Logs/UI landen?
- Wie wird ein verbundener Agent In-Memory verwaltet?
- Wie werden stale/offline berechnet?
- Welche Statusdaten duerfen im UI sichtbar sein?
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
Keine produktive Agent-Action-Queue.
```

## Admin-Notes

```text
Admin-Notes eingefroren.
Nur bei echtem Fehler wieder anfassen.
```
