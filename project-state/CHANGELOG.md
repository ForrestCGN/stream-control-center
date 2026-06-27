# CHANGELOG

## 2026-06-27 - RDAP105_DOCS_INVENTORY_AND_CLEANUP_PLAN

```text
- Doku-Inventur als eigener RDAP-Step eingefuehrt.
- Repo-Snapshot-ZIPs als Zusatzbasis strukturell ausgewertet:
  dashboard-v2.zip, remote-modboard.zip, stream-control-center.zip.
- Festgestellt:
  stream-control-center.zip enthaelt 3380 Eintraege.
  docs/current enthaelt ca. 1435 Dateien.
  project-state enthaelt ca. 1248 Dateien.
  project-state/archive enthaelt ca. 996 Dateien.
  Markdown-Dateien gesamt ca. 3244.
- Problem dokumentiert:
  docs/current und project-state sind fuer schnelle Orientierung zu laut.
- Zielstruktur fuer Doku-Cleanup geplant:
  current = aktuelle Wahrheit/Startpunkte,
  archive = historische RDAP/CAN/DASHUI-Schritte,
  project-state = knapper aktueller Zustand.
- Neue Plan-Datei erstellt:
  docs/current/RDAP105_DOCS_INVENTORY_AND_CLEANUP_PLAN.md
- Neuer Next-Chat-Prompt erstellt:
  docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP105.md
- START_HERE_FOR_NEW_CHAT.md auf RDAP105 aktualisiert.
- Feature-Step Stream-PC-Verbindungsdetails bewusst nach hinten geschoben.
- Naechster Step:
  RDAP106_DOCS_CURRENT_STATE_REBUILD.
- Keine Feature-Implementierung.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
- Keine DB-Migration.
- Keine produktiven Writes.
```

## 2026-06-27 - RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRMED

```text
- RDAP104 live auf dem Webserver bestaetigt.
- Einmaliger Fallback-Deploy fuer RDAP104 erfolgreich verwendet.
- Server-Deploy-Wrapper bestaetigt:
  /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh
- Backup-/Deploy-Cleanup bestaetigt:
  /opt/stream-control-center/tools/server/remote-modboard-cleanup-backups.sh
- Bash-Syntaxchecks fuer beide Server-Hilfsscripte sauber.
- Cleanup live ausgefuehrt.
- Remote-Modboard Live-Backups: found=7, keep=6, 1 geloescht.
- RDAP Deploy-Clones: found=7, keep=6, 1 geloescht.
- Neuer Webserver-Deploy-Standard aktiv:
  bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
- START_HERE_FOR_NEW_CHAT.md auf aktuellen RDAP104B-Stand aktualisiert.
- Neue Handoff-Datei erstellt:
  docs/current/RDAP104B_REMOTE_MODBOARD_SERVER_DEPLOY_WRAPPER_LIVE_CONFIRMED.md
- Neuer Next-Chat-Prompt erstellt:
  docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP104B.md
- Keine Agent-Actions.
- Keine Runtime-Aktivierung.
- Keine DB-Migration.
- Keine produktiven Writes durch RDAP104B.
- Naechster Step: RDAP105_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN.
```

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
