# CURRENT STATUS - stream-control-center

Stand: RDAP_DEPLOY_SCRIPT_LIVE_TEST_CONFIRMED
Datum: 2026-06-24

## Aktueller bestätigter Arbeitsstand

RDAP UI1 ist live abgeschlossen und auf GitHub/dev bestätigt.

Zusätzlich ist der Remote-Modboard-Serverdeploy jetzt live getestet und bestätigt:

```text
RDAP_DEPLOY_SCRIPT_LIVE_TEST_CONFIRMED
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

## Server-Deploy bestätigt

Standard-Deploy-Script:

```text
tools/remote-modboard-deploy.sh
```

Live-Test-Aufruf:

```bash
sudo bash tools/remote-modboard-deploy.sh RDAP_DEPLOY_RUNBOOK_SCRIPT_TEST dev
```

Bestätigtes Ergebnis:

```text
[ok] Remote-Modboard Deploy fertig
```

Bestätigte Punkte:

```text
Clone nach _deploy_tmp: ok
Backup nach _runtime_tmp: ok
rsync nach Live: ok
Rechte setzen: ok
JS-Syntaxcheck: ok
Service-Restart: ok
Readiness-Wait: ok
Lokale API: ok
Lokale UI: ok
Public UI: HTTP 200
Public API: ok
OAuth start/callback: beide HTTP 403
```

Der kurze Curl-Fehler direkt nach Restart ist erwartetes Verhalten, weil der Readiness-Loop danach erfolgreich war:

```text
ready_after=2s
```

## Server-/Deploy-Wahrheit

```text
/opt/stream-control-center ist auf dem Webserver kein Git-Repository.
```

Produktiver Remote-Modboard-Code:

```text
/opt/stream-control-center/remote-modboard
/opt/stream-control-center/remote-modboard/backend
```

Standard-Deploy-Ablauf ab jetzt:

```text
GitHub/dev Clone nach /opt/stream-control-center/_deploy_tmp/
Backup nach /opt/stream-control-center/_runtime_tmp/
rsync remote-modboard/ nach /opt/stream-control-center/remote-modboard/
chown sccremote:sccremote
node --check
systemctl restart scc-remote-modboard.service
Readiness-Wait
API/UI/OAuth-403 Tests
```

Keine RDAP-Arbeitsordner/Deploy-Clones/Backups in `/root`.

## ISPConfig/Nginx

`mods.forrestcgn.de` ist als eigener ISPConfig-Web-vHost angelegt und proxyt vollständig auf:

```text
http://127.0.0.1:3010/
```

Nicht wieder als normale Subdomain unter `forrestcgn.de` anlegen.

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

## Nächster sinnvoller Fokus

```text
RDAP_UI2_READONLY_COMFORT
```

Nur read-only Komfort, keine produktive Steuerung.

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
