# CAN-42.21c Dashboard Diagnostics Dynamic Selection Fix

## Ziel
Die in CAN-42.21b ergänzten dynamischen Diagnose-Einträge Communication-Bus und OBS sollen nicht nur im Dropdown erscheinen, sondern beim Auswählen auch zuverlässig ihre Detailseite öffnen.

## Änderung
Datei:
- `htdocs/dashboard/modules/diagnostics_generic_details.js`

Änderungen:
- Version auf `0.1.5-can42-21c` erhöht.
- Capture-Handler für Dropdown-Änderungen ergänzt.
- Auswahl von `communication_bus` und `obs` wird vor dem Haupt-Diagnostics-Renderer abgefangen.
- Dynamische Detailansicht wird direkt über die vorhandenen Statusrouten geladen.
- Klicks auf dynamische Health-Overview-Zeilen werden ebenfalls abgefangen.

## Nicht geändert
- Keine Backend-Logik.
- Keine OBS-Aktion.
- Keine Sound-/Show-/Chat-/Admin-Aktion.
- Keine neue Moduldatei.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## Test
```powershell
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
```

Danach Dashboard hart neu laden und prüfen:
- `Communication-Bus` öffnet Detailseite.
- `OBS` öffnet Detailseite.
- `VIP-System` nutzt weiterhin `/api/vip-sound/status`.
