# PROJECT CLEANUP PLAN - stream-control-center

Stand: 2026-05-11

## Ziel

Das Projekt soll besser navigierbar werden, ohne historische Informationen oder funktionierende Systeme zu verlieren.

## Aktueller Cleanup-Stand

### STEP232 / STEP233

- Aktive Doku-Einstiege wurden gestrafft.
- Alte Doku-Fragmente wurden teilweise archiviert.
- Historische Snapshots bleiben lesbar.

### STEP260

- DeathCounter-DB-Umbau wurde als STABLE dokumentiert.
- Current-Doku wurde fuer den DeathCounter-Stand aktualisiert.

### STEP261

- `project-state` wird aufgeraeumt.
- Alte Root-Fragmente werden nach `project-state/archive/step261-project-state-cleanup/` verschoben.
- Nichts wird geloescht.

## Archiv-Regel fuer STEP261

Root von `project-state` soll kuenftig nur enthalten:

```text
CURRENT_STATUS.md
CHANGELOG.md
FILES.md
NEXT_STEPS.md
aktuelle STEP-Dateien ab STEP229
```

Alte Dateien gehen nach:

```text
project-state/archive/step261-project-state-cleanup/old-appends/
project-state/archive/step261-project-state-cleanup/old-status-notes/
project-state/archive/step261-project-state-cleanup/old-saved/
project-state/archive/step261-project-state-cleanup/old-readmes/
project-state/archive/step261-project-state-cleanup/old-test-logs/
project-state/archive/step261-project-state-cleanup/old-reports/
project-state/archive/step261-project-state-cleanup/old-step-docs/
project-state/archive/step261-project-state-cleanup/old-compare-reports/
```

## Erwartete Verschiebungen aus dem hochgeladenen ZIP

- old-appends: 127
- old-compare-reports: 2
- old-fragments: 21
- old-readmes: 12
- old-reports: 4
- old-saved: 4
- old-step-docs: 280
- old-test-logs: 11

## Weiter offen

- Docs/current kann spaeter in einem eigenen STEP weiter archiviert werden.
- Modul-Dokus koennen spaeter pro System vereinheitlicht werden.
- Automatisch generierte Karten koennen spaeter mit einem Generator aktualisiert werden.

## No-Gos

- Keine historischen Dateien blind loeschen.
- Keine alte Analyse als aktuellen Stand verkaufen.
- Keine neuen Parallel-Doku-Strukturen ohne Zweck.
- Keine Doku-Dateien in `htdocs` ablegen.
- Keine Runtime-Dateien, Datenbanken oder Secrets anfassen.
