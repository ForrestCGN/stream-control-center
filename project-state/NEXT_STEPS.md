# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.76

`RDAP_0.2.77_MEDIA_INDEX_DIFF_MEDIA_ROOT_READONLY_VERIFY`

## Ausgangslage

`RDAP_0.2.75_MEDIA_INDEX_REMOTE_AGENT_MEDIA_ROOT_REMOTE_ACCEPT_READONLY` ist live bestaetigt.

Bestaetigt auf dem Webserver:

```text
moduleBuild = RDAP_0.2.75_MEDIA_INDEX_REMOTE_AGENT_MEDIA_ROOT_REMOTE_ACCEPT_READONLY
counts.media = 34
groups.media.count = 34
```

Bestaetigt: Items mit `rootKey = media` kommen remote mit Kontextfeldern an:

```text
source
moduleKey
categoryKey
fullCategoryKey
assetRelativePath
webPath
publicPath
```

## Ziel fuer 0.2.77

- Media-Index-Diff/Preview read-only pruefen.
- Pruefen, ob `media`-Root im Diff-/Preview-Kontext sichtbar oder noch blockiert ist.
- Pruefen, ob `source`, `moduleKey`, `categoryKey`, `fullCategoryKey`, `assetRelativePath`, `webPath`/`publicPath` erhalten bleiben.
- Falls `remote-modboard/backend/src/routes/media-index-diff.routes.js` noch nur `sounds/videos/images` kennt, separaten kleinen Remote-Diff-Kompatibilitaets-Step planen.
- Keine DB-Writes, keine Gates, kein Tombstone-Execute.

## Relevante Dateien zuerst lesen

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
backend/modules/remote_agent.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/media-index-diff.routes.js
remote-modboard/backend/src/routes/media-index-preview.routes.js
remote-modboard/backend/src/routes/media-index.routes.js
```

Falls einzelne Preview-/Index-Dateien nicht existieren, ueber GitHub-Suche nach `media-index` und `MEDIA_ROOT_KEYS` suchen.

## Voraussichtliche Read-only-Pruefungen

Remote:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/media/inventory/status \
  | jq '.moduleBuild, .counts.media, .groups.media.count'

curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status \
  | jq '{ok,moduleBuild,statusApiVersion,status,readOnly,writeEnabled}'
```

Nur kurze Ausgaben verwenden, keine kompletten grossen JSON-Dumps.

## Weiterhin verboten ohne separaten Ausfuehrungs-Go

```text
- keine Testdatei automatisch anlegen
- keine lokale Datei verschieben
- keine lokale Datei loeschen
- keine DB-Zeile veraendern
- keine Gates aktivieren
- keinen echten Tombstone-Write ausfuehren
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- kein Blind-Auto-Sync
```
