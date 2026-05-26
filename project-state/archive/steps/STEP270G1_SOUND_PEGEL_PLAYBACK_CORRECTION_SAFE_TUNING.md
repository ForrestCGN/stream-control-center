# STEP270G1 - Sound Pegel Playback Correction Safe Tuning

Stand: 2026-05-21

## Ziel

Die optionale Pegel-Playback-Korrektur aus STEP270G war fuer kurze SFX zu aggressiv. Beispiele: `airhorn.mp3` wurde von knapp rot auf kaum gruen gedrueckt. STEP270G1 entschaerft die Korrektur.

## Aenderungen

- Korrektur wird standardmaessig nur noch anteilig angewendet.
- Neue Einstellung `strengthPercent`, Standard 50.
- Neue Einstellung `minPlaybackVolume`, Standard 35.
- `maxBoostDb` Standard 3.
- `maxCutDb` Standard 12 und hart auf maximal 12 begrenzt.
- Dashboard zeigt Korrektur-Staerke und Mindest-Volume.
- `levelCorrection.notes` zeigt z. B. `strength_limited`, `min_volume_floor`, `max_cut_limited`.

## Nicht geaendert

```text
Sound-Dateien
config/**
Queue-/Prioritaetslogik
Bundle-Lock
Discord-Routing
Alert-System
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

Danach Backend neu starten und `airhorn.mp3` sowie auffaellige Sounds erneut testen.
