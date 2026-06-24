# NEXT STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION  
Datum: 2026-06-24

## Sofort: RDAP6 einspielen

1. ZIP lokal einspielen:

```powershell
cd D:\Git\stream-control-center

.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION.zip" "RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION: Confirm-/Audit-/Locking-Foundation read-only vorbereitet, keine produktiven Writes"
```

2. Lokale Checks:

```powershell
node --check .\remote-modboard\backend\src\services\admin-user-write-foundation.service.js
node --check .\remote-modboard\backend\src\routes\admin-users.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node -e "JSON.parse(require('fs').readFileSync('.\remote-modboard\backend\package.json','utf8')); console.log('package.json ok')"

git status
```

3. Wenn sauber:

```powershell
.\stepdone.cmd "RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION abgeschlossen: Confirm-/Audit-/Locking-Foundation read-only vorbereitet; keine User-/Rollen-/Gruppen-/Session-Writes, keine DB-Migration, keine UI-Schreibbuttons"
```

## Danach Webserver-Deploy

Erst nach `stepdone.cmd`:

```bash
cd /opt/stream-control-center/_deploy_tmp

rm -rf RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION

git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION

cd RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION

sudo bash tools/remote-modboard-deploy.sh RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION dev
```

Restart + Readiness:

```bash
systemctl restart scc-remote-modboard.service

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
curl -i http://127.0.0.1:3010/api/remote/status
curl -fsS http://127.0.0.1:3010/api/remote/routes | grep -i "write-foundation"
curl -i http://127.0.0.1:3010/api/remote/admin/users/write-foundation-diagnostic
```

Erwartung:

```text
HTTP 200
readOnly: true
writeEnabled: false
writesStillBlocked: true
confirmWriteRequired: true
auditRequired: true
lockingRequired: true
```

## Danach empfohlen

```text
RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED
```

Scope klein:

- Confirm-Write-Helfer vorbereiten.
- Produktive Writes weiter blockiert lassen.
- Audit-/Locking-Pflicht weiter vorbereiten.
- Keine echten User-/Rollen-/Gruppen-Writes.

## Geparkt

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

Ziel später:

- Online + Lokal/LAN-Betrieb.
- ForrestCGN und EngelCGN lokal im LAN.
- Lokaler Login ebenfalls über Twitch.
- Erst weiterführen, wenn Web-Dashboard stabiler ist.

## Webserver-Deploy-Regel

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen. Immer frischer Clone in `_deploy_tmp`.
