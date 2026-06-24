# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN  
Datum: 2026-06-24

## Aktuell erledigt

`RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN` dokumentiert den Backup-/Rollback-/Mini-Write-Sicherheitsplan.

Dieser Step ist ein reiner Plan-/Doku-Step:

```text
Keine produktiven Admin-Writes
Keine DB-Migration
Keine UI-Schreibbuttons
Keine Agent-Actions
Keine OBS-/Sound-/Overlay-/Command-Steuerung
```

## Vorher remote bestaetigt

```text
moduleBuild: RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
statusApiVersion: rdap_admin_users9.v1
lockHelperPrepared: true
lockWriteEnabled: false
lockDiagnostic.helperPrepared: true
lockDiagnostic.writeEnabled: false
writeEnabled: false
writesStillBlocked: true
```

## Naechster empfohlener Step

```text
RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
```

Scope:

```text
- Mini-Write-Foundation vorbereiten, aber weiterhin deaktiviert.
- Permission, Confirm-Write, Audit, Locking, Backup/Rollback im Codepfad zusammenfuehren.
- Noch kein echter User-/Rollen-/Gruppen-/Session-Write.
- Keine UI-Schreibbuttons.
- Keine DB-Migration ohne separaten Backup-/Rollback-/Go-Step.
```

## Erst spaeter

Ein echter produktiver Admin-Write darf erst separat gebaut werden, wenn folgende Punkte sauber stehen:

```text
Permission-Pruefung
Confirm-Write
Audit
Locking
Backup/Rollback
klare Owner/Admin-Grenzen
separates Go
```

## Webserver-Deploy-Regel

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen.

Immer frischer Clone in `_deploy_tmp`:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Nach Service-Restart immer Readiness abwarten:

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
