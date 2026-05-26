# STEP272I – Sound-Pegel Dashboard Boost-Workflow

Datum: 2026-05-21

## Ziel

Zu leise Sound-Dateien sollen im Dashboard einzeln einstellbar, testbar und erst danach kontrolliert übernommen werden können.

## Umsetzung

- `GET /api/sound/loudness/boost/preview` liefert pro Boost-Kandidat zusätzliche Werte:
  - `maxSafeGainDb`
  - `sliderMaxGainDb`
  - `estimatedPeakAfterBoostDbtp`
  - `truePeakLimitDbtp`
  - `rawTargetGainDb`
- `POST /api/sound/loudness/boost/create-one` akzeptiert zusätzlich:
  - `gainDb`
  - `boostGainDb`
  - weiterhin `targetLufs`, `maxGainDb`, `overwrite`
- Backend begrenzt manuelle Boost-Werte gegen `boostMaxGainDb` und den geschätzten True-Peak-Headroom.
- Dashboard zeigt pro Datei einen Boost-Schieberegler mit Datei-spezifischem Maximalwert.
- Dashboard bietet Presets:
  - Referenz
  - Referenz -1 dB
  - Referenz -2 dB
  - Referenz -3 dB
  - Vorschlag
  - eigener Wert
- Originale werden weiterhin nicht beim Erzeugen verändert.
- Übernehmen/Promote bleibt separat und legt vorher ein Backup an.

## Sicherheit

- Originaldateien werden nur bei `promote/one` ersetzt.
- Boost-Kopien werden unter `htdocs/assets/sounds/normalized/...` erzeugt.
- Manuelle Boost-Werte werden serverseitig geprüft.
- Video-Dateien bleiben weiterhin nicht direkt erzeugbar.
- Keine Änderungen an `config/**`.
- `app.sqlite` wird nicht ersetzt.

## Tests

```powershell
node --check backend\modules\sound_loudness_scanner.js
node --check htdocs\dashboard\modules\sound_levelscan.js
```

## Manuelle Prüfung

1. Dashboard öffnen: `System -> Sound-Pegel -> Boost-Kopien`.
2. Boost-Preview laden.
3. Für `alerts/follow.mp3` Slider Richtung Referenz setzen.
4. Mit aktivem Overwrite Boost-Kopie erzeugen.
5. Original und Boost-Kopie über Sound-System abspielen.
6. Bei passendem Pegel Kopie übernehmen.
7. Rollback über Historie prüfen, falls nötig.
