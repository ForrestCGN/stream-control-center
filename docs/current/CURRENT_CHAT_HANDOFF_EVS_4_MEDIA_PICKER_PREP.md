# CURRENT CHAT HANDOFF – EVS-4 Media-System Picker Vorbereitung

Stand: EVS-4 / Stream Events Dashboard Media Picker Prep  
Datum: 2026-06-13  
Projekt: ForrestCGN / stream-control-center

## Zweck

EVS-4 erweitert das in EVS-3 angelegte Dashboard-Skeleton so, dass Sound-Schnipsel und optionale Auflösungs-Videos nicht mehr als freie Dateipfad-Felder gedacht sind, sondern über das vorhandene Media-System ausgewählt bzw. hochgeladen werden können.

Wichtig: Der Step baut kein eigenes Upload-System und keinen eigenen Player.

## Geändert

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

## Verhalten

Im Event-Erstellen/Bearbeiten-Dialog:

- Sound-Schnipsel wird über `MediaField` / `MediaPicker` ausgewählt.
- Upload läuft über das bestehende Media-System.
- Das Event speichert nur die Media-ID/Referenz im vorhandenen Sound-Config-Snapshot.
- Kategorie für Sound-Schnipsel: `stream_events / sound_snippets`.
- Optionales Auflösungs-Video wird ebenfalls über `MediaField` / `MediaPicker` ausgewählt.
- Kategorie für Auflösungs-Videos: `stream_events / reveal_videos`.
- Erlaubte Medientypen:
  - Sound-Schnipsel: `audio`
  - Auflösungs-Video: `video,animation`

## Bewusst nicht geändert

```text
Backend
Datenbank-Schema
EventBus
Twitch-Chat-Auswertung
Sound-/Video-Playback
Overlay
Media-System selbst
```

## Grundlage

Die Dashboard-Shell lädt bereits:

```text
/dashboard/components/media_picker.js
/dashboard/components/media_field.js
/dashboard/components/media_picker.css
/dashboard/components/media_field.css
```

EVS-4 nutzt diese vorhandenen Komponenten statt neue Upload-/Picker-Strukturen zu bauen.

## Test nach StepDone

Erst Repo entpacken, dann Syntaxcheck:

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
```

Dann vor Live-Test:

```powershell
.\stepdone.cmd "EVS-4 Stream Events Media Picker Prep"
```

Danach Dashboard öffnen:

```text
Dashboard → Community → Event-System → Neues Event
```

Prüfen:

- Sound-Spiel aktivieren.
- `Medium auswählen` bei Sound-Schnipsel öffnet den Media-Picker.
- Upload eines Audio-Schnipsels ist im Picker möglich.
- Auswahl schreibt `mediaId` in das Event.
- Optionales Auflösungs-Video öffnet Picker mit Video/Animation.
- Speichern funktioniert weiterhin.
- Validierung bleibt verständlich.

## Nächster sinnvoller Step

EVS-5 sollte entweder:

1. Dashboard-Detailkonfiguration weiter ausbauen, z. B. mehrere Sound-Schnipsel / mehrere Text-Phrasen, oder
2. Backend/Dashboard für echte Sound-Snippet-Verwaltung pro Event vorbereiten.

Noch nicht direkt Chat-Auswertung oder Playback bauen, solange die Konfig-Struktur noch zu flach ist.
