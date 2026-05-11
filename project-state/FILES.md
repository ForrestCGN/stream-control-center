# FILES - stream-control-center

Stand: 2026-05-11

## STEP232 - Project Docs Cleanup & Sorting

Geaendert / neu:

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

Nicht geaendert:

```text
backend/**
htdocs/**
config/**
data/**
app.sqlite
.env
secrets/**
tokens/**
historische STEP-Dateien
historische APPEND-Dateien
historische STATUS_NOTE-Dateien
historische HANDOFF-Dateien
```

## Aktive Doku-Einstiegspunkte

```text
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
```

## Neue Doku-Hilfsdateien

```text
docs/current/PROJECT_DOCUMENTATION_MAP_2026-05-11.md
docs/current/PROJECT_CLEANUP_PLAN_2026-05-11.md
```

## Aktuell wichtige Moduldateien - Message-Rotator

```text
backend/modules/message_rotator.js
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.css
config/message_rotator.json
config/messages/follow.json
config/messages/discord.json
config/messages/youtube.json
```

DB-bezogen:

```text
message_rotator_settings
module_text_variants (module = message_rotator)
```

## Historische Analyse-Snapshots

Nicht ueberschreiben, nur als alte Referenz nutzen:

```text
docs/backend/Backend_Systemuebersicht_2026-05-03.txt
docs/dashboard/DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt
docs/database/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt
docs/overlays/overlay_iststand_analyse.txt
docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt
```

## Bekannte Doku-Aufraeumkandidaten fuer spaeter

Nicht geloescht in STEP232:

```text
project-state/*APPEND*.md
project-state/*STATUS_NOTE*.md
docs/current/*STATUS_NOTE*.md
docs/handoffs/NEXT_CHAT_HANDOFF_*.md
```

Empfohlenes spaeteres Archivziel:

```text
project-state/archive/appends/
project-state/archive/status-notes/
docs/archive/handoffs/
docs/archive/old-current-notes/
```
