# RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED

Stand: 2026-06-24
Projekt: `stream-control-center` / Remote-Modboard

## Zweck

Dieser Step bereitet eine zentrale Foundation fuer den kleinsten spaeteren Admin-Write vor.

Wichtig: Dieser Step fuehrt weiterhin **keinen** produktiven User-/Rollen-/Gruppen-/Session-Write aus.

## Scope

```text
RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
```

### Neu vorbereitet

- Mini-Write-Foundation-Service.
- Read-only Diagnose-Route fuer die Mini-Write-Foundation.
- Sichtbare Pflichtkette fuer spaetere Admin-Writes:
  - Permission-Pruefung
  - Confirm-Write
  - Audit-Draft
  - Lock-Draft
  - Backup-Plan
  - Rollback-Plan
- Routes-Uebersicht ergaenzt.
- Backend-Build-Metadaten auf RDAP11 gesetzt.
- Package-Check um neue RDAP11-Dateien ergaenzt.

## Neue Diagnose-Route

```text
GET /api/remote/admin/users/mini-write-foundation-diagnostic
```

Optional kann testweise Confirm-Write erkannt werden:

```text
GET /api/remote/admin/users/mini-write-foundation-diagnostic?confirmWrite=true
```

Auch bei `confirmWrite=true` bleiben Writes blockiert.

## Sicherheit

```text
readOnly: true
writeEnabled: false
databaseWriteEnabled: false
migrationEnabled: false
productiveWritesEnabled: false
adminWriteRoutesEnabled: false
writesStillBlocked: true
uiWriteButtonsEnabled: false
```

## Weiterhin nicht aktiv

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
DB-Migration
Audit-Inserts oder Audit-Updates
Lock acquire/heartbeat/release/force-takeover
Backup-Ausfuehrung
Rollback-Ausfuehrung
UI-Schreibbuttons
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
```

## Geaenderte Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/admin-mini-write-foundation.routes.js
remote-modboard/backend/src/services/admin-mini-write-foundation.service.js
docs/current/RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Lokale Tests nach installstep

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\server.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\routes\admin-mini-write-foundation.routes.js
node --check .\remote-modboard\backend\src\services\admin-mini-write-foundation.service.js

git status
```

Optional, falls Dependencies lokal im Remote-Modboard vorhanden sind:

```powershell
cd D:\Git\stream-control-center\remote-modboard\backend
npm run check
```

## Stepdone

```powershell
cd D:\Git\stream-control-center

.\stepdone.cmd "RDAP Admin Users11 Mini-Write-Foundation disabled vorbereitet; keine produktiven Writes, keine DB-Migration, keine UI-Schreibbuttons"
```

## Webserver-Deploy nach Stepdone

Wichtig: `stepdone.cmd` pusht nur nach GitHub/dev. Danach erst Webserver-Deploy aus frischem Clone:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
cd RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
sudo bash tools/remote-modboard-deploy.sh RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED dev
```

Danach Service-Restart und Readiness:

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

## Server-Test nach Deploy

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminUsersMiniWriteFoundation'

curl -fsS http://127.0.0.1:3010/api/remote/admin/users/mini-write-foundation-diagnostic | jq '{moduleBuild, foundationBuild, statusApiVersion, writeEnabled, writesStillBlocked, miniWriteFoundationPrepared}'

curl -fsS 'http://127.0.0.1:3010/api/remote/admin/users/mini-write-foundation-diagnostic?confirmWrite=true' | jq '{confirmWrite, writeEnabled, writesStillBlocked}'
```

## Naechster sinnvoller Step

Noch kein echter Write ohne neuen Plan.

Empfohlen:

```text
RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN
```

Ziel waere nur die Auswahl und genaue Planung des kleinsten echten Admin-Writes inkl. DB-Backup/Rollback, Permission, Confirm-Write, Audit und Locking. Umsetzung erst danach mit separatem Go.
