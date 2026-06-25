# NEXT_STEPS

Stand: RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED  
Datum: 2026-06-25

## Naechster Schritt

RDAP35 SQL auf dem Webserver kontrolliert ausfuehren:

```text
frischer GitHub/dev-Clone nach _deploy_tmp
Backup dashboard_audit_log
Backup-Datei pruefen
Precheck SQL
Migration SQL
Readback SQL
RDAP33 Route erneut pruefen
```

## Danach

```text
RDAP35B_ADMIN_AUDIT_SCHEMA_MIGRATION_LIVE_CONFIRMED_DOCS
```

Wenn Migration erfolgreich:

```text
RDAP36_ADMIN_AUDIT_TEST_INSERT_CONFIRMED
```

Wenn Migration fehlschlaegt:

```text
Fehler auswerten, keine Writes bauen.
```
