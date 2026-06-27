# RDAP105_DOCS_INVENTORY_AND_CLEANUP_PLAN

Datum: 2026-06-27  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-Inventur / Cleanup-Plan / Strukturentscheidung

## Zweck

RDAP105 ist ein reiner Plan- und Inventur-Step fuer die Projektdokumentation.

Nach vielen RDAP-, CAN-, DASHUI- und Projekt-State-Steps ist die Dokumentation funktional, aber unuebersichtlich geworden. Ziel ist deshalb nicht, sofort alte Dateien zu loeschen oder zu verschieben, sondern zuerst eine belastbare Struktur fuer die naechste Doku-Bereinigung festzulegen.

## Ausgangspunkt

GitHub/dev bleibt die verbindliche Wahrheit.

Zusatz-Snapshots aus dem Repo wurden zur Struktur-Inventur herangezogen:

```text
dashboard-v2.zip
remote-modboard.zip
stream-control-center.zip
```

Diese ZIPs sind nicht die Aenderungsbasis, sondern nur ein Abgleich fuer Umfang und Struktur.

## Inventur-Befund

Snapshot-Befund:

```text
dashboard-v2.zip:
- 5 Eintraege
- Build-/Frontend-Ausgabe
- keine Doku-Dateien

remote-modboard.zip:
- 82 Eintraege
- Backend/Public/Src-Struktur vorhanden
- 4 Markdown-Dateien

stream-control-center.zip:
- 3380 Eintraege
- docs/: ca. 2067 Dateien
- project-state/: ca. 1248 Dateien
- docs/current/: ca. 1435 Dateien
- project-state/archive/: ca. 996 Dateien
- Markdown-Dateien gesamt: ca. 3244
```

Auffaellig:

```text
- docs/current enthaelt sehr viele historische Step-Dokumente.
- project-state enthaelt neben den aktuellen Kern-Dateien viele alte Einzelschritt-Dateien.
- Es gibt viele NEXT_CHAT_PROMPT_*, RDAP_*, CAN_*, DASHUI_* und Status-Dateien.
- Historische Informationen sind wertvoll, aber im aktuellen Einstieg zu laut.
```

## Problem

Aktuell ist nicht klar genug getrennt zwischen:

```text
- aktueller Wahrheit
- naechstem Arbeitsstart
- Workflow-Regeln
- Modul-/Systemdoku
- historischen Step-Handoffs
- alten Append-/Changelog-Dateien
```

Dadurch entstehen Risiken:

```text
- neue Chats lesen alte Startpunkte
- alte RDAP-/CAN-Dateien wirken aktueller als sie sind
- wichtige aktuelle Dateien gehen im Rauschen unter
- Doku-Step und Feature-Step vermischen sich
```

## Zielstruktur

Empfohlene Zielstruktur:

```text
docs/current/
  Nur aktuelle Wahrheit und Einstieg:
  - START_HERE_FOR_NEW_CHAT.md
  - MASTER_PROMPT_...
  - NEXT_CHAT_PROMPT_...
  - PROJECT_OVERVIEW_...
  - ROADMAP_...
  - WORKFLOW_...
  - CURRENT_REMOTE_MODBOARD_STATE.md
  - CURRENT_DASHBOARD_STATE.md
  - CURRENT_STREAM_PC_AGENT_STATE.md

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

## Wichtige Regel

Keine historischen Dateien loeschen, solange nicht klar ist:

```text
- was noch als Referenz gebraucht wird
- ob ein aktuelles Dokument daraus Inhalte uebernimmt
- ob Pfade in Start-/Handoff-Dateien darauf zeigen
```

Erste Bereinigung soll deshalb bevorzugt:

```text
- indexieren
- markieren
- konsolidieren
- Startpunkte aktualisieren
```

Nicht sofort:

```text
- massenhaft loeschen
- unkontrolliert verschieben
- Links brechen
- historische Step-Infos entfernen
```

## RDAP106-Vorschlag

Naechster Step:

```text
RDAP106_DOCS_CURRENT_STATE_REBUILD
```

Ziel:

```text
- zentrale aktuelle Doku-Dateien neu aufbauen
- docs/current auf echten Current-Fokus reduzieren
- historische Dokus klar als Archiv behandeln
- project-state knapp halten
- Next-Chat-Prompt aus der neuen Struktur ableiten
```

## RDAP106 Scope

RDAP106 soll zuerst folgende Dateien neu/sauber aufbauen oder aktualisieren:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_DASHBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP105.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## RDAP106 Nicht-Scope

```text
Keine Feature-Implementierung.
Keine Runtime-Aktivierung.
Keine Agent-Actions.
Keine OBS-/Sound-/Overlay-/Command-Steuerung.
Keine DB-Migration.
Keine produktiven Writes.
Keine Webserver-Deploy-Pflicht bei Doku-only.
Keine Massenloeschung historischer Dateien.
```

## Verschobener Feature-Step

Der bisher geplante Feature-Step bleibt sinnvoll, wird aber nach der Doku-Bereinigung nach hinten geschoben:

```text
RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

## Ergebnis RDAP105

```text
RDAP105 setzt die Doku-Aufraeumung als naechsten echten Arbeitsblock.
RDAP106 wird Doku-Current-State-Rebuild.
Der Stream-PC-Verbindungsdetails-Plan wird auf RDAP107 verschoben.
```
