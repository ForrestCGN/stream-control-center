# NEXT_STEPS

## Naechster RDAP-Schritt nach 0.2.58K-Test

`RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_PLAN_READONLY`

Ziel:

- Alte TTS-generated DB-Eintraege read-only als Cleanup-Kandidaten planen.
- Keine direkte Bereinigung.
- Kein DB-Write.
- Kein Upsert.
- Kein Timestamp-Schreiben.
- Kein Tombstone/Delete.
- Kein Online->Agent-Trigger.

## Ausgangspunkt

0.2.58K schliesst `sounds/tts/generated/**` aus dem Agent-Media-Sync aus.

Dadurch sollen kuenftige Compact-Snapshots und Full-Sync-Chunks keine TTS-generated temp Dateien mehr enthalten.

Alte DB-Eintraege koennen weiterhin als Legacy-/Temp-Diagnose erscheinen:

```text
tts_generated_excluded_from_sync_legacy_candidate
```

## Wichtig

Tombstone/Delete bleibt nur Diagnose bis zu einem eigenen Gate-/Confirm-/Audit-/Lock-Step mit Readback.

## Arbeitswechsel

Alert-Arbeiten nicht mit RDAP vermischen; fuer Alert-System zuerst Masterprompt und relevante GitHub/dev-Dateien lesen.
