# STEP270D1 - Sound Pegel-Scan: TTS-Dateien ausgeschlossen

Stand: 2026-05-21

## Ziel

TTS-/Speech-Dateien sollen den Pegel-Scan nicht verfälschen. Der Pegel-Scan soll echte Sound-, Alert- und Reward-Dateien bewerten, aber keine dynamischen oder temporären Sprachdateien.

## Umsetzung

Geändert:

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
```

Backend:

- Neue Standardregel `excludeTts=true`.
- Typische TTS-/Speech-Pfade werden beim Scan ausgelassen:
  - `tts`
  - `tts_system`
  - `alert_tts`
  - `generated_tts`
  - `temp_tts`
  - `tts_cache`
- Dateinamen mit typischen TTS-Präfixen wie `tts_` oder `tts-` werden ebenfalls ausgelassen.
- Die Results-Route blendet solche Einträge standardmäßig aus, damit bereits gespeicherte alte TTS-Ergebnisse nicht weiter im Dashboard auftauchen.
- Optional kann technisch mit `includeExcluded=1` geprüft werden, was ausgeschlossen wurde.

Dashboard:

- Pegel-Scan weist sichtbar darauf hin, dass TTS ausgeschlossen ist.
- Keine neue Hauptnavigation, keine neue Parallel-UI.

## Bewusst unverändert

```text
app.sqlite
config/**
backend/modules/sound_system.js
Sound-System Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System selbst
Sound-Dateien
```

## Tests

Nach Deploy:

```powershell
node --check backend\modules\sound_loudness_scanner.js
node --check htdocs\dashboard\modules\sound_levelscan.js
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/scan" -Body (@{ limit = 500 } | ConvertTo-Json) -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/results?limit=250&order=relative_path&dir=asc" | ConvertTo-Json -Depth 80
```

Erwartung:

```text
TTS-/Speech-Dateien tauchen standardmäßig nicht mehr in Scan/Results/Dashboard auf.
```
