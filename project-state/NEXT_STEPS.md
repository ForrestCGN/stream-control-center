# NEXT_STEPS

## Naechster Schritt

`RDAP_0.2.58H_MEDIA_INDEX_DIFF_FULL_SYNC_EFFECTIVE_COMPARE_PLAN`

Ziel:
- Klaeren, warum Compact-Agent-Snapshot nur 120 Items returned, aber 333 totalSeen meldet.
- Planen, wie spaeter eine belastbare Missing-/Tombstone-Bewertung nicht auf trunciertem Compact-Snapshot basiert.
- Full-Sync-/DB-Basis fuer spaetere effektive Vergleiche bewerten.
- Kein Write.
- Kein Upsert.
- Kein Tombstone/Delete.
- Kein Online->Agent-Trigger.

## Wichtig

Solange `effectiveChangedOnAgentCount=0`, ist kein Delta-Upsert fuer Hard-Changes noetig.
