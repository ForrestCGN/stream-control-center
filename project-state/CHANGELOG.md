# CHANGELOG – STEP421

## Added
- Neues Dashboard-Modul `bus_diagnostics`.
- Neues Dashboard-CSS `bus_diagnostics.css`.
- Menüeintrag Admin / Bus-Diagnose.
- Reload-Hook für Dashboard-Reload-Button.
- Button für read-only Check.
- Optionaler Auto-Refresh im Dashboard-Modul.

## Changed
- `htdocs/dashboard/index.html` lädt das neue Modul und Stylesheet.
- `htdocs/dashboard/app.js` registriert Modul, Katalogeintrag, Favorit und Admin-Menüeintrag.

## Not changed
- Keine Backend-Flow-Logik.
- Keine Sound-/Alert-/Overlay-Steuerung.
- Keine DB-Migration.
