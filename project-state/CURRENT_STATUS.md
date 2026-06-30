# CURRENT_STATUS

Aktueller Stand: `0.2.104 - Local Media Picker Readonly Alignment`

## Kurzfazit

Der lokale Media-Picker im Dashboard-v2 ist an den bestaetigten Online-Media-Picker angeglichen.

0.2.104 ist ein lokaler Read-only-Runtime-Step:
- lokale Media-UI nutzt denselben Picker-Stand wie online,
- lokale Context-List-Route ist vorbereitet und aktiv,
- lokale Datenquelle bleibt das Stream-PC-Dateisystem read-only,
- keine Upload/Edit/Delete-Aktion,
- keine DB-Writes,
- keine Gates,
- keine Agent-Actions,
- kein Online->Agent Datei-Trigger.

## Geaenderte Runtime-Dateien

```text
backend/modules/local_remote_modboard_adapter.js
htdocs/dashboard-v2/assets/modules/media/library.js
```

## Lokale API

Neue lokale Read-only-Route:

```text
GET /api/remote/media/index/context/list
```

Die Route liefert denselben Grundkontrakt fuer den Picker wie online:

```text
ok
status
runtimeMode
readOnly
writeEnabled
databaseWriteExecuted
filters
limit
offset
count
total
hasMore
items
counts
safety
```

Unterstuetzte Query-Felder:

```text
root_key
module_key
category_key
full_category_key
kind
limit
offset
```

## Lokale Media-Wurzeln

Der lokale Adapter scannt read-only:

```text
htdocs/assets/sounds
htdocs/assets/videos
htdocs/assets/images
htdocs/assets/media
```

Absolute Pfade werden nicht an die Mod-Hauptansicht ausgegeben.

## UI-Stand

Lokale Datei:

```text
htdocs/dashboard-v2/assets/modules/media/library.js
```

wurde auf den Online-Picker-Stand angeglichen:

```text
remote-modboard/backend/public/assets/modules/media/library.js
```

Sichtbare Mod-Begriffe bleiben:

```text
Bereich
Ordner
Dateityp
Anzahl
Anzeigen
Filter zuruecksetzen
```

Technische Begriffe bleiben aus der Hauptansicht raus:

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
```

## Erwartete lokale Checks

```powershell
node --check .\backend\modules\local_remote_modboard_adapter.js
node --check .\htdocs\dashboard-v2\assets\modules\media\library.js

Invoke-RestMethod "http://127.0.0.1:8080/api/remote/media/index/context/list?root_key=media&limit=25&offset=0" | Select-Object ok,status,total,count,readOnly,writeEnabled,databaseWriteExecuted
```

Erwartung:

```text
ok = True
status = local_media_context_list_available_readonly
readOnly = True
writeEnabled = False
databaseWriteExecuted = False
```

## Naechster sinnvoller Block

```text
RDAP_0.2.105_LOCAL_MEDIA_PICKER_VERIFY_AND_POLISH
```

Ziel:
- lokalen Picker im Browser pruefen,
- Filter/Pagination gegen echte lokale Dateien bestaetigen,
- nur falls noetig kleine UI-Polish-Korrektur,
- keine Writes.
