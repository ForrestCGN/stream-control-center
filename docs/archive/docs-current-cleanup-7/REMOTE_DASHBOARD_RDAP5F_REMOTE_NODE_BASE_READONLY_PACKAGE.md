# REMOTE DASHBOARD RDAP5F - Remote Node Base Readonly Package

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Step: RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE  
Status: Paket vorbereitet, noch keine produktive Installation

## Zweck

RDAP5F erstellt das erste separate Remote-Modboard-Node-Basispaket fuer den spaeteren Webserver-Service auf:

```text
web.cgn.community
mods.forrestcgn.de
```

Der Step ist bewusst klein und read-only.

## Grundlage

Fuehrende Planungsstaende:

```text
RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION
RDAP5C4_KNOWN_REMOTE_SERVER_FACTS_AND_NEXT_CHAT_HANDOFF
RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN
```

Wichtig:

```text
Rollen und Gruppen sind getrennt.
sound_profi ist keine Rolle.
sound_profi ist keine feste Rechte-Sammlung.
sound_profi ist eine Gruppe / Markierung.
Modulrechte werden pro Modul konfiguriert.
```

## Bekannter Server-/DB-Stand

```text
Webserver: web.cgn.community
Remote-Modboard: https://mods.forrestcgn.de
OS: Debian 13
nginx vorhanden
HTTPS / HTTP2 laeuft
Node v20.19.2 vorhanden
npm 9.2.0 vorhanden
git vorhanden
MariaDB-Client vorhanden
MariaDB: 11.8.6
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort wird nicht dokumentiert und darf nicht ins Repo oder Frontend.

## Neue Dateien

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

## API

### GET /api/remote/health

Read-only Health-Endpunkt.

Optional:

```text
?db=1
```

Wenn `mysql2` installiert ist und ENV vollstaendig gesetzt ist, wird ein reiner Lesetest ausgefuehrt:

```sql
SELECT 1 AS ok
```

Ohne `?db=1` wird keine DB-Verbindung aufgebaut.

### GET /api/remote/status

Read-only Status mit:

```text
Runtime-Infos
Config-Zusammenfassung ohne Secrets
DB-Status
Agent-Planungsstatus
RDAP5C3 Rollen-/Gruppen-Hinweis
Safety-Flags
```

### GET /api/remote/routes

Read-only Routenuebersicht.

## Sicherheitsflags

Alle produktiven Funktionen bleiben deaktiviert:

```text
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionsEnabled: false
agentRuntimeEnabled: false
agentActionsEnabled: false
obsControlEnabled: false
soundControlEnabled: false
overlayControlEnabled: false
commandControlEnabled: false
channelpointsControlEnabled: false
mediaWriteEnabled: false
textConfigWriteEnabled: false
databaseWriteEnabled: false
localSqliteAccessEnabled: false
freeShellCommandsEnabled: false
freeFileCommandsEnabled: false
freeProcessCommandsEnabled: false
freeUrlExecutionEnabled: false
```

## ENV / Secrets

Beispiel-Datei im Repo:

```text
remote-modboard/backend/.env.example
```

Produktive Secret-Datei spaeter auf dem Server:

```text
/etc/stream-control-center/remote-modboard.env
```

Regeln:

```text
keine echten Secrets ins Repo
keine Secrets ins Frontend
keine Secrets ins Audit/Log
kein Passwort posten oder dokumentieren
```

## MariaDB / mysql2

Der Remote-Service plant:

```text
Engine: MariaDB 11.8.6
Treiber: mysql2/promise
```

`mysql2` ist in diesem separaten Paket in `remote-modboard/backend/package.json` vorgesehen.

Wichtig:

```text
RDAP5F fuehrt kein npm install aus.
RDAP5F fuehrt keine DB-Migration aus.
RDAP5F fuehrt keine DB-Schreibaktion aus.
```

Der Code laedt `mysql2` lazy. Wenn der Treiber fehlt, crasht der Service beim Healthcheck nicht, sondern meldet `driverAvailable: false`.

## Nicht geaendert

```text
backend/server.js
backend/modules/remote_agent.js
package.json im Repo-Root
D:\Streaming\stramAssets\data\sqlite\app.sqlite
nginx
systemd
MariaDB-Schema
```

## Bewusst offener TODO

`backend/modules/remote_agent.js` ist noch RDAP4B-Stand und enthaelt `sound_profi` noch als Rolle/Permission-Preset. Das ist seit RDAP5C3 fachlich ueberholt.

Dieser Step aendert die Datei bewusst noch nicht, damit RDAP5F nur das neue Remote-Node-Basispaket vorbereitet.

Verbindlicher TODO:

```text
backend/modules/remote_agent.js spaeter auf RDAP5C3 Rollen-/Gruppenmodell korrigieren.
sound_profi darf dort nicht mehr als Rolle oder festes Permission-Preset gefuehrt werden.
```

## Tests

Nach Einspielen:

```powershell
Test-Path .\remote-modboard\backend\server.js
Test-Path .\remote-modboard\backend\src\app.js
Test-Path .\remote-modboard\backend\.env.example
Test-Path .\docs\current\REMOTE_DASHBOARD_RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE.md
```

Syntaxcheck:

```powershell
node --check .\remote-modboard\backend\server.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\src\routes\health.routes.js
node --check .\remote-modboard\backend\src\routes\status.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\services\config.service.js
node --check .\remote-modboard\backend\src\services\db-health.service.js
node --check .\remote-modboard\backend\src\security\safety.js
```

Kein Node-Neustart noetig, weil der neue Remote-Service noch nicht produktiv eingebunden wird.

## Naechster sinnvoller Schritt

```text
RDAP5G_REMOTE_NODE_SERVER_INSTALL_PLAN
```

Ziel:

```text
Installationsplan fuer Webserver-Pfad, ENV-Datei, npm install im separaten remote-modboard/backend, systemd und nginx-Reverse-Proxy vorbereiten.
```

Noch ohne produktive Aktion, ausser Forrest gibt fuer Installation/Deployment separat `go`.
