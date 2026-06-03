# NEXT STEPS nach CAN-42.22

1. Dashboard-Diagnose-Hauptdatei als Single Source weiterführen: `htdocs/dashboard/modules/diagnostics.js`.
2. `diagnostics_generic_details.js` nur als generischen Detail-Renderer verwenden.
3. Keine neuen Modul-spezifischen Diagnose-Dateien mehr anlegen, wenn die zentrale Diagnose reicht.
4. Nächster Code-Step: `diagnostics_hug_display_fix.js` als Alt-Fix entfernen oder vollständig in den Kern integrieren.
5. Danach Backend-Registry `/api/diagnostics/registry` planen, damit die Liste automatisch gepflegt wird.
