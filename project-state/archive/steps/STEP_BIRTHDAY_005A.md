# STEP_BIRTHDAY_005A – Birthday Bundle Queue über Sound-System

## Ziel

Birthday-Shows werden als gesperrte Birthday-Bundles an das Sound-System übergeben. Dadurch übernimmt das Sound-System die Medien-Warteschlange. Das Birthday-Modul bleibt zuständig für User-/Party-Logik, Dedupe und Overlay-State.

## Verhalten

- `!birthday party user` startet sofort, wenn keine Birthday-Show läuft und das Sound-System das Bundle direkt starten kann.
- Wenn bereits eine Birthday-Show läuft, wird ein anderer User als Birthday-Bundle in die Sound-System-Queue gelegt.
- Derselbe User wird blockiert, wenn er bereits aktiv ist oder in der Birthday-Queue steht.
- Das Birthday-Overlay eskaliert weiterhin erst bei der Song-Phase (`phase=party`).
- Intro/Song laufen über das Sound-System als locked Bundle.

## Neue DB-Tabelle

- `birthday_show_queue`

Speichert laufende und wartende Birthday-Shows mit Request-ID, User, Party-Key, Style, Medien und Status.

## Neue/erweiterte Route

- `GET /api/birthday/show/queue`
- `GET /api/birthday/show/state` enthält zusätzlich `state.queue`

## Geänderte Dateien

- `backend/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.css`

## Hinweise

Das Sound-System bleibt Medien-Master. Das Birthday-Modul pollt den Sound-System-Status und synchronisiert daraus den sichtbaren Birthday-State für das Overlay.
