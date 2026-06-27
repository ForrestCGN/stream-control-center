# CAN-42.12d - Dashboard Diagnostics Text Cleanup

## Ziel

Die zentralen Diagnose-Detailseiten sollen die vorhandenen Werte anzeigen, aber keine erklärenden Fußnoten unter den Diagnoseblöcken ausgeben.

## Änderung

Geändert wurde nur das Dashboard-Frontend:

```text
htdocs/dashboard/modules/diagnostics_generic_details.js
```

Anpassungen:

```text
- Modulversion der Erweiterung auf 0.1.0-can42-12d gesetzt
- generische Fußnote im Standard-Diagnostics-Block entfernt
- vorhandene alte erklärende Diagnose-Fußnoten nach dem Rendern entfernt
```

Entfernte Texte:

```text
Tagebuch-Diagnose liest den standardisierten diagnostics-Block aus /api/tagebuch/status.
Dieser Block wird generisch aus diagnostics der jeweiligen Statusroute erzeugt.
```

## Nicht geändert

```text
Kein Backend
Keine Statusroute
Keine Datenfelder
Keine Diagnose-Logik
Keine produktiven POST-Routen
Keine DB-Migration
Keine Funktionalität entfernt
```

## Test

```powershell
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
```

Danach Dashboard hart neu laden und prüfen, dass die Diagnoseblöcke weiterhin Werte anzeigen, aber die erklärenden Fußnoten verschwunden sind.
