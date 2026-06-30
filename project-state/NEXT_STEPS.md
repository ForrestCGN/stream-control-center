# NEXT_STEPS

## Naechster RDAP-Schritt

`RDAP_0.2.58K_MEDIA_INDEX_TOMBSTONE_GATE_PLAN_READONLY`

Ziel:

- Tombstone-/Loeschstatus nur planen.
- Gate/Confirm/Audit/Lock/Readback-Anforderungen dokumentieren.
- Kein DB-Write.
- Kein Upsert.
- Kein Timestamp-Schreiben.
- Kein Tombstone/Delete.
- Kein Online->Agent-Trigger.

## Ausgangspunkt

0.2.58J klassifiziert Missing-Eintraege read-only:

```text
missingClassification
previews.ttsTempMissingCandidates
previews.tombstoneCandidatesDiagnostic
counts.ttsTempMissingCandidateCount
counts.tombstoneCandidateDiagnosticCount
```

Der bestaetigte Missing-Eintrag ist ein TTS-generated-temp-Kandidat:

```text
sounds:tts/generated/tts_1782718008137_a1e4181f-388c-4914-a5e3-8de78dbfcc88.mp3
```

## Wichtig

Tombstone/Delete bleibt nur Diagnose bis zu einem eigenen Gate-/Confirm-/Audit-/Lock-Step mit Readback.

## Arbeitswechsel

Alert-Arbeiten nicht mit RDAP vermischen; fuer Alert-System zuerst Masterprompt und relevante GitHub/dev-Dateien lesen.
