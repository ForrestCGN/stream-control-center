# NEXT_STEPS

## Naechster RDAP-Schritt nach 0.2.58O

`RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW`

Ziel:

- Preview-Route fuer normale persistente Missing/Tombstone-Kandidaten bauen.
- Nur read-only Preview.
- Kein DB-Write.
- Kein Execute-Write in diesem Step, ausser Forrest gibt dafuer ausdruecklich einen getrennten Scope frei.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.

## Ausgangspunkt

0.2.58N ist bestaetigt:

```text
statusApiVersion = rdap_media_index_diff_reliability_note_fix_058n.v1
routeBuild = RDAP_0.2.58N_MEDIA_INDEX_DIFF_RELIABILITY_NOTE_FIX
readOnly = true
```

0.2.58O hat den gated Tombstone-Plan dokumentiert.

## Wichtig

Tombstone/Delete fuer normale persistente Media-Dateien erst mit eigenem Gate-/Confirm-/Audit-/Lock-/Backup-/Readback-Step.

## Arbeitswechsel

Alert-Arbeiten nicht mit RDAP vermischen; fuer Alert-System zuerst Masterprompt und relevante GitHub/dev-Dateien lesen.
