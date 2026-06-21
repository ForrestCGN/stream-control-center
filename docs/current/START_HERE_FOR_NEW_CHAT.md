# START HERE FOR NEW CHAT

Stand: 2026-06-21
Projekt: ForrestCGN / stream-control-center

Diese Datei ist der Einstiegspunkt für neue Chats im Projekt.

## Pflicht-Reihenfolge im neuen Chat

1. `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt` lesen.
2. `project-state/CURRENT_STATUS.md` lesen.
3. `project-state/NEXT_STEPS.md` lesen.
4. `project-state/TODO.md` lesen.
5. `project-state/FILES.md` prüfen, wenn Dateien/Pfade unklar sind.
6. Relevante Datei aus `docs/current/*.md` lesen.
7. Relevante Modul-Doku aus `docs/modules/*.md` lesen.
8. Betroffene echte Projektdateien aus `D:\Git\stream-control-center` anfordern, wenn sie nicht vorliegen.

## Wichtige Arbeitsregeln

- Nicht aus Erinnerung arbeiten.
- Nicht alte Chatstände mit aktuellen Dateien mischen.
- Fehlende Dateien exakt anfordern.
- Keine Patch-/Apply-/Regex-/Append-Scripte.
- Änderungen als vollständige Dateien mit echten Zielpfaden ab Repo-Root liefern.
- Keine Funktionalität entfernen.
- Offene oder aufgeschobene Punkte müssen in `project-state/TODO.md`.
- Bei Security, DB, Dashboard-Struktur und großen Refactors zuerst planen und auf `go` warten.

## Primäre Projekt-Truth

- Code-Basis: GitHub/dev + `D:\Git\stream-control-center`
- Live-System: `D:\Streaming\stramAssets`
- Produktive DB: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`
- Live-State: `twitch_events` / `GET /api/twitch/events/stream-state`
- Modul-Kommunikation: `communication_bus`
- Playback/Queue/Finish: `sound_system`

## Wenn ein Chat zu lang wird

Wenn der Browser träge wird, Projektstände vermischt werden oder der Assistant anfängt zu raten:

- keinen neuen großen Step mehr anfangen
- aktuellen Stand zusammenfassen
- offene Punkte/TODOs nennen
- benötigte Dateien für den neuen Chat auflisten
- neuen Chat-Prompt/Handoff erstellen
