# RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Backend-Test-Step fuer kontrollierten Lock-Write  
Status: vorbereitet, noch lokal einzuspielen und live zu testen

---

## 1. Zweck

RDAP37 baut einen kontrollierten Lock-Test fuer `dashboard_locks`.

Der Test prueft den spaeter benoetigten Lock-Lifecycle:

```text
Acquire -> Heartbeat -> Release -> Readback
```

RDAP37 ist bewusst kein produktiver Admin-Write.

---

## 2. Neue Route

Statusroute:

```text
GET /api/remote/admin/locks/test/status
```

Test-Route:

```text
POST /api/remote/admin/locks/test-cycle
```

Pflicht-Body:

```json
{
  "confirmWrite": true,
  "testOnly": true
}
```

Query-Confirm wird bewusst nicht akzeptiert.

---

## 3. Sicherheitsgrenzen

```text
local-only
confirmWrite nur im JSON-Body
testOnly=true Pflicht
keine Admin-Notiz-Writes
keine produktiven Audit-Writes
keine UI-Schreibbuttons
keine User-/Rollen-/Session-Writes
keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
kein physisches Delete
```

Der Lock wird eindeutig als RDAP37-Test-Lock markiert.

---

## 4. Ablauf

Die Test-Route macht kontrolliert:

```text
1. Schema von dashboard_locks lesen.
2. Kompatibilitaet fuer Testwrite pruefen.
3. Test-Lock einfuegen.
4. Readback nach Acquire.
5. Heartbeat/Expires aktualisieren.
6. Readback nach Heartbeat.
7. Status auf released setzen und released_at schreiben.
8. Readback nach Release.
```

Es wird nichts geloescht.

---

## 5. Backup-Pflicht vor Live-Test

Vor dem Webserver-Test muss `dashboard_locks` gesichert werden:

```bash
mkdir -p /opt/stream-control-center/_runtime_tmp/rdap_db_backups

BACKUP="/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap37_before_lock_test_$(date +%Y%m%d_%H%M%S).sql"

mysqldump --defaults-extra-file=/root/rdap29_mysql_client.cnf c3stream_control dashboard_locks > "$BACKUP"

ls -lh "$BACKUP"
test -s "$BACKUP" && echo "backup_ok_not_empty"
```

---

## 6. Geaenderte Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/admin-lock-test.service.js
docs/current/RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

---

## 7. Erwartete Testwerte

Nach Deploy:

```text
/api/remote/status
moduleBuild: RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED
statusApiVersion: rdap_lock37.v1

/api/remote/routes
statusApiVersion: rdap_lock37.v1
adminLockTest.prepared: true
adminLockTest.lockTestCycleEnabled: true
```

Nach erfolgreichem Testcycle:

```text
ok: true
reason: lock_test_cycle_executed
readBackFoundAfterAcquire: true
readBackFoundAfterHeartbeat: true
readBackFoundAfterRelease: true
operations.acquired: true
operations.heartbeat: true
operations.released: true
adminNoteWriteExecuted: false
auditProductiveWriteExecuted: false
physicalDeleteExecuted: false
```

---

## 8. Naechster Schritt nach erfolgreichem Test

```text
RDAP37B_ADMIN_LOCK_TEST_LIVE_CONFIRMED_DOCS
```

Danach erst:

```text
RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN
```
