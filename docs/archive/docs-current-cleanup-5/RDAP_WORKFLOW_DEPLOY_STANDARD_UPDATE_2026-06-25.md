# RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25

Stand: 2026-06-26  
Typ: Doku-/Workflow-Update  
Aktualisiert durch: RDAP104_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_AND_BACKUP_CLEANUP

## Zweck

Dieses Doku-Update korrigiert die verbindliche RDAP-/Remote-Modboard-Arbeitsweise erneut, weil sich in Forrests Web-/SSH-Konsole gezeigt hat:

```text
Manuelle cd/git-clone/cd/bash-Ketten sind fehleranfaellig.
Prompt-Anhaengsel koennen Befehle kaputt machen, z. B. _deploy_tmproot oder devroot.
Auf dem Webserver wird als root gearbeitet; sudo ist nicht vorhanden/noetig.
```

## Neuer verbindlicher Server-Deploy-Standard ab RDAP104

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Was der Wrapper macht

```text
- root pruefen
- STEP/Branch validieren
- GitHub/dev frisch nach /opt/stream-control-center/_deploy_tmp/STEP_NAME klonen
- vorhandene Deploy-Engine tools/remote-modboard-deploy.sh aus dem Clone ausfuehren
- Readiness/API/UI-Checks laufen weiter in der Deploy-Engine
- Backup-/Deploy-Cleanup danach starten
```

## Backup-/Deploy-Cleanup

```text
Backups:
  /opt/stream-control-center/_runtime_tmp/backup_remote_modboard_*
  maximal 6 neueste behalten

Deploy-Clones:
  /opt/stream-control-center/_deploy_tmp/RDAP*
  maximal 6 neueste behalten
```

## Weiterhin richtig

```text
/opt/stream-control-center ist kein Git-Repository.
Nie git pull unter /opt/stream-control-center.
Keine Deploy-Arbeitsordner in /root.
Keine Backups in /root.
Keine Secrets ausgeben.
```

## Fallback nur falls Wrapper noch nicht installiert ist

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Dieser Fallback ist nur fuer Erstinstallation/Recovery gedacht.
