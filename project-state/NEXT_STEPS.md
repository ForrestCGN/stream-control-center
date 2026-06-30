# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.103_LOCAL_MEDIA_PICKER_ALIGNMENT_PLAN`

## Ausgangslage

`0.2.101 - Media Picker Pagination and Dedup` ist online im Remote-Modboard live ok.

Bestaetigt:
- Context-Read-API:
  `GET /api/remote/media/index/context/list`
- Online-Media-Picker nutzt die Context-API read-only.
- Pagination funktioniert ueber `limit` und `offset`.
- UI ist modfreundlich und im CGN-Design poliert.
- Keine Backend-Aenderung seit 0.2.94 fuer die UI-Schritte.
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
```

## Ziel fuer 0.2.103

Lokale Media-Picker-Angleichung planen.

Vor Umsetzung klaeren:
```text
- nutzt lokale Ansicht dieselbe library.js?
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
remote-modboard/backend/public/assets/modules/media/library.js
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/modules/module-manifest.js
remote-modboard/backend/src/routes/media-index-diff.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

Dann lokale Struktur suchen/lesen:
```text
backend/modules/remote_agent.js
server.js
backend/public / htdocs / dashboard / overlays relevante lokale UI-Dateien
docs/reference/*
docs/current/RDAP119_MODULAR_UI_AND_LOCAL_DASHBOARD_FOUNDATION.md
docs/current/RDAP122_LOCAL_DASHBOARD_RUNTIME_PROFILE.md
```

## Sicherheit

Weiterhin verboten ohne separaten Plan + Go:

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
```

## Erwarteter naechster Ablauf

1. Relevante Dateien lesen.
2. Kurzplan fuer lokale Angleichung nennen.
3. Auf `go` warten.
4. Erst dann ZIP bauen.
