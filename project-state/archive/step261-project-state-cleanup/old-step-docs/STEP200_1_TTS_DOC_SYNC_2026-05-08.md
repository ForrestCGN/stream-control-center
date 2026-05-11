# STEP200.1 - TTS Doku-Sync

Stand: 2026-05-08

## Ziel

Nach STEP200 werden die zentralen Projektdateien auf den tatsaechlichen TTS-Endstand gebracht.

## Geaenderte Dateien

- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`
- `project-state/STEP200_1_TTS_DOC_SYNC_2026-05-08.md`

## Dokumentierter Endstand

### TTS Texte

- Aktive TTS-Texte liegen in `module_text_variants`.
- `module_name = 'tts'`.
- `config/tts_messages.json` bleibt Seed/Fallback.
- Mehrere aktive Varianten pro Text-Key sind moeglich.
- Backend waehlt zufaellig eine aktive Variante.
- Dashboard bearbeitet Texte ueber `/api/tts/admin/texts`.

### TTS Dashboard

- `htdocs/dashboard/modules/tts.js`
- `htdocs/dashboard/modules/tts.css`
- Tab `Texte` ist vorhanden.

### TTS Architektur

```text
Dashboard liest/schreibt nur ueber Backend-APIs.
DB ist aktive Wahrheit fuer dashboardfaehige Settings und Texte.
JSON bleibt Seed/Fallback/technische Boot-Konfig.
Keine separate Admin-Datei als Zielstand.
```

## Korrigierte alte Doku-Aussagen

- `TTS-Texte spaeter migrieren` wurde entfernt/ersetzt.
- `Clip-Dashboard bauen` wurde als veraltet markiert, da Clip-System bereits im Dashboard vorhanden ist.
- Sound-System Overlay bleibt nur noch bei konkretem Fehler als Pruefpunkt offen.

## Keine Code-Aenderung

Dieser STEP ist reine Dokumentation.
