# CURRENT_STATUS

Stand: RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP59 klaerte: Admin-Notizen bleiben vorerst Admin-only; kein Community-Read.
RDAP60 klaerte: Update und Deactivate werden nicht gemeinsam gebaut; zuerst nur Update.
RDAP61 aktivierte Backend-Update fuer aktive Admin-Notizen.
RDAP61B dokumentierte die Live-Bestaetigung von RDAP61.
RDAP62 bereinigte die Status-Semantik nach RDAP61.
RDAP62B dokumentierte die Live-Bestaetigung von RDAP62.
RDAP63 plante die Update-UI, ohne sie zu bauen.
```

## Aktueller Admin-Notes Stand

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> Backend confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

## Bestehende UI

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Aktuell gebaut:

```text
Read-Liste
Zieluser-Auswahl
Create-Button/Form bei Schreibrecht
Create mit confirmWrite:true
Reload nach erfolgreichem Create
```

Noch nicht gebaut:

```text
Update-Button
Update-Edit-Panel
Update-Busy-State
Update-Fehleranzeige
```

## RDAP63 Entscheidung

```text
Update-UI soll spaeter in die bestehende Admin-Notes-UI integriert werden.
Keine neue Seite.
Keine neue Backend-Route.
Kein paralleles UI-Modul.
Nur aktive Notizen.
Nur bei erfolgreicher Readroute und Schreibrecht.
Nach Erfolg immer Reload ueber Readroute.
Keine Optimistic-Mutation.
```

## Live-System

```text
Webserver: mods.forrestcgn.de
Service: scc-remote-modboard.service
Live-Pfad: /opt/stream-control-center/remote-modboard
DB: MariaDB 11.8.6 / c3stream_control
DB-Client: /root/rdap29_mysql_client.cnf
Branch: dev
```

## Weiterhin deaktiviert

```text
Admin-Note Update-UI ist noch nicht gebaut
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Naechster empfohlener Step

```text
RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION
```
