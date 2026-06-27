Du arbeitest im Projekt `stream-control-center` von ForrestCGN.

Sprache: Deutsch.  
Arbeitsweise: erst echte Dateien/Repo pruefen, dann Plan nennen, dann auf Forrests `go` warten. Keine Annahmen, nicht raten, fehlende Dateien gezielt anfordern.

## Pflicht zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION.md
docs/current/RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED.md
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
/opt/stream-control-center ist KEIN Git-Repo
```

## Korrekte Arbeitsweise

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

Wichtig:

```text
stepdone.cmd bedeutet lokaler Commit/Push nach GitHub/dev.
stepdone.cmd bedeutet nicht Webserver-Deploy.
Lokal auf Windows nicht faelschlich Port 3010 voraussetzen.
```

## Aktueller Stand nach RDAP7

- `mods.forrestcgn.de` laeuft.
- Twitch Login ist live.
- Dashboard-Zugriff wird serverseitig geprueft.
- Admin -> User & Rollen ist read-only sichtbar.
- RDAP5 Permission-Diagnose bleibt read-only.
- RDAP6 Write-Foundation-Diagnose bleibt read-only.
- RDAP7 Confirm-Write-Helper ist vorbereitet, aber fuer produktive Writes deaktiviert.
- Keine echten Admin-Writes.
- Keine DB-Migration.
- Keine UI-Schreibbuttons.

## RDAP7 Route

```text
GET /api/remote/admin/users/write-foundation-diagnostic
```

Erwartung nach Deploy:

```text
moduleBuild: RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED
statusApiVersion: rdap_admin_users7.v1
confirmWriteHelperPrepared: true
confirmWriteHelperExecutesWrites: false
writesStillBlocked: true
confirmWriteDiagnostic.examples.missingConfirm.reason: confirm_write_required
confirmWriteDiagnostic.examples.confirmWriteTrue.reason: confirm_write_accepted_but_writes_disabled
```

## Weiterhin verboten

- Keine Funktionalitaet entfernen.
- Keine Remote-Writes ausserhalb explizit freigegebenem Scope.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration ohne Backup/Rollback/Go.
- Keine Secrets ins Repo, Frontend, Logs oder Chat.
- Keine User-/Rollen-Writes ohne eigenen Admin-Step mit Permission, Confirm-Write, Audit und Locking.

## Naechster sinnvoller Step

Nach RDAP7-Test:

```text
RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED
```

Ziel:

- Audit-Helper vorbereiten.
- Produktive Audit-/Admin-Writes weiter deaktiviert lassen.
- Keine DB-Migration ohne Backup/Rollback/Go.
- Keine echten User-/Rollen-/Gruppen-Writes ohne eigenen Scope/Go.

## Geparkt

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

Online + Lokal/LAN mit Twitch-Login bleibt geplant, aber erst weiterfuehren, wenn das Web-Dashboard stabiler ist.
