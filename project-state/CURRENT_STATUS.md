# CURRENT_STATUS

## STEP471 - Doku, Regeln und allgemeiner Prompt

STEP471 ist ein Doku-/Regel-Update ohne Runtime-Änderung.

Neu bzw. aktualisiert:

- `docs/current/PROJECT_WORKING_RULES.md`
- `project-state/GENERAL_PROJECT_PROMPT.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP471_DOCS_RULES_AND_GENERAL_PROMPT.md`

Wichtige neue Regel:

Shell-/PowerShell-Ausgaben sollen möglichst kurz und kopierfreundlich sein. Für normale Statusprüfungen sollen gezielte Properties per `Select-Object` verwendet werden. Vollständige JSON-Dumps nur anfordern, wenn sie wirklich nötig sind.

## Aktueller technischer Kontext

- `stream_status`: Runtime-Version `0.1.2`, API-First, Auto-Refresh aktiv.
- `clip_shoutout`: Runtime-Version `0.2.10`, Statistik-Routen vorhanden.
- Shoutout-Dashboard vorhanden, aber nächster UX-Schritt ist Tab-Struktur.
- Gewünschter späterer Ausbau: eingehende Twitch-Shoutouts per EventSub loggen und im Dashboard statistisch anzeigen.
