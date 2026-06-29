# RDAP 0.2.58F - Media Index Diff ModifiedAt Soft-Match Policy

## Zweck

0.2.58F klassifiziert bekannte `modifiedAt`-Offset-Abweichungen als Soft-Match, wenn keine weiteren harten Unterschiede vorliegen.

Nach 0.2.58E war sichtbar:

```text
matchedCount = 120
changedOnAgentCount = 120
changeReasonCounts.modified_at_changed = 120
modifiedAtDeltaStats.allPositive = true
modifiedAtDeltaStats.minMs = 3600000
modifiedAtDeltaStats.maxMs = ca. 7200000
```

Das deutet auf Timestamp-/Timezone-/Precision-Abweichungen hin, nicht auf echte Datei-Inhaltsaenderungen.

## Route

Unveraendert:

```text
GET /api/remote/media/index/diff/status
```

## Aenderung

`modified_at_changed` wird als `soft_modified_at_offset_only` klassifiziert, wenn:

- es der einzige Change-Grund ist,
- `sizeBytes` gleich ist,
- `kind` gleich ist,
- ID/relativePath bereits matched,
- Delta nahe 1h oder 2h liegt.

Neue/erweiterte Felder:

```text
counts.hardChangedOnAgentCount
counts.softChangedOnAgentCount
counts.softModifiedAtOnlyCount
changeReasonCounts.soft_modified_at_offset_only
previews.changedOnAgent[].changeClass
previews.changedOnAgent[].modifiedAtOffsetBucket
comparePolicy.modifiedAtSoftMatchPolicyEnabled
comparePolicy.modifiedAtSoftOffsetBuckets
comparePolicy.modifiedAtSoftOffsetToleranceMs
```

## Sicherheit

- Keine DB-Writes.
- Kein Upsert.
- Kein Timestamp-Schreiben.
- Kein Tombstone/`deleted=1`.
- Kein physisches Loeschen.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Keine Online->Agent-Dateiaktion.
- Keine Upload/Edit/Delete-Funktion.
- Kein Agent-Trigger.

## Geaenderte Dateien

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `docs/current/RDAP_0.2.58F_MEDIA_INDEX_DIFF_MODIFIED_AT_SOFT_MATCH_POLICY.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58F.md`
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
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .counts.hardChangedOnAgentCount, .counts.softModifiedAtOnlyCount, .counts.changeReasonCounts, .previews.changedOnAgent[0]'
```

## Erwartung

Bei aktueller Diagnose sollte sichtbar werden:

```text
hardChangedOnAgentCount = 0
softModifiedAtOnlyCount = 120
```

## Naechster Schritt

Wenn nur Soft-Matches vorliegen, Delta-Upsert nicht blind auf `modifiedAt` starten. Erst gated Delta-Upsert fuer echte Hard-Changes planen.
