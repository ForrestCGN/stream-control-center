# REMOTE DASHBOARD RDAP5G - Remote Node Server Install Plan

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Step: RDAP5G_REMOTE_NODE_SERVER_INSTALL_PLAN  
Status: Planung, keine Umsetzung

## Zweck

RDAP5G plant, wie das in RDAP5F vorbereitete separate Remote-Modboard-Node-Basispaket spaeter auf dem Webserver installiert und betrieben werden soll.

Fuehrendes Paket:

```text
remote-modboard/backend/
```

Zielserver:

```text
web.cgn.community
mods.forrestcgn.de
```

## Wichtig

Dies ist nur ein Installationsplan.

```text
Kein produktiver Node-Service wird gestartet.
Kein npm install wird ausgefuehrt.
Keine nginx-Aenderung wird ausgefuehrt.
Keine systemd-Aenderung wird ausgefuehrt.
Keine DB-Migration wird ausgefuehrt.
Keine MariaDB-Schreibaktion wird ausgefuehrt.
Keine lokale SQLite wird angefasst.
Keine Secrets werden dokumentiert.
Keine Agent-Actions werden aktiviert.
```

## Ausgangsstand

Aus RDAP5F existiert das separate Remote-Modboard-Basispaket:

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

Der Root-Server `backend/server.js` auf dem Stream-PC bleibt davon getrennt und unveraendert.

## Bekannter Webserver-Stand

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
MariaDB 11.8.6 vorhanden
DB-Name: c1stream_control
DB-User: c3stream_control
Remote Access: aus
Charset: utf8mb4
Backup: woechentlich
```

Passwort wird nicht dokumentiert und darf nicht ins Repo oder Frontend.

## Zielarchitektur

```text
https://mods.forrestcgn.de
        ↓
nginx / HTTPS
        ↓
/api/remote/* Reverse Proxy
        ↓
127.0.0.1:3010
        ↓
Remote-Modboard Node-Service
        ↓
MariaDB read-only health spaeter optional
```

Der Node-Service soll nur lokal an `127.0.0.1` binden und nicht oeffentlich direkt erreichbar sein.

## Geplanter Zielpfad

Empfohlener Installationspfad auf dem Webserver:

```text
/opt/stream-control-center/remote-modboard/backend
```

Begruendung:

```text
nicht im oeffentlichen Webroot
sauberer Service-Ort
systemd-freundlich
Secrets bleiben getrennt unter /etc
kein Risiko, .env per Web auszuliefern
```

Falls `/opt` auf dem konkreten Server nicht passend ist, muss vor Umsetzung ein alternativer Pfad anhand echter Serverausgaben festgelegt werden.

## Lesebefehle vor echter Installation

Direkt vor RDAP5H sind diese reinen Lesebefehle sinnvoll:

```bash
whoami
pwd
node -v
npm -v
mysql --version
which node
ls -la /opt
ls -la /etc/stream-control-center 2>/dev/null || true
nginx -T 2>/dev/null | grep -n "mods.forrestcgn.de" -A 30 -B 10 || true
```

Diese Befehle pruefen nur den Stand. Sie installieren nichts und aendern nichts.

## Service-User

Geplanter Service-User:

```text
sccremote
```

Ziel:

```text
Node-Service laeuft nicht als root.
Service hat nur Zugriff auf sein eigenes Paket und benoetigte ENV-Datei.
Keine Shell-/Datei-/Prozesssteuerung aus der App.
```

Spaetere Befehle fuer RDAP5H, noch nicht in RDAP5G ausfuehren:

```bash
id sccremote || useradd --system --home /opt/stream-control-center/remote-modboard --shell /usr/sbin/nologin sccremote
```

## ENV-/Secret-Datei

Geplanter Pfad:

```text
/etc/stream-control-center/remote-modboard.env
```

Beispielstruktur ohne echte Secrets:

```env
NODE_ENV=production
REMOTE_MODBOARD_HOST=127.0.0.1
REMOTE_MODBOARD_PORT=3010
REMOTE_PUBLIC_BASE_URL=https://mods.forrestcgn.de
DB_ENGINE=MariaDB 11.8.6
DB_HOST=localhost
DB_PORT=3306
DB_NAME=c1stream_control
DB_USER=c3stream_control
DB_PASSWORD=NICHT_INS_REPO_POSTEN
```

Rechte spaeter:

```bash
chown root:sccremote /etc/stream-control-center/remote-modboard.env
chmod 640 /etc/stream-control-center/remote-modboard.env
```

Wichtig:

```text
DB_PASSWORD nicht hier posten.
DB_PASSWORD nicht dokumentieren.
DB_PASSWORD nicht ins Repo.
DB_PASSWORD nicht ins Frontend.
```

## npm install

`npm install` darf spaeter nur im separaten Remote-Modboard-Paket laufen:

```bash
cd /opt/stream-control-center/remote-modboard/backend
npm install --omit=dev
```

Nicht im Projekt-Root und nicht im lokalen Stream-PC-Backend.

Grund:

```text
Root-package.json bleibt unveraendert.
Lokaler Stream-PC-Server bleibt unveraendert.
Remote-Service hat eigene Dependencies.
```

## systemd-Konzept

Geplanter Service:

```text
scc-remote-modboard.service
```

Beispiel:

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

Vor echter Umsetzung muss `which node` geprueft werden. Falls Node nicht unter `/usr/bin/node` liegt, muss `ExecStart` angepasst werden.

## nginx-Konzept

Geplanter Reverse Proxy fuer read-only API:

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

Spaeter vorbereitbarer WebSocket-Pfad fuer Agent, aber noch nicht produktiv genutzt:

```nginx
location /ws/agent {
    proxy_pass http://127.0.0.1:3010/ws/agent;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

RDAP5G aktiviert diesen Pfad nicht. Er wird nur fuer spaetere Agent-Planung festgehalten.

## Healthchecks nach spaeterem Start

Lokal auf dem Webserver:

```bash
curl -s http://127.0.0.1:3010/api/remote/health
curl -s http://127.0.0.1:3010/api/remote/status
curl -s http://127.0.0.1:3010/api/remote/routes
```

Oeffentlich ueber nginx nach Proxy-Konfiguration:

```bash
curl -s https://mods.forrestcgn.de/api/remote/health
curl -s https://mods.forrestcgn.de/api/remote/status
curl -s https://mods.forrestcgn.de/api/remote/routes
```

Optionaler DB-Healthcheck nur nach ENV-Konfiguration und mysql2-Installation:

```bash
curl -s http://127.0.0.1:3010/api/remote/health?db=1
```

Erwartete Sicherheitswerte:

```text
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
agent.actionsEnabled: false
noShellOrProcessActions: true
noFileWrite: true
```

## Rollback/Undo-Konzept

Falls RDAP5H spaeter fehlschlaegt:

```bash
systemctl stop scc-remote-modboard || true
systemctl disable scc-remote-modboard || true
rm -f /etc/systemd/system/scc-remote-modboard.service
systemctl daemon-reload
```

nginx-Undo:

```text
Vor Aenderung nginx-Site-Datei sichern.
Bei Fehler Sicherung zurueckspielen.
nginx -t ausfuehren.
systemctl reload nginx nur bei erfolgreichem nginx -t.
```

Datei-/Paket-Undo:

```bash
rm -rf /opt/stream-control-center/remote-modboard
```

ENV-Undo nur bewusst:

```bash
rm -f /etc/stream-control-center/remote-modboard.env
```

## Nicht Teil von RDAP5G

```text
keine produktive Installation
kein npm install
kein systemd-Service anlegen
kein nginx bearbeiten
kein DB-Passwort dokumentieren
keine DB-Migration
keine MariaDB-Schreibaktion
keine lokale SQLite-Aenderung
kein Login/Auth
kein produktiver Agent
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine freie Shell-/Datei-/Prozesssteuerung
```

## Naechster sinnvoller Schritt

Nach diesem Plan:

```text
RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE
```

RDAP5H darf erst nach separatem Go erstellt werden und muss dann konkrete Installationsdateien/Anweisungen liefern.
