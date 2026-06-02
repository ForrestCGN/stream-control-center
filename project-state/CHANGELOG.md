# CHANGELOG

## CAN-34.3b

- UX-Fix für Todo Read-only Diagnosekarte vorbereitet.
- Die Karte wird aus dem Bereich oberhalb der Todo-Tabs in einen eigenen Tab verschoben.
- Neuer Tab:
  - `Diagnose`
- Ziel:
  - `Übersicht | Settings | Texte | Statistik | Diagnose`
  - Karte nur bei aktivem Diagnose-Tab sichtbar.
- Geändert:
  - `htdocs/dashboard/modules/todo_readonly_diagnostics.js`
  - `htdocs/dashboard/modules/todo_readonly_diagnostics.css`
- Nicht geändert:
  - `htdocs/dashboard/modules/todo.js`
  - `backend/modules/todo.js`
  - `htdocs/dashboard/index.html`
- Keine produktiven Aktionen.

## CAN-34.3

- Todo-Dashboard Read-only-Diagnosekarte umgesetzt.
- Sichtprüfung zeigte: Karte war sichtbar und sicher, aber UX-seitig oberhalb der bestehenden Tabs platziert.

## CAN-34.2

- Todo-Modul-Doku ergänzt:
  - `docs/modules/todo.md`
- Read-only-/Write-Regeln dokumentiert.
