# STEP272A - Sound-Pegel Unterbereiche/Tabs

Stand: 2026-05-21

## Ziel

Das eigene Dashboard-Modul `Sound-Pegel` war nach Scan, Fortschritt, Korrektur-Vorschau, Safe-Tuning und vorbereiteten Kopien wieder zu voll.

## Umsetzung

- `htdocs/dashboard/modules/sound_levelscan.js` erweitert.
- Interne Tabs fuer das Sound-Pegel-Modul ergaenzt:
  - Übersicht
  - Scan
  - Ergebnisse
  - Korrektur
  - Kopien
- `htdocs/dashboard/modules/sound_levelscan.css` um Tab- und Responsive-Stile erweitert.
- Bestehende Backend-API bleibt unveraendert.

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

Dashboard:

```text
System -> Sound-Pegel
Übersicht / Scan / Ergebnisse / Korrektur / Kopien durchklicken
Scan starten
Ergebnisse filtern/sortieren
Korrektur-Settings anzeigen/speichern
```
