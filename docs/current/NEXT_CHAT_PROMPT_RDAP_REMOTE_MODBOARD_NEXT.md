Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Sprache: Deutsch. Kurz, direkt, pragmatisch. Forrest arbeitet mit `go`, `ok`, `weiter`.

WICHTIG:
GitHub/dev ist Wahrheit. Nicht blind aus Erinnerung arbeiten.
Erst die Startdateien wirklich aus GitHub/dev lesen, dann Plan nennen, dann auf mein explizites `go` warten.

Verbindliche Arbeitsweise:

```text
- Immer zuerst echte Dateien aus GitHub/dev lesen.
- Erst Plan nennen.
- Auf explizites go warten.
- Keine Code-/ZIP-Erstellung vor go.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine parallelen Strukturen erfinden.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: cd D:\Git\stream-control-center; .\installstep.cmd "$env:USERPROFILE\Downloads\<ZIP>.zip" "<Beschreibung>"
- Danach lokale Checks und git status.
- Wenn sauber: .\stepdone.cmd "<Beschreibung>"
- Webserver-Deploy nur nach Code-/Remote-Modboard-Aenderungen.
- Keine langen Diagnose-Schleifen, wenn der Fehler aus dem Step selbst kommt: dann Hotfix planen.
```

Startdateien zuerst lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
project-state/PARKED_TODOS.md
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/public/assets/modules/module-manifest.js
remote-modboard/backend/public/assets/modules/media/library.js
htdocs/dashboard-v2/assets/modules/module-manifest.js
htdocs/dashboard-v2/assets/modules/media/library.js
backend/modules/sound_system.js
backend/modules/helpers/helper_media.js
```

Aktueller Stand:

```text
RDAP_0.2.24_MEDIA_READONLY_FOUNDATION
```

Bestaetigt/gebaut:

```text
- Media-Modul im Remote-Modboard vorbereitet.
- Media-Seite read-only vorbereitet.
- GET /api/remote/media/status liefert sichere Grundlage.
- Lokal/Online wird unterschieden.
- Upload/Edit/Delete sind deaktiviert.
- Keine Dateiscans in 0.2.24.
- Keine DB-Migration, keine Agent-Actions, keine produktiven Writes.
```

OBS:

```text
OBS bleibt geparkt bei 0.2.22E. Keine OBS-Actions ohne separaten Control-Step.
```

Naechster sinnvoller Schritt:

```text
RDAP_0.2.25_MEDIA_LOCAL_INVENTORY_READONLY
```

Ziel fuer 0.2.25:

```text
- Lokale Media-Ordner read-only inventarisieren.
- Safe-Path, Extension-Allowlist, Ausgabe-Limits.
- Startbereiche: htdocs/assets/sounds, htdocs/assets/videos, htdocs/assets/images.
- Keine Uploads.
- Keine Deletes.
- Keine DB-Migration.
- Online keine Fake-Daten; Agent-Sync spaeter separat.
```
