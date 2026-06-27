Wir arbeiten am Projekt `stream-control-center` / RDAP Remote-Modboard von ForrestCGN.

Sprache: Deutsch.

WICHTIG:
Arbeite strikt nach der vorhandenen Arbeitsweise. Nicht raten. Erst echte Dateien/Repo/Dokus prüfen, dann Plan nennen, dann auf Forrests ausdrückliches `go` warten. Keine Funktionalität entfernen. Keine funktionierenden Workflow-Tools überschreiben. Keine Parallelstrukturen bauen. Bestehende Systeme nutzen.

Single Source of Truth:
GitHub:
https://github.com/ForrestCGN/stream-control-center
Branch: dev

Lokales Repo:
D:\Git\stream-control-center

Lokales Live-Ziel:
D:\Streaming\stramAssets

Webserver:
mods.forrestcgn.de
/opt/stream-control-center
/opt/stream-control-center/remote-modboard

Service:
scc-remote-modboard.service

## Pflicht zuerst lesen

Bitte zuerst im GitHub/dev prüfen/lesen:

docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN.md
docs/current/RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN.md
docs/current/RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC.md
docs/current/RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC.md
docs/current/RDAP_ADMIN_USERS14B_ROUTE_LIST_SYNC_LIVE_CONFIRMED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md

## Aktueller bestätigter Stand

RDAP14B ist live bestätigt.

Statusroute auf Webserver:

```text
moduleBuild: RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC
statusApiVersion: rdap_admin_users14b.v1
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Routenübersicht:

```text
/api/remote/routes -> adminUserAdminNoteDiagnostic
prepared: true
route: /api/remote/admin/users/admin-note-diagnostic
readOnly: true
writeEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
routeListKeySynced: true
aliasOf: adminUsersAdminNoteDiagnostic
```

Admin-Notiz-Diagnose:

```text
GET /api/remote/admin/users/admin-note-diagnostic
ok: true
routeRemainsReadOnly: true
writeEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
tableExists: false
schemaReady: false
migrationRequired: true
```

Das bedeutet:
Die Diagnose funktioniert, aber die Tabelle `dashboard_user_admin_notes` existiert noch nicht.

## Weiterhin verboten/nicht aktiv

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
DB-Migration
SQL-Ausführung
CREATE TABLE Ausführung
Audit-Inserts oder Audit-Updates
Lock acquire/heartbeat/release/force-takeover
Backup-Ausführung
Rollback-Ausführung
UI-Schreibbuttons
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
Admin-Notiz-Write
```

## Nächster Fachstep

```text
RDAP_ADMIN_USERS15_ADMIN_NOTE_TABLE_MIGRATION_PLAN
```

RDAP15 soll nur planen:

- exaktes SQL für `dashboard_user_admin_notes`
- Backup-Befehl
- Rollback-Befehl
- Read-only Vorprüfung vor Migration
- Read-Back-Prüfung nach Migration
- harte Abbruchbedingungen
- ob Migration als disabled/prepared Step oder mit separatem Go ausgeführt werden darf

Noch keine echte Migration bauen, bevor Forrest nach dem Plan ein separates `go` gibt.

## Workflow

Forrest lädt ZIPs in den Download-Ordner.

Lokal:

```powershell
cd D:\Git\stream-control-center

.\installstep.cmd "$env:USERPROFILE\Downloads\STEP_NAME.zip" "STEP-Beschreibung"
```

Danach lokale Checks passend zum Step. Wenn sauber:

```powershell
.\stepdone.cmd "STEP-Beschreibung"
```

`stepdone.cmd` bedeutet lokaler Commit/Push nach GitHub/dev, nicht Server-Deploy.

Webserver-Deploy nur aus frischem GitHub/dev-Clone:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
sudo systemctl restart scc-remote-modboard.service
```

Readiness abwarten:

```bash
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

Nicht hektisch werden. Bei Unklarheit exakt fehlende Datei/Ausgabe anfordern.
