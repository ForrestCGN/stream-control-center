# RDAP 0.2.58 - Media Index Diff Diagnostic Read-only

## Zweck

0.2.58 baut die erste technische Diff-Diagnose zwischen Agent-Snapshot und `remote_media_index`.

Die Diagnose ist read-only. Sie schreibt nichts in die Datenbank, fuehrt keine Dateiaktion aus und aktiviert keine Upload/Edit/Delete-Funktion.

## Neue Route

```text
GET /api/remote/media/index/diff/status
```

## Verhalten

Die Route vergleicht:

- Agent-Media-Snapshot aus `buildAgentMediaInventoryStatusResponse()`
- Online-DB-Index `remote_media_index` per read-only `SELECT`

Ergebnis-Kategorien:

- `newOnAgent`: Agent sieht Datei, DB nicht
- `changedOnAgent`: gleiche ID, aber Metadaten abweichend
- `missingOnAgent`: DB sieht Datei, Agent nicht
- `unchanged`: Agent und DB stimmen fuer vergleichbare Eintraege ueberein

## Sicherheitsregeln

- Keine DB-Writes.
- Kein Upsert.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Online->Agent-Dateiaktionen.
- Keine Upload/Edit/Delete-Funktion.

## Preview-Regeln

Die Route gibt nur sichere Felder zurueck:

```text
id
rootKey
relativePath
kind
sizeBytes
modifiedAt
changeReasons
```

`previewLimit` ist begrenzt. Standard: 20, Maximum: 50.

## Zuverlaessigkeit

Der aktuelle Agent-Snapshot kann kompakt/gekuerzt sein. Wenn der Agent-Snapshot `truncated=true` meldet, wird `missingOnAgentCount` nicht als belastbarer Loeschstatus ausgewertet.

Dann gilt:

```text
missingOnAgentReliable=false
missingOnAgentCount=null
```

Das verhindert falsche Delete-/Tombstone-Schluesse aus einem gekuerzten Agent-Snapshot.

## Geaenderte Dateien

- `remote-modboard/backend/src/app.js`
- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `docs/current/RDAP_0.2.58_MEDIA_INDEX_DIFF_DIAGNOSTIC_READONLY.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Tests lokal

```powershell
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\src\routes\media-index-diff.routes.js
git status
```

## Tests Webserver nach Deploy

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .readOnly, .writeEnabled, .counts, .reliability'
```

Erwartet:

```text
statusApiVersion = rdap_media_index_diff_readonly_058.v1
routeBuild = RDAP_0.2.58_MEDIA_INDEX_DIFF_DIAGNOSTIC_READONLY
readOnly = true
writeEnabled = false
```

## Naechster Schritt

Gated Delta-Upsert separat planen. Tombstone/Loeschstatus bleibt getrennt und braucht ein eigenes Gate/Confirm/Audit/Lock/Readback-Konzept.
