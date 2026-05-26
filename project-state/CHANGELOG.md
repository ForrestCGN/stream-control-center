# CHANGELOG

## STEP472_GENERAL_PROJECT_PROMPT_FULL_CONTEXT

- `project-state/GENERAL_PROJECT_PROMPT.md` vollständig erweitert.
- Wichtige Arbeitsregeln, Pfade, Repo-Dateien, Helper, Routen und aktuelle Modulstände ergänzt.
- Dashboard-Regel konkretisiert: große Module in Tabs/Unterbereiche aufteilen, nicht alles auf eine Seite packen.
- Shell-/PowerShell-Regel konkretisiert: nur notwendige, kopierfreundliche Ausgaben; gezielte Feldabfragen bevorzugen.
- Shoutout-/Stream-Status-Kontext aufgenommen:
  - `stream_status` `0.1.2`
  - `clip_shoutout` `0.2.10`
  - Shoutout-Statistik vorhanden
  - Shoutout-Dashboard braucht als nächstes Tabs
  - eingehende Shoutouts sind als späterer Ausbau notiert.
- Keine Backend-, Dashboard-, Overlay- oder Datenbanklogik geändert.

## STEP473_TODO_RULE_IN_GENERAL_PROMPT

- `project-state/GENERAL_PROJECT_PROMPT.md` um eine verbindliche ToDo-/Offene-Punkte-Regel erweitert.
- `project-state/TODO.md` als zentrale Backlog-/Offene-Punkte-Datei ergänzt.
- Zuständigkeit zwischen `TODO.md` und `NEXT_STEPS.md` klargestellt.
- Aktuelle offene Punkte zu Shoutout-Dashboard-Tabs, Inbound-Shoutout-Logging und Stream-Status-Livetest dokumentiert.
- Keine Backend-, Dashboard-, Overlay-, Datenbank- oder JavaScript-Änderungen.


## STEP474_DOCS_TODO_MODULE_CLEANUP

- Reiner Aufraeum-/Doku-STEP, keine Codeaenderungen.
- Aktuellen Backend-Upload ausgewertet:
  - 49 Backend-Module ohne Helper
  - 18 Helper-Dateien
  - 527 erkannte Routen/Route-Hinweise
- Neue Backend-Moduluebersicht erstellt: `docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md`.
- Neue Routen-/Modulkarte erstellt: `docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-26.md`.
- Cleanup-Notizen erstellt: `docs/current/PROJECT_DOCS_CLEANUP_NOTES_2026-05-26.md`.
- `project-state/TODO.md` um Modul-/Doku-/Cleanup-Punkte erweitert.
- `project-state/NEXT_STEPS.md` auf den naechsten Fach-STEP `STEP475_SHOUTOUT_DASHBOARD_TABS` aktualisiert.
- Auffaellige Runtime-/Backup-Dateien im Backend-Upload dokumentiert, aber nicht geaendert oder geloescht.
