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

`0.2.93 - Media Index Post-Upsert Verify readonly bestaetigt`

Wichtigster bestaetigter Erfolg:

```text
remote_media_index aktiv:
images = 46
media  = 412
sounds = 276
videos = 10
gesamt = 744
```

Post-Upsert Verify 0.2.93 bestaetigt:

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

Kontextspalten sind vorhanden und fuer `root_key = media` befuellt:

```text
module_key
category_key
full_category_key
asset_relative_path
web_path
public_path
```

DB-Readback nach 0.2.93:

```text
root_key counts:
images 46
media 412
sounds 276
videos 10

module_key counts fuer root_key=media:
general 137
alerts 132
stream_events 35
vip 31
commands 26
channelpoints 25
birthday 9
shot_alarm 6
vip30 6
audio 2
hypetrain 2
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

Wichtige Erkenntnis fuer neue Kategorien/Module:

Neue lokale Kategorien/Module brauchen keine neuen DB-Spalten. Sie werden als neue Zeilen gespeichert:

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
Agent FullSync erkennt neue Datei -> Upsert Preview zeigt Kandidat -> Gated Upsert schreibt neue/geaenderte Zeile.
```

RDAP-Verlauf seit 0.2.79 kurz:

* 0.2.79: Diff Route Build Polish readonly, `moduleBuild`/`routeBuild` getrennt.
* 0.2.80-0.2.82: FullSync/DB Readiness readonly, 744 FullSync-Items, DB vorher 332, neue `media`-Items 412.
* 0.2.83: FullSync Summary readonly, echte Aufteilung: audio 335, image 42, video 35.
* 0.2.84: DB-Schema read-only geprueft, Tabelle `c3stream_control.remote_media_index`.
* 0.2.85: Upsert Preview readonly, 412 Kandidaten bestaetigt.
* 0.2.86: Upsert Execute Foundation blocked, Gates blockieren korrekt.
* 0.2.87: Schema Extension Foundation blocked, 6 fehlende Kontextspalten bestaetigt.
* 0.2.88: Schema Extension Execute gated, 6 Spalten angelegt, Audit geschrieben.
* 0.2.89: Upsert with Context gated, erster Execute 500 wegen fehlendem `snapshot.candidates`, kein Write.
* 0.2.90: Sicherheitsfix gegen 500, kein Write.
* 0.2.91: Candidate-Feld-Fix, Gate-false Test sauber, produktiver Upsert erfolgreich.
* 0.2.93: Post-Upsert Verify readonly bestaetigt, FullSync 744, DB 744, Upsert Preview 0 Kandidaten, Audit success.

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
Spaeter fuer bessere Diagnose explizit als false setzen, aber nicht nebenbei in einem API-Step.
```

Wichtige Eigenheit:

FullSyncCompare ist aktuell Runtime-Speicher. Nach Service-Restart ist der Snapshot leer/pending, bis der Agent wieder einen kompletten FullSync geschickt hat.

Vor jedem Upsert- oder Verify-Schritt erst pruefen:

```bash
curl -sS http://127.0.0.1:3010/api/remote/media/index/upsert/preview \
  | jq '{ok,status,candidateCount,byRoot,byKind}'
```

Naechster sinnvoller Block:

`RDAP_0.2.94_MEDIA_INDEX_DB_CONTEXT_READ_API_READONLY`

Ziel:

```text
- Read-only API fuer Media-Index-Kontextlisten.
- Filter nach module_key/category_key/full_category_key/kind/root_key.
- Grundlage fuer spaetere UI-Auswahl und Modul-Media-Picker.
- Keine Writes.
```

Moeglicher Route-Vorschlag:

```text
GET /api/remote/media/index/context/list
```

Relevante Dateien zuerst lesen:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
remote-modboard/backend/src/routes/media-index-diff.routes.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/config.service.js
```

Optional pruefen, falls Route-Registrierung unklar ist:

```text
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/*.routes.js
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
