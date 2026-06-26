# CURRENT_STATUS

Stand: RDAP80C_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT  
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
WSS-Pfad /agent-ws ist nur geplant.
Keine Remote-/Agent-Actions aktiv.
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
```

## Naechster Hauptfokus

```text
Webserver <-> Stream-PC Verbindung weiter konkretisieren.
```

## Naechster empfohlener Step

```text
RDAP81_STREAM_PC_CONNECTION_HANDSHAKE_AND_TOKEN_PLAN
```

