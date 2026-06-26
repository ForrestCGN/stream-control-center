# NEXT_STEPS

Stand: RDAP76D_ADMIN_MODULE_REGISTRY_TARGET_PLAN  
Datum: 2026-06-26

## Naechster Code-Step

```text
RDAP77_ADMIN_MODULE_REGISTRY_FOUNDATION
```

## Ziel

```text
Frontend-only Registry-Fundament schaffen, damit Module/Unterseiten kuenftig automatisch eingeordnet werden koennen.
Admin wird erstes registriertes Obermodul.
Admin-Notizen und User-Detail werden echte Admin-Pages.
Haupt-Router bleibt einzige Wahrheit fuer Header, Navigation und sichtbares Panel.
```

## Warum

```text
Aktuell injiziert rdap28-admin-notes.js Admin-Notizen und User-Detail nachtraeglich.
Das erzeugt konkurrierende Zustandslogik zwischen Haupt-Router und Feature-Datei.
Weitere Header-Fixes waeren nur Symptom-Reparatur.
```

## Empfohlener Scope RDAP77

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
optional neue Frontend-Registry-Datei unter remote-modboard/backend/public/assets/
optional docs/current/*
optional project-state/*
```

## Danach

```text
RDAP78_ADMIN_NOTES_USER_CONTEXT_RELOAD_AND_COUNT_FIX
```

Ziel:

```text
- Zieluser-Wechsel laedt/zeigt eindeutig Notizen fuer diesen User.
- Count/Hinweis passt zum ausgewaehlten User.
- Keine alten User-Daten in Titel, Count oder Liste stehen lassen.
```

## Nicht aendern

```text
Keine DB-Migration.
Keine Backend-Route.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine Write-Freigabe nebenbei.
```
