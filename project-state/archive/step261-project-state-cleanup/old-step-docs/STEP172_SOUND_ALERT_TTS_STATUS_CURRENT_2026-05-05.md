# STEP172 - Sound / Alert / TTS Status Current

Stand: 2026-05-05

## Zweck

Diese Datei haelt den aktuellen stabilen Stand nach den Sound-/Alert-/TTS-Fixes fest und dient als Referenz vor der weiteren Dashboard-Arbeit.

## Git-Stand

- Branch: `dev`
- Repo: `D:\Git\stream-control-center`
- Live: `D:\Streaming\stramAssets`
- GitHub: `https://github.com/ForrestCGN/stream-control-center`
- HEAD/origin/dev: `1fc35236f90d7627b4ec800baf85b8e2bebb9c1c`
- Letzter Commit: `docs: save step171 step172 sound alert tts status`
- Lokaler Status bei Pruefung: clean

## Live-Status

Live bestaetigt ueber:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status" | ConvertTo-Json -Depth 30
```

Ergebnis-Kernwerte:

- `module = alert_system`
- `version = 3`
- `step = 171`
- `queueLength = 0`
- `current = null`
- `overlayClients = 1`
- `schemaVersion = 5`
- `multerReady = true`
- `ffprobe.available = true`
- `soundAssetsWithDuration = 18`
- `soundAssetsWithoutDuration = 0`

## Abgeschlossene Fix-Kette

Relevante Commits:

- `6f9bccf fix: restore alert tts playback through sound system`
- `c2f77cb fix: keep alert tts behind alert sound`
- `de4671c fix: delay chat tts until alert queue is idle`
- `8743042 fix: respect sound output target in overlay`
- `1fc3523 docs: save step171 step172 sound alert tts status`

## Aktueller Soll-Ablauf

Fuer Ko-fi/Tipeee Donation mit Alert-TTS:

1. Alert wird angenommen.
2. Alert-Hauptsound geht ins Sound-System.
3. Alert-Overlay zeigt Visuals, spielt aber im Sound-System-Modus keinen Hauptsound doppelt.
4. Alert-TTS wird ueber `/api/tts/prepare-alert` vorbereitet.
5. Alert-TTS geht als eigenes Sound-System-Item hinter den Alert-Hauptsound.
6. Normale Chat-TTS wird verzögert, bis die Alert-Queue/Alert-Kette idle ist.
7. Overlay bleibt bis nach Alert-TTS sichtbar.
8. Sound-System bleibt Audio-Wahrheit.

## Aktuelle Alert-Live-Settings

Aktive Werte kommen aus der Datenbank/Runtime-Settings. JSON-Dateien sind nur Default/Fallback.

Wichtige aktive `liveAlert`-Werte:

- `soundSystemEnabled = true`
- `soundSystemOutputTarget = device`
- `soundSystemCategory = alert`
- `earlySoundQueueEnabled = false`
- `waitForSoundItemStarted = true`
- `alertTtsEnabled = true`
- `alertTtsPrepareUrl = http://127.0.0.1:8080/api/tts/prepare-alert`
- `alertTtsSoundSystemEnabled = true`
- `alertTtsSoundSystemCategory = alert_tts`
- `alertTtsSoundSystemOutputTarget = device`
- `alertTtsSoundSystemVolume = 100`
- `alertTtsSoundSystemPriority = 79`
- `alertTtsOutroBufferMs = 1500`

## Aktuelle Prioritaetslogik

- Alert-Hauptsound: Kategorie `alert`, Prioritaet 80
- Alert-TTS: Kategorie `alert_tts`, Prioritaet 79
- Chat-TTS: Kategorie `tts`, Prioritaet 50

Gewuenschte Reihenfolge:

```text
Alert-Hauptsound -> Alert-TTS -> Chat-TTS
```

## Betroffene Dateien der Fix-Kette

- `backend/modules/alert_system.js`
- `backend/modules/tts_system.js`
- `htdocs/overlays/_overlay-alerts-v2.html`
- ggf. Doku unter `project-state/`

## Wichtige offene Punkte

- `/api/alerts/settings` kann sensible Provider-Werte enthalten. Public-/Dashboard-Ausgaben muessen maskiert werden.
- `liveAlert`/`livealert` Alt-/Duplikatstruktur in Alert-Settings spaeter bereinigen.
- Alert-System ist funktional, aber `alert_system.js` bleibt gross und sollte spaeter nur behutsam gesplittet werden.
- Dashboard-Arbeit kann wieder aufgenommen werden, aber nur auf Basis dieses aktuellen Stands.

## Naechster Arbeitsfokus

Nach dieser Statusaktualisierung soll die Dashboard-Weiterentwicklung fortgesetzt werden:

1. Dashboard-Doku und Projektstatus auf aktuellen Stand halten.
2. Dashboard-Module weiter vereinheitlichen.
3. VIP-Song-Upload nach Alert-Upload-/Helper-Standard planen.
4. Modul-Audit fuer DB-Settings, DB-Texte und Helper-Nutzung vorbereiten.
