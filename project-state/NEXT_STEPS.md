# NEXT STEPS

Stand: RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE
```

## Ziel von RDAP5F

RDAP5F soll ein erstes minimales Remote-Modboard-Node-Paket vorbereiten.

Wichtig:

```text
nur read-only
kein produktiver Node-Service-Start
keine nginx-Aenderung
keine DB-Migration
keine MariaDB-Schreibaktion
keine lokale SQLite-Aenderung
keine Secrets im Repo
kein Agent
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine freie Shell-/Datei-/Prozesssteuerung
```

## Geplanter Scope RDAP5F

Moegliche neue Repo-Pfade:

```text
remote-modboard/backend/package.json
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/health.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/README.md
remote-modboard/config/remote-modboard.example.json
```

Moegliche Doku-/Projektstatus-Dateien:

```text
docs/current/REMOTE_DASHBOARD_RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## RDAP5F read-only API

Geplante Routen:

```text
GET /api/remote/health
GET /api/remote/status
GET /api/remote/routes
```

Erwartete Sicherheitswerte:

```text
readOnly: true
writeEnabled: false
agentActionsEnabled: false
migrationEnabled: false
freeShellCommands: false
freeFileCommands: false
freeProcessCommands: false
```

## Vor RDAP5F Umsetzung prüfen

Ein kurzer Gegencheck direkt vor echter Installation/Deployment ist erlaubt:

```bash
node -v
npm -v
git --version
mysql --version
whoami
pwd
which node
ls -la /opt
ls -la /etc/stream-control-center 2>/dev/null || true
```

Fuer nginx erst bei spaeterem Proxy-Step:

```bash
nginx -T | grep -n "mods.forrestcgn.de" -A 30 -B 10
```

## Bekannte Server-Fakten

Nicht nochmal als großen Check planen:

```text
OS: Debian 13
nginx vorhanden
HTTPS / HTTP2 läuft
mods.forrestcgn.de liefert 200 OK
Node v20.19.2 vorhanden
npm 9.2.0 vorhanden
git vorhanden
MariaDB-Client vorhanden
MariaDB 11.8.6 vorhanden
```

## RDAP5F darf

- kleines read-only Node-Paket vorbereiten
- Dateistruktur im Repo vorschlagen/liefern
- `.env.example` ohne echte Secrets liefern
- Health-/Status-/Routes-API read-only bauen
- MariaDB-Verbindung optional nur read-only per Healthcheck planen
- Tests planen
- Rollback/Undo planen

## RDAP5F darf nicht ohne neues Go

- kein produktiver Node-Service-Start
- kein systemd-Service aktivieren
- keine nginx-/Firewall-/Proxy-Aenderung
- kein npm install auf dem Webserver
- keine DB-Migration
- keine MariaDB-Schreibaktion
- keine lokale SQLite-Aenderung
- keine Secrets ins Repo oder Frontend schreiben
- keine Agent-Actions aktivieren
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine freie Shell-/Datei-/Prozesssteuerung

## Danach mögliche Schritte

```text
RDAP5G_REMOTE_NODE_SYSTEMD_NGINX_DRY_RUN_PLAN
```

Erst nach RDAP5F read-only Paket und separatem Go.

Oder:

```text
RDAP6_AUTH_DB_MIGRATION_PREP
```

Erst nach Service-/ENV-/Secret-Klärung und separatem Backup-/Rollback-/Migrationsplan.
