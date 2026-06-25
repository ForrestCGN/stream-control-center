# NEXT_STEPS - stream-control-center

Stand: RDAP27B_ADMIN_NOTE_REAL_READ_ROUTE_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Erledigt / live bestaetigt

```text
RDAP16 Admin-Notiz-Tabelle dashboard_user_admin_notes angelegt
RDAP17 Admin-Notiz Read-Diagnostic read-only gebaut und live bestaetigt
RDAP17B Routenuebersicht fuer Admin-Notiz Read-Diagnostic synchronisiert
RDAP20 Admin-Notiz Read-Permission-Diagnostic gebaut und live bestaetigt
RDAP24 Auth-/Session-/OAuth-Readiness-Diagnostic gebaut und live bestaetigt
RDAP25 Login-/OAuth-/Session-Smoke-Test erfolgreich
RDAP26 Option B DB-Rollen/Permissions live geseeded und bestaetigt
RDAP27 echte read-only Admin-Notiztext-Route gebaut, deployed und live bestaetigt
```

## Aktueller Rechte-Stand

```text
ForrestCGN / tw:127709954 -> Rolle owner
owner -> remote.view -> allow
owner -> admin.users.note.read -> allow
owner -> admin.users.note.write -> NICHT vergeben
```

## Aktueller Admin-Notiz-Read-Stand

```text
Route: GET /api/remote/admin/users/admin-notes/read?targetUserUid=<USER_UID>

Ohne Session:
  HTTP 401
  noteTextReturned: false

Mit Session + DashboardAccess + admin.users.note.read:
  HTTP 200
  noteTextReturned: true
  notes: []
```

`notes: []` ist aktuell korrekt, weil noch keine Admin-Notiz existiert.

## Naechster sinnvoller Fachstep

```text
RDAP28_ADMIN_NOTE_READONLY_UI_PANEL
```

Ziel:

```text
Admin-Notizen im Dashboard read-only anzeigen
nur fuer eingeloggte User mit admin.users.note.read
keine Schreibbuttons
keine Write-Route
keine Community-Seiten-Anbindung
```

## RDAP28 harte Grenzen

```text
Kein admin.users.note.write
Keine Admin-Notiz-Erstellung
Keine Admin-Notiz-Aenderung
Keine Admin-Notiz-Loeschung
Keine UI-Schreibbuttons
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
Keine Community-Seiten-Anbindung fuer Admin-Notizen
```

## Spaeterer Write-Step bleibt getrennt

Ein echter Admin-Notiz-Write darf erst gebaut werden, wenn separat geplant und freigegeben ist:

```text
Permission admin.users.note.write
Confirm-Write Pflicht
Audit-Payload
Lock-Scope admin:user-note:<target_user_uid>
Read-Back-Pruefung
Backup/Rollback-Konzept
separates Go von Forrest
```

## Offene Diagnose-/Workflow-Punkte

```text
Deploy-Safety-Check anpassen: 403/403 nur bei deaktiviertem Login erwarten, 302/403 bei bewusst aktiviertem Login erlauben.
Base moduleBuild/statusApiVersion bei echten Backend-Steps aktuell halten.
```
