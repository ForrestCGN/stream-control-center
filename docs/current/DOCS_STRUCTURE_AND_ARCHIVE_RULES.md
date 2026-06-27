# DOCS_STRUCTURE_AND_ARCHIVE_RULES

Stand: RDAP106_DOCS_CURRENT_STATE_REBUILD  
Datum: 2026-06-27  
Projekt: `stream-control-center` / Dokumentation

## Zweck

Diese Datei legt fest, wie die Dokumentation ab RDAP106 gelesen, gepflegt und spaeter aufgeraeumt wird.

## Ausgangslage

RDAP105 hat gezeigt:

```text
- docs/current enthaelt sehr viele historische Step-Dokumente.
- project-state enthaelt neben aktuellen Kern-Dateien viele historische/alte Dateien.
- Es gibt viele RDAP_*, CAN_*, DASHUI_* und NEXT_CHAT_PROMPT_*-Dateien.
- Historische Informationen sind wertvoll, aber im aktuellen Einstieg zu laut.
```

## Grundregel

```text
docs/current = aktuelle Wahrheit / Einstieg / aktive Orientierung
docs/archive = historische Nachweise
project-state = knapper aktueller Projektzustand
```

## Aktuelle Startbasis

Neue Chats sollen zuerst diese Dateien lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_DASHBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Zielstruktur

```text
docs/current/
  Nur aktuelle Wahrheit und Einstieg.

docs/archive/rdap/
  Historische RDAP-Step-Dokus und Handoffs.

docs/archive/can/
  Historische CAN-Step-Dokus und Handoffs.

docs/archive/dashui/
  Historische DASHUI-Step-Dokus und Handoffs.

docs/modules/
  Modulbezogene aktuelle Doku.

docs/reference/
  Dauerhaft gueltige Referenzdoku.

project-state/
  Nur aktuelle Kern-Dateien:
  - CURRENT_STATUS.md
  - NEXT_STEPS.md
  - TODO.md
  - FILES.md
  - CHANGELOG.md

project-state/archive/
  Historische State-Append-Dateien.
```

## Was aktuelle Doku leisten muss

```text
- aktuellen Stand klar nennen
- naechsten Step klar nennen
- harte Sicherheitsgrenzen nennen
- relevante Startdateien nennen
- alte Detailhistorie nicht duplizieren
- historische Dateien nicht als aktuelle Wahrheit ausgeben
```

## Was historische Doku leisten darf

```text
- Step-Historie belegen
- alte Entscheidungen nachvollziehbar machen
- Debug-/Deploy-/Live-Befunde dokumentieren
- alte Prompts als Nachweis halten
```

Historische Doku darf aber nicht mehr automatisch Startbasis fuer neue Chats sein.

## Cleanup-Regeln

Vor Datei-Verschiebungen oder Loeschungen:

```text
1. Quelle und Zielpfad nennen.
2. Pruefen, ob aktuelle Startdateien darauf verweisen.
3. Pruefen, ob Inhalt in Current-State-Dateien uebernommen wurde.
4. Keine Massenloeschung.
5. Kein Linkbruch ohne bewusstes Update.
6. ZIP nur mit echten Repo-Zielpfaden.
```

## Aktueller RDAP106-Scope

RDAP106 macht:

```text
- zentrale Current-State-Dateien erstellen
- Overview/Roadmap aktualisieren
- START_HERE aktualisieren
- project-state knapp neu ausrichten
- Next-Chat-Prompt aktualisieren
```

RDAP106 macht nicht:

```text
- historische Dateien loeschen
- Massenverschiebung
- Feature-Code
- Runtime-Aktivierung
- Agent-Actions
- Webserver-Deploy
```

## Empfohlener spaeterer Archiv-Step

Erst nach RDAP106 und separatem Plan:

```text
RDAP_DOCS_ARCHIVE_INDEX_AND_MOVE_PLAN
```

Ziel waere:

```text
- genaue Liste historischer Dateien erzeugen
- Zielordner docs/archive/rdap, docs/archive/can, docs/archive/dashui festlegen
- Indexdatei fuer Archive bauen
- erst danach kontrolliert verschieben
```
