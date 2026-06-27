# NEXT CHAT PROMPT - RDAP nach DESIGN2 Live

Wir arbeiten am Projekt `stream-control-center` / RDAP Remote-Modboard von ForrestCGN.

Sprache: Deutsch.  
Arbeitsweise strikt einhalten:

- Erst echte Dateien/Repo/Dokus prüfen.
- Dann Plan nennen.
- Dann auf Forrests klares `go` warten.
- Nicht raten.
- Fehlende Dateien gezielt anfordern.
- Keine Funktionalität entfernen.
- Bestehende Systeme nutzen.
- Keine Parallelstrukturen erfinden.
- Workflow-Tools schützen.

## Pflicht zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED.md
docs/current/RDAP_ADMIN_USERS11B_DEPLOY_CONFIRMED_DOCS.md
docs/current/RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

RDAP11 Backend-/Security-Stand ist live:

```text
moduleBuild: RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

DESIGN2 ist live bestätigt:

```text
Login-Subtext: Melde dich mit Twitch an und öffne dein Modboard.
Login-Button: Anmelden
```

Optik ist nicht perfekt, aber vorerst akzeptiert.

## Wichtige Workflow-Warnung

`installstep.cmd` wurde während DESIGN2 als kritisches Tool geprüft. Es muss der allgemeine ZIP-Installer bleiben:

```text
STEP_ZIP=%~1
Downloads-Fallback
Expand-Archive
testdeploy.cmd
```

Design-/Frontend-Steps dürfen `installstep.cmd`, `stepdone.cmd`, `testdeploy.cmd` und Deploy-Skripte NICHT überschreiben.

## Nächster Fachstep

```text
RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN
```

Nur Planung. Noch keinen echten Write bauen.

RDAP12 muss klären:

```text
kleinster Admin-Write
Tabelle/Felder
Backup
Rollback
Permission
confirmWrite
Audit
Lock-Scope
Read-Back
Fehlerfälle/Abbruch
```

Ein echter Mini-Write erst nach RDAP12 und weiterem ausdrücklichem `go`.

## Geparkt

```text
RDAP_DESIGN3_LOGIN_TEXT_LAYOUT_FINE_TUNE
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```
