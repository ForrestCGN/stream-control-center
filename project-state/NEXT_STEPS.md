# NEXT_STEPS - stream-control-center

Stand: RDAP26B_OWNER_PERMISSION_SEED_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Erledigt / live bestaetigt

```text
RDAP16 Admin-Notiz-Tabelle dashboard_user_admin_notes angelegt
RDAP17 Admin-Notiz Read-Diagnostic read-only gebaut und live bestaetigt
RDAP17B Routenuebersicht fuer Admin-Notiz Read-Diagnostic synchronisiert und live bestaetigt
RDAP18 Admin-Notiz Display-Scope geplant
RDAP19 Auth-/Permission-Read-Check fuer Admin-Notizen geplant
RDAP20 Admin-Notiz Read-Permission-Diagnostic gebaut und live bestaetigt
RDAP20 unauthentifizierter Zugriff korrekt mit HTTP 401 blockiert
RDAP21 Admin-Notiz Display-Readiness geplant
RDAP22 echte Admin-Notiz Read-Route geplant, aber nicht gebaut
RDAP23 Auth-/Session-/Login-Aktivierung groesser gebuendelt geplant
RDAP24 Auth-/Session-/OAuth-Readiness-Diagnostic gebaut und live bestaetigt
RDAP24 Readiness: readyForLoginSmokeTest true, blockers []
RDAP25 Login-/OAuth-/Session-Smoke-Test erfolgreich
RDAP26 Option B DB-Rollen/Permissions live geseeded und bestaetigt
```

## Aktueller Rechte-Stand

```text
ForrestCGN / tw:127709954 -> Rolle owner
owner -> remote.view -> allow
owner -> admin.users.note.read -> allow
```

## Naechster sinnvoller Fachstep

```text
RDAP27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
```

RDAP27 darf echte Admin-Notiztexte nur read-only liefern, wenn serverseitig gilt:

```text
gueltige Session
Dashboard-Zugriff erlaubt
admin.users.note.read effectivePermissionWouldAllow true
Community-Seiten ausgeschlossen
keine Write-Funktion
keine UI-Schreibbuttons
```

## RDAP27 harte Grenzen

```text
Kein admin.users.note.write
Keine Admin-Notiz-Erstellung
Keine Admin-Notiz-Aenderung
Keine Admin-Notiz-Loeschung
Keine UI-Schreibbuttons
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
Keine Community-Seiten-Anbindung
```

## Danach moeglich

Nach RDAP27:

```text
RDAP28_ADMIN_NOTE_READONLY_UI_PANEL
```

Das waere eine reine read-only Dashboard-Anzeige fuer Admin-Notizen, ohne Schreibbuttons.

## Admin-Notiz-Write bleibt spaeter getrennt

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
Base moduleBuild/statusApiVersion bei echten Backend-Steps aktualisieren und nicht auf alten RDAP14B-Werten stehen lassen.
```
