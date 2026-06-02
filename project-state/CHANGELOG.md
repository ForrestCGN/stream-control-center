# CHANGELOG

## CAN-34.3c

- Stabilitäts-Hotfix für Todo Read-only Diagnose-Tab vorbereitet.
- Problem in CAN-34.3b:
  - MutationObserver konnte Render-Schleife auslösen.
  - Firefox meldete Seitenverlangsamung.
  - Todo-Tabs konnten hängen.
- Fix:
  - MutationObserver entfernt.
  - Tab-Handling auf kontrollierte Click-/Show-Events reduziert.
  - Kein Dauer-Rendering mehr.
- Geändert:
  - `htdocs/dashboard/modules/todo_readonly_diagnostics.js`
- Nicht geändert:
  - `htdocs/dashboard/modules/todo.js`
  - `backend/modules/todo.js`
  - `htdocs/dashboard/index.html`
- Keine produktiven Aktionen.

## CAN-34.3b

- UX-Fix: Diagnose in eigenen Tab verschoben.

## CAN-34.3

- Todo-Dashboard Read-only-Diagnosekarte umgesetzt.
