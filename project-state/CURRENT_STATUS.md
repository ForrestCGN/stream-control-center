# CURRENT STATUS - stream-control-center

Stand: RDAP_DESIGN1_REAL_CGN_BASE
Datum: 2026-06-24

## Aktueller bestätigter Stand

Remote-Modboard/Auth:

- `mods.forrestcgn.de` läuft
- Deploy-Script liegt im Repo unter `tools/remote-modboard-deploy.sh`
- Twitch Login funktioniert live
- ForrestCGN konnte sich im Browser anmelden
- Auth/OAuth/Sessions aktiv
- RDAP-Webserver-Deploy-Arbeitsweise ist dokumentiert: frischer GitHub/dev-Clone nach `_deploy_tmp`, kein fester `/opt/stream-control-center/tools/...`-Pfad

## Neuer Arbeitsstand

`RDAP_DESIGN1_REAL_CGN_BASE` wurde als Design-ZIP vorbereitet.

Geändert:

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
```

Ziel:

- Remote-Modboard optisch auf CGN-/Vision-UI-/Neon-Galaxy-Designbasis bringen
- Design-Test v13 als echte Vorlage nutzen
- bestehende Auth-/Login-/Diagnose-Funktion erhalten

Nicht geändert:

- keine Backend-/Auth-Routen
- keine DB
- keine Remote-Writes
- keine Agent-Actions
- keine OBS/Sound/Overlay/Command-Steuerung

## Sofort offen

- ZIP lokal mit `installstep.cmd` einspielen
- lokal/live prüfen
- erst danach `stepdone.cmd`
- danach Webserver-Deploy aus frischem GitHub/dev-Clone
- Browser-Test auf `https://mods.forrestcgn.de/`
- `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt

## Weiterhin deaktiviert

- Remote-Writes
- Agent-Actions
- OBS/Sound/Overlay/Command-Steuerung
- Migration
