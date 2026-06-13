# CURRENT STATUS

Stand: EVS-4 / Stream Events Media Picker Prep  
Datum: 2026-06-13  
Projekt: ForrestCGN / stream-control-center

## Zweck dieses Stands

EVS-4 setzt auf EVS-3 auf und bereitet die Medienauswahl im Event-Dashboard korrekt über das vorhandene Media-System vor.

## Bestätigte Grundlage

- EVS-2 Backendstatus wurde vom Nutzer getestet:
  - `ok: True`
  - `module: stream_events`
  - `moduleVersion: 0.1.0`
  - `moduleBuild: STEP_EVS_2_BACKEND_FOUNDATION`
  - `routeCount: 13`
  - `schemaReady: True`
- EVS-3 Dashboard Skeleton wurde erstellt.
- Nutzerhinweis: StepDone vor Live-/Dashboard-Test beachten.

## EVS-4 Änderung

Im Event-Erstellen/Bearbeiten-Dialog werden Medien für Sound-Schnipsel und optionale Auflösungs-Videos über die vorhandenen Media-Komponenten gewählt.

```text
Sound-Schnipsel → MediaPicker / audio / stream_events/sound_snippets
Auflösungs-Video → MediaPicker / video,animation / stream_events/reveal_videos
```

## Nicht geändert

```text
Backend
Datenbank
Twitch-Chat-Auswertung
Sound-/Video-Playback
Overlay
Media-System selbst
```

## Testregel

Vor Live-Test:

```powershell
.\stepdone.cmd "EVS-4 Stream Events Media Picker Prep"
```
