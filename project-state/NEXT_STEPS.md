# NEXT STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN  
Datum: 2026-06-24

## Aktuell

`RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN` lokal einspielen, prüfen, `stepdone.cmd`, danach Webserver-Deploy.

Erwartung nach Deploy:

```text
moduleBuild: RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
statusApiVersion: rdap_admin_users9.v1
lockHelperPrepared: true
lockWriteEnabled: false
lockAcquireEnabled: false
lockHeartbeatEnabled: false
lockReleaseEnabled: false
lockForceTakeoverEnabled: false
writeEnabled: false
writesStillBlocked: true
```

## Nächster empfohlener Step

```text
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
```

Scope klein:

- Backup-/Rollback-Plan fuer kleinsten echten Admin-Write vorbereiten.
- Noch kein echter Write.
- Kein UI-Schreibbutton.
- Keine DB-Migration ohne separaten Backup/Rollback-Go.
- Permission, Confirm, Audit und Locking bleiben Pflicht.

## Erst später

Kleinster echter Admin-Write darf erst separat geplant und gebaut werden, wenn folgende Punkte sauber stehen:

```text
Permission-Prüfung
Confirm-Write
Audit
Locking
Backup/Rollback
klare Owner/Admin-Grenzen
separates Go
```

## Geparkt

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

## Webserver-Deploy-Regel

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen. Immer frischer Clone in `_deploy_tmp`.
