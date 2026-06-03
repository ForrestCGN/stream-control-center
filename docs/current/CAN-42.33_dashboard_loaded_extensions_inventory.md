# CAN-42.33 Dashboard loaded extensions inventory

## Ziel

Nach dem Cleanup der alten, nicht mehr referenzierten Diagnose-Dateien wird geprüft, welche Dashboard-Erweiterungsdateien aktuell weiterhin in `htdocs/dashboard/index.html` geladen werden.

Dieser Schritt ist absichtlich nur ein Inventar-/Planungsschritt.

## Ergebnis aus `htdocs/dashboard/index.html`

Aktuell weiterhin geladene Erweiterungen:

### Overlay / Control

- `htdocs/dashboard/modules/overlay_monitor_safety_ext.css`
- `htdocs/dashboard/modules/overlay_monitor_safety_ext.js`

### Bus-Diagnose

- `htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css`
- `htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js`
- `htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.css`
- `htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.js`

### Message-Rotator

- `htdocs/dashboard/modules/message_rotator_diagnostics_ext.css`
- `htdocs/dashboard/modules/message_rotator_diagnostics_ext.js`

### Hug-System

- `htdocs/dashboard/modules/hug_diagnostics_ext.css`
- `htdocs/dashboard/modules/hug_diagnostics_ext.js`

### Commands

- `htdocs/dashboard/modules/commands_readonly_diagnostics.css`
- `htdocs/dashboard/modules/commands_readonly_diagnostics.js`

## Bewertung

Diese Dateien sind nicht automatisch Altlasten, weil sie in `index.html` noch aktiv geladen werden.

Sie dürfen nicht blind gelöscht werden.

## Neue Regel

Für neue Module gilt weiterhin:

- Keine neuen Dashboard-Diagnose-Extra-Dateien pro Modul.
- Diagnose-Status gehört über die zentrale Diagnose (`diagnostics.js`) und Registry (`/api/diagnostics/registry`).
- Modul-Unterseiten dürfen eigene UI-Dateien haben, aber Diagnose-/Readonly-Erweiterungen müssen vorher begründet werden.
- Bei neuen Modulen muss Registry-Coverage geprüft werden.

## Nächster Schritt

CAN-42.34 sollte jede geladene Erweiterungsdatei einzeln prüfen:

1. Wird sie tatsächlich durch das zugehörige Hauptmodul genutzt?
2. Enthält sie noch aktive Logik oder nur Alt-Kompatibilität?
3. Ist sie sicherheits-/readonly-relevant?
4. Kann sie später in die Hauptmodul-Datei integriert werden?
5. Muss sie dokumentiert bleiben?

## Keine Änderungen in diesem Schritt

- Keine Datei gelöscht.
- Keine Datei zusammengeführt.
- Keine Backend-Route geändert.
- Keine Dashboard-Logik geändert.
