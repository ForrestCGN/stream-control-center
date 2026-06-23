# NEXT STEPS

Stand: RDAP6I_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK  
Datum: 2026-06-23

## Aktueller Stand

Fertig und dokumentiert:

```text
RDAP5I Remote-Modboard Node-Basisdienst read-only live
RDAP5J Remote Node Monitoring/Hardening
RDAP4B -> RDAP5C3 Remote-Agent Rollen/Gruppen-Korrektur
RDAP6D Testdatenbanklauf auf Webserver bestanden
RDAP6E Test-DB-Auswertung dokumentiert
RDAP6F Auth DB Integration Plan dokumentiert
RDAP6G Auth Backend Read-only DB Layer vorbereitet
RDAP6H Remote read-only Auth-Model Deploy/Test live bestanden
RDAP6I Auth DB Production Migration Runbook dokumentiert
```

## RDAP6H Ergebnis

Live bestaetigt:

```text
Service active
moduleBuild RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST
GET /api/remote/routes OK
GET /api/remote/auth/model OK
database.reachable true
readOnly true
writeEnabled false
migrationEnabled false
authEnabled false
sessionCreationEnabled false
schema.ready false
```

`schema.ready=false` ist korrekt, bis die RDAP6C-Tabellen in `c3stream_control` produktiv angelegt werden.

## RDAP6I Ergebnis

RDAP6I dokumentiert nur das sichere Runbook fuer eine spaetere Produktiv-Migration.

Wichtig:

```text
Keine SQL-Ausfuehrung.
Keine produktive Migration.
Keine Auth-Aktivierung.
Keine Session-Erstellung.
Keine Remote-Writes.
Keine Agent-Actions.
```

## Sofort naechster sinnvoller Schritt

```text
RDAP6J_AUTH_DB_PRODUCTION_MIGRATION_EXECUTION_PRECHECK
```

Ziel:

```text
Vor einer echten Migration auf dem Webserver pruefen:
- Ziel-DB ist c3stream_control
- DB-User ist c1stream_control
- SQL-Dateien aus GitHub/dev sind vorhanden
- Backup-Ziel ist klar
- Backup kann erstellt werden
- Restore-/Rollback-Weg ist klar
- Validation-Datei ist vorhanden
- /api/remote/auth/model ist weiterhin read-only erreichbar
```

RDAP6J darf noch keine SQL-Dateien ausfuehren, ausser Forrest gibt ausdruecklich ein separates Go fuer echte Produktivmigration.

## Spaeter, nicht jetzt

```text
RDAP6K_AUTH_DB_PRODUCTION_MIGRATION_EXECUTION
RDAP7_LOGIN_SESSION_CONCEPT
```

Produktive Migration erst mit Backup, Restore-Weg, Validation und separatem Go.

## Arbeitsregel

Nur EIN Arbeitsort pro Schritt. Keine Server-/PowerShell-/DB-Schritte mischen.
