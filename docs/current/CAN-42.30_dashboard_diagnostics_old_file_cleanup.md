# CAN-42.30 - Dashboard-Diagnose: Altdateien gezielt entfernen

## Ziel

Nach CAN-42.24 bis CAN-42.29 ist die zentrale Diagnose wieder in `htdocs/dashboard/modules/diagnostics.js` gebündelt.
Die Registry kommt über `GET /api/diagnostics/registry`; die Coverage-Anzeige läuft über dieselbe Hauptdatei.

Dieser Schritt entfernt keine Funktionalität aus produktiven Modulen. Er bereitet nur das sichere Entfernen nicht mehr geladener alter Diagnose-Zusatzdateien vor.

## Nicht mehr geladene Altdateien

Diese Dateien waren Zwischenstände/Spezial-Fixes und werden nach aktuellem Stand nicht mehr von `htdocs/dashboard/index.html` geladen:

```text
htdocs/dashboard/modules/diagnostics_generic_details.js
htdocs/dashboard/modules/diagnostics_hug_display_fix.js
htdocs/dashboard/modules/birthday_readonly_diagnostics.css
htdocs/dashboard/modules/birthday_readonly_diagnostics.js
htdocs/dashboard/modules/birthday_readonly_safety_ext.css
htdocs/dashboard/modules/birthday_readonly_safety_ext.js
htdocs/dashboard/modules/message_rotator_readonly_diagnostics.css
htdocs/dashboard/modules/message_rotator_readonly_diagnostics.js
htdocs/dashboard/modules/tagebuch_readonly_diagnostics.css
htdocs/dashboard/modules/tagebuch_readonly_diagnostics.js
htdocs/dashboard/modules/todo_readonly_diagnostics.css
htdocs/dashboard/modules/todo_readonly_diagnostics.js
```

## Weiterhin behalten

Diese Dateien sind weiterhin in `index.html` eingebunden oder gehören zu eigenständigen Modul-/Unterseiten und werden in diesem Schritt nicht angerührt:

```text
htdocs/dashboard/modules/diagnostics.js
htdocs/dashboard/modules/diagnostics.css
htdocs/dashboard/modules/bus_diagnostics.css
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.css
htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.js
htdocs/dashboard/modules/commands_readonly_diagnostics.css
htdocs/dashboard/modules/commands_readonly_diagnostics.js
htdocs/dashboard/modules/hug_diagnostics_ext.css
htdocs/dashboard/modules/hug_diagnostics_ext.js
htdocs/dashboard/modules/message_rotator_diagnostics_ext.css
htdocs/dashboard/modules/message_rotator_diagnostics_ext.js
htdocs/dashboard/modules/overlay_monitor_safety_ext.css
htdocs/dashboard/modules/overlay_monitor_safety_ext.js
```

## Sicheres Entfernen

Die Datei `tools/cleanup/CAN-42.30_remove_old_diagnostics_files.cmd` löscht die Altdateien nicht blind. Sie legt vorher eine lokale Sicherung unter `project-state\cleanup-backups\CAN-42.30_diagnostics_old_files_<timestamp>` an und entfernt nur Dateien aus der festen Kandidatenliste.

## Tests nach dem Cleanup

```powershell
.\stepdone.cmd "CAN-42.30 Dashboard diagnostics old file cleanup"

node -c htdocs\dashboard\modules\diagnostics.js

Select-String -Path htdocs\dashboard\index.html -Pattern "diagnostics_generic_details|diagnostics_hug_display_fix|birthday_readonly_diagnostics|birthday_readonly_safety_ext|message_rotator_readonly_diagnostics|tagebuch_readonly_diagnostics|todo_readonly_diagnostics"
```

Der letzte Befehl sollte keine Treffer liefern.

Danach Dashboard hart neu laden und prüfen:

```text
Admin > Diagnose > Gesamtübersicht
Admin > Diagnose > Hug-System
Admin > Diagnose > Communication-Bus
Admin > Diagnose > OBS
Admin > Diagnose > VIP-System
```

## Ergebnis-Erwartung

- Registry bleibt OK.
- Coverage bleibt OK.
- 14 Diagnose-Einträge bleiben sichtbar.
- Standard-Diagnose-Blöcke werden weiterhin angezeigt.
- Keine Modul-Unterseite verliert Funktionen.
