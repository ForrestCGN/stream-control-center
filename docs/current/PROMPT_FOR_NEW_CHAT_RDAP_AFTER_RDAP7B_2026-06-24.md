Du arbeitest im Projekt `stream-control-center` von ForrestCGN.

Sprache: Deutsch.  
Arbeitsweise: erst echte Dateien/Repo prüfen, dann Plan nennen, dann auf Forrests `go` warten. Keine Annahmen, nicht raten, fehlende Dateien gezielt anfordern.

## Pflicht zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION.md
docs/current/RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED.md
docs/current/RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP.md
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

## Aktueller bestätigter Stand

```text
RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP
```

Bestätigt auf dem Webserver:

```text
moduleBuild: RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP
statusApiVersion: rdap_admin_users7b.v1
status.adminUsersWriteFoundation.confirmWriteHelperPrepared: true
auth.permissions.confirmWriteHelperPrepared: true
auth.permissions.adminUsersConfirmWriteHelperPrepared: true
foundation.confirmWriteHelperPrepared: true
foundation.confirmWriteDiagnostic.helperPrepared: true
writeEnabled: false
writesStillBlocked: true
```

Wichtig:

```text
.confirmWriteHelper.helperPrepared = null
```

ist kein Funktionsfehler. Das Objekt heißt aktuell `confirmWriteDiagnostic`; dort ist der reale Wert:

```text
.confirmWriteDiagnostic.helperPrepared = true
```

## Wichtige Regeln

- Keine Funktionalität entfernen.
- Keine Remote-Writes außerhalb explizit freigegebenem Scope.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration ohne Backup/Rollback/Go.
- Keine Secrets ins Repo, Frontend, Logs oder Chat.
- Keine User-/Rollen-Writes ohne eigenen Admin-Step mit Permission, Confirm-Write, Audit und Locking.
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

## Nächster sinnvoller Step

```text
RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
```

Ziel:

- Audit-Helper vorbereiten.
- Produktive Audit-Writes weiter deaktiviert lassen.
- Keine DB-Migration.
- Keine echten User-/Rollen-/Gruppen-/Session-Writes.
- Keine UI-Schreibbuttons.
- Nur read-only Diagnose/Planung und klare Metadaten.

Danach sinnvoll:

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
```

Erst danach über einen kleinsten echten Admin-Write reden, mit Backup/Rollback, Permission, Confirm-Write, Audit, Locking und separatem Go.
