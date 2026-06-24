# NEXT STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS2_MANAGEMENT_PLAN  
Datum: 2026-06-24

## Sofort

1. `RDAP_ADMIN_USERS2_MANAGEMENT_PLAN.zip` lokal einspielen.
2. Prüfen, dass nur Doku-/Projektstatus-Dateien geändert wurden.
3. `stepdone.cmd` ausführen, wenn sauber.
4. Optional danach Webserver-Deploy, weil Doku in GitHub/dev sauber sein soll.

## Danach empfohlen

### 1. Secrets rotieren

Falls noch nicht erledigt:

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

Danach Login erneut testen.

### 2. Admin User Management Foundation planen

Nächster Planungs-Step:

```text
RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN_OR_BACKUP_SCOPE
```

Scope weiterhin vorsichtig:

- echten DB-/Tabellenstand prüfen
- vorhandene Auth-/Permission-/Audit-/Locking-Dateien prüfen
- Backup-/Rollback konkret definieren
- kleinsten sicheren Write-Scope festlegen
- noch keine breite UI-Verwaltung bauen

### 3. Spätere Admin-Writes nur mit eigenem Scope

Für echte User-/Rollenverwaltung später nötig:

- serverseitige Owner/Admin-Permission-Middleware
- Confirm-Write
- Audit-Log
- Locking
- Backup/Rollback-Plan
- klare Trennung Self-Profil vs. Admin-Verwaltung

## Webserver-Deploy-Regel

Erst nach lokalem `installstep.cmd`, Tests und `stepdone.cmd`.

Auf dem Webserver immer frisch klonen:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Nicht verwenden:

```text
/opt/stream-control-center/tools/remote-modboard-deploy.sh
```

`/opt/stream-control-center` ist kein Git-Repository.

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
