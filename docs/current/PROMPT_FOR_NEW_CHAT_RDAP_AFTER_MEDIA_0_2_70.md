# Prompt fuer neuen Chat nach RDAP Media 0.2.70

Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Repository:

- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Webserver-Pfad: `/opt/stream-control-center`
- Webserver laeuft als root, also kein `sudo`.

Verbindlicher Workflow:

1. Erst GitHub/dev und relevante Dateien wirklich lesen.
2. Dann kurzen Plan nennen.
3. Auf `go` warten.
4. Erst dann ZIP bauen.
5. ZIP muss echte Zielpfade enthalten, keinen Wrapper-Ordner.
6. Lokal einspielen mit `installstep.cmd`.
7. Lokale Checks/Syntax/git status.
8. Wenn sauber: `stepdone.cmd`.
9. Webserver-Deploy nur bei Source-/remote-modboard-Aenderungen, nicht bei Doku-only.

Aktueller Stand:

```text
0.2.70 - Media Index Remote-Agent Media-System Scan Code Plan
```

0.2.70 war Doku-/Plan-only.

Wichtiges Systemverstaendnis:

```text
Legacy-Assets bleiben erhalten und genutzt:
D:\Streaming\stramAssets\htdocs\assets\sounds
D:\Streaming\stramAssets\htdocs\assets\videos
D:\Streaming\stramAssets\htdocs\assets\images

Neues Media-System fuer neue Uploads / Media-ID:
D:\Streaming\stramAssets\htdocs\assets\media\<module>\<category>\...
```

`backend/modules/media.js` sagt:

```text
Neue Uploads landen unter htdocs/assets/media/<module>/<category>/.
Bestehende Asset-Ordner werden nur gescannt und in media_assets registriert.
Keine bestehenden Assets werden verschoben oder geloescht.
```

`backend/modules/remote_agent.js` scannt aktuell noch legacy-orientiert:

```text
sounds -> htdocs/assets/sounds
videos -> htdocs/assets/videos
images -> htdocs/assets/images
```

0.2.70 plant fuer spaeter:

```text
Remote-Agent scannt beide Welten read-only:
- media -> htdocs/assets/media
- sounds/videos/images -> Legacy
```

Geplante sortierbare Item-Felder:

```text
source
moduleKey
categoryKey
fullCategoryKey
rootKey
type/kind
relativePath
assetRelativePath
webPath/publicPath
```

Spaeterer Testpfad:

```text
D:\Streaming\stramAssets\htdocs\assets\media\rdap-test\persistent-tombstone\rdap-persistent-tombstone-test-001.mp3
```

Naechster Block:

```text
RDAP_0.2.71_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_CODE_PREP
```

Ziel:

```text
Kleine Source-Aenderung in backend/modules/remote_agent.js vorbereiten/umsetzen:
- media-Root read-only aufnehmen
- Item-Felder fuer source/moduleKey/categoryKey/fullCategoryKey/assetRelativePath/webPath ergaenzen
- Legacy-Verhalten erhalten
- keine Testdatei
- keine DB-Gates
- kein Tombstone-Execute
```
