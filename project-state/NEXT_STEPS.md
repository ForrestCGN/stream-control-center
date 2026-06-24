# NEXT STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN  
Datum: 2026-06-24

## Aktuell erledigt

`RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN` ist deployed und remote getestet.

Bestätigt:

```text
moduleBuild: RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
statusApiVersion: rdap_admin_users8.v1
adminUsersWriteFoundation.auditHelperPrepared: true
adminUsersWriteFoundation.auditWriteEnabled: false
adminUsersWriteFoundation.writesStillBlocked: true
auditDiagnostic.helperPrepared: true
auditDiagnostic.writeEnabled: false
writeEnabled: false
writesStillBlocked: true
```

## Nächster empfohlener Step

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
```

Scope klein:

- Locking-Helper vorbereiten.
- Noch keine echten Locks erwerben/freigeben.
- Keine produktiven Admin-Writes.
- Keine DB-Migration ohne Backup/Rollback/Go.
- Keine User-/Rollen-/Gruppen-/Session-Writes.
- Keine UI-Schreibbuttons.
- Read-only Diagnose/Planung erweitern.

## Danach sinnvoll

Erst wenn Permission, Confirm-Write, Audit-Helper und Locking-Helper vorbereitet sind:

```text
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
```

Das ist noch kein Write, sondern zuerst nur die Absicherung/Planung fuer den kleinsten echten Admin-Write.

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

Ziel später:

- Online + Lokal/LAN-Betrieb.
- ForrestCGN und EngelCGN lokal im LAN.
- Lokaler Login ebenfalls über Twitch.
- Erst weiterführen, wenn Web-Dashboard stabiler ist.

## Webserver-Deploy-Regel

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen. Immer frischer Clone in `_deploy_tmp`.
