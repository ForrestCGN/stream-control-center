# FILES

Stand: RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE  
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

## RDAP / Remote-Dashboard Planung

```text
docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md
docs/current/REMOTE_DASHBOARD_RDAP5B_AUTH_DB_SCHEMA_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION.md
docs/current/REMOTE_DASHBOARD_RDAP5C4_KNOWN_REMOTE_SERVER_FACTS.md
docs/current/REMOTE_DASHBOARD_RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN.md
docs/current/REMOTE_DASHBOARD_RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE.md
docs/current/NEXT_CHAT_PROMPT_RDAP5E_REMOTE_NODE_SERVICE_PLAN.md
```

## Neues Remote-Modboard-Paket aus RDAP5F

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

## Bewusst nicht geänderte Dateien

```text
backend/server.js
backend/modules/remote_agent.js
package.json
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Wichtiger Altstand / späterer Korrekturpunkt

```text
backend/modules/remote_agent.js
```

Diese Datei ist noch RDAP4B-Stand und fuehrt `sound_profi` als Rolle/Permission-Preset. Das ist seit RDAP5C3 ueberholt und steht verbindlich in TODO.md.

## Webserver-Fakten

```text
Webserver: web.cgn.community
Subdomain: mods.forrestcgn.de
OS: Debian 13
nginx vorhanden
HTTPS / HTTP2 laeuft
mods.forrestcgn.de liefert 200 OK
Node v20.19.2 vorhanden
npm 9.2.0 vorhanden
git vorhanden
MariaDB-Client vorhanden
MariaDB 11.8.6 vorhanden
```

## Webserver-DB

```text
DB-Typ: MariaDB
Version: 11.8.6
DB-Name: c1stream_control
DB-User: c3stream_control
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

## Hinweis für nächsten Chat

Nächster sinnvoller Schritt:

```text
RDAP5G_REMOTE_NODE_SERVER_INSTALL_PLAN
```

Nicht nochmal als Hauptstep Node/npm/git/MariaDB-Client pruefen; diese Infos sind bekannt. Frischer Gegencheck direkt vor Installation ist okay.

Keine DB-Migration, kein npm install, keine Secrets, keine nginx-/Service-Aenderung ohne separates Go.
