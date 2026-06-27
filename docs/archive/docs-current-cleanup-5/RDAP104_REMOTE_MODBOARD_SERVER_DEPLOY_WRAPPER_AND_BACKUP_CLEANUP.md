# RDAP104_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_AND_BACKUP_CLEANUP

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Server-Script / Workflow-Hardening / Cleanup

## Zweck

RDAP104 beseitigt die fehleranfaelligen Webserver-Deploy-Ketten aus mehreren manuellen Shell-Zeilen.

Ausloeser:

```text
Forrests SSH-/Web-Konsole kann Prompt-Text an Befehle ankleben.
Beispiele:
- cd /opt/stream-control-center/_deploy_tmproot@web...
- sudo bash tools/remote-modboard-deploy.sh STEP devroot@web...
```

Zusaetzlich ist auf dem Webserver kein `sudo` noetig/verfuegbar, weil Forrest dort als `root` arbeitet.

## Ergebnis

Neue Server-Hilfsscripte:

```text
tools/server/remote-modboard-deploy-step.sh
tools/server/remote-modboard-cleanup-backups.sh
```

Die bestehende Deploy-Engine bleibt erhalten und wurde nur erweitert:

```text
tools/remote-modboard-deploy.sh
```

## Neuer Standard nach Installation

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Script: remote-modboard-deploy-step.sh

Aufgaben:

```text
- root pruefen
- STEP validieren
- Branch/ref validieren
- /opt/stream-control-center/_deploy_tmp anlegen
- alten Clone fuer exakt diesen STEP entfernen
- GitHub/dev frisch nach _deploy_tmp/STEP_NAME klonen
- aus dem Clone tools/remote-modboard-deploy.sh starten
- danach Backup-/Deploy-Cleanup ausfuehren
```

## Script: remote-modboard-cleanup-backups.sh

Regeln:

```text
Remote-Modboard Live-Backups:
  Pfad: /opt/stream-control-center/_runtime_tmp
  Muster: backup_remote_modboard_*
  Keep: 6 neueste

RDAP Deploy-Clones:
  Pfad: /opt/stream-control-center/_deploy_tmp
  Muster: RDAP*
  Keep: 6 neueste
```

Das Script zeigt vorher an:

```text
- was behalten wird
- was geloescht wird
```

## Erweiterung der Deploy-Engine

`tools/remote-modboard-deploy.sh` installiert nach dem Clone die Server-Hilfsscripte nach:

```text
/opt/stream-control-center/tools/server
```

Dadurch ist der neue Ein-Befehl-Deploy nach dem ersten RDAP104-Deploy dauerhaft auf dem Webserver verfuegbar.

## Erster RDAP104-Deploy

Da der Wrapper vor RDAP104 noch nicht auf dem Webserver installiert ist, ist fuer RDAP104 einmalig der Fallback noetig:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP104_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_AND_BACKUP_CLEANUP
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP104_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_AND_BACKUP_CLEANUP
cd RDAP104_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_AND_BACKUP_CLEANUP
bash tools/remote-modboard-deploy.sh RDAP104_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_AND_BACKUP_CLEANUP dev
```

Danach fuer weitere Steps nur noch:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Sicherheitsgrenzen

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell fuer Agenten.
Keine DB-Migration.
Keine produktiven Writes.
Keine Secrets.
Keine Rohpayloads.
```

## Testplan lokal

```powershell
cd D:\Git\stream-control-center

git status --short
git diff --stat

bash -n tools/remote-modboard-deploy.sh
bash -n tools/server/remote-modboard-deploy-step.sh
bash -n tools/server/remote-modboard-cleanup-backups.sh
```

Falls lokal unter Windows kein `bash` verfuegbar ist, die Bash-Syntaxchecks auf dem Webserver im frischen Clone ausfuehren.

## Testplan Webserver nach Deploy

```bash
test -f /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh
test -f /opt/stream-control-center/tools/server/remote-modboard-cleanup-backups.sh
bash -n /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh
bash -n /opt/stream-control-center/tools/server/remote-modboard-cleanup-backups.sh
curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null && echo ready
```

Optional Cleanup-Test ohne produktive Wirkung auf Service:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-cleanup-backups.sh
```

## Kein neuer Runtime-/Agent-Scope

RDAP104 aendert nur Server-Workflow und Cleanup.

```text
Agent Runtime bleibt final disabled.
Agent Actions bleiben disabled.
Stream-PC Verbindung bleibt read-only Status.
```
