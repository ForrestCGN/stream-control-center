# Step-Workflow / Safe Test Deploy

Stand: 2026-06-21
Projekt: ForrestCGN / stream-control-center

Diese Datei beschreibt den neuen sicheren Arbeitsablauf fuer ZIP-Dateien, Test-Deploys und GitHub-Abschluss.

## Ziel

GitHub/dev soll der letzte getestete stabile Stand bleiben. Ungetestete ZIPs oder Zwischenstaende werden nicht mehr automatisch nach GitHub/dev gepusht.

Neuer Grundsatz:

```text
Lokal testen -> Live pruefen -> erst bei Erfolg nach GitHub/dev pushen
```

## Standardablauf, wenn ein ZIP geliefert wird

Wenn der Assistant ein ZIP bereitstellt, nennt er danach einen konkreten Befehl mit genauem ZIP-Dateinamen.

Beispiel:

```bat
cd /d D:\Git\stream-control-center
.\installstep.cmd "%USERPROFILE%\Downloads\STEP_WORKFLOW_1_SAFE_TEST_DONE_FLOW.zip" "Workflow Step 1 testen"
```

`installstep.cmd` macht:

1. ZIP pruefen.
2. ZIP nach `D:\Git\stream-control-center` entpacken.
3. `testdeploy.cmd` starten.
4. Kein Commit.
5. Kein GitHub-Push.

## Schritt 1: Test-Deploy

Direkt ohne ZIP-Installation:

```bat
cd /d D:\Git\stream-control-center
.	estdeploy.cmd "Beschreibung"
```

`testdeploy.cmd` macht:

- Repo-/Branch-Check auf `dev`.
- Git-Status anzeigen.
- gefaehrliche Dateien/Pfade blockieren.
- geaenderte JS-Dateien in `backend/` und `htdocs/` mit `node -c` pruefen.
- Live-Backup erstellen.
- lokalen Repo-Stand nach `D:\Streaming\stramAssets` deployen.
- nicht committen.
- nicht nach GitHub pushen.
- melden, ob `backend/` geaendert wurde und Node neu gestartet werden sollte.

Danach gilt:

```text
Node ggf. neu starten -> live testen
```

## Schritt 2: Finalisieren nach erfolgreichem Test

Wenn der Live-Test erfolgreich war:

```bat
cd /d D:\Git\stream-control-center
.\stepdone.cmd "Kurze deutsche Beschreibung"
```

`stepdone.cmd` macht:

- finalen Statuscheck.
- JS-Syntaxcheck der geaenderten JS-Dateien.
- erlaubte Projektbereiche stagen.
- Sicherheitscheck fuer staged Dateien.
- Commit.
- Push nach `origin dev`.

Im Standard macht `stepdone.cmd` keinen Live-Deploy mehr, weil der Stand vorher mit `testdeploy.cmd` live getestet wurde.

Optional, wenn bewusst nochmal nach Live deployed werden soll:

```bat
.\stepdone.cmd "Beschreibung" --deploy
```

## Wenn der Test kaputt ist

```bat
cd /d D:\Git\stream-control-center
.\stepundo.cmd
```

`stepundo.cmd` kann das letzte Live-Backup zurueckspielen. Lokale Repo-Aenderungen werden bewusst nicht automatisch geloescht.

Kein automatisches `git reset --hard`.
Kein automatisches `git clean`.

Lokale Aenderungen werden nur nach bewusstem Statuscheck verworfen.

## Status pruefen

```bat
cd /d D:\Git\stream-control-center
.\stepstatus.cmd
```

Zeigt:

- Branch.
- Git-Status.
- letzte Commits.
- Remote.
- vorhandene Live-Backups.
- grobe Backend-Aenderungen.

## Backup-Regel

`tools/deploy_repo_to_streamassets.ps1` erstellt vor dem Deploy:

```text
D:\Streaming\stramAssets_DEPLOY_BACKUP\latest
```

Zusaetzlich wird eine kleine History gepflegt:

```text
D:\Streaming\stramAssets_DEPLOY_BACKUP\history\yyyyMMdd_HHmmss
```

Standard: maximal 5 History-Backups behalten.

Runtime-Daten, Secrets, SQLite-Datenbanken, Logs und Archive werden nicht kopiert.

## Was nicht geaendert wird

- produktive SQLite-DB wird nicht ersetzt, geloescht oder kopiert.
- Secrets werden nicht committed oder deployed.
- GitHub/dev wird nicht durch ungetestete ZIPs beschrieben.
- Node wird nicht blind automatisch gekillt.
- Easy-Scripte bleiben als manuelle Werkzeuge erhalten.

## Regel fuer den Assistant

Wenn eine Datei nicht vollstaendig oder nicht zuverlaessig lesbar ist:

```text
Nicht rekonstruieren.
Nicht aus Ausschnitten nachbauen.
Nicht aus Erinnerung arbeiten.
Sofort exakt die benoetigte Datei aus D:\Git\stream-control-center anfordern.
```
