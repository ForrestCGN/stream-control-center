# CURRENT STATUS - stream-control-center

Stand: RDAP_UI1_LIVE_CONFIRMED
Datum: 2026-06-24

## Aktueller bestätigter Arbeitsstand

RDAP UI1 ist live abgeschlossen und auf GitHub/dev per `stepdone.cmd` bestätigt.

Bestätigter Step:

```text
RDAP_UI1_REMOTE_MODBOARD_FIRST_VISIBLE_PAGE
```

## Bestätigte Live-Basis

```text
Remote-Modboard public read-only:
https://mods.forrestcgn.de/

Remote-Modboard API:
https://mods.forrestcgn.de/api/remote/

Interner Service:
127.0.0.1:3010

Systemd:
scc-remote-modboard.service
```

## Sichtbare UI

Bestätigt live:

```text
GET https://mods.forrestcgn.de/ -> HTTP 200
Header: x-remote-modboard-ui: readonly
SSL/Let's Encrypt: ok
```

Die erste sichtbare Remote-Modboard-Seite zeigt read-only Diagnoseinformationen:

- Service-Status
- Sicherheitsstatus
- Login/OAuth disabled
- Writes disabled
- Agent-Actions disabled
- Routenübersicht
- Lock-/Audit-Diagnose

## Bestätigte Diagnose-Routen

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/auth/me
GET /api/remote/auth/permissions/check?permission=remote.view
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
GET /api/remote/lock-audit/schema-adapter/status
GET /api/remote/lock-audit/schema-adapter/status?db=1
```

## OAuth bleibt deaktiviert

Live bestätigt:

```text
GET /api/remote/auth/twitch/start    -> HTTP 403
GET /api/remote/auth/twitch/callback -> HTTP 403
```

## Aktuelle Sicherheitslage

Weiterhin:

```text
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
authEnabled=false
loginEnabled=false
agentActionsEnabled=false
lockAcquireEnabled=false
auditInsertEnabled=false
```

UI1 hat keine produktive Steuerung aktiviert.

## Server-/Deploy-Erkenntnis

Wichtig für weitere RDAP-Arbeiten:

```text
/opt/stream-control-center ist auf dem Webserver kein Git-Repository.
```

Der produktive Remote-Modboard-Code liegt unter:

```text
/opt/stream-control-center/remote-modboard
/opt/stream-control-center/remote-modboard/backend
```

Der Deploy für UI1 lief über:

```text
GitHub/dev Clone nach /opt/stream-control-center/_deploy_tmp/
Backup nach /opt/stream-control-center/_runtime_tmp/
rsync nach /opt/stream-control-center/remote-modboard/
systemctl restart scc-remote-modboard.service
Readiness-Wait vor Tests
```

## ISPConfig/Nginx

`mods.forrestcgn.de` wurde als eigener ISPConfig-Web-vHost angelegt und proxyt vollständig auf:

```text
http://127.0.0.1:3010/
```

Dadurch zeigt `https://mods.forrestcgn.de/` direkt die Node-UI.

## Weiterhin verboten

- kein Login aktivieren
- kein Twitch-OAuth aktivieren
- keine Cookies setzen
- keine Sessions erstellen
- keine Session-Verlaengerung
- kein last_seen_at Update
- keine produktiven DB-Writes
- keine Migration
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets ins Repo, Frontend, Logs oder Chat
