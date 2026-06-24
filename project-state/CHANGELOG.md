# CHANGELOG - stream-control-center

## 2026-06-24 - RDAP_DESIGN1B_LAYOUT_FIX

Stand:

```text
RDAP_DESIGN1B_LAYOUT_FIX
```

Zusammenfassung:

- Remote-Modboard-Layout nach erstem Browsercheck korrigiert
- Navigation wieder als kompakte Sidebar umgesetzt
- Feste Topbar nach Dashboard-v2/Design-Test-v13-Richtung eingebaut
- Status-Chips in die Topbar gelegt
- Content-Bereich sauber neben Sidebar strukturiert
- Login-/Denied-Seite im gleichen CGN-/Neon-Galaxy-Stil belassen
- Keine Backend-/Auth-/DB-/JS-Logik geändert
- Keine Remote-Writes, Agent-Actions, OBS-/Sound-/Overlay-/Command-Steuerung aktiviert

Offen:

- Lokal installieren und testen
- Nach `stepdone.cmd` Webserver-Deploy aus frischem GitHub/dev-Clone
- Secrets rotieren

## 2026-06-24 - RDAP_WORKFLOW_MASTERPROMPT_FIX

Stand:

```text
RDAP_WORKFLOW_MASTERPROMPT_FIX
```

Zusammenfassung:

- RDAP-Webserver-Deploy-Arbeitsweise verbindlich dokumentiert
- Falsche Annahme `/opt/stream-control-center/tools/remote-modboard-deploy.sh` korrigiert
- Korrektes Muster dokumentiert: frischer GitHub/dev-Clone nach `/opt/stream-control-center/_deploy_tmp/STEP_NAME`, danach `sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev`
- Keine Code-/Auth-/Design-Dateien geändert
