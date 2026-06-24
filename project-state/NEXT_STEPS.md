# NEXT STEPS - stream-control-center

Stand: RDAP_WORKFLOW_MASTERPROMPT_FIX
Datum: 2026-06-24

## Im neuen Chat zuerst

1. GitHub/dev als Source of Truth prüfen
2. `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt` lesen
3. `docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md` lesen
4. `docs/current/START_HERE_FOR_NEW_CHAT.md` lesen
5. aktuellen Auth-/Dashboard-Stand anhand Repo-Dateien prüfen
6. nicht raten, keine losen Patches
7. echte Designbasis suchen/prüfen

## Sofort prüfen

Secrets rotieren:

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

## Webserver-Deploy-Regel

Erst nach lokalem `installstep.cmd`, Test und `stepdone.cmd`.

Auf dem Webserver immer frisch klonen:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

## Nächste geplante Steps

### RDAP_DESIGN1_REAL_CGN_BASE

Ziel:

- echtes CGN-/Vision-UI-/Neon-Galaxy-Design
- Designbasis aus bestehenden Repo-/Projektdateien übernehmen
- keine weiteren frei erfundenen CSS-Versuche

### RDAP_AUTH2_CENTRAL_LOGIN_READY

Ziel:

- Modboard-Login als Übergang dokumentieren
- späteren Hauptseiten-/Zentral-Login vorbereiten
- Return-To/Redirect-Konzept
- gemeinsame Session-/Cookie-Strategie für `forrestcgn.de` und `mods.forrestcgn.de`
- gemeinsame serverseitige DB-Wahrheit für User/Identities/Sessions

### RDAP_PERMISSIONS1_ROLE_ALLOWLIST_UI

Ziel:

- Owner/Streamer/Mods/Sound-Profi sichtbar und verwaltbar planen
- noch keine produktiven Actions
