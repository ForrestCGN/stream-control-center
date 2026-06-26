# CURRENT_STATUS

Stand: RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Aktuell bestaetigt

```text
RDAP59 klaerte: Admin-Notizen bleiben vorerst Admin-only; kein Community-Read.
RDAP60 klaerte: Update und Deactivate werden nicht gemeinsam gebaut; zuerst nur Update.
RDAP61 aktivierte Backend-Update fuer aktive Admin-Notizen.
RDAP61B dokumentierte die Live-Bestaetigung von RDAP61.
RDAP62 bereinigt die Status-Semantik fuer Update-Backend vs. Update-UI.
```

## RDAP62 Umsetzung

```text
/api/remote/status sagt nicht mehr pauschal, Update sei deaktiviert.
Create-Backend und Create-UI werden getrennt angezeigt.
Update-Backend wird als aktiv angezeigt.
Update-UI wird als nicht gebaut angezeigt.
Deactivate/Delete bleiben deaktiviert/verboten.
Community-Read bleibt verboten.
```

## Geaendert in RDAP62

```text
remote-modboard/backend/src/routes/status.routes.js
```

## Admin-Notes aktueller Strukturstand

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> Backend confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> weiter disabled
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
Admin-Note Update-UI
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
RDAP62B_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS
```
