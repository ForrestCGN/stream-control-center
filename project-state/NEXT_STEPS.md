# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS24B_LIVE_CONFIRMED_DOCS  
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
```

## Naechster sinnvoller Fachstep

```text
RDAP25_AUTH_SESSION_LOGIN_SMOKE_TEST
```

RDAP25 soll groesser, aber klar begrenzt sein:

```text
Login/OAuth/Session-Smoke-Test bewusst aktivieren/testen
Twitch-Start/Callback-Verhalten kontrolliert pruefen
Session-Cookie und /api/remote/auth/me pruefen
/api/remote/auth/session-status pruefen
/api/remote/auth/permissions/check pruefen
Keine Admin-Notiztexte anzeigen
Keine Admin-Notiz-Writes bauen
Keine User-/Rollenverwaltung
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```

## Danach moeglich

Erst nach erfolgreichem RDAP25-Smoke-Test:

```text
RDAP26_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
```

Dieser Step darf echte Admin-Notiztexte nur dann anzeigen, wenn serverseitig gilt:

```text
gueltige Session
Dashboard-Zugriff erlaubt
Permission admin.users.note.read vorhanden
Community-Seiten ausgeschlossen
```

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
