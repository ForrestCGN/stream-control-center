# NEXT STEPS - stream-control-center

Stand: RDAP12_LOCK_AUDIT_SCHEMA_COMPATIBILITY_PLAN
Datum: 2026-06-24

## Naechster sinnvoller Schritt

```text
RDAP13_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_PLAN
```

## Ziel RDAP13

Read-only Adapter-Konzept fuer das reale Lock-/Audit-Schema vorbereiten.

RDAP13 soll planen:

- wie `dashboard_locks` reales Schema auf internes Lock-Modell gemappt wird
- wie `dashboard_audit_log` reales Schema auf internes Audit-Modell gemappt wird
- welche Felder mandatory/optional sind
- wann produktive Writes blockiert bleiben muessen
- welche Diagnose-Ausgabe sinnvoll ist
- wie spaeter Migration vorbereitet werden kann, ohne bestehende Daten zu gefaehrden

## Alternative

```text
RDAP13_LOCK_AUDIT_SCHEMA_DUMP_READONLY_DOCS
```

Nur falls vor Adapter-Plan ein detaillierter INFORMATION_SCHEMA-Dump dokumentiert werden soll.

## RDAP13 darf NICHT

- Login aktivieren
- OAuth aktivieren
- Cookies setzen
- Sessions erstellen
- Sessions verlaengern
- DB-Writes ausfuehren
- Migrationen ausfuehren
- Tabellen aendern
- Remote-Writes bauen
- Agent-Actions aktivieren
- Secrets ausgeben oder loggen
