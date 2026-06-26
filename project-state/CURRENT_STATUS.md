# CURRENT_STATUS

Stand: RDAP79_DOCS_CURRENT_STATE_AND_NEXT_STREAMPC_CONNECTION_PROMPT  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP77B: Module Registry / Admin-Unterseiten sichtbar exklusiv getestet.
RDAP78C: Admin-Notes Zieluser-/Notice-/Count-Kontext getestet.
RDAP79: Doku-Abschluss und naechster Fokus Webserver <-> Stream-PC vorbereitet.
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

## Admin-Notes Backend-Stand

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> Backend confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

## Strukturstand Remote-Modboard

```text
remote-modboard.js fuehrt Haupt-Router und Frontend-Registry.
Admin ist Obermodul.
Admin-Notizen und User-Detail sind Admin-Pages.
Inaktive Panels werden per hidden und is-active-view versteckt.
```

## Weiterhin deaktiviert/verboten

```text
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Naechster Hauptfokus

```text
Webserver <-> Stream-PC Verbindung
```

## Naechster empfohlener Step

```text
RDAP80_AGENT_CONNECTION_ARCHITECTURE_AND_STATUS_FOUNDATION
```
