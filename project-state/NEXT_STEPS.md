# NEXT_STEPS

## Naechster RDAP-Schritt nach 0.2.58P

Zuerst 0.2.58P lokal installieren, `stepdone.cmd` ausfuehren und auf dem Webserver deployen/testen.

Webserver-Deploy:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW dev
```

Tests:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .readOnly, .reliability.missingOnAgentReliable, .missingClassification.persistentMediaMissingCandidateCount'

curl -fsS http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/preview | jq '.statusApiVersion, .routeBuild, .readOnly, .writeEnabled, .executeRoutePrepared, .databaseWriteExecuted, .counts, .note'
```

## Danach moeglich

`RDAP_0.2.58Q_MEDIA_INDEX_PERSISTENT_TOMBSTONE_EXECUTE_GATED_DRY_BLOCKED`

Ziel:

- Execute-Route nur vorbereitet/gated.
- Kein Write ohne Gates + Confirm + expectedCandidateCount + Audit + Readback.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
