# STEP232 - Project Docs Cleanup & Sorting

Datum: 2026-05-11

## Ziel

Die Projekt-Dokumentation wurde auf Basis des bereitgestellten `stream-control-center.zip` sortiert und als aktuelle Arbeitsbasis neu strukturiert. Ziel ist bessere Orientierung, nicht das Entfernen von Historie.

## Ausgangsbefund

Das ZIP enthaelt sehr viele Doku-/Projektstatus-Dateien:

```text
578 Dateien gesamt
101 Dateien unter docs/
477 Dateien unter project-state/
60 Dateien unter docs/current/
466 Dateien direkt unter project-state/
127 APPEND-Dateien
26 STATUS_NOTE-Dateien
15 HANDOFF-Dateien
155 STEP201-bezogene Dateien
```

Bewertung:

- Es gibt genug Historie, aber zu wenig klare Einstiegspunkte.
- `project-state` ist durch viele Append-/Zwischenstandsdateien schwer lesbar.
- `docs/current` enthaelt zu viele alte Zwischenstandsnotizen, obwohl der Ordner eigentlich aktueller Stand sein soll.

## Geaendert

```text
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_DOCUMENTATION_MAP_2026-05-11.md
docs/current/PROJECT_CLEANUP_PLAN_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP232_PROJECT_DOCS_CLEANUP_AND_SORTING_2026-05-11.md
```

## Nicht geaendert

```text
backend/**
htdocs/**
config/**
data/**
app.sqlite
.env / secrets / tokens
historische STEP-Dateien
historische APPEND-Dateien
historische STATUS_NOTE-Dateien
historische HANDOFF-Dateien
```

## Inhaltliche Aenderungen

- `CURRENT_SYSTEM_STATUS.md` wurde als kompakter aktueller Systemstand neu sortiert.
- `NEXT_STEPS.md` wurde von alten erledigten Testlisten bereinigt und auf aktuelle Prioritaeten reduziert.
- `FILES.md` dokumentiert den aktuellen Doku-Cleanup und wichtige Hauptdateien.
- `CHANGELOG.md` wurde um STEP232 ergaenzt.
- `CURRENT_STATUS.md` wurde um STEP232 und den Message-Rotator-STABLE-Stand ergaenzt.
- Neue Doku-Karte `PROJECT_DOCUMENTATION_MAP_2026-05-11.md` erklaert, welche Doku wofuer genutzt wird.
- Neue Cleanup-Plan-Datei `PROJECT_CLEANUP_PLAN_2026-05-11.md` legt die naechsten Archiv-/Sortierphasen fest.

## Aktueller Arbeitsstandard nach STEP232

Aktive Einstiegspunkte:

```text
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
```

Historische Snapshots bleiben Referenz, sind aber nicht aktuelle Arbeitsbasis.

## Offene Punkte

- Physisches Verschieben/Archivieren alter APPEND-/STATUS_NOTE-/HANDOFF-Dateien ist noch nicht gemacht.
- Modulbezogene Doku-Dateien unter `docs/modules/` sind noch nicht aufgebaut.
- Automatisch generierte Doku unter `docs/_generated/` wurde nicht neu erzeugt.
