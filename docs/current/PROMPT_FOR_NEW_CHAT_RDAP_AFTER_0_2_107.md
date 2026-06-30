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
`0.2.107 - Remote Modboard Scope Selection and System Map`

Kurzstand:
- Media-Picker-Block ist abgeschlossen.
- Media-Picker ist read-only, mod-tauglich, online/lokal angeglichen und dokumentiert.
- Modul-Doku:
  `docs/modules/media-picker.md`
- 0.2.107 ist Doku-only.
- Keine Runtime-Code-Dateien geaendert.
- Kein Webserver-Deploy noetig.

Systemkarte:
```text
1. Media-Picker: abgeschlossen/read-only
2. Lokales Dashboard-v2: Media-Picker angeglichen/read-only
3. Remote-Modboard online: UI-Wahrheit
4. Agent-/Sync-/Permission-Themen: nur eigener Scope
5. DB-/Write-/Gate-Themen: nur eigener Scope mit Permission/Confirm/Audit/Lock/Readback
6. Naechster Runtime-Block: separat auswaehlen
```

Wichtige Dokus:
```text
docs/current/RDAP_0.2.107_REMOTE_MODBOARD_SCOPE_SELECTION_AND_SYSTEM_MAP.md
docs/modules/media-picker.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Naechster sinnvoller Block:
```text
RDAP_0.2.108_NEXT_RUNTIME_SCOPE_PLAN
```

Ziel:
- naechsten Runtime-Bereich bewusst auswaehlen,
- nicht Media-Picker weiter aufblasen,
- je nach Auswahl relevante Dateien lesen,
- dann Kurzplan,
- auf `go` warten,
- erst dann ZIP.

Moegliche Richtungen:
```text
A. Admin-/User-/Permission-Bereich wieder aufnehmen.
B. Lokales Dashboard-v2 allgemein gegen Remote-Modboard angleichen.
C. Agent-/Sync-Scope separat planen.
D. Weitere Modul-Dokus fuer bestaetigte Bereiche erstellen.
E. Geparkte Env-Diagnose `MEDIA_INDEX_SCHEMA_WRITE_ENABLED=false` separat planen.
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
