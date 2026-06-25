# NEXT_STEPS - stream-control-center

Stand: RDAP28B_ADMIN_NOTE_READONLY_UI_PANEL_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Erledigt / live bestaetigt

```text
RDAP25 Login-/OAuth-/Session-Smoke-Test erfolgreich.
RDAP26 Option B DB-Rollen/Permissions live geseeded und bestaetigt.
RDAP27 echte read-only Admin-Notiztext-Route gebaut, deployed und live bestaetigt.
RDAP28 read-only Admin-Notiz-UI-Panel gebaut, deployed und im Browser bestaetigt.
```

## Aktueller Rechte-Stand

```text
ForrestCGN / tw:127709954 -> Rolle owner
owner -> remote.view -> allow
owner -> admin.users.note.read -> allow
owner -> admin.users.note.write -> NICHT vergeben
```

## Aktueller Admin-Notiz-Stand

Backend:

```text
GET /api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954

Ohne Session:
  HTTP 401
  noteTextReturned: false

Mit Session + DashboardAccess + admin.users.note.read:
  HTTP 200
  noteTextReturned: true
  notes: []
```

Frontend:

```text
Admin -> Admin-Notizen
Read: true
Write: false
Notizen: 0
Tabelle: true
Keine Admin-Notizen vorhanden.
Keine Schreibbuttons.
```

## Naechste sinnvolle Entscheidung

Im neuen Chat zuerst entscheiden:

```text
A) RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION
   Eine kontrollierte Test-Notiz per SQL/DB-Seed anlegen, damit die read-only Anzeige realen Text zeigt.
   Keine UI-Schreibfunktion.

B) RDAP29_ADMIN_NOTE_WRITE_SCOPE_PLAN
   Write-Scope sauber planen, aber noch nichts schreiben.
```

Empfehlung:

```text
A zuerst, damit die Anzeige mit echtem Inhalt geprueft wird.
Danach Write-Scope planen.
```

## Harte Grenzen fuer naechste Steps

```text
Kein admin.users.note.write ohne separaten Plan.
Keine Schreibbuttons ohne separaten Plan.
Keine Write-Route ohne Confirm/Audit/Lock/Backup/Rollback.
Keine Community-Seiten-Anbindung fuer Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Spaeterer Write-Step muss enthalten

```text
Permission admin.users.note.write
Confirm-Write Pflicht
Audit-Payload
Lock-Scope admin:user-note:<target_user_uid>
Read-Back-Pruefung
Backup/Rollback-Konzept
separates Go von Forrest
```
