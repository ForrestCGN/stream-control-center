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
- ZIPs mit echten Zielpfaden, keinen Wrapper-Ordner.
- Keine DB-Writes, keine Gates, keine Agent-Actions ohne eigenen Plan + Go.

Repository:
- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Lokaler Stream-PC / Dashboard / Agent: `http://127.0.0.1:8080`
- Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
- Remote-Modboard live: `https://mods.forrestcgn.de/`

Aktueller Stand:
`0.2.105 - Local Media Picker Verify and Polish Docs`

Kurzstand:
- Online-Media-Picker war seit 0.2.101 live ok.
- 0.2.103 plante die lokale Angleichung.
- 0.2.104 setzte die lokale Read-only-Angleichung um.
- 0.2.105 dokumentiert die lokale Browser-Bestaetigung.
- Forrest bestaetigte: `Es funktioniert wie im ModBoard`.

0.2.104 Runtime-Dateien:
```text
backend/modules/local_remote_modboard_adapter.js
htdocs/dashboard-v2/assets/modules/media/library.js
```

0.2.104 lokale API:
```text
GET /api/remote/media/index/context/list
```

Bestaetigte lokale API-Werte:
```text
ok=True
status=local_media_context_list_available_readonly
total=412
count=25
readOnly=True
writeEnabled=False
databaseWriteExecuted=False
```

Bestaetigte lokale Statusroute:
```text
GET /api/remote/media/status?limit=25
ok=True
status=local_media_inventory_available
readOnly=True
```

Browser-Bestaetigung:
```text
http://127.0.0.1:8080/dashboard-v2/
Media-System funktioniert wie im ModBoard.
```

Sichtbare UI-Begriffe:
```text
Bereich
Ordner
Dateityp
Anzahl
Anzeigen
Filter zuruecksetzen
Zurueck
Weiter
```

In der Mod-Hauptansicht vermeiden:
```text
Root
Kind
Full Category
Kontext-API
remote_media_index
DB
Writes
Agent-Diagnose
absolute Pfade
```

Naechster sinnvoller Block:
```text
RDAP_0.2.106_MEDIA_PICKER_NEXT_SCOPE_DECISION
```

Ziel 0.2.106:
- naechsten Media-Picker-/Media-System-Scope bewusst entscheiden,
- keine Nebenbei-Funktion,
- keine Writes,
- keine Gates,
- keine Agent-Actions.

Vor jedem naechsten Step zuerst lesen:
```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP_0.2.105_LOCAL_MEDIA_PICKER_VERIFY_AND_POLISH_DOCS.md
backend/modules/local_remote_modboard_adapter.js
htdocs/dashboard-v2/assets/modules/media/library.js
remote-modboard/backend/public/assets/modules/media/library.js
```

Harte Regeln:
```text
kein Gate aktivieren
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
