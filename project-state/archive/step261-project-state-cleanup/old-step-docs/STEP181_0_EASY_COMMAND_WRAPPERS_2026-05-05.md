# STEP181.0 - Easy Command Wrappers

Stand: 2026-05-05

## Ziel

Kurze Befehle fuer haeufige Repo-/Live-Aufgaben bereitstellen, ohne die bestehenden Easy-Scripts zu ersetzen.

## Grundsatz

Die vorhandenen Scripts unter `tools/easy/` bleiben die eigentliche Logik:

- `tools/easy/01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd`
- `tools/easy/02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd`
- `tools/easy/03_NUR_STATUS_PRUEFEN.cmd`
- `tools/easy/04_BACKUP_ZURUECKSPIELEN.cmd`

Die neuen Wrapper rufen diese Scripts nur komfortabler auf.

## Neue Dateien

Root-Wrapper:

- `deploy.cmd`
- `commit.cmd`
- `status.cmd`
- `restore.cmd`
- `check.cmd`
- `pull.cmd`

Command-Wrapper:

- `tools/commands/deploy.cmd`
- `tools/commands/commit.cmd`
- `tools/commands/status.cmd`
- `tools/commands/restore.cmd`
- `tools/commands/check.cmd`
- `tools/commands/pull.cmd`

## Nutzung aus dem Repo-Root

```powershell
cd D:\Git\stream-control-center

.\status
.\check
.\pull
.\deploy
.\commit
.\restore
```

PowerShell verlangt normalerweise `./` bzw. `.\`, wenn der Befehl im aktuellen Ordner liegt.

## Nutzung von ueberall

Wenn `D:\Git\stream-control-center\tools\commands` in die Windows-PATH-Variable eingetragen wird, koennen die Befehle von ueberall ohne `.\` aufgerufen werden:

```powershell
status
check
pull
deploy
commit
restore
```

## Befehle

### status

Ruft das bestehende Status-Script auf.

### check

Fuehrt schnelle lokale Pruefungen aus:

- `git status --short`
- `git log -5 --oneline`
- `node -c` fuer bekannte aktive JS-Dateien, falls vorhanden

### pull

Fuehrt nur aus:

- `git checkout dev`
- `git pull origin dev`

Kein Live-Deploy.

### deploy

Ruft das bestehende Live-Deploy-Script auf.

### commit

Ruft das bestehende Upload-/Commit-/Push-Script auf.

### restore

Ruft das bestehende Restore-Script auf.

## Bewusst nicht geaendert

- Keine Deploy-Logik ersetzt.
- Keine Git-Sicherheitslogik ersetzt.
- Keine Secrets/DB/Backups angefasst.
- Keine vorhandenen Easy-Scripts entfernt.
- Keine bestehenden Funktionen entfernt.

## Naechster Schritt

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
.\check
.\status
```

Wenn alles passt, committen:

```powershell
.\commit
```
