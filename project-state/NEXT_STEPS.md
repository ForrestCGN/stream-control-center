# NEXT STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION  
Datum: 2026-06-24

## Sofort

1. `RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION.zip` lokal einspielen.
2. Prüfen:

```powershell
git status
```

Erwartung: nur Doku-/Projektstatus-Dateien geändert.

3. Bei sauberem Stand:

```powershell
.\stepdone.cmd "RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION abgeschlossen: Backup-/Rollback-, Permission-, Confirm-, Audit- und Locking-Foundation dokumentiert; keine Code-/DB-/Remote-Action-Änderungen"
```

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

### 2. Nächster kleiner Code-Step

```text
RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC
```

Scope:

- erst echte Dateien/Repo prüfen
- vorhandene Auth-/Permission-/Read-Services auswerten
- Permission-Read für aktuell eingeloggten User diagnostisch vorbereiten
- Owner/Admin/normalen User serverseitig erkennen
- keine produktiven Writes
- keine Rollen-/Gruppen-/Session-Writes
- keine DB-Migration
- keine UI-Schreibbuttons

### 3. Spätere Admin-Writes nur mit eigenem Scope

Für echte User-/Rollenverwaltung später nötig:

- serverseitige Owner/Admin-Permission
- Confirm-Write
- Audit-Log
- Locking
- Backup/Rollback
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
