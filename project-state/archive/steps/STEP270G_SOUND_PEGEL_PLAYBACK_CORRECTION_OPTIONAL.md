# STEP270G - Sound Pegel-Playback-Korrektur optional

Stand: 2026-05-21

## Ziel

Optionale Pegel-Korrektur zentral im Sound-System vorbereiten und anwenden, wenn sie im Dashboard explizit aktiviert wurde.

## Geaendert

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
```

## Funktion

- `sound_system.js` liest die gespeicherten Pegel-Korrektur-Einstellungen aus `sound_loudness_settings`.
- Die Korrektur ist standardmaessig AUS.
- Aktiv wird sie nur, wenn `enabled=true` und `mode=ready` gesetzt ist.
- Beim Normalisieren eines Sound-Items wird die letzte Messung aus `sound_loudness_files` gelesen.
- Die Item-Volume wird anhand Ziel-LUFS, Max Volume, Max Boost/Max Cut und True-Peak-Schutz angepasst.
- Originaldateien werden nicht veraendert.
- TTS-/Speech-Dateien werden weiter ausgeschlossen, wenn `excludeTts=true`.
- Video-Items und generierte Beeps werden nicht korrigiert.
- Die Korrektur wird im `publicItem` unter `levelCorrection` sichtbar.
- Neue Stats im Sound-System: `levelCorrected`, `levelCorrectionSkipped`, `levelCorrectionFailed`.

## Bewusst unveraendert

```text
Sound-Dateien
Normalisierte Kopien
config/**
app.sqlite neu bauen/ersetzen
Sound-System Queue-/Prioritaetslogik
Alert-Bundle-Lock
Discord-Routing
TTS-System
Streamer.bot-Flows
Overlay-HTML
```

## Test

```powershell
node --check backend\modules\sound_system.js
node --check backend\modules\sound_loudness_scanner.js
node --check htdocs\dashboard\modules\sound_levelscan.js
```

API-/Live-Test nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/correction/settings" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 80
```

Dashboard:

```text
System -> Sound-System -> Pegel-Scan
Playback-Korrektur aktivieren
Pegel-Einstellungen speichern
Sound testweise abspielen
/api/sound/status pruefen: config.levelCorrection.active=true und stats.levelCorrected steigt
```

## Hinweis

Wenn die Korrektur nicht gefaellt, kann sie im Dashboard ausgeschaltet werden. Dann bleibt nur die Vorschau erhalten und die Original-Lautstaerken werden wieder unveraendert verwendet.
