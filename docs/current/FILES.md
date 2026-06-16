# FILES – stream-control-center

Stand: 2026-06-16

## Aktueller Arbeitsstand

```text
EVENTSYS-27D-FIX2 – Live-Bedienung in der Übersicht
```

## Für diesen Doku-Stand relevante Dateien

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
docs/current/CURRENT_STATUS.md
docs/current/NEXT_STEPS.md
docs/current/TODO.md
docs/current/FILES.md
docs/current/CHANGELOG.md
docs/current/CURRENT_CHAT_HANDOFF_EVENTSYS_27D_SOUND_SAFE.md
docs/modules/stream_events.md
docs/modules/sound_system_event_preroll_plan.md
project-state/CURRENT_STATUS_EVENTSYS_27D.md
project-state/NEXT_CHAT_PROMPT_EVENTSYS_27D_SOUND_SAFE.txt
```

## Backend

```text
backend/modules/stream_events.js
```

Aktueller Modulstand laut Runtime zuletzt:

```text
module = stream_events
moduleVersion = 0.5.22
moduleBuild = STEP_EVS_25A_EMPTY_OVERVIEW_ACTION_CLEANUP
enabled = true
schemaReady = true
bus.registered = true
```

Wichtig:

```text
- Backend wurde in den letzten Eventsystem-Schritten für Validierung, Duplicate/Rename und Event-Settings erweitert.
- Echtes Sound-Playback ist noch nicht angebunden.
- Sound-Runden können vorbereitet werden.
- ChatOutput bleibt prepared-only.
```

## Dashboard

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Enthält aktuell:

```text
- getrennte Editor-Fenster:
  - Einstellungen bearbeiten
  - Sound-Schnipsel bearbeiten
  - Text-Spiel bearbeiten

- Sound-Schnipsel:
  - mehrere Schnipsel
  - MediaPicker-State wird erhalten
  - konkrete Pflichtfeldprüfung pro Schnipsel
  - Live-Refresh im Editor

- Event-Verwaltung:
  - Umbenennen
  - Kopieren mit Namen-Dialog
  - Speichern/Prüfen/Starten/Beenden/Abbrechen/Archivieren/Löschen
  - Reload nach mutierenden Buttons

- Übersicht:
  - EVENT LÄUFT Anzeige
  - Live-Bedienung
  - Nächsten Schnipsel vorbereiten
  - Status & Punkte öffnen
```

## Sound-System – nächster Prüfbereich

Vor weiteren Runtime-Arbeiten gezielt prüfen:

```text
backend/modules/sound_system.js
htdocs/overlays/sound_system_overlay.html
```

Falls Overlay-Dateiname im Repo anders ist, echten vorhandenen Namen nutzen. Nicht raten.

Prüfziel:

```text
- bestehendes Playback nicht brechen
- Queue bleibt Owner
- optionalen Countdown-PreRoll sauber andocken
```

## Nicht anfassen ohne separate Planung

```text
Produktive SQLite:
D:\Streaming\stramAssets\data\sqlite\app.sqlite

Alte Sound-/Alert-/UserSound-Flows
Sound-System-Routenverhalten
Twitch-Events-Bus-Struktur
ChatOutput-Live-Schalter
```
