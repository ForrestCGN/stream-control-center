# Prompt fuer neuen Chat - RDAP nach Media 0.2.72

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

10. Erst danach, wenn Source/Runtime betroffen ist, Webserver-Deploy aus frischem GitHub/dev-Clone unter `/opt/stream-control-center/_deploy_tmp/<STEP_NAME>`.

## Aktueller Stand

GitHub/dev enthaelt den getesteten Stand nach 0.2.72.

0.2.72 ist ein Handoff-/Korrekturstand fuer Variante B:

- Der zuvor angelegte Helper `backend/modules/helpers/helper_media_inventory_roots.js` wurde wieder entfernt.
- `backend/modules/remote_agent.js` ist noch nicht inline erweitert.
- Der naechste echte Source-Step muss die Root-/Kategorie-Logik direkt in `remote_agent.js` einbauen.

Wichtig: Die Helper-Datei ist in GitHub/dev weg. Auf Live ist sie erst nach Webserver-Deploy sicher weg. Da sie nie verdrahtet war, hatte sie keine Runtime-Wirkung.

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

## Relevante Dateien zuerst lesen

Bitte vor Planung lesen:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
backend/modules/remote_agent.js
backend/modules/media.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/media-index-diff.routes.js
```

Wichtig aus `backend/modules/media.js`:

- Neue Uploads landen unter `htdocs/assets/media/<module>/<category>/`.
- Bestehende Asset-Ordner werden nur gescannt/registriert.
- Keine bestehenden Assets werden verschoben oder geloescht.

Wichtig aus aktuellem `backend/modules/remote_agent.js`:

- Aktuell scannt der Agent noch legacy-orientiert:
  - `sounds -> htdocs/assets/sounds`
  - `videos -> htdocs/assets/videos`
  - `images -> htdocs/assets/images`
- `safeMediaRootKey()` muss fuer neuen Root `media` erweitert werden.
- `emptyMediaGroups()`, `buildMediaCountsFromItems()`, `preparedMediaInventory()` und `walkMediaRoot()` muessen kompatibel erweitert werden.
- Keine Datei-Inhalte und keine absoluten Pfade transportieren.

## Naechster Block

```text
RDAP_0.2.73_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_INLINE_WIRING
```

Ziel:

```text
backend/modules/remote_agent.js direkt erweitern:
- assets/media/<module>/<category> zusaetzlich read-only scannen
- Legacy assets/sounds, assets/videos, assets/images behalten
- Inventory-Items um source/moduleKey/categoryKey/fullCategoryKey/assetRelativePath/webPath(publicPath) erweitern
- Remote-Modboard/Remote-Index kompatibel halten
```

## Weiterhin verboten ohne separaten Ausfuehrungs-Go

```text
- keine Testdatei anlegen
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
