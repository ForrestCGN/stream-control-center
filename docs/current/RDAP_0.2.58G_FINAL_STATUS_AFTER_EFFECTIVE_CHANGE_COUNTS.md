# RDAP 0.2.58G - Final Status after Effective Change Counts

## Ergebnis

0.2.58G wurde getestet und ist funktional korrekt.

Getestete Route:

```text
GET /api/remote/media/index/diff/status
```

Statusmarker:

```text
rdap_media_index_diff_effective_change_counts_058g.v1
RDAP_0.2.58G_MEDIA_INDEX_DIFF_EFFECTIVE_CHANGE_COUNTS
```

## Bestaetigter Webserver-Befund

Die Route liefert:

```text
status = diff_available_agent_snapshot_truncated
agentSnapshotDiagnostic.reason = agent_snapshot_available
agentSnapshotDiagnostic.mediaInventoryItems = 120
agentSnapshotDiagnostic.mediaInventoryTotalSeen = 333
agentSnapshotDiagnostic.mediaInventoryTruncated = true
```

Counts:

```text
agentTotal = 120
remoteDbTotal = 333
matchedCount = 120
newOnAgentCount = 0
changedOnAgentCount = 120
strictChangedOnAgentCount = 120
hardChangedOnAgentCount = 0
effectiveChangedOnAgentCount = 0
softChangedOnAgentCount = 120
softModifiedAtOnlyCount = 120
effectiveNoopChangedOnAgentCount = 120
unchangedCount = 0
strictUnchangedCount = 0
effectiveUnchangedCount = 120
missingOnAgentCount = null
missingOnAgentReliable = false
```

Interpretation:

- Es gibt aktuell keine echten Hard-Changes.
- Kein Delta-Upsert ist noetig.
- Die 120 strict changes sind ausschliesslich bekannte `modifiedAt`-Offsets.
- `modifiedAt` darf aktuell nicht als alleiniges hartes Delta-Kriterium fuer Upsert genutzt werden.
- Missing/Tombstone ist nicht belastbar, weil der Compact-Agent-Snapshot trunciert ist: 120 returned / 333 totalSeen.
- Full-Sync sieht dagegen 332/333 Items, ist aber weiterhin write-blocked/gate-geschuetzt.

## Warum 0.2.58G noetig war

0.2.58F zeigte:

```text
changedOnAgentCount = 120
hardChangedOnAgentCount = 0
softModifiedAtOnlyCount = 120
```

`changedOnAgentCount` blieb kompatibel strict und konnte missverstanden werden. 0.2.58G trennt daher:

- Strict-Counts: technische Roh-Changes inklusive Soft-Timestamp-Offsets.
- Effective-Counts: wirklich relevante Hard-Changes fuer spaetere Upsert-Planung.

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

## Naechster sinnvoller Schritt

`RDAP_0.2.58H_MEDIA_INDEX_DIFF_FULL_SYNC_EFFECTIVE_COMPARE_PLAN`

Ziel:

- Klaeren, warum Compact-Agent-Snapshot nur 120 Items returned, aber 333 totalSeen meldet.
- Full-Sync-/DB-Basis fuer spaetere belastbare Missing-/Tombstone-Bewertung planen.
- Kein Write.
- Kein Upsert.
- Kein Tombstone/Delete.
- Kein Online->Agent-Trigger.

Wichtig: Solange `effectiveChangedOnAgentCount=0`, ist Delta-Upsert fuer Hard-Changes aktuell nicht noetig.
