Du arbeitest im Projekt `stream-control-center` von ForrestCGN.

Sprache: Deutsch.  
Arbeitsweise: erst echte Dateien/Repo pruefen, dann Plan nennen, dann auf Forrests `go` warten. Keine Annahmen, nicht raten, fehlende Dateien gezielt anfordern.

## Pflicht zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP.md
docs/current/RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN.md
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

Public URL:

```text
https://mods.forrestcgn.de/
```

Service:

```text
scc-remote-modboard.service
```

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Keine Remote-Writes ausserhalb explizit freigegebenem Scope.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration ohne Backup/Rollback/Go.
- Keine Secrets ins Repo, Frontend, Logs oder Chat.
- Keine User-/Rollen-Writes ohne eigenen Admin-Step mit Permission, Confirm-Write, Audit, Locking, Backup/Rollback und separatem Go.
- Alles streamer-/modfreundlich halten.
- Bestehende Systeme nutzen, keine Parallelstruktur erfinden.

## Ablauf

1. GitHub/dev und Dokus pruefen.
2. Plan nennen.
3. Auf Forrests `go` warten.
4. ZIP mit echten Zielpfaden bauen.
5. Forrest laedt ZIP in Downloads.
6. Lokal `installstep.cmd` ausfuehren.
7. Lokale Checks/Syntax/git status.
8. Bei Erfolg `stepdone.cmd`.
9. Erst danach Webserver-Deploy aus frischem GitHub/dev-Clone.
10. Service-Restart.
11. Readiness-Loop auf `127.0.0.1:3010/api/remote/status`.
12. Erst danach Server-/Browser-Tests.

## Aktueller Zielstand nach RDAP8

```text
RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
```

Bestaetigen:

```text
moduleBuild: RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
statusApiVersion: rdap_admin_users8.v1
confirmWriteHelperPrepared: true
auditHelperPrepared: true
auditWriteEnabled: false
writeEnabled: false
writesStillBlocked: true
```

## Naechster sinnvoller Step

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
```

Ziel:

- Locking-Helper vorbereiten.
- Noch keine echten Locks erwerben/freigeben.
- Keine produktiven Admin-Writes.
- Keine DB-Migration ohne Backup/Rollback/Go.
