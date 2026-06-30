Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG ZUERST:

* Masterprompt lesen und anwenden.
* GitHub/dev ist Wahrheit.
* Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten.
* Keine ZIPs vor `go`.
* Keine Funktionalitaet entfernen.
* Keine Mini-Steps ohne Not. Schritte so gross wie sinnvoll und so klein wie sicher noetig.
* Keine Patch-/Apply-/Regex-/Set-Content-/Append-Scripte. Wenn Dateien geaendert werden: aktuelle komplette Datei lesen und vollstaendige Ersatzdatei liefern.
* Keine neuen Module/Dateien ohne Not. Bestehende Struktur bevorzugen.

Repository:

* GitHub: `ForrestCGN/stream-control-center`
* Branch: `dev`
* Lokales Repo: `D:\Git\stream-control-center`
* Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
* Remote-Modboard live: `https://mods.forrestcgn.de/`
* Webserver-Pfad: `/opt/stream-control-center`
* Webserver laeuft als root, also kein `sudo`.

Verbindlicher Workflow:

1. Erst GitHub/dev und relevante Doku-Dateien lesen.
2. Dann kurzen Plan nennen.
3. Auf mein `go` warten.
4. Erst dann ZIP bauen.
5. ZIP muss echte Zielpfade enthalten, keinen Wrapper-Ordner.
6. Ich spiele lokal ein mit:

   ```powershell
   cd D:\Git\stream-control-center
   .\installstep.cmd "$env:USERPROFILE\Downloads\<ZIPNAME>.zip" "<Step Beschreibung>"
   ```

7. Danach lokale Checks/Syntax/git status.
8. Wenn sauber:

   ```powershell
   .\stepdone.cmd "<Step Beschreibung>"
   ```

9. Danach Webserver-Deploy aus GitHub/dev nur bei Code-/Remote-Modboard-Aenderungen:

   ```bash
   bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh <STEP_NAME> dev
   ```

10. Danach gezielte curl/jq/mysql Checks.

Aktueller RDAP-Stand:

`0.2.94 - Media Index DB Context Read API readonly fixed live bestaetigt`

Wichtigster bestaetigter Erfolg:

```text
GET /api/remote/media/index/context/list
```

Live bestaetigt:

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

0.2.94 Umsetzung:

```text
remote-modboard/backend/src/routes/media-index-diff.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

Wichtig: 0.2.94 fixed wurde ohne neues Modul umgesetzt. Keine neue Route-Datei, keine `app.js`-Aenderung.

Bestaetigter Gesamtindex:

```text
remote_media_index aktiv:
images = 46
media  = 412
sounds = 276
videos = 10
gesamt = 744
```

Kontextspalten sind vorhanden und fuer `root_key = media` befuellt:

```text
module_key
category_key
full_category_key
asset_relative_path
web_path
public_path
```

Bestaetigte Module/Kategorien:

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

full_category_key Beispiele:

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

0.2.93 Post-Upsert Verify ebenfalls bestaetigt:

```text
Diff:
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

Wichtige Gates:

```text
MEDIA_INDEX_WRITE_ENABLED
MEDIA_INDEX_SCHEMA_WRITE_ENABLED
MEDIA_INDEX_DATA_WRITE_ENABLED
MEDIA_INDEX_UPSERT_WRITE_ENABLED
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED
```

Nach produktiven Executes muessen Gates geschlossen sein:

```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_SCHEMA_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_UPSERT_WRITE_ENABLED=false
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=false
```

0.2.93-Hinweis:

```text
MEDIA_INDEX_SCHEMA_WRITE_ENABLED war in der Env-Ausgabe nicht explizit vorhanden.
Das ist praktisch sicher/blockierend, weil fehlende Boolean-Env im Code auf false faellt.
Spaeter fuer bessere Diagnose explizit als false setzen, aber nicht nebenbei in einem API-/UI-Step.
```

Wichtige Eigenheit:

FullSyncCompare ist aktuell Runtime-Speicher. Nach Service-Restart ist der Snapshot leer/pending, bis der Agent wieder einen kompletten FullSync geschickt hat.

Vor jedem Upsert- oder Verify-Schritt erst pruefen:

```bash
curl -sS http://127.0.0.1:3010/api/remote/media/index/upsert/preview \
  | jq '{ok,status,candidateCount,byRoot,byKind}'
```

Naechster sinnvoller Block:

`RDAP_0.2.96_MEDIA_PICKER_READONLY_PLAN`

Ziel grob:

```text
- vorhandene read-only Kontextlisten-API nutzen
- Filter UI fuer root_key/module_key/category_key/full_category_key/kind planen
- Asset-Liste fuer ausgewaehlten Kontext anzeigen
- Keine Upload/Edit/Delete-Aktion
- Keine DB-Writes
- Keine Agent-Aktion
```

Relevante Dateien zuerst lesen:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
remote-modboard/backend/src/routes/media-index-diff.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/public/index.html
remote-modboard/backend/src/public/*.js
remote-modboard/backend/src/public/*.css
```

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
