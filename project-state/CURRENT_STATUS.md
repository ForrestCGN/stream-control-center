# CURRENT_STATUS

Stand: RDAP37B_ADMIN_LOCK_TEST_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard

## Bestaetigter Stand

```text
RDAP35B Audit-Schema-Migration live bestaetigt.
RDAP36 Audit-Testinsert-Route live deployt.
RDAP36 kontrollierter Audit-Testinsert erfolgreich.
RDAP36B Live-Ergebnis dokumentiert.
RDAP37 Lock-Test live deployt.
RDAP37 kontrollierter Lock-Test erfolgreich.
RDAP37B Live-Ergebnis dokumentiert.
Server-Cleanup abgeschlossen.
```

## Webserver Cleanup Stand

```text
/opt/stream-control-center vorher: ca. 7,0G
/opt/stream-control-center jetzt: 479M

_deploy_tmp: letzte 6 Deploy-Clones behalten
_runtime_tmp: letzte 5 remote-modboard Backups behalten
DB-/SQL-Backups behalten
```

## RDAP36 Live-Befund

```text
/api/remote/routes meldet statusApiVersion rdap_audit36.v1.
POST /api/remote/admin/audit/test-insert funktioniert local-only mit Body-confirmWrite und testOnly=true.
dashboard_audit_log enthaelt inzwischen 2 kontrollierte RDAP36-Testeintraege.
Letzter bekannter Test:
insertedAuditUid: rdap36_audit_test_20260625100036_cb116ad144c3
action: admin.audit.test_insert
source: remote-modboard/rdap36
status: success
```

## RDAP37 Live-Befund

```text
/api/remote/status meldet:
moduleBuild: RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED
statusApiVersion: rdap_lock37.v1
adminLockTest.prepared: true

/api/remote/routes meldet:
statusApiVersion: rdap_lock37.v1
adminLockTest.prepared: true
```

## RDAP37 Lock-Test

```text
Ohne confirmWrite:
ok: false
reason: confirm_write_required
writeExecuted: false

Mit confirmWrite=true und testOnly=true:
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
lock_uid: rdap37_lock_test_20260625100908_42dbbd555e49
resource_key: rdap37:test:rdap37_lock_test_20260625100908_42dbbd555e49
owner_user_uid: system:rdap37-local-test
status: released
```

Readback:

```text
locks.rowCount: 1
locks.activeCount: 0
locks.expiredCount: 0
locks.statusSummary: released = 1
```

## Status

```text
Produktive Writes bleiben blockiert.
Keine Admin-Notiz-Writes aktiv.
Keine UI-Schreibbuttons aktiv.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung aktiv.
```

## Weiterhin blockiert

```text
Admin-Notiz produktiv schreiben/aendern/deaktivieren
admin.users.note.write Permission
UI-Schreibbuttons
Lock force-takeover
physisches Delete
Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```
