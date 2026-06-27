# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP111B

Du arbeitest im Projekt `stream-control-center` / Remote-Modboard / RDAP.

## Start

Lies zuerst diese Dateien aus GitHub/dev:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Wichtige Arbeitsweise

```text
- Kurz antworten.
- Keine langen Techniklisten in den Chat.
- Plan kurz nennen.
- Nur bei echter Entscheidung nachfragen.
- Erst lesen, dann planen, auf go warten.
- ZIP mit echten Zielpfaden bauen.
- Lokal installstep, Checks, stepdone.
- Danach Webserver-Deploy:
  bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Aktueller Stand

```text
RDAP109/RDAP109B: UI enttechnisiert, Projekterklaerungen raus.
RDAP110: Uebersicht als eigenes Modul.
RDAP111/RDAP111B: Diagnose als eigenes Modul; Info als Icon oben rechts, Details im Dialog.
```

## UI-Regel

```text
Modboard ist fuer Streambetrieb, Mods und Admins.
Keine Projekt-Erklaerungen.
Keine technische Dauerwand.
Bei Fehler: Mod/Streamer soll klar sagen koennen, dass ein Fehler da ist.
Technische Details nur ueber Info/extra Fenster.
```

## Naechster sinnvoller Schritt

```text
RDAP112_SYSTEM_ROUTES_MODULE_DECISION
```

Entscheiden:
```text
Routen aus normalem Menue entfernen/verschieben
oder Routen als eigenes Modul stark vereinfachen.
```
