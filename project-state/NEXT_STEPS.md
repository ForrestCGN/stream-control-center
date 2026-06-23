# NEXT STEPS

Stand: RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST  
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
RDAP6H Remote read-only Auth-Model Deploy/Test bestanden
```

## RDAP6H Ergebnis

```text
GET https://mods.forrestcgn.de/api/remote/auth/model
```

Antwortet stabil und read-only.

```text
Service aktiv: ja
database.reachable: true
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
schema.ready: false
```

`schema.ready=false` ist korrekt, solange die RDAP6C-Tabellen in `c3stream_control` noch nicht produktiv angelegt wurden.

## Sofort naechster sinnvoller Schritt

```text
RDAP6I_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK
```

Ziel:

```text
Sicheren Produktiv-Migrationsablauf fuer c3stream_control vorbereiten:
Backup, Restore-Weg, SQL-Reihenfolge, Validation, Rollback und klare Stop-Punkte.
```

RDAP6I ist zunaechst nur Planung/Runbook. Keine Migration ausfuehren.

## Weiterhin nicht erlaubt

```text
keine Produktivmigration ohne separates Go
kein Login
keine Sessions
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Secrets ins Repo oder Frontend
```

## Danach moeglich, nicht jetzt

```text
RDAP6J_AUTH_DB_PRODUCTION_MIGRATION_EXECUTION
RDAP7_LOGIN_SESSION_CONCEPT
```

Produktive Migration erst mit Backup, Restore-Weg, Validation und separatem Go.

## Arbeitsregel

Nur EIN Arbeitsort pro Schritt. Keine Server-/PowerShell-/DB-Schritte mischen.
