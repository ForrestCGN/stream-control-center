# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN  
Datum: 2026-06-24

## Aktuell erledigt

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
RDAP_ADMIN_USERS10B_PROJECT_STATE_SYNC
RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
RDAP_ADMIN_USERS11B_DEPLOY_CONFIRMED_DOCS
RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED
RDAP_ACCOUNT_PANEL_CLEANUP_V2
RDAP_NAV_ACCOUNT_TO_PROFILE_MENU_CLEANUP
RDAP_NAV_ACCOUNT_CLEANUP_DOCS_UPDATE
RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN
RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN
```

## RDAP13 Ergebnis

RDAP13 konkretisiert den späteren ersten echten Write, baut ihn aber noch nicht.

Geplanter späterer Write:

```text
Admin-Notiz zu User setzen/aktualisieren
```

Geplanter Datenpfad:

```text
dashboard_user_admin_notes.note_text
```

## Nächster empfohlener Fach-Step

```text
RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC
```

Maximaler Scope für RDAP14:

```text
- SQL-Migrationsdatei für dashboard_user_admin_notes vorbereiten, nicht ausführen
- read-only/disabled Diagnose-Route vorbereiten
- Status sichtbar machen: table planned/prepared, writes disabled
- keine UI-Schreibbuttons
- keine produktiven Writes
- keine echte Migration ohne Backup/Rollback/Go
```

## Noch nicht erlaubt

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen ändern
Sessions widerrufen
Permissions ändern
dashboard_users.status ändern
Admin-Notiz produktiv schreiben
DB-Migration ausführen
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
