# NEXT STEPS - stream-control-center

Stand: RDAP15_LOCK_RESOURCE_TYPE_DECISION_PLAN
Datum: 2026-06-24

## Naechster sinnvoller Schritt

```text
RDAP16_TYPED_RESOURCE_KEY_RULES_AND_ADAPTER_PLAN
```

## Ziel RDAP16

Konkrete Regeln fuer typisierte Resource-Keys planen.

RDAP16 soll klaeren:

- erlaubte `resourceType` Werte
- erlaubte Namespaces
- Format-Regeln
- Parser-/Validator-Verhalten
- Fehlergruende fuer untypisierte Keys
- Adapter-Ausgabe fuer typisierte und untypisierte Keys
- welche Dashboard-Bereiche welche Resource-Keys nutzen sollen

## RDAP16 darf NICHT

- Backend-Code aendern
- DB aendern
- Migration ausfuehren
- DB-Writes bauen
- Login aktivieren
- OAuth aktivieren
- Cookies/Sessions bauen
- Remote-Writes bauen
- Agent-Actions aktivieren
- Secrets ausgeben oder loggen
