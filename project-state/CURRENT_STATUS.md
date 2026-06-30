# CURRENT_STATUS

Aktueller Stand: `0.2.91 - Media Index Upsert Candidates Field Fix gated + produktiver Context-Upsert bestaetigt`

## Kurzfazit

Der Media-System-Index ist jetzt vollstaendig in `remote_media_index` vorhanden.

Bestaetigt auf dem Webserver:

```text
remote_media_index aktiv:
images = 46
media  = 412
sounds = 276
videos = 10
gesamt = 744
```

Die neuen Media-System-Kontextspalten wurden angelegt und fuer `root_key = media` befuellt:

```text
module_key
category_key
full_category_key
asset_relative_path
web_path
public_path
```

Produktiver Upsert wurde bestaetigt:

```text
status = media_index_upsert_with_context_execute_success
candidateCount = 412
affectedRows = 412
presentAfterCount = 412
missingAfterCount = 0
databaseWriteExecuted = true
upsertExecuted = true
auditWritten = true
readBackPerformed = true
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
alerts/bits
alerts/donation
alerts/follow
alerts/raid
alerts/sub
birthday/general
channelpoints/general
commands/general
general/audio
general/intro
general/images
general/transitions
stream_events/1-jahres-event
vip/general
vip30/general
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

## Sicherheit / Gates

Schema- und Data-Writes waren nur mit expliziten Gates moeglich.

Verwendete Gates:

```text
MEDIA_INDEX_WRITE_ENABLED
MEDIA_INDEX_SCHEMA_WRITE_ENABLED
MEDIA_INDEX_DATA_WRITE_ENABLED
MEDIA_INDEX_UPSERT_WRITE_ENABLED
```

Nach produktiven Executes muessen Gates wieder geschlossen bleiben:

```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_SCHEMA_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_UPSERT_WRITE_ENABLED=false
```

Weiterhin verboten ohne separaten Plan + Go:

```text
kein Hard-Delete
kein physisches Loeschen
kein Online->Agent-Trigger
keine Dateiaktion
keine Upload/Edit/Delete-Aktion
keine Blind-Migration
keine Gates dauerhaft offen lassen
```

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
RDAP_0.2.93_MEDIA_INDEX_POST_UPSERT_VERIFY_READONLY
```

Ziel:

```text
- Gates geschlossen verifizieren.
- Upsert-Preview nach FullSync soll candidateCount=0 zeigen.
- Diff/FullSyncCompare soll total 744 und DB total 744 zeigen.
- Kontextfelder stichprobenartig per read-only SQL/API pruefen.
- Keine Code-Aenderung, keine Writes.
```
