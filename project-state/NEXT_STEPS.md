# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS10B_PROJECT_STATE_SYNC  
Datum: 2026-06-24

## Aktuell erledigt

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
```

ist deployed und remote getestet.

Remote bestaetigt:

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

Der Doku-/Plan-Step ist vorhanden:

```text
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
```

Projektstatus-Dateien wurden mit diesem Sync auf den RDAP10-Plan-Stand gebracht:

```text
RDAP_ADMIN_USERS10B_PROJECT_STATE_SYNC
```

## Naechster empfohlener Step

```text
RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
```

Scope:

- Write-Foundation technisch weiter vorbereiten.
- Weiterhin default/produktiv disabled.
- Noch kein echter User-/Rollen-/Gruppen-/Session-Write.
- Keine UI-Schreibbuttons.
- Keine DB-Migration.
- Permission, Confirm-Write, Audit, Locking und Backup-/Rollback-Regel zusammenfuehren.
- Diagnose/Status darf zeigen, dass Writes blockiert bleiben.

## Erst spaeter

Ein echter produktiver Mini-Write darf erst separat gebaut werden, wenn folgende Punkte sauber stehen:

```text
Permission-Pruefung
Confirm-Write
Audit
Locking
Backup/Rollback
klare Owner/Admin-Grenzen
separates Go
```

## Webserver-Deploy-Regel

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen. Immer frischer Clone in `_deploy_tmp`.
