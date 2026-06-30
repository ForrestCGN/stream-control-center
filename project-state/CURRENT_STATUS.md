# CURRENT_STATUS

Aktueller Stand: `0.2.58N - Media Index Diff Reliability Note Fix`

## Ergebnis

0.2.58N korrigiert die Reliability-Notiz der read-only Media-Index-Diff-Route.

Statusmarker:

```text
rdap_media_index_diff_reliability_note_fix_058n.v1
RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX
```

## Ausgangspunkt

Nach 0.2.58M konnte die Diff-Route gleichzeitig melden:

```text
agentSnapshotTruncated = true
fullSyncCompareMissingOnAgentReliable = true
missingOnAgentReliable = true
note = Agent-Snapshot ist gekuerzt...
```

Das war fachlich missverstaendlich, weil der vollstaendige Full-Sync-Compare die Missing-Diagnose belastbar macht, auch wenn der Compact-Agent-Snapshot gekuerzt ist.

## Aenderung

`buildReliabilityBlock()` priorisiert jetzt den vollstaendigen Full-Sync-Compare vor der Compact-Snapshot-Truncated-Notiz.

Wenn `fullSyncCompareMissingOnAgentReliable = true` gilt, meldet die Note jetzt, dass die Missing-Diagnose trotz gekuerztem Compact-Agent-Snapshot read-only belastbar ist.

## Sicherheit

- Read-only bleibt aktiv.
- Keine DB-Writes.
- Kein Tombstone-Write.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.
- Keine Upload/Edit/Delete-Funktion.

## Naechster sinnvoller RDAP-Step

Tombstone-Gate/Confirm/Audit/Lock/Readback fuer persistente Media-Dateien separat planen, aber nur als eigener Write-Step und nicht automatisch.
