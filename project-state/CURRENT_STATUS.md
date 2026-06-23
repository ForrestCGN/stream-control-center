# CURRENT STATUS

Stand: RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION  
Datum: 2026-06-23

## Aktueller bestaetigter Arbeitsstand

RDAP5I wurde erfolgreich live umgesetzt.

Der Remote-Modboard-Node-Basisdienst laeuft read-only auf dem Webserver:

```text
Webserver: web.cgn.community
Subdomain/API: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Listen intern: 127.0.0.1:3010
```

## Live verfuegbare Routen

```text
GET https://mods.forrestcgn.de/api/remote/health
GET https://mods.forrestcgn.de/api/remote/status
GET https://mods.forrestcgn.de/api/remote/routes
```

Mit DB-Lesetest:

```text
GET https://mods.forrestcgn.de/api/remote/health?db=1
```

## Bestaetigte Health-Werte

```text
ok: true
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
driverAvailable: true
configured: true
connectionTested: true
reachable: true
migrationEnabled: false
error: null
```

## Service-/Runtime-Stand

```text
Node: v20.19.2
npm: 9.2.0
MariaDB: 11.8.6
mysql2: 3.22.5
express: 5.2.1
dotenv: 17.4.2
```

## Installierte Pfade auf Webserver

```text
/opt/stream-control-center/remote-modboard/backend
/etc/stream-control-center/remote-modboard.env
/etc/systemd/system/scc-remote-modboard.service
```

## Service-User

```text
sccremote
```

Node-Service laeuft nicht als root.

## Wichtige DB-Korrektur

Fruehere Doku hatte DB_USER und DB_NAME vertauscht.

Final bestaetigt:

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
```

Nicht mehr verwenden:

```text
DB_USER=c3stream_control
DB_NAME=c1stream_control
```

## nginx / ISPConfig

Die nginx-Einbindung wurde ueber ISPConfig im Feld `nginx Directives` der Website `forrestcgn.de` umgesetzt.

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

`nginx -t` war erfolgreich, danach wurde `systemctl reload nginx` ausgefuehrt.

## Rollen-/Gruppenmodell

Fuehrend bleibt RDAP5C3:

```text
Rollen und Gruppen sind getrennt.
sound_profi ist keine Rolle.
sound_profi ist keine feste Rechte-Sammlung.
sound_profi ist eine Gruppe / Markierung.
Modulrechte werden pro Modul konfiguriert.
```

Der Remote-Status bestaetigt:

```text
soundProfiIsRole: false
soundProfiIsGroupMarker: true
modulePermissionMatrixUsesTargetTypeAndTargetKey: true
```

## Nicht umgesetzt

```text
keine DB-Migration
keine MariaDB-Schreibaktion
kein Auth/Login
keine Sessions
kein produktiver WSS-Agent
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine lokale SQLite-Aenderung
keine freie Shell-/Datei-/Prozesssteuerung
keine Secrets im Repo oder Frontend
```

## Noch offen / als naechstes

```text
systemctl is-enabled scc-remote-modboard.service
systemctl is-active scc-remote-modboard.service
journalctl -u scc-remote-modboard.service -n 30 --no-pager
```

Danach Doku finalisieren und GitHub/dev aktualisieren.

## Naechster sinnvoller Schritt

```text
RDAP5I_DOCS_FINALIZE_REMOTE_READONLY_LIVE
```

Danach moeglich:

```text
RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING
```

oder nach separatem Plan:

```text
RDAP6_AUTH_DB_MIGRATION_PREP
```
