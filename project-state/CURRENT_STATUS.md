# CURRENT STATUS - stream-control-center

Stand: RDAP_WORKFLOW_MASTERPROMPT_FIX
Datum: 2026-06-24

## Aktueller bestätigter Stand

Remote-Modboard/Auth:

- `mods.forrestcgn.de` läuft
- Deploy-Script liegt im Repo unter `tools/remote-modboard-deploy.sh`
- Twitch Login funktioniert live
- ForrestCGN konnte sich im Browser anmelden
- Auth/OAuth/Sessions aktiv

## Workflow-Korrektur bestätigt/dokumentiert

Der Webserver-Deploy darf nicht über einen festen Pfad `/opt/stream-control-center/tools/remote-modboard-deploy.sh` beschrieben werden.

`/opt/stream-control-center` ist kein Git-Repo.

Korrektes Muster:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

## Aktueller offener Punkt

Dashboard2/Auth-Gate/Design wurde begonnen, aber Forrest bewertet das Design als nicht passend zum geplanten CGN-/Vision-UI-/Neon-Galaxy-Dashboard.

Nicht weiter frei Design bauen. Für den nächsten Design-Step echte Projektdateien/Designbasis aus GitHub/dev prüfen.

## Sofort offen

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, da sie im Chat sichtbar waren
- Nach Rotation Service neu starten
- Browser ggf. erneut einloggen
- Dann Design/Frontend sauber auf echter Basis neu planen

## Weiterhin deaktiviert

- Remote-Writes
- Agent-Actions
- OBS/Sound/Overlay/Command-Steuerung
- Migration
