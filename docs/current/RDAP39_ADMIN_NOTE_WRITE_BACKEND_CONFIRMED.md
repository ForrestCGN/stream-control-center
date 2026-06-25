# RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Backend-Write-Step, kontrolliert und eingeschraenkt

---

## 1. Zweck

RDAP39 bereitet den ersten echten kontrollierten Backend-Write fuer Admin-Notizen vor.

Scope ist absichtlich eng:

```text
Nur Create wird produktiv vorbereitet:
POST /api/remote/admin/users/admin-notes/create
```

Weiterhin nicht produktiv:

```text
POST /api/remote/admin/users/admin-notes/update
POST /api/remote/admin/users/admin-notes/deactivate
```

---

## 2. Sicherheitsgrenzen

RDAP39 aktiviert keine UI-Schreibbuttons und keine Community-Seiten-Anbindung.

```text
Keine UI-Schreibbuttons.
Kein physisches Delete.
Keine Permission-Vergabe.
Keine Community-Seiten-Anbindung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Update/Deactivate bleiben blockiert.
Force-Takeover bleibt blockiert.
```

---

## 3. Neue/angepasste Backend-Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
```

---

## 4. Produktive Route in RDAP39

```text
POST /api/remote/admin/users/admin-notes/create
```

Pflicht-Input im JSON-Body:

```json
{
  "targetUserUid": "<user_uid>",
  "noteText": "<Text>",
  "confirmWrite": true
}
```

Akzeptiert wird `confirmWrite` oder `confirm_write`, aber nur aus dem JSON-Body. Query-Confirm wird fuer RDAP39 nicht genutzt.

---

## 5. RDAP39 Write-Pipeline

```text
validate_session
check_dashboard_access
check_remote_view_permission
check_admin_users_note_write_permission
require_body_confirm_write
validate_input
read_target_user
check_admin_note_table_schema
acquire_lock
write_audit_attempt
execute_admin_note_write
read_back_admin_note
write_audit_success_or_failure
release_lock
return_sanitized_response
```

---

## 6. Permissions

RDAP39 prueft:

```text
remote.view
admin.users.note.read
admin.users.note.write
```

Der eigentliche Write setzt `admin.users.note.write` voraus.

RDAP39 vergibt keine Permission automatisch.

---

## 7. Audit

RDAP39 schreibt Audit-Eintraege in:

```text
dashboard_audit_log
```

Geplante Aktionen:

```text
admin.user_note.create
```

Status-Werte:

```text
attempt
success
failed
```

Wichtig:

```text
Raw note_text wird nicht im Audit gespeichert.
Audit enthaelt nur noteTextLength, targetUserUid, noteUid, lockUid und sichere Metadaten.
Secrets werden nicht geloggt.
```

---

## 8. Lock

RDAP39 nutzt:

```text
dashboard_locks
```

Lock-Daten:

```text
resource_key = admin_user_note:<target_user_uid>:create
owner_user_uid = <actor_user_uid>
status = active -> released
```

RDAP39 fuehrt kein Force-Takeover und kein physisches Delete aus.

---

## 9. Admin-Notiz-Write

RDAP39 schreibt in:

```text
dashboard_user_admin_notes
```

Create-Felder:

```text
note_uid
target_user_uid
note_text
status = active
created_by_user_uid
updated_by_user_uid
created_at
updated_at
```

Nach dem Insert wird die Notiz per `note_uid` und `target_user_uid` gelesen und als sanitized Response ausgegeben.

---

## 10. Backup-Pflicht vor Live-Test

Vor dem ersten produktiven Live-Test muss ein Backup erstellt und auf Nicht-0-Byte geprueft werden:

```bash
mkdir -p /opt/stream-control-center/_runtime_tmp/rdap_db_backups

BACKUP="/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap39_before_admin_note_write_$(date +%Y%m%d_%H%M%S).sql"

mysqldump --defaults-extra-file=/root/rdap29_mysql_client.cnf c3stream_control dashboard_user_admin_notes > "$BACKUP"

ls -lh "$BACKUP"
test -s "$BACKUP" && echo "backup_ok_not_empty"
```

---

## 11. Erwartete Statuswerte

Nach Deploy:

```text
moduleBuild: RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED
statusApiVersion: rdap_admin_note_write39.v1
adminNoteWriteConfirmed.prepared: true
adminNoteCreateEnabled: true
adminNoteUpdateEnabled: false
adminNoteDeactivateEnabled: false
uiWriteButtonsEnabled: false
physicalDeleteEnabled: false
```

---

## 12. Tests

Status:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.moduleBuild, .statusApiVersion, .adminNoteWriteConfirmed'

curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminNoteWriteConfirmed'
```

Ohne Session/Permission ist ein echter Write erwartbar blockiert:

```text
401 not_logged_in_or_session_invalid
oder
403 admin_note_write_permission_denied
```

Fuer den echten Live-Write braucht es eine gueltige eingeloggte Session und einen existierenden `targetUserUid`.

---

## 13. Naechster Schritt

Nach Live-Test und Readback:

```text
RDAP39B_ADMIN_NOTE_WRITE_BACKEND_LIVE_CONFIRMED_DOCS
```
