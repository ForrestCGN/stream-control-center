# NEXT_STEPS

## Naechster Schritt

`RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT`

Ziel:
- Full-Sync-Chunks read-only als temporaere Vergleichsbasis puffern.
- Diff-/Diagnose-Route optional um Full-Sync-Compare-Felder erweitern.
- Missing nur dann als reliable markieren, wenn Full-Sync-Basis vollstaendig ist.
- Keine Writes.
- Kein Upsert.
- Kein Tombstone/Delete.
- Kein Online->Agent-Trigger.

## Vorheriger klaerender Doku-Step

`RDAP_0.2.58H_MEDIA_INDEX_DIFF_FULL_SYNC_EFFECTIVE_COMPARE_PLAN`

Ergebnis:
- Compact-Agent-Snapshot ist bewusst auf WSS-Payloadgroesse begrenzt.
- Aktuelle Limits: ca. 60 KB und `[120, 80, 40, 20]`.
- Full-Sync ist separater 50er-Chunk-Transport.
- Missing/Tombstone darf nicht aus dem truncierten Compact-Snapshot abgeleitet werden.

## Wichtig

Solange `effectiveChangedOnAgentCount=0`, ist kein Delta-Upsert fuer Hard-Changes noetig.

Tombstone/Loeschstatus bleibt nur Diagnose, bis ein eigener Gate-/Confirm-/Audit-/Lock-Step freigegeben ist.
