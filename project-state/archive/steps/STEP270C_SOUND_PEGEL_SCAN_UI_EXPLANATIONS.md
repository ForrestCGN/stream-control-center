# STEP270C - Sound Pegel-Scan UI-Erklärungen

Stand: 2026-05-21

## Ziel

Den vorhandenen Read-only Pegel-Scan im Dashboard verständlicher und übersichtlicher machen.

## Änderungen

```text
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
```

Ergänzt wurden:

- Übersichtskacheln für OK, Warnungen, Peak zu hoch, zu laut und zu leise.
- Mouseover-Hilfen für LUFS, True Peak, Gain, Volume, Dauer, Status und Warnungen.
- Erklärungskarte `Werte kurz erklärt`.
- Schnellaktionen `Problematische zuerst`, `Lauteste zuerst`, `Leiseste zuerst`.
- Bessere optische Markierung kritischer Werte.

## Nicht geändert

```text
app.sqlite
config/**
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
Sound-Dateien
Sound-System Queue
Discord-Routing
Alert-Bundle-Lock
TTS
Streamer.bot-Flows
```

## Tests

Syntax:

```powershell
node --check htdocs\dashboard\modules\sound_levelscan.js
```

Dashboard:

```text
System -> Sound-System -> Pegel-Scan
Mouseover über Werte prüfen
Problematische zuerst prüfen
Lauteste zuerst prüfen
Leiseste zuerst prüfen
```

## Ergebnis

STEP270C ist weiterhin eine reine UI-Verbesserung. Keine Normalisierung und keine automatische Playback-Korrektur.
