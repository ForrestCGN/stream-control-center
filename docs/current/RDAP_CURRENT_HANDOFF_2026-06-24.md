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

## Aktueller bestaetigter Bereich

Remote-Modboard / RDAP ist live unter `mods.forrestcgn.de`.

Aktuell vorhanden:

- Twitch Login live aktiv.
- Dashboard-Zugriff wird serverseitig geprueft.
- ForrestCGN und EngelCGN sind als Test-User sichtbar.
- Dashboard-v2/V13-Look ist als echte Basis portiert.
- Login-/Denied-Seite ist zentriert.
- Status-Karten/Grid-Abstaende sind korrigiert.
- Avatar/Name oben rechts sichtbar.
- Self-Profilpanel oben rechts vorhanden.
- `Profil aktualisieren` synchronisiert eigene Twitch-Daten.
- Topbar hat keinen doppelten Ausloggen-Button mehr.
- Profilpanel ist auf `Profil aktualisieren` und `Ausloggen` reduziert.
- Admin -> User & Rollen zeigt eine read-only Uebersicht vorhandener User/Rollen/Gruppen/Sessions.
- RDAP_ADMIN_USERS2/3/4 haben Admin-Userverwaltung, Write-Foundation sowie Backup-/Permission-/Confirm-/Audit-/Locking-Grundregeln geplant.
- RDAP_ADMIN_USERS5 ergaenzt eine reine Admin-User-Permission-Diagnose.

## Zuletzt gebaut

```text
RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC
```

Aenderungen:

```text
remote-modboard/backend/src/services/admin-user-permission-read.service.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
docs/current/RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Neue Diagnose-Route

```text
GET /api/remote/admin/users/permission-diagnostic
```

Zweck:

- aktuelle Session read-only pruefen,
- Actor-Rollen/Gruppen diagnostisch ausgeben,
- Owner/Admin/Sound-Profi diagnostisch erkennen,
- `remote.admin.users.read` und `remote.admin.users.write` read-only bewerten,
- produktive Writes weiterhin blockieren.

## Wichtige Sicherheitsregeln

Bis eigener Scope geplant/gebaut ist, bleiben verboten:

- keine Remote-Writes ausserhalb freigegebener Auth-/Self-Profil-Funktion,
- keine Agent-Actions,
- keine OBS-Steuerung,
- keine Sound-Steuerung,
- keine Overlay-Steuerung,
- keine Command-Steuerung,
- keine DB-Migration ohne Backup/Rollback/Go,
- keine Secrets ins Repo/Frontend/Chat/Logs,
- keine User-/Rollen-Writes ohne eigene Admin-Permission/Confirm/Audit/Locking.

RDAP_ADMIN_USERS5 baut keine User-/Rollen-/Gruppen-/Session-Writes und keine UI-Schreibbuttons.

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

## Naechste sinnvolle Schritte

1. RDAP_ADMIN_USERS5 lokal einspielen, testen und `stepdone.cmd` ausfuehren.
2. Danach Webserver-Deploy aus GitHub/dev.
3. Diagnose-Route lokal und remote pruefen.
4. Danach planen: `RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION`.
5. Secrets rotieren, falls noch nicht erledigt: `SESSION_SECRET`, `OAUTH_STATE_SECRET`.
