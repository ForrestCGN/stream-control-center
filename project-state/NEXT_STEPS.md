# NEXT_STEPS

## Naechster Schritt

Webserver-Diff nach 0.2.58G testen und Effective-Counts bewerten.

Ziel:
- Erwartung pruefen:
  - `strictChangedOnAgentCount = 120`
  - `effectiveChangedOnAgentCount = 0`
  - `effectiveUnchangedCount = 120`
  - `effectiveNoopChangedOnAgentCount = 120`
- Wenn `effectiveChangedOnAgentCount=0`, kein Delta-Upsert noetig.
- Kein Tombstone/Delete.

## Danach

- Gated Delta-Upsert fuer echte Hard-Changes separat planen.
- Tombstone/`deleted=1` fuer fehlende Dateien separat planen.
- Online->Agent Queue separat und nur mit expliziten Permission-/Audit-/Confirm-Gates planen.
