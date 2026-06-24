# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN  
Datum: 2026-06-24

## Aktuell erledigt

`RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN` ist deployed und remote getestet.

Bestaetigt:

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

## Naechster empfohlener Step

```text
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
```

Scope:

- Backup-/Rollback-Plan fuer den kleinsten spaeteren Admin-Write erstellen.
- Noch kein echter User-/Rollen-/Gruppen-/Session-Write.
- Keine DB-Migration ohne Backup/Rollback/Go.
- Kein UI-Schreibbutton.
- Permission, Confirm-Write, Audit und Locking muessen in der Planung zusammengefuehrt werden.

## Erst spaeter

Kleinster echter Admin-Write darf erst separat gebaut werden, wenn folgende Punkte sauber stehen:

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
