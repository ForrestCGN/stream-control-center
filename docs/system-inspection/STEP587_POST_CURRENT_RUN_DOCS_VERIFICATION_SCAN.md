# STEP587 - Post Current Run Docs Verification Scan

Version: 0.1.1  
Stand: 2026-05-30

## Aenderung in v0.1.1

v0.1.0 hat die eigene Datei

```text
project-state/STEP587_POST_CURRENT_RUN_DOCS_VERIFICATION_SCAN.md
```

als Current-Run-Root-Leftover gezaehlt.

v0.1.1 erlaubt folgende aktuellen Kontroll-/Verification-Dateien im Root:

```text
project-state/STEP586_CURRENT_RUN_DOCS_ARCHIVE_APPLY.md
project-state/STEP587_POST_CURRENT_RUN_DOCS_VERIFICATION_SCAN.md
```

Alle eigentlichen archivierten Run-Dokumente muessen weiterhin aus dem Root raus sein.

## Ziel

STEP587 prueft den Zustand nach STEP586.

## Script

```text
tools/system-inspection/verify_post_current_run_docs_step587.ps1
```

## Erwartung

```text
Current run docs in root: 0
NEXT_STEPS_STEP appends in root: 0
Archive expected: 46
Archive present: 46
Archive missing: 0
Archive extra: 0
Warnings: 0
Errors: 0
```
