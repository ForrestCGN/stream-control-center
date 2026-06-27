# RDAP Workflow Master-Prompt Fix

Stand: RDAP_WORKFLOW_MASTERPROMPT_FIX
Datum: 2026-06-24

## Zweck

Dieser Doku-Step hält die verbindliche Arbeitsweise für `stream-control-center` / RDAP Remote-Modboard fest, damit der fehlerhafte Deploy-Ablauf nicht wieder passiert.

## Ursache des Fehlers

Es wurde ein fester Serverpfad genannt:

```bash
/opt/stream-control-center/tools/remote-modboard-deploy.sh
```

Das ist falsch, weil:

```text
/opt/stream-control-center ist KEIN Git-Repo.
```

Dort darf nicht angenommen werden, dass ein `tools/`-Ordner existiert.

## Verbindlicher korrekter Webserver-Deploy

Der Webserver-Deploy erfolgt nach lokalem ZIP-Step, Test und `stepdone.cmd` immer aus einem frischen GitHub/dev-Clone:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

## Verbindliche Reihenfolge

1. ZIP herunterladen.
2. Lokal einspielen:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\STEP_NAME.zip" "Kurze Beschreibung"
```

3. Lokal prüfen/testen.
4. Wenn sauber:

```powershell
.\stepdone.cmd "Kurze Abschlussbeschreibung"
```

5. Erst danach Webserver-Deploy aus frischem GitHub/dev-Clone.

## Nicht mehr machen

- keinen festen Deploy-Scriptpfad unter `/opt/stream-control-center/tools/...` nennen
- keinen Webserver-Deploy vor `stepdone.cmd` empfehlen
- kein `git pull` in `/opt/stream-control-center`
- keine Deploy-Ordner in `/root`
- keine Secrets posten
- keine Regex-/Patch-Skripte für produktive Dateien

## Betroffene Doku-Dateien in diesem Step

```text
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_WORKFLOW_MASTERPROMPT_FIX.md
docs/current/RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AUTH_DASHBOARD_DESIGN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Hinweis zum Master-Prompt

Der bestehende Master-Prompt bleibt bestehen. Diese Addendum-Datei ist ab jetzt Pflichtkontext zusätzlich zum Master-Prompt und wird in `START_HERE_FOR_NEW_CHAT.md` explizit direkt nach dem Master-Prompt genannt. Dadurch wird die RDAP-spezifische Deploy-Arbeitsweise verbindlich verfügbar, ohne den langen Master-Prompt riskant zu überschreiben.
