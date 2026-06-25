# RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Backend-Planroute + Doku, keine produktiven Writes

---

## 1. Zweck

RDAP38 plant den ersten echten Admin-Notiz-Write mit Audit- und Lock-Fundament.

Wichtig:

```text
RDAP38 schreibt keine Admin-Notizen.
RDAP38 aktiviert keine UI-Schreibbuttons.
RDAP38 vergibt keine Permissions.
RDAP38 fuehrt kein physisches Delete aus.
```

RDAP38 bereitet nur den sicheren RDAP39-Write vor.

---

## 2. Grundlage

Bestaetigte Vorarbeiten:

```text
RDAP35B: dashboard_audit_log Schema-Migration live bestaetigt.
RDAP36: kontrollierter Audit-Testinsert live erfolgreich.
RDAP37: kontrollierter Lock-Test live erfolgreich.
RDAP37B: Lock-Test live dokumentiert.
```

Finale Live-Werte aus RDAP37B:

```text
audit.rowCount: 2
audit.actionSummary admin.audit.test_insert = 2

locks.rowCount: 1
locks.activeCount: 0
locks.expiredCount: 0
locks.statusSummary released = 1
latest lock_uid: rdap37_lock_test_20260625100908_42dbbd555e49
latest status: released
```

---

## 3. Neue Route

```text
GET /api/remote/admin/users/admin-notes/write-plan
```

Eigenschaften:

```text
readOnly: true
writeEnabled: false
databaseWriteEnabled: false
productiveWritesEnabled: false
adminNoteWritesEnabled: false
uiWriteButtonsEnabled: false
physicalDeleteEnabled: false
```

Diese Route gibt den geplanten RDAP39-Schreibablauf fuer Admin-Notizen zurueck.

---

## 4. Geplanter RDAP39-Pfad fuer Create

```text
1. Session pruefen.
2. Dashboard-Zugriff pruefen.
3. remote.view pruefen.
4. admin.users.note.write pruefen.
5. confirmWrite aus JSON-Body pruefen.
6. Input pruefen:
   - targetUserUid
   - noteText
7. Zieluser aus dashboard_users lesen.
8. dashboard_user_admin_notes Schema pruefen.
9. Lock acquire:
   resource_key = admin_user_note:<targetUserUid>:create
10. Audit attempt schreiben.
11. Notiz schreiben.
12. Readback der Notiz.
13. Audit success oder failure schreiben.
14. Lock release.
15. Sanitized Response zurueckgeben.
```

---

## 5. Geplanter RDAP39-Pfad fuer Update

```text
Pflichtinput:
- targetUserUid
- noteUid
- noteText
- confirmWrite

resource_key = admin_user_note:<noteUid>:update
auditAction = admin.user_note.update
```

Vor dem Update muss die bestehende Notiz gelesen werden. Audit darf keine rohen Secrets und keine unnoetig langen Inhalte speichern.

---

## 6. Geplanter RDAP39-Pfad fuer Deactivate

```text
Pflichtinput:
- targetUserUid
- noteUid
- confirmWrite

resource_key = admin_user_note:<noteUid>:deactivate
auditAction = admin.user_note.deactivate
```

Deactivate darf spaeter nur den Status aendern. Kein physisches Delete.

---

## 7. Permissions

```text
remote.view
admin.users.note.read
admin.users.note.write
```

Der produktive Write braucht zwingend:

```text
admin.users.note.write
```

Permission-Ziel:

```text
targetType: global
targetKey: *
```

---

## 8. ConfirmWrite

```text
confirmWriteRequired: true
bodyConfirmOnly: true
queryConfirmAccepted: false
```

Akzeptierte JSON-Body Keys:

```text
confirmWrite
confirm_write
```

---

## 9. Audit-Plan

Geplante Audit-Felder:

```text
source: remote-modboard/admin-notes
resource_type: admin_user_note
permission_key: admin.users.note.write
status: attempt | success | failed | denied | blocked
safe_metadata_json: nur sichere Metadaten
```

Audit darf enthalten:

```text
targetUserUid
noteUid
noteTextLength
lockUid
requestId/correlationId falls vorhanden
```

Audit darf nicht enthalten:

```text
Secrets
Tokens
Cookies
Sessionwerte
Passwoerter
unnoetig lange Rohdaten
```

---

## 10. Lock-Plan

```text
acquireRequired: true
heartbeatRequiredForLongWrites: true
releaseRequired: true
forceTakeoverEnabled: false
physicalDeleteEnabled: false
```

Resource Keys:

```text
create:     admin_user_note:<target_user_uid>:create
update:     admin_user_note:<note_uid>:update
deactivate: admin_user_note:<note_uid>:deactivate
```

---

## 11. Fehlerpfad

```text
Permission fehlt:
- kein Lock
- kein Admin-Notiz-Write
- optional denied Audit nur, wenn Auditpfad sicher verfuegbar ist

Confirm fehlt:
- kein Lock
- kein Admin-Notiz-Write

Lock acquire failed:
- kein Admin-Notiz-Write
- Audit blocked/failed, falls Auditpfad verfuegbar

Audit attempt failed vor Write:
- kein Admin-Notiz-Write
- Lock release versuchen

Admin-Notiz-Write failed nach Lock:
- Audit failure schreiben
- Lock release versuchen

Audit success failed nach erfolgreichem Admin-Write:
- kein automatisches Delete
- Response markiert auditFollowupFailed
- Lock release trotzdem versuchen

Lock release failed nach erfolgreichem Admin-Write:
- kein automatisches Delete
- Response markiert lockReleaseFailed
- Diagnose/Followup erforderlich
```

---

## 12. Backup-/Rollback-Pflicht

Vor RDAP39 muss ein Backup erstellt werden:

```bash
mkdir -p /opt/stream-control-center/_runtime_tmp/rdap_db_backups

BACKUP="/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap39_before_admin_note_write_$(date +%Y%m%d_%H%M%S).sql"

mysqldump --defaults-extra-file=/root/rdap29_mysql_client.cnf c3stream_control dashboard_user_admin_notes > "$BACKUP"

ls -lh "$BACKUP"
test -s "$BACKUP" && echo "backup_ok_not_empty"
```

Rollback ist manuell zu planen. Kein automatisches physisches Delete.

---

## 13. Geaenderte Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-write-plan.service.js
docs/current/RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

---

## 14. Nicht Teil von RDAP38

```text
Keine Admin-Notiz produktiv schreiben.
Keine Admin-Notiz produktiv aendern.
Keine Admin-Notiz produktiv deaktivieren.
Keine UI-Schreibbuttons.
Keine Permission-Vergabe.
Kein physisches Delete.
Keine Community-Seiten-Anbindung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

---

## 15. Naechster sinnvoller Step

```text
RDAP38B_ADMIN_NOTE_WRITE_PLAN_LIVE_CONFIRMED_DOCS
```

Danach, nur wenn RDAP38 live sauber bestaetigt wurde:

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED
```
