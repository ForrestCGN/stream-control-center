# CHANGELOG

## CAN-42.11

- `backend/modules/commands.js` von `0.1.6` auf `0.1.7` erhöht.
- `MODULE_BUILD` von `channel-guard` auf `channel-guard-diagnostics` geändert.
- `GET /api/commands/status` um standardisierten read-only `diagnostics`-Block ergänzt.
- Neue interne read-only Helper:
  - `countTableRows()`
  - `safeDatabaseInfo()`
  - `buildStandardDiagnostics()`
- Keine Command-Ausführung geändert.
- Keine Trigger/Aliase/Permissions/Cooldowns geändert.
- Keine DB-Migration.
- Keine produktive Aktion.
- Keine Funktionalität entfernt.

## CAN-42.10

- Direkte Tagebuch-Diagnose-Extension aus `htdocs/dashboard/index.html` entfernt:
  - `tagebuch_readonly_diagnostics.css`
  - `tagebuch_readonly_diagnostics.js`
- Dateien selbst bleiben erhalten.
- Tagebuch-Diagnose läuft zentral über `Admin > Diagnose > Tagebuch`.
- Keine Backend-Änderung.
- Keine API-POSTs.
- Keine produktive Aktion.
- Keine Funktionalität entfernt.

## CAN-42.9

- Admin-Diagnose liest Tagebuch diagnostics-Block bevorzugt.
