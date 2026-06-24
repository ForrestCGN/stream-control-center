# CHANGELOG - stream-control-center

## 2026-06-24 - RDAP Deploy Runbook / Remote-Modboard Serverdeploy standardisiert

Status: Script-/Doku-Step vorbereitet

Geändert:

- `tools/remote-modboard-deploy.sh`
- `docs/current/RDAP_DEPLOY_RUNBOOK.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`
- `docs/current/START_HERE_FOR_NEW_CHAT.md`

Inhalt:

- Server-Deploy-Ablauf für Remote-Modboard festgelegt
- kein `git pull` in `/opt/stream-control-center`
- GitHub/dev Clone nach `_deploy_tmp`
- Backup nach `_runtime_tmp`
- `rsync` nur von `remote-modboard/` nach Live
- Rechte setzen auf `sccremote:sccremote`
- JS-Syntaxcheck
- Restart von `scc-remote-modboard.service`
- Readiness-Wait
- lokale/public API- und UI-Tests
- OAuth Start/Callback Safety-Test auf HTTP 403
- Rollback-Hinweise dokumentiert

Keine Änderung:

- kein Login aktiviert
- kein OAuth aktiviert
- keine Cookies gesetzt
- keine Sessions erstellt
- keine DB-Writes
- keine Migration
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets

## 2026-06-24 - RDAP UI1 / Remote-Modboard erste sichtbare read-only UI live

Status: Live getestet und per `stepdone.cmd` nach GitHub/dev bestätigt

Geändert im UI1-Code-Step:

- `remote-modboard/backend/src/app.js`
- `remote-modboard/backend/public/index.html`
- `remote-modboard/backend/public/assets/remote-modboard.css`
- `remote-modboard/backend/public/assets/remote-modboard.js`

Inhalt:

- Erste sichtbare Remote-Modboard-Webseite gebaut
- UI läuft statisch im vorhandenen Remote-Modboard-Backend
- UI zeigt nur vorhandene Diagnose-Daten
- Service-Status sichtbar
- Security-/Read-only-Status sichtbar
- Routenübersicht sichtbar
- Lock-/Audit-Diagnose sichtbar
- Hinweisbox read-only Diagnosemodus sichtbar

Live bestätigt:

```text
GET https://mods.forrestcgn.de/ -> HTTP 200
Header: x-remote-modboard-ui: readonly
GET https://mods.forrestcgn.de/api/remote/status -> ok=true
GET https://mods.forrestcgn.de/api/remote/auth/twitch/start -> HTTP 403
GET https://mods.forrestcgn.de/api/remote/auth/twitch/callback -> HTTP 403
SSL/Let's Encrypt -> ok
```

Server-/Infrastruktur:

- `mods.forrestcgn.de` wurde als eigener ISPConfig-Web-vHost angelegt
- Nginx/ISPConfig proxyt `mods.forrestcgn.de` vollständig auf `127.0.0.1:3010`
- Node-Service bleibt `scc-remote-modboard.service`
- produktiver Code liegt unter `/opt/stream-control-center/remote-modboard`
- `/opt/stream-control-center` ist kein Git-Repository
- UI1-Serverdeploy lief über GitHub/dev Clone nach `_deploy_tmp`, Backup nach `_runtime_tmp`, `rsync` nach Live und Service-Restart mit Readiness-Wait

Keine Änderung:

- kein Login aktiviert
- kein OAuth aktiviert
- keine Cookies gesetzt
- keine Sessions erstellt
- keine DB-Writes
- keine Migration
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets
