# STEP271 - Sound-Pegel eigenes Dashboard-Modul

Stand: 2026-05-21

## Ziel

Der Pegel-Scan ist aus dem Sound-System-Tab herausgewachsen. Er wird deshalb als eigenes Dashboard-Modul unter `System` gefuehrt.

## Geaendert

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
```

## Funktional

- Neues Dashboard-Panel `soundLevelModule` mit `data-module-panel="sound_level"`.
- `sound_levelscan.js` registriert sich als eigenes Dashboard-Modul `sound_level`.
- Anzeige unter `System -> Sound-Pegel`.
- Sound-System-Tab bleibt dadurch uebersichtlicher.
- Backend-Routen bleiben unveraendert unter `/api/sound/loudness/*`.

## Nicht geaendert

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
app.sqlite
config/**
Sound-Dateien
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
Streamer.bot-Flows
Overlay-HTML
```

## Tests

```powershell
node --check htdocs\dashboard\modules\sound_levelscan.js
```

Dashboard-Test:

```text
Dashboard oeffnen
System -> Sound-Pegel
Status laden
Scan starten
Korrektur-Vorschau anzeigen
Zurueck zu System -> Sound-System pruefen, dass das Sound-System weiterhin normal laedt
```
