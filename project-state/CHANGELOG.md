# CHANGELOG

## 2026-06-26 - RDAP104_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_AND_BACKUP_CLEANUP

```text
- Server-Deploy-Wrapper vorbereitet: tools/server/remote-modboard-deploy-step.sh
- Backup-/Deploy-Cleanup vorbereitet: tools/server/remote-modboard-cleanup-backups.sh
- Bestehende Deploy-Engine tools/remote-modboard-deploy.sh erweitert.
- Deploy-Engine installiert Server-Hilfsscripte nach /opt/stream-control-center/tools/server.
- Neuer Standard nach Installation: bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
- Kein sudo mehr in den Server-Standards; Ausfuehrung als root.
- Backup-Cleanup behaelt maximal 6 Remote-Modboard-Backups.
- Deploy-Cleanup behaelt maximal 6 RDAP-Deploy-Clones.
- Master-Prompt, exakte RDAP-Arbeitsweise und Deploy-Workflow-Doku auf RDAP104 aktualisiert.
- Keine Agent-Actions.
- Keine Runtime-Aktivierung.
- Keine DB-Migration.
- Keine produktiven Writes.
- Naechster Step: RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRM.
```
