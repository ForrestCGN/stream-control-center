# NEXT_STEPS

## Naechster Schritt nach 0.2.58I

0.2.58I lokal testen, committen und auf dem Webserver deployen.

Danach pruefen:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .fullSyncCompare.prepared, .fullSyncCompare.readOnly, .fullSyncCompare.available, .fullSyncCompare.complete, .fullSyncCompare.receivedItems, .fullSyncCompare.totalItems, .fullSyncCompare.missingOnAgentReliable'
```

## Danach

- Full-Sync-Compare-Werte auswerten.
- DB-Read-Source UI final sichtpruefen.
- Gated Delta-Upsert fuer echte Hard-Changes separat planen.
- Tombstone/Loeschstatus nur mit eigenem Gate/Confirm/Audit/Lock planen.
- Online->Agent Queue separat planen.

## Wichtig

Auch wenn `fullSyncCompare.missingOnAgentReliable=true` wird, bleibt Tombstone/Delete nur Diagnose bis zu einem eigenen freigegebenen Write-Step.
