# CURRENT_STATUS

Stand: RDAP81_STREAM_PC_CONNECTION_HANDSHAKE_AND_ACCESS_KEY_PLAN  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP77B: Module Registry / Admin-Unterseiten sichtbar exklusiv getestet.
RDAP78C: Admin-Notes Zieluser-/Notice-/Count-Kontext getestet.
RDAP79: Doku-Abschluss und naechster Fokus Webserver <-> Stream-PC vorbereitet.
RDAP80: Agent-Status/Heartbeat-Foundation read-only vorbereitet und serverseitig live bestaetigt.
RDAP80B: Sichtbare UI-Einordnung von Agent -> Agent-Status zu Admin -> Verbindungen korrigiert und serverseitig live bestaetigt.
RDAP80C: Live-Abschluss dokumentiert und naechsten Step auf Stream-PC Verbindung statt sichtbares Agent-Modul ausgerichtet.
RDAP81: Stream-PC-Verbindungs-Handshake, Agent-ID, Zugangsschluessel-Konzept, WSS-Pfad und Heartbeat-Modell geplant; Doku-only.
```

## Admin-Notes Status

```text
Admin-Notizen sind fuer jetzt eingefroren.
User-Detail und Admin-Notizen sind getrennte Admin-Pages.
Header, Navigation und sichtbares Panel sind synchron.
ForrestCGN zeigt eigene Notizen.
EngelCGN zeigt keine falschen Forrest-Notizen mehr.
Falscher stale Count wurde in remote-modboard.js korrigiert.
```

## Stream-PC-Verbindungsstatus

```text
GET /api/remote/agent/status existiert.
Die Route ist read-only.
Die Route schreibt nichts.
Die Route fuehrt keine Aktionen aus.
/api/remote/status enthaelt Agent-/Stream-PC-Summary.
/api/remote/routes listet die Agent-Statusroute.
Remote-Modboard UI zeigt Admin -> Verbindungen.
Seite heisst Stream-PC Verbindung.
Status ist read-only und aktuell disabled/offline.
Heartbeat-Modell ist vorbereitet, aber Receiver/Runtime sind disabled.
WSS-Pfad /agent-ws ist geplant.
Stream-PC soll spaeter aktiv zum Webserver verbinden.
Keine Portfreigabe am Stream-PC.
Keine Remote-/Agent-Actions aktiv.
```

## RDAP81 Planung

```text
agentId bleibt: stream-pc-main
agentName bleibt: Forrest Stream-PC
Verbindungsnachweis erfolgt spaeter ueber geheimen Zugangsschluessel.
Geheimer Zugangsschluessel kommt nicht ins Repo, nicht ins Frontend, nicht in URLs und nicht in Logs.
Heartbeat spaeter alle 30 Sekunden.
Stale nach 90 Sekunden.
Offline nach 120 Sekunden.
Erste Runtime-Stufe bleibt In-Memory.
Keine DB-Persistenz ohne separaten Plan.
```

## Sprachregel

```text
Sichtbar / Doku / Nutzerfokus:
- Stream-PC Verbindung
- Verbindungen
- Webserver <-> Stream-PC

Intern / Code / Route:
- agent
- agent-status
- /api/remote/agent/status
- stream-pc-agent
- /agent-ws
```

Nicht mehr sichtbar als Hauptmodul verwenden:

```text
Agent -> Agent-Status
```

## Weiterhin deaktiviert/verboten

```text
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Remote-/Agent-Actions/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
produktive Writes ausserhalb explizit freigegebener Admin-Notes Create/Update-Scope
DB-Migrationen ohne separaten Plan
neue Permissions ohne separaten Plan
```

## Naechster Hauptfokus

```text
Runtime-disabled Skeleton fuer die Stream-PC Verbindung pruefen und planen.
```

## Naechster empfohlener Step

```text
RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON
```
