# STEP583_CURRENT_RUN_DOCS_CLEANUP_PLAN

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

Plan fuer das Aufraeumen der aktuellen Run-Dokumente im `project-state` Root.

## Ausgangslage

```text
Current run docs still in root: 29
Remaining NEXT_STEPS appends: 12
```

## Zielordner

```text
project-state/archive/2026-05-30-step583-current-run-docs/
```

## Geplanter Ablauf

```text
STEP584 - Current Run Docs Rescue / History Append
STEP585 - Current Run Docs Archive Dry-Run
STEP586 - Current Run Docs Archive Apply
STEP587 - Post Current Run Docs Verification
```

## Wichtig

Vor dem Verschieben muss der aktuelle Cleanup-Verlauf in der aktiven Run-History gesichert werden:

```text
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

## Schutz

Core-/Current-Dateien und aktive Konsolidierungsdateien bleiben im Root bzw. in docs aktiv.
