# RDAP 0.2.58G - Media Index Diff Effective Change Counts

## Zweck

0.2.58G macht die Diff-Ausgabe klarer.

Nach 0.2.58F war korrekt sichtbar:

```text
changedOnAgentCount = 120
hardChangedOnAgentCount = 0
softModifiedAtOnlyCount = 120
```

`changedOnAgentCount` blieb aus Kompatibilitaet streng und enthielt Soft-Timestamp-Offsets. Das war fachlich korrekt, aber missverstaendlich.

## Route

Unveraendert:

```text
GET /api/remote/media/index/diff/status
```

## Aenderung

Neue klare Zaehlungen:

```text
strictChangedOnAgentCount
strictUnchangedCount
effectiveChangedOnAgentCount
effectiveUnchangedCount
effectiveNoopChangedOnAgentCount
```

Bedeutung:

- `strictChangedOnAgentCount`: alle strengen Changes inkl. Soft-Timestamp-Offsets.
- `effectiveChangedOnAgentCount`: nur harte Changes, die fuer spaetere Upsert-Planung relevant sind.
- `effectiveUnchangedCount`: echte Unchanged + Soft-Timestamp-only Matches.
- `effectiveNoopChangedOnAgentCount`: Soft-Timestamp-only Matches.

Neue Previews:

```text
previews.strictChangedOnAgent
previews.softChangedOnAgent
previews.effectiveChangedOnAgent
```

`changedOnAgentCount` und `previews.changedOnAgent` bleiben kompatibel erhalten.

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
- `docs/current/RDAP_0.2.58G_MEDIA_INDEX_DIFF_EFFECTIVE_CHANGE_COUNTS.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58G.md`
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
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .counts.strictChangedOnAgentCount, .counts.effectiveChangedOnAgentCount, .counts.effectiveUnchangedCount, .counts.effectiveNoopChangedOnAgentCount, .previews.effectiveChangedOnAgent[0], .previews.softChangedOnAgent[0]'
```

## Erwartung

Bei aktuellem Stand:

```text
strictChangedOnAgentCount = 120
effectiveChangedOnAgentCount = 0
effectiveUnchangedCount = 120
effectiveNoopChangedOnAgentCount = 120
```

## Naechster Schritt

Wenn `effectiveChangedOnAgentCount=0`, ist kein Delta-Upsert noetig. Danach kann ein gated Delta-Upsert nur fuer echte Hard-Changes separat geplant werden.
