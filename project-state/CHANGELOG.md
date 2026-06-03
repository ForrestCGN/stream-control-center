# CHANGELOG

## CAN-42.16 - Media Status-Diagnostics

Geändert:

- `backend/modules/media.js`
  - `MODULE_VERSION` auf `0.1.1` erhöht.
  - `MODULE_BUILD = "diagnostics-standard"` ergänzt.
  - `MODULE_META.build` angepasst.
  - `MODULE_META.step` ergänzt, damit der bestehende STEP524-Hinweis erhalten bleibt.
  - Read-only Helper `buildRoutes()`, `buildDataEndpoints()`, `safeCountTableRows()`, `safeDatabaseInfo()` und `buildStandardDiagnostics()` ergänzt.
  - `/api/media/status` liefert zusätzlich `moduleVersion`, `moduleBuild`, `diagnosticVersion`, `routeCount`, `dataEndpoints` und `diagnostics`.
  - `module.exports.getStatus` ergänzt.

Der neue `diagnostics`-Block enthält:

- `counts` für aktive Medien, letzte Medien, Kategorien, Media-Typen, Tabellenzeilen und Routen.
- `database` mit Adapter, Pfad, Schema-Version und erwarteter Schema-Version.
- `state` mit Initialisierung, Ladezeit, letztem Scan, letztem Upload, letzter Änderung und Pfaden.
- `warnings`, `errors`, `lastError`.

Nicht geändert:

- keine Upload-Logik
- keine Scan-Logik
- keine Delete-/Update-/Resolve-Logik
- keine Picker-/Kategorie-Logik
- keine Asset-Pfade
- keine DB-Migration
- keine Dashboard-Dateien
- keine Funktionalität entfernt
