# STEP270F - Sound Pegel-Scan Correction Settings Preview

Stand: 2026-05-21

## Ziel

Vorbereitung fuer eine spaetere optionale Pegel-Korrektur im Sound-System, ohne Playback, Queue, Discord-Routing oder Sound-Dateien zu veraendern.

## Geaendert

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
```

## Neu

- DB-gestuetzte Vorschau-Einstellungen fuer spaetere Playback-Korrektur.
- Neue API-Routen:

```text
GET  /api/sound/loudness/correction/settings
POST /api/sound/loudness/correction/settings
GET  /api/sound/loudness/correction/preview
```

- Dashboard-Bereich im Pegel-Scan:
  - Ziel-LUFS
  - True-Peak-Limit
  - Max Playback Volume
  - Max Boost
  - Max Cut
  - True-Peak-Schutz
  - TTS ausschliessen
- Korrektur-Vorschau zeigt zusaetzlich auto-safe / pruefen / leiser / lauter.
- Bereich fuer spaetere normalisierte Kopien vorbereitet.

## Wichtig

```text
Playback-Korrektur ist NICHT aktiv.
Normalisierte Kopien werden NICHT erzeugt.
Originaldateien werden NICHT veraendert.
Sound-System Queue/Discord/Alerts/TTS bleiben unveraendert.
```

## Datenbank

Sanfte Migration per `CREATE TABLE IF NOT EXISTS`:

```text
sound_loudness_settings
```

Die aktive `app.sqlite` wird nur erweitert, nicht ersetzt.

## Tests

```powershell
node --check backend\modules\sound_loudness_scanner.js
node --check htdocs\dashboard\modules\sound_levelscan.js

Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/correction/settings" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/correction/preview?limit=50" | ConvertTo-Json -Depth 80
```

## Naechster Schritt

STEP270G sollte nur geplant/gebaut werden, wenn die Vorschau-Einstellungen plausibel sind:

```text
Optionale Playback-Korrektur im Sound-System, standardmaessig AUS.
```
