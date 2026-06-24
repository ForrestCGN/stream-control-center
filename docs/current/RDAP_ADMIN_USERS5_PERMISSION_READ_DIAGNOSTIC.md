# RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC

Stand: 2026-06-24
Scope: kleiner Code-Read-Step + Doku, keine produktiven Admin-Writes

## Ziel

Dieser Step baut eine reine serverseitige Admin-User-Permission-Diagnose fuer den aktuell eingeloggten User.

Der Step ist Vorbereitung fuer spaetere Admin-Userverwaltung unter `Admin -> User & Rollen`, aktiviert aber noch keine produktive Verwaltung.

## Gebaut

Neue Route:

```text
GET /api/remote/admin/users/permission-diagnostic
```

Neue Dateien:

```text
remote-modboard/backend/src/services/admin-user-permission-read.service.js
remote-modboard/backend/src/routes/admin-users.routes.js
```

Geaenderte Registrierungen:

```text
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Technische Umsetzung

Die Diagnose nutzt bewusst vorhandene Auth-/Permission-Leselogik weiter:

```text
remote-modboard/backend/src/services/auth-session-read.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/services/db.service.js
```

Wichtig: Es wurde keine zweite Rechtewelt erfunden. Die neue Diagnose ruft vorhandene Permission-Read-Funktionen fuer diese Ziel-Permissions auf:

```text
remote.admin.users.read
remote.admin.users.write
```

Das Ergebnis bleibt diagnostisch. `canWriteAdminUsers` bleibt in RDAP5 immer `false`, auch wenn eine spaetere Rollen-/Permission-Auswertung theoretisch einen Write erlauben wuerde.

## Antwortverhalten

Ohne gueltige Session:

```text
HTTP 401
reason: not_logged_in_or_session_invalid
```

Mit gueltiger Session, aber ohne Dashboard-Zugriff:

```text
HTTP 403
reason: dashboard_access_denied
```

Mit gueltiger Session und Dashboard-Zugriff:

```text
HTTP 200
reason: read_only_permission_diagnostic_ready
```

Die Antwort enthaelt u. a.:

```text
readOnly: true
writeEnabled: false
productiveWritesEnabled: false
adminWriteRoutesEnabled: false
userRoleWritesEnabled: false
userGroupWritesEnabled: false
sessionRevocationWritesEnabled: false
agentActionsEnabled: false
```

## Actor-Diagnose

Die Route gibt den Actor diagnostisch aus:

```text
userUid
displayName
loginName
status
roles
groups
isOwner
isAdmin
isSoundProfi
```

`Sound-Profi` wird weiterhin als Gruppe/Freigabe behandelt, nicht als Systemrolle.

## Sicherheitsgrenzen

Dieser Step baut nicht:

```text
- keine User-Freigabe
- keine User-Sperre
- keine Rollenvergabe
- keine Rollenentziehung
- keine Gruppenvergabe
- keine Gruppenentziehung
- keine Session-Widerrufe
- keine UI-Schreibbuttons
- keine DB-Migration
- keine SQL-Dateien
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
```

## Lokaler Test

Nach `installstep.cmd` und lokalem Start/Restart:

```powershell
cd D:\Git\stream-control-center

Invoke-RestMethod "http://127.0.0.1:3010/api/remote/admin/users/permission-diagnostic" |
  ConvertTo-Json -Depth 10
```

Erwartung ohne Login/Cookie im PowerShell-Kontext:

```text
HTTP 401 oder Invoke-RestMethod WebException mit JSON reason not_logged_in_or_session_invalid
```

Im Browser mit eingeloggter Session kann die Route direkt aufgerufen werden:

```text
https://mods.forrestcgn.de/api/remote/admin/users/permission-diagnostic
```

Erwartung fuer erlaubten Dashboard-User:

```text
ok: true
readOnly: true
writeEnabled: false
dashboardAccess: true
permissions.canReadAdminUsers: true oder diagnostisch nachvollziehbar
permissions.canWriteAdminUsers: false
```

## Webserver-Deploy-Regel

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen.

Richtig:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC
cd RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC
sudo bash tools/remote-modboard-deploy.sh RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC dev
```

Nach Restart immer Readiness abwarten:

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

## Naechster sinnvoller Step

```text
RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION
```

Ziel dann: Confirm-/Audit-/Locking-Foundation technisch vorbereiten, weiterhin ohne grosse User-/Rollen-Writes.
