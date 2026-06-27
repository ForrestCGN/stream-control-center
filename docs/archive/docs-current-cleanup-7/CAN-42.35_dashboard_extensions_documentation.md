# CAN-42.35 Dashboard extensions documentation

## Ziel

Die in CAN-42.34 geprüften und bewusst behaltenen Dashboard-Extensions werden dauerhaft dokumentiert.

## Ergebnis

Neue Doku-Datei:

- `docs/modules/DASHBOARD_EXTENSIONS.md`

Dort dokumentiert:

- Zweck der Extensions
- Sicherheits-/Read-only-Funktion
- Integrationsstatus
- Regel für neue Module
- Standardtest für Registry-Coverage

## Bewusst behaltene Dateien

- `commands_readonly_diagnostics.css/js`
- `hug_diagnostics_ext.css/js`
- `message_rotator_diagnostics_ext.css/js`
- `bus_diagnostics_readonly_summary.css/js`
- `bus_diagnostics_subpage_safety_ext.css/js`
- `overlay_monitor_safety_ext.css/js`

## Keine Codeänderung

Dieser Schritt ändert keine Dashboard-Logik, keine Backend-Route und keine Moduldatei.

## Neue Modul-Regel

Neue Module sollen keine neuen Diagnose-Extra-Dateien bekommen. Diagnose läuft über Statusroute, `diagnostics`-Block, Registry und Coverage.

## Nächster Schritt

Nach CAN-42.35 ist die Diagnose-Aufräumrunde dokumentiert abgeschlossen. Danach kann fachlich mit dem nächsten Modul weitergemacht werden.
