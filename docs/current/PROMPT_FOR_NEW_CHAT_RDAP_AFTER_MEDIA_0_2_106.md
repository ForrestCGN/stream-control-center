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
`0.2.106 - Media Picker Module Docs Closeout`

Kurzstand:
- Media-Picker online ist live ok.
- Media-Picker lokal funktioniert wie im ModBoard.
- Online und lokal sind read-only.
- Modul-Doku wurde erstellt:
  `docs/modules/media-picker.md`
- Keine Runtime-Code-Dateien in 0.2.106 geaendert.
- Kein Webserver-Deploy noetig.

Wichtige Media-Picker Runtime-Dateien:

Online:
```text
remote-modboard/backend/public/assets/modules/media/library.js
remote-modboard/backend/src/routes/media-index-diff.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

Lokal:
```text
backend/modules/local_remote_modboard_adapter.js
htdocs/dashboard-v2/assets/modules/media/library.js
```

Bestaetigte lokale API:
```text
GET /api/remote/media/index/context/list
```

Bestaetigte lokale Werte:
```text
ok=True
status=local_media_context_list_available_readonly
total=412
count=25
readOnly=True
writeEnabled=False
databaseWriteExecuted=False
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
RDAP_0.2.107_NEXT_SYSTEM_SCOPE_SELECTION
```

Ziel:
- naechsten Projektbereich bewusst auswaehlen,
- Media-Picker nicht weiter nebenbei aufblasen,
- bei neuem Runtime-Scope wieder echte Dateien lesen, Plan nennen, auf `go` warten.

Vor naechstem Step zuerst lesen:
```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/modules/media-picker.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_106.md
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
