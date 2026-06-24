# NEXT STEPS - stream-control-center

Stand: RDAP11C_LOCK_AUDIT_LIVE_TEST_DOCS
Datum: 2026-06-24

## Naechster sinnvoller Schritt

```text
RDAP12_LOCK_AUDIT_SCHEMA_COMPATIBILITY_PLAN
```

## Ziel RDAP12

Das reale MariaDB-Schema von `dashboard_locks` und `dashboard_audit_log` mit dem RDAP9/RDAP10/RDAP11-Erwartungsmodell abgleichen.

RDAP12 soll klaeren:

- welche bestehenden Spalten bereits nutzbar sind
- welche geplanten Felder gemappt werden koennen
- welche Felder fehlen
- ob Erweiterung, Kompatibilitaetslayer oder neues Schema sinnvoll ist
- welche Migration spaeter noetig waere
- welche Migration zwingend Backup/Rollback braucht
- welche Writes danach erst erlaubt werden duerfen
- wie alte Daten erhalten bleiben

## RDAP12 darf NICHT

- Login aktivieren
- OAuth aktivieren
- Cookies setzen
- Sessions erstellen
- Sessions verlaengern
- DB-Writes ausfuehren
- Tabellen aendern
- Migrationen ausfuehren
- Remote-Writes bauen
- Agent-Actions aktivieren
- Secrets ausgeben oder loggen

## Spaetere Server-Script-Regel

Bei jedem Server-Deploy mit Service-Neustart:

- Backup erstellen
- Syntaxcheck vor Deploy
- Deploy
- Syntaxcheck live
- `systemctl restart`
- Readiness-Wait/Retry auf Port/Statusroute
- erst danach API-Tests
- OAuth/Write-Safety erneut pruefen

Keine riesigen unsicheren Server-Bloecke, wenn ein kompakter Block oder ein Scriptfile robuster ist.
