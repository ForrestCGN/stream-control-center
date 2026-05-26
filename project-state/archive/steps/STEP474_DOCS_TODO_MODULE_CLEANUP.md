# STEP474_DOCS_TODO_MODULE_CLEANUP

## Ziel des STEPs

Reine Aufräum- und Doku-Arbeit auf Basis der hochgeladenen Dateien.

Ziel war:

1. aktuellen Backend-Upload grob erfassen
2. offene ToDos realistischer dokumentieren
3. Modul-/Routenübersicht für weitere Arbeit bereitstellen
4. zentrale Projektstatus-Dateien aktualisieren
5. danach Shoutout-System als nächsten Fach-STEP stehen lassen

## Betroffene Dateien

```text
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-26.md
docs/current/PROJECT_DOCS_CLEANUP_NOTES_2026-05-26.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/STEP474_DOCS_TODO_MODULE_CLEANUP.md
```

## Was geändert wurde

- Neuer zentraler Backend-Modulstatus aus `backend.zip` erstellt.
- Neue automatisch erkannte Routen-/Modulkarte erstellt.
- Cleanup-Notizen zum aktuellen Doku-/Backend-Upload ergänzt.
- `TODO.md` um Doku-/Cleanup- und Modul-Doku-Prioritäten erweitert.
- `NEXT_STEPS.md` auf den nächsten Fach-STEP `STEP475_SHOUTOUT_DASHBOARD_TABS` gesetzt.
- `CURRENT_SYSTEM_STATUS.md`, `CURRENT_STATUS.md`, `CHANGELOG.md` und `FILES.md` aktualisiert.

## Was bewusst nicht geändert wurde

- Keine Backend-Logik geändert.
- Keine Dashboard-Logik geändert.
- Keine Overlay-Dateien geändert.
- Keine Config-Dateien geändert.
- Keine Datenbankdateien geändert.
- Keine Runtime-Dateien geändert.
- Keine alten STEP-/APPEND-Dateien gelöscht oder verschoben.
- Kein Shoutout-System umgesetzt.

## Ergebnis der Backend-Sichtung

- Backend-Module ohne Helper: 49
- Helper-Dateien: 18
- erkannte Routen/Route-Hinweise: 527
- Module mit erkannter Versionskennung: 12
- Module ohne erkannte Versionskennung: 37

Auffälligkeiten:

```text
backend/data/app.sqlite
backend/data/deathcounter.v2.json
backend/modules/twitch.js.bak_original_uploaded
```

Diese Dateien wurden nicht verändert. Sie sind nur als prüfpflichtig dokumentiert, weil Runtime-/DB-/Backup-Dateien nicht ins Repo gehören.

## Tests / Prüfung

Da nur Markdown-Doku geändert wurde:

```text
Keine JS-Dateien geändert, daher kein node --check nötig.
```

Empfohlene Prüfung nach Entpacken:

```bat
dir docs\current\PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md

dir docs\current\PROJECT_MODULE_AND_ROUTE_MAP_2026-05-26.md

dir project-state\STEP474_DOCS_TODO_MODULE_CLEANUP.md
```

## Nächster sinnvoller Schritt

```text
STEP475_SHOUTOUT_DASHBOARD_TABS
```

Ziel danach:

- Shoutout-Dashboard in Tabs/Unterbereiche aufteilen.
- Übersicht, Queues, Statistik, Timeline und Settings/Test sauber trennen.
- Vor Umsetzung echte Dashboard-Dateien und relevante Shoutout-Dateien erneut prüfen.
