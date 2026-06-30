# CURRENT_STATUS

Aktueller Stand: `0.2.93 - Media Index Post-Upsert Verify readonly bestaetigt`

## Kurzfazit

Der Media-System-Index ist vollstaendig in `remote_media_index` vorhanden und der Post-Upsert-Verify nach dem produktiven Context-Upsert ist read-only bestaetigt.

Bestaetigt auf dem Webserver am 2026-06-30:

```text
remote_media_index aktiv:
images = 46
media  = 412
sounds = 276
videos = 10
gesamt = 744
```

Post-Upsert-Verify 0.2.93:

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
`MEDIA_INDEX_SCHEMA_WRITE_ENABLED` war in der Env-Ausgabe nicht explizit vorhanden. Das ist praktisch blockierend/sicher, weil der Code bei fehlender Variable auf `false` faellt. Fuer bessere Diagnostik soll die Variable spaeter explizit als `false` in der Env stehen, aber das ist kein funktionaler Blocker.

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

Die neuen Media-System-Kontextspalten sind vorhanden und fuer `root_key = media` befuellt:

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

Beispiele fuer `full_category_key` aus dem Readback:

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
general/video                7
shot_alarm/shot-system       6
vip30/general                6
alerts/donation              4
birthday/general             4
birthday/party-songs         3
general/general              3
general/transitions          3
alerts/raid                  2
hypetrain/general            2
alerts/kofi                  1
alerts/tipeee                1
audio/roxxyfoxxy_cgn_2.mp3   1
audio/udos_skatebord.mp3     1
birthday/default-song        1
birthday/user-songs          1
commands/roxxy               1
general/outro                1
general/test                 1
twitch_events/hypetrain      1
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
4. Gated Upsert schreibt nur neue/geaenderte DB-Zeilen.
5. Keine neue Spalte noetig.
```

## RDAP-Verlauf seit 0.2.79

### 0.2.79 - Route Build Polish readonly

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `moduleBuild`/`routeBuild` sauber getrennt.
- Bestaetigt: `moduleBuild = RDAP_0.2.79_MEDIA_INDEX_DIFF_ROUTE_BUILD_POLISH_READONLY`.
- `appModuleBuild` zeigt weiterhin den globalen App-Build.
- Keine Writes.

### 0.2.80 bis 0.2.82 - FullSync/DB Readiness readonly

- FullSyncCompare bestaetigt: `fullItems = 744`.
- DB hatte vorher `332` aktive Legacy-Items.
- FullSync vs DB: `412` neue Agent-Items unter `root_key = media`.
- 332 Legacy-Items hatten nur Softdiff bei `modified_at`.
- Keine Writes.

### 0.2.83 - FullSync Summary readonly

- Echte Summary ueber volle FullSync-Listen ergaenzt.
- Bestaetigt:

```text
newOnAgentCount = 412
newOnAgentByRoot.media = 412
newOnAgentByKind.image = 42
newOnAgentByKind.audio = 335
newOnAgentByKind.video = 35
```

### 0.2.84 - DB-Schema pruefen readonly

- Tabelle liegt in Schema `c3stream_control`.
- Tabelle: `c3stream_control.remote_media_index`.
- Vor der Migration fehlten Kontextspalten.

### 0.2.85 - Upsert Preview readonly

- Route: `/api/remote/media/index/upsert/preview`.
- Bestaetigt:

```text
candidateCount = 412
byRoot.media = 412
byKind.image = 42
byKind.audio = 335
byKind.video = 35
databaseWriteExecuted = false
```

### 0.2.86 - Upsert Execute Foundation blocked

- Route: `/api/remote/media/index/upsert/execute` vorbereitet.
- Confirm + expectedCount + Gates vorbereitet.
- Bestaetigt: Gate blockiert, kein Write.

### 0.2.87 - Schema Extension Foundation blocked

- Routes:
  - `/api/remote/media/index/schema/extension/preview`
  - `/api/remote/media/index/schema/extension/execute`
- Preview zeigte `missingColumnCount = 6`.
- Execute war default blockiert.

### 0.2.88 - Schema Extension Execute gated

- Echte Schema-Erweiterung hinter Gates implementiert.
- Bestaetigt:

```text
status = media_index_schema_extension_execute_success
beforeMissingColumnCount = 6
afterMissingColumnCount = 0
databaseWriteExecuted = true
schemaWriteExecuted = true
alterTableExecuted = true
auditWritten = true
```

- Readback bestaetigt: `allColumnsPresent = true`.

### 0.2.89 - Upsert with Context gated

- Produktiver Kontext-Upsert implementiert.
- Erster Execute-Versuch schlug wegen fehlendem Candidate-Array mit 500 fehl.
- Bestaetigt: kein Write passiert, DB blieb bei Legacy-Roots.

### 0.2.90 - Upsert Candidates Fix gated

- 500 verhindert, sichere Blockade statt Crash.
- Noch nicht ausreichend, weil Candidate-Feld im Snapshot weiter fehlte.
- Kein Write.

### 0.2.91 - Upsert Candidates Field Fix gated

- `candidates` im Execute-Snapshot ergaenzt.
- Gate-false Test erfolgreich blockiert.
- Danach produktiver Upsert mit Gates true erfolgreich ausgefuehrt.

### 0.2.93 - Post-Upsert Verify readonly

- Gates nach produktivem Execute read-only geprueft.
- FullSyncCompare zeigt `fullItems=744`, `dbTotal=744`, `newOnAgent=0`.
- Upsert-Preview zeigt `candidateCount=0`.
- SQL-Readback bestaetigt 744 aktive DB-Eintraege.
- Audit-Readback bestaetigt Schema-Extension und Upsert jeweils `success`.
- Keine Code-Aenderung, keine DB-Writes, kein Deploy.

## Wichtige Eigenheit

FullSyncCompare ist aktuell Runtime-Speicher. Nach Service-Restart ist der Snapshot zunaechst leer/pending, bis der Agent wieder einen vollstaendigen FullSync geliefert hat.

Daher vor jedem Upsert-Execute erst pruefen:

```bash
curl -sS http://127.0.0.1:3010/api/remote/media/index/upsert/preview \
  | jq '{ok,status,candidateCount,byRoot,byKind}'
```

Nur wenn `ok=true` und `candidateCount` plausibel ist, Execute planen.

## Aktuell naechster sinnvoller Block

```text
RDAP_0.2.94_MEDIA_INDEX_DB_CONTEXT_READ_API_READONLY
```

Ziel:

```text
- Read-only API fuer Media-Index-Kontextlisten planen und bauen.
- Filter nach module_key/category_key/full_category_key/kind.
- Grundlage fuer spaetere UI-Auswahl und Modul-Media-Picker.
- Keine Writes.
```
