# FILES

Stand: RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION  
Datum: 2026-06-23

## Wichtigste Dateien zuerst

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## Aktuelle RDAP-Dateien

```text
docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md
docs/current/REMOTE_DASHBOARD_RDAP5B_AUTH_DB_SCHEMA_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION.md
docs/current/REMOTE_DASHBOARD_RDAP5C4_KNOWN_REMOTE_SERVER_FACTS.md
docs/current/REMOTE_DASHBOARD_RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE.md
docs/current/REMOTE_DASHBOARD_RDAP5G_REMOTE_NODE_SERVER_INSTALL_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE.md
docs/current/REMOTE_DASHBOARD_RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION.md
```

## Remote-Modboard Paket im Repo

```text
remote-modboard/backend/package.json
remote-modboard/backend/server.js
remote-modboard/backend/.env.example
remote-modboard/backend/README.md
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/health.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/security/safety.js
```

## Deploy-/Handoff-Dateien im Repo

```text
remote-modboard/deploy/README_REMOTE_SERVER_INSTALL.md
remote-modboard/deploy/systemd/scc-remote-modboard.service.example
remote-modboard/deploy/nginx/mods.forrestcgn.de.remote-api.example.conf
remote-modboard/deploy/env/remote-modboard.env.example
remote-modboard/deploy/scripts/README_COMMANDS.md
```

## Installierte Dateien auf Webserver

```text
/opt/stream-control-center/remote-modboard/backend
/etc/stream-control-center/remote-modboard.env
/etc/systemd/system/scc-remote-modboard.service
```

## ISPConfig / nginx

Website:

```text
forrestcgn.de
```

Subdomain im gleichen vHost:

```text
mods.forrestcgn.de
```

ISPConfig-Feld:

```text
Sites -> Website -> forrestcgn.de -> Options -> nginx Directives
```

Proxy-Ziel:

```text
http://127.0.0.1:3010/api/remote/
```

## Webserver-Fakten

```text
Webserver: web.cgn.community
Subdomain: mods.forrestcgn.de
OS: Debian 13
nginx vorhanden
HTTPS / HTTP2 laeuft
Node v20.19.2
npm 9.2.0
git vorhanden
MariaDB 11.8.6
```

## Webserver-DB final korrigiert

```text
DB-Typ: MariaDB
Version: 11.8.6
DB-Name: c3stream_control
DB-User: c1stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort nicht dokumentieren.

## Lokale produktive SQLite

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Nicht ersetzen, nicht loeschen, nicht migrieren ohne separates Go.

## Bewusst nicht geaenderte Dateien / Systeme

```text
backend/server.js
backend/modules/remote_agent.js
Root-package.json
lokale SQLite
Stream-PC Backend
Dashboard-v2 Code
```

## Wichtiger Altstand / spaeterer Korrekturpunkt

```text
backend/modules/remote_agent.js
```

Diese Datei ist noch RDAP4B-Stand und fuehrt `sound_profi` als Rolle/Permission-Preset. Das ist seit RDAP5C3 ueberholt und steht verbindlich in TODO.md.
