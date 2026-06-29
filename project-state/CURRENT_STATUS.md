# CURRENT_STATUS

Aktueller Stand: `0.2.58I - Media Full-Sync Read-only Compare Snapshot`

## Inhalt

0.2.58I erweitert den Remote-Modboard/RDAP Media-Index-Diff um einen read-only Full-Sync-Compare-Snapshot.

Der Webserver puffert valide `media_inventory_full_sync_chunk`-Payloads temporaer in-memory und stellt daraus nach vollstaendigem Empfang eine vollstaendige Vergleichsbasis fuer die Diff-Route bereit.

## Statusmarker

```text
rdap_media_index_diff_full_sync_compare_snapshot_058i.v1
RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT
```

Agent Runtime:

```text
rdap_agent_media_full_sync_compare_snapshot_058i.v1
RDAP_0.2.58I_MEDIA_FULL_SYNC_READONLY_COMPARE_SNAPSHOT
```

## Wichtige Route

```text
GET /api/remote/media/index/diff/status
```

Neuer Diagnoseblock:

```text
fullSyncCompare
```

## Sicherheit

Keine DB-Writes, kein Upsert, kein Timestamp-Schreiben, kein Tombstone, kein physisches Loeschen, keine Upload/Edit/Delete-Funktion, keine Online->Agent-Dateiaktionen, kein Agent-Trigger, keine Datei-Inhalte, keine absoluten Pfade.

## Hinweis

`fullSyncCompare.available` ist nach Webserver-Restart/Deploy erst `true`, wenn der lokale Agent einen vollstaendigen neuen Full-Sync gesendet hat. Das ist korrekt, weil der Snapshot in-memory ist.
