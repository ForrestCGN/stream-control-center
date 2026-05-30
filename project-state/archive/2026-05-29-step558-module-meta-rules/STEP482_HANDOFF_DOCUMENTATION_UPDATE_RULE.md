# STEP482_HANDOFF_DOCUMENTATION_UPDATE_RULE

Datum: 2026-05-26

## Ziel

Verbindlich festlegen, dass bei Forrests Auftrag „dokumentieren und aktualisieren" vor einem Chatwechsel alle relevanten Projektstand- und Modul-Dokus geprüft und aktualisiert werden.

## Geändert

```text
project-state/GENERAL_PROJECT_PROMPT.md
docs/current/PROJECT_WORKING_RULES.md
docs/current/HANDOFF_DOCUMENTATION_UPDATE_RULE_2026-05-26.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md
docs/modules/README.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

## Inhalt

Ergänzt wurde:

```text
- „dokumentieren und aktualisieren" als verbindlicher Konsolidierungsauftrag
- Pflichtprüfung zentraler project-state-Dateien
- Pflichtprüfung betroffener docs/current-Dateien
- Pflichtprüfung betroffener docs/modules-Dateien
- klare Regel gegen veraltete Doku beim Chatwechsel
- Regel zur Nutzung der aktuellsten MODULE_DOCS_DEEP_DIVE_STATUS_*.md
```

## Bewusst nicht geändert

```text
backend/**
htdocs/**
config/**
data/**
SQLite
Dashboard-Code
Shoutout-Code
```

## Tests

Keine JS-Dateien geändert, daher kein `node --check` nötig.

## Nächster sinnvoller STEP

```text
STEP483_SHOUTOUT_DASHBOARD_TABS
```
