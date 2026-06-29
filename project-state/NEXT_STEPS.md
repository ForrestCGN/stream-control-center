# NEXT_STEPS

## Naechster Schritt

Agent-Snapshot anhand der 0.2.58C-Diagnose wieder belastbar machen bzw. Sync-Ablauf klaeren.

Ziel:
- Pruefen, ob Agent verbunden ist.
- Pruefen, ob seit Restart/Deploy ein Media-Inventory-Sync angekommen ist.
- Pruefen, ob Media-Inventory rejected wurde.
- Pruefen, ob Full-Sync-State aktuell ist.
- Keine Online->Agent-Dateiaktion.
- Keine DB-Writes.
- Erst nach belastbarem Agent-Snapshot Diff erneut bewerten.

## Danach

- Gated Delta-Upsert separat planen.
- Tombstone/`deleted=1` fuer fehlende Dateien separat planen.
- Online->Agent Queue separat und nur mit expliziten Permission-/Audit-/Confirm-Gates planen.
