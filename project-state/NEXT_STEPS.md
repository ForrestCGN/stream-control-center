# NEXT STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED  
Datum: 2026-06-24

## Sofort: RDAP7 einspielen

1. ZIP lokal einspielen:

```powershell
cd D:\Git\stream-control-center

.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED.zip" "RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED: Confirm-Write-Helper vorbereitet, produktive Admin-Writes bleiben deaktiviert"
```

2. Lokale Checks:

```powershell
node --check .\remote-modboard\backend\server.js
node --check .\remote-modboard\backend\src\services\admin-confirm-write.service.js
node --check .\remote-modboard\backend\src\services\admin-user-write-foundation.service.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\routes\status.routes.js
node -e "JSON.parse(require('fs').readFileSync('.\remote-modboard\backend\package.json','utf8')); console.log('package.json ok')"

git status
```

Optional im Backend-Ordner:

```powershell
cd .\remote-modboard\backend
npm run check
cd ..\..
```

3. Wenn sauber:

```powershell
.\stepdone.cmd "RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED abgeschlossen: Confirm-Write-Helper vorbereitet; produktive Admin-Writes bleiben deaktiviert; keine User-/Rollen-/Gruppen-/Session-Writes, keine DB-Migration, keine UI-Schreibbuttons"
```

## Danach Webserver-Deploy

Erst nach `stepdone.cmd`:

```bash
cd /opt/stream-control-center/_deploy_tmp

rm -rf RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED

git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED

cd RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED

sudo bash tools/remote-modboard-deploy.sh RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED dev
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
curl -fsS http://127.0.0.1:3010/api/remote/routes | grep -i "confirm"
curl -fsS http://127.0.0.1:3010/api/remote/admin/users/write-foundation-diagnostic | jq '.moduleBuild,.statusApiVersion,.confirmWriteHelperPrepared,.confirmWriteHelperExecutesWrites,.writesStillBlocked,.confirmWriteDiagnostic.examples.missingConfirm.reason,.confirmWriteDiagnostic.examples.confirmWriteTrue.reason'
```

Erwartung:

```text
RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED
rdap_admin_users7.v1
confirmWriteHelperPrepared: true
confirmWriteHelperExecutesWrites: false
writesStillBlocked: true
confirm_write_required
confirm_write_accepted_but_writes_disabled
```

## Danach empfohlen

```text
RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED
```

Scope klein:

- Audit-Helper vorbereiten.
- Produktive Audit-/Admin-Writes weiter blockiert lassen.
- Keine DB-Migration ohne Backup/Rollback/Go.
- Keine echten User-/Rollen-/Gruppen-Writes.

## UI/Navi-Cleanup separat planen

Sidebar spaeter logisch bereinigen:

```text
System
Module
Admin
  - Benutzer
  - Rollen & Rechte
  - Zugriff
  - Sicherheit
```

Nicht in RDAP7 enthalten.

## Geparkt

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

Ziel spaeter:

- Online + Lokal/LAN-Betrieb.
- ForrestCGN und EngelCGN lokal im LAN.
- Lokaler Login ebenfalls ueber Twitch.
- Erst weiterfuehren, wenn Web-Dashboard stabiler ist.

## Webserver-Deploy-Regel

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen. Immer frischer Clone in `_deploy_tmp`.
