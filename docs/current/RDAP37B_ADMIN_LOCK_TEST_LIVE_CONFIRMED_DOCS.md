# RDAP37B_ADMIN_LOCK_TEST_LIVE_CONFIRMED_DOCS

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Live-Bestaetigung / Doku-Only

---

## 1. Zweck

RDAP37B dokumentiert den erfolgreichen Live-Test von RDAP37:

```text
RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED
```

Ziel war der kontrollierte Test von `dashboard_locks`:

```text
Acquire -> Readback -> Heartbeat -> Readback -> Release -> Readback
```

Ohne produktive Admin-Aktion, ohne Admin-Notiz-Writes, ohne UI-Schreibbuttons und ohne physisches Delete.

---

## 2. Vorheriger Server-Cleanup

Vor RDAP37 wurde der Webserver aufgeraeumt.

Bestaetigter Stand nach Cleanup:

```text
/opt/stream-control-center vorher: ca. 7,0G
/opt/stream-control-center danach: 479M

_deploy_tmp vorher: 6,6G / 96 Ordner
_deploy_tmp danach: 423M / 6 Ordner

_runtime_tmp vorher: 404M
_runtime_tmp danach: 47M
```

Behalten wurden:

```text
/opt/stream-control-center/remote-modboard
/opt/stream-control-center/_deploy_tmp mit den letzten 6 Deploy-Clones
/opt/stream-control-center/_runtime_tmp mit den letzten 5 remote-modboard Backups
/opt/stream-control-center/_runtime_tmp/db_backups
/opt/stream-control-center/_runtime_tmp/rdap_db_backups
/opt/stream-control-center/_runtime_tmp/rdap_auth3_avatar_columns.sql
```

---

## 3. RDAP37 Live-Deploy / Status

Nach lokalem Einspielen, Checks, `stepdone.cmd` und Webserver-Deploy aus frischem GitHub/dev-Clone meldete der Live-Service:

```text
GET /api/remote/status

moduleBuild: RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED
statusApiVersion: rdap_lock37.v1
adminLockTest.prepared: true
```

Routenuebersicht:

```text
GET /api/remote/routes

statusApiVersion: rdap_lock37.v1
adminLockTest.prepared: true
route: /api/remote/admin/locks/test-cycle
statusRoute: /api/remote/admin/locks/test/status
method: POST
localOnly: true
confirmWriteRequired: true
bodyConfirmOnly: true
testOnlyRequired: true
productiveWritesEnabled: false
writesStillBlockedForProductiveActions: true
uiWriteButtonsEnabled: false
physicalDeleteEnabled: false
```

---

## 4. Schutztest ohne confirmWrite

Befehl:

```bash
curl -sS -X POST "http://127.0.0.1:3010/api/remote/admin/locks/test-cycle" \
  -H "Content-Type: application/json" \
  -d '{"testOnly":true}' | jq
```

Ergebnis:

```text
ok: false
reason: confirm_write_required
error: confirm_write_required
confirmWriteAccepted: false
writeExecuted: false
readBackPerformed: false
```

Damit ist bestaetigt:

```text
Ohne confirmWrite im JSON-Body wird nichts geschrieben.
```

---

## 5. Kontrollierter Lock-Test

Befehl:

```bash
curl -fsS -X POST "http://127.0.0.1:3010/api/remote/admin/locks/test-cycle" \
  -H "Content-Type: application/json" \
  -d '{"confirmWrite":true,"testOnly":true}' | jq
```

Ergebnis:

```text
ok: true
reason: lock_test_cycle_executed
writeExecuted: true
databaseWriteExecuted: true
readBackPerformed: true
readBackFoundAfterAcquire: true
readBackFoundAfterHeartbeat: true
readBackFoundAfterRelease: true
```

Test-Lock:

```text
insertedLockUid: rdap37_lock_test_20260625100908_42dbbd555e49
resourceKey: rdap37:test:rdap37_lock_test_20260625100908_42dbbd555e49
```

Operationen:

```text
operations.acquired: true
operations.heartbeat: true
operations.released: true
```

Sicherheitsbestaetigung:

```text
adminNoteWriteExecuted: false
auditProductiveWriteExecuted: false
lockTestWriteExecuted: true
physicalDeleteExecuted: false
```

---

## 6. Lock-Readback nach Test

Readback-Route:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/admin/audit-lock/schema-status?db=1 | jq
```

Hinweis:

```text
Der korrekte Key ist `.locks`, nicht `.lock`.
```

Bestaetigter Lock-Befund:

```text
locks.rowCount: 1
locks.activeCount: 0
locks.expiredCount: 0
locks.statusSummary:
  released: 1
```

Latest Lock:

```text
id: 1
lock_uid: rdap37_lock_test_20260625100908_42dbbd555e49
resource_key: rdap37:test:rdap37_lock_test_20260625100908_42dbbd555e49
owner_user_uid: system:rdap37-local-test
status: released
heartbeat_at: 2026-06-25T10:09:23.000Z
created_at: 2026-06-25T10:09:08.000Z
updated_at: 2026-06-25T10:09:38.000Z
```

Damit ist bestaetigt:

```text
Kein aktiver RDAP37-Testlock ist offen geblieben.
Der Test-Lock wurde sauber released.
```

---

## 7. Audit-Readback nach RDAP37

Die Audit-Tabelle enthaelt weiterhin nur RDAP36-Testeintraege:

```text
audit.rowCount: 2
actionSummary:
  admin.audit.test_insert: 2
```

Letzte bekannte Audit-Testeintraege:

```text
id: 2
audit_uid: rdap36_audit_test_20260625100036_cb116ad144c3
action: admin.audit.test_insert
source: remote-modboard/rdap36
status: success

id: 1
audit_uid: rdap36_audit_test_20260625075600_b497452f9d54
action: admin.audit.test_insert
source: remote-modboard/rdap36
status: success
```

RDAP37 hat bewusst keinen produktiven Audit-Write ausgefuehrt.

---

## 8. Weiterhin nicht aktiv

```text
Admin-Notiz produktiv schreiben
Admin-Notiz produktiv aendern
Admin-Notiz produktiv deaktivieren
admin.users.note.write Permission vergeben
UI-Schreibbuttons
Lock force-takeover
physisches Delete
Community-Seiten-Anbindung
User-/Rollen-/Session-Writes ausser bestehendem Login/Session-System
Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```

---

## 9. Ergebnis

```text
RDAP37 live erfolgreich bestaetigt.
dashboard_locks kann kontrolliert per local-only Test-Cycle beschrieben und gelesen werden.
Acquire, Heartbeat und Release funktionieren.
Readback nach allen Schritten funktioniert.
Test-Lock endet released.
Produktive Writes bleiben blockiert.
```

---

## 10. Naechster sinnvoller Step

```text
RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN
```

Ziel von RDAP38:

```text
Plan fuer den ersten echten Admin-Notiz-Write mit:
- Permission-Pruefung
- confirmWrite
- Lock-Acquire/Heartbeat/Release
- Audit
- Backup/Rollback-Hinweis
- weiterhin keine UI-Schreibbuttons, bis Backend sicher bestaetigt ist
```
