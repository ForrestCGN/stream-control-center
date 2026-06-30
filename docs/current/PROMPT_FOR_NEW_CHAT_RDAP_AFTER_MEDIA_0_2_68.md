# Prompt fuer neuen Chat nach RDAP 0.2.68

Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

WICHTIG: Bitte zuerst wirklich die relevanten Dateien auf GitHub/dev lesen und dann erst planen. Nicht aus Erinnerung arbeiten.

Repository:

- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Webserver-Pfad: `/opt/stream-control-center`
- Webserver laeuft als root, kein `sudo`.

Verbindlicher Workflow:

1. Erst GitHub/dev und Doku-Dateien lesen.
2. Dann kurzen Plan nennen.
3. Auf `go` warten.
4. Erst dann ZIP bauen.
5. ZIP muss echte Zielpfade enthalten, keinen Wrapper-Ordner.
6. Lokal einspielen mit:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\<ZIPNAME>.zip" "<Step Beschreibung>"
```

7. Danach lokale Checks/Syntax/git status.
8. Wenn sauber: `stepdone.cmd`.
9. Doku-only Steps brauchen keinen Webserver-Deploy.

Aktueller Stand:

```text
0.2.68 - Media Index Media-System Alignment Plan
```

Kernkorrektur:

```text
Legacy-Assets existieren weiter und werden genutzt:
D:\Streaming\stramAssets\htdocs\assets\sounds
D:\Streaming\stramAssets\htdocs\assets\videos
D:\Streaming\stramAssets\htdocs\assets\images

Neues Media-System fuer neue Uploads:
D:\Streaming\stramAssets\htdocs\assets\media\<module>\<category>\...
```

Gelesene relevante Dateien:

```text
backend/modules/media.js
backend/modules/remote_agent.js
```

Wichtig aus `backend/modules/media.js`:

```text
- Keine bestehenden Assets werden verschoben oder geloescht.
- Neue Uploads landen unter htdocs/assets/media/<module>/<category>/.
- Bestehende Asset-Ordner werden nur gescannt und in media_assets registriert.
- Module geben moduleKey fest vor; User waehlen/erstellen die Zusatzkategorie.
```

Wichtig aus `backend/modules/remote_agent.js`:

```text
MEDIA_ROOTS aktuell legacy-orientiert:
sounds -> htdocs/assets/sounds
videos -> htdocs/assets/videos
images -> htdocs/assets/images
```

Entscheidung:

```text
Keine RDAP-Testdatei unter assets/sounds planen.
Nicht blind assets/media/audio als Root verwenden.
Spaeterer Test muss im neuen Media-System liegen:
media/rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
```

Absoluter spaeterer Testpfad:

```text
D:\Streaming\stramAssets\htdocs\assets\media\rdap-test\persistent-tombstone\rdap-persistent-tombstone-test-001.mp3
```

Weiterhin verboten ohne separaten Ausfuehrungs-Go:

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

Naechster sinnvoller Block:

```text
RDAP_0.2.69_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_PLAN
```

Ziel 0.2.69:

```text
- remote_agent.js und backend/modules/media.js gemeinsam lesen
- Plan fuer Agent-/Remote-Index-Anpassung an assets/media/<module>/<category>
- Legacy-Roots weiter read-only erhalten
- neue Media-System-Dateien indexierbar machen
- noch keine Testdatei
- noch keine produktiven Writes
```
