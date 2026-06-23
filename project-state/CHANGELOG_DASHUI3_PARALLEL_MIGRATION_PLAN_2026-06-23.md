# CHANGELOG DASHUI3 Parallelbetrieb und Modul-Migrationsplan

Datum: 2026-06-23  
Status: DASHUI3.DOC1 / Parallelbetrieb und Modul-Migrationsplan dokumentiert

## Zweck

Der Step dokumentiert, wie Dashboard-v2 parallel zum bestehenden Dashboard aufgebaut wird und wie bestehende Module schrittweise migriert werden.

## Geändert

- `docs/current/DASHBOARD_V2_PARALLEL_MIGRATION_PLAN.md` neu erstellt
- `project-state/CURRENT_STATUS.md` aktualisiert
- `project-state/NEXT_STEPS.md` aktualisiert
- `project-state/TODO.md` aktualisiert
- `project-state/FILES.md` aktualisiert
- `project-state/CHANGELOG.md` aktualisiert
- `project-state/CHANGELOG_DASHUI3_PARALLEL_MIGRATION_PLAN_2026-06-23.md` neu erstellt

## Dokumentierte Entscheidungen

- Altes Dashboard bleibt produktiv unter `http://127.0.0.1:8080/dashboard`.
- Dashboard-v2 entsteht parallel unter `http://127.0.0.1:8080/dashboard-v2`.
- Keine Big-Bang-Migration.
- Keine blinde Ersetzung von `htdocs/dashboard/`.
- Module werden einzeln migriert.
- Jedes Modul startet in v2 zuerst read-only.
- Schreibfunktionen erst mit Permission, Lock, resourceVersion, Confirm und Audit.
- Login wird gestuft eingeführt.
- Altes Dashboard bleibt Fallback, bis v2 pro Modul freigegeben ist.

## Nicht geändert

- kein Backend-Code
- kein bestehendes lokales Dashboard
- kein Frontend-Code
- kein React-/Vite-Projekt
- kein Agent-Code
- keine produktive SQLite
- keine Projekt-Config
- keine OBS-Quelle
- kein Webserver-Deploy
- kein Reverse Proxy
- kein systemd-Service
- kein lokaler Node-Neustart

## Nächster sinnvoller Schritt

```text
DASHUI4 / Minimaler React-Vite-Prototyp
```

## Node-Neustart

Nicht nötig.

Grund: nur Markdown-Doku.
