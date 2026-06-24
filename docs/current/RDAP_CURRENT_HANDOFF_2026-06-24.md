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

## Zuletzt gebaut

```text
RDAP_USERMENU2_CLEAN_PROFILE_ACTIONS_AND_DOCS
```

Änderung:

```text
remote-modboard/backend/public/index.html
```

Doku/Projektstand:

```text
docs/current/RDAP_USERMENU2_CLEAN_PROFILE_ACTIONS.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_2026-06-24.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
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

1. aktuellen Usermenu2-Step einspielen, testen, `stepdone.cmd` ausführen, deployen.
2. Danach Doku/Status prüfen.
3. Danach planen: echte Admin-Userverwaltung nur mit Owner/Admin-Permission, Confirm-Write, Audit und Locking.
4. Secrets rotieren, falls noch nicht erledigt: `SESSION_SECRET`, `OAUTH_STATE_SECRET`.
