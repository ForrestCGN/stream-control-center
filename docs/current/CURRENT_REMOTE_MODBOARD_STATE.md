# CURRENT_REMOTE_MODBOARD_STATE

Stand: RDAP117_ADMIN_CONNECTIONS_MODULE_SPLIT  
Datum: 2026-06-27

## Navigation

```text
System:
- Übersicht
- Diagnose

Admin:
- Benutzerverwaltung
- Admin-Notizen
- Verbindungen
- Doku / Details
```

## Frontend-Module

```text
remote-modboard/backend/public/assets/modules/admin/users.js
remote-modboard/backend/public/assets/modules/admin/notes.js
remote-modboard/backend/public/assets/modules/admin/connections.js
remote-modboard/backend/public/assets/modules/system/diagnostics.js
remote-modboard/backend/public/assets/modules/ui/refresh-behavior.js
```

## Verbindungen

```text
Verbindungen ist ein eigenes Admin-Frontend-Modul.
Die Ansicht zeigt read-only den Stream-PC/Agent-Verbindungsstatus und Heartbeat.
Es gibt keine Agent-Actions, keine Start-/Stop-Funktionen und keine produktiven Writes.
Status darf automatisch aktualisieren, weil Verbindung/Heartbeat live relevant sind.
```

## Sicherheit

```text
Keine Backend-Aenderung.
Keine DB-Migration.
Keine Agent-Actions.
Keine neuen Writes.
```
