# Prompt fuer neuen Chat - RDAP nach Media 0.2.77

Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache: Deutsch, kurz, direkt, pragmatisch.

WICHTIG: Bitte zuerst wirklich die relevanten Dateien auf GitHub/dev lesen und dann erst planen. Nicht aus Erinnerung arbeiten.

Repository:

- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- ZIPs liegen beim Nutzer im Downloads-Ordner.
- Webserver-Pfad: `/opt/stream-control-center`
- Webserver laeuft als root, also kein `sudo`.

Verbindlicher Workflow:

1. Erst GitHub/dev und relevante Doku-/Source-Dateien lesen.
2. Dann kurzen Plan nennen.
3. Auf explizites `go` warten.
4. Erst dann ZIP bauen.
5. ZIP muss echte Zielpfade enthalten, keinen Wrapper-Ordner.
6. Keine Patch-/Apply-Skripte.
7. Vollstaendige Ersatzdateien liefern, keine Teilpatches.
8. Nutzer spielt lokal ein mit:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\<ZIPNAME>.zip" "<Step Beschreibung>"
```

9. Danach lokale Checks/Syntax/git status.
10. Wenn sauber:

```powershell
.\stepdone.cmd "<Beschreibung>"
```

11. Webserver-Deploy nur wenn `remote-modboard/**` oder sonstige Webserver-Runtime betroffen ist.

## Aktueller Stand

GitHub/dev enthaelt den getesteten Stand nach 0.2.77.

0.2.77 ist live fachlich bestaetigt:

```text
RDAP_0.2.77_MEDIA_INDEX_DIFF_MEDIA_ROOT_READONLY_VERIFY
```

Bestaetigt auf dem Webserver:

```text
statusApiVersion = rdap_media_index_diff_media_root_readonly_verify_077.v1
readOnly = true
writeEnabled = false
```

Bestaetigt: Media-Index-Diff/Preview zeigt `media`-Items unter:

```text
.previews.newOnAgent[] | select(.rootKey=="media")
```

Bestaetigte Preview-Felder:

```text
id
rootKey
source
moduleKey
categoryKey
fullCategoryKey
assetRelativePath
webPath
publicPath
```

Bekannter Anzeige-Hinweis:

```text
moduleBuild = RDAP_0.2.28_MEDIA_AGENT_SLOW_SYNC_STATUS_POLISH_READONLY
```

Das ist fachlich nicht blockierend. Die Route nutzt bei `moduleBuild` noch globales `context.moduleBuild`; `statusApiVersion` und Verhalten bestaetigen 0.2.77.

## Bisherige Source-Schritte

0.2.73:

```text
backend/modules/remote_agent.js
```

- Lokaler Agent scannt zusaetzlich `htdocs/assets/media/<module>/<category>/...`.
- Legacy-Roots `sounds`, `videos`, `images` bleiben erhalten.
- Keine Datei-Inhalte, keine absoluten Pfade.

0.2.75:

```text
remote-modboard/backend/src/services/agent-runtime.service.js
```

- Remote-Agent-Runtime akzeptiert `media` zusaetzlich.
- Kontextfelder werden nicht mehr verworfen.
- Live bestaetigt.
- Keine Gates/DB-Writes/Deletes aktiviert.

0.2.77:

```text
remote-modboard/backend/src/routes/media-index-diff.routes.js
```

- Diff-/Preview-Route akzeptiert `media` zusaetzlich.
- Kontextfelder bleiben in Preview erhalten.
- Live fachlich bestaetigt.
- Keine Gates/DB-Writes/Deletes aktiviert.

## Naechster Block

```text
RDAP_0.2.79_MEDIA_INDEX_DIFF_ROUTE_BUILD_POLISH_READONLY
```

Ziel:

```text
Nur Anzeige-Polish:
moduleBuild/routeBuild im Diff-Endpoint sauber trennen,
damit moduleBuild nicht mehr global 0.2.28 zeigt.
Keine Funktionsaenderung. Weiterhin read-only.
```

## Relevante Dateien zuerst lesen

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
remote-modboard/backend/src/routes/media-index-diff.routes.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
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
