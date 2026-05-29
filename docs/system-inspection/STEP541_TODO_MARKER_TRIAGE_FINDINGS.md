# STEP541 – TODO Marker Triage Findings

Version: 0.1.0  
Stand: 2026-05-29

## Zweck

STEP541 dokumentiert die Befunde aus dem STEP540 TODO-/Marker-Triage-Scan.

Dieser STEP ist ein Befundbericht, kein Cleanup.

## Grundlage

STEP540-Scan:

```text
Scanned files: 1165
Hit files: 154
Total hits: 826
Buckets: 11
Action candidate files: 143
```

Bucket-Verteilung:

```text
system_inspection_reports | 16 Dateien | 291 Hits
project_state              | 33 Dateien | 184 Hits
module_docs                | 72 Dateien | 170 Hits
current_docs               | 16 Dateien | 87 Hits
database_docs              | 1 Datei    | 41 Hits
backend_docs               | 6 Dateien  | 40 Hits
dashboard_docs             | 3 Dateien  | 4 Hits
sound_system_docs          | 3 Dateien  | 4 Hits
settings_docs              | 1 Datei    | 2 Hits
user_docs                  | 2 Dateien  | 2 Hits
other_docs                 | 1 Datei    | 1 Hit
```

Marker-Typen:

```text
potential_action_item | 498 Hits
name_context_todo     | 196 Hits
next_step             | 92 Hits
future_note           | 22 Hits
intentional_scope_note| 15 Hits
known_issue           | 3 Hits
```

## Kernerkenntnis

Die reine Anzahl von TODO-/Marker-Hits ist nicht als Lösch- oder Arbeitsliste nutzbar.

Viele Treffer sind keine offenen Aufgaben, sondern:

```text
- Kontexttreffer durch Dateinamen wie todo-deep-dive.md
- Scan-/Rettungsberichte
- alte Kandidatenlisten
- Archiv-Move-Listen
- Modulnamen/Routen wie /api/todo/*
- bewusst dokumentierte Scope-Grenzen
- generische Abschnittsüberschriften wie "Offene Punkte"
```

## Gruppe A – Ignorieren / Kontexttreffer

Diese Treffer sind nicht direkt bearbeitbar und sollten nicht als Arbeitspaket interpretiert werden.

Typische Beispiele:

```text
docs/modules/todo-deep-dive.md
docs/modules/tagebuch-todo.md
project-state/TODO.md
```

Grund:

```text
Der Treffer entsteht, weil "todo" Teil des Modulnamens, Dateinamens, Routennamens oder Tabellen-/Config-Namens ist.
```

Beispiele:

```text
docs/modules/todo-deep-dive.md | 39 Hits | davon 38 name_context_todo
docs/modules/tagebuch-todo.md | 20 Hits | davon 17 name_context_todo
```

Empfehlung:

```text
Nicht bereinigen.
Nicht archivieren nur wegen Trefferanzahl.
Bei Modul-Doku-Qualitätsrunde separat prüfen.
```

## Gruppe B – Scan-/Rettungs-/Triage-Berichte

Diese Dateien erzeugen viele Treffer, weil sie absichtlich Trefferlisten, Kandidaten oder gerettete offene Punkte enthalten.

Beispiele:

```text
docs/system-inspection/STEP532_TODO_RESCUE_REPORT.md
docs/system-inspection/STEP536_TECH_STEP_DOCS_CANDIDATE_MANIFEST.md
docs/system-inspection/STEP536_TECH_STEP_DOCS_TRIAGE_AND_BATCH_PLAN.md
docs/system-inspection/STEP539_TECH_STEP_DOCS_CLEANUP_COMPLETION.md
docs/system-inspection/STEP540_TODO_MARKER_TRIAGE_SCAN.md
```

Einordnung:

```text
Diese Dateien sind Arbeits-/Nachweisberichte.
Sie sind nicht automatisch aktive TODO-Listen.
```

Empfehlung:

```text
Später ggf. eigenen System-Inspection-Archivblock planen.
Nicht jetzt löschen.
Nicht in TODO.md übernehmen, außer konkrete offene Punkte werden einzeln validiert.
```

## Gruppe C – Project-State Treffer

Project-State enthält viele echte Arbeits-/Status-/Übergabeinformationen, aber auch alte STEP-Fragmente und Archiv-Move-Listen.

Auffällige Dateien:

```text
project-state/PROJECT_STATE_ARCHIVE_MOVE_LIST_2026-05-26.csv
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE.md
project-state/STEP477_MODULE_DOCS_STREAM_MODULES_DEEP_DIVE.md
project-state/STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE.md
project-state/STEP482_HANDOFF_DOCUMENTATION_UPDATE_RULE.md
project-state/STEP489_CHANNELPOINTS_BACKEND_SKELETON.md
```

Einordnung:

```text
project-state ist ein eigener Cleanup-Bereich.
Viele Treffer sind Referenzen auf NEXT_STEPS/TODO oder alte STEP-Dokumentationsstände.
```

Empfehlung:

```text
Separaten STEP für Project-State-Triage planen.
Nicht automatisiert löschen.
Vorher prüfen, welche Dateien noch aktive Referenz sind.
```

## Gruppe D – Current Docs / alte Maps

Auffällige Dateien:

```text
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-26.md
docs/current/PROJECT_WORKING_RULES.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md
docs/current/PROJECT_STATE_CLEANUP_PLAN_2026-05-26.md
```

Einordnung:

```text
docs/current enthält teils aktuelle Regeln, teils ältere Karten/Maps.
Viele Treffer sind Routen-/Modulnamen oder bewusst offene Folgearbeiten.
```

Empfehlung:

```text
Separaten Current-Docs-Refresh planen.
Ziel: aktuelle Maps behalten/erneuern, alte Maps ggf. archivieren.
Vorher gegen reale Repo-/Backend-Struktur prüfen.
```

## Gruppe E – Modul-Dokus

Auffällig:

```text
module_docs | 72 Dateien | 170 Hits
```

Viele Modul-Dokus enthalten generische Abschnitte:

```text
## Offene Punkte
## Offene Punkte / spätere Prüfung
Dashboard-/Overlay-Flows nur testen, wenn das Modul wirklich betroffen ist.
```

Einordnung:

```text
Das sind größtenteils gewollte Qualitäts-/Prüfabschnitte.
Sie sollten nicht global entfernt werden.
```

Empfehlung:

```text
Modul-Doku-Qualitätsrunde pro Modul.
Dabei echte offene Punkte prüfen und ggf. in project-state/TODO.md oder NEXT_STEPS.md überführen.
Keine Massenbereinigung.
```

## Gruppe F – Datenbank-/Backend-Systemübersichten 2026-05-03

Auffällige Dateien:

```text
docs/database/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt
docs/backend/Backend_Systemuebersicht_2026-05-03.txt
docs/dashboard/DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt
```

Einordnung:

```text
Diese Dateien sind große Momentaufnahmen.
Sie enthalten viele Treffer, weil dort Module, Tabellen, Routen und spätere Hinweise beschrieben sind.
```

Empfehlung:

```text
Separaten Systemübersichten-Refresh planen.
Prüfen, ob diese Dateien noch aktive Referenz oder historische Momentaufnahme sind.
Wenn historisch: nach docs/archive oder docs/system-inspection/archive verschieben, aber nur nach Dokumentation.
```

## Gruppe G – Echte offene Arbeit

Echte offene Arbeit ist vorhanden, aber nicht zuverlässig über Trefferanzahl erkennbar.

Beispiele für wahrscheinlich echte Punkte:

```text
CURRENT_SYSTEM_STATUS.md:
- Shadow-/Bus-Test und Entscheidung zu produktivem Bus-Modus
- Offenes Feintuning
- Bekannte offene Issues

SOUND_MEDIA_TECH_HISTORY_CONSOLIDATED.md:
- SoundBus-Semantik sound.finished klären

ALERT_TECH_HISTORY_CONSOLIDATED.md:
- gerettete offene Punkte aus altem STABLE-Handoff

docs/current/PROJECT_CLEANUP_PLAN_2026-05-11.md:
- Docs/current später in eigenem STEP weiter archivieren
- Modul-Dokus pro System vereinheitlichen
```

Empfehlung:

```text
Nicht automatisch aus allen Treffern TODOs erzeugen.
Stattdessen pro Themenblock prüfen und echte Punkte in TODO.md / NEXT_STEPS.md übernehmen.
```

## Priorisierte nächste Schritte

### STEP542 – Project-State Triage

Warum zuerst:

```text
project-state ist zentral für Chatwechsel, NEXT_STEPS, TODO, FILES und Übergaben.
Dort liegen viele alte STEP-Fragmente und Referenzen.
```

Ziel:

```text
Aktive project-state-Dateien von historischen STEP-/Append-/Move-Listen trennen.
```

### STEP543 – Current Docs Refresh Scan

Ziel:

```text
docs/current Maps und Statusdateien prüfen.
Alte 2026-05-11 Maps gegen 2026-05-26/aktuelle Karten abgleichen.
```

### STEP544 – Systemübersichten Refresh

Ziel:

```text
alte 2026-05-03 Backend-/Dashboard-/Datenbank-Übersichten als historisch markieren oder aktualisieren.
```

### STEP545 – Module Docs Quality Pass

Ziel:

```text
Modul-Dokus pro Bereich prüfen.
Generische "Offene Punkte" konkretisieren oder als bewusst generische Prüfabschnitte markieren.
```

## Arbeitsregel

Für alle Folgeblöcke gilt:

```text
1. Erst echten aktuellen Stand prüfen.
2. Erst Inhalte retten/konsolidieren.
3. Dann Dry-Run.
4. Dann Quarantine.
5. Dann gezielter Commit.
6. Kein git add .
7. Keine Funktionalität entfernen.
8. Keine Runtime-Dateien ändern, wenn es nur um Doku-Cleanup geht.
9. Keine DB/Secrets/Tokens/Backups/Zips committen.
```

## Abschlussbewertung

STEP540 hat seinen Zweck erfüllt:

```text
TODO-/Marker-Hits sind triagiert.
Keine automatische Löschung empfohlen.
Nächster sinnvoller Block: Project-State-Triage.
```
