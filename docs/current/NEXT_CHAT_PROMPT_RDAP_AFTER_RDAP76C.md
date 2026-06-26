# NEXT CHAT PROMPT - RDAP after RDAP76C

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

## Startdateien wirklich lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP76C_ADMIN_NOTES_INITIAL_RESTORE_STATE_FIX.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP76C.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP76C ist der Korrekturstep nach RDAP76.
RDAP76 hatte den Klickpfad Admin-Notizen korrekt gesetzt, aber beim Initial-/Restore-State konnte weiterhin User-Detail im Haupt-Header/Navigation aktiv bleiben, obwohl Admin-Notizen sichtbar war.
RDAP76C repariert genau diesen Restore-/State-Split im Frontend.
```

## Geaendert

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

## Ziel RDAP76C

```text
- Sichtbares Admin-Notes-Panel, Haupt-Header, aktive Navigation und Haupt-Router muessen zusammenpassen.
- Admin-Notes sichtbar => Header Admin-Notizen, Nav Admin-Notizen aktiv, Router admin-notes.
- User-Detail sichtbar => Header User-Detail, Nav User-Detail aktiv, Router admin-user-detail.
- Keine CSS-Tarnung.
- Kein Backend.
```

## Weiterhin verboten

```text
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine parallele Zweitnavigation.
Keine neuen Schreibbuttons.
Keine Write-Freigabe nebenbei.
```

## Danach geplant

```text
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```

Ziel:

```text
- Zieluser-Wechsel laedt/zeigt eindeutig Notizen fuer diesen User.
- Count/Hinweis bezieht sich eindeutig auf den ausgewaehlten User.
- Keine alten User-Daten in Titel, Count oder Liste stehen lassen.
```
