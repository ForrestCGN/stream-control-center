# NEXT_STEPS

## Naechster RDAP-Schritt nach 0.2.58N

Persistente Media-Tombstones bleiben separater Scope.

Moeglicher naechster Step:

```text
RDAP_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_FLOW
```

Ziel:

- Normale lokal geloeschte persistente Media-Dateien nur bei belastbarer Missing-Diagnose behandeln.
- Kein Auto-Delete.
- Tombstone/Delete nur mit eigenem Gate-/Confirm-/Audit-/Lock-/Backup-/Readback-Step.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.

## Voraussetzung

Vor einem Write-Step muss die Diff-Route echte Kandidaten zeigen:

```text
persistentMediaMissingCandidateCount > 0
tombstoneCandidateDiagnosticCount > 0
missingOnAgentReliable = true
```

Wenn keine Kandidaten vorhanden sind, ist kein Tombstone-Write-Step noetig.

## Arbeitswechsel

Alert-Arbeiten nicht mit RDAP vermischen; fuer Alert-System zuerst Masterprompt und relevante GitHub/dev-Dateien lesen.
