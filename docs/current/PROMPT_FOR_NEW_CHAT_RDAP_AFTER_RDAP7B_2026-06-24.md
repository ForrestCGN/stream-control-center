Du arbeitest im Projekt `stream-control-center` von ForrestCGN.

Sprache: Deutsch.  
Arbeitsweise: erst echte Dateien/Repo prüfen, dann Plan nennen, dann auf Forrests `go` warten. Keine Annahmen, nicht raten, fehlende Dateien gezielt anfordern.

## Pflicht zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
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

Webserver:

```text
https://mods.forrestcgn.de/
scc-remote-modboard.service
```

## Wichtige Regeln

- Keine Funktionalität entfernen.
- Keine produktiven Admin-Writes ohne eigenen separaten Scope/Go.
- Keine DB-Migration ohne Backup/Rollback/Go.
- Keine Secrets ins Repo, Frontend, Logs oder Chat.
- Bestehende Systeme nutzen, keine Parallelstruktur erfinden.

## Korrekte Arbeitsweise

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

## Aktueller Stand nach RDAP7B

- Confirm-Write-Helper ist vorbereitet.
- Produktive Writes bleiben deaktiviert.
- Statusroute und Foundation-Diagnose zeigen Confirm-Write-Helper-Metadaten eindeutig.
- Keine User-/Rollen-/Gruppen-/Session-Writes.
- Keine DB-Migration.
- Keine UI-Schreibbuttons.

## Nächster sinnvoller Schritt

```text
RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
```

Ziel:

- Audit-Helper planen/vorbereiten, aber echte Audit-Writes deaktiviert lassen.
- Keine produktiven User-/Rollen-/Gruppen-Writes.
- Erst Plan nennen und auf `go` warten.
