# NEXT CHAT PROMPT - stream-control-center / RDAP5I Remote Read-only Live

Du bist ChatGPT im Projekt `stream-control-center` fuer ForrestCGN. Arbeite auf Deutsch, direkt, sauber und schrittweise.

## Wichtigste Arbeitsregeln

- Immer zuerst echten Stand pruefen: GitHub/dev, echte Dateien, Projekt-Dokus, Live-Ausgaben.
- Nicht raten. Wenn Dateien fehlen oder unklar sind, exakt nach den benoetigten Dateien fragen.
- Keine Funktionalitaet entfernen.
- Bestehende Module/Helper/Systeme nutzen, kein Modul-Wildwuchs.
- Vor jeder Umsetzung: Ziel, Scope, Dateien, Nicht-Aenderungen und Tests nennen.
- Umsetzung erst nach ausdruecklichem `go`.
- ZIPs immer mit echten Repo-Pfaden ab Repo-Root liefern.
- Keine losen Dateien ohne Zielpfad.
- Kein Desktop als Standardziel; bevorzugt Downloads oder Repo `_handoff`/`_tmp`.
- `installstep.cmd` spielt ZIPs ein und startet Tests, `stepdone.cmd` erst nach erfolgreichem Live-Test.
- Bei Fehlern `stepundo.cmd` nutzen.
- Bei ZIP-/Datei-Steps: StepDone nach Einspielen/Deployen und Test, nicht vorher.
- Keine produktive SQLite ersetzen, loeschen oder neu bauen.
- Keine MariaDB-Migration ohne Backup-/Migrationsplan und eigenes Go.
- Keine Secrets ins Repo, Frontend oder Chat.
- Keine freien Shell-/Datei-/Prozessbefehle in Agent-/Dashboard-Systemen.
- Backend prueft Rechte; Frontend ist nie Sicherheitsentscheidung.
- Rollen und Gruppen getrennt halten.
- `sound_profi` ist Gruppe/Markierung, keine Rolle und keine feste globale Rechte-Sammlung.

## Startdateien zuerst lesen

Bitte zuerst diese Dateien aus GitHub/dev lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/REMOTE_DASHBOARD_RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION.md
```

Danach, falls relevant:

```text
docs/current/REMOTE_DASHBOARD_RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION.md
docs/current/REMOTE_DASHBOARD_RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE.md
remote-modboard/backend/package.json
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/health.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/security/safety.js
```

## Aktueller Live-Stand RDAP5I

RDAP5I ist technisch live und read-only erfolgreich.

Remote API:

```text
https://mods.forrestcgn.de/api/remote/health
https://mods.forrestcgn.de/api/remote/status
https://mods.forrestcgn.de/api/remote/routes
```

Health mit DB-Lesetest:

```text
https://mods.forrestcgn.de/api/remote/health?db=1
```

Bestaetigt:

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

Status bestaetigt:

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

Routes bestaetigt:

```text
GET /api/remote/health
GET /api/remote/status
GET /api/remote/routes
POST/PUT/PATCH/DELETE remote writes deaktiviert
auth/session creation deaktiviert
DB migration deaktiviert
agent action execution deaktiviert
OBS/Sound/Overlay/Command control deaktiviert
shell/file/process operations deaktiviert
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

Node-Service laeuft nicht als root.

## Wichtige DB-Korrektur

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

nginx-Proxy wurde ueber ISPConfig eingetragen, nicht direkt in die vHost-Datei.

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

Danach wurde ausgefuehrt:

```bash
nginx -t
systemctl reload nginx
```

`nginx -t` war erfolgreich. Bestehende http2-Warnings blockieren nicht.

## Noch sofort offen

Diese Abschlusspruefungen wurden vom vorherigen Chat angefordert und sollten als erstes gemacht werden, falls noch nicht erledigt:

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

Danach Doku/Projektstatus in GitHub/dev finalisieren.

## Wichtiger Alt-TODO

`backend/modules/remote_agent.js` ist noch RDAP4B-Stand und fuehrt `sound_profi` dort als Rolle/Permission-Preset. Das ist fachlich ueberholt.

Spaeterer eigener Step noetig:

```text
RDAP4B remote_agent.js auf RDAP5C3 korrigieren
```

Dabei:

```text
sound_profi darf dort nicht mehr als Rolle gefuehrt werden
sound_profi darf kein festes globales Permission-Preset sein
sound_profi muss Gruppe/Markierung sein
Modulrechte ueber target_type + target_key / Modulmatrix denken
Bestehende read-only RDAP4B-Routen nicht entfernen
Nur nach eigenem Scope und Forrests ausdruecklichem Go
```

## Naechste moegliche Schritte

Sofort:

```text
RDAP5I_DOCS_FINALIZE_REMOTE_READONLY_LIVE
```

Danach optional:

```text
RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING
```

oder spaeter mit separatem Plan:

```text
RDAP6_AUTH_DB_MIGRATION_PREP
```

Bei RDAP6 wichtig:

```text
keine DB-Migration ohne Backup
schema_migrations planen
User-/Twitch-/Rollen-/Gruppen-/Modulmatrix-Tabellen vorbereiten
keine Schreibaktion ohne separates Go
```
