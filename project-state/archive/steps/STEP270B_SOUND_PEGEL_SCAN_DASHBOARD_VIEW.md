# STEP270B - Sound Pegel-Scan Dashboard View

Datum: 2026-05-21

## Ziel

Den bestehenden Read-only Sound Loudness Scanner aus STEP270A/STEP270A1 im vorhandenen Sound-Dashboard sichtbar und bedienbar machen.

Der Tab heißt bewusst `Pegel-Scan`, nicht `Lautheit`, weil das im Dashboard verständlicher klingt.

## Umsetzung

Neue Dashboard-Dateien:

```text
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
```

Geänderte Einbindung:

```text
htdocs/dashboard/index.html
```

Der neue JS-Client hängt sich in das bestehende Sound-System-Modul ein:

```text
System -> Sound-System -> Pegel-Scan
```

Es wird keine neue Hauptnavigation und keine Parallel-UI gebaut.

## Funktionen

- Scanner-Status anzeigen
- Zielwerte anzeigen
- letzten Scan anzeigen
- Scan starten
- Ergebnisse laden
- Ergebnislimit einstellen
- Scanlimit einstellen
- Status filtern: alle/ok/warning/error
- Dateipfad-Suche
- Sortierung nach:
  - empfohlener Gain
  - LUFS
  - True Peak
  - empfohlenes Volume
  - Dateiname
  - Scan-Zeit
- Warnungen lesbarer anzeigen:
  - `true_peak_above_limit` -> True Peak über Limit
  - `large_negative_gain` -> viel zu laut
  - `volume_cap_reached` -> Volume-Cap erreicht

## Genutzte APIs

```text
GET  /api/sound/loudness/status
POST /api/sound/loudness/scan
GET  /api/sound/loudness/results
```

## Bewusst nicht geändert

```text
app.sqlite
config/**
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
backend/modules/alert_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
Streamer.bot-Flows
Overlay-HTML
Sound-System Queue-/Prioritaetslogik
Discord-Routing
Alert-Bundle-Lock-Logik
```

## Tests

Syntax:

```powershell
node --check htdocs\dashboard\modules\sound_levelscan.js
```

API vor Dashboard:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/status" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/results?limit=50&order=recommended_gain_db&dir=desc" | ConvertTo-Json -Depth 80
```

Dashboard:

```text
Sound-System öffnen
Tab Pegel-Scan prüfen
Scan starten
Filter/Suche/Sortierung prüfen
```

## Nächster Schritt

Nach UI-Test entscheiden, ob STEP270C als optionale Playback-Korrektur geplant wird.

Wichtig: Keine Originaldateien automatisch überschreiben.
