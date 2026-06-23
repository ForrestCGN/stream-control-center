# NEXT STEPS

Stand: RDAP6G_AUTH_BACKEND_READONLY_DB_LAYER  
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
```

## RDAP6F Entscheidung

```text
scc_rdap6_test bleibt reine Testdatenbank.
Die echte Remote-Modboard-/Auth-Ziel-DB ist c3stream_control.
DB-User bleibt c1stream_control.
```

Wichtig:

```text
RDAP6F ist nur Planung.
Keine SQL-Ausfuehrung.
Keine Auth-Aktivierung.
Keine Session-Erstellung.
Keine Remote-Writes.
Keine Agent-Actions.
```

## Sofort naechster sinnvoller Schritt

```text
RDAP6H_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK
```

Ziel:

```text
Sicheren Produktiv-Migrationsablauf fuer c3stream_control vorbereiten:
Backup, Restore-Test, SQL-Ausfuehrung, Validation, Rollback und klare Stop-Punkte.
```

Weiterhin nicht erlaubt:

```text
keine Produktivmigration ohne separates Go
kein Login
keine Sessions
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
```

## Spaeter, nicht jetzt

```text
RDAP6H_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK
RDAP6I_AUTH_DB_PRODUCTION_MIGRATION_EXECUTION
RDAP7_LOGIN_SESSION_CONCEPT
```

Produktive Migration erst mit Backup, Restore-Weg, Validation und separatem Go.

## Arbeitsregel

Nur EIN Arbeitsort pro Schritt. Keine Server-/PowerShell-/DB-Schritte mischen.

## RDAP6G Ergebnis

```text
Neue read-only Route: GET /api/remote/auth/model
Neue DB-Lese-Schicht: db.service.js + auth-db-read.service.js
Keine Auth-Aktivierung
Keine Migration
Keine Writes
```
