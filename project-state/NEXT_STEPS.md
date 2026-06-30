# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.96_MEDIA_PICKER_READONLY_PLAN`

## Ausgangslage

`RDAP_0.2.94_MEDIA_INDEX_DB_CONTEXT_READ_API_READONLY_FIXED` ist auf dem Webserver live bestaetigt.

Bestaetigt:

```text
GET /api/remote/media/index/context/list
```

Live-Checks:

```text
root_key=media:
ok=true
status=media_index_context_list_available_readonly
count=5
total=412
readOnly=true
writeEnabled=false
databaseWriteExecuted=false

root_key=media&module_key=alerts:
total=132

root_key=media&full_category_key=alerts/follow:
total=53
```

Umsetzung 0.2.94:

```text
remote-modboard/backend/src/routes/media-index-diff.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

Wichtig: Kein neues Modul, keine neue Route-Datei, keine `app.js`-Aenderung.

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
keine File-Aktion vom Webserver zum Stream-PC
```

Gates bleiben geschlossen:

```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_UPSERT_WRITE_ENABLED=false
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=false
```

Hinweis:
`MEDIA_INDEX_SCHEMA_WRITE_ENABLED` war beim 0.2.93-Check nicht explizit in der Env-Ausgabe vorhanden. Der Code behandelt fehlende Boolean-Env-Werte als `false`. Fuer bessere Diagnose spaeter explizit als `false` setzen, aber nicht nebenbei in einem API-/UI-Step.

## Ziel fuer den naechsten fachlichen Block

Media-Picker/API-Consumer fuer Remote-Modboard UI planen.

Moeglicher Scope:

```text
- vorhandene read-only Kontextlisten-API nutzen
- Filter UI fuer root_key/module_key/category_key/full_category_key/kind
- Asset-Liste fuer ausgewaehlten Kontext anzeigen
- keine Upload/Edit/Delete-Aktion
- keine DB-Writes
- keine Agent-Aktion
```

## Relevante Dateien zuerst lesen

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

Je nach UI-Struktur zusaetzlich relevante Public-Dateien suchen/lesen, bevor geplant wird.

## Voraussichtliche Vorab-Checks

API read-only:

```bash
curl -fsS 'http://127.0.0.1:3010/api/remote/media/index/context/list?root_key=media&limit=5' \
  | jq '{ok,status,count,total,readOnly,writeEnabled,databaseWriteExecuted}'

curl -fsS 'http://127.0.0.1:3010/api/remote/media/index/context/list?root_key=media&module_key=alerts&limit=5' \
  | jq '{ok,status,count,total,filters}'

curl -fsS 'http://127.0.0.1:3010/api/remote/media/index/context/list?root_key=media&full_category_key=alerts/follow&limit=5' \
  | jq '{ok,status,count,total,filters}'
```

## Danach sinnvoll

Erst nach separatem Plan + Go:

```text
RDAP_0.2.96_MEDIA_PICKER_READONLY_PLAN
```
