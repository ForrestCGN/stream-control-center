# NEXT STEPS - stream-control-center

Stand: RDAP13_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_PLAN
Datum: 2026-06-24

## Naechster sinnvoller Schritt

```text
RDAP14_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_SKELETON
```

## Ziel RDAP14

Read-only Adapter-Skeleton fuer das reale Lock-/Audit-Schema bauen.

RDAP14 soll vorbereiten:

- `lock-schema-adapter` read-only
- `audit-schema-adapter` read-only
- Diagnose-Route fuer Mapping/Kompatibilitaet
- keine Writes
- keine Migration
- keine Login-/OAuth-Aktivierung

## RDAP14 darf NICHT

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

## Pflicht fuer spaetere Server-Tests

Nach Service-Restart Readiness-Wait/Retry einbauen, bevor API-Tests laufen.
