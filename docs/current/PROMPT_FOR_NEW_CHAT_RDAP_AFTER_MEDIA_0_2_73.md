# Prompt fuer neuen Chat - RDAP nach Media 0.2.73

Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

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
3. Auf mein `go` warten.
4. Erst dann ZIP bauen.
5. ZIP muss echte Zielpfade enthalten, keinen Wrapper-Ordner.
6. Keine Patch-/Apply-Skripte.
7. Ich spiele lokal ein mit:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\<ZIPNAME>.zip" "<Step Beschreibung>"
```

8. Danach lokale Checks/Syntax/git status.
9. Wenn sauber:

```powershell
.\stepdone.cmd "<Beschreibung>"
```

10. Webserver-Deploy nur, wenn `remote-modboard/**` oder Webserver-Runtime betroffen ist.

## Aktueller Stand

GitHub/dev enthaelt den getesteten Stand nach 0.2.73.

0.2.73 wurde lokal bestaetigt:

```text
moduleVersion    : 0.1.8E
moduleBuild      : RDAP_0.2.73_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_INLINE_WIRING
statusApiVersion : rdap_agent_media_inventory_media_system_scan_073.v1
readOnly         : True
writeEnabled     : False
```

0.2.73 hat nur den lokalen Agent geaendert:

```text
backend/modules/remote_agent.js
```

Kein Webserver-Deploy war noetig.

## Fachliche Entscheidung

Es gibt bewusst zwei Dateiwelten:

```text
Legacy-Assets:
D:\Streaming\stramAssets\htdocs\assets\sounds
D:\Streaming\stramAssets\htdocs\assets\videos
D:\Streaming\stramAssets\htdocs\assets\images
```

Diese bleiben weiter lesbar und werden nicht verschoben/geloescht.

```text
Neues Media-System:
D:\Streaming\stramAssets\htdocs\assets\media\<module>\<category>\...
```

Neue Uploads sollen dort liegen und ueber Media-ID / Media-Registry genutzt werden. Kategorien/Module sollen fuer Dashboard und Remote-Modboard zum Sortieren/Filtern mitkommen.

## Was 0.2.73 geaendert hat

`backend/modules/remote_agent.js` scannt jetzt read-only zusaetzlich:

```text
htdocs/assets/media
```

Inventory-Items koennen fuer Media-System-Dateien enthalten:

```text
source
moduleKey
categoryKey
fullCategoryKey
assetRelativePath
webPath
publicPath
```

Es werden weiterhin keine Datei-Inhalte und keine absoluten Pfade transportiert.

## Relevante Dateien zuerst lesen

Bitte vor Planung lesen:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
backend/modules/remote_agent.js
backend/modules/media.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/media-index-diff.routes.js
```

## Naechster Block

```text
RDAP_0.2.75_MEDIA_INDEX_REMOTE_AGENT_FULL_SYNC_MEDIA_SYSTEM_VERIFY_READONLY
```

Ziel:

```text
Read-only pruefen, ob media-Root und neue Kontextfelder im lokalen Agent-Inventory, Full-Sync und Remote-Snapshot sauber ankommen.
```

Falls Remote-Seite `media` noch nicht akzeptiert oder Felder verwirft, danach separaten Remote-Code-Step planen.

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
