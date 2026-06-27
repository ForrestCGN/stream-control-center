# RDAP33B_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY_LIVE_CONFIRMED_DOCS

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Doku-/Status-Step, **keine Backend-/UI-/DB-Aenderung**

---

## 1. Zweck

RDAP33B dokumentiert den Live-Deploy und die Live-Pruefung von RDAP33.

RDAP33 hat eine read-only Audit-/Lock-Schema-/Runtime-Statusroute gebaut.

---

## 2. Live-Deploy

RDAP33 wurde nach lokalem `stepdone` per Webserver-Deploy aus frischem GitHub/dev-Clone ausgerollt.

Deploy-Stil fuer kuenftige Server-Deploys:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Wichtig:

```text
Keine langen absoluten Clone-Zielpfade verwenden.
Der kurze relative _deploy_tmp-Stil ist fuer Forrests Web-Konsole robuster.
Das Deploy-Script startet den Service selbst neu; kein zusaetzlicher manueller systemctl restart direkt danach.
```

---

## 3. Bestaetigte RDAP33-Routen

Routenliste-Test:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminAuditLockSchemaStatusReadonly'
```

Ergebnis:

```text
statusApiVersion: rdap_audit_lock33.v1
adminAuditLockSchemaStatusReadonly.prepared: true
route: /api/remote/admin/audit-lock/schema-status
aliasRoute: /api/remote/lock-audit/schema-status
tables:
- dashboard_audit_log
- dashboard_locks
readOnly: true
writeEnabled: false
databaseWriteEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
migrationEnabled: false
returnsRowCounts: true
returnsSafePreviewRows: true
secretsLogged: false
auditInsertEnabled: false
lockAcquireEnabled: false
lockHeartbeatEnabled: false
lockReleaseEnabled: false
lockForceTakeoverEnabled: false
uiWriteButtonsEnabled: false
routeRemainsReadOnly: true
```

Bewertung:

```text
RDAP33 ist live registriert.
Route bleibt read-only.
Keine Write-Funktionen sind aktiv.
```

---

## 4. Live-Test der Schema-/Statusroute

Test:

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/admin/audit-lock/schema-status?limit=5" | jq
```

Kernbefund:

```text
ok: true
module: remote_admin_audit_lock_schema_status_readonly
routeBuild: RDAP33_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY
statusApiVersion: rdap_audit_lock33.v1
readOnly: true
routeRemainsReadOnly: true
writeEnabled: false
databaseWriteEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
migrationEnabled: false
createsTables: false
insertsAudit: false
insertsLocks: false
updatesLocks: false
deletesLocks: false
uiWriteButtonsEnabled: false
physicalDeleteEnabled: false
```

Datenbank:

```text
engine: MariaDB 11.8.6
driver: mysql2/promise
driverAvailable: true
configured: true
writeEnabled: true
migrationEnabled: false
error: null
```

Wichtig:

```text
DB kann technisch Write-Connections, aber RDAP33 route-seitig und safety-seitig nicht.
RDAP33 fuehrt nur SELECT/INFORMATION_SCHEMA-Abfragen aus.
```

---

## 5. Audit-Tabellenbefund

Tabelle:

```text
dashboard_audit_log
```

Live-Befund:

```text
tableExists: true
schemaReady: false
rowCount: 0
compatibleForRead: false
compatibleForWriteCandidate: false
auditInsertEnabled: false
```

Erkannte Spalten:

```text
id
audit_uid
created_at
actor_user_uid
actor_display_name
source
action
permission_key
resource_key
status
old_value_summary
new_value_summary
request_id
correlation_id
```

Fehlende erwartete Spalten:

```text
actor_login
resource_type
error_code
safe_metadata_json
completed_at
```

Wichtiger Write-Blocker:

```text
missingWriteCandidateColumns:
- resource_type
```

Bewertung:

```text
Audit-Tabelle existiert, ist aber fuer das geplante generische Audit-Write-Zielbild nicht direkt kompatibel.
Keine Audit-Testwrites bauen, bevor Mapping oder sanfte Migration geklaert ist.
```

---

## 6. Lock-Tabellenbefund

Tabelle:

```text
dashboard_locks
```

Live-Befund:

```text
tableExists: true
schemaReady: false
rowCount: 0
activeCount: 0
expiredCount: 0
compatibleForRead: true
compatibleForWriteCandidate: true
lockAcquireEnabled: false
lockHeartbeatEnabled: false
lockReleaseEnabled: false
lockForceTakeoverEnabled: false
```

Erkannte Spalten:

```text
id
lock_uid
resource_key
owner_user_uid
status
heartbeat_at
expires_at
created_at
updated_at
version_token
```

Fehlende erwartete Spalten laut RDAP33-Zielbild:

```text
lock_id
resource_type
resource_version
edit_session_id
user_uid
client_id
released_at
```

Bewertung:

```text
Lock-Tabelle existiert und wirkt fuer einen ersten kontrollierten Lock-Write-Kandidaten ausreichend.
Trotzdem bleiben Lock-Writes weiterhin deaktiviert.
```

---

## 7. Recommended Next Step

Test:

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/admin/audit-lock/schema-status?limit=1" | jq '.recommendedNextStep'
```

Ergebnis:

```text
nextStep: RDAP34_ADMIN_AUDIT_LOCK_SCHEMA_DECISION_OR_MIGRATION_PLAN
writesMayBeBuiltNow: false
blockers:
- audit_write_candidate_columns_missing
note: Erst Schema/Migration/Mapping klaeren, keine Writes bauen.
```

Bewertung:

```text
RDAP34 darf kein Audit-Testwrite-Step sein.
RDAP34 muss zuerst Schema-Decision/Migration/Mapping klaeren.
```

---

## 8. Entscheidung fuer RDAP34

Naechster Step:

```text
RDAP34_ADMIN_AUDIT_LOCK_SCHEMA_DECISION_OR_MIGRATION_PLAN
```

Ziel:

```text
Entscheiden, wie dashboard_audit_log fuer Admin-Notiz-/Lock-/Admin-Aktionen genutzt wird.
Keine Writes.
Keine DB-Migration ohne separaten bestaetigten Migrationsstep.
```

Klaerung:

```text
Option A: vorhandenes Schema mappen
- resource_type wird nicht als eigene Spalte genutzt
- action/permission_key/resource_key/source tragen die notwendige Semantik
- old_value_summary/new_value_summary speichern kurze sichere Zusammenfassungen

Option B: sanfte Migration
- dashboard_audit_log um resource_type und ggf. error_code/completed_at/safe_metadata_json erweitern
- nur mit Backup und separatem Migrationsstep

Option C: neue Parallelstruktur
- aktuell nicht empfohlen
- wuerde gegen vorhandene Tabellen-/Helper-Nutzung arbeiten
```

Empfehlung:

```text
RDAP34 soll Option A vs. Option B sauber entscheiden.
Erst danach RDAP35/RDAP36 echte Audit-/Lock-Writes.
```

---

## 9. Nicht aktiv nach RDAP33B

```text
Admin-Notiz produktiv schreiben
Admin-Notiz produktiv aendern
Admin-Notiz produktiv deaktivieren
admin.users.note.write Permission vergeben
UI-Schreibbuttons
Audit-Inserts
Lock acquire/heartbeat/release/force-takeover
DB-Migration
physisches Delete
Community-Seiten-Anbindung
User-/Rollen-/Session-Writes
Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```

---

## 10. Ergebnis

RDAP33 ist live bestaetigt.

```text
RDAP33 Route funktioniert.
Audit-/Lock-Schema ist sichtbar.
RowCounts und Status werden read-only angezeigt.
Keine Writes wurden aktiviert.
Naechster Step ist RDAP34 Schema-Decision/Migration-Plan.
```
