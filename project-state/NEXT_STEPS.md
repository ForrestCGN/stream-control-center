# NEXT_STEPS

## Naechster RDAP-Schritt

`RDAP_0.2.58J_MEDIA_INDEX_TTS_TEMP_MISSING_READONLY_CLASSIFICATION`

Ziel:

- Missing-Eintraege read-only klassifizieren.
- TTS generated temp files separat erkennen.
- `sounds:tts/generated/...` als moeglichen temporaeren Missing-Kandidaten markieren.
- Tombstone-Kandidatur nur diagnostisch ausgeben.
- Keine Writes.
- Kein Upsert.
- Kein Tombstone/Delete.
- Kein Online->Agent-Trigger.

## Ausgangspunkt

0.2.58I ist bestaetigt:

```text
fullSyncCompare.available = true
fullSyncCompare.complete = true
fullSyncCompare.receivedItems = 332
fullSyncCompare.totalItems = 332
fullSyncCompare.missingOnAgentReliable = true
missingOnAgentCount = 1
hardChangedOnAgentCount = 0
effectiveChangedOnAgentCount = 0
```

Bestaetigter Missing-Eintrag:

```text
sounds:tts/generated/tts_1782718008137_a1e4181f-388c-4914-a5e3-8de78dbfcc88.mp3
```

## Wichtig

TTS-Sprachdateien sind laut Nutzer eigentlich temporaer. Trotzdem bleibt Tombstone/Delete nur Diagnose bis zu einem eigenen Gate-/Confirm-/Audit-/Lock-Step.

## Arbeitswechsel

Forrest arbeitet vorher ggf. am Alert-System. Alert-Arbeiten nicht mit RDAP 0.2.58J vermischen; fuer Alert-System zuerst Masterprompt und relevante GitHub/dev-Dateien lesen.
