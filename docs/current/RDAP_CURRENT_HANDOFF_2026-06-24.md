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
- ForrestCGN und EngelCGN sind sichtbar.
- Dashboard-v2/V13-Look ist als echte Basis portiert.
- Login-/Denied-Seite ist zentriert.
- Status-Karten/Grid-Abstände sind korrigiert.
- Avatar/Name oben rechts sichtbar.
- Self-Profilpanel oben rechts vorhanden.
- `Profil aktualisieren` synchronisiert eigene Twitch-Daten.
- Profilpanel ist auf `Profil aktualisieren` und `Ausloggen` reduziert.
- Topbar hat keinen doppelten Ausloggen-Button mehr.
- `Admin -> User & Rollen` zeigt eine read-only Übersicht vorhandener User/Rollen/Gruppen/Sessions.

## Zuletzt abgeschlossen

```text
RDAP_ADMIN_USERS2_MANAGEMENT_PLAN
```

Zweck:

- spätere Admin-Userverwaltung geplant
- Self-Profil vs. Admin-Verwaltung getrennt
- Owner/Admin-Permission, Confirm-Write, Audit, Locking und Backup/Rollback als Pflicht festgelegt
- keine Code-/DB-/Remote-Action-Änderungen

## Aktueller Plan-Step

```text
RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN
```

Zweck:

- konkrete Write-Foundation für spätere Admin-Userverwaltung planen
- kleinsten sicheren späteren Write-Step vorbereiten
- weiterhin keine Admin-Writes bauen
- Projektstatus auf aktuellen RDAP_ADMIN_USERS2/3-Stand korrigieren

## Wichtige Sicherheitsregeln

Bis eigener Scope geplant/gebaut ist, bleiben verboten:

- keine Remote-Writes außerhalb freigegebener Auth-/Self-Profil-Funktion
- keine Agent-Actions
- keine OBS-Steuerung
- keine Sound-Steuerung
- keine Overlay-Steuerung
- keine Command-Steuerung
- keine DB-Migration ohne Backup/Rollback/Go
- keine Secrets ins Repo/Frontend/Chat/Logs
- keine User-/Rollen-Writes ohne eigene Admin-Permission/Confirm/Audit/Locking

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

1. `RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN` lokal einspielen.
2. `git status` prüfen.
3. `stepdone.cmd` ausführen.
4. Danach erst planen: `RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION`.
5. Secrets rotieren, falls noch nicht erledigt: `SESSION_SECRET`, `OAUTH_STATE_SECRET`.
