# CAN-42.29 Dashboard Diagnostics Registry Coverage Display

## Ziel

Die zentrale Dashboard-Diagnose zeigt die Backend-Registry- und Coverage-Informationen verständlicher an.

## Geänderte Dateien

- `htdocs/dashboard/modules/diagnostics.js`

## Änderungen

- `MODULE_VERSION` auf `0.2.2-can42-29` gesetzt.
- Registry-Quelle wird verständlich angezeigt (`Backend-Registry` statt technischem Source-String).
- Neue Karte `Diagnose-Registry` in der Gesamtübersicht:
  - Registry-Einträge
  - geladene Module
  - diagnosefähig abgedeckte Module
  - fehlende Diagnosemodule
  - Registry-only Einträge
  - Quelle
- Coverage-OK wird grün angezeigt.
- Bei Fehlern/Fallback werden Warnungen sowie Details zu fehlenden/Registry-only Einträgen ausklappbar angezeigt.
- Keine neue Dashboard-Zusatzdatei.

## Nicht geändert

- Keine Backend-Logik.
- Keine Statusrouten.
- Keine OBS-/Sound-/Show-/Chat-/Admin-Aktionen.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## Test

Nach Entpacken:

```powershell
.\stepdone.cmd "CAN-42.29 Dashboard diagnostics registry coverage display"
node -c htdocs\dashboard\modules\diagnostics.js
```

Backend muss nicht wegen dieses Frontend-only-Steps neu gestartet werden. Danach Dashboard hart neu laden (`STRG + F5`) und `Admin > Diagnose > Gesamtübersicht` prüfen.

Erwartung:

- Karte `Diagnose-Registry` sichtbar.
- Quelle: `Backend-Registry`.
- Registry-Einträge: `14`.
- Fehlende Diagnosemodule: `0`.
- Registry-only: `0`.
- Status grün/OK.
