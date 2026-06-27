# RDAP39B_ADMIN_NOTE_WRITE_BACKEND_LIVE_CONFIRMED_DOCS

Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Doku-only nach erfolgreichem RDAP39 Live-Test

## Zweck

RDAP39 wurde live auf dem Webserver bestaetigt. Der erste kontrollierte produktive Backend-Create-Write fuer Admin-Benutzernotizen wurde erfolgreich ausgefuehrt.

Dieser Schritt dokumentiert nur den bestaetigten Live-Zustand. Es werden keine Backend-, UI- oder DB-Migrationsdateien geaendert.

## Live-Stand

```text
Service: scc-remote-modboard.service
Remote-Modboard Live-Pfad: /opt/stream-control-center/remote-modboard
Webserver-Subdomain: mods.forrestcgn.de
Branch: dev
Live-Step: RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED
Status API: rdap_admin_note_write39.v1
```

## Bestaetigte Route

```text
POST /api/remote/admin/users/admin-notes/create
```

## RDAP39 Sicherheitsregeln bestaetigt

```text
confirmWrite ist Pflicht.
confirmWrite wird nur aus dem JSON-Body akzeptiert.
Gueltige Session ist Pflicht.
Dashboard-Zugriff ist Pflicht.
remote.view ist Pflicht.
admin.users.note.read ist vorhanden.
admin.users.note.write ist fuer Create-Write Pflicht.
Target-User muss existieren.
Lock ist Pflicht.
Audit Attempt + Success sind Pflicht.
Readback ist Pflicht.
Update bleibt deaktiviert.
Deactivate bleibt deaktiviert.
UI-Schreibbuttons bleiben deaktiviert.
Physisches Delete bleibt verboten.
Community-Seiten lesen keine Admin-Notizen.
Raw note_text wird nicht im Audit gespeichert.
```

## Session-/Permission-Test

Zuerst wurde mit einem ungueltigen Zieluser getestet:

```text
targetUserUid: tw:does_not_exist
reason: target_user_not_found
writeExecuted: false
```

Dabei war bestaetigt:

```text
Session gueltig: ja
Actor: ForrestCGN / tw:127709954
Rolle: owner
remote.view: explicit_allow
admin.users.note.read: explicit_allow
admin.users.note.write: explicit_allow
```

## Permission-Ergaenzung auf Live-DB

Vor dem echten Write wurde ein Backup der Rechte-Tabellen erstellt:

```text
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap39_before_admin_note_write_permission_YYYYMMDD_HHMMSS.sql
```

Danach wurden die Permission-Katalogeintraege und das Owner-Schreibrecht idempotent ergaenzt:

```text
dashboard_permissions:
- remote.view
- admin.users.note.read
- admin.users.note.write

dashboard_role_permissions:
- owner -> admin.users.note.write -> allow
```

Kontrollierter Stand danach:

```text
remote.view            | Remote-Modboard sehen           | remote | low
admin.users.note.read  | Admin-Benutzernotizen lesen     | admin  | high
admin.users.note.write | Admin-Benutzernotizen schreiben | admin  | critical

owner -> remote.view            -> allow
owner -> admin.users.note.read  -> allow
owner -> admin.users.note.write -> allow
```

## Echter Admin-Note-Create-Write

Befehl wurde gegen den lokalen Service auf dem Webserver ausgefuehrt:

```text
POST http://127.0.0.1:3010/api/remote/admin/users/admin-notes/create
Cookie: scc_remote_session aus gueltiger DB-Session
Body:
{
  "confirmWrite": true,
  "targetUserUid": "tw:127709954",
  "noteText": "RDAP39 Testnotiz: erster kontrollierter Backend-Create-Write fuer ForrestCGN."
}
```

Ergebnis:

```text
ok: true
reason: admin_note_create_executed
writeExecuted: true
databaseWriteExecuted: true
adminNoteWriteExecuted: true
adminNoteCreateExecuted: true
adminNoteUpdateExecuted: false
adminNoteDeactivateExecuted: false
physicalDeleteExecuted: false
readBackPerformed: true
readBackFound: true
warning: null
```

## Erstellte Admin-Notiz

```text
id: 2
note_uid: admin_note_20260625104920_5fec9726d7a3
target_user_uid: tw:127709954
status: active
created_by_user_uid: tw:127709954
updated_by_user_uid: tw:127709954
created_at: 2026-06-25 12:49:20
updated_at: 2026-06-25 12:49:20
note_preview: RDAP39 Testnotiz: erster kontrollierter Backend-Create-Write fuer ForrestCGN.
```

## Audit-Readback

```text
id: 3
audit_uid: rdap39_admin_note_attempt_20260625104920_d3bf635c6d4e
source: remote-modboard/admin-notes
action: admin.user_note.create
resource_type: admin_user_note
resource_key: admin_user_note:tw:127709954:create
status: attempt
actor_user_uid: tw:127709954

id: 4
audit_uid: rdap39_admin_note_success_20260625104920_9047246cdad5
source: remote-modboard/admin-notes
action: admin.user_note.create
resource_type: admin_user_note
resource_key: admin_user_note:admin_note_20260625104920_5fec9726d7a3:create
status: success
actor_user_uid: tw:127709954
```

## Lock-Readback

`dashboard_locks` hat keine Spalte `released_at`. Der Release-Zustand wird ueber `status='released'` und `updated_at` sichtbar.

```text
id: 2
lock_uid: rdap39_admin_note_lock_20260625104920_b185f1071a74
resource_key: admin_user_note:tw:127709954:create
owner_user_uid: tw:127709954
status: released
heartbeat_at: 2026-06-25 12:49:20
expires_at: 2026-06-25 12:54:20
created_at: 2026-06-25 12:49:20
updated_at: 2026-06-25 12:49:20
version_token: rdap39-rdap39_admin_note_lock_20260625104920_b185f1071a74
```

## Bestaetigte Nicht-Aenderungen

```text
Keine UI-Schreibbuttons aktiviert.
Keine Admin-Note-Update-Route aktiviert.
Keine Admin-Note-Deactivate-Route aktiviert.
Kein physisches Delete.
Keine Community-Seiten-Anbindung fuer Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Control-Aenderung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine Secrets im Frontend.
Keine Secrets im Audit.
```

## Naechster sinnvoller technischer Step

```text
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
```

Empfehlung: Im Dashboard nur einen kontrollierten Create-Dialog vorbereiten, aber weiterhin ohne breite Freischaltung. Der Backend-Write ist bestaetigt; naechster Schritt sollte deshalb UI-seitig sehr klein bleiben:

```text
- Admin-User-Detailseite: Button/Panel fuer neue interne Admin-Notiz vorbereiten.
- Button nur sichtbar, wenn admin.users.note.write erlaubt ist.
- confirmWrite weiter serverseitig Pflicht.
- Nach Create: Readback/Refresh der Admin-Notizen.
- Kein Update.
- Kein Deactivate.
- Kein Delete.
```

## Install-/Step-Hinweis

Dieser RDAP39B-Stand ist Doku-only. Lokal reicht:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP39B_ADMIN_NOTE_WRITE_BACKEND_LIVE_CONFIRMED_DOCS.zip" "RDAP39B Admin-Note Write live bestaetigt dokumentiert"
git status
.\stepdone.cmd "RDAP39B Admin-Note Write live bestaetigt dokumentiert; Doku/Projektstatus/TODO/NEXT_STEPS/CHANGELOG aktualisiert"
```

Kein Webserver-Deploy fuer Doku-only noetig.
