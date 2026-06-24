# FILES - stream-control-center

Stand: RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN  
Datum: 2026-06-24

## In diesem Step geändert

```text
docs/current/RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Keine Code-Dateien geändert

Dieser Step ändert bewusst keine:

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/src/routes/*.js
remote-modboard/backend/src/services/*.js
```

## Relevante aktuelle RDAP-Frontend-Dateien

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/remote-modboard.css
```

## Relevante Auth-/Profil-Sync-Dateien

```text
remote-modboard/backend/src/services/auth-profile-sync.service.js
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/auth-session-write.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/services/auth-status.service.js
```

## Relevante Admin-read-only-Datei

```text
remote-modboard/backend/src/services/auth-db-read.service.js
```

## Mögliche spätere Admin-Write-Foundation-Dateien

Nur Zielbild, noch nicht vorhanden/noch nicht bauen ohne neuen Step:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-permission.service.js
remote-modboard/backend/src/services/admin-user-confirm.service.js
remote-modboard/backend/src/services/admin-user-audit.service.js
remote-modboard/backend/src/services/admin-user-lock.service.js
```

Beim echten Implementierungs-Step zuerst prüfen, ob vorhandene Services erweitert werden können. Keine Parallelstruktur erfinden.

## Relevante Auth3-DB-Datei

```text
db/rdap_auth3/sql/001_rdap_auth3_avatar_columns.sql
```

Produktiv wurden die Avatar-Spalten bereits manuell bestätigt:

```text
dashboard_users.profile_image_url
dashboard_identities.provider_profile_image_url
```

## Relevante RDAP-Deploy-Datei

```text
tools/remote-modboard-deploy.sh
```

Wichtig: Diese Datei liegt im Repo/Clone. Nicht als fester Serverpfad `/opt/stream-control-center/tools/...` annehmen.

## Server Env

```text
/etc/stream-control-center/remote-modboard.env
```

Diese Datei enthält produktive Secrets und darf nicht ins Repo.

Aktuelle DB-Variablennamen:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

Nicht `MYSQL_*`.

## Webserver

```text
/opt/stream-control-center/remote-modboard
/opt/stream-control-center/remote-modboard/backend
/opt/stream-control-center/_deploy_tmp/
/opt/stream-control-center/_runtime_tmp/
```

Wichtig:

```text
/opt/stream-control-center ist kein Git-Repository.
```
