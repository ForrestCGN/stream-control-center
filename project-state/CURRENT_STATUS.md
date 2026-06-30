# CURRENT_STATUS

Aktueller Stand: `0.2.59 - Media Index Persistent Tombstone gated Execute Foundation vorbereitet`

## Ergebnis

0.2.59 erweitert den persistenten Tombstone-Flow um eine echte, aber streng gegatete Execute-Foundation.

Statusmarker:

```text
rdap_media_index_persistent_tombstone_execute_foundation_059.v1
RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

## Routen

```text
GET  /api/remote/media/index/diff/status
GET  /api/remote/media/index/tombstone/persistent/preview
POST /api/remote/media/index/tombstone/persistent/execute
```

## Sicherheit

- Execute ist local-only.
- `confirmWrite:true` erforderlich.
- `confirmTombstone:"RDAP_0.2.59_CONFIRM_PERSISTENT_TOMBSTONE_EXECUTE"` erforderlich.
- `expectedCandidateCount` erforderlich.
- `MEDIA_INDEX_WRITE_ENABLED=true` erforderlich.
- `MEDIA_INDEX_DATA_WRITE_ENABLED=true` erforderlich.
- `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true` erforderlich.
- Nur Soft-Delete (`deleted=1`) fuer persistente Missing-Kandidaten.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.

## Webserver-Test offen

Nach `stepdone.cmd` ist wegen Remote-Code ein Webserver-Deploy noetig.

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION dev
```

Danach pruefen:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/preview | jq '.statusApiVersion, .routeBuild, .readOnly, .writeEnabled, .executeRoutePrepared, .databaseWriteExecuted, .counts, .note'

curl -fsS -X POST http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/execute -H 'Content-Type: application/json' -d '{}' | jq '.statusApiVersion, .routeBuild, .ok, .reason, .writeExecuted, .databaseWriteExecuted, .softDeleteExecuted'
```

## Naechster sinnvoller RDAP-Step

```text
RDAP_0.2.60_MEDIA_INDEX_DELTA_UPSERT_GATED_PLAN
```

Erst nach bestaetigtem 0.2.59-Webserver-Test.
