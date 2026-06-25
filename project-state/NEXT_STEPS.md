# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS20B_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Erledigt / live bestaetigt

```text
RDAP16 Admin-Notiz-Tabelle dashboard_user_admin_notes angelegt
RDAP16 Diagnose: tableExists true, schemaReady true, migrationRequired false, rowCount 0
RDAP17 Admin-Notiz Read-Diagnostic read-only gebaut und live bestaetigt
RDAP17B Routenuebersicht fuer Admin-Notiz Read-Diagnostic synchronisiert und live bestaetigt
RDAP18 Admin-Notiz Display-Scope geplant
RDAP19 Auth-/Permission-Read-Check fuer Admin-Notizen geplant
RDAP20 Admin-Notiz Read-Permission-Diagnostic gebaut und live bestaetigt
RDAP20 unauthentifizierter Zugriff korrekt mit HTTP 401 blockiert
```

## Naechster sinnvoller Fachstep

```text
RDAP21_ADMIN_NOTE_DISPLAY_READINESS_PLAN
```

RDAP21 soll zuerst nur planen bzw. sehr vorsichtig vorbereiten, wie echte Admin-Notiztexte spaeter angezeigt werden duerfen.

Wichtige Punkte fuer RDAP21:

```text
Keine produktiven Writes
Keine Notiz-Erstellung
Keine Notiz-Aenderung
Keine Notiz-Loeschung
Keine UI-Schreibbuttons
Keine Notiztexte ohne echte Session/Permission
Permission admin.users.note.read serverseitig erzwingen
Community-Seiten duerfen Admin-Notizen niemals lesen
Dashboard-UI nur read-only planen
```

## Danach moeglich, aber getrennt

Erst nach RDAP21-Planung und separatem Go:

```text
RDAP22_ADMIN_NOTE_DISPLAY_READONLY_AUTHED
```

Dieser Step duerfte echte Notiztexte nur dann anzeigen, wenn Auth/Session/Permission serverseitig sauber aktiv und getestet sind.

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
OAuth-Safety-Check im Deploy-Script separat pruefen: twitch/start liefert aktuell HTTP 302 statt erwarteter 403.
Base moduleBuild/statusApiVersion spaeter kosmetisch/diagnostisch anheben, aber nur in eigenem Mini-Scope.
```
