# CURRENT CHAT HANDOFF CAN-43.1

Stand: 2026-06-03 11:28

## Wichtig für den nächsten Chat

Wir arbeiten am Projekt `stream-control-center`.

Repo:

- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Live-Ziel: `D:\Streaming\stramAssets`

Arbeitsregel:

- Erst echten Dateistand prüfen.
- Keine Funktionalität entfernen.
- Keine neuen Parallel-/Extra-Dateien ohne klare Begründung.
- Bei neuen oder geänderten Modulen immer Diagnose-Standard beachten:
  - Statusroute prüfen
  - `diagnostics`-Block prüfen
  - Registry-Eintrag prüfen
  - Coverage-Test prüfen
  - keine neue Dashboard-Diagnose-Extra-Datei ohne explizite Begründung
  - Doku/project-state aktualisieren

## Abgeschlossener Diagnose-Cleanup

Die CAN-42 Diagnose-Aufräumrunde ist abgeschlossen.

Abgeschlossen:

- CAN-42.30/31: alte nicht mehr geladene Diagnose-Dateien aus Repo und Live entfernt.
- CAN-42.32: neue Modul-Regeln dokumentiert.
- CAN-42.33/34: noch geladene Dashboard-Extensions geprüft.
- CAN-42.35: bewusst behaltene Dashboard-Extensions dauerhaft dokumentiert.
- CAN-43.0: Startpunkt für nächste Fachrunde vorbereitet.

## Aktuelle Diagnose-Struktur

Zentrale Dashboard-Diagnose:

- `htdocs/dashboard/modules/diagnostics.js`
- `htdocs/dashboard/modules/diagnostics.css`

Backend-Registry:

- `GET /api/diagnostics/registry`
- Aliase:
  - `GET /diag/registry`
  - `GET /api/diag/registry`

Letzter bestätigter Coverage-Test:

```text
ok                   : True
registryEntries      : 14
loadedModules        : 52
coveredLoadedModules : 14
missingLoadedModules : 0
registryOnlyEntries  : 0
```

## Alte entfernte Dateien

Aus Repo und Live entfernt:

- `htdocs/dashboard/modules/diagnostics_generic_details.js`
- `htdocs/dashboard/modules/diagnostics_hug_display_fix.js`
- `htdocs/dashboard/modules/birthday_readonly_diagnostics.css`
- `htdocs/dashboard/modules/birthday_readonly_diagnostics.js`
- `htdocs/dashboard/modules/birthday_readonly_safety_ext.css`
- `htdocs/dashboard/modules/birthday_readonly_safety_ext.js`
- `htdocs/dashboard/modules/message_rotator_readonly_diagnostics.css`
- `htdocs/dashboard/modules/message_rotator_readonly_diagnostics.js`
- `htdocs/dashboard/modules/tagebuch_readonly_diagnostics.css`
- `htdocs/dashboard/modules/tagebuch_readonly_diagnostics.js`
- `htdocs/dashboard/modules/todo_readonly_diagnostics.css`
- `htdocs/dashboard/modules/todo_readonly_diagnostics.js`

Check war sauber:

```text
Lokale Altdateien:     0
Lokale Alt-Referenzen: 0
Live-Altdateien:       0
Live-Alt-Referenzen:   0
```

## Bewusst behaltene Dashboard-Extensions

Dokumentiert in:

- `docs/modules/DASHBOARD_EXTENSIONS.md`

Bewusst behalten:

- `commands_readonly_diagnostics.css/js`
- `hug_diagnostics_ext.css/js`
- `message_rotator_diagnostics_ext.css/js`
- `bus_diagnostics_readonly_summary.css/js`
- `bus_diagnostics_subpage_safety_ext.css/js`
- `overlay_monitor_safety_ext.css/js`

Grund:

- aktive Read-only-/Safety-/Diagnosekarten
- Safety-Hinweise für manuelle Aktionen
- nicht blind löschen

## CAN-43.0

CAN-43.0 wurde als Startpunkt für die nächste Fachrunde vorbereitet.

Dateien:

- `docs/current/CAN-43.0_next_module_diagnostics_standard_start.md`
- `project-state/NEXT_STEPS_CAN43_0.md`
- `project-state/CURRENT_STATUS_CAN43_0.md`

Zweck:

- nächstes Modul auswählen
- neuen Diagnose-Standard bei jeder Moduländerung anwenden

## Nächster Schritt im neuen Chat

Zuerst Repo/Live-Stand bewusst prüfen.

Dann ein konkretes Modul oder Thema für CAN-43 auswählen.

Mögliche nächste Wege:

1. Bestehendes Modul nach neuem Diagnose-Standard prüfen.
2. Neues Modul planen.
3. Dashboard-/Control-Center-Struktur weiter aufräumen.
4. Ein fachliches Feature weiterbauen.

Empfohlene erste Frage im neuen Chat:

> Welches Modul nehmen wir als nächstes für CAN-43?
