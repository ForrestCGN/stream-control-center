# STEP261 - project-state Cleanup / Archivierung alter Fragmente

Stand: 2026-05-11

## Ziel

`project-state` wird aufgeraeumt, ohne historische Informationen zu loeschen.

Alte Zwischenstaende, APPEND-Dateien, SAVED-Dateien, alte README-Dateien, Testlogs und alte STEP-Dateien werden nach `project-state/archive/step261-project-state-cleanup/` verschoben.

## Wichtig

Dieser STEP loescht keine Inhalte. Er verschiebt nur Dateien/Ordner.

Da ZIP-Entpacken unter Windows keine alten Dateien entfernen kann, wird fuer diesen Cleanup ein einmaliger Apply-Befehl mitgeliefert:

```powershell
cd D:\Git\stream-control-center
.\STEP261_APPLY_PROJECT_STATE_CLEANUP.cmd
```

Danach wie gewohnt:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP261 project-state cleanup archive old fragments"
```

## Geplante Archiv-Kategorien

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
- old-reports: 5
- old-saved: 4
- old-step-docs: 280
- old-test-logs: 11

Gesamt: 462 Eintraege.

## Sichtbar im Root behalten


- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- aktuelle STEP-Historie ab STEP229 im Root
- bestehender `project-state/archive/`-Ordner bleibt erhalten


## Nicht geaendert

```text
backend/
htdocs/
config/
data/
app.sqlite
OBS / Streamer.bot / Runtime
```

## Ergebnis

Nach dem Apply-Script ist `project-state` deutlich uebersichtlicher. Die Historie bleibt unter `archive/step261-project-state-cleanup/` erhalten.
