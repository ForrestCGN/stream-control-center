# CAN-42.23 Diagnostics Cleanup 1

## Ziel
Alten Hug-Spezialfix aus der zentralen Dashboard-Diagnose entfernen und die Diagnose-Struktur wieder klar trennen.

## Geändert
- `htdocs/dashboard/index.html`
  - Entfernt den Script-Load von `/dashboard/modules/diagnostics_hug_display_fix.js`.
- `htdocs/dashboard/modules/diagnostics.js`
  - Version auf `0.1.2-can42-23` angehoben.
  - Bleibt die zentrale Quelle für Dropdown, Statusrouten und Detailauswahl.
- `htdocs/dashboard/modules/diagnostics_generic_details.js`
  - Version auf `0.1.7-can42-23` angehoben.
  - Entfernt leere/alte Registry-Nachpatch-Stubs.
  - Bleibt nur für die generische `diagnostics`-Block-Anzeige zuständig.

## Nicht geändert
- Keine Backend-Logik.
- Keine Statusrouten.
- Keine Modul-/Overlay-/OBS-/Sound-/Chat-Aktionen.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## Manuelle Altdatei
Die Datei `htdocs/dashboard/modules/diagnostics_hug_display_fix.js` wird nach diesem Step nicht mehr geladen.
Sie kann nach erfolgreichem Test gelöscht werden:

```powershell
Remove-Item htdocs\dashboard\modules\diagnostics_hug_display_fix.js
```

## Test
```powershell
.\stepdone.cmd "CAN-42.23 Dashboard diagnostics cleanup 1"

node -c htdocs\dashboard\modules\diagnostics.js
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
```

Dashboard danach hart neu laden (`STRG+F5`) und prüfen:
- Hug-System öffnet korrekt.
- Communication-Bus öffnet korrekt.
- OBS öffnet korrekt.
- VIP-System nutzt `/api/vip-sound/status`.
