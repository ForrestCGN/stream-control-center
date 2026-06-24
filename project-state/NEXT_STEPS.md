# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS11B_DEPLOY_CONFIRMED_DOCS  
Datum: 2026-06-24

## Aktuell erledigt

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
RDAP_ADMIN_USERS10B_PROJECT_STATE_SYNC
RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
```

RDAP11 ist deployed und remote bestätigt.

Bestätigt:

```text
statusApiVersion: rdap_admin_users11.v1
miniWriteFoundationPrepared: true
writeEnabled: false
writesStillBlocked: true
```

Die Diagnose-Route ist erreichbar:

```text
GET /api/remote/admin/users/mini-write-foundation-diagnostic
```

Auch mit `confirmWrite=true` bleiben Writes blockiert.

## Nächster empfohlener Step

```text
RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN
```

Scope nur Planung:

- Kleinsten möglichen späteren Admin-Write auswählen.
- Noch keinen produktiven Write bauen.
- Noch keine UI-Schreibbuttons.
- Noch keine DB-Migration ohne Backup/Rollback/Go.
- Exakten Datenpfad klären: Welche Tabelle, welcher Datensatz, welches Feld.
- Backup- und Rollback-Befehl konkret dokumentieren.
- Permission-Grenze definieren.
- Confirm-Write-Anforderung definieren.
- Audit-Payload definieren.
- Lock-Scope definieren.
- Read-Back-Prüfung definieren.
- Fehlerfälle und Abbruchbedingungen dokumentieren.

## Erst danach

Ein echter Mini-Write darf erst separat gebaut werden, wenn RDAP12 abgeschlossen ist und Forrest ein weiteres klares `go` gibt.

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
