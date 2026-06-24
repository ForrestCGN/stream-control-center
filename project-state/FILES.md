# FILES - stream-control-center

Stand: RDAP_UI1_LIVE_CONFIRMED
Datum: 2026-06-24

## RDAP UI1 relevante Dateien

```text
remote-modboard/backend/src/app.js
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
```

## Wichtige Remote-Modboard Backend-Dateien

```text
remote-modboard/backend/package.json
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/health.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/routes/auth-twitch.routes.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/auth-session-read.service.js
remote-modboard/backend/src/services/auth-status.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/services/lock-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
remote-modboard/backend/src/security/permissions.js
remote-modboard/backend/src/security/safety.js
```

## RDAP aktuelle Doku-/Projektdateien

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP16_HANDOFF_VISIBLE_NEXT.md
docs/current/RDAP_UI1_LIVE_CONFIRMED.md
docs/current/NEXT_CHAT_PROMPT_RDAP_UI1.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Webserver Pfade

```text
/opt/stream-control-center/remote-modboard
/opt/stream-control-center/remote-modboard/backend
/opt/stream-control-center/_deploy_tmp/
/opt/stream-control-center/_runtime_tmp/
/var/backups/stream-control-center/
```

Wichtig:

```text
/opt/stream-control-center ist kein Git-Repository.
```

Keine RDAP-Arbeitsordner/Deploy-Clones/Backups nach `/root`.

## Public/Interne URLs

```text
Public UI:
https://mods.forrestcgn.de/

Public API:
https://mods.forrestcgn.de/api/remote/

Interner Service:
http://127.0.0.1:3010/
```

## ISPConfig/Nginx

`mods.forrestcgn.de` ist als eigener ISPConfig-Web-vHost angelegt.

Nginx/ISPConfig proxyt den vHost vollständig auf:

```text
http://127.0.0.1:3010/
```

Die alte normale Subdomain unter `forrestcgn.de` darf nicht wieder als normale Subdomain angelegt werden, sonst liefert `/` wieder die normale Webseite statt der Remote-Modboard-UI.
