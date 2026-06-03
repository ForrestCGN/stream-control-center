# NEXT STEPS nach CAN-42.23

1. Dashboard hart neu laden und Diagnose-Einträge testen.
2. Wenn alles funktioniert, alte Datei löschen:
   `htdocs/dashboard/modules/diagnostics_hug_display_fix.js`
3. Danach CAN-42.24 planen: automatische Diagnose-Registry über Backend-Endpunkt `/api/diagnostics/registry`, damit die Liste nicht dauerhaft manuell in `diagnostics.js` gepflegt werden muss.
