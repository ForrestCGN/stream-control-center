# CURRENT_STATUS

Aktueller Stand: `0.2.94 - Media Index DB Context Read API readonly fixed live bestaetigt`

## Kurzfazit

Der Media-System-Index ist vollstaendig in `remote_media_index` vorhanden. Der Post-Upsert-Verify ist bestaetigt und die neue read-only Kontextlisten-API ist live bestaetigt.

Bestaetigt auf dem Webserver am 2026-06-30:

```text
remote_media_index aktiv:
images = 46
media  = 412
sounds = 276
videos = 10
gesamt = 744
```

## 0.2.94 Live-Bestaetigung

Neue Route:

```text
GET /api/remote/media/index/context/list
```

Bestaetigte Checks:

```text
root_key=media:
ok = true
status = media_index_context_list_available_readonly
count = 5
total = 412
readOnly = true
writeEnabled = false
databaseWriteExecuted = false

root_key=media&module_key=alerts:
total = 132
filters.rootKey = media
filters.moduleKey = alerts

root_key=media&full_category_key=alerts/follow:
total = 53
filters.rootKey = media
filters.fullCategoryKey = alerts/follow
```

Die Route liefert sichere Kontext-/Media-Felder aus `remote_media_index`:

```text
id
rootKey
kind
relativePath
name
extension
sizeBytes
modifiedAt
lastSeenAt
source
moduleKey
categoryKey
fullCategoryKey
assetRelativePath
webPath
publicPath
syncVersion
readOnly
writeEnabled
```

## 0.2.93 Post-Upsert-Verify

```text
Diff:
moduleBuild = RDAP_0.2.91_MEDIA_INDEX_UPSERT_CANDIDATES_FIELD_FIX_GATED
statusApiVersion = rdap_media_index_upsert_candidates_field_fix_gated_091.v1
fullSync = full_sync_compare_available_missing_reliable
fullItems = 744
dbTotal = 744
newOnAgent = 0
missingReliable = true

Upsert Preview:
ok = true
status = media_index_upsert_preview_available_readonly
candidateCount = 0
byRoot = {}
byKind = {}
```

Audit-Readback bestaetigt:

```text
2026-06-30 12:04:41 | remote-modboard/rdap089 | media_index.upsert.with_context                  | remote_media_index | success
2026-06-30 11:41:03 | remote-modboard/rdap088 | media_index.schema_extension.add_context_columns | remote_media_index | success
```

## Gates / Sicherheit

Runtime/Env-Check nach produktivem Execute:

```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_UPSERT_WRITE_ENABLED=false
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=false
```

Hinweis:
`MEDIA_INDEX_SCHEMA_WRITE_ENABLED` war in der Env-Ausgabe nicht explizit vorhanden. Das ist praktisch blockierend/sicher, weil der Code bei fehlender Variable auf `false` faellt. Fuer bessere Diagnostik soll die Variable spaeter explizit als `false` in der Env stehen, aber nicht nebenbei in einem API-Step.

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

## Kontextspalten

Die Media-System-Kontextspalten sind vorhanden und fuer `root_key = media` befuellt:

```text
module_key
category_key
full_category_key
asset_relative_path
web_path
public_path
```

## Bestaetigte Module/Kategorien im DB-Readback

```text
general       137
alerts        132
stream_events 35
vip           31
commands      26
channelpoints 25
birthday      9
shot_alarm    6
vip30         6
audio         2
hypetrain     2
twitch_events 1
```

Beispiele fuer `full_category_key`:

```text
general/audio                66
alerts/follow                53
alerts/bits                  49
general/intro                43
stream_events/1-jahres-event 35
vip/general                  31
channelpoints/general        25
commands/general             25
alerts/sub                   22
general/images               13
```

## Was bei neuen lokalen Kategorien/Modulen passiert

Neue Kategorien oder Module brauchen keine weitere DB-Migration. Sie werden als neue Zeilen in `remote_media_index` gespeichert:

```text
root_key = media
module_key = <modul>
category_key = <kategorie>
full_category_key = <modul>/<kategorie>
asset_relative_path = <modul>/<kategorie>/<datei>
web_path/public_path = passende Public-Pfade
```

Ablauf spaeter:

```text
1. Lokal neue Datei/Kategorie/Modul entsteht.
2. Agent FullSync erkennt sie.
3. Diff/Upsert-Preview zeigt neue Kandidaten.
4. Gated Upsert schreibt nur neue/geaenderte Zeile.
5. Kontextlisten-API kann die neue Zeile read-only anzeigen.
```

## RDAP-Verlauf seit 0.2.79

### 0.2.79 - Route Build Polish readonly

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `moduleBuild`/`routeBuild` sauber getrennt.
- Keine Writes.

### 0.2.80 bis 0.2.82 - FullSync/DB Readiness readonly

- FullSyncCompare bestaetigt: `fullItems = 744`.
- DB hatte vorher `332` aktive Legacy-Items.
- FullSync vs DB: `412` neue Agent-Items unter `root_key = media`.
- Keine Writes.

### 0.2.83 - FullSync Summary readonly

- Echte Summary ueber volle FullSync-Listen ergaenzt.
- Bestaetigt: `media=412`, `audio=335`, `image=42`, `video=35`.

### 0.2.84 - DB-Schema pruefen readonly

- Tabelle: `c3stream_control.remote_media_index`.
- Vor der Migration fehlten Kontextspalten.

### 0.2.85 - Upsert Preview readonly

- Route: `/api/remote/media/index/upsert/preview`.
- Bestaetigt: `candidateCount = 412`.

### 0.2.86 - Upsert Execute Foundation blocked

- Route: `/api/remote/media/index/upsert/execute` vorbereitet.
- Confirm + expectedCount + Gates vorbereitet.
- Gate blockiert, kein Write.

### 0.2.87 - Schema Extension Foundation blocked

- Routes:
  - `/api/remote/media/index/schema/extension/preview`
  - `/api/remote/media/index/schema/extension/execute`
- Preview zeigte `missingColumnCount = 6`.
- Execute default blockiert.

### 0.2.88 - Schema Extension Execute gated

- 6 Kontextspalten angelegt.
- Audit geschrieben.
- Readback bestaetigt: `allColumnsPresent = true`.

### 0.2.89 - Upsert with Context gated

- Produktiver Kontext-Upsert implementiert.
- Erster Execute-Versuch schlug wegen fehlendem Candidate-Array mit 500 fehl.
- Kein Write passiert.

### 0.2.90 - Upsert Candidates Fix gated

- 500 verhindert, sichere Blockade statt Crash.
- Kein Write.

### 0.2.91 - Upsert Candidates Field Fix gated

- `candidates` im Execute-Snapshot ergaenzt.
- Gate-false Test erfolgreich blockiert.
- Danach produktiver Upsert mit Gates true erfolgreich ausgefuehrt.

### 0.2.93 - Post-Upsert Verify readonly

- Gates read-only geprueft.
- FullSyncCompare `fullItems=744`, `dbTotal=744`, `newOnAgent=0`.
- Upsert-Preview `candidateCount=0`.
- Audit success.
- Keine Code-Aenderung, keine DB-Writes, kein Deploy.

### 0.2.94 - DB Context Read API readonly fixed

- Bestehende Datei `remote-modboard/backend/src/routes/media-index-diff.routes.js` erweitert.
- `remote-modboard/backend/src/routes/routes.routes.js` um Routenanzeige ergaenzt.
- Keine neue Moduldatei, keine `app.js`-Aenderung.
- Live bestaetigt: `media=412`, `alerts=132`, `alerts/follow=53`.
- Keine DB-Writes, keine Gates, keine Migration.

## Wichtige Eigenheit

FullSyncCompare ist aktuell Runtime-Speicher. Nach Service-Restart ist der Snapshot zunaechst leer/pending, bis der Agent wieder einen vollstaendigen FullSync geliefert hat.

Vor jedem Upsert-Execute erst pruefen:

```bash
curl -sS http://127.0.0.1:3010/api/remote/media/index/upsert/preview \
  | jq '{ok,status,candidateCount,byRoot,byKind}'
```

## Aktuell naechster sinnvoller Block

```text
Media-Picker/API-Consumer fuer Remote-Modboard UI planen
```

Ziel grob:

```text
- Bestehende Kontextlisten-API read-only nutzen.
- UI-Auswahl fuer Media-Assets planen.
- Keine Upload/Edit/Delete-Aktion.
- Keine DB-Writes.
```
