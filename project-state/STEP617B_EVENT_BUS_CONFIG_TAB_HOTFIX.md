# STEP617B – Event-Bus Config-Tab Hotfix

Stand: 2026-05-30

## Ziel

Der Event-Bus Config-Tab lädt die DB-basierte Bus-Config zuverlässig direkt beim Öffnen des Tabs und über den Reload-Button.

## Geändert

- `htdocs/dashboard/modules/bus_diagnostics.js`
  - Settings-Ladevorgang in eigene `loadSettings()`-Funktion ausgelagert.
  - Config-Tab triggert den Settings-Load selbst, wenn noch keine Daten vorhanden sind.
  - Reload-Button nutzt dieselbe Ladefunktion.
  - Falscher Platzhalter „API nicht erreichbar“ wird nicht mehr angezeigt, solange nur noch kein Settings-Load gelaufen ist.

- `backend/modules/communication_bus_settings.js`
  - Version auf `0.1.1` erhöht.
  - Schema-Erzeugung nutzt die zentrale `backend/core/database.js` SQL-Helfer für Identifier, Text-, Bool- und DateTime-Typen.
  - Ziel bleibt SQLite aktiv, MySQL/MariaDB-konforme Vorbereitung über DB-Helper.

## Nicht geändert

- Keine produktive Runtime-Umschaltung des Communication Bus.
- Keine Sound-/Alert-/VIP-/Overlay-Flows geändert.
- Keine direkte DB-Nutzung aus dem Dashboard.
- Keine neuen OBS-Funktionen.

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\communication_bus_settings.js
node --check htdocs\dashboard\modules\bus_diagnostics.js
.\stepdone.cmd "Event-Bus Config-Tab Settings-Load Hotfix"
```

Danach Backend neu starten und im Dashboard: Admin → Bus-Diagnose → Config.
