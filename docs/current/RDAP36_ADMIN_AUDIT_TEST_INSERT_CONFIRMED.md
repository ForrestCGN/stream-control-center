# RDAP36_ADMIN_AUDIT_TEST_INSERT_CONFIRMED

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Backend-Step mit kontrolliertem Audit-Testinsert

---

## 1. Zweck

RDAP36 baut eine streng begrenzte Route fuer einen kontrollierten Audit-Testinsert in `dashboard_audit_log`.

Dieser Step aktiviert keine produktiven Admin-Aktionen.

---

## 2. Neue Routen

```text
GET  /api/remote/admin/audit/test-insert/status
POST /api/remote/admin/audit/test-insert
```

---

## 3. Sicherheitsgrenzen

Der POST-Testinsert ist begrenzt durch:

```text
localOnly: true
confirmWriteRequired: true
bodyConfirmOnly: true
testOnlyRequired: true
```

Das bedeutet:

```text
nur lokale Requests von 127.0.0.1/::1
confirmWrite muss im JSON-Body stehen
testOnly=true muss im JSON-Body stehen
keine Query-Confirm-Nutzung
```

Weiterhin nicht aktiv:

```text
keine Admin-Notiz-Writes
keine Lock-Writes
keine UI-Schreibbuttons
keine Permission admin.users.note.write
keine User-/Rollen-/Session-Writes
keine Agent-/OBS-/Sound-/Overlay-Steuerung
```

---

## 4. Geschriebener Testeintrag

Der Testeintrag ist eindeutig markiert:

```text
source: remote-modboard/rdap36
action: admin.audit.test_insert
resource_type: admin_audit_test
permission_key: admin.audit.test
resource_key: audit:test:<audit_uid>
status: success
new_value_summary: RDAP36 kontrollierter Audit-Testinsert; keine produktive Admin-Aktion.
```

`safe_metadata_json` enthaelt nur sichere Test-Metadaten:

```text
step
testOnly
purpose
productiveAction: false
adminNoteWrite: false
lockWrite: false
generatedAt
```

Keine Secrets werden gespeichert.

---

## 5. Geaenderte Dateien

```text
remote-modboard/backend/src/services/admin-audit-test-insert.service.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

---

## 6. Lokale Checks

```powershell
node --check .\remote-modboard\backend\src\services\admin-audit-test-insert.service.js
node --check .\remote-modboard\backend\src\routes\lock-audit-diagnostic.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\app.js
```

---

## 7. Tests nach Webserver-Deploy

Backup vor Testinsert:

```bash
sudo mysqldump --defaults-extra-file=/root/rdap29_mysql_client.cnf c3stream_control dashboard_audit_log > /opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap36_before_audit_test_insert_$(date +%Y%m%d_%H%M%S).sql
sudo ls -lah /opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap36_before_audit_test_insert_*.sql
```

Routenliste:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminAuditTestInsert'
```

Statusroute:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/admin/audit/test-insert/status | jq
```

Ohne Confirm muss blocken:

```bash
curl -i -sS -X POST "http://127.0.0.1:3010/api/remote/admin/audit/test-insert" -H "Content-Type: application/json" -d '{"testOnly":true}'
```

Mit Confirm und TestOnly:

```bash
curl -fsS -X POST "http://127.0.0.1:3010/api/remote/admin/audit/test-insert" -H "Content-Type: application/json" -d '{"confirmWrite":true,"testOnly":true}' | jq
```

Readback/Route:

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/admin/audit-lock/schema-status?limit=5" | jq '.audit.rowCount, .audit.latest[0], .writeEnabled, .productiveWritesEnabled, .writesStillBlocked'
```

Erwartung nach genau einem Testinsert:

```text
audit.rowCount >= 1
latest[0].action = admin.audit.test_insert
writeEnabled false
productiveWritesEnabled false
writesStillBlocked true
```

---

## 8. Naechster sinnvoller Step

Nach Live-Bestaetigung:

```text
RDAP36B_ADMIN_AUDIT_TEST_INSERT_LIVE_CONFIRMED_DOCS
```

Danach:

```text
RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED
```
