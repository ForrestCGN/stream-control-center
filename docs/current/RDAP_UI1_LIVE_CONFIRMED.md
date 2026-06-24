# RDAP UI1 - Remote-Modboard erste sichtbare read-only UI live bestätigt

Stand: RDAP_UI1_LIVE_CONFIRMED
Datum: 2026-06-24

## Zweck

Dieser Stand dokumentiert den Abschluss von:

```text
RDAP_UI1_REMOTE_MODBOARD_FIRST_VISIBLE_PAGE
```

Ziel war eine erste sichtbare Remote-Modboard-Webseite, rein read-only.

## Ergebnis

Live sichtbar unter:

```text
https://mods.forrestcgn.de/
```

Bestätigt:

```text
GET https://mods.forrestcgn.de/ -> HTTP 200
Header: x-remote-modboard-ui: readonly
SSL/Let's Encrypt: ok
```

Die UI zeigt vorhandene Diagnose-Daten und aktiviert keine Steuerung.

## UI-Inhalte

UI1 zeigt:

- Service-Status
- readOnly/writeEnabled/statusApiVersion/moduleBuild
- Sicherheit:
  - Login disabled
  - OAuth disabled
  - Writes disabled
  - Agent-Actions disabled
  - Cookies disabled
- Lock-/Audit Diagnose
- Routenübersicht
- Hinweisbox read-only Diagnosemodus

## Geänderte Code-Dateien

```text
remote-modboard/backend/src/app.js
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
```

## Live-Test

Bestätigt:

```text
curl -fsSI https://mods.forrestcgn.de/ | head
```

Ergebnis:

```text
HTTP/2 200
x-remote-modboard-ui: readonly
content-length: 4120
```

API:

```text
curl -fsS https://mods.forrestcgn.de/api/remote/status
```

Ergebnis:

```text
ok=true
readOnly=true
writeEnabled=false
```

OAuth-Safety:

```text
GET /api/remote/auth/twitch/start    -> HTTP 403
GET /api/remote/auth/twitch/callback -> HTTP 403
```

## Sicherheitsstatus

Weiterhin deaktiviert:

- Login
- Twitch-OAuth
- Cookies
- Sessions
- Session-Verlaengerung
- last_seen_at Updates
- produktive DB-Writes
- Migration
- Remote-Writes
- Agent-Actions
- OBS-/Sound-/Overlay-/Command-Steuerung
- Secrets im Repo/Frontend/Logs/Chat

## Server-/Deploy-Erkenntnis

Wichtig:

```text
/opt/stream-control-center ist auf dem Webserver kein Git-Repository.
```

Produktiver Remote-Modboard-Code:

```text
/opt/stream-control-center/remote-modboard
/opt/stream-control-center/remote-modboard/backend
```

UI1 wurde auf dem Server so deployed:

```text
GitHub/dev nach /opt/stream-control-center/_deploy_tmp/<STEP>_<timestamp> klonen
Live-Backup nach /opt/stream-control-center/_runtime_tmp/backup_remote_modboard_<STEP>_<timestamp>
rsync remote-modboard/ nach /opt/stream-control-center/remote-modboard/
chown -R sccremote:sccremote /opt/stream-control-center/remote-modboard
node --check server.js
node --check src/app.js
systemctl restart scc-remote-modboard.service
Readiness-Wait gegen http://127.0.0.1:3010/api/remote/status
Public UI/API/OAuth-403 Tests
```

Keine Arbeitsordner/Deploy-Clones/Backups nach `/root`.

## ISPConfig/Nginx

`mods.forrestcgn.de` wurde sauber als eigener ISPConfig-Web-vHost eingerichtet.

Zielzustand:

```text
forrestcgn.de              -> normale Webseite
www.forrestcgn.de          -> normale Webseite
forrestcgn.info            -> normale Webseite/Alias
mods.forrestcgn.de         -> eigener ISPConfig-vHost -> Node 127.0.0.1:3010
```

Wichtig:

`mods.forrestcgn.de` darf nicht wieder als normale Subdomain unter `forrestcgn.de` hängen, sonst liefert `/` wieder die normale Webseite statt der Remote-Modboard-UI.

## Nächste Empfehlung

Vor UI2:

```text
RDAP_DEPLOY_RUNBOOK_OR_SCRIPT
```

Zweck:

- Server-Deploy für Remote-Modboard standardisieren
- falsche Git-Pull-Versuche in `/opt/stream-control-center` verhindern
- immer Backup/Readiness/API/UI/OAuth-Safety prüfen
