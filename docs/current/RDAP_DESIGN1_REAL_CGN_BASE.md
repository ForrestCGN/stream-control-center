# RDAP_DESIGN1_REAL_CGN_BASE

Datum: 2026-06-24

## Ziel

Remote-Modboard optisch auf die echte CGN-/Vision-UI-/Neon-Galaxy-Designrichtung bringen, ohne Auth-/Backend-/Action-Logik zu verändern.

## Designbasis

Geprüfte Basis:

```text
DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip
```

Daraus übernommen:

- ruhiger CGN-Galaxy-Hintergrund
- feste schwebende Topbar
- Sidebar-Accordion wie Dashboard-v2-Designrichtung
- kompakte Glass-Cards
- Chips für Service/Login/OAuth/Agent
- Login-Optik im gleichen Stil

## Geänderte Dateien

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
```

## Bewusst nicht geändert

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/src/**
remote-modboard/backend/server.js
remote-modboard/backend/package.json
```

## Schutzregeln

Weiterhin deaktiviert:

- keine Remote-Writes
- keine Agent-Actions
- keine OBS-Steuerung
- keine Sound-Steuerung
- keine Overlay-Steuerung
- keine Command-Steuerung
- keine Migration

## Tests

Lokal nach ZIP-Install:

```powershell
cd D:\Git\stream-control-center
Test-Path .\remote-modboard\backend\public\index.html
Test-Path .\remote-modboard\backend\public\assets\remote-modboard.css
node --check .\remote-modboard\backend\public\assets\remote-modboard.js
```

Nach `stepdone` Webserver-Deploy aus frischem GitHub/dev-Clone:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP_DESIGN1_REAL_CGN_BASE
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_DESIGN1_REAL_CGN_BASE
cd RDAP_DESIGN1_REAL_CGN_BASE
sudo bash tools/remote-modboard-deploy.sh RDAP_DESIGN1_REAL_CGN_BASE dev
```

Danach prüfen:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.moduleBuild,.auth.enabled,.auth.loginEnabled'
curl -fsSI https://mods.forrestcgn.de/ | head
curl -fsS https://mods.forrestcgn.de/api/remote/status | jq '.ok,.auth.enabled,.auth.loginEnabled,.writeEnabled'
```

Browser:

```text
https://mods.forrestcgn.de/
```

Erwartung:

- Login-Seite im CGN-/Neon-Galaxy-Stil
- Nach Login Dashboard mit Topbar, Sidebar-Accordion und Cards
- bestehender neutraler Login-Einstieg bleibt erhalten
- Status-/Diagnose-Seiten laden weiterhin
- keine produktiven Steueraktionen sichtbar/aktiv

## Offene Punkte

- Browser-Design nach Server-Deploy prüfen
- Secrets rotieren, falls noch nicht erledigt
- später zentralen Hauptseiten-Login weiter ausbauen
- später Rollen-/Rechteverwaltung UI planen
