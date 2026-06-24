# NEXT STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN  
Datum: 2026-06-24

## Sofort

1. `RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN.zip` lokal einspielen.
2. `git status` prüfen.
3. Prüfen, dass nur Doku-/Projektstatus-Dateien geändert wurden.
4. `stepdone.cmd` ausführen.

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

### 2. Admin Write Foundation vorbereiten

Nächster Plan-/Foundation-Step:

```text
RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION
```

Scope soll weiterhin klein bleiben:

- echte DB-Tabellen/Spalten prüfen
- Backup-Befehl dokumentieren
- Rollback-Befehl dokumentieren
- Owner/Admin-Permission-Read prüfen
- Confirm-Write-Regel technisch vorbereiten oder exakt planen
- Audit-Ziel prüfen
- Locking-Ziel prüfen
- noch keine großen User-/Rollen-Writes bauen

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
