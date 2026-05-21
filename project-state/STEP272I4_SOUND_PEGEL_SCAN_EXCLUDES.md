# STEP272I4 - Sound-Pegel Scan-Excludes für Backup/Test/Generated Dateien

## Ziel
Backup-, Test- und generierte Sound-Dateien dürfen beim normalen Sound-Pegel-Scan nicht erneut als produktive Sounds auftauchen.

## Änderung
`backend/modules/sound_loudness_scanner.js` erweitert die Standard-Exclude-Pfadsegmente um:

- `_backup_loudness`
- `normalized`
- `generated`

Zusätzlich werden ausgeschlossene Unterordner beim rekursiven Dateiscan direkt übersprungen, damit Dateien aus diesen Bereichen gar nicht erst analysiert werden.

## Wirkung
Ignoriert werden künftig u. a.:

- `htdocs/assets/sounds/_backup_loudness/**`
- `htdocs/assets/sounds/normalized/**`
- `htdocs/assets/sounds/generated/**`
- weiterhin TTS-/Cache-Pfade wie `tts`, `tts_system`, `generated_tts`, `tts_cache`

## Nicht geändert
- Keine Sounddateien gelöscht oder verändert.
- Keine Backups gelöscht.
- Keine Alert-/SoundAlert-Regeln geändert.
- Keine Dashboard-Logik geändert.
- Keine Queue-/Discord-/TTS-Logik geändert.
- Kein `config/**` geändert.

## Tests

```powershell
node --check backend\modules\sound_loudness_scanner.js
node --check htdocs\dashboard\modules\sound_levelscan.js
```

Nach Backend-Neustart:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/scan" -Body (@{ limit = 500 } | ConvertTo-Json) -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/results?limit=500" | ConvertTo-Json -Depth 80
```

Erwartung: Pfade mit `_backup_loudness/`, `normalized/` und `generated/` erscheinen nicht mehr in Scan-/Result-/Boost-Listen.
