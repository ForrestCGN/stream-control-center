# NEXT_STEPS

## Naechster RDAP-Schritt nach 0.2.59

Zuerst 0.2.59 lokal installieren, `stepdone.cmd` ausfuehren und auf dem Webserver deployen/testen.

Webserver-Deploy:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION dev
```

Tests:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .readOnly, .reliability.missingOnAgentReliable, .missingClassification.persistentMediaMissingCandidateCount'

curl -fsS http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/preview | jq '.statusApiVersion, .routeBuild, .readOnly, .writeEnabled, .executeRoutePrepared, .databaseWriteExecuted, .counts, .note'

curl -fsS -X POST http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/execute -H 'Content-Type: application/json' -d '{}' | jq '.statusApiVersion, .routeBuild, .ok, .reason, .writeExecuted, .databaseWriteExecuted, .softDeleteExecuted'
```

Erwartung fuer Execute ohne Body:

```text
ok = false
reason = confirm_write_required
writeExecuted = false
databaseWriteExecuted = false
softDeleteExecuted = false
```

## Danach moeglich

`RDAP_0.2.60_MEDIA_INDEX_DELTA_UPSERT_GATED_PLAN`

Ziel:

- Gated Delta-Upsert fuer echte Hard-Changes sauber planen.
- Kein Auto-Upsert.
- Kein Online->Agent-Trigger.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
