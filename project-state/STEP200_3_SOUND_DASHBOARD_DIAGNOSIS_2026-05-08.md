# STEP200.3 – Sound-System Dashboard Diagnose

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: kleiner Dashboard-STEP  
Status: vorbereitet

## Ziel

Das Sound-Dashboard soll den neuen Sound-System-Standard aus STEP200.1/STEP200.2 sichtbar nutzen, ohne Playback-/Queue-Logik zu verändern.

## Geändert

Betroffene Dateien:

```text
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
```

Änderungen:

- neuer Tab `Diagnose`
- neue Diagnose-Karte im Sound-Dashboard
- Dashboard lädt zusätzlich:
  - `GET /api/sound/integration-check`
  - `GET /api/sound/routes`
- Diagnose zeigt u. a.:
  - Integration gesund/auffällig
  - Overlay-Client verbunden
  - DB-Settings OK + Blockanzahl
  - JSON-Fallback OK
  - AudioDeviceHelper vorhanden
  - Sound-Ordner vorhanden
  - MP4/WebM-Unterstützung
  - Routenanzahl
  - bekannte Warnungen/Fehler
- Hinweis auf Architektur:
  - `output.targets` ist aktiv
  - `targets` ist Legacy/Kompatibilität
- Settings-Seite ergänzt Quellenhinweis:
  - `sound_settings`
  - DB vor JSON-Fallback

## Nicht geändert

- keine Backend-Logik
- keine DB
- keine JSON
- keine Queue-/Playback-Logik
- keine SoundAlert-/Alert-/TTS-Logik
- keine Entfernung von Legacy-`targets`
- keine Entfernung von `test_ping`

## Tests

Vor Auslieferung:

```text
node --check htdocs/dashboard/modules/sound.js
```

Nach Deployment im Live-System prüfen:

```text
/api/sound/status
/api/sound/settings
/api/sound/routes
/api/sound/integration-check
Dashboard > Sound-System > Diagnose
```

## Erwartung

Die Diagnose soll `Gesund` anzeigen. Die bekannte Warnung `legacy_targets_and_output_targets_both_present` darf sichtbar bleiben und ist aktuell kein Fehler.
