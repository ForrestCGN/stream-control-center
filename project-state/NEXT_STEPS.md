# NEXT_STEPS - stream-control-center

Stand: RDAP_META1_BUILD_HEADER_CLEANUP  
Datum: 2026-06-24

## Sofort nach ZIP

Lokal auf Windows:

```powershell
cd D:\Git\stream-control-center

.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP_META1_BUILD_HEADER_CLEANUP.zip" "RDAP_META1_BUILD_HEADER_CLEANUP: Build-/Header-Metadaten bereinigt, RDAP5-Route abgesichert, Local/LAN-Twitch-Login als TODO geparkt"

node --check .\remote-modboard\backend\server.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\src\routes\status.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\routes\admin-users.routes.js
node --check .\remote-modboard\backend\src\services\admin-user-permission-read.service.js
node -e "JSON.parse(require('fs').readFileSync('.\\remote-modboard\\backend\\package.json','utf8')); console.log('package.json ok')"

git status
```

Wenn sauber:

```powershell
.\stepdone.cmd "RDAP_META1_BUILD_HEADER_CLEANUP abgeschlossen: Build-/Header-Metadaten bereinigt; RDAP5 Admin-User-Permission-Diagnose bleibt read-only; Local/LAN-Twitch-Login als geparkter TODO dokumentiert; keine DB-/Admin-Write-/Secret-Änderungen"
```

## Danach Webserver-Deploy

Erst nach lokalem `stepdone.cmd`:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP_META1_BUILD_HEADER_CLEANUP
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_META1_BUILD_HEADER_CLEANUP
cd RDAP_META1_BUILD_HEADER_CLEANUP
sudo bash tools/remote-modboard-deploy.sh RDAP_META1_BUILD_HEADER_CLEANUP dev
```

Danach Readiness:

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

Server-Tests:

```bash
curl -i http://127.0.0.1:3010/api/remote/status
curl -fsS http://127.0.0.1:3010/api/remote/routes | grep -i "permission-diagnostic"
curl -i http://127.0.0.1:3010/api/remote/admin/users/permission-diagnostic
```

Erwartung:

- `X-Remote-Modboard-Build: RDAP_META1_BUILD_HEADER_CLEANUP`
- `statusApiVersion: rdap_meta1.v1`
- `permission-diagnostic` Route sichtbar
- Ohne Session bei Permission-Diagnose weiterhin `401` korrekt

## Danach empfohlen

### 1. Admin Confirm/Audit/Locking-Foundation

```text
RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION
```

Scope weiterhin klein:

- Confirm-Write-Helfer vorbereiten
- Audit-Write-Ziel technisch prüfen
- Locking-Foundation prüfen
- keine großen User-/Rollen-Writes
- keine UI-Schreibbuttons ohne eigenen Step

### 2. Geparkt: Lokaler/LAN-Betrieb mit Twitch-Login

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

Erst weiterführen, wenn das Web-Dashboard online stabil genug ist.

Ziel später:

- lokaler Betrieb im Heimnetz
- EngelCGN LAN-Zugriff
- lokaler Twitch-Login
- lokale Env/Startscript/DB-Strategie
- keine Secrets im Repo

## Webserver-Deploy-Regel

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen.
