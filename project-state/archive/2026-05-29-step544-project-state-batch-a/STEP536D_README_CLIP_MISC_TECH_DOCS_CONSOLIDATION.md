# STEP536D_README_CLIP_MISC_TECH_DOCS_CONSOLIDATION

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Restliche technische STEP-Dokus aus README/Clip/Misc/Overlay/Dashboard werden konsolidiert.

## Konsolidiert nach

```text
docs/system-inspection/README_CLIP_MISC_TECH_HISTORY_CONSOLIDATED.md
```

## Gerettete Leitplanken

- Clip README-Dateien sind alte Ausführungs-/Testnotizen, nicht aktuelle Produktivvorgabe.
- Twitch EventSub -> Loyalty Bridge: Punkteberechnung bleibt in `loyalty.js`.
- EventSub Duplicate-Schutz bevorzugt `metadata.message_id`.
- Loyalty Bridge bleibt im Shadow-Modus, solange `mode=shadow`.
- Diagnostic-/Bridge-Overlay-Dokus nicht als Produktivpfad behandeln.
- Alte README_STEP-Dokus nicht blind ausführen.

## Bewusst nicht gemacht

- keine Runtime-Datei geändert
- keine Config geändert
- keine DB/Secrets angefasst
- keine Module-Doku gelöscht
- keine Archive gelöscht
