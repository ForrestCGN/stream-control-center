# CHANGELOG Ergänzung – STEP198

Stand: 2026-05-08

## Added

- Globaler Modul-/DB-/Dashboard-Standard dokumentiert.
- Verbindliche Quellen-Priorität festgelegt:
  - ENV / Secrets > DB > JSON > Code-Default
- JSON-Rolle auf Seed/Fallback/technische Boot-Konfiguration eingegrenzt.
- DB als Zielquelle für dashboardfähige Einstellungen festgelegt.
- Dashboard-Regeln ergänzt:
  - keine direkten Datei-/SQLite-Zugriffe
  - Einstellungen über Backend-APIs
  - konsistente Modul-Seitenstruktur
- Installer-/Setup-Regel für DB-Seeding aus JSON-Defaults dokumentiert.
- TTS als nächster Standardisierungs-Kandidat festgehalten.

## Notes

Dieser STEP enthält keine Codeänderungen und verändert keine bestehenden Moduldateien.
