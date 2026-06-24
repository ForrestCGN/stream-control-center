# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard Agent Planung

Stand: RDAP_DEPLOY_SCRIPT_LIVE_TEST_CONFIRMED
Datum: 2026-06-24

## Zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP_UI1_LIVE_CONFIRMED.md
docs/current/RDAP_DEPLOY_RUNBOOK.md
```

## Aktueller bestätigter Stand

```text
RDAP_DEPLOY_SCRIPT_LIVE_TEST_CONFIRMED
```

RDAP UI1 wurde live getestet und per `stepdone.cmd` nach GitHub/dev bestätigt.

Das Remote-Modboard-Deploy-Script wurde ebenfalls live getestet und bestätigt.

## Live-Basis

```text
Remote-Modboard public read-only UI:
https://mods.forrestcgn.de/

Remote-Modboard public read-only API:
https://mods.forrestcgn.de/api/remote/

Interner Service:
127.0.0.1:3010

Systemd:
scc-remote-modboard.service
```

## Bestätigte Live-Funktionen

```text
GET /                         -> HTTP 200, x-remote-modboard-ui: readonly
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/auth/me
GET /api/remote/auth/permissions/check?permission=remote.view
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
GET /api/remote/lock-audit/schema-adapter/status
GET /api/remote/lock-audit/schema-adapter/status?db=1
```

OAuth bleibt deaktiviert:

```text
GET /api/remote/auth/twitch/start    -> HTTP 403
GET /api/remote/auth/twitch/callback -> HTTP 403
```

## Deploy-Script bestätigt

Standard-Deploy-Script:

```text
tools/remote-modboard-deploy.sh
```

Live-Test erfolgreich:

```text
[ok] Remote-Modboard Deploy fertig
```

Bestätigt:

```text
GitHub/dev -> _deploy_tmp -> Backup _runtime_tmp -> rsync remote-modboard -> chown -> node --check -> restart -> readiness -> local/public tests -> OAuth 403
```

## Wichtigste Entscheidungen

### Struktur

Wenn fachlich passend:

```text
vorhandene Module/Services/Routen erweitern
```

Neue Module nur, wenn die Verantwortung wirklich nicht sauber in vorhandene Struktur passt.

### Server-Deploy

Wichtig:

```text
/opt/stream-control-center ist auf dem Webserver kein Git-Repository.
```

Produktiver Remote-Modboard-Code:

```text
/opt/stream-control-center/remote-modboard
/opt/stream-control-center/remote-modboard/backend
```

Standard-Deploy-Script:

```text
tools/remote-modboard-deploy.sh
```

Deploy-Ablauf:

```text
GitHub/dev Clone nach /opt/stream-control-center/_deploy_tmp/
Backup nach /opt/stream-control-center/_runtime_tmp/
rsync remote-modboard/ nach /opt/stream-control-center/remote-modboard/
chown sccremote:sccremote
node --check
systemctl restart scc-remote-modboard.service
Readiness-Wait
curl Tests
OAuth 403 Safety-Check
```

Keine RDAP-Arbeitsordner/Deploy-Clones/Backups in `/root`.

### ISPConfig/Nginx

`mods.forrestcgn.de` ist ein eigener ISPConfig-Web-vHost und proxyt vollständig auf:

```text
http://127.0.0.1:3010/
```

Nicht wieder als normale Subdomain unter `forrestcgn.de` anlegen.

### Server-Scripts

Nach `systemctl restart` immer Readiness-Wait/Retry vor API-Tests.

### resourceType

RDAP15 Entscheidung:

```text
Hybrid
```

Neue Lock-Konzepte müssen typisierte Resource-Keys planen:

```text
<resourceType>:<namespace>:<id>
```

Beispiele:

```text
text:message:welcome
config:module:loyalty
media:sound:1602
overlay:layout:event_winner
command:twitch:clip
```

## Nächster Fokus

Empfohlen:

```text
RDAP_UI2_READONLY_COMFORT
```

Ziel:

- Auto-Refresh für Diagnosekarten
- letzte Aktualisierung sichtbar
- bessere Fehleranzeige bei API-Ausfall
- kompaktere Routen-/Security-Details
- keine Steuerbuttons
- keine POST/PUT/PATCH/DELETE Calls
- kein Login
- kein OAuth
- keine Cookies
- keine Sessions
- keine Writes
- keine Agent-Actions

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
