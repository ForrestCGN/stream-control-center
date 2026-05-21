# STEP272C - Sound-Pegel Config-Seite

Stand: 2026-05-21

## Ziel

Sound-Pegel bekommt eine eigene Config-Seite im Dashboard. Die wichtigsten Werte sollen zentral in SQLite gespeichert werden, ohne `config/**` oder bestehende Sound-/Alert-Daten anzufassen.

## Neu

Backend:

```text
GET  /api/sound/loudness/config
POST /api/sound/loudness/config
```

Speicherung:

```text
Tabelle: sound_loudness_settings
Key: level_config
```

Dashboard:

```text
System -> Sound-Pegel -> Config
```

Einstellbar vorbereitet:

```text
Default Playback Volume
Max Playback Volume
Upload Default Volume
Referenz-Toleranz
Standard Scan-Limit
Standard Ergebnis-Limit
Standard Referenz-Ausgabeweg
Upload-Defaults fuer Alerts, SoundAlerts/Kanalpunkte, VIP-/Mod und Sound-Presets
Massenaktion-Auswahl fuer vorhandene Sounds als Preview/Planung
```

## Nicht geaendert

```text
backend/modules/sound_system.js
config/**
Sound-Dateien
Alert-Regeln
SoundAlert-/Kanalpunkte-Daten
VIP-/Mod-Sound-Daten
Sound-Queue
Discord-Routing
TTS-System
```

## Tests

```powershell
node --check backend\modules\sound_loudness_scanner.js
node --check htdocs\dashboard\modules\sound_levelscan.js
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/config" | ConvertTo-Json -Depth 80
```

## Hinweis

Die Config-Werte werden jetzt gespeichert, aber Upload-Strecken und Massenaktionen muessen in spaeteren Steps gezielt angebunden werden.
