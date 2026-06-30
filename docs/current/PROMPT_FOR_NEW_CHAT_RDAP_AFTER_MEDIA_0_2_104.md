Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG:
- Masterprompt lesen und anwenden.
- GitHub/dev ist Wahrheit.
- Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten.
- Keine ZIPs vor `go`.
- Keine Funktionalitaet entfernen.
- Keine Patch-/Apply-/Regex-/Set-Content-/Append-Scripte.
- Wenn Dateien geaendert werden: komplette aktuelle Datei lesen und komplette Ersatzdatei liefern.
- ZIP mit echten Zielpfaden, keinen Wrapper-Ordner.

Aktueller Stand:
`0.2.104 - Local Media Picker Readonly Alignment`

Bestaetigt/umgesetzt:
- lokale Dashboard-v2 Media-UI wurde an den Online-Media-Picker angeglichen.
- `htdocs/dashboard-v2/assets/modules/media/library.js` nutzt den bestaetigten Picker-Stand.
- `backend/modules/local_remote_modboard_adapter.js` liefert lokal:
  `GET /api/remote/media/index/context/list`
- lokale Context-Route liest bestehendes lokales Media-Inventar read-only.
- Query-Felder: `root_key`, `module_key`, `category_key`, `full_category_key`, `kind`, `limit`, `offset`.
- lokale Media-Wurzeln: sounds/videos/images/media.
- Keine DB-Writes, keine Gates, keine Agent-Actions, keine Upload/Edit/Delete-Aktion.

Relevante Dateien zuerst lesen:
```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP_0.2.104_LOCAL_MEDIA_PICKER_READONLY_ALIGNMENT.md
backend/modules/local_remote_modboard_adapter.js
htdocs/dashboard-v2/assets/modules/media/library.js
remote-modboard/backend/public/assets/modules/media/library.js
```

Naechster sinnvoller Block:
`RDAP_0.2.105_LOCAL_MEDIA_PICKER_VERIFY_AND_POLISH`

Ziel:
- lokale Testergebnisse auswerten,
- lokalen Picker im Browser pruefen,
- Filter/Pagination gegen echte lokale Dateien bestaetigen,
- nur falls noetig kleiner UI-/API-Polish,
- keine Writes.

Harte Regeln:
```text
keine Gates aktivieren
keine DB-Zeilen veraendern
keine Migration
kein Tombstone-Execute
kein Hard-Delete
kein physisches Loeschen
kein Online->Agent-Trigger
keine Upload/Edit/Delete-Aktion
keine Dateiaktion vom Webserver zum Stream-PC
keine zweite lokale UI
keine technischen Labels in der Mod-Hauptansicht
keine weissen Browser-Standard-Dropdowns
```
