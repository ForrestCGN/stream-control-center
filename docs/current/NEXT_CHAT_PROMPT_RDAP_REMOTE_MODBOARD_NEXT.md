Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Sprache: Deutsch. Kurz, direkt, pragmatisch. Forrest arbeitet mit `go`, `ok`, `weiter`.

WICHTIG:
GitHub/dev ist Wahrheit. Nicht blind aus Erinnerung arbeiten. Erst echte Dateien lesen, dann Plan nennen, dann auf explizites `go` warten.

Startdateien zuerst lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
project-state/PARKED_TODOS.md
remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/public/assets/modules/media/library.js
htdocs/dashboard-v2/assets/modules/media/library.js
backend/modules/local_remote_modboard_adapter.js
backend/modules/helpers/helper_media.js
```

Aktueller Stand:

```text
0.2.25 - Media Local Inventory Readonly.
OBS ist geparkt bei 0.2.22E.
Media ist neuer Fokus.
```

Sicherheitsgrenzen:

```text
Keine Uploads.
Keine Deletes.
Keine Edits.
Keine DB-Migration.
Keine Agent-Actions.
Keine Shell-/Datei-/Prozess-Actions.
Keine absoluten Pfade anzeigen.
```

Naechster sinnvoller Schritt:

```text
0.2.25 lokal/online testen. Danach Media-Agent-Inventory-Sync read-only oder Permission-Middleware fuer spaetere Media-Writes planen.
```
