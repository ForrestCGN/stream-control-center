# NEXT STEPS - stream-control-center

Stand: RDAP_DESIGN1_REAL_CGN_BASE
Datum: 2026-06-24

## Reihenfolge

1. ZIP lokal einspielen:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP_DESIGN1_REAL_CGN_BASE.zip" "RDAP Design1 echte CGN-Neon-Galaxy-Basis eingebaut"
```

2. Lokal prüfen:

```powershell
Test-Path .\remote-modboard\backend\public\index.html
Test-Path .\remote-modboard\backend\public\assets\remote-modboard.css
node --check .\remote-modboard\backend\public\assets\remote-modboard.js
```

3. Browser lokal/live prüfen, falls testdeploy den Stand nach Live kopiert hat.

4. Bei Erfolg:

```powershell
.\stepdone.cmd "RDAP_DESIGN1 echte CGN-/Neon-Galaxy-Designbasis eingebaut: Remote-Modboard Frontend optisch erneuert, Auth/Login/Diagnose bleiben erhalten, keine Remote-Writes/Agent-Actions"
```

5. Erst danach Webserver-Deploy:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP_DESIGN1_REAL_CGN_BASE
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_DESIGN1_REAL_CGN_BASE
cd RDAP_DESIGN1_REAL_CGN_BASE
sudo bash tools/remote-modboard-deploy.sh RDAP_DESIGN1_REAL_CGN_BASE dev
```

## Danach testen

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.ok,.moduleBuild,.auth.enabled,.auth.loginEnabled,.writeEnabled'
curl -fsSI https://mods.forrestcgn.de/ | head
curl -fsS https://mods.forrestcgn.de/api/remote/status | jq '.ok,.auth.enabled,.auth.loginEnabled,.writeEnabled'
```

Browser:

```text
https://mods.forrestcgn.de/
```

## Danach nächste mögliche Steps

### RDAP_AUTH2_CENTRAL_LOGIN_READY prüfen/fortführen

Falls noch nicht sauber live getestet:

- neutraler Login-Einstieg prüfen
- `/api/remote/auth/login/plan` prüfen
- zentrale DB-Session-Zielarchitektur weiter vorbereiten

### RDAP_PERMISSIONS1_ROLE_ALLOWLIST_UI

- Owner/Streamer/Mods/Sound-Profi sichtbar und verwaltbar planen
- noch keine produktiven Actions

## Weiterhin offen

- `SESSION_SECRET` rotieren
- `OAUTH_STATE_SECRET` rotieren
- Service nach Rotation neu starten
- Browser-Login nach Rotation prüfen
