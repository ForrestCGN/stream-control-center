# NEXT_STEPS

## Naechster RDAP-Schritt

`RDAP_0.2.58L_MEDIA_INDEX_TTS_LEGACY_DB_CLEANUP_PLAN_READONLY`

Ziel:

- Alte TTS-generated DB-Eintraege read-only als Cleanup-Kandidaten planen.
- Keine direkte Bereinigung.
- Kein DB-Write.
- Kein Upsert.
- Kein Timestamp-Schreiben.
- Kein Tombstone/Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.

## Ausgangspunkt

0.2.58K ist bestaetigt:

```text
statusApiVersion = rdap_media_index_diff_exclude_tts_generated_sync_058k.v1
routeBuild = RDAP_0.2.58K_MEDIA_INDEX_EXCLUDE_TTS_GENERATED_FROM_SYNC
readOnly = true
writeEnabled = false
```

TTS-generated Dateien unter:

```text
sounds/tts/generated/**
```

werden ab 0.2.58K aus dem Agent-Media-Sync ausgeschlossen.

Alter DB-Eintrag bleibt als Legacy-/Temp-Diagnose sichtbar:

```text
tts_generated_excluded_from_sync_legacy_candidate
```

## Wichtig

Tombstone/Delete bleibt nur Diagnose bis zu einem eigenen Gate-/Confirm-/Audit-/Lock-Step mit Readback.

## Arbeitswechsel

Alert-Arbeiten nicht mit RDAP vermischen; fuer Alert-System zuerst Masterprompt und relevante GitHub/dev-Dateien lesen.
