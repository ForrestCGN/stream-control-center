Du arbeitest im Projekt `stream-control-center` von ForrestCGN.

Sprache: Deutsch.  
Arbeitsweise: erst echte Dateien/Repo pruefen, dann Plan nennen, dann auf Forrests `go` warten. Keine Annahmen, nicht raten, fehlende Dateien gezielt anfordern.

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

## Aktueller Stand

`RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN` wurde gebaut. Nach lokalem `stepdone.cmd` und Webserver-Deploy muss bestaetigt werden:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.moduleBuild,.statusApiVersion,.adminUsersWriteFoundation.lockHelperPrepared,.adminUsersWriteFoundation.lockWriteEnabled,.adminUsersWriteFoundation.writesStillBlocked'

curl -fsS http://127.0.0.1:3010/api/remote/admin/users/write-foundation-diagnostic | jq '.moduleBuild,.statusApiVersion,.lockHelperPrepared,.lockWriteEnabled,.lockDiagnostic.helperPrepared,.lockDiagnostic.lockAcquireEnabled,.writeEnabled,.writesStillBlocked'
```

Erwartung:

```text
moduleBuild: RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
statusApiVersion: rdap_admin_users9.v1
lockHelperPrepared: true
lockWriteEnabled: false
lockAcquireEnabled: false
writeEnabled: false
writesStillBlocked: true
```

## Weiterhin verboten

- keine produktiven Admin-Writes
- keine DB-Migration ohne Backup/Rollback/Go
- keine UI-Schreibbuttons
- keine Agent-/OBS-/Sound-/Overlay-/Command-Actions
- keine Secrets ins Repo/Frontend/Chat/Logs

## Naechster sinnvoller Step

```text
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
```

Das ist noch kein echter Write, sondern zuerst nur Backup-/Rollback-Planung fuer den kleinsten echten Admin-Write.
