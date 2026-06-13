# CURRENT STATUS

Stand: EVS-3 / Stream Events Dashboard Skeleton
Datum: 2026-06-13
Projekt: ForrestCGN / stream-control-center

## Zweck dieses Stands

EVS-3 ergaenzt nach der funktionierenden EVS-2 Backend-Basis eine erste Dashboard-Oberflaeche fuer das Event-System.

Der Schritt bleibt bewusst klein und sicher:

- Dashboard-Skeleton ja
- keine neue Spiel-Engine
- keine Chat-Auswertung
- kein Sound-/Video-Playback
- kein Overlay
- kein Backend-Umbau

## Bestaetigter EVS-2 Test

Forrest hat EVS-2 gegen Live/API geprueft:

```text
ok            : True
module        : stream_events
moduleVersion : 0.1.0
moduleBuild   : STEP_EVS_2_BACKEND_FOUNDATION
routeCount    : 13
lastError     :
```

Diagnostics:

```text
ok            : True
health        : ok
schemaReady   : True
schemaVersion : 1
lastError     :
```

## EVS-3 umgesetzt

Neue Dateien:

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Geaenderte Datei:

```text
htdocs/dashboard/index.html
```

Doku aktualisiert:

```text
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_3_DASHBOARD_SKELETON.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Dashboard-Funktionen

- Eventliste anzeigen
- Eventdetails anzeigen
- neues Event erstellen
- Event bearbeiten
- Sound/Text auswaehlen
- einfache Sound-Konfiguration speichern
- einfache Text-Konfiguration speichern
- Validierungsstatus lesbar anzeigen
- Start/Beenden/Abbrechen mit Bestaetigung
- Ranking laden

## Nicht geaendert durch EVS-3

- kein Backend-Code
- keine DB-Migration
- keine Twitch-Events/Chat-Verarbeitung
- kein Sound-System-Code
- kein Media-System-Code
- kein Overlay
- keine bestehende Dashboard-Funktion entfernt

## Wichtiger Ablauf fuer Test

Forrest-Hinweis: `stepdone.cmd` muss vor Live-/Dashboard-Test ausgefuehrt werden, sonst ist der Stand nicht im Live-System.

```powershell
.\stepdone.cmd "EVS-3 Stream Events Dashboard Skeleton"
```

## Naechster Schritt

EVS-4: Sound-Spiel Backend / Rotation planen und bauen.

