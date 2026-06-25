# CURRENT_STATUS

Stand: RDAP31_ADMIN_NOTE_WRITE_BACKEND_DISABLED_UI  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard

## Produktiv

```text
URL: https://mods.forrestcgn.de/
Live-Pfad: /opt/stream-control-center/remote-modboard
Service: scc-remote-modboard.service
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
```

## Bestaetigter Stand

```text
RDAP25 Login/OAuth/Session funktioniert.
RDAP26 Option B DB-Rollen/Permissions funktioniert.
RDAP27 echte read-only Admin-Notiztext-Route funktioniert.
RDAP28 read-only Admin-Notiz-UI funktioniert.
RDAP29/RDAP29B MariaDB-Testnotiz ist live sichtbar.
RDAP30 Write-Scope ist geplant.
RDAP31 Backend-Write-Routen sind als gesperrte Validierungsrouten vorbereitet.
```

## RDAP31

Neue Backend-Routen:

```text
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update
POST /api/remote/admin/users/admin-notes/deactivate
```

Diese Routen pruefen read-only:

```text
Session
Dashboard-Zugriff
remote.view
admin.users.note.write
confirmWrite
Input
DB-Schema
Zieluser
bestehende Notiz bei update/deactivate
Audit-Draft
Lock-Draft
```

Diese Routen schreiben nicht:

```text
writeEnabled: false
databaseWriteEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
writeExecuted: false
```

## Weiterhin blockiert

```text
Admin-Notiz produktiv schreiben
Admin-Notiz produktiv aendern
Admin-Notiz produktiv deaktivieren
Permission admin.users.note.write vergeben
UI-Schreibbuttons
Physisches Delete
Audit-Inserts
Lock acquire/heartbeat/release/force-takeover
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
Community-Seiten-Anbindung fuer Admin-Notizen
```
