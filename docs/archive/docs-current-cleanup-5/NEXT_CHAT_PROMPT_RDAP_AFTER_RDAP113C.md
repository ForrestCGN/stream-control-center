# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP113C

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
RDAP112/RDAP112B: Routen aus normalem System-Menue raus.
RDAP113B: Details-Navigation entfernt.
RDAP113C: Benutzerverwaltung korrekt unter Admin eingeordnet; eigener User-Account bleibt oben rechts.
```

## UI-Regel

```text
Modboard ist fuer Streambetrieb, Mods und Admins.
Admin-Funktionen gehoeren in Admin.
Der eigene User-Account gehoert oben rechts ins Profilmenue.
Keine Projekt-Erklaerungen.
Keine technische Dauerwand.
```

## Naechster sinnvoller Schritt

```text
RDAP114_ACCESS_MODULE_SPLIT
```

Ziel:
```text
Rollen & Rechte weiter aus Shell/Normalstruktur herausloesen, aber weiterhin unter Admin einordnen.
Bestehende Dateien/Module bevorzugen.
Keine neuen Writes.
Keine DB-Migration.
```
