# RDAP Deploy Runbook - Remote-Modboard

Stand: RDAP_DEPLOY_SCRIPT_LIVE_TEST_CONFIRMED
Datum: 2026-06-24

## Zweck

Dieses Runbook standardisiert den Deploy des Remote-Modboards auf dem Webserver.

Es verhindert den Fehler aus UI1:

```text
git pull in /opt/stream-control-center
```

Denn:

```text
/opt/stream-control-center ist kein Git-Repository.
```

## Zielzustand

GitHub/dev bleibt Single Source of Truth.

Der Webserver nutzt:

```text
/opt/stream-control-center/remote-modboard
/opt/stream-control-center/remote-modboard/backend
```

Der Node-Service läuft intern auf:

```text
127.0.0.1:3010
```

Systemd:

```text
scc-remote-modboard.service
```

Public:

```text
https://mods.forrestcgn.de/
https://mods.forrestcgn.de/api/remote/
```

ISPConfig/Nginx:

```text
mods.forrestcgn.de -> eigener ISPConfig-Web-vHost -> http://127.0.0.1:3010/
```

## Script

Im Repo liegt:

```text
tools/remote-modboard-deploy.sh
```

Dieses Script muss auf dem Webserver als root ausgeführt werden.

## Ablauf des Scripts

Das Script macht:

1. Safety-Check: `/opt/stream-control-center` darf kein Git-Repo sein.
2. GitHub/dev wird frisch nach `_deploy_tmp` geklont.
3. Deploy-Inhalt wird geprüft.
4. Aktueller Live-Stand wird nach `_runtime_tmp` gesichert.
5. Nur `remote-modboard/` wird nach Live synchronisiert.
6. Rechte werden auf `sccremote:sccremote` gesetzt.
7. JS-Syntaxcheck läuft.
8. `scc-remote-modboard.service` wird neu gestartet.
9. Readiness-Wait wartet auf `127.0.0.1:3010/api/remote/status`.
10. Lokale API/UI werden getestet.
11. Public UI/API werden getestet.
12. OAuth Start/Callback müssen weiter HTTP 403 liefern.

## Live-Test bestätigt

Der Live-Test des Deploy-Scripts wurde am 2026-06-24 erfolgreich ausgeführt.

Aufruf:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP_DEPLOY_RUNBOOK_SCRIPT_TEST
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_DEPLOY_RUNBOOK_SCRIPT_TEST
cd RDAP_DEPLOY_RUNBOOK_SCRIPT_TEST
sudo bash tools/remote-modboard-deploy.sh RDAP_DEPLOY_RUNBOOK_SCRIPT_TEST dev
```

Bestätigtes Ergebnis:

```text
[ok] Remote-Modboard Deploy fertig
```

Bestätigte Details:

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

Der erste Readiness-Curl unmittelbar nach dem Restart darf fehlschlagen, solange der Loop danach erfolgreich wird:

```text
curl: (7) Failed to connect ...
ready_after=2s
```

Das ist erwartetes Verhalten beim Neustart.

Bestätigte Backup-/Deploy-Pfade aus dem Test:

```text
Backup:
/opt/stream-control-center/_runtime_tmp/backup_remote_modboard_RDAP_DEPLOY_RUNBOOK_SCRIPT_TEST_20260624_121241

Deploy-Clone:
/opt/stream-control-center/_deploy_tmp/RDAP_DEPLOY_RUNBOOK_SCRIPT_TEST_20260624_121241
```

## Nutzung

Für spätere Steps:

```bash
cd /opt/stream-control-center/_deploy_tmp
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git <STEP_NAME>
cd <STEP_NAME>
sudo bash tools/remote-modboard-deploy.sh <STEP_NAME> dev
```

Beispiel:

```bash
sudo bash tools/remote-modboard-deploy.sh RDAP_UI2_READONLY_COMFORT dev
```

## Rollback

Bei Fehlern meldet das Script den Backup-Pfad, z. B.:

```text
/opt/stream-control-center/_runtime_tmp/backup_remote_modboard_<STEP>_<timestamp>
```

Manueller Restore:

```bash
BACKUP="/opt/stream-control-center/_runtime_tmp/backup_remote_modboard_<STEP>_<timestamp>"
LIVE="/opt/stream-control-center/remote-modboard"

rsync -a --delete "$BACKUP/" "$LIVE/"
chown -R sccremote:sccremote "$LIVE"
systemctl restart scc-remote-modboard.service
```

Danach Readiness prüfen:

```bash
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

## Was das Script nicht macht

- kein Login aktivieren
- kein Twitch-OAuth aktivieren
- keine Cookies setzen
- keine Sessions erstellen
- keine produktiven DB-Writes
- keine Migration
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets ins Repo, Frontend, Logs oder Chat

## Wichtige Regeln

Keine RDAP-Arbeitsordner/Deploy-Clones/Backups in:

```text
/root
```

Nur diese Orte verwenden:

```text
/opt/stream-control-center/_deploy_tmp/
/opt/stream-control-center/_runtime_tmp/
```

`mods.forrestcgn.de` darf nicht wieder als normale Subdomain unter `forrestcgn.de` angelegt werden.
