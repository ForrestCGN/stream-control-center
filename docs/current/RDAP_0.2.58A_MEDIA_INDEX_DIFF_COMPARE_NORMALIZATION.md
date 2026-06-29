# RDAP 0.2.58A - Media Index Diff Compare Normalization

## Zweck

0.2.58A schaerft die read-only Diff-Diagnose aus 0.2.58 nach.

Der erste Webserver-Test zeigte, dass alle 120 gematchten Agent-Items als `changedOnAgent` bewertet wurden. Das war fuer die naechste Delta-Planung zu streng bzw. nicht belastbar genug.

0.2.58A normalisiert deshalb den Metadatenvergleich robuster, ohne Writes zu aktivieren.

## Route

Unveraendert:

```text
GET /api/remote/media/index/diff/status
```

## Aenderung

Der Vergleich in `remote-modboard/backend/src/routes/media-index-diff.routes.js` wird robuster:

- `sizeBytes` wird numerisch vergleichbar gemacht.
- `kind` wird normalisiert verglichen.
- `modifiedAt` wird als Timestamp verglichen.
- kleine Zeit-/DB-Praezisionsabweichungen werden toleriert.
- nicht vergleichbare Metadaten markieren nicht blind `changed`, sondern erzeugen Warnungen.

Neue/geschaerfte Ausgaben:

```text
counts.metadataCompareWarnings
counts.changeReasonCounts
comparePolicy
previews.changedOnAgent[].changeReasons
previews.*[].metadataWarnings
```

Moegliche Gruende:

```text
size_changed
modified_at_changed
kind_changed
size_uncomparable
modified_at_uncomparable
```

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
- `docs/current/RDAP_0.2.58A_MEDIA_INDEX_DIFF_COMPARE_NORMALIZATION.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58A.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Tests lokal

```powershell
node --check .emote-modboardackend\srcoutes\media-index-diff.routes.js
git status
```

## Tests Webserver nach Deploy

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .counts, .comparePolicy, .reliability, .previews.changedOnAgent[0]'
```

Erwartet:

```text
statusApiVersion = rdap_media_index_diff_compare_normalization_058a.v1
routeBuild = RDAP_0.2.58A_MEDIA_INDEX_DIFF_COMPARE_NORMALIZATION
readOnly = true
writeEnabled = false
```

## Naechster Schritt

Wenn der Diff nun plausible Changed-/Unchanged-Werte liefert: gated Delta-Upsert separat planen. Tombstone/Loeschstatus bleibt getrennt und braucht ein eigenes Gate/Confirm/Audit/Lock/Readback-Konzept.
