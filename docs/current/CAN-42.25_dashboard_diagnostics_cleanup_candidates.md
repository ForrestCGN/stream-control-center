# CAN-42.25 Dashboard-Diagnose Altdateien-Cleanup-Kandidaten

Stand: 2026-06-03
Basis: aktueller Dashboard-Stand nach CAN-42.24.

## Ziel

Die zentrale Diagnose soll nicht pro Modul durch immer neue Zusatzdateien erweitert werden.
Ab jetzt gilt:

- `htdocs/dashboard/modules/diagnostics.js` ist die zentrale Datei fuer Liste, Auswahl, Statusladen und Standard-Diagnoseanzeige.
- `htdocs/dashboard/modules/diagnostics.css` ist das zentrale Styling.
- Neue Diagnosemodule sollen nicht mehr ueber eigene `*_diagnostics_ext.js` oder `*_readonly_diagnostics.js` Dateien nachgeruestet werden.
- Spaeter soll ein Backend-Endpunkt `/api/diagnostics/registry` die Liste automatisch liefern.

## Sicher NICHT mehr in `index.html` geladen nach CAN-42.24

Diese Dateien sind nach aktuellem Stand nicht mehr eingebunden oder wurden durch `diagnostics.js` ersetzt.
Sie sind Loeschkandidaten, sofern sie nicht bewusst als Archiv behalten werden sollen.

```text
diagnostics_generic_details.js
diagnostics_hug_display_fix.js
birthday_readonly_diagnostics.css
birthday_readonly_diagnostics.js
birthday_readonly_safety_ext.css
birthday_readonly_safety_ext.js
message_rotator_readonly_diagnostics.css
message_rotator_readonly_diagnostics.js
tagebuch_readonly_diagnostics.css
tagebuch_readonly_diagnostics.js
todo_readonly_diagnostics.css
todo_readonly_diagnostics.js
```

## Noch geladen / nicht blind entfernen

Diese Dateien sind im aktuellen `index.html` noch eingebunden und koennen noch Modul-Unterseiten, Safety-Anzeigen oder bestehende Bedienseiten erweitern. Nicht ohne Einzelpruefung loeschen.

```text
bus_diagnostics_readonly_summary.css
bus_diagnostics_readonly_summary.js
bus_diagnostics_subpage_safety_ext.css
bus_diagnostics_subpage_safety_ext.js
commands_readonly_diagnostics.css
commands_readonly_diagnostics.js
hug_diagnostics_ext.css
hug_diagnostics_ext.js
message_rotator_diagnostics_ext.css
message_rotator_diagnostics_ext.js
overlay_monitor_safety_ext.css
overlay_monitor_safety_ext.js
```

## Kern-Dateien behalten

```text
diagnostics.css
diagnostics.js
```

## Empfohlener manueller Cleanup nach Dashboard-Test

Nur ausfuehren, wenn CAN-42.24 im Dashboard sauber getestet ist:

```powershell
Remove-Item htdocs\dashboard\modules\diagnostics_generic_details.js -ErrorAction SilentlyContinue
Remove-Item htdocs\dashboard\modules\diagnostics_hug_display_fix.js -ErrorAction SilentlyContinue
Remove-Item htdocs\dashboard\modules\birthday_readonly_diagnostics.css -ErrorAction SilentlyContinue
Remove-Item htdocs\dashboard\modules\birthday_readonly_diagnostics.js -ErrorAction SilentlyContinue
Remove-Item htdocs\dashboard\modules\birthday_readonly_safety_ext.css -ErrorAction SilentlyContinue
Remove-Item htdocs\dashboard\modules\birthday_readonly_safety_ext.js -ErrorAction SilentlyContinue
Remove-Item htdocs\dashboard\modules\message_rotator_readonly_diagnostics.css -ErrorAction SilentlyContinue
Remove-Item htdocs\dashboard\modules\message_rotator_readonly_diagnostics.js -ErrorAction SilentlyContinue
Remove-Item htdocs\dashboard\modules\tagebuch_readonly_diagnostics.css -ErrorAction SilentlyContinue
Remove-Item htdocs\dashboard\modules\tagebuch_readonly_diagnostics.js -ErrorAction SilentlyContinue
Remove-Item htdocs\dashboard\modules\todo_readonly_diagnostics.css -ErrorAction SilentlyContinue
Remove-Item htdocs\dashboard\modules\todo_readonly_diagnostics.js -ErrorAction SilentlyContinue
```

Danach pruefen:

```powershell
node -c htdocs\dashboard\modules\diagnostics.js
```

Und im Dashboard testen:

```text
Admin > Diagnose > Gesamtuebersicht
Admin > Diagnose > Hug-System
Admin > Diagnose > Communication-Bus
Admin > Diagnose > OBS
Admin > Diagnose > VIP-System
```

## Naechster sinnvoller Schritt

CAN-42.26 sollte eine echte automatische Diagnose-Registry planen oder bauen:

- Backend: `/api/diagnostics/registry`
- Quelle: zentrale statische Registry oder Module-Meta-Registry
- Dashboard: liest Registry statt harter Frontend-Liste
- Keine pro-Modul-Diagnose-Zusatzdateien mehr
