# CHANGELOG

## CAN-40.2

- Bus-Diagnose-Unterseiten Sicherheits-/Read-only-Hinweise vorbereitet.
- Neue Dateien:
  - `htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.js`
  - `htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.css`
- `htdocs/dashboard/index.html` lädt CSS/JS.
- Keine Änderung an `backend/modules/bus_diagnostics.js`.
- Keine Änderung an `htdocs/dashboard/modules/bus_diagnostics.js`.
- Keine Änderung an bestehender Read-only-Summary.
- Kein Extra-Tab.
- Keine API-Calls.
- Keine API-POSTs.
- Keine produktive Aktion.
- Kein MutationObserver.

## CAN-40.1

- Bus-Diagnose-Unterseiten read-only analysiert.
- Ergebnis:
  - Tabs und Recovery-Subtabs sind vorhanden.
  - Recovery/Safety sind bereits umfangreich.
  - Sound-Bus Dry-Run ist ein manueller POST-Button und darf nicht automatisch getestet werden.
  - Zusätzliche optische Read-only-/Safety-Hinweise sind sinnvoll.
