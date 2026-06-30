# CURRENT_STATUS

Aktueller Stand: `0.2.106 - Media Picker Module Docs Closeout`

## Kurzfazit

Der Media-Picker-Block ist als read-only Stand abgeschlossen und in die Modul-Doku ueberfuehrt.

Modul-Doku:

```text
docs/modules/media-picker.md
```

## Bestaetigter Stand

Online:
- Media-Picker seit 0.2.101 live ok.
- Context-Read-API online aktiv:
  `GET /api/remote/media/index/context/list`
- Online `root_key=media` bestaetigt mit `total=412`.
- Keine DB-Writes, keine Gates, keine Upload/Edit/Delete-Aktion, keine Agent-Aktion.

Lokal:
- 0.2.104 hat lokale Dashboard-v2 Media-UI an den Online-Picker angeglichen.
- Lokaler Adapter liefert:
  `GET /api/remote/media/index/context/list`
- Lokale Route nutzt bestehendes lokales Media-Inventar read-only.
- Lokale Route unterstuetzt:
  `root_key`, `module_key`, `category_key`, `full_category_key`, `kind`, `limit`, `offset`.
- Lokale Syntaxchecks waren sauber.
- Lokale Context-Route lieferte:
  `total=412`, `count=25`, `readOnly=True`, `writeEnabled=False`, `databaseWriteExecuted=False`.
- Lokale Browserpruefung:
  `Media-System funktioniert wie im ModBoard.`
- Kein Webserver-Deploy noetig.

## Relevante Runtime-Dateien

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

## Sichtbare Mod-Begriffe

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

In der Hauptansicht vermeiden:

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

## Sicherheit

Weiterhin verboten ohne separaten Plan + Go:

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
```

## Naechster sinnvoller Block

```text
RDAP_0.2.107_NEXT_SYSTEM_SCOPE_SELECTION
```

Ziel:
- naechsten Projektbereich bewusst auswaehlen,
- Media-Picker nicht weiter nebenbei aufblasen,
- bei neuem Runtime-Scope wieder echte Dateien lesen, Plan nennen, auf `go` warten.
