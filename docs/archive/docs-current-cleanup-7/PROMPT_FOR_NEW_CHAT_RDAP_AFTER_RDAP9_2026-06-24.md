Du arbeitest im Projekt `stream-control-center` von ForrestCGN.

Sprache: Deutsch.  
Arbeitsweise: erst echte Dateien/Repo prüfen, dann Plan nennen, dann auf Forrests `go` warten. Keine Annahmen, nicht raten, fehlende Dateien gezielt anfordern.

## Pflicht zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Single Source of Truth

GitHub:

```text
https://github.com/ForrestCGN/stream-control-center
Branch: dev
```

Lokales Repo:

```text
D:\Git\stream-control-center
```

Lokales Live-Ziel:

```text
D:\Streaming\stramAssets
```

Webserver:

```text
/opt/stream-control-center
```

Remote-Modboard:

```text
/opt/stream-control-center/remote-modboard
```

Public URL:

```text
https://mods.forrestcgn.de/
```

Service:

```text
scc-remote-modboard.service
```

## Wichtige Regeln

- Keine Funktionalität entfernen.
- Keine Remote-Writes außerhalb explizit freigegebenem Scope.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration ohne Backup/Rollback/Go.
- Keine Secrets ins Repo, Frontend, Logs oder Chat.
- Keine User-/Rollen-/Gruppen-/Session-Writes ohne eigenen Admin-Step mit Permission, Confirm-Write, Audit, Locking, Backup/Rollback und separatem Go.
- Alles streamer-/modfreundlich halten.
- Bestehende Systeme nutzen, keine Parallelstruktur erfinden.

## Korrekte Arbeitsweise / Ablauf

1. GitHub/dev und Dokus prüfen.
2. Plan nennen.
3. Auf Forrests `go` warten.
4. ZIP mit echten Zielpfaden bauen.
5. Forrest lädt ZIP in Downloads.
6. Lokal `installstep.cmd` ausführen.
7. Lokale Checks/Syntax/git status.
8. Bei Erfolg `stepdone.cmd`.
9. Erst danach Webserver-Deploy aus frischem GitHub/dev-Clone.
10. Service-Restart.
11. Readiness-Loop auf `127.0.0.1:3010/api/remote/status`.
12. Erst danach Server-/Browser-Tests.

Wichtig:

```text
stepdone.cmd bedeutet lokaler Commit/Push nach GitHub/dev.
stepdone.cmd bedeutet nicht Webserver-Deploy.
Lokal auf Windows nicht fälschlich Port 3010 voraussetzen.
Port 3010 ist im aktuellen Workflow Webserver-Service-Test nach Deploy.
```

## Webserver-Deploy-Regel

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen.

Richtig:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Nach Restart immer Readiness abwarten:

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

## Aktueller bestätigter Stand

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
```

Bestätigt auf dem Webserver:

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

Aktueller Sicherheitsstand:

```text
Permission-Read-Diagnose: vorbereitet
Confirm-Write-Helper: vorbereitet, Writes deaktiviert
Audit-Helper: vorbereitet, Writes deaktiviert
Lock-Helper: vorbereitet, Writes deaktiviert
Admin-Writes: weiterhin aus
DB-Migration: keine
UI-Schreibbuttons: keine
```

## Weiterhin verboten / nicht aktiv

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
DB-Migration
UI-Schreibbuttons
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
```

## Nächster sinnvoller Step

```text
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
```

Ziel:

- Backup-/Rollback-Plan für den kleinsten späteren Admin-Write erstellen.
- Noch kein echter User-/Rollen-/Gruppen-/Session-Write.
- Keine UI-Schreibbuttons.
- Keine DB-Migration ohne Backup/Rollback/Go.
- Permission, Confirm-Write, Audit und Locking müssen in der Planung sauber zusammengeführt werden.
- Erst nach separatem Plan und ausdrücklichem Go darf ein echter Mini-Write gebaut werden.

## Local/LAN

Forrest möchte später:

```text
Online über mods.forrestcgn.de arbeiten.
Zusätzlich lokal im Heimnetz arbeiten können.
EngelCGN soll lokal im LAN ebenfalls arbeiten können.
Lokaler Login soll ebenfalls über Twitch laufen.
```

Das ist aktuell geparkt:

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

Erst weiterführen, wenn das Web-Dashboard stabiler ist.
