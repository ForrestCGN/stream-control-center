# START HERE FOR NEW CHAT - stream-control-center / RDAP Remote Modboard

Stand: RDAP_WORKFLOW_MASTERPROMPT_FIX
Datum: 2026-06-24

## Pflicht zuerst lesen

In neuen Chats zuerst diese Dateien aus GitHub/dev lesen, bevor geplant oder umgesetzt wird:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AUTH_DASHBOARD_DESIGN.md
```

## Wichtigster Kontext

Der vorherige Chat stockte beim Dashboard2-Design und danach gab es einen Workflow-Fehler: Es wurde ein fester Serverpfad `/opt/stream-control-center/tools/remote-modboard-deploy.sh` genannt, obwohl `/opt/stream-control-center` kein Git-Repo ist und dort nicht automatisch `tools/` existiert.

Ab sofort gilt für RDAP-Webserver-Deploy verbindlich:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Nie wieder als festen Serverpfad annehmen:

```bash
/opt/stream-control-center/tools/remote-modboard-deploy.sh
```

## Aktueller bestätigter Stand

Remote-Modboard/Auth:

- `https://mods.forrestcgn.de/` live
- Twitch Login funktioniert
- Browser zeigte `Angemeldet als ForrestCGN`
- Auth/OAuth/Sessions aktiv
- Dashboard2 begonnen, aber Design noch nicht passend

## Sofort beachten

Die zuerst erzeugten `SESSION_SECRET` und `OAUTH_STATE_SECRET` standen im Chat. Diese müssen auf dem Server rotiert werden:

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

Danach ggf. erneut im Browser einloggen.

## Verbindliche Arbeitsweise

Lokal immer zuerst:

```powershell
cd D:\Git\stream-control-center
git status
git branch
git log --oneline -5
```

ZIP-Step lokal:

```powershell
.\installstep.cmd "$env:USERPROFILE\Downloads\STEP_NAME.zip" "Kurze Beschreibung"
```

Dann prüfen/testen. Erst wenn sauber:

```powershell
.\stepdone.cmd "Kurze Abschlussbeschreibung: was wurde bestätigt"
```

Fehlerfall:

```powershell
.\stepundo.cmd
```

Danach erst Webserver-Deploy aus frischem GitHub/dev-Clone.

## Nächster sinnvoller Schritt

Nicht weiter frei am Design herumprobieren.

Nächster Design-Step:

```text
RDAP_DESIGN1_REAL_CGN_BASE
```

Aufgabe:

1. Repo/GitHub/dev nach echter Designbasis prüfen.
2. `dashboard-v2` und vorhandene CGN-/Neon-Galaxy-Dateien suchen.
3. relevante Design-/CSS-/HTML-Dateien anzeigen/zusammenfassen.
4. Forrest entscheiden lassen, welche Basis gilt.
5. erst danach Dashboard optisch umbauen.

## Login-Zielarchitektur

Später soll der Login zentral laufen:

```text
forrestcgn.de / zentrale Login-Seite
oder
mods.forrestcgn.de / Login-Einstieg
-> beide nutzen dieselbe zentrale Auth-/Session-Schicht
-> zentrale Session in DB
-> mods.forrestcgn.de übernimmt/prueft Session
-> Modboard zeigt Dashboard nur bei passender Rolle/Recht
```

Gewünschter Flow:

```text
Nicht eingeloggt
-> Login-Seite

Eingeloggt, aber nicht berechtigt
-> Access-Denied + Ausloggen/zurück

Eingeloggt + berechtigt
-> Dashboard
```

## Weiterhin verboten

- keine Remote-Writes
- keine Agent-Actions
- keine OBS-Steuerung
- keine Sound-Steuerung
- keine Overlay-Steuerung
- keine Command-Steuerung
- keine Migration ohne Backup/Rollback/Go
- keine Secrets ins Repo/Frontend/Chat/Logs
- keine Funktionalität entfernen
