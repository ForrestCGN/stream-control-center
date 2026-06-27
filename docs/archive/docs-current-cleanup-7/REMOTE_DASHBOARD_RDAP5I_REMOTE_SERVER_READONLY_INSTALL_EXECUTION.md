# REMOTE DASHBOARD RDAP5I - Remote Server Read-only Install Execution

Stand: 2026-06-23  
Projekt: ForrestCGN / stream-control-center  
Step: RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION  
Status: Erfolgreich live read-only installiert

## Kurzfazit

RDAP5I wurde erfolgreich auf dem Webserver `web.cgn.community` umgesetzt.

Der Remote-Modboard-Node-Basisdienst läuft jetzt read-only hinter:

```text
https://mods.forrestcgn.de/api/remote/health
https://mods.forrestcgn.de/api/remote/status
https://mods.forrestcgn.de/api/remote/routes
```

Der Dienst ist bewusst nur lesend aktiv.

```text
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
agentActionsEnabled: false
migrationEnabled: false
```

## Live-Server-Fakten

```text
Webserver: web.cgn.community
Subdomain: mods.forrestcgn.de
OS: Debian 13
Node: v20.19.2
npm: 9.2.0
MariaDB: 11.8.6
node path: /usr/bin/node
nginx: vorhanden, syntax ok
HTTPS/HTTP2: aktiv
```

## Wichtige DB-Korrektur

In frueherer Doku waren DB-Name und DB-User vertauscht.

Durch ISPConfig-Screenshot und direkte MariaDB-Pruefung wurde bestaetigt:

```text
Database user: c1stream_control
Database name: c3stream_control
```

Final gueltig fuer Remote-Modboard:

```text
DB_ENGINE=MariaDB 11.8.6
DB_HOST=localhost
DB_PORT=3306
DB_NAME=c3stream_control
DB_USER=c1stream_control
DB_PASSWORD=steht nur auf dem Server in /etc/stream-control-center/remote-modboard.env
```

Direkter MariaDB-Test war erfolgreich:

```bash
mysql -u c1stream_control -p c3stream_control -e "SELECT 1 AS ok;"
```

Ergebnis:

```text
+----+
| ok |
+----+
|  1 |
+----+
```

## Installierte Pfade

```text
/opt/stream-control-center/remote-modboard/backend
/etc/stream-control-center/remote-modboard.env
/etc/systemd/system/scc-remote-modboard.service
```

## Service-User

```text
User: sccremote
uid=999(sccremote)
gid=989(sccremote)
Shell: /usr/sbin/nologin
```

Zweck:

```text
root richtet ein
sccremote betreibt spaeter den Node-Service
```

Der Node-Service laeuft nicht als root.

## Datei- und Rechte-Stand

```text
/opt/stream-control-center/remote-modboard/backend
Besitzer: sccremote:sccremote

/etc/stream-control-center
Besitzer: root:sccremote
Rechte: 750

/etc/stream-control-center/remote-modboard.env
Besitzer: root:sccremote
Rechte: 640
```

Passwort wurde nicht im Chat gepostet und nicht ins Repo geschrieben.

## Installierte Node-Abhaengigkeiten

Im separaten Remote-Paket:

```text
/opt/stream-control-center/remote-modboard/backend
```

Bestaetigte Versionen:

```text
express 5.2.1
dotenv 17.4.2
mysql2 3.22.5
```

`npm install --omit=dev` wurde nur dort ausgefuehrt, nicht im Root-Projekt und nicht im lokalen Stream-PC-System.

`npm run check` lief ohne Fehler.

## systemd

Service:

```text
scc-remote-modboard.service
```

Status bestaetigt:

```text
Loaded: loaded (/etc/systemd/system/scc-remote-modboard.service; enabled)
Active: active (running)
Main PID: node
Listen: 127.0.0.1:3010
```

Healthcheck intern erfolgreich:

```bash
curl -s "http://127.0.0.1:3010/api/remote/health?db=1" | python3 -m json.tool
```

Wichtig im Ergebnis:

```text
ok: true
readOnly: true
writeEnabled: false
connectionTested: true
reachable: true
migrationEnabled: false
error: null
```

## nginx / ISPConfig

nginx-Einbindung wurde bewusst ueber ISPConfig vorgenommen, nicht direkt per Hand in den vHost geschrieben.

Ort in ISPConfig:

```text
Sites -> Website -> forrestcgn.de -> Options -> nginx Directives
```

Eingetragener Block:

```nginx
# RDAP5I Remote-Modboard read-only API proxy
location ^~ /api/remote/ {
    proxy_pass http://127.0.0.1:3010/api/remote/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_read_timeout 30s;
    proxy_connect_timeout 5s;
    proxy_send_timeout 30s;
}
```

Danach:

```bash
nginx -t
systemctl reload nginx
```

`nginx -t` war erfolgreich. Die http2-Warnings aus anderen vHosts sind vorhanden, blockieren aber nicht.

## Oeffentliche HTTPS-Tests

Erfolgreich getestet:

```bash
curl -s "https://mods.forrestcgn.de/api/remote/health?db=1" | python3 -m json.tool
curl -s "https://mods.forrestcgn.de/api/remote/status" | python3 -m json.tool
curl -s "https://mods.forrestcgn.de/api/remote/routes" | python3 -m json.tool
```

Bestaetigt bei `health?db=1`:

```text
ok: true
readOnly: true
writeEnabled: false
connectionTested: true
reachable: true
migrationEnabled: false
error: null
```

Bestaetigt bei `status`:

```text
agent.enabled: false
agent.connected: false
agent.actionsEnabled: false
plannedTransport: wss
plannedDirection: stream-pc-agent-to-webserver
plannedModel: RDAP5C3 roles-and-groups-separated
soundProfiIsRole: false
soundProfiIsGroupMarker: true
```

Bestaetigt bei `routes`:

```text
nur GET /api/remote/health
nur GET /api/remote/status
nur GET /api/remote/routes
POST/PUT/PATCH/DELETE remote writes deaktiviert
auth/session creation deaktiviert
DB migration deaktiviert
agent action execution deaktiviert
OBS/Sound/Overlay/Command control deaktiviert
shell/file/process operations deaktiviert
```

## Nicht umgesetzt / bewusst deaktiviert

```text
keine DB-Migration
keine MariaDB-Schreibaktion
kein Auth/Login
keine Session-Erstellung
kein produktiver Agent
keine Agent-Actions
keine OBS-Steuerung
keine Sound-Steuerung
keine Overlay-Steuerung
keine Command-/Channelpoints-Steuerung
keine lokale SQLite-Aenderung
keine freie Shell-/Datei-/Prozesssteuerung
keine Secrets im Repo oder Frontend
```

## Noch abschliessend zu pruefen

Nach Live-Betrieb bitte noch einmal ausfuehren und Ergebnis dokumentieren:

```bash
systemctl is-enabled scc-remote-modboard.service
systemctl is-active scc-remote-modboard.service
journalctl -u scc-remote-modboard.service -n 30 --no-pager
```

Erwartung:

```text
enabled
active
keine Fehler im Journal
```

## Naechster sinnvoller Schritt

```text
RDAP5I_DOCS_FINALIZE_REMOTE_READONLY_LIVE
```

Ziel:

```text
Doku finalisieren
DB-User/DB-Name-Korrektur in allen relevanten Projektdateien festhalten
neuen Chat-Prompt aktualisieren
offene Abschlusspruefungen dokumentieren
```

Danach moeglich:

```text
RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING
```

oder:

```text
RDAP6_AUTH_DB_MIGRATION_PREP
```

Aber erst nach sauber dokumentiertem RDAP5I-Abschluss und separatem Go.
