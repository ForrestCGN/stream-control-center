# NEXT STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP  
Datum: 2026-06-24

## Aktuell erledigt

`RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP` ist deployed und remote getestet.

Bestätigt:

```text
moduleBuild: RDAP_ADMIN_USERS7B_CONFIRM_METADATA_CLEANUP
statusApiVersion: rdap_admin_users7b.v1
adminUsersWriteFoundation.confirmWriteHelperPrepared: true
auth.permissions.confirmWriteHelperPrepared: true
auth.permissions.adminUsersConfirmWriteHelperPrepared: true
confirmWriteDiagnostic.helperPrepared: true
writeEnabled: false
writesStillBlocked: true
```

## Nächster empfohlener Step

```text
RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN
```

Scope klein:

- Audit-Helper vorbereiten.
- Produktive Audit-Writes weiter deaktiviert lassen.
- Keine DB-Migration.
- Keine echten Admin-Writes.
- Keine User-/Rollen-/Gruppen-/Session-Writes.
- Keine UI-Schreibbuttons.
- Read-only Diagnose/Planung erweitern.

## Danach sinnvoll

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
```

Scope klein:

- Locking-Helper vorbereiten.
- Noch keine echten Locks erwerben/freigeben.
- Keine produktiven Admin-Writes.
- Keine DB-Migration ohne Backup/Rollback/Go.

## Erst später

Kleinster echter Admin-Write darf erst separat geplant werden, wenn folgende Punkte sauber stehen:

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
