# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.104_LOCAL_MEDIA_PICKER_READONLY_ALIGNMENT`

## Ausgangslage

`0.2.103 - Local Media Picker Alignment Plan` ist ein Doku-/Plan-Step.

Bestaetigt:
- Online-Media-Picker ist seit 0.2.101 live ok.
- Context-Read-API:
  `GET /api/remote/media/index/context/list`
- Online-Media-Picker nutzt die Context-API read-only.
- Pagination funktioniert ueber `limit` und `offset`.
- UI ist modfreundlich und im CGN-Design poliert.
- 0.2.102 hat den Online-Stand dokumentiert.
- 0.2.103 haelt die lokale Angleichung als naechsten Read-only-Block fest.
- Keine DB-Writes, keine Gates, keine Agent-Aktion.

## Online-Stand

Betroffene Online-Datei:
```text
remote-modboard/backend/public/assets/modules/media/library.js
```

Wichtige UI-Begriffe:
```text
Bereich
Ordner
Dateityp
Anzahl
Anzeigen
Filter zuruecksetzen
```

Vermeiden in der Mod-Hauptansicht:
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

## Ziel fuer 0.2.104

Lokale Media-Picker-Angleichung read-only umsetzen oder, falls lokale API-Felder nicht passen, zuerst den kleinsten API-Kontrakt-Step vorbereiten.

Vor Umsetzung pruefen:
```text
- nutzt lokale Ansicht dieselbe library.js oder eine lokale Kopie?
- welche lokale Dashboard-/Agent-UI-Dateien sind betroffen?
- welche lokalen API-Endpunkte liefern Media-Daten?
- liefern lokale APIs dieselben Felder wie die Online-Context-API?
- kann die UI ohne Online->Agent Dateiaktion lokal lesen?
- welche Unterschiede gibt es zwischen Webserver/Remote-Modboard und lokalem Dashboard?
```

## Relevante Dateien zuerst lesen

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
remote-modboard/backend/public/assets/modules/media/library.js
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/modules/module-manifest.js
remote-modboard/backend/src/routes/media-index-diff.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

Dann lokale Struktur suchen/lesen:
```text
backend/modules/remote_agent.js
backend/modules/local_remote_modboard_adapter.js
server.js
htdocs/dashboard-v2/assets/modules/media/library.js
htdocs/dashboard-v2/assets/remote-modboard.css
htdocs/dashboard-v2/assets/modules/module-manifest.js
docs/current/RDAP119_MODULAR_UI_AND_LOCAL_DASHBOARD_FOUNDATION.md
docs/current/RDAP122_LOCAL_DASHBOARD_RUNTIME_PROFILE.md
```

## Harte Regeln fuer 0.2.104

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
keine neue zweite lokale UI
keine technischen Labels in der Mod-Hauptansicht
keine weissen Browser-Standard-Dropdowns
```

## Erwarteter Ablauf

1. Relevante Dateien aus GitHub/dev lesen.
2. Kurzplan nennen.
3. Auf `go` warten.
4. Erst dann ZIP bauen.
5. Wenn Runtime-Dateien geaendert werden: komplette aktuelle Datei lesen und komplette Ersatzdatei liefern.
