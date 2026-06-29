# RDAP 0.2.58B - Media Index Diff Agent Empty Unreliable

## Zweck

0.2.58B schaerft die Reliability-Logik der read-only Diff-Diagnose nach.

Der Webserver-Test nach 0.2.58A zeigte einen leeren Agent-Snapshot:

```text
agentTotal: 0
remoteDbTotal: 333
missingOnAgentCount: 333
missingOnAgentReliable: true
```

Das darf nicht als belastbarer Loesch-/Tombstone-Status gelten.

## Route

Unveraendert:

```text
GET /api/remote/media/index/diff/status
```

## Aenderung

Wenn der Agent-Snapshot leer oder nicht verfuegbar ist, wird er als unzuverlaessig markiert:

```text
agentSnapshotUnavailable=true
missingOnAgentReliable=false
missingOnAgentCount=null
status=diff_available_agent_snapshot_unavailable
```

Kriterien:

- Agent-Inventar nicht aktiv
- keine Agent-Items
- kein plausibler `lastMediaInventorySyncAt`

## Sicherheit

- Keine DB-Writes.
- Kein Upsert.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Online->Agent-Dateiaktionen.
- Keine Upload/Edit/Delete-Funktion.

## Geaenderte Dateien

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `docs/current/RDAP_0.2.58B_MEDIA_INDEX_DIFF_AGENT_EMPTY_UNRELIABLE.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58B.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Tests lokal

```powershell
node --check .\remote-modboard\backend\src\routes\media-index-diff.routes.js
git status
```

## Tests Webserver nach Deploy

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .status, .counts, .reliability'
```

Erwartet bei leerem Agent-Snapshot:

```text
statusApiVersion = rdap_media_index_diff_agent_empty_unreliable_058b.v1
routeBuild = RDAP_0.2.58B_MEDIA_INDEX_DIFF_AGENT_EMPTY_UNRELIABLE
status = diff_available_agent_snapshot_unavailable
counts.missingOnAgentCount = null
counts.missingOnAgentReliable = false
reliability.agentSnapshotUnavailable = true
```

## Naechster Schritt

Erst Agent-Snapshot-Verfuegbarkeit klaeren oder erneuten Agent-Sync abwarten. Danach Diff-Ergebnis erneut pruefen. Gated Delta-Upsert bleibt separat; Tombstone/Loeschstatus bleibt getrennt und braucht ein eigenes Gate/Confirm/Audit/Lock/Readback-Konzept.
