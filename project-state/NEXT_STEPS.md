# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS10B_PROJECT_STATE_SYNC  
Datum: 2026-06-24

## Aktuell erledigt

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
RDAP_ADMIN_USERS10B_PROJECT_STATE_SYNC
```

RDAP9 ist deployed und remote bestätigt. RDAP10 dokumentiert Backup-/Rollback-/Mini-Write-Planung. RDAP10B synchronisiert die Projektstatus-Dateien.

## Nächster empfohlener Step

```text
RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
```

Scope:

- Foundation für den kleinsten späteren Admin-Write vorbereiten.
- Writes bleiben deaktiviert.
- Kein echter User-/Rollen-/Gruppen-/Session-Write.
- Keine DB-Migration.
- Keine UI-Schreibbuttons.
- Permission, Confirm-Write, Audit, Locking, Backup/Rollback und Rollback-Hinweise müssen sichtbar zusammengeführt werden.

## Erst später

Kleinster echter Admin-Write darf erst separat gebaut werden, wenn folgende Punkte sauber stehen:

```text
Permission-Prüfung
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
