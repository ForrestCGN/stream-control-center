# CURRENT_STATUS

Stand: RDAP80B_AGENT_MENU_TO_ADMIN_CONNECTIONS  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP77B: Module Registry / Admin-Unterseiten sichtbar exklusiv getestet.
RDAP78C: Admin-Notes Zieluser-/Notice-/Count-Kontext getestet.
RDAP79: Doku-Abschluss und naechster Fokus Webserver <-> Stream-PC vorbereitet.
RDAP80: Agent-Status/Heartbeat-Foundation read-only vorbereitet und live bestaetigt.
RDAP80B: Sichtbare UI-Einordnung von Agent -> Agent-Status zu Admin -> Verbindungen korrigiert.
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
/api/remote/status enthaelt Agent-Summary.
/api/remote/routes listet die Agent-Statusroute.
Remote-Modboard UI zeigt Admin -> Verbindungen.
Seite heisst Stream-PC Verbindung.
Status ist read-only und aktuell disabled/offline.
Heartbeat-Modell ist vorbereitet, aber Receiver/Runtime sind disabled.
Keine Remote-/Agent-Actions aktiv.
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
```

## Naechster Hauptfokus

```text
Webserver <-> Stream-PC Verbindung weiter konkretisieren.
```

## Naechster empfohlener Step

```text
RDAP81_AGENT_HANDSHAKE_AND_TOKEN_PLAN
```
