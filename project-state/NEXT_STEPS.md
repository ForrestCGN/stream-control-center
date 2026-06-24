# NEXT STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP  
Datum: 2026-06-24

## Sofort: RDAP7B einspielen

```powershell
cd D:\Git\stream-control-center

.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP.zip" "RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP: Confirm-Write-Metadaten bereinigt, produktive Admin-Writes bleiben deaktiviert"

npm --prefix .\remote-modboard\backend run check

git status --short
```

Wenn sauber:

```powershell
.\stepdone.cmd "RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP abgeschlossen: Confirm-Write-Metadaten bereinigt; produktive Admin-Writes bleiben deaktiviert"
```

## Danach Webserver-Deploy

Erst nach `stepdone.cmd`:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP
cd RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP
sudo bash tools/remote-modboard-deploy.sh RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP dev
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

Server-Test:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.moduleBuild,.statusApiVersion,.auth.permissions.confirmWriteHelperPrepared,.adminUsersWriteFoundation.confirmWriteHelperPrepared'

curl -fsS http://127.0.0.1:3010/api/remote/admin/users/write-foundation-diagnostic | jq '.moduleBuild,.statusApiVersion,.readOnly,.writeEnabled,.writesStillBlocked,.confirmWriteRequired,.confirmWriteHelperPrepared,.confirmWriteHelper.prepared'
```

## Danach empfohlen

```text
RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
```

Scope klein:

- Audit-Helper planen/vorbereiten.
- Produktive Writes weiter blockiert lassen.
- Keine echten User-/Rollen-/Gruppen-Writes.
- Keine DB-Migration ohne Backup/Rollback/Go.

## Geparkt

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

## Webserver-Deploy-Regel

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen. Immer frischer Clone in `_deploy_tmp`.
