# NEXT STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN  
Datum: 2026-06-24

## Aktueller Step

```text
RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
```

Scope:

```text
Audit-Helper vorbereitet
Audit-Writes bleiben deaktiviert
keine DB-Migration
keine echten Admin-Writes
keine User-/Rollen-/Gruppen-/Session-Writes
keine UI-Schreibbuttons
```

## Nach lokalem installstep

```powershell
cd D:\Git\stream-control-center
npm --prefix .\remote-modboard\backend run check
git status --short
```

Wenn sauber:

```powershell
.\stepdone.cmd "RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN abgeschlossen: Audit-Helper vorbereitet; Audit-/Admin-Writes bleiben deaktiviert"
```

## Nach stepdone: Webserver-Deploy

Immer frischer Clone:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
cd RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
sudo bash tools/remote-modboard-deploy.sh RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN dev
```

Restart + Readiness:

```bash
sudo systemctl restart scc-remote-modboard.service
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

Tests:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.moduleBuild,.statusApiVersion,.adminUsersWriteFoundation.auditHelperPrepared,.adminUsersWriteFoundation.auditWriteEnabled,.adminUsersWriteFoundation.writesStillBlocked'

curl -fsS http://127.0.0.1:3010/api/remote/admin/users/write-foundation-diagnostic | jq '.moduleBuild,.statusApiVersion,.auditHelperPrepared,.auditWriteEnabled,.auditDiagnostic.helperPrepared,.auditDiagnostic.writeEnabled,.writeEnabled,.writesStillBlocked'
```

## Danach empfohlen

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
```

Scope:

- Locking-Helper vorbereiten.
- Noch keine echten Locks erwerben/freigeben.
- Keine produktiven Admin-Writes.
- Keine DB-Migration ohne Backup/Rollback/Go.

## Erst später

Kleinster echter Admin-Write darf erst separat geplant werden, wenn folgende Punkte sauber stehen:

```text
Permission-Prüfung
Confirm-Write
Audit
Locking
Backup/Rollback
klare Owner/Admin-Grenzen
separates Go
```

## Geparkt

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```
