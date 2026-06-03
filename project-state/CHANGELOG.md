# CHANGELOG

## CAN-42.18 - Birthday Status-Diagnostics

Geändert:

- `backend/modules/birthday.js`
  - `MODULE_VERSION` auf `0.6.1` erhöht.
  - `MODULE_BUILD = "diagnostics-standard"` ergänzt.
  - `MODULE_META.build` ergänzt.
  - Read-only Helper `buildRoutes()`, `countTableRows()` und `buildStandardDiagnostics()` ergänzt.
  - `/api/birthday/status` liefert zusätzlich `moduleVersion`, `moduleBuild`, `diagnosticVersion`, `routeCount`, `dataEndpoints` und `diagnostics`.

Der neue `diagnostics`-Block enthält:

- `counts` für User, aktive/inaktive User, heutige Geburtstage, Greeting-Log, Show-Events, Show-Profile, Parties, Show-Queue, Settings, Textvarianten, Routen und Runtime-Zähler.
- `database` mit Adapter, Pfad, Schema-Version und erwarteter Schema-Version.
- `state` mit Enabled-/Registration-/AutoGreeting-/Command-/Show-Status, Chat-Hook, Show-State, Queue-Länge und letzten Aktivitätszeiten.
- `warnings`, `errors`, `lastError`.

Nicht geändert:

- keine Birthday-Command-Ausführung
- keine automatischen Geburtstagsgrüße
- keine Tagebuch-/Chat-Ausgabe
- keine Birthday-Show-/Party-/Queue-Logik
- keine Upload-/Import-/Media-Logik
- keine Admin-User-/Settings-/Texteditor-Routen
- keine DB-Migration
- keine Dashboard-Dateien
- keine Funktionalität entfernt
