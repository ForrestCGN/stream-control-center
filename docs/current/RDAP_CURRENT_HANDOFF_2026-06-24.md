# RDAP Current Handoff - 2026-06-24

## Wichtig zuerst lesen

Single Source of Truth:

```text
GitHub/dev: ForrestCGN/stream-control-center
Lokales Repo: D:\Git\stream-control-center
Live-Ziel lokal: D:\Streaming\stramAssets
Webserver: /opt/stream-control-center
Remote-Modboard: /opt/stream-control-center/remote-modboard
Public URL: https://mods.forrestcgn.de/
Service: scc-remote-modboard.service
```

## Aktueller bestätigter Bereich

Remote-Modboard / RDAP ist live unter `mods.forrestcgn.de`.

Aktuell vorhanden:

- Twitch Login live aktiv.
- Dashboard-Zugriff wird serverseitig geprüft.
- ForrestCGN und EngelCGN sind als Test-User sichtbar.
- Dashboard-v2/V13-Look ist als echte Basis portiert.
- Login-/Denied-Seite ist zentriert.
- Status-Karten/Grid-Abstände sind korrigiert.
- Avatar/Name oben rechts sichtbar.
- Self-Profilpanel oben rechts vorhanden.
- `Profil aktualisieren` synchronisiert eigene Twitch-Daten.
- Topbar hat keinen doppelten Ausloggen-Button mehr.
- Profilpanel ist auf `Profil aktualisieren` und `Ausloggen` reduziert.
- Admin -> User & Rollen zeigt eine read-only Übersicht vorhandener User/Rollen/Gruppen/Sessions.
- `RDAP_ADMIN_USERS2_MANAGEMENT_PLAN` ist dokumentiert.
- `RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN` ist dokumentiert.
- `RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION` dokumentiert Backup-/Rollback-, Permission-, Confirm-, Audit- und Locking-Foundation.

## Zuletzt gebaut

```text
RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION
```

Änderung:

```text
docs/current/RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Nicht geändert

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/src/*
db/*
```

## Wichtige Sicherheitsregeln

Bis eigener Scope geplant/gebaut ist, bleiben verboten:

- keine Remote-Writes außerhalb freigegebener Auth-/Self-Profil-Funktion,
- keine Agent-Actions,
- keine OBS-Steuerung,
- keine Sound-Steuerung,
- keine Overlay-Steuerung,
- keine Command-Steuerung,
- keine DB-Migration ohne Backup/Rollback/Go,
- keine Secrets ins Repo/Frontend/Chat/Logs,
- keine User-/Rollen-Writes ohne eigene Admin-Permission/Confirm/Audit/Locking.

## Webserver-Deploy-Muster

`/opt/stream-control-center` ist kein Git-Repository. Nie dort `git pull` empfehlen.

Richtig:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Nach Restart immer Readiness abwarten:

```bash
systemctl restart scc-remote-modboard.service

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

## Nächste sinnvolle Schritte

1. `RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION.zip` lokal einspielen.
2. Prüfen, dass nur Doku-/Projektstatus-Dateien geändert sind.
3. `stepdone.cmd` ausführen.
4. Danach erst nächsten Code-Step planen.

Empfohlener nächster Block:

```text
RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC
```

Ziel: Permission-Read/Diagnose für eingeloggten User vorbereiten. Keine produktiven User-/Rollen-Writes.
