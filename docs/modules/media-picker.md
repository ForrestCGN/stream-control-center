# Media-Picker / Media-System Read-only

Stand: `0.2.106 - Media Picker Module Docs Closeout`

## Zweck

Der Media-Picker ist die mod-taugliche read-only Ansicht fuer Medien im Remote-Modboard und im lokalen Dashboard-v2.

Ziel:
- Mods koennen Medien uebersichtlich suchen und pruefen.
- Online und lokal nutzen dieselbe fachliche Bedienlogik.
- Keine Upload-/Edit-/Delete-Funktion ist aktiv.
- Keine Dateiaktion vom Webserver zum Stream-PC ist aktiv.

## UI-Wahrheit

Die fachliche UI-Wahrheit ist der Remote-Modboard Media-Picker.

Online-Datei:

```text
remote-modboard/backend/public/assets/modules/media/library.js
```

Lokale Dashboard-v2 Datei:

```text
htdocs/dashboard-v2/assets/modules/media/library.js
```

Seit `0.2.104` ist die lokale Dashboard-v2 Media-UI an den Online-Picker angeglichen.

## Runtime-Profile

```text
online: Remote-Modboard auf Webserver / Port 3010
local:  lokales Dashboard-v2 auf Stream-PC / Port 8080
```

Eine UI, zwei Runtime-Profile.

Keine zweite lokale Bedienlogik.

## Sichtbare Mod-Begriffe

In der Hauptansicht werden alltaegliche Begriffe genutzt:

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

Technische Begriffe bleiben aus der Mod-Hauptansicht raus:

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

## Online API

Online Context-Read-API:

```text
GET /api/remote/media/index/context/list
```

Quelle:
```text
remote_media_index
```

Bestaetigter Online-Stand:
```text
root_key=media:
ok = true
status = media_index_context_list_available_readonly
total = 412
readOnly = true
writeEnabled = false
databaseWriteExecuted = false

root_key=media&module_key=alerts:
total = 132

root_key=media&full_category_key=alerts/follow:
total = 53
```

## Lokale API

Lokale Context-Read-API:

```text
GET /api/remote/media/index/context/list
```

Quelle:
```text
lokales Stream-PC-Dateisystem read-only
```

Lokaler Adapter:

```text
backend/modules/local_remote_modboard_adapter.js
```

Bestaetigter lokaler API-Check:

```text
GET http://127.0.0.1:8080/api/remote/media/index/context/list?root_key=media&limit=25&offset=0
```

Ergebnis:

```text
ok                    : True
status                : local_media_context_list_available_readonly
total                 : 412
count                 : 25
readOnly              : True
writeEnabled          : False
databaseWriteExecuted : False
```

Statusroute:

```text
GET http://127.0.0.1:8080/api/remote/media/status?limit=25
```

Ergebnis:

```text
ok       : True
status   : local_media_inventory_available
readOnly : True
```

## Unterstuetzte Query-Felder

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
keine technischen Labels in der Mod-Hauptansicht
keine weissen Browser-Standard-Dropdowns
```

## Bestaetigte Tests

Nach `0.2.104` lokal bestaetigt:

```powershell
node --check .\backend\modules\local_remote_modboard_adapter.js
node --check .\htdocs\dashboard-v2\assets\modules\media\library.js
```

Beide Syntaxchecks liefen ohne Fehler.

Nach `0.2.105` browserbestaetigt:

```text
http://127.0.0.1:8080/dashboard-v2/
Media-System funktioniert wie im ModBoard.
```

## Versionsverlauf

```text
0.2.94  - Read-only DB Context API online
0.2.96  - Media Picker readonly UI online
0.2.97  - Context UI Polish
0.2.98  - Page Size Dropdown
0.2.99  - Mod-friendly Filters
0.2.100 - CGN Design Polish
0.2.101 - Pagination and Dedup live ok
0.2.102 - Online Media Picker Docs Handoff
0.2.103 - Local Media Picker Alignment Plan
0.2.104 - Local Media Picker Readonly Alignment
0.2.105 - Local Media Picker Verify and Polish Docs
0.2.106 - Media Picker Module Docs Closeout
```

## Naechster Scope

Der Media-Picker-Block ist damit fachlich dokumentiert und kann als abgeschlossener Read-only-Stand behandelt werden.

Weitere Arbeiten nur als eigener Scope, z. B.:
- kleiner UI-Alltags-Polish,
- Feld-/Filter-Kontrakt weiter vereinheitlichen,
- separater Sync-/Agent-/Permission-Scope,
- spaetere Env-Diagnose `MEDIA_INDEX_SCHEMA_WRITE_ENABLED=false`.
