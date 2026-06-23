# WF1 Frontend Git Workflow

Stand: 2026-06-23  
Status: WF1 / `frontend/dashboard-v2` in Git-/Upload-Workflow aufgenommen

## Zweck

Beim StepDone nach DASHUI4B und DASHUI5 blieb der eigentliche React-Quellcode untracked:

```text
?? frontend/dashboard-v2/...
```

Dadurch wurden Doku und Designreferenzen nach GitHub/dev gepusht, aber nicht der eigentliche Dashboard-v2-React-Code.

WF1 korrigiert den Workflow.

## Geändert

### `stepdone.cmd`

`stepdone.cmd` nimmt jetzt zusätzlich diesen erlaubten Projektbereich auf:

```text
frontend/
```

Damit werden spätere Dateien unter:

```text
frontend/dashboard-v2/
```

bei `stepdone` mit staged/committed/gepusht.

Zusätzlich wurde der JS-Syntaxcheck erweitert auf:

```text
frontend/**/*.js
frontend/**/*.jsx
```

### `tools/upload_streamassets_changes.ps1`

Das Upload-Script kennt jetzt zusätzlich:

```text
frontend/dashboard-v2/
```

Erlaubte Dateitypen:

```text
*.html
*.css
*.js
*.jsx
*.json
*.md
```

Weiterhin ausgeschlossen:

```text
node_modules
dist
.vite
.env
SQLite/DB-Dateien
Archive
Backups
Secrets
Token-/Secret-Pfade
```

## Sicherheitsregeln bleiben

Der Sicherheitscheck blockiert weiterhin Dateipfade mit:

```text
.env
.sqlite
.sqlite3
.db
.zip
.7z
.bak
.old
.tmp
.temp
token
secret
password
credential
data/sqlite
secrets/
```

## Wichtig

`package-lock.json` darf committed werden.

`node_modules/` darf nicht committed werden.

## Design-Grundlage bleibt

Die verbindliche Designbasis für Dashboard-v2 bleibt:

```text
DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip
```

Archiviert unter:

```text
docs/reference/dashboard-v2-design-test-v13/
```

Dokumentiert unter:

```text
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
```

## Nicht geändert

- kein Backend-Code
- kein bestehendes Dashboard unter `htdocs/dashboard/`
- kein Build-Output unter `htdocs/dashboard-v2/`
- kein Agent-Code
- keine produktive SQLite
- keine OBS-Änderung
- kein Webserver-Deploy
- kein Node-Neustart nötig

## Test nach Installation

Nach Installation dieses Steps:

```powershell
git status --short
```

Dann:

```powershell
.\stepdone.cmd "WF1 frontend dashboard-v2 in Git-Workflow aufgenommen"
```

Erwartung danach:

```text
kein ?? frontend/
```

Falls `?? frontend/` weiterhin erscheint, ist der Workflow nicht sauber aktiv.
