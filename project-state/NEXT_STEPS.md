# Next Steps

## Direkt nach CAN-43.12

1. CAN-43.12 ZIP nach `D:\Git\stream-control-center` entpacken.
2. Optional prüfen:

```powershell
node -c backend\modules\obs.js
```

3. Step abschließen:

```powershell
.\stepdone.cmd "CAN-43.12 OBS diagnostics review"
```

4. Doku committen/pushen.

## Nächster fachlicher Schritt

CAN-43.13: Weiteres Registry-Modul nach neuem Diagnose-/Registry-Standard prüfen.

Empfohlener Kandidat:

1. `overlay_monitor`

Grund:

- Nach OBS schließt die Overlay-/Browserquellen-Überwachung fachlich direkt an.
- Das Modul ist wichtig für Stabilität und Sichtbarkeit von Overlay-Problemen.

Alternative Kandidaten:

- `communication_bus`
- `bus_diagnostics`

## Pflicht bei jedem Modul

- echten Dateistand prüfen
- Statusroute prüfen
- `diagnostics`-Block prüfen
- Registry-Eintrag prüfen
- Coverage-Test prüfen
- keine neue Dashboard-Diagnose-Extra-Datei ohne explizite Begründung
- Modul-Doku aktualisieren
- project-state aktualisieren
- vor Umsetzung auf `go` warten
