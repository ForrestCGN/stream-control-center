# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.78

`RDAP_0.2.79_MEDIA_INDEX_DIFF_ROUTE_BUILD_POLISH_READONLY`

## Ausgangslage

`RDAP_0.2.77_MEDIA_INDEX_DIFF_MEDIA_ROOT_READONLY_VERIFY` ist live fachlich bestaetigt.

Bestaetigt auf dem Webserver:

```text
statusApiVersion = rdap_media_index_diff_media_root_readonly_verify_077.v1
readOnly = true
writeEnabled = false
```

Bestaetigt: `media`-Items erscheinen in der Diff-/Preview-Ausgabe und behalten Kontextfelder:

```text
rootKey
source
moduleKey
categoryKey
fullCategoryKey
assetRelativePath
webPath
publicPath
```

Auffaellig, aber nicht blockierend:

```text
moduleBuild = RDAP_0.2.28_MEDIA_AGENT_SLOW_SYNC_STATUS_POLISH_READONLY
```

Die Route zeigt bei `moduleBuild` noch den globalen Kontext-Build, obwohl `statusApiVersion` und Verhalten 0.2.77 sind.

## Ziel fuer 0.2.79

- Reiner Anzeige-/Status-Polish im Diff-Endpoint.
- `moduleBuild` und `routeBuild` sauber trennen.
- Der Diff-Endpoint soll seinen eigenen Route-Build sichtbar machen.
- Keine Funktionsaenderung am Diff.
- Keine DB-Writes, keine Gates, kein Tombstone-Execute.

## Relevante Dateien zuerst lesen

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
remote-modboard/backend/src/routes/media-index-diff.routes.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Voraussichtliche Aenderung

Nur falls nach Dateipruefung bestaetigt:

```text
remote-modboard/backend/src/routes/media-index-diff.routes.js
```

Moegliche Anpassung:

```text
moduleBuild: BUILD
appModuleBuild oder contextModuleBuild: context.moduleBuild || null
routeBuild: BUILD
```

Wichtig: Keine bestehende Information entfernen, sondern nur sauberer benennen/ergaenzen.

## Voraussichtliche Read-only-Pruefungen

Lokal:

```powershell
node --check .\remote-modboard\backend\src\routes\media-index-diff.routes.js
git status
```

Remote nach Deploy:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status \
  | jq '{moduleBuild,routeBuild,statusApiVersion,readOnly,writeEnabled}'
```

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
