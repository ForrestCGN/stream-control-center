# CHANGELOG - stream-control-center

## 2026-06-24 - RDAP_WORKFLOW_MASTERPROMPT_FIX

Stand:

```text
RDAP_WORKFLOW_MASTERPROMPT_FIX
```

Zusammenfassung:

- RDAP-Webserver-Deploy-Arbeitsweise verbindlich dokumentiert
- Falsche Annahme `/opt/stream-control-center/tools/remote-modboard-deploy.sh` korrigiert
- Korrektes Muster dokumentiert: frischer GitHub/dev-Clone nach `/opt/stream-control-center/_deploy_tmp/STEP_NAME`, danach `sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev`
- `MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md` als Pflichtkontext zusätzlich zum Master-Prompt erstellt
- `START_HERE_FOR_NEW_CHAT.md`, Handoff, Projektstatus, Next Steps, TODO und FILES aktualisiert
- Keine Code-/Auth-/Design-Dateien geändert
- Keine Remote-Writes, Agent-Actions, OBS-/Sound-/Overlay-/Command-Steuerung aktiviert

Offen:

- Secrets rotieren
- Designbasis prüfen
- Zentralen Login für Hauptseite/Modboard-Übernahme weiter planen

## 2026-06-24 - Handoff wegen stockendem Dashboard2-Design

Stand:

```text
RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT
```

Zusammenfassung:

- Twitch Login funktioniert live
- ForrestCGN wurde im Browser als angemeldet angezeigt
- Auth/OAuth/Sessions sind aktiv
- Dashboard1/2 wurden begonnen
- Dashboard2-Design entspricht noch nicht dem geplanten CGN-/Vision-UI-/Neon-Galaxy-Stil
- Nächster Chat soll mit echter Designbasis aus dem Repo arbeiten, nicht mit freiem CSS-Raten

Offen:

- Secrets rotieren
- Designbasis prüfen
- Zentralen Login für Hauptseite/Modboard-Übernahme planen
