# CURRENT STATUS - stream-control-center

Stand: 2026-06-23

## Kurzstatus

Das Projekt `stream-control-center` hat fuer das Remote Dashboard / Modboard den Stand `RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING_DOCS` erreicht.

RDAP5I ist technisch live und read-only erfolgreich. RDAP5J dokumentiert darauf aufbauend Monitoring- und Hardening-Pruefungen fuer den live laufenden read-only Remote-Node.

Wichtig: RDAP5J hat keine Code-, DB-, Service- oder nginx-Aenderung aktiviert. Es ist ein sicherer Runbook-/Dokumentationsstand.

## Live-Endpunkte

```text
https://mods.forrestcgn.de/api/remote/health
https://mods.forrestcgn.de/api/remote/status
https://mods.forrestcgn.de/api/remote/routes
https://mods.forrestcgn.de/api/remote/health?db=1
```

## Bestaetigter RDAP5I-Zustand

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

Status:

```text
agent.enabled: false
agent.connected: false
agent.actionsEnabled: false
plannedTransport: wss
plannedDirection: stream-pc-agent-to-webserver
plannedModel: RDAP5C3 roles-and-groups-separated
soundProfiIsRole: false
soundProfiIsGroupMarker: true
modulePermissionMatrixUsesTargetTypeAndTargetKey: true
```

## Server / Service

```text
Webserver: web.cgn.community
Subdomain: mods.forrestcgn.de
OS: Debian 13
Node: v20.19.2
npm: 9.2.0
MariaDB: 11.8.6
Node path: /usr/bin/node
Service: scc-remote-modboard.service
Service user: sccremote
Listen: 127.0.0.1:3010
Backend path: /opt/stream-control-center/remote-modboard/backend
Env path: /etc/stream-control-center/remote-modboard.env
Systemd unit: /etc/systemd/system/scc-remote-modboard.service
```

Node-Service laeuft nicht als root.

## Wichtige DB-Korrektur

Korrekt:

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
```

Falsch/alt, nicht mehr verwenden:

```text
DB_USER=c3stream_control
DB_NAME=c1stream_control
```

Passwort wird nicht dokumentiert und bleibt nur auf dem Server in:

```text
/etc/stream-control-center/remote-modboard.env
```

## Sicherheitsstatus

Aktiv:

- Read-only Remote API
- Health/Status/Routes
- optionaler DB-Lesetest
- nginx/ISPConfig Proxy fuer `/api/remote/`
- systemd-Service unter eigenem User

Deaktiviert:

- Remote writes
- Auth/session creation
- DB migration
- Agent action execution
- OBS/Sound/Overlay/Command control
- riskante Systemoperationen ueber Remote-Agent

## RDAP5J Akzeptanztests

RDAP5J ist dokumentiert. Die Tests muessen auf Server/lokal ausgefuehrt und von Forrest bestaetigt werden.

Zu pruefen:

- Service ist enabled und active.
- Journal zeigt keine Crash-Loops.
- Node lauscht nur lokal auf `127.0.0.1:3010`.
- lokale API liefert Health/Status/Routes.
- oeffentliche API liefert Health/Status/Routes.
- DB-Lesetest funktioniert.
- read-only bleibt aktiv.
- Write/Auth/Migration/Agent-Actions bleiben aus.
- keine Secrets im Journal oder Output.

Details stehen in:

```text
docs/current/REMOTE_DASHBOARD_RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING.md
```

## Aktueller fachlicher Alt-TODO

`backend/modules/remote_agent.js` ist noch RDAP4B-Stand und fuehrt `sound_profi` dort als Rolle/Permission-Preset. Das ist fachlich ueberholt und muss spaeter separat korrigiert werden.

Wichtig fuer diesen spaeteren Step:

- `sound_profi` darf keine Rolle sein.
- `sound_profi` darf kein festes globales Permission-Preset sein.
- `sound_profi` ist Gruppe/Markierung.
- Modulrechte muessen ueber `target_type` + `target_key` / Modulmatrix gedacht werden.
- Bestehende read-only RDAP4B-Routen duerfen nicht entfernt werden.
- Nur mit eigenem Scope und Forrests ausdruecklichem Go.

## Naechster sinnvoller Projektstep

Nach bestaetigtem RDAP5J-Test: StepDone mit Hinweis auf Monitoring/Hardening, Service aktiv, Node lokal gebunden, API/DB-Lesetest ok und read-only unveraendert.

Danach optional separat planen:

```text
RDAP4B_REMOTE_AGENT_RDAP5C3_ROLE_GROUP_REVISION
```

oder:

```text
RDAP6_AUTH_DB_MIGRATION_PREP
```

RDAP6 nur mit Backup-/Migrationsplan, `schema_migrations` und separatem Go.
