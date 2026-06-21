# CURRENT CHAT HANDOFF – Safe Test/Done Workflow

Stand: 2026-06-21
Thema: StepDone-Aufräumen / sicherer ZIP-Test-Workflow

## Ziel

GitHub/dev bleibt künftig der letzte getestete stabile Stand. ZIPs werden zuerst lokal ins Repo installiert und nach Live deployed, ohne Commit und ohne Push. Erst nach erfolgreichem Live-Test wird mit `stepdone.cmd` nach GitHub/dev gepusht.

## Gelieferte Dateien

```text
installstep.cmd
testdeploy.cmd
stepdone.cmd
stepundo.cmd
stepstatus.cmd
tools/deploy_repo_to_streamassets.ps1
docs/current/STEPDONE_WORKFLOW.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/CURRENT_CHAT_HANDOFF_STEP_WORKFLOW_2026-06-21.md
```

## Neuer Ablauf

```text
ZIP herunterladen
-> installstep.cmd mit exaktem ZIP-Pfad ausführen
-> Test-Deploy nach Live ohne GitHub-Push
-> Node ggf. neu starten
-> live testen
-> wenn OK: stepdone.cmd "Beschreibung"
-> wenn kaputt: stepundo.cmd
```

## Wichtig

Project-State-Dateien wurden in diesem ZIP bewusst nicht ersetzt, weil sie lokal abweichen koennen und nicht vollständig als Upload vorlagen. Bei Abschluss nach erfolgreichem Test sollen `project-state/CURRENT_STATUS.md`, `NEXT_STEPS.md`, `TODO.md`, `FILES.md` und ggf. `CHANGELOG.md` aktualisiert werden.

## Neue Master-Prompt-Regel

Wenn eine Datei nicht vollständig oder nicht zuverlässig lesbar ist: nicht rekonstruieren, nicht raten, exakt die Datei aus `D:\Git\stream-control-center` anfordern.
