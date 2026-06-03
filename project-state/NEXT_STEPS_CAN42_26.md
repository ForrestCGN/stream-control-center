# NEXT STEPS CAN-42.26

## Status

CAN-42.26 ist nur Planung/Vorbereitung für eine automatische Diagnose-Registry.

## Nächster Schritt

CAN-42.27: Backend-Dateistand prüfen und `/api/diagnostics/registry` sauber planen/umsetzen.

## Regeln

- Keine neuen Zusatzdateien pro Diagnose-Modul.
- `diagnostics.js` bleibt Frontend-Zentrale.
- Registry soll zuerst Backend-Liste liefern, später optional durch Module/MODULE_META automatisch ergänzt werden.
- Fallback-Liste im Frontend vorerst behalten.
- Keine produktiven Show-/Sound-/Chat-/Admin-Aktionen aus der Diagnose heraus.
