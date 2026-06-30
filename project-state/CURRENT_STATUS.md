# CURRENT_STATUS

Aktueller Stand: `0.2.58P - Media Index Persistent Tombstone gated Preview vorbereitet`

## Ergebnis

0.2.58P ergaenzt eine read-only Preview-/Statusroute fuer normale persistente Media-Dateien, die in einem belastbaren Missing-on-Agent/Full-Sync-Compare als spaetere Tombstone-Kandidaten gelten koennen.

Statusmarker:

```text
rdap_media_index_persistent_tombstone_preview_058p.v1
RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW
```

## Neue Route

```text
GET /api/remote/media/index/tombstone/persistent/preview
```

## Sicherheit

- Read-only.
- Keine Execute-Route.
- Keine DB-Writes.
- Kein `deleted=1`.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.

## Webserver-Test offen

Nach `stepdone.cmd` ist wegen Remote-Code ein Webserver-Deploy noetig.

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW dev
```

Danach pruefen:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/preview | jq '.statusApiVersion, .routeBuild, .readOnly, .writeEnabled, .executeRoutePrepared, .databaseWriteExecuted, .counts, .note'
```

## Naechster sinnvoller RDAP-Step

```text
RDAP_0.2.58Q_MEDIA_INDEX_PERSISTENT_TOMBSTONE_EXECUTE_GATED_DRY_BLOCKED
```

Erst nach bestaetigtem Preview-Webserver-Test.
