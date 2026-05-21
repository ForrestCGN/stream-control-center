# CURRENT_SYSTEM_STATUS

## STEP272J – Sound-Pegel Stable-Doku

Stand: 2026-05-21

Der Sound-Pegel-/Lautstärke-Workflow ist als stabiler Zwischenstand dokumentiert.

### Aktueller bestätigter Stand

- Sound-System Basis-Defaults stehen auf 80 %.
- Alert-Regeln mit fehlendem `sound_volume` wurden auf 80 gesetzt.
- SoundAlerts/Kanalpunkte mit expliziten 100 % wurden nicht pauschal geändert.
- Playback-Korrektur war für das Einpegeln deaktiviert.
- OBS/Voicemeeter wurde auf Basis der 80-%-Defaults eingepegelt.
- Sound-Pegel-Scan funktioniert nach STEP272I5 wieder.
- Scan-Excludes greifen für:
  - `normalized/`
  - `_backup_loudness/`
  - `generated/`
  - TTS-/Cache-Pfade
- Boost-Kopien werden nur testweise unter `htdocs/assets/sounds/normalized/<originalpfad>` erzeugt.
- Produktive Übernahme ersetzt das Original nur nach Backup.
- Backups liegen unter `htdocs/assets/sounds/_backup_loudness/<timestamp>/<originalpfad>`.
- Verwendungsprüfung zeigt, ob eine Datei wirklich von Alert-/SoundAlert-Daten genutzt wird.
- Unbenutzte Altdateien/Duplikate sollen nicht produktiv übernommen werden.
- Dashboard nutzt für Boost-Kopien eine Dropdown-Auswahl statt langer Liste.
- Auswahl bleibt nach Aktionen erhalten.

### Wichtige bestätigte Tests

Nach STEP272I5 lief der Scan erfolgreich:

- `discoveredFiles: 224`
- `scannedFiles: 224`
- `okFiles: 78`
- `warningFiles: 143`
- `errorFiles: 3`

Die drei Scan-Fehler sind unkritisch:

- `Timer_.mp4` → `loudness_input_i_missing`
- `leer.mp3` → `audio_stream_missing`
- `test_ping.wav` → `audio_stream_missing`

### Aktuell offene Restpunkte

- `soundalerts/video/putzen.webm` ist eine Video-Datei und wird noch nicht normalisiert.
- Video-/WebM-/MP4-Normalisierung braucht einen separaten sicheren Schritt.
- `alerts/1778330139754_Miss_Wikiki.mp3` kann noch einzeln geprüft werden, liegt aber nahe am Peak-Limit.
- Alte/unbenutzte Dateien können später optional aufgeräumt oder ausgeblendet werden.
- Stable-/Rollback-Übersicht im Dashboard kann später noch verbessert werden.

### Wichtige Regel

Original-Sounddateien werden nur ersetzt, wenn aktiv „Als Original übernehmen“ geklickt wird. Vorher wird automatisch ein Backup angelegt. Kein automatisches Massen-Ersetzen.
