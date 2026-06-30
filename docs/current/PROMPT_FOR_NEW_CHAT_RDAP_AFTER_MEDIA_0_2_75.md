# Prompt fuer neuen Chat - RDAP nach Media 0.2.75

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

GitHub/dev enthaelt den getesteten Stand nach 0.2.75.

0.2.75 ist live bestaetigt:

```text
RDAP_0.2.75_MEDIA_INDEX_REMOTE_AGENT_MEDIA_ROOT_REMOTE_ACCEPT_READONLY
```

Bestaetigt auf dem Webserver:

```text
moduleBuild = RDAP_0.2.75_MEDIA_INDEX_REMOTE_AGENT_MEDIA_ROOT_REMOTE_ACCEPT_READONLY
counts.media = 34
groups.media.count = 34
```

Bestaetigt: Remote-Modboard akzeptiert `rootKey = media` read-only und erhaelt Kontextfelder:

```text
source
moduleKey
categoryKey
fullCategoryKey
assetRelativePath
webPath
publicPath
```

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

## Naechster Block

```text
RDAP_0.2.77_MEDIA_INDEX_DIFF_MEDIA_ROOT_READONLY_VERIFY
```

Ziel:

```text
Pruefen, ob media-Root auch im Media-Index-Diff/Preview sauber sichtbar ist.
Weiterhin read-only. Keine DB-Writes, keine Gates, keine Deletes.
```

## Relevante Dateien zuerst lesen

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
backend/modules/remote_agent.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/media-index-diff.routes.js
```

Falls vorhanden bzw. per GitHub-Suche relevant:

```text
remote-modboard/backend/src/routes/media-index-preview.routes.js
remote-modboard/backend/src/routes/media-index.routes.js
```

Bitte auch nach `MEDIA_ROOT_KEYS`, `remote_media_index`, `media-index` und `rootKey` suchen, bevor geplant wird.

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
