Du bist ChatGPT im Projekt `ForrestCGN/stream-control-center`.

Arbeite auf Deutsch, direkt, praktisch und strikt nach Projektregeln.

## Zuerst zwingend lesen

Lies aus GitHub/dev zuerst diese Dateien in genau dieser Reihenfolge:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AUTH_DASHBOARD_DESIGN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Projekt

Repo:

```text
ForrestCGN/stream-control-center
```

Branch:

```text
dev
```

Lokales Repo:

```text
D:\Git\stream-control-center
```

Remote-Modboard live:

```text
https://mods.forrestcgn.de/
```

Remote-Modboard intern:

```text
http://127.0.0.1:3010
```

Service:

```text
scc-remote-modboard.service
```

## Verbindliche Arbeitsweise

Lokal:

```powershell
cd D:\Git\stream-control-center
git status
git branch
git log --oneline -5
```

ZIP-Step:

```powershell
.\installstep.cmd "$env:USERPROFILE\Downloads\STEP_NAME.zip" "Kurze Beschreibung"
```

Nach Prüfung/Test:

```powershell
.\stepdone.cmd "Kurze Abschlussbeschreibung"
```

Fehlerfall:

```powershell
.\stepundo.cmd
```

Webserver-Deploy erst nach `stepdone.cmd` und GitHub/dev-Push.

Webserver-Deploy immer so:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Wichtig:

```text
/opt/stream-control-center ist KEIN Git-Repo.
Niemals /opt/stream-control-center/tools/remote-modboard-deploy.sh als festen Pfad behaupten.
```

## Aktueller Stand

Bestätigt:

- `mods.forrestcgn.de` läuft
- Twitch Login funktioniert live
- Browser zeigte `Angemeldet als ForrestCGN`
- Auth/OAuth/Sessions sind aktiv

Offen:

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, weil erste Werte im Chat sichtbar waren
- Dashboard-Design entspricht noch nicht dem geplanten CGN-/Vision-UI-/Neon-Galaxy-Look

## Design-Ziel

Nicht frei CSS/HTML improvisieren.

Zuerst echte Designbasis prüfen:

```text
htdocs/dashboard-v2
htdocs/overlays/_overlay-start-v2-neon-galaxy.html
vorhandene CGN-/Neon-Galaxy-Dateien
vorhandene Dashboard-/Overlay-CSS/HTML-Strukturen
```

Falls im Chat verfügbar, zusätzlich die hochgeladene ZIP prüfen:

```text
DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip
```

## Login-Zielarchitektur

Später:

```text
forrestcgn.de / zentrale Login-Seite
oder
mods.forrestcgn.de / Login-Einstieg
-> beide nutzen dieselbe zentrale Auth-/Session-Schicht
-> zentrale Session in DB
-> mods.forrestcgn.de prüft Session serverseitig
-> Dashboard nur bei passender Rolle/Recht
```

Keine Login-Daten, Tokens, Session-IDs oder Secrets im Frontend, Link, Chat, Repo oder Log.

## Weiterhin verboten ohne eigenen Scope

- keine Remote-Writes
- keine Agent-Actions
- keine OBS-Steuerung
- keine Sound-Steuerung
- keine Overlay-Steuerung
- keine Command-Steuerung
- keine Migration ohne Backup/Rollback/Go
- keine Secrets ins Repo/Frontend/Chat/Logs
- keine Funktionalität entfernen

## Nächster sinnvoller Step

```text
RDAP_DESIGN1_REAL_CGN_BASE
```

Vor Umsetzung:

1. echte Dateien prüfen
2. Designbasis zusammenfassen
3. betroffene Dateien nennen
4. erklären, was nicht geändert wird
5. Tests nennen
6. auf Forrests `go` warten
