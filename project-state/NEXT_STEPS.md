# NEXT_STEPS

## Naechster Schritt

`RDAP_0.2.58C_MEDIA_INDEX_DIFF_AGENT_SNAPSHOT_RECOVERY_OR_SYNC_TRIGGER_PLAN`

Ziel:
- Klaeren, warum der Agent-Snapshot nach Webserver-Restart/Deploy leer sein kann.
- Agent-Status/Agent-Memory read-only diagnostizieren.
- Keine Online->Agent-Dateiaktion.
- Keine DB-Writes.
- Erst nach belastbarem Agent-Snapshot Diff erneut bewerten.

## Danach

- Gated Delta-Upsert separat planen.
- Tombstone/`deleted=1` fuer fehlende Dateien separat planen.
- Online->Agent Queue separat und nur mit expliziten Permission-/Audit-/Confirm-Gates planen.
