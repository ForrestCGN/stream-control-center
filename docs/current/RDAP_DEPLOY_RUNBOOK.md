# RDAP Deploy Runbook - Remote-Modboard

Stand: RDAP_DEPLOY_RUNBOOK_OR_SCRIPT
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

## Nutzung

Auf dem Webserver:

```bash
cd /opt/stream-control-center/_deploy_tmp
```

Falls das Script noch nicht auf dem Server liegt, zuerst GitHub/dev klonen oder die Datei aus dem Repo an einen Arbeitsort kopieren.

Empfohlener Aufruf aus einem frischen Clone:

```bash
cd /opt/stream-control-center/_deploy_tmp
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_DEPLOY_RUNBOOK_SCRIPT
cd RDAP_DEPLOY_RUNBOOK_SCRIPT
sudo bash tools/remote-modboard-deploy.sh RDAP_DEPLOY_RUNBOOK_SCRIPT dev
```

Für spätere Steps:

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
