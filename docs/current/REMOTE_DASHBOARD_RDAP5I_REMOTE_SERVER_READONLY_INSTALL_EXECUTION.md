# REMOTE DASHBOARD - RDAP5I Remote Server Read-only Install Execution

Stand: 2026-06-23

## Zweck

RDAP5I dokumentiert den live installierten Remote-Server-Stand fuer das spaetere Modboard / Remote Dashboard unter `mods.forrestcgn.de`.

Dieser Stand ist absichtlich read-only. Er dient als sicherer Live-Verbindungstest zwischen oeffentlicher Subdomain, nginx/ISPConfig, lokalem Node-Service und MariaDB-Lesetest.

## Ergebnis

RDAP5I ist technisch live und read-only erfolgreich.

Remote API:

```text
https://mods.forrestcgn.de/api/remote/health
https://mods.forrestcgn.de/api/remote/status
https://mods.forrestcgn.de/api/remote/routes
https://mods.forrestcgn.de/api/remote/health?db=1
```

Bestaetigter Zustand:

```text
ok: true
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
connectionTested: true
reachable: true
migrationEnabled: false
error: null
```

## Server-Fakten

```text
Webserver: web.cgn.community
Subdomain: mods.forrestcgn.de
OS: Debian 13
Node: v20.19.2
npm: 9.2.0
MariaDB: 11.8.6
node path: /usr/bin/node
nginx syntax ok
```

Installierte Pfade:

```text
/opt/stream-control-center/remote-modboard/backend
/etc/stream-control-center/remote-modboard.env
/etc/systemd/system/scc-remote-modboard.service
```

Service:

```text
scc-remote-modboard.service
User: sccremote
Listen: 127.0.0.1:3010
```

Wichtig: Node-Service laeuft nicht als root.

## Systemd-Pruefung

Bestaetigte Abschlusspruefungen:

```bash
systemctl is-enabled scc-remote-modboard.service
systemctl is-active scc-remote-modboard.service
journalctl -u scc-remote-modboard.service -n 30 --no-pager
```

Ergebnis:

```text
is-enabled = enabled
is-active = active
journalctl = keine Fehler; Service gestartet und read-only aktiv
```

## DB-Korrektur

Fruehere Doku hatte DB_USER und DB_NAME vertauscht.

Final korrekt und live bestaetigt:

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
```

Nicht mehr verwenden:

```text
DB_USER=c3stream_control
DB_NAME=c1stream_control
```

Passwort steht nur auf dem Server in:

```text
/etc/stream-control-center/remote-modboard.env
```

Passwort niemals posten oder dokumentieren.

## nginx / ISPConfig

Der nginx-Proxy wurde ueber ISPConfig eingetragen, nicht direkt in die vHost-Datei.

Ort:

```text
Sites -> Website -> forrestcgn.de -> Options -> nginx Directives
```

Block:

```nginx
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

Danach ausgefuehrt:

```bash
nginx -t
systemctl reload nginx
```

`nginx -t` war erfolgreich. Bestehende http2-Warnings blockieren nicht.

## Sicherheitsstatus RDAP5I

Aktiv:

- Read-only API
- Health/Status/Routes
- DB-Lesetest optional ueber `?db=1`
- systemd-Service unter eigenem User
- nginx-Proxy nur fuer `/api/remote/`

Deaktiviert:

- POST/PUT/PATCH/DELETE remote writes
- Auth/session creation
- DB migration
- Agent action execution
- OBS/Sound/Overlay/Command control
- Shell/File/Process operations

## Nicht geaendert

In diesem Dokumentationsstand wurden keine Code-, DB-, Service- oder nginx-Aenderungen vorgenommen.

Nicht geaendert:

- keine Backend-Logik
- keine DB-Migration
- keine produktive SQLite
- keine MariaDB-Struktur
- keine Agent-Aktionen
- keine Auth-Aktivierung
- kein OBS-/Sound-/Overlay-Control
- keine Secrets dokumentiert

## Naechste Schritte

Abgeschlossen/zu bestaetigen:

```text
RDAP5I_DOCS_FINALIZE_REMOTE_READONLY_LIVE
```

Danach optional:

```text
RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING
```

Spaeter mit separatem Plan:

```text
RDAP6_AUTH_DB_MIGRATION_PREP
```

RDAP6 darf nur mit Backup-/Migrationsplan und eigenem Go starten.
