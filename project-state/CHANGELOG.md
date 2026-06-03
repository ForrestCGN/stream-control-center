# CHANGELOG

## CAN-37.4

- Erfolgreiche Sichtprüfung der Hug-Diagnose-Erweiterung dokumentiert.
- Bestätigt:
  - Kein zusätzlicher Tab.
  - Tabs bleiben: Übersicht | Texte | Config | Statistiken | Diagnose.
  - Im vorhandenen Tab Diagnose erscheint zusätzlich die erweiterte Read-only-Diagnose.
  - Die bestehenden Buttons "Neu laden" / "Hug-Reload testen" wurden nicht automatisch ausgelöst.
  - Keine Hug-/Rehug-/Reload-/Admin-POST-Aktion.
- Keine Codeänderung in CAN-37.4.

## CAN-37.3

- Hug-Dashboard Diagnose-Tab um erweiterte Read-only-Diagnose ergänzt.
- Neue Dateien:
  - `htdocs/dashboard/modules/hug_diagnostics_ext.js`
  - `htdocs/dashboard/modules/hug_diagnostics_ext.css`
- `htdocs/dashboard/index.html` lädt CSS/JS.
- Keine Änderung an `backend/modules/hug.js`.
- Keine Änderung an `htdocs/dashboard/modules/hug.js`.
- Keine produktive Aktion.

## CAN-37.2

- Hug-System-Doku ergänzt:
  - `docs/modules/hug.md`

## CAN-37.1

- Hug-System analysiert.
- Ergebnis:
  - Aktives Backend ist `backend/modules/hug.js`.
  - Dedizierte Doku `docs/modules/hug.md` fehlte.
  - Modul ist produktiv sensibel wegen DB-Stats und Chat-Output.
