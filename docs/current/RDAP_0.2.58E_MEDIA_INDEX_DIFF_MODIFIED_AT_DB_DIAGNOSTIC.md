# RDAP 0.2.58E - Media Index Diff ModifiedAt DB Diagnostic

## Zweck

0.2.58E erweitert die read-only Diff-Diagnose um genaue `modifiedAt`-Vergleichswerte.

Nach 0.2.58D war der Agent-Snapshot wieder verfuegbar:

```text
agent_snapshot_available
agentTotal = 120
matchedCount = 120
changedOnAgentCount = 120
changeReasonCounts.modified_at_changed = 120
```

Damit ist klar: IDs/Paths/Size/Kind matchen, aber `modifiedAt` weicht bei allen 120 vergleichbaren Agent-Items ab.

## Route

Unveraendert:

```text
GET /api/remote/media/index/diff/status
```

## Aenderung

`changedOnAgent` Preview zeigt bei `modified_at_changed` zusaetzlich:

```text
agentModifiedAt
dbModifiedAt
modifiedAtDeltaMs
modifiedAtDeltaAbsMs
modifiedAtToleranceMs
```

`counts` enthaelt zusaetzlich:

```text
modifiedAtDeltaStats.count
modifiedAtDeltaStats.minMs
modifiedAtDeltaStats.maxMs
modifiedAtDeltaStats.avgMs
modifiedAtDeltaStats.minAbsMs
modifiedAtDeltaStats.maxAbsMs
modifiedAtDeltaStats.avgAbsMs
modifiedAtDeltaStats.allPositive
modifiedAtDeltaStats.allNegative
modifiedAtDeltaStats.mixedSigns
modifiedAtDeltaStats.toleranceMs
```

## Sicherheit

- Keine DB-Writes.
- Kein Upsert.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Online->Agent-Dateiaktion.
- Keine Upload/Edit/Delete-Funktion.
- Kein Agent-Trigger.

## Geaenderte Dateien

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `docs/current/RDAP_0.2.58E_MEDIA_INDEX_DIFF_MODIFIED_AT_DB_DIAGNOSTIC.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58E.md`
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
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .counts.modifiedAtDeltaStats, .previews.changedOnAgent[0]'
```

## Naechster Schritt

Anhand der Delta-Stats entscheiden, ob `modifiedAt` als Delta-Kriterium taugt oder fuer den ersten gated Delta-Upsert anders gewichtet werden muss.
