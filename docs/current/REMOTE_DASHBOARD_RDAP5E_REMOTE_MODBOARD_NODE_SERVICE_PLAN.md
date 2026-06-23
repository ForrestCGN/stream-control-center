# REMOTE DASHBOARD RDAP5E - Remote Modboard Node Service Plan

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Step: RDAP5E_REMOTE_MODBOARD_NODE_SERVICE_PLAN  
Status: Planung, keine Umsetzung

## Zweck

RDAP5E plant, wie der spaetere Remote-Modboard-Node-Service auf `web.cgn.community` fuer `mods.forrestcgn.de` aufgebaut werden soll.

Dies ist nur Planung.

```text
Kein Code.
Kein npm install.
Keine DB-Migration.
Keine MariaDB-Schreibaktion.
Keine lokale SQLite-Aenderung.
Kein produktiver Node-Service.
Keine nginx-/Firewall-/Proxy-Aenderung.
Keine Secrets im Repo oder Frontend.
Kein Remote-Agent.
Keine Agent-Actions.
Keine OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freie Shell-/Datei-/Prozesssteuerung.
```

## Ausgangsstand

Bekannter Remote-Server-Stand:

```text
Webserver: web.cgn.community
Remote-Modboard-Subdomain: mods.forrestcgn.de
OS: Debian 13
nginx vorhanden
HTTPS / HTTP2 laeuft
mods.forrestcgn.de liefert 200 OK
Node v20.19.2 vorhanden
npm 9.2.0 vorhanden
git vorhanden
MariaDB-Client vorhanden
kein produktiver Remote-Modboard-Node-Service
kein Reverse Proxy fuer Remote-API
kein produktiver Remote-Agent
```

Zusaetzlich per Gegencheck bestaetigt:

```text
mysql --version:
mysql from 11.8.6-MariaDB, client 15.2 for debian-linux-gnu (x86_64) using EditLine wrapper
```

Damit gilt fuer die Remote-Webserver-DB konkret:

```text
Engine: MariaDB 11.8.6
Client: mysql client 15.2
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
Passwort: nicht dokumentieren, nicht posten, nur ENV/Secret-Ablage
```

Die lokale produktive SQLite bleibt unveraendert:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Keine Migration, kein Kopieren, kein Ersetzen, kein Loeschen ohne separaten Plan und ausdrueckliches Go.

## Fuehrender Rechte-/Rollenstand

Ab RDAP5C3 gilt:

```text
Rollen und Gruppen sind getrennt.
sound_profi ist keine Rolle.
sound_profi ist keine feste Rechte-Sammlung.
sound_profi ist eine Gruppe / Markierung.
Modulrechte werden pro Modul konfiguriert.
```

Twitch-Status:

```text
streamer / broadcaster
mod
vip
```

Auswirkung:

```text
streamer -> Dashboard-Basiszugang
mod      -> Dashboard-Basiszugang
vip      -> kein Dashboard-Basiszugang, nur Community/Website
```

Manuell vergebene Dashboard-Rollen:

```text
leadmod
admin
owner
spaeter eigene Rollen optional
```

Dashboard-Gruppen / Markierungen:

```text
sound_profi
spaeter event_helfer
spaeter medien_helfer
spaeter eigene Gruppen optional
```

Revidiertes DB-Konzept ab RDAP5C3:

```text
schema_migrations
dashboard_users
dashboard_twitch_status
dashboard_roles
dashboard_user_roles
dashboard_groups
dashboard_user_groups
dashboard_permissions
dashboard_module_permission_matrix
dashboard_user_permission_overrides
dashboard_sessions
dashboard_locks
dashboard_audit_log
agent_registry
```

Wichtig:

```text
dashboard_role_permissions ist nicht mehr starres Hauptmodell.
Modulmatrix nutzt target_type + target_key.
Keine festen Spalten wie default_for_sound_profi.
Neue Rollen/Gruppen spaeter ohne DB-Schema-Aenderung moeglich.
```

## Zielarchitektur

Geplanter Aufbau:

```text
Mods / Sound-Profi / Forrest
        ↓
https://mods.forrestcgn.de
        ↓
nginx / HTTPS / HTTP2
        ↓
Reverse Proxy fuer Remote-API
        ↓
Node-Service nur intern auf 127.0.0.1
        ↓
MariaDB fuer Remote-Modboard/Auth/User/Rollen/Locks/Audit
        ↓
spaeter WSS-Verbindung zum Stream-PC-Agent
        ↓
lokales stream-control-center / OBS / Sound / Media / Overlays
```

Grundregeln:

```text
Webserver kontrolliert Zugriff, API, Rechte und Audit.
Stream-PC-Agent verbindet sich spaeter aktiv zum Webserver.
Keine Portfreigabe am Stream-PC.
Keine direkte Mod-Verbindung zum Stream-PC.
Keine freien Befehle.
Dashboard-Buttons sind keine Sicherheit.
Backend entscheidet Rechte.
```

## Empfohlener Service-Pfad

Der produktive Node-Service soll nicht direkt im oeffentlichen Webroot liegen.

Empfohlen:

```text
/opt/stream-control-center/remote-modboard/
```

Geplante Struktur:

```text
/opt/stream-control-center/
└── remote-modboard/
    ├── backend/
    │   ├── server.js
    │   ├── package.json
    │   ├── src/
    │   │   ├── app.js
    │   │   ├── routes/
    │   │   │   ├── health.routes.js
    │   │   │   ├── status.routes.js
    │   │   │   └── routes.routes.js
    │   │   ├── services/
    │   │   │   ├── config.service.js
    │   │   │   ├── db.service.js
    │   │   │   └── audit.service.js
    │   │   └── security/
    │   │       └── headers.js
    │   └── logs/
    ├── config/
    │   └── remote-modboard.example.json
    └── README.md
```

Secrets getrennt davon:

```text
/etc/stream-control-center/remote-modboard.env
```

Vorteile:

```text
nicht oeffentlich im Webroot
klarer Service-Ort
systemd-tauglich
Secrets getrennt vom Repo und Frontend
einfacher Rollback/Backup
```

Alternative, falls `/opt` auf dem Server bewusst nicht genutzt werden soll:

```text
/var/www/clients/clientX/webY/private/remote-modboard/
```

`clientX/webY` darf nicht geraten werden und muesste vor Umsetzung auf dem Server gelesen werden.

## Empfohlener interner Port

```text
127.0.0.1:3010
```

Begruendung:

```text
Node-Service nur lokal erreichbar.
nginx ist der einzige oeffentliche Einstieg.
3010 ist eindeutiger als generisches 3000.
```

## systemd-Service-Konzept

Spaeterer Service-Name:

```text
scc-remote-modboard.service
```

Konzept:

```ini
[Unit]
Description=ForrestCGN Stream Control Center Remote Modboard
After=network.target mariadb.service

[Service]
Type=simple
WorkingDirectory=/opt/stream-control-center/remote-modboard/backend
EnvironmentFile=/etc/stream-control-center/remote-modboard.env
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
User=sccremote
Group=sccremote
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Noch nicht ausfuehren. Vor Umsetzung pruefen:

```bash
which node
id sccremote
test -d /opt/stream-control-center
test -d /etc/stream-control-center
```

Falls `sccremote` nicht existiert, wird die User-/Gruppenanlage in einem separaten Installationsstep geplant.

## nginx-/Reverse-Proxy-Konzept

Oeffentliche Domain:

```text
https://mods.forrestcgn.de
```

Spaetere Proxy-Routen:

```text
/api/remote/health        -> Node Health
/api/remote/status        -> Node Status
/api/remote/routes        -> aktive read-only Routen
/api/remote/auth/*        -> spaeter Auth
/api/remote/users/*       -> spaeter Userverwaltung
/api/remote/agent/*       -> spaeter Agent-Verwaltung
/ws/agent                 -> spaeter WSS-Agent
```

nginx-Konzept fuer API:

```nginx
location /api/remote/ {
    proxy_pass http://127.0.0.1:3010/api/remote/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

nginx-Konzept fuer spaeteres WSS:

```nginx
location /ws/agent {
    proxy_pass http://127.0.0.1:3010/ws/agent;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

RDAP5E aendert nginx nicht.

## ENV-/Secret-Ablage

Empfohlen:

```text
/etc/stream-control-center/remote-modboard.env
```

Beispielwerte ohne echte Secrets:

```env
NODE_ENV=production
REMOTE_MODBOARD_HOST=127.0.0.1
REMOTE_MODBOARD_PORT=3010
REMOTE_PUBLIC_BASE_URL=https://mods.forrestcgn.de

DB_HOST=localhost
DB_PORT=3306
DB_NAME=c1stream_control
DB_USER=c3stream_control
DB_PASSWORD=NICHT_INS_REPO

SESSION_SECRET=NICHT_INS_REPO
AGENT_SHARED_SECRET=NICHT_INS_REPO
LOG_LEVEL=info
```

Dateirechte spaeter:

```bash
chown root:sccremote /etc/stream-control-center/remote-modboard.env
chmod 640 /etc/stream-control-center/remote-modboard.env
```

Regeln:

```text
Kein DB-Passwort ins Repo.
Kein Agent-Secret ins Repo.
Kein Twitch Client Secret ins Repo.
Kein Session Secret ins Repo.
Keine Secrets im Frontend.
Keine Secrets im Audit.
```

## MariaDB-Strategie

DB-Engine:

```text
MariaDB 11.8.6
```

Geplanter Node-Treiber:

```text
mysql2/promise
```

Grundregeln:

```text
SQL weiterhin moeglichst DB-portabel halten.
Keine MariaDB-Spezialtricks ohne Grund.
Keine Migration ohne separaten Plan.
Keine Schreibaktion in RDAP5E/RDAP5F.
```

Erster spaeterer DB-Healthcheck nur lesend:

```sql
SELECT 1 AS ok;
```

Noch nicht:

```text
keine Tabellenanlage
keine Inserts
keine Updates
keine Deletes
keine Migration
```

## Erste read-only API

Fuer den ersten spaeteren Implementierungsstep RDAP5F geplant:

```text
GET /api/remote/health
GET /api/remote/status
GET /api/remote/routes
```

### GET /api/remote/health

Soll liefern:

```json
{
  "ok": true,
  "service": "remote-modboard",
  "moduleBuild": "RDAP5F_REMOTE_NODE_BASE_READONLY",
  "mode": "readonly",
  "writeEnabled": false,
  "agentActionsEnabled": false,
  "dbConfigured": true,
  "dbReachable": true,
  "timestamp": "..."
}
```

### GET /api/remote/status

Soll liefern:

```json
{
  "ok": true,
  "publicHost": "mods.forrestcgn.de",
  "nodeListen": "127.0.0.1:3010",
  "database": {
    "type": "mariadb",
    "engine": "MariaDB 11.8.6",
    "name": "c1stream_control",
    "reachable": true,
    "writeEnabled": false,
    "migrationEnabled": false
  },
  "agent": {
    "enabled": false,
    "connected": false,
    "actionsEnabled": false
  },
  "security": {
    "secretsInRepo": false,
    "freeShellCommands": false,
    "freeFileCommands": false,
    "freeProcessCommands": false
  }
}
```

### GET /api/remote/routes

Soll alle aktiven Remote-Routen listen und klar markieren:

```text
readOnly: true
writeEnabled: false
agentActionsEnabled: false
```

## Logging-/Audit-Vorbereitung

RDAP5F darf nur normales Service-Logging vorbereiten:

```text
Start/Stop
Healthcheck
DB reachable true/false
Request path
Fehler ohne Secrets
```

Noch kein produktives DB-Audit in RDAP5F.

Spaeteres Audit-Ziel:

```text
dashboard_audit_log
```

Audit-Regeln:

```text
keine Secrets loggen
keine Tokens loggen
keine vollstaendigen sensiblen Payloads loggen
IP/UserAgent spaeter hoechstens gehasht speichern
Retention konfigurierbar
Owner/Admin sichtbar, normale Mods nicht
```

## Spaetere Agent-Anbindung

Nicht Teil von RDAP5E/RDAP5F.

Richtung bleibt:

```text
Stream-PC-Agent -> Webserver
```

Nicht:

```text
Webserver -> Heim-IP
```

Erste spaetere Agent-Actions maximal:

```text
agent.ping
agent.status.request
```

Noch nicht:

```text
sound.play.live
sound.test.live
sound.pause
sound.resume
sound.stop_current
overlay.show.live
overlay.hide.live
obs.scene.switch
media.delete
media.write
config.write
texts.write
commands.write
channelpoints.write
db.*
shell.*
process.*
file.*
```

## Sicherheitsgrenzen

Hart festgelegt:

```text
keine shell.*
keine process.*
keine file.*
keine db.* Freiform
keine freie URL-Ausfuehrung
keine raw config writes
keine Agent-Aktion ohne Allowlist
keine Schreibaktion ohne Permission + Lock + Audit
Frontend entscheidet nie Rechte
Backend entscheidet
```

## Frischer Gegencheck vor echter Installation

Ein kurzer Gegencheck direkt vor Installation ist sinnvoll, aber kein eigener grosser RDAP5D-Hauptstep.

Erlaubte Lesebefehle:

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
nginx -T | grep -n "mods.forrestcgn.de" -A 30 -B 10
```

Keine Installation ohne separates Go.

## Rollback-/Undo-Konzept

Da RDAP5E nur Doku ist:

```text
Rollback: Doku-ZIP nicht einspielen oder per stepundo.cmd zurueckgehen.
Keine Live-Dateien geaendert.
Keine DB geaendert.
Keine nginx-Dateien geaendert.
Kein Node-Service gestartet.
```

Fuer spaetere Implementierungssteps:

```text
systemd-Service deaktivieren/stoppen
nginx-Proxy entfernen oder auskommentieren
Node-Service-Dateien aus /opt entfernen oder altes Backup wiederherstellen
ENV-Datei nicht ins Repo uebernehmen
DB-Migration separat mit Backup/Rollback planen
```

## Naechster sinnvoller Schritt

Nach RDAP5E:

```text
RDAP5F_REMOTE_NODE_BASE_READONLY_PACKAGE
```

Moeglicher Scope fuer RDAP5F:

```text
kleines Node-Backend-Paket fuer Remote-Modboard
nur read-only Health/Status/Routes
.env.example ohne echte Secrets
keine DB-Migration
keine MariaDB-Schreibaktion
keine lokale SQLite-Aenderung
systemd/nginx nur als Doku-/Beispiel, nicht aktiv angewendet
```

Betroffene neue Repo-Pfade spaeter:

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

Umsetzung nur nach separatem Scope und ausdruecklichem Go.
