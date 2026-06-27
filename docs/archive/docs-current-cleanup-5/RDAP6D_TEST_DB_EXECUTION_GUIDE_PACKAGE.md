# RDAP6D Test-DB Execution Guide Package

Stand: 2026-06-23

## Ziel

RDAP6D liefert eine sichere Anleitung und Ergebnisvorlage fuer einen spaeteren RDAP6C-Testlauf auf separater Testdatenbank.

Dieser Step fuehrt nichts produktiv aus.

## Dateien

```text
db/rdap6d/README.md
db/rdap6d/runbooks/RDAP6D_TEST_DB_EXECUTION_RUNBOOK.md
db/rdap6d/checks/RDAP6D_EXPECTED_RESULTS.md
db/rdap6d/templates/RDAP6D_TEST_RESULT_TEMPLATE.md
docs/current/RDAP6D_TEST_DB_EXECUTION_GUIDE_PACKAGE.md
```

## Nicht-Aenderungen

- keine produktive MariaDB-Ausfuehrung
- keine produktive SQLite-Aenderung
- keine Auth-Aktivierung
- keine Session-Aktivierung
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets im Repo/Frontend/Chat

## Kernregel

`sound_profi` bleibt Gruppe/Marker, keine Rolle.

## Naechster Schritt

RDAP6E waere erst die Auswertung eines echten Testdatenbanklaufs anhand der Ergebnisvorlage. Produktive Migration bleibt gesperrt bis Backup, Restore-Test, Validation und separatem Go.
