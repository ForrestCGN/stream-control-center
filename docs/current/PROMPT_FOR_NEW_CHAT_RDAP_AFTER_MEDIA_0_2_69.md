# Prompt fuer neuen Chat nach RDAP Media 0.2.69

Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Repository:

```text
GitHub: ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Webserver-Pfad: /opt/stream-control-center
```

Verbindlicher Workflow:

```text
1. Erst GitHub/dev und relevante Doku-/Source-Dateien wirklich lesen.
2. Dann kurzen Plan nennen.
3. Auf go warten.
4. Erst dann ZIP bauen.
5. ZIP muss echte Zielpfade enthalten, keinen Wrapper-Ordner.
6. Lokal einspielen mit installstep.cmd.
7. Lokale Checks/Syntax/git status.
8. Wenn sauber: stepdone.cmd.
9. Webserver-Deploy nur bei Source-/Remote-Modboard-Aenderungen, nicht bei Doku-only.
```

Aktueller Stand:

```text
0.2.69 - Media Index Remote-Agent Media-System Scan Plan
```

Wichtiges Systemverstaendnis:

```text
Legacy-Assets bleiben gueltig:
D:\Streaming\stramAssets\htdocs\assets\sounds
D:\Streaming\stramAssets\htdocs\assets\videos
D:\Streaming\stramAssets\htdocs\assets\images

Neues Media-System fuer neue Uploads / Media-ID:
D:\Streaming\stramAssets\htdocs\assets\media\<module>\<category>\...
```

0.2.69 dokumentiert:

```text
- Remote-Agent scannt aktuell noch legacy-orientiert.
- Neues lokales Media-System nutzt assets/media/<module>/<category>.
- Spaeterer Remote-Agent-/Remote-Index-Scan soll beide Welten read-only erfassen.
- Kategorien/Module sollen fuer Dashboard-Sortierung und Filter transportiert werden.
```

Fachliche Anforderung:

```text
Neue Media-System-Dateien sollen mit moduleKey, categoryKey und fullCategoryKey im Inventory/Index sichtbar werden.
Legacy-Dateien sollen weiter lesbar sein, aber als legacy_scan / legacy markiert werden.
Keine bestehenden Dateien verschieben oder loeschen.
```

Spaeterer RDAP-Testkontext:

```text
moduleKey: rdap-test
categoryKey: persistent-tombstone
fullCategoryKey: rdap-test/persistent-tombstone
relativePath: media/rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
absolutePath: D:\Streaming\stramAssets\htdocs\assets\media\rdap-test\persistent-tombstone\rdap-persistent-tombstone-test-001.mp3
```

0.2.69 war Doku-only:

```text
keine Source-Aenderung
keine Testdatei
keine lokale Dateiaktion
keine DB-Aenderung
keine Migration
keine Gates
kein Execute
kein Webserver-Deploy
```

Naechster Block:

```text
RDAP_0.2.70_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_CODE_PLAN
```

Ziel:

```text
Konkreten Source-Aenderungsplan fuer backend/modules/remote_agent.js erstellen:
- assets/media/<module>/<category> mitscannen
- Legacy-Roots weiter scannen
- moduleKey/categoryKey/fullCategoryKey transportieren
- Dashboard-/Remote-Index-Sortierung vorbereiten
- weiterhin read-only
```
