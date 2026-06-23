# NEXT STEPS

Stand: RDAP6F_AUTH_DB_INTEGRATION_PLAN  
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
RDAP6G_AUTH_BACKEND_READONLY_DB_LAYER
```

Ziel:

```text
Remote-Modboard bekommt eine sichere interne read-only DB-Schicht, um Auth-/Rollen-/Gruppen-/Permission-Modell-Daten aus MariaDB zu lesen und ueber Diagnose-/Modellrouten auszugeben.
```

RDAP6G darf weiterhin nicht aktivieren:

```text
kein Login
keine Cookies
keine Sessions
keine Schreibaktionen
keine Locks schreiben
keine Audit-Eintraege schreiben
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
```

## Voraussichtlich betroffene Dateien fuer RDAP6G

Vor Umsetzung muessen diese Dateien vollstaendig aus GitHub/dev geprueft werden:

```text
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
```

Voraussichtlich neue Dateien:

```text
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/routes/auth-model.routes.js
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
